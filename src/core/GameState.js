import { GAMEPLAY } from './Constants.js';

class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.bestScore = this.bestScore || 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.ordersCompleted = 0;
    this.ordersFailed = 0;
    this.flowersCaught = 0;
    this.flowersMissed = 0;
    
    // Current bouquet (flowers in basket)
    this.bouquet = [];
    
    // Active orders
    this.orders = [];
    
    // Difficulty scaling
    this.difficultyLevel = 1;
    
    this.started = false;
    this.gameOver = false;
    this.isPaused = false;
  }

  addScore(points) {
    const comboBonus = Math.floor(points * this.combo * GAMEPLAY.COMBO_MULTIPLIER);
    const totalPoints = points + comboBonus;
    this.score += totalPoints;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }
    return totalPoints;
  }

  incrementCombo() {
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
  }

  resetCombo() {
    this.combo = 0;
  }

  addToBouquet(flowerType) {
    if (this.bouquet.length < GAMEPLAY.MAX_BOUQUET_SIZE) {
      this.bouquet.push(flowerType);
      return true;
    }
    return false;
  }

  clearBouquet() {
    this.bouquet = [];
  }

  getBouquetCounts() {
    const counts = {};
    this.bouquet.forEach(flower => {
      counts[flower.name] = (counts[flower.name] || 0) + 1;
    });
    return counts;
  }

  // Check if current bouquet matches an order
  checkOrderMatch(order) {
    const bouquetCounts = this.getBouquetCounts();
    
    for (const [flowerName, needed] of Object.entries(order.flowers)) {
      if ((bouquetCounts[flowerName] || 0) < needed) {
        return false;
      }
    }
    return true;
  }

  getCurrentFallSpeed() {
    return GAMEPLAY.FLOWER_FALL_SPEED + 
      (this.ordersCompleted * GAMEPLAY.SPEED_INCREASE_PER_ORDER);
  }

  getCurrentSpawnInterval() {
    const interval = GAMEPLAY.FLOWER_SPAWN_INTERVAL - 
      (this.ordersCompleted * GAMEPLAY.SPAWN_DECREASE_PER_ORDER);
    return Math.max(interval, GAMEPLAY.FLOWER_SPAWN_INTERVAL_MIN);
  }
}

export const gameState = new GameState();
