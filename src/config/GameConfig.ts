export const GameConfig = {
  TILE_SIZE: 64,
  MAP_WIDTH: 16,
  MAP_HEIGHT: 12,
  INITIAL_GOLD: 500,
  INITIAL_LIVES: 20,
  
  CANVAS_WIDTH: 1024,
  CANVAS_HEIGHT: 768,
  
  COLORS: {
    PATH: 0x8B7355,
    GRASS: 0x228B22,
    TOWER_SPOT: 0x90EE90,
  },
  
  SECTIONS: {
    GAME: { x: 0, y: 0, width: 1024, height: 640 },
    UI: { x: 0, y: 640, width: 1024, height: 128 },
  },
} as const
