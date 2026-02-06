// Play.fun (OpenGameProtocol) integration
import { eventBus, Events } from './core/EventBus.js';

let sdk = null;
let initialized = false;
let gameId = null; // Will be set after registration

export async function initPlayFun(id) {
  gameId = id;
  
  const SDKClass = typeof OpenGameSDK !== 'undefined' ? OpenGameSDK : null;
  
  if (!SDKClass) {
    console.warn('Play.fun SDK not loaded');
    return false;
  }
  
  try {
    sdk = new SDKClass({
      ui: { usePointsWidget: true, theme: 'light' },
      logLevel: 1,
    });
    
    sdk.on('OnReady', () => {
      console.log('Play.fun SDK ready!');
      initialized = true;
    });
    
    sdk.on('SavePointsSuccess', () => {
      console.log('Score saved to Play.fun!');
    });
    
    sdk.on('SavePointsFailed', (error) => {
      console.warn('Failed to save score:', error);
    });
    
    await sdk.init({ gameId });
    
    // Wire up score events
    eventBus.on(Events.SCORE_CHANGED, ({ score, delta }) => {
      if (initialized && delta > 0) {
        sdk.addPoints(delta);
      }
    });
    
    // Save on game over
    eventBus.on(Events.GAME_OVER, ({ score }) => {
      if (initialized && score > 0) {
        sdk.savePoints(score);
      }
    });
    
    return true;
  } catch (error) {
    console.warn('Play.fun init failed:', error);
    return false;
  }
}

export function getSDK() {
  return sdk;
}

export function isInitialized() {
  return initialized;
}
