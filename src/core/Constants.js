export const GAME = {
  WIDTH: 400,
  HEIGHT: 700,
  GRAVITY: 0, // No physics gravity, we control flower falling
};

// Flower types with colors
export const FLOWERS = {
  ROSE: { name: 'rose', color: 0xff6b6b, emoji: '🌹' },
  TULIP: { name: 'tulip', color: 0xff69b4, emoji: '🌷' },
  DAISY: { name: 'daisy', color: 0xffffff, emoji: '🌼' },
  SUNFLOWER: { name: 'sunflower', color: 0xffd93d, emoji: '🌻' },
};

export const FLOWER_TYPES = Object.values(FLOWERS);

export const GAMEPLAY = {
  // Basket
  BASKET_Y: 620,
  BASKET_WIDTH: 80,
  BASKET_HEIGHT: 40,
  BASKET_SPEED: 400,
  
  // Flowers
  FLOWER_SIZE: 36,
  FLOWER_FALL_SPEED: 120,
  FLOWER_SPAWN_INTERVAL: 1200,
  FLOWER_SPAWN_INTERVAL_MIN: 600,
  
  // Bouquet
  MAX_BOUQUET_SIZE: 5,
  
  // Orders
  MAX_ACTIVE_ORDERS: 3,
  ORDER_TIME_LIMIT: 20000, // 20 seconds per order
  ORDER_MIN_FLOWERS: 2,
  ORDER_MAX_FLOWERS: 4,
  
  // Scoring
  BASE_POINTS: 50,
  COMBO_MULTIPLIER: 0.5,
  TIME_BONUS_MAX: 30,
  
  // Difficulty
  SPEED_INCREASE_PER_ORDER: 5,
  SPAWN_DECREASE_PER_ORDER: 30,
};

export const COLORS = {
  // Background
  BG_GRADIENT_TOP: 0xfff0f5,    // Lavender blush
  BG_GRADIENT_BOTTOM: 0xffe4e1, // Misty rose
  
  // UI
  PANEL_BG: 0xffffff,
  PANEL_BORDER: 0xffb6c1,
  TEXT_DARK: '#5c4033',
  TEXT_LIGHT: '#ffffff',
  
  // Basket
  BASKET_MAIN: 0x8b4513,
  BASKET_WEAVE: 0xa0522d,
  
  // Buttons
  BUTTON_PRIMARY: 0xff69b4,
  BUTTON_HOVER: 0xff85c1,
  BUTTON_SUCCESS: 0x90ee90,
  BUTTON_DANGER: 0xff6b6b,
  
  // Orders
  ORDER_BG: 0xfff8dc,
  ORDER_URGENT: 0xffcccb,
  ORDER_COMPLETE: 0x90ee90,
  
  // Effects
  SPARKLE: 0xffd700,
  GLOW: 0xffb6c1,
};

export const TRANSITION = {
  FADE_DURATION: 300,
  SCORE_POP_SCALE: 1.4,
  SCORE_POP_DURATION: 200,
  FLOWER_CATCH_BOUNCE: 100,
  ORDER_COMPLETE_FLASH: 150,
};

export const UI = {
  ORDER_PANEL_HEIGHT: 120,
  BOUQUET_PANEL_HEIGHT: 80,
  FONT_FAMILY: 'Georgia, serif',
};
