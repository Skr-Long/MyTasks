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
    
    graphics.fillGradientStyle(0x1a0a2e, 0x2d1b4e, 0x1a0a2e, 0x2d1b4e, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.cameras.main.width;
      const y = Math.random() * this.cameras.main.height;
      const size = Math.random() * 2 + 1;
      graphics.fillStyle(0xffd700, Math.random() * 0.4 + 0.2);
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
    const title = this.add.text(centerX, 60, '大乱水浒 - 副本选择', {
      fontSize: '36px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#8b0000',
      strokeThickness: 3
    }).setOrigin(0.5);

    title.setShadow(2, 2, '#000000', 4);

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

    const bgColor = level.unlocked ? (isSelected ? 0x3a2a5a : 0x2a2a4a) : 0x1a1a2a;
    const borderColor = level.unlocked ? 
      (level.difficulty === 'easy' ? 0x4ade80 : 
       level.difficulty === 'normal' ? 0xfbbf24 : 0xef4444) : 
      0x444444;

    const card = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, width, height, bgColor)
      .setStrokeStyle(3, borderColor);
    card.add(bg);

    if (isSelected && level.unlocked) {
      bg.setScale(1.02);
    }

    const icon = level.unlocked ? '⚔' : '🔒';
    const lockIcon = this.add.text(-width / 2 + 40, 0, icon, {
      fontSize: '28px'
    }).setOrigin(0.5);
    card.add(lockIcon);

    const nameText = this.add.text(-width / 2 + 100, -20, level.name, {
      fontSize: '24px',
      color: level.unlocked ? '#ffffff' : '#666666',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    card.add(nameText);

    const descriptionText = this.add.text(-width / 2 + 100, 20, level.description, {
      fontSize: '14px',
      color: level.unlocked ? '#c49df0' : '#444444'
    }).setOrigin(0, 0.5);
    card.add(descriptionText);

    const difficultyLabel = level.difficulty === 'easy' ? '简单' : 
                            level.difficulty === 'normal' ? '普通' : '困难';
    const difficultyColor = level.difficulty === 'easy' ? '#4ade80' : 
                            level.difficulty === 'normal' ? '#fbbf24' : '#ef4444';
    
    this.add.text(width / 2 - 150, 0, difficultyLabel, {
      fontSize: '16px',
      color: level.unlocked ? difficultyColor : '#444444',
      backgroundColor: level.unlocked ? difficultyColor + '44' : '#222222',
      padding: { x: 12, y: 6 },
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const rewardsText = `EXP:${level.rewards.exp} 💰:${level.rewards.gold}`;
    this.add.text(width / 2 - 40, 0, rewardsText, {
      fontSize: '15px',
      color: level.unlocked ? '#ffd700' : '#444444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    if (level.unlocked) {
      card.setSize(width, height);
      card.setInteractive({ useHandCursor: true });
      card.on('pointerover', () => bg.setScale(1.02));
      card.on('pointerout', () => bg.setScale(isSelected ? 1.02 : 1));
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
