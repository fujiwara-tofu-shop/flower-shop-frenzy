import Phaser from 'phaser';
import { GAMEPLAY, FLOWER_TYPES } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class Order {
  constructor(id) {
    this.id = id;
    this.flowers = {}; // { rose: 2, tulip: 1 }
    this.createdAt = Date.now();
    this.expiresAt = this.createdAt + GAMEPLAY.ORDER_TIME_LIMIT;
    this.completed = false;
    this.expired = false;
    
    this.generateRandomOrder();
  }

  generateRandomOrder() {
    const flowerCount = Phaser.Math.Between(
      GAMEPLAY.ORDER_MIN_FLOWERS, 
      GAMEPLAY.ORDER_MAX_FLOWERS
    );
    
    // Pick random flowers for this order
    for (let i = 0; i < flowerCount; i++) {
      const flowerType = Phaser.Utils.Array.GetRandom(FLOWER_TYPES);
      this.flowers[flowerType.name] = (this.flowers[flowerType.name] || 0) + 1;
    }
  }

  getTimeRemaining() {
    return Math.max(0, this.expiresAt - Date.now());
  }

  getTimeRemainingPercent() {
    return this.getTimeRemaining() / GAMEPLAY.ORDER_TIME_LIMIT;
  }

  isUrgent() {
    return this.getTimeRemainingPercent() < 0.25;
  }

  checkExpired() {
    if (!this.expired && !this.completed && Date.now() > this.expiresAt) {
      this.expired = true;
      return true;
    }
    return false;
  }

  getTotalFlowers() {
    return Object.values(this.flowers).reduce((a, b) => a + b, 0);
  }

  getDisplayText() {
    return Object.entries(this.flowers)
      .map(([name, count]) => {
        const flower = FLOWER_TYPES.find(f => f.name === name);
        return `${flower.emoji}×${count}`;
      })
      .join(' ');
  }
}

export class OrderSystem {
  constructor(scene) {
    this.scene = scene;
    this.orders = [];
    this.nextOrderId = 1;
    this.checkTimer = null;
  }

  start() {
    // Create initial orders
    this.createOrder();
    this.createOrder();
    
    // Check for expired orders periodically
    this.checkTimer = this.scene.time.addEvent({
      delay: 500,
      callback: this.checkOrders,
      callbackScope: this,
      loop: true,
    });
  }

  createOrder() {
    if (this.orders.length >= GAMEPLAY.MAX_ACTIVE_ORDERS) return null;
    
    const order = new Order(this.nextOrderId++);
    this.orders.push(order);
    gameState.orders = this.orders;
    
    eventBus.emit(Events.ORDER_CREATED, { order });
    
    return order;
  }

  checkOrders() {
    if (gameState.gameOver) return;
    
    // Check for expired orders
    this.orders.forEach(order => {
      if (order.checkExpired()) {
        this.onOrderExpired(order);
      }
    });
    
    // Maintain minimum orders
    while (this.orders.filter(o => !o.completed && !o.expired).length < 2) {
      this.createOrder();
    }
  }

  onOrderExpired(order) {
    gameState.ordersFailed++;
    gameState.resetCombo();
    
    eventBus.emit(Events.ORDER_EXPIRED, { order });
    eventBus.emit(Events.COMBO_CHANGED, { combo: 0 });
    
    // Remove from list
    this.orders = this.orders.filter(o => o.id !== order.id);
    gameState.orders = this.orders;
    
    // Check for game over (3 failed orders)
    if (gameState.ordersFailed >= 3) {
      eventBus.emit(Events.GAME_OVER, { 
        score: gameState.score,
        reason: 'Too many failed orders!' 
      });
    }
  }

  trySubmitBouquet() {
    if (gameState.bouquet.length === 0) return false;
    
    // Find matching order
    const matchingOrder = this.orders.find(order => 
      !order.completed && !order.expired && gameState.checkOrderMatch(order)
    );
    
    if (matchingOrder) {
      this.completeOrder(matchingOrder);
      return true;
    }
    
    // No match - wrong submission
    eventBus.emit(Events.ORDER_FAILED, { 
      bouquet: [...gameState.bouquet],
      message: 'No matching order!' 
    });
    
    return false;
  }

  completeOrder(order) {
    order.completed = true;
    
    // Calculate score with time bonus
    const timeBonus = Math.floor(
      order.getTimeRemainingPercent() * GAMEPLAY.TIME_BONUS_MAX
    );
    const basePoints = GAMEPLAY.BASE_POINTS * order.getTotalFlowers();
    
    gameState.incrementCombo();
    const totalPoints = gameState.addScore(basePoints + timeBonus);
    gameState.ordersCompleted++;
    
    // Clear used flowers from bouquet
    const usedFlowers = { ...order.flowers };
    gameState.bouquet = gameState.bouquet.filter(flower => {
      if (usedFlowers[flower.name] > 0) {
        usedFlowers[flower.name]--;
        return false;
      }
      return true;
    });
    
    eventBus.emit(Events.ORDER_COMPLETED, { 
      order, 
      points: totalPoints,
      timeBonus 
    });
    eventBus.emit(Events.BOUQUET_UPDATED, { bouquet: gameState.bouquet });
    eventBus.emit(Events.SCORE_CHANGED, { 
      score: gameState.score, 
      delta: totalPoints 
    });
    eventBus.emit(Events.COMBO_CHANGED, { combo: gameState.combo });
    
    // Remove completed order and create new one
    this.orders = this.orders.filter(o => o.id !== order.id);
    gameState.orders = this.orders;
    
    this.scene.time.delayedCall(500, () => {
      this.createOrder();
    });
  }

  getActiveOrders() {
    return this.orders.filter(o => !o.completed && !o.expired);
  }

  stop() {
    if (this.checkTimer) {
      this.checkTimer.destroy();
    }
  }

  destroy() {
    this.stop();
    this.orders = [];
  }
}
