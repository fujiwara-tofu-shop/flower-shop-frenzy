import Phaser from 'phaser';
import { GameConfig } from './core/GameConfig.js';
import { eventBus, Events } from './core/EventBus.js';
import { gameState } from './core/GameState.js';
import { initPlayFun } from './playfun.js';

const game = new Phaser.Game(GameConfig);

// Initialize Play.fun SDK
// Game ID will be set after registration
const GAME_ID = 'PLACEHOLDER_GAME_ID';
if (GAME_ID !== 'PLACEHOLDER_GAME_ID') {
  initPlayFun(GAME_ID).catch(err => console.warn('Play.fun init failed:', err));
}

// Expose for Playwright testing
window.__GAME__ = game;
window.__GAME_STATE__ = gameState;
window.__EVENT_BUS__ = eventBus;
window.__EVENTS__ = Events;
