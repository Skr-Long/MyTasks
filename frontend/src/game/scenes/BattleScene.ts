import Phaser from 'phaser';
import { StickFigure } from '../objects/StickFigure';
import { Enemy } from '../objects/Enemy';
import { HeroType } from '../../shared/GameConfig';

export class BattleScene extends Phaser.Scene {
  private player!: StickFigure;
  private enemies: Enemy[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private skillKey!: Phaser.Input.Keyboard.Key;
  private leftKey!: Phaser.Input.Keyboard.Key;
  private rightKey!: Phaser.Input.Keyboard.Key;
  private hpBar!: Phaser.GameObjects.Graphics;
  private comboText!: Phaser.GameObjects.Text;
  private isPaused: boolean = false;
  private ground!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('BattleScene');
  }

  create(data: { hero: HeroType }) {
    this.cameras.main.setBounds(0, 0, 2500, 720);
    this.physics.world.setBounds(0, 0, 2500, 720);

    this.createBackground();
    this.createGround();

    this.player = new StickFigure(this, 200, 500, data.hero);
    this.add.existing(this.player);

    this.spawnEnemies();
    this.createUI();
    this.setupInput();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.fadeIn(1000);
  }

  private createBackground() {
    const graphics = this.add.graphics();
    
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 2500, 720);

    for (let i = 0; i < 15; i++) {
      graphics.fillStyle(0x2a2a4a, 1);
      graphics.beginPath();
      graphics.moveTo(i * 180, 550);
      graphics.lineTo(i * 180 + 90, 350);
      graphics.lineTo(i * 180 + 180, 550);
      graphics.closePath();
      graphics.fillPath();
    }

