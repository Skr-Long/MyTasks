import { GameConfig, HeroTypes, QualityColors } from '../GameConfig';

describe('GameConfig', () => {
  it('should have correct game dimensions', () => {
    expect(GameConfig.GAME_WIDTH).toBe(1280);
    expect(GameConfig.GAME_HEIGHT).toBe(720);
  });

  it('should have correct gravity', () => {
    expect(GameConfig.GRAVITY).toBe(800);
  });

  it('should have correct player speed', () => {
    expect(GameConfig.PLAYER_SPEED).toBe(300);
  });

  it('should have correct jump force', () => {
    expect(GameConfig.JUMP_FORCE).toBe(-500);
  });

  it('should have correct attack cooldown', () => {
    expect(GameConfig.ATTACK_COOLDOWN).toBe(500);
  });

  it('should have correct skill cooldown', () => {
    expect(GameConfig.SKILL_COOLDOWN).toBe(3000);
  });
});

describe('HeroTypes', () => {
  it('should contain all three heroes', () => {
    expect(HeroTypes.WU_SONG).toBe('wu_song');
    expect(HeroTypes.LU_ZHI_SHEN).toBe('lu_zhi_shen');
    expect(HeroTypes.LIN_CHONG).toBe('lin_chong');
  });
});

describe('QualityColors', () => {
  it('should contain all quality colors', () => {
    expect(QualityColors.R).toBeDefined();
    expect(QualityColors.SR).toBeDefined();
    expect(QualityColors.SSR).toBeDefined();
    expect(QualityColors.UR).toBeDefined();
  });
});
