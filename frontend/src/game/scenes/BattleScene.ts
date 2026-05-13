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
  private hpBar!: Phaser.GameObjects.Graphics;
  private comboText!: Phaser.GameObjects.Text;
  private isPaused: boolean = false;
  private cameraTargetX: number = 0;

  constructor() {
    super('BattleScene');
  }

  create(data: { hero: HeroType }) {
    this.cameras.main.setBounds(0, 0, 2000, 720);
    this.physics.world.setBounds(0, 0, 2000, 720);

    this.createBackground();
    this.createGround();

    this.player = new StickFigure(this, 200, 500, data.hero);
    this.add.existing(this.player);

    this.spawnEnemies();
    this.createUI();
    this.setupInput();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  private createBackground() {
    const graphics = this.add.graphics();
    
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 2000, 720);

    for (let i = 0; i < 10; i++) {
      graphics.fillStyle(0x2a2a4a, 1);
      graphics.beginPath();
      graphics.moveTo(i * 250, 500);
      graphics.lineTo(i * 250 + 125, 300);
      graphics.lineTo(i * 250 + 250, 500);
      graphics.closePath();
      graphics.fillPath();
    }

    for (let i = 0; i < 20; i++) {
      const x = i * 120 + Math.random() * 50;
      graphics.fillStyle(0x1a3a1a, 1);
      graphics.fillTriangle(x, 450, x - 25, 500, x + 25, 500);
      graphics.fillTriangle(x, 470, x - 20, 510, x + 20, 510);
    }
  }

  private createGround() {
    const ground = this.physics.add.staticGroup();
    
    for (let i = 0; i < 20; i++) {
      const platform = this.add.rectangle(i * 100 + 50, 650, 100, 40, 0x3a5a3a);
      ground.add(platform);
    }

    this.physics.add.collider(this.player, ground);
  }

  private spawnEnemies() {
    const enemyPositions = [
      { x: 600, y: 550, type: 'normal' as const },
      { x: 900, y: 550, type: 'normal' as const },
      { x: 1200, y: 550, type: 'elite' as const },
      { x: 1500, y: 550, type: 'boss' as const }
    ];

    enemyPositions.forEach(pos => {
      const enemy = new Enemy(this, pos.x, pos.y, pos.type);
      this.add.existing(enemy);
      this.enemies.push(enemy);
      
      this.physics.add.collider(enemy, this.physics.world.bounds);
    });
  }

  private createUI() {
    this.hpBar = this.add.graphics();
    this.hpBar.setScrollFactor(0);

    this.comboText = this.add.text(640, 100, '', {
      fontSize: '32px',
      color: '#ffcc00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(20, 20, 'A/D: 移动 | W: 跳跃 | J: 攻击 | K: 技能', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setScrollFactor(0);
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
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
    if (this.cursors.left.isDown || this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown || this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
      this.player.moveRight();
    } else {
      this.player.stopMoving();
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
        Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W))) {
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
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemy.getBounds())) {
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
      if (Phaser.Geom.Intersects.CircleToRectangle(hitbox, enemy.getBounds())) {
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
    this.hpBar.fillRect(20, 60, 300, 25);

    const hpPercent = this.player.getHp() / this.player.getMaxHp();
    const hpColor = hpPercent > 0.5 ? 0x44ff44 : hpPercent > 0.25 ? 0xffff44 : 0xff4444;
    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRect(20, 60, 300 * hpPercent, 25);

    this.hpBar.lineStyle(2, 0xffffff, 1);
    this.hpBar.strokeRect(20, 60, 300, 25);

    this.hpBar.fillStyle(0xffffff, 1);
    const hpText = this.add.text(170, 72, `${this.player.getHp()}/${this.player.getMaxHp()}`, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    this.time.delayedCall(1, () => hpText.destroy());

    const combo = this.player.getComboCount();
    if (combo > 1) {
      this.comboText.setText(`${combo} 连击!`);
      this.comboText.setAlpha(1);
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

    this.add.rectangle(centerX, centerY, 400, 200, 0x000000, 0.8)
      .setScrollFactor(0);

    this.add.text(centerX, centerY - 50, '胜利!', {
      fontSize: '48px',
      color: '#ffcc00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    const continueButton = this.add.text(centerX, centerY + 30, '继续', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#4488ff',
      padding: { x: 30, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

    continueButton.on('pointerdown', () => {
      this.scene.start('DungeonScene');
    });
  }

  private gameOver() {
    this.isPaused = true;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add.rectangle(centerX, centerY, 400, 200, 0x000000, 0.8)
      .setScrollFactor(0);

    this.add.text(centerX, centerY - 50, '失败', {
      fontSize: '48px',
      color: '#ff4444',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    const retryButton = this.add.text(centerX, centerY + 30, '重试', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#ff4444',
      padding: { x: 30, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

    retryButton.on('pointerdown', () => {
      this.scene.restart();
    });
  }
}
