import Phaser from 'phaser';
import { GAMEPLAY, FLOWER_TYPES, GAME } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class Flower extends Phaser.GameObjects.Container {
  constructor(scene, x, flowerType) {
    super(scene, x, -GAMEPLAY.FLOWER_SIZE);
    
    this.flowerType = flowerType;
    this.caught = false;
    this.fallSpeed = gameState.getCurrentFallSpeed();
    
    // Create flower visual
    this.createFlowerGraphic();
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.body.setSize(GAMEPLAY.FLOWER_SIZE * 0.8, GAMEPLAY.FLOWER_SIZE * 0.8);
  }

  createFlowerGraphic() {
    const size = GAMEPLAY.FLOWER_SIZE;
    const color = this.flowerType.color;
    
    // Stem
    const stem = this.scene.add.graphics();
    stem.lineStyle(3, 0x228b22);
    stem.lineBetween(0, 0, 0, size * 0.4);
    this.add(stem);
    
    // Flower head (circle with petals pattern)
    const head = this.scene.add.graphics();
    
    // Petals
    const petalCount = 6;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const px = Math.cos(angle) * size * 0.25;
      const py = Math.sin(angle) * size * 0.25 - size * 0.2;
      head.fillStyle(color, 1);
      head.fillCircle(px, py, size * 0.2);
    }
    
    // Center
    head.fillStyle(0xffd700, 1);
    head.fillCircle(0, -size * 0.2, size * 0.12);
    
    this.add(head);
  }

  update() {
    if (this.caught) return;
    
    this.y += this.fallSpeed * (this.scene.game.loop.delta / 1000);
    
    // Check if missed (fell off screen)
    if (this.y > GAME.HEIGHT + GAMEPLAY.FLOWER_SIZE) {
      this.onMissed();
    }
  }

  onCaught() {
    if (this.caught) return;
    this.caught = true;
    
    eventBus.emit(Events.FLOWER_CAUGHT, { flowerType: this.flowerType });
    
    // Catch animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      y: this.y - 30,
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => this.destroy(),
    });
  }

  onMissed() {
    if (this.caught) return;
    this.caught = true;
    
    eventBus.emit(Events.FLOWER_MISSED, { flowerType: this.flowerType });
    this.destroy();
  }
}

export class FlowerSpawner {
  constructor(scene) {
    this.scene = scene;
    this.flowers = [];
    this.spawnTimer = null;
  }

  start() {
    this.scheduleNextSpawn();
  }

  scheduleNextSpawn() {
    const interval = gameState.getCurrentSpawnInterval();
    this.spawnTimer = this.scene.time.delayedCall(interval, () => {
      this.spawnFlower();
      this.scheduleNextSpawn();
    });
  }

  spawnFlower() {
    if (gameState.gameOver) return;
    
    // Random position with padding
    const padding = GAMEPLAY.FLOWER_SIZE;
    const x = Phaser.Math.Between(padding, GAME.WIDTH - padding);
    
    // Random flower type
    const flowerType = Phaser.Utils.Array.GetRandom(FLOWER_TYPES);
    
    const flower = new Flower(this.scene, x, flowerType);
    this.flowers.push(flower);
    
    eventBus.emit(Events.FLOWER_SPAWNED, { flowerType });
  }

  update() {
    // Update all flowers and remove destroyed ones
    this.flowers = this.flowers.filter(flower => {
      if (flower.active) {
        flower.update();
        return true;
      }
      return false;
    });
  }

  getActiveFlowers() {
    return this.flowers.filter(f => f.active && !f.caught);
  }

  stop() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
    this.flowers.forEach(f => f.destroy());
    this.flowers = [];
  }

  destroy() {
    this.stop();
  }
}
