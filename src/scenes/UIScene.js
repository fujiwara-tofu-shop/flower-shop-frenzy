import Phaser from 'phaser';
import { GAME, UI, COLORS, TRANSITION, FLOWER_TYPES, GAMEPLAY } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    // Score display
    this.scoreText = this.add.text(GAME.WIDTH - 15, 10, 'Score: 0', {
      fontSize: '18px',
      fontFamily: UI.FONT_FAMILY,
      color: COLORS.TEXT_DARK,
    }).setOrigin(1, 0);
    
    // Combo display
    this.comboText = this.add.text(GAME.WIDTH - 15, 35, '', {
      fontSize: '16px',
      fontFamily: UI.FONT_FAMILY,
      color: '#ff69b4',
      fontStyle: 'bold',
    }).setOrigin(1, 0);
    
    // Orders panel (top)
    this.ordersContainer = this.add.container(0, 10);
    this.orderDisplays = [];
    
    // Bouquet panel (bottom)
    this.createBouquetPanel();
    
    // Submit button
    this.createSubmitButton();
    
    // Missed orders indicator
    this.createFailedIndicator();
    
    // Mobile hint
    if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
      this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 20, '← Left | Tap Center to Submit | Right →', {
        fontSize: '11px',
        fontFamily: UI.FONT_FAMILY,
        color: COLORS.TEXT_DARK,
        alpha: 0.6,
      }).setOrigin(0.5);
    }
    
    // Event listeners
    this.setupEventListeners();
  }

  createBouquetPanel() {
    const y = GAME.HEIGHT - UI.BOUQUET_PANEL_HEIGHT - 50;
    
    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.PANEL_BG, 0.9);
    panel.lineStyle(2, COLORS.PANEL_BORDER);
    panel.fillRoundedRect(10, y, GAME.WIDTH - 20, UI.BOUQUET_PANEL_HEIGHT - 10, 10);
    panel.strokeRoundedRect(10, y, GAME.WIDTH - 20, UI.BOUQUET_PANEL_HEIGHT - 10, 10);
    
    // Label
    this.add.text(20, y + 5, '🧺 Your Bouquet:', {
      fontSize: '14px',
      fontFamily: UI.FONT_FAMILY,
      color: COLORS.TEXT_DARK,
    });
    
    // Flower slots container
    this.bouquetContainer = this.add.container(20, y + 30);
    this.bouquetSlots = [];
  }

  createSubmitButton() {
    const btnX = GAME.WIDTH / 2;
    const btnY = GAME.HEIGHT - 45;
    
    this.submitBtn = this.add.rectangle(btnX, btnY, 120, 35, COLORS.BUTTON_PRIMARY)
      .setInteractive({ useHandCursor: true });
    
    this.submitBtnText = this.add.text(btnX, btnY, '✓ Submit', {
      fontSize: '16px',
      fontFamily: UI.FONT_FAMILY,
      color: COLORS.TEXT_LIGHT,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    this.submitBtn.on('pointerover', () => {
      this.submitBtn.setFillStyle(COLORS.BUTTON_HOVER);
    });
    
    this.submitBtn.on('pointerout', () => {
      this.submitBtn.setFillStyle(COLORS.BUTTON_PRIMARY);
    });
    
    this.submitBtn.on('pointerdown', () => {
      eventBus.emit(Events.BOUQUET_SUBMITTED);
    });
  }

  createFailedIndicator() {
    this.failedContainer = this.add.container(15, 10);
    this.failedHearts = [];
    
    for (let i = 0; i < 3; i++) {
      const heart = this.add.text(i * 25, 0, '💔', {
        fontSize: '20px',
      }).setAlpha(0.3);
      this.failedHearts.push(heart);
      this.failedContainer.add(heart);
    }
  }

  setupEventListeners() {
    // Score changed
    this.onScoreChanged = ({ score, delta }) => {
      this.scoreText.setText(`Score: ${score}`);
      
      if (delta) {
        // Score pop animation
        this.tweens.add({
          targets: this.scoreText,
          scaleX: TRANSITION.SCORE_POP_SCALE,
          scaleY: TRANSITION.SCORE_POP_SCALE,
          duration: TRANSITION.SCORE_POP_DURATION,
          yoyo: true,
          ease: 'Quad.easeOut',
        });
        
        // Floating score indicator
        const floater = this.add.text(
          GAME.WIDTH / 2,
          GAME.HEIGHT / 2,
          `+${delta}`,
          {
            fontSize: '28px',
            fontFamily: UI.FONT_FAMILY,
            color: '#ff69b4',
            fontStyle: 'bold',
          }
        ).setOrigin(0.5);
        
        this.tweens.add({
          targets: floater,
          y: floater.y - 80,
          alpha: 0,
          duration: 800,
          ease: 'Cubic.easeOut',
          onComplete: () => floater.destroy(),
        });
      }
    };
    eventBus.on(Events.SCORE_CHANGED, this.onScoreChanged);
    
    // Combo changed
    this.onComboChanged = ({ combo }) => {
      if (combo >= 2) {
        this.comboText.setText(`x${combo} Combo!`);
        this.tweens.add({
          targets: this.comboText,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 100,
          yoyo: true,
        });
      } else {
        this.comboText.setText('');
      }
    };
    eventBus.on(Events.COMBO_CHANGED, this.onComboChanged);
    
    // Order created/updated
    this.onOrderCreated = () => {
      this.updateOrdersDisplay();
    };
    eventBus.on(Events.ORDER_CREATED, this.onOrderCreated);
    
    // Order completed
    this.onOrderCompleted = ({ order }) => {
      this.updateOrdersDisplay();
      this.flashOrderComplete();
    };
    eventBus.on(Events.ORDER_COMPLETED, this.onOrderCompleted);
    
    // Order expired
    this.onOrderExpired = () => {
      this.updateOrdersDisplay();
      this.updateFailedIndicator();
    };
    eventBus.on(Events.ORDER_EXPIRED, this.onOrderExpired);
    
    // Bouquet updated
    this.onBouquetUpdated = ({ bouquet }) => {
      this.updateBouquetDisplay(bouquet);
    };
    eventBus.on(Events.BOUQUET_UPDATED, this.onBouquetUpdated);
    
    // Start update loop for order timers
    this.time.addEvent({
      delay: 100,
      callback: this.updateOrdersDisplay,
      callbackScope: this,
      loop: true,
    });
  }

  updateOrdersDisplay() {
    // Clear existing
    this.ordersContainer.removeAll(true);
    this.orderDisplays = [];
    
    const orders = gameState.orders.filter(o => !o.completed && !o.expired);
    const panelWidth = (GAME.WIDTH - 30) / GAMEPLAY.MAX_ACTIVE_ORDERS;
    
    orders.forEach((order, i) => {
      const x = 15 + i * panelWidth;
      const panel = this.createOrderPanel(order, x, panelWidth - 5);
      this.ordersContainer.add(panel);
      this.orderDisplays.push({ order, panel });
    });
  }

  createOrderPanel(order, x, width) {
    const container = this.add.container(x, 0);
    
    // Background
    const isUrgent = order.isUrgent();
    const bgColor = isUrgent ? COLORS.ORDER_URGENT : COLORS.ORDER_BG;
    
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 0.95);
    bg.lineStyle(2, COLORS.PANEL_BORDER);
    bg.fillRoundedRect(0, 0, width, UI.ORDER_PANEL_HEIGHT - 20, 8);
    bg.strokeRoundedRect(0, 0, width, UI.ORDER_PANEL_HEIGHT - 20, 8);
    container.add(bg);
    
    // Order text
    const orderText = this.add.text(width / 2, 15, order.getDisplayText(), {
      fontSize: '16px',
      fontFamily: UI.FONT_FAMILY,
      color: COLORS.TEXT_DARK,
      align: 'center',
    }).setOrigin(0.5, 0);
    container.add(orderText);
    
    // Timer bar
    const timerBg = this.add.rectangle(5, UI.ORDER_PANEL_HEIGHT - 35, width - 10, 8, 0xdddddd);
    timerBg.setOrigin(0, 0.5);
    container.add(timerBg);
    
    const timePercent = order.getTimeRemainingPercent();
    const timerColor = isUrgent ? 0xff6b6b : 0x90ee90;
    const timerFill = this.add.rectangle(5, UI.ORDER_PANEL_HEIGHT - 35, (width - 10) * timePercent, 8, timerColor);
    timerFill.setOrigin(0, 0.5);
    container.add(timerFill);
    
    // Urgent pulse animation
    if (isUrgent) {
      this.tweens.add({
        targets: bg,
        alpha: 0.6,
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
    }
    
    return container;
  }

  updateBouquetDisplay(bouquet) {
    // Clear existing
    this.bouquetContainer.removeAll(true);
    this.bouquetSlots = [];
    
    bouquet.forEach((flower, i) => {
      const slot = this.add.text(i * 40, 0, flower.emoji, {
        fontSize: '28px',
      });
      this.bouquetSlots.push(slot);
      this.bouquetContainer.add(slot);
      
      // Pop-in animation for new flowers
      slot.setScale(0);
      this.tweens.add({
        targets: slot,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Back.easeOut',
      });
    });
    
    // Show remaining slots
    for (let i = bouquet.length; i < GAMEPLAY.MAX_BOUQUET_SIZE; i++) {
      const emptySlot = this.add.text(i * 40, 0, '○', {
        fontSize: '28px',
        color: '#cccccc',
      });
      this.bouquetContainer.add(emptySlot);
    }
  }

  updateFailedIndicator() {
    const failed = gameState.ordersFailed;
    this.failedHearts.forEach((heart, i) => {
      heart.setAlpha(i < failed ? 1 : 0.3);
    });
  }

  flashOrderComplete() {
    const flash = this.add.rectangle(
      GAME.WIDTH / 2,
      UI.ORDER_PANEL_HEIGHT / 2,
      GAME.WIDTH,
      UI.ORDER_PANEL_HEIGHT,
      COLORS.ORDER_COMPLETE,
      0.5
    );
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: TRANSITION.ORDER_COMPLETE_FLASH,
      onComplete: () => flash.destroy(),
    });
  }

  shutdown() {
    eventBus.off(Events.SCORE_CHANGED, this.onScoreChanged);
    eventBus.off(Events.COMBO_CHANGED, this.onComboChanged);
    eventBus.off(Events.ORDER_CREATED, this.onOrderCreated);
    eventBus.off(Events.ORDER_COMPLETED, this.onOrderCompleted);
    eventBus.off(Events.ORDER_EXPIRED, this.onOrderExpired);
    eventBus.off(Events.BOUQUET_UPDATED, this.onBouquetUpdated);
  }
}
