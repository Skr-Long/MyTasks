import Phaser from 'phaser';
import { HeroType } from '../../shared/GameConfig';

interface DungeonLevel {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'normal' | 'hard';
  enemies: number;
  rewards: { exp: number; gold: number };
  unlocked: boolean;
}

export class DungeonScene extends Phaser.Scene {
  private levels: DungeonLevel[] = [];
  private selectedLevel: number = 0;
  private currentHero!: HeroType;

  constructor() {
    super('DungeonScene');
  }

  create(data: { hero?: HeroType }) {
    if (data.hero) {
      this.currentHero = data.hero;
    }

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.createBackground();
    this.initLevels();
    this.createLevelMap(centerX, centerY);
    this.createUI(centerX);
  }

  private createBackground() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 1280, 720);

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 1280;
      const y = Math.random() * 720;
      const size = Math.random() * 2 + 1;
      graphics.fillStyle(0xffffff, Math.random() * 0.5 + 0.2);
      graphics.fillCircle(x, y, size);
    }
  }

  private initLevels() {
    this.levels = [
      {
        id: 1,
        name: '景阳冈',
        description: '初入江湖，遭遇魔化白虎',
        difficulty: 'easy',
        enemies: 3,
        rewards: { exp: 100, gold: 50 },
        unlocked: true
      },
      {
        id: 2,
        name: '清风寨',
        description: '解救清风寨，对战秦明',
        difficulty: 'normal',
        enemies: 5,
        rewards: { exp: 200, gold: 100 },
        unlocked: true
      },
      {
        id: 3,
        name: '祝家庄',
        description: '三打祝家庄，挑战栾廷玉',
        difficulty: 'hard',
        enemies: 8,
        rewards: { exp: 500, gold: 250 },
        unlocked: true
      },
      {
        id: 4,
        name: '曾头市',
        description: '晁盖归天，决战史文恭',
        difficulty: 'hard',
        enemies: 10,
        rewards: { exp: 800, gold: 400 },
        unlocked: false
      },
      {
        id: 5,
        name: '梁山泊',
        description: '一百单八将聚义',
        difficulty: 'hard',
        enemies: 15,
        rewards: { exp: 1500, gold: 800 },
        unlocked: false
      }
    ];
  }

  private createLevelMap(centerX: number, centerY: number) {
    this.add.text(centerX, 60, '选择副本', {
      fontSize: '36px',
      color: '#ffcc00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const startY = 150;
    const spacing = 110;

    this.levels.forEach((level, index) => {
      this.createLevelCard(centerX, startY + index * spacing, level, index);
    });
  }

  private createLevelCard(x: number, y: number, level: DungeonLevel, index: number) {
    const width = 600;
    const height = 100;
    const isSelected = this.selectedLevel === index;

    const bgColor = level.unlocked ? (isSelected ? 0x4a4a8a : 0x3a3a6a) : 0x2a2a3a;
    const borderColor = level.unlocked ? 
      (level.difficulty === 'easy' ? 0x44ff44 : 
       level.difficulty === 'normal' ? 0xffff44 : 0xff4444) : 
      0x444444;

    const card = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, width, height, bgColor)
      .setStrokeStyle(3, borderColor);
    card.add(bg);

    const lockIcon = this.add.text(-width / 2 + 40, 0, level.unlocked ? '⚔' : '🔒', {
      fontSize: '28px'
    }).setOrigin(0.5);
    card.add(lockIcon);

    const nameText = this.add.text(-width / 2 + 100, -20, level.name, {
      fontSize: '24px',
      color: level.unlocked ? '#ffffff' : '#666666',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    card.add(nameText);

    const difficultyText = this.add.text(-width / 2 + 100, 20, level.description, {
      fontSize: '14px',
      color: level.unlocked ? '#aaaaaa' : '#444444'
    }).setOrigin(0, 0.5);
    card.add(difficultyText);

    const difficultyLabel = level.difficulty === 'easy' ? '简单' : 
                            level.difficulty === 'normal' ? '普通' : '困难';
    const difficultyColor = level.difficulty === 'easy' ? '#44ff44' : 
                            level.difficulty === 'normal' ? '#ffff44' : '#ff4444';
    
    this.add.text(width / 2 - 150, 0, difficultyLabel, {
      fontSize: '16px',
      color: level.unlocked ? difficultyColor : '#444444',
      backgroundColor: level.unlocked ? difficultyColor + '33' : '#222222',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    const rewardsText = `EXP:${level.rewards.exp} 💰:${level.rewards.gold}`;
    this.add.text(width / 2 - 40, 0, rewardsText, {
      fontSize: '14px',
      color: level.unlocked ? '#ffcc00' : '#444444'
    }).setOrigin(0.5);

    if (level.unlocked) {
      card.setSize(width, height);
      card.setInteractive({ useHandCursor: true });
      card.on('pointerdown', () => {
        this.selectedLevel = index;
        this.scene.restart({ hero: this.currentHero });
      });
    }
  }

  private createUI(centerX: number) {
    const startButton = this.add.text(centerX, 680, '开始战斗', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#44aa44',
      padding: { x: 50, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startButton.on('pointerdown', () => {
      const level = this.levels[this.selectedLevel];
      if (level.unlocked) {
        this.scene.start('BattleScene', { 
          hero: this.currentHero,
          level: level 
        });
      }
    });

    const backButton = this.add.text(80, 680, '返回', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backButton.on('pointerdown', () => {
      this.scene.start('CharacterSelectScene');
    });

    if (this.currentHero) {
      const heroNames: Record<string, string> = {
        wu_song: '武松',
        lu_zhi_shen: '鲁智深',
        lin_chong: '林冲'
      };
      this.add.text(1200, 680, `当前: ${heroNames[this.currentHero] || this.currentHero}`, {
        fontSize: '18px',
        color: '#ffcc00'
      }).setOrigin(1, 0.5);
    }
  }
}
