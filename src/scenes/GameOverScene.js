import Phaser from 'phaser';
import { GAME, COLORS, UI } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
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
    
    // Overlay
    const overlay = this.add.rectangle(cx, cy, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.3);

    // Wilted flower emoji
    this.add.text(cx, cy - 160, '🥀', {
      fontSize: '60px',
    }).setOrigin(0.5);

    // Game Over title
    this.add.text(cx, cy - 90, 'Shop Closed!', {
      fontSize: '36px',
      fontFamily: UI.FONT_FAMILY,
      color: COLORS.TEXT_DARK,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats panel
    const panelY = cy - 20;
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.PANEL_BG, 0.95);
    panel.lineStyle(2, COLORS.PANEL_BORDER);
    panel.fillRoundedRect(40, panelY, GAME.WIDTH - 80, 130, 12);
    panel.strokeRoundedRect(40, panelY, GAME.WIDTH - 80, 130, 12);

    // Score
    this.add.text(cx, panelY + 25, `Score: ${gameState.score}`, {
      fontSize: '28px',
      fontFamily: UI.FONT_FAMILY,
      color: '#ff69b4',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Best score
    const isNewBest = gameState.score === gameState.bestScore && gameState.score > 0;
    const bestText = isNewBest ? '🏆 NEW BEST!' : `Best: ${gameState.bestScore}`;
    this.add.text(cx, panelY + 55, bestText, {
      fontSize: '18px',
      fontFamily: UI.FONT_FAMILY,
      color: isNewBest ? '#ffd700' : COLORS.TEXT_DARK,
    }).setOrigin(0.5);

    // Stats row
    const stats = [
      `📋 ${gameState.ordersCompleted} orders`,
      `🌸 ${gameState.flowersCaught} caught`,
      `⚡ x${gameState.maxCombo} max combo`,
    ];
    
    this.add.text(cx, panelY + 95, stats.join('  '), {
      fontSize: '13px',
      fontFamily: UI.FONT_FAMILY,
      color: COLORS.TEXT_DARK,
    }).setOrigin(0.5);

    // Play Again button
    const btn = this.add.rectangle(cx, cy + 130, 200, 55, COLORS.BUTTON_PRIMARY)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(cx, cy + 130, '🌸 Play Again', {
      fontSize: '22px',
      fontFamily: UI.FONT_FAMILY,
      color: COLORS.TEXT_LIGHT,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(COLORS.BUTTON_HOVER));
    btn.on('pointerout', () => btn.setFillStyle(COLORS.BUTTON_PRIMARY));
    btn.on('pointerdown', () => this.restartGame());

    // Keyboard
    this.input.keyboard.once('keydown-SPACE', () => this.restartGame());

    // Delayed tap to restart
    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', (pointer) => {
        if (!btn.getBounds().contains(pointer.x, pointer.y)) {
          this.restartGame();
        }
      });
    });
  }

  restartGame() {
    eventBus.emit(Events.GAME_RESTART);
    this.scene.start('MenuScene');
  }
}
