import Phaser from 'phaser';
import { GAMEPLAY, COLORS, GAME } from '../core/Constants.js';

export class Basket {
  constructor(scene) {
    this.scene = scene;
    
    const x = GAME.WIDTH / 2;
    const y = GAMEPLAY.BASKET_Y;
    
    // Create basket graphics
    const graphics = scene.add.graphics();
    
    // Basket body
    graphics.fillStyle(COLORS.BASKET_MAIN);
    graphics.fillRoundedRect(
      -GAMEPLAY.BASKET_WIDTH / 2, 
      -GAMEPLAY.BASKET_HEIGHT / 2,
      GAMEPLAY.BASKET_WIDTH,
      GAMEPLAY.BASKET_HEIGHT,
      8
    );
    
    // Weave pattern
    graphics.lineStyle(2, COLORS.BASKET_WEAVE);
    for (let i = -GAMEPLAY.BASKET_WIDTH / 2 + 10; i < GAMEPLAY.BASKET_WIDTH / 2; i += 15) {
      graphics.lineBetween(i, -GAMEPLAY.BASKET_HEIGHT / 2 + 5, i, GAMEPLAY.BASKET_HEIGHT / 2 - 5);
    }
    for (let i = -GAMEPLAY.BASKET_HEIGHT / 2 + 10; i < GAMEPLAY.BASKET_HEIGHT / 2; i += 10) {
      graphics.lineBetween(-GAMEPLAY.BASKET_WIDTH / 2 + 5, i, GAMEPLAY.BASKET_WIDTH / 2 - 5, i);
    }
    
    // Generate texture from graphics
    graphics.generateTexture('basket', GAMEPLAY.BASKET_WIDTH, GAMEPLAY.BASKET_HEIGHT);
    graphics.destroy();
    
    // Create sprite with physics
    this.sprite = scene.physics.add.sprite(x, y, 'basket');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setImmovable(true);
    this.sprite.body.setSize(GAMEPLAY.BASKET_WIDTH - 10, 20);
    this.sprite.body.setOffset(5, GAMEPLAY.BASKET_HEIGHT - 25);
  }

  update(moveX) {
    this.sprite.body.setVelocityX(moveX * GAMEPLAY.BASKET_SPEED);
  }

  getX() {
    return this.sprite.x;
  }

  getY() {
    return this.sprite.y;
  }

  getBounds() {
    return this.sprite.getBounds();
  }

  destroy() {
    this.sprite.destroy();
  }
}
