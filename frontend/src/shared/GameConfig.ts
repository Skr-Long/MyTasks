export const GameConfig = {
  GAME_WIDTH: 1280,
  GAME_HEIGHT: 720,
  GRAVITY: 800,
  PLAYER_SPEED: 300,
  JUMP_FORCE: -500,
  ATTACK_COOLDOWN: 500,
  SKILL_COOLDOWN: 3000,
  API_BASE_URL: '/api',
  SOCKET_URL: ''
} as const;

export const HeroTypes = {
  WU_SONG: 'wu_song',
  LU_ZHI_SHEN: 'lu_zhi_shen',
  LIN_CHONG: 'lin_chong'
} as const;

export type HeroType = typeof HeroTypes[keyof typeof HeroTypes];

export const QualityColors = {
  R: 0x888888,
  SR: 0x4488ff,
  SSR: 0x8844ff,
  UR: 0xffcc00
} as const;
