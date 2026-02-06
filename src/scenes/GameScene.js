import Phaser from 'phaser';
import { GAME, GAMEPLAY, COLORS } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { Basket } from '../entities/Basket.js';
import { FlowerSpawner } from '../entities/Flower.js';
import { OrderSystem } from '../systems/OrderSystem.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    gameState.reset();
    
    // Background gradient
    this.createBackground();
    
    // Mobile detection
    this.isMobile = this.sys.game.device.os.android ||
      this.sys.game.device.os.iOS || this.sys.game.device.os.iPad;

    // Create game entities
    this.basket = new Basket(this);
    this.flowerSpawner = new FlowerSpawner(this);
    this.orderSystem = new OrderSystem(this);
    
    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Touch input
    this.touchMoveX = 0;
    this.setupTouchControls();
    
    // Event listeners
    this.setupEventListeners();
    
    // Start systems
    this.flowerSpawner.start();
    this.orderSystem.start();
    
    gameState.started = true;
    eventBus.emit(Events.GAME_START);
  }

  createBackground() {
    // Gradient background
    const bg = this.add.graphics();
    const gradient = bg.createLinearGradient(0, 0, 0, GAME.HEIGHT);
    gradient.addColorStop(0, '#fff0f5');
    gradient.addColorStop(1, '#ffe4e1');
    bg.fillStyle(0xffffff);
    bg.fillGradientStyle(
      COLORS.BG_GRADIENT_TOP, COLORS.BG_GRADIENT_TOP,
      COLORS.BG_GRADIENT_BOTTOM, COLORS.BG_GRADIENT_BOTTOM
    );
    bg.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    
    // Decorative flowers in corners
    this.addDecorations();
  }

  addDecorations() {
    // Simple decorative elements
    const deco = this.add.graphics();
    deco.fillStyle(0xffb6c1, 0.3);
    
    // Bottom corners
    for (let i = 0; i < 5; i++) {
      deco.fillCircle(20 + i * 15, GAME.HEIGHT - 20 - i * 10, 8);
      deco.fillCircle(GAME.WIDTH - 20 - i * 15, GAME.HEIGHT - 20 - i * 10, 8);
    }
  }

  setupTouchControls() {
    if (!this.isMobile) return;
    
    // Touch zones: left third = left, right third = right, middle = submit
    this.input.on('pointerdown', (pointer) => {
      const third = GAME.WIDTH / 3;
      
      if (pointer.x < third) {
        this.touchMoveX = -1;
      } else if (pointer.x > third * 2) {
        this.touchMoveX = 1;
      } else {
        // Middle tap = submit bouquet
        this.trySubmit();
      }
    });
    
    this.input.on('pointerup', () => {
      this.touchMoveX = 0;
    });
    
    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown) return;
      
      const third = GAME.WIDTH / 3;
      if (pointer.x < third) {
        this.touchMoveX = -1;
      } else if (pointer.x > third * 2) {
        this.touchMoveX = 1;
      } else {
        this.touchMoveX = 0;
      }
    });
  }

  setupEventListeners() {
    // Flower caught - add to bouquet
    this.onFlowerCaught = ({ flowerType }) => {
      const added = gameState.addToBouquet(flowerType);
      if (added) {
        gameState.flowersCaught++;
        eventBus.emit(Events.BOUQUET_UPDATED, { bouquet: gameState.bouquet });
        eventBus.emit(Events.SFX_CATCH);
      }
    };
    eventBus.on(Events.FLOWER_CAUGHT, this.onFlowerCaught);
    
    // Flower missed
    this.onFlowerMissed = () => {
      gameState.flowersMissed++;
      // Could add penalty here if desired
    };
    eventBus.on(Events.FLOWER_MISSED, this.onFlowerMissed);
    
    // Game over
    this.onGameOver = () => {
      gameState.gameOver = true;
      this.flowerSpawner.stop();
      this.orderSystem.stop();
      
      this.time.delayedCall(500, () => {
        this.scene.stop('UIScene');
        this.scene.start('GameOverScene');
      });
    };
    eventBus.on(Events.GAME_OVER, this.onGameOver);
  }

  trySubmit() {
    if (gameState.bouquet.length === 0) return;
    
    const success = this.orderSystem.trySubmitBouquet();
    
    if (success) {
      eventBus.emit(Events.SFX_COMPLETE);
      this.cameras.main.flash(100, 144, 238, 144); // Light green flash
    } else {
      eventBus.emit(Events.SFX_FAIL);
      this.cameras.main.shake(100, 0.01);
    }
  }

  update() {
    if (gameState.gameOver) return;

    // Get input
    let moveX = 0;
    
    // Keyboard
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      moveX = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      moveX = 1;
    }
    
    // Touch overrides keyboard
    if (this.touchMoveX !== 0) {
      moveX = this.touchMoveX;
    }
    
    // Space to submit
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.trySubmit();
    }
    
    // Update basket
    this.basket.update(moveX);
    
    // Update flowers
    this.flowerSpawner.update();
    
    // Check flower-basket collisions
    this.checkCollisions();
  }

  checkCollisions() {
    const flowers = this.flowerSpawner.getActiveFlowers();
    const basketBounds = this.basket.getBounds();
    
    flowers.forEach(flower => {
      if (flower.caught) return;
      
      const flowerBounds = flower.getBounds();
      
      if (Phaser.Geom.Intersects.RectangleToRectangle(flowerBounds, basketBounds)) {
        flower.onCaught();
      }
    });
  }

  shutdown() {
    eventBus.off(Events.FLOWER_CAUGHT, this.onFlowerCaught);
    eventBus.off(Events.FLOWER_MISSED, this.onFlowerMissed);
    eventBus.off(Events.GAME_OVER, this.onGameOver);
    
    this.flowerSpawner.destroy();
    this.orderSystem.destroy();
    this.basket.destroy();
  }
}
