import Phaser from 'phaser';
import { LoginScene } from './game/scenes/LoginScene';
import { CharacterSelectScene } from './game/scenes/CharacterSelectScene';
import { BattleScene } from './game/scenes/BattleScene';
import { DungeonScene } from './game/scenes/DungeonScene';
import { GameConfig } from './shared/GameConfig';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.GAME_WIDTH,
  height: GameConfig.GAME_HEIGHT,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: process.env.NODE_ENV === 'development'
    }
  },
  scene: [LoginScene, CharacterSelectScene, BattleScene, DungeonScene],
  backgroundColor: '#1a1a2e'
};

new Phaser.Game(config);
