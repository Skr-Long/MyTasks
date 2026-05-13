import Phaser from 'phaser';
import { GameConfig, HeroTypes, HeroType, QualityColors } from '../../shared/GameConfig';

export class StickFigure extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  private heroType: HeroType;
  private body: Phaser.Physics.Arcade.Body;
  private hp: number = 100;
  private maxHp: number = 100;
  private isAttacking: boolean = false;
  private facingRight: boolean = true;
  private attackCooldown: number = 0;
  private skillCooldown: number = 0;
  private comboCount: number = 0;
  private maxComboCount: number = 0;
  private comboTimer: number = 0;
  private animState: 'idle' | 'walk' | 'jump' | 'attack' | 'hurt' = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, heroType: HeroType) {
    super(scene, x, y);
    this.heroType = heroType;
    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    scene.physics.world.enable(this);
    this.body = this.body as Phaser.Physics.Arcade.Body;
    this.body.setSize(40, 100);
    this.body.setOffset(-20, -50);
    this.body.setCollideWorldBounds(true);

    this.setSize(60, 120);
    this.drawFigure();
  }

  private drawFigure() {
    this.graphics.clear();
    const color = this.heroType === HeroTypes.LIN_CHONG ? QualityColors.SSR : QualityColors.UR;
    
    const scaleX = this.facingRight ? 1 : -1;

    this.graphics.save();
    this.graphics.scaleX(scaleX);

    this.graphics.lineStyle(4, color, 1);

    this.graphics.strokeCircle(0, -40, 15);

    this.graphics.lineBetween(0, -25, 0, 20);

    if (this.heroType === HeroTypes.LU_ZHI_SHEN) {
      this.graphics.lineStyle(6, color, 1);
    }

    if (this.animState === 'attack') {
      this.graphics.lineBetween(0, -15, 30, -30);
      this.graphics.lineBetween(0, -15, -20, 10);
    } else if (this.animState === 'walk') {
      const time = this.scene.time.now * 0.01;
      const armSwing = Math.sin(time) * 15;
      this.graphics.lineBetween(0, -15, -25 + armSwing, 0);
      this.graphics.lineBetween(0, -15, 25 - armSwing, 0);
    } else {
      this.graphics.lineBetween(0, -15, -25, 0);
      this.graphics.lineBetween(0, -15, 25, 0);
    }

    if (this.animState === 'walk') {
      const time = this.scene.time.now * 0.01;
      const legSwing = Math.sin(time) * 10;
      this.graphics.lineBetween(0, 20, -15 - legSwing, 60);
      this.graphics.lineBetween(0, 20, 15 + legSwing, 60);
    } else if (this.animState === 'jump') {
      this.graphics.lineBetween(0, 20, -10, 50);
      this.graphics.lineBetween(0, 20, 10, 50);
    } else {
      this.graphics.lineBetween(0, 20, -15, 60);
      this.graphics.lineBetween(0, 20, 15, 60);
    }

    this.drawWeapon(color);
    this.graphics.restore();
  }

  private drawWeapon(color: number) {
    if (this.heroType === HeroTypes.WU_SONG) {
      this.graphics.lineStyle(3, 0xaaaaaa, 1);
      if (this.animState === 'attack') {
        this.graphics.lineBetween(30, -30, 55, -50);
        this.graphics.lineBetween(55, -50, 60, -45);
      } else {
        this.graphics.lineBetween(25, 0, 45, -20);
        this.graphics.lineBetween(-25, 0, -45, -20);
      }
    } else if (this.heroType === HeroTypes.LIN_CHONG) {
      this.graphics.lineStyle(3, 0xaaaaaa, 1);
      this.graphics.lineBetween(0, -25, 0, -90);
      this.graphics.triangle(0, -95, -8, -85, 8, -85);
    } else if (this.heroType === HeroTypes.LU_ZHI_SHEN) {
      this.graphics.lineStyle(5, 0x8B4513, 1);
      this.graphics.lineBetween(35, -30, 35, 40);
      this.graphics.strokeCircle(35, -35, 10);
    }
  }

  update(time: number, delta: number) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
    if (this.skillCooldown > 0) {
      this.skillCooldown -= delta;
    }
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }

    if (this.body.velocity.x !== 0 && this.body.blocked.down) {
      this.animState = 'walk';
    } else if (!this.body.blocked.down) {
      this.animState = 'jump';
    } else if (this.isAttacking) {
      this.animState = 'attack';
    } else {
      this.animState = 'idle';
    }

    this.drawFigure();
  }

  moveLeft() {
    this.body.setVelocityX(-GameConfig.PLAYER_SPEED);
    this.facingRight = false;
  }

  moveRight() {
    this.body.setVelocityX(GameConfig.PLAYER_SPEED);
    this.facingRight = true;
  }

  stopMoving() {
    this.body.setVelocityX(0);
  }

  jump() {
    if (this.body.blocked.down) {
      this.body.setVelocityY(GameConfig.JUMP_FORCE);
    }
  }

  attack(): boolean {
    if (this.attackCooldown <= 0 && !this.isAttacking) {
      this.isAttacking = true;
      this.attackCooldown = GameConfig.ATTACK_COOLDOWN;
      this.comboCount++;
      this.comboTimer = 800;
      
      if (this.comboCount > this.maxComboCount) {
        this.maxComboCount = this.comboCount;
      }

      const attackDuration = Math.max(200, 350 - this.comboCount * 30);
      
      this.scene.time.delayedCall(attackDuration, () => {
        this.isAttacking = false;
      });

      return true;
    }
    return false;
  }

  resetCombo() {
    this.comboCount = 0;
    this.maxComboCount = 0;
  }

  getMaxComboCount(): number { return this.maxComboCount; }

  useSkill(): boolean {
    if (this.skillCooldown <= 0) {
      this.skillCooldown = GameConfig.SKILL_COOLDOWN;
      this.createSkillEffect();
      return true;
    }
    return false;
  }

  private createSkillEffect() {
    const effect = this.scene.add.graphics();
    const color = this.heroType === HeroTypes.LIN_CHONG ? QualityColors.SSR : QualityColors.UR;
    
    if (this.heroType === HeroTypes.WU_SONG) {
      for (let i = 0; i < 8; i++) {
        effect.lineStyle(3, color, 1);
        const angle = (i / 8) * Math.PI * 2;
        effect.lineBetween(
          this.x + Math.cos(angle) * 30,
          this.y + Math.sin(angle) * 30,
          this.x + Math.cos(angle) * 80,
          this.y + Math.sin(angle) * 80
        );
      }
    } else if (this.heroType === HeroTypes.LU_ZHI_SHEN) {
      effect.fillStyle(color, 0.5);
      effect.fillCircle(this.x, this.y, 100);
    } else {
      effect.lineStyle(4, color, 1);
      for (let i = 0; i < 5; i++) {
        effect.lineBetween(this.x - 50 + i * 25, this.y - 60, this.x - 50 + i * 25, this.y + 40);
      }
    }

    this.scene.tweens.add({
      targets: effect,
      alpha: 0,
      duration: 500,
      onComplete: () => effect.destroy()
    });
  }

  takeDamage(damage: number) {
    this.hp = Math.max(0, this.hp - damage);
    this.animState = 'hurt';
    
    this.graphics.clear();
    this.graphics.lineStyle(6, 0xff4444, 1);
    this.graphics.strokeCircle(0, -40, 15);
    this.graphics.lineBetween(0, -25, 0, 20);

    this.scene.time.delayedCall(200, () => {
      this.drawFigure();
    });

    return this.hp <= 0;
  }

  getAttackHitbox(): Phaser.Geom.Rectangle {
    const range = this.heroType === HeroTypes.LU_ZHI_SHEN ? 80 : 60;
    return new Phaser.Geom.Rectangle(
      this.facingRight ? this.x : this.x - range,
      this.y - 50,
      range,
      100
    );
  }

  getSkillHitbox(): Phaser.Geom.Circle {
    return new Phaser.Geom.Circle(this.x, this.y, 100);
  }

  getHp(): number { return this.hp; }
  getMaxHp(): number { return this.maxHp; }
  getComboCount(): number { return this.comboCount; }
  isFacingRight(): boolean { return this.facingRight; }
  getHeroType(): HeroType { return this.heroType; }
  getAttackCooldownPercent(): number { return Math.max(0, this.attackCooldown / GameConfig.ATTACK_COOLDOWN); }
  getSkillCooldownPercent(): number { return Math.max(0, this.skillCooldown / GameConfig.SKILL_COOLDOWN); }
}
