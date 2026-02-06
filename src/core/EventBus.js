export const Events = {
  // Game lifecycle
  GAME_START: 'game:start',
  GAME_OVER: 'game:over',
  GAME_RESTART: 'game:restart',
  GAME_PAUSE: 'game:pause',

  // Flowers
  FLOWER_SPAWNED: 'flower:spawned',
  FLOWER_CAUGHT: 'flower:caught',
  FLOWER_MISSED: 'flower:missed',

  // Bouquet
  BOUQUET_UPDATED: 'bouquet:updated',
  BOUQUET_SUBMITTED: 'bouquet:submitted',
  BOUQUET_CLEARED: 'bouquet:cleared',

  // Orders
  ORDER_CREATED: 'order:created',
  ORDER_COMPLETED: 'order:completed',
  ORDER_EXPIRED: 'order:expired',
  ORDER_FAILED: 'order:failed',

  // Score & Combo
  SCORE_CHANGED: 'score:changed',
  COMBO_CHANGED: 'combo:changed',

  // Effects
  PARTICLES_EMIT: 'particles:emit',
  SCREEN_SHAKE: 'screen:shake',
  FLASH: 'screen:flash',

  // Audio
  AUDIO_INIT: 'audio:init',
  SFX_CATCH: 'sfx:catch',
  SFX_SUBMIT: 'sfx:submit',
  SFX_COMPLETE: 'sfx:complete',
  SFX_FAIL: 'sfx:fail',
  MUSIC_MENU: 'music:menu',
  MUSIC_GAMEPLAY: 'music:gameplay',
  MUSIC_GAMEOVER: 'music:gameover',
};

class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.listeners[event]) return this;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    return this;
  }

  emit(event, data) {
    if (!this.listeners[event]) return this;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`EventBus error in ${event}:`, err);
      }
    });
    return this;
  }

  removeAll() {
    this.listeners = {};
    return this;
  }
}

export const eventBus = new EventBus();
