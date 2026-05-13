import Phaser from 'phaser';
import { HeroTypes, HeroType, QualityColors } from '../../shared/GameConfig';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedHero: HeroType = HeroTypes.WU_SONG;
  private heroCards: Map<HeroType, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super('CharacterSelectScene');
  }

  create(data: { user?: any }) {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add.text(centerX, 80, '选择你的英雄', {
      fontSize: '36px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.createHeroCards(centerX, centerY);

    const startButton = this.add.text(centerX, centerY + 200, '开始冒险', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#44aa44',
      padding: { x: 40, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startButton.on('pointerdown', () => {
      this.scene.start('DungeonScene', { hero: this.selectedHero });
    });
    startButton.on('pointerover', () => startButton.setBackgroundColor('#55bb55'));
    startButton.on('pointerout', () => startButton.setBackgroundColor('#44aa44'));

    this.selectHero(this.selectedHero);
  }

  private createHeroCards(centerX: number, centerY: number) {
    const heroes = [
      { type: HeroTypes.WU_SONG, name: '武松', title: '天伤星', quality: 'UR', desc: '均衡型，醉拳连击' },
      { type: HeroTypes.LU_ZHI_SHEN, name: '鲁智深', title: '天孤星', quality: 'UR', desc: '力量型，金刚护体' },
      { type: HeroTypes.LIN_CHONG, name: '林冲', title: '天雄星', quality: 'SSR', desc: '敏捷型，林家枪法' }
    ];

    heroes.forEach((hero, index) => {
      const x = centerX + (index - 1) * 280;
      const y = centerY - 50;
      
      const card = this.createHeroCard(x, y, hero);
      this.heroCards.set(hero.type, card);
    });
  }

  private createHeroCard(x: number, y: number, hero: any): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const color = QualityColors[hero.quality as keyof typeof QualityColors];

    const bg = this.add.rectangle(0, 0, 240, 320, 0x2a2a4a).setStrokeStyle(3, color);
    container.add(bg);

    const qualityTag = this.add.text(0, -130, `${hero.quality}`, {
      fontSize: '16px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(qualityTag);

    const heroGraphics = this.add.graphics();
    this.drawStickFigure(heroGraphics, 0, -30, color, hero.type);
    container.add(heroGraphics);

    const nameText = this.add.text(0, 80, hero.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(nameText);

    const titleText = this.add.text(0, 110, hero.title, {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    container.add(titleText);

    const descText = this.add.text(0, 140, hero.desc, {
      fontSize: '14px',
      color: '#888888',
      wordWrap: { width: 200 }
    }).setOrigin(0.5);
    container.add(descText);

    container.setSize(240, 320);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.selectHero(hero.type));

    return container;
  }

  private drawStickFigure(graphics: Phaser.GameObjects.Graphics, x: number, y: number, color: number, type: string) {
    graphics.clear();
    graphics.lineStyle(4, color, 1);

    graphics.strokeCircle(x, y - 40, 15);

    graphics.lineBetween(x, y - 25, x, y + 20);

    if (type === HeroTypes.LU_ZHI_SHEN) {
      graphics.lineStyle(6, color, 1);
      graphics.lineBetween(x - 30, y - 10, x + 30, y - 10);
      graphics.lineStyle(4, color, 1);
    } else {
      graphics.lineBetween(x, y - 15, x - 25, y);
      graphics.lineBetween(x, y - 15, x + 25, y);
    }

    graphics.lineBetween(x, y + 20, x - 20, y + 60);
    graphics.lineBetween(x, y + 20, x + 20, y + 60);

    if (type === HeroTypes.WU_SONG) {
      graphics.lineStyle(3, 0xaaaaaa, 1);
      graphics.lineBetween(x + 25, y, x + 45, y - 20);
      graphics.lineBetween(x - 25, y, x - 45, y - 20);
    } else if (type === HeroTypes.LIN_CHONG) {
      graphics.lineStyle(3, 0xaaaaaa, 1);
      graphics.lineBetween(x, y - 25, x, y - 80);
      graphics.lineBetween(x - 8, y - 70, x, y - 80);
      graphics.lineBetween(x + 8, y - 70, x, y - 80);
    } else if (type === HeroTypes.LU_ZHI_SHEN) {
      graphics.lineStyle(5, 0x8B4513, 1);
      graphics.lineBetween(x + 35, y - 30, x + 35, y + 30);
      graphics.strokeCircle(x + 35, y - 35, 8);
    }
  }

  private selectHero(heroType: HeroType) {
    this.selectedHero = heroType;

    this.heroCards.forEach((card, type) => {
      const bg = card.getAt(0) as Phaser.GameObjects.Rectangle;
      if (type === heroType) {
        bg.setFillStyle(0x3a3a6a);
        card.setScale(1.05);
      } else {
        bg.setFillStyle(0x2a2a4a);
        card.setScale(1);
      }
    });
  }
}
