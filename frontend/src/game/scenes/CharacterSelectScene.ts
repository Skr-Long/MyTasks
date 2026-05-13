import Phaser from 'phaser';
import { HeroTypes, HeroType, QualityColors } from '../../shared/GameConfig';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedHero: HeroType = HeroTypes.WU_SONG;
  private heroCards: Map<HeroType, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super('CharacterSelectScene');
  }

  create(_data: { user?: any }) {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.createBackground();
    this.createTitle(centerX);
    this.createHeroCards(centerX, centerY);
    this.createStartButton(centerX, centerY);
    this.selectHero(this.selectedHero);
  }

  private createBackground() {
    const graphics = this.add.graphics();
    
    graphics.fillGradientStyle(0x1a0a2e, 0x2d1b4e, 0x1a0a2e, 0x2d1b4e, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * this.cameras.main.width;
      const y = Math.random() * this.cameras.main.height;
      const size = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.4 + 0.2;
      graphics.fillStyle(0xffd700, alpha);
      graphics.fillCircle(x, y, size);
    }
  }

  private createTitle(centerX: number) {
    const title = this.add.text(centerX, 60, '大乱水浒', {
      fontSize: '48px',
      fontFamily: 'serif',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#8b0000',
      strokeThickness: 4
    }).setOrigin(0.5);

    title.setShadow(3, 3, '#000000', 6);

    this.add.text(centerX, 110, '选择你的英雄', {
      fontSize: '28px',
      color: '#c49df0',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  private createHeroCards(centerX: number, centerY: number) {
    const heroes = [
      { type: HeroTypes.WU_SONG, name: '武松', title: '天伤星', quality: 'UR', desc: '均衡型 · 醉拳连击', skill: '必杀技：鸳鸯脚' },
      { type: HeroTypes.LU_ZHI_SHEN, name: '鲁智深', title: '天孤星', quality: 'UR', desc: '力量型 · 金刚护体', skill: '必杀技：倒拔垂杨柳' },
      { type: HeroTypes.LIN_CHONG, name: '林冲', title: '天雄星', quality: 'SSR', desc: '敏捷型 · 林家枪法', skill: '必杀技：豹子头突刺' }
    ];

    heroes.forEach((hero, index) => {
      const x = centerX + (index - 1) * 280;
      const y = centerY - 30;
      
      const card = this.createHeroCard(x, y, hero);
      this.heroCards.set(hero.type, card);
    });
  }

  private createHeroCard(x: number, y: number, hero: any): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const color = QualityColors[hero.quality as keyof typeof QualityColors];

    const bg = this.add.rectangle(0, 0, 250, 380, 0x1a1a2e, 0.95)
      .setStrokeStyle(4, color);
    container.add(bg);

    const qualityTag = this.add.rectangle(0, -170, 250, 40, color, 0.3);
    container.add(qualityTag);

    this.add.text(0, -170, `${hero.quality}`, {
      fontSize: '18px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(qualityTag);

    const heroGraphics = this.add.graphics();
    this.drawStickFigure(heroGraphics, 0, -30, color, hero.type);
    container.add(heroGraphics);

    this.add.text(0, 80, hero.name, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    container.add(this.add.text(0, 80, hero.name, {}));

    this.add.text(0, 115, hero.title, {
      fontSize: '18px',
      color: '#c49df0'
    }).setOrigin(0.5);

    this.add.text(0, 145, hero.desc, {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(0, 170, hero.skill, {
      fontSize: '13px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'italic'
    }).setOrigin(0.5);

    container.setSize(250, 380);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.selectHero(hero.type));

    return container;
  }

  private drawStickFigure(graphics: Phaser.GameObjects.Graphics, x: number, y: number, color: number, type: string) {
    graphics.clear();
    graphics.lineStyle(5, color, 1);

    graphics.strokeCircle(x, y - 50, 25);

    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(x - 8, y - 55, 4);
    graphics.fillCircle(x + 8, y - 55, 4);

    graphics.lineStyle(5, color, 1);
    graphics.lineBetween(x, y - 25, x, y + 30);

    graphics.lineStyle(4, color, 1);
    graphics.lineBetween(x, y - 15, x - 35, y + 10);
    graphics.lineBetween(x, y - 15, x + 35, y + 10);

    graphics.lineBetween(x, y + 30, x - 25, y + 80);
    graphics.lineBetween(x, y + 30, x + 25, y + 80);

    if (type === HeroTypes.WU_SONG) {
      graphics.lineStyle(3, 0xc0c0c0, 1);
      graphics.lineBetween(x + 35, y + 10, x + 60, y - 15);
      graphics.lineBetween(x - 35, y + 10, x - 60, y - 15);
    } else if (type === HeroTypes.LIN_CHONG) {
      graphics.lineStyle(4, 0xc0c0c0, 1);
      graphics.lineBetween(x, y - 25, x, y - 110);
      graphics.fillTriangle(x, y - 115, x - 12, y - 100, x + 12, y - 100);
    } else if (type === HeroTypes.LU_ZHI_SHEN) {
      graphics.lineStyle(6, 0x8B4513, 1);
      graphics.lineBetween(x + 40, y - 20, x + 40, y + 50);
      graphics.strokeCircle(x + 40, y - 25, 12);
    }
  }

  private selectHero(heroType: HeroType) {
    this.selectedHero = heroType;

    this.heroCards.forEach((card, type) => {
      const bg = card.getAt(0) as Phaser.GameObjects.Rectangle;
      if (type === heroType) {
        bg.setFillStyle(0x2a2a5a);
        card.setScale(1.08);
        card.setDepth(10);
      } else {
        bg.setFillStyle(0x1a1a2e);
        card.setScale(1);
        card.setDepth(0);
      }
    });
  }

  private createStartButton(centerX: number, centerY: number) {
    const buttonBg = this.add.rectangle(centerX, centerY + 230, 220, 60, 0x6b4c9a)
      .setStrokeStyle(3, 0x9d7cd8)
      .setInteractive({ useHandCursor: true });

    this.add.text(centerX, centerY + 230, '开始冒险', {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x7b5caa);
      buttonBg.setScale(1.05);
    });
    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x6b4c9a);
      buttonBg.setScale(1);
    });
    buttonBg.on('pointerdown', () => {
      this.cameras.main.fade(800, 0, 0, 0);
      this.time.delayedCall(800, () => {
        this.scene.start('DungeonScene', { hero: this.selectedHero });
      });
    });
  }
}
