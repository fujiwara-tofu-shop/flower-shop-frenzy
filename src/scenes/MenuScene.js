import Phaser from 'phaser';
import { GAME, COLORS, UI } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const cx = GAME.WIDTH / 2;
    const cy = GAME.HEIGHT / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      COLORS.BG_GRADIENT_TOP, COLORS.BG_GRADIENT_TOP,
      COLORS.BG_GRADIENT_BOTTOM, COLORS.BG_GRADIENT_BOTTOM
    );
    bg.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

    // Decorative flowers
    this.add.text(cx, cy - 180, '🌸🌷🌻🌹🌼', {
      fontSize: '40px',
    }).setOrigin(0.5);

    // Title
    this.add.text(cx, cy - 100, 'Flower Shop', {
      fontSize: '42px',
      fontFamily: UI.FONT_FAMILY,
      color: COLORS.TEXT_DARK,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 50, 'FRENZY', {
      fontSize: '36px',
      fontFamily: UI.FONT_FAMILY,
      color: '#ff69b4',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // How to play
    const instructions = [
      '🧺 Catch falling flowers in your basket',
      '📋 Match orders before time runs out',
      '⭐ Chain combos for bonus points!',
    ];

    instructions.forEach((text, i) => {
      this.add.text(cx, cy + 20 + i * 30, text, {
        fontSize: '14px',
        fontFamily: UI.FONT_FAMILY,
        color: COLORS.TEXT_DARK,
      }).setOrigin(0.5);
    });

    // Play button
    const btn = this.add.rectangle(cx, cy + 140, 180, 55, COLORS.BUTTON_PRIMARY)
      .setInteractive({ useHandCursor: true });
    
    const btnText = this.add.text(cx, cy + 140, '🌸 PLAY', {
      fontSize: '24px',
      fontFamily: UI.FONT_FAMILY,
      color: COLORS.TEXT_LIGHT,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(COLORS.BUTTON_HOVER));
    btn.on('pointerout', () => btn.setFillStyle(COLORS.BUTTON_PRIMARY));
    btn.on('pointerdown', () => this.startGame());

    // Keyboard
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());

    // Mobile tap
    this.input.once('pointerdown', (pointer) => {
      // Only trigger if not on button
      if (!btn.getBounds().contains(pointer.x, pointer.y)) {
        this.startGame();
      }
    });

    // Blink prompt
    const prompt = this.add.text(cx, cy + 200, 'Tap or Press SPACE', {
      fontSize: '14px',
      fontFamily: UI.FONT_FAMILY,
      color: COLORS.TEXT_DARK,
      alpha: 0.7,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  startGame() {
    eventBus.emit(Events.GAME_START);
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