    for (let i = 0; i < 30; i++) {
      const x = i * 90 + Math.random() * 30;
      graphics.fillStyle(0x1a3a1a, 1);
      graphics.fillTriangle(x, 480, x - 20, 530, x + 20, 530);
      graphics.fillTriangle(x, 500, x - 15, 540, x + 15, 540);
    }

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 2500;
      const y = Math.random() * 300;
      const size = Math.random() * 2 + 1;
      graphics.fillStyle(0xffd700, Math.random() * 0.4 + 0.2);
      graphics.fillCircle(x, y, size);
    }
  }

  private createGround() {
    this.ground = this.physics.add.staticGroup();
    
    for (let i = 0; i < 25; i++) {
      const platform = this.add.rectangle(i * 100 + 50, 650, 100, 40, 0x3a5a3a);
      this.ground.add(platform);
    }

    this.physics.add.collider(this.player, this.ground);
  }

  private spawnEnemies() {
    const enemyPositions = [
      { x: 600, y: 500, type: 'normal' as const },
      { x: 900, y: 500, type: 'normal' as const },
      { x: 1200, y: 500, type: 'elite' as const },
      { x: 1600, y: 500, type: 'boss' as const }
    ];

    enemyPositions.forEach(pos => {
      const enemy = new Enemy(this, pos.x, pos.y, pos.type);
      this.add.existing(enemy);
      this.enemies.push(enemy);
      
      this.physics.add.collider(enemy, this.ground);
    });
  }

  private createUI() {
    this.hpBar = this.add.graphics();
    this.hpBar.setScrollFactor(0);

    const title = this.add.text(640, 30, '大乱水浒 - 战斗', {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0);

    this.comboText = this.add.text(640, 80, '', {
      fontSize: '36px',
      color: '#ffcc00',
      fontStyle: 'bold',
      stroke: '#8b0000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(20, 20, 'WASD: 移动 | J: 攻击 | K: 技能 | L: 跳跃', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setScrollFactor(0);
  }

  private upKeyW!: Phaser.Input.Keyboard.Key;
  private upKeyL!: Phaser.Input.Keyboard.Key;

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.upKeyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.upKeyL = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.skillKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);
  }

  update(time: number, delta: number) {
    if (this.isPaused) return;

    this.handlePlayerInput();
    this.player.update(time, delta);

    this.enemies.forEach((enemy, index) => {
      if (!enemy.active) {
        this.enemies.splice(index, 1);
        return;
      }
      enemy.update(time, delta, this.player);
      this.checkEnemyAttack(enemy);
    });

    this.updateUI();
    this.checkVictory();
  }

  private handlePlayerInput() {
    if (this.leftKey.isDown) {
      this.player.moveLeft();
    } else if (this.rightKey.isDown) {
      this.player.moveRight();
    } else {
      this.player.stopMoving();
    }

    if (Phaser.Input.Keyboard.JustDown(this.upKeyW) || 
        Phaser.Input.Keyboard.JustDown(this.upKeyL) || 
        Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.player.jump();
    }

    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      if (this.player.attack()) {
        this.checkPlayerAttackHit();
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.skillKey)) {
      if (this.player.useSkill()) {
        this.checkPlayerSkillHit();
      }
    }
  }

  private checkPlayerAttackHit() {
    const hitbox = this.player.getAttackHitbox();
    const baseDamage = 15;
    const comboBonus = Math.min(this.player.getComboCount() * 0.1, 0.5);
    const damage = Math.floor(baseDamage * (1 + comboBonus));

    this.enemies.forEach(enemy => {
      const enemyBounds = enemy.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemyBounds)) {
        if (enemy.takeDamage(damage)) {
          this.createDeathEffect(enemy.x, enemy.y);
          enemy.destroy();
        }
      }
    });
  }

  private checkPlayerSkillHit() {
    const hitbox = this.player.getSkillHitbox();
    const damage = 50;

    this.enemies.forEach(enemy => {
      const enemyBounds = enemy.getBounds();
      if (Phaser.Geom.Intersects.CircleToRectangle(hitbox, enemyBounds)) {
        if (enemy.takeDamage(damage)) {
          this.createDeathEffect(enemy.x, enemy.y);
          enemy.destroy();
        }
      }
    });
  }

  private checkEnemyAttack(enemy: Enemy) {
    if (enemy.canAttack()) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      if (distance < 80) {
        if (this.player.takeDamage(enemy.getDamage())) {
          this.gameOver();
        }
      }
    }
  }

  private createDeathEffect(x: number, y: number) {
    const effect = this.add.graphics();
    effect.fillStyle(0xff8844, 1);
    
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particleX = x + Math.cos(angle) * 20;
      const particleY = y + Math.sin(angle) * 20;
      effect.fillCircle(particleX, particleY, 8);
    }

    this.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => effect.destroy()
    });
  }

  private updateUI() {
    this.hpBar.clear();

    this.hpBar.fillStyle(0x333333, 1);
    this.hpBar.fillRect(20, 60, 300, 30);

    const hpPercent = this.player.getHp() / this.player.getMaxHp();
    const hpColor = hpPercent > 0.5 ? 0x4ade80 : hpPercent > 0.25 ? 0xfbbf24 : 0xef4444;
    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRect(20, 60, 300 * hpPercent, 30);

    this.hpBar.lineStyle(3, 0xffffff, 1);
    this.hpBar.strokeRect(20, 60, 300, 30);

    this.add.text(170, 75, `${Math.ceil(this.player.getHp())} / ${this.player.getMaxHp()}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    const combo = this.player.getComboCount();
    if (combo > 1) {
      this.comboText.setText(`${combo} 连击!`);
      this.comboText.setAlpha(1);
      this.comboText.setScale(1 + Math.sin(this.time.now * 0.01) * 0.1);
    } else {
      this.comboText.setAlpha(0);
    }
  }

  private checkVictory() {
    if (this.enemies.length === 0 || this.enemies.every(e => !e.active)) {
      this.isPaused = true;
      this.showVictory();
    }
  }

  private showVictory() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.cameras.main.fade(500);
    
    this.time.delayedCall(500, () => {
      this.add.rectangle(centerX, centerY, 450, 280, 0x1a1a2e, 0.95)
        .setStrokeStyle(4, 0xffd700)
        .setScrollFactor(0);

      this.add.text(centerX, centerY - 70, '胜利!', {
        fontSize: '56px',
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#8b0000',
        strokeThickness: 4
      }).setOrigin(0.5).setScrollFactor(0);

      this.add.text(centerX, centerY, '所有敌人已被击败!', {
        fontSize: '22px',
        color: '#c49df0'
      }).setOrigin(0.5).setScrollFactor(0);

      const continueButton = this.add.rectangle(centerX, centerY + 70, 200, 55, 0x6b4c9a)
        .setStrokeStyle(3, 0x9d7cd8)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);

      this.add.text(centerX, centerY + 70, '继续', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5).setScrollFactor(0);

      continueButton.on('pointerdown', () => {
        this.scene.start('DungeonScene');
      });
    });
  }

  private gameOver() {
    this.isPaused = true;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.cameras.main.fade(500, 100, 0, 0);
    
    this.time.delayedCall(500, () => {
      this.add.rectangle(centerX, centerY, 450, 280, 0x2a0a0a, 0.95)
        .setStrokeStyle(4, 0xff4444)
        .setScrollFactor(0);

      this.add.text(centerX, centerY - 70, '失败', {
        fontSize: '56px',
        color: '#ff4444',
        fontStyle: 'bold',
        stroke: '#440000',
        strokeThickness: 4
      }).setOrigin(0.5).setScrollFactor(0);

      this.add.text(centerX, centerY, '英雄倒下了...', {
        fontSize: '22px',
        color: '#ff8888'
      }).setOrigin(0.5).setScrollFactor(0);

      const retryButton = this.add.rectangle(centerX, centerY + 70, 200, 55, 0x993333)
        .setStrokeStyle(3, 0xff6666)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);

      this.add.text(centerX, centerY + 70, '重新挑战', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5).setScrollFactor(0);

      retryButton.on('pointerdown', () => {
        this.scene.restart();
      });
    });
  }
}
