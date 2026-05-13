import Phaser from 'phaser';

export class Enemy extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  declare body: Phaser.Physics.Arcade.Body;
  private hp: number;
  private maxHp: number;
  private damage: number;
  private enemyType: 'normal' | 'elite' | 'boss';
  private aiState: 'idle' | 'patrol' | 'chase' | 'attack' | 'hurt' = 'idle';
  private attackCooldown: number = 0;
  private patrolDirection: number = 1;
  private patrolTimer: number = 0;
  private target: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, type: 'normal' | 'elite' | 'boss' = 'normal') {
    super(scene, x, y);
    this.enemyType = type;
    
    switch (type) {
      case 'boss':
        this.hp = 500;
        this.maxHp = 500;
        this.damage = 30;
        break;
      case 'elite':
        this.hp = 200;
        this.maxHp = 200;
        this.damage = 20;
        break;
      default:
        this.hp = 100;
        this.maxHp = 100;
        this.damage = 10;
    }

    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    scene.physics.world.enable(this);
    this.body = this.body as Phaser.Physics.Arcade.Body;
    const size = type === 'boss' ? 80 : type === 'elite' ? 50 : 40;
    this.body.setSize(size, size + 20);
    this.body.setOffset(-size / 2, -(size + 10));
    this.body.setCollideWorldBounds(true);

    this.setSize(size, size + 20);
    this.drawEnemy();
  }

  private drawEnemy() {
    this.graphics.clear();
    
    let color: number;
    let size: number;
    
    switch (this.enemyType) {
      case 'boss':
        color = 0xff4444;
        size = 50;
        break;
      case 'elite':
        color = 0xff8844;
        size = 35;
        break;
      default:
        color = 0x88ff88;
        size = 25;
    }

    this.graphics.lineStyle(3, color, 1);

    this.graphics.save();

    this.graphics.strokeCircle(0, -size, size * 0.6);

    this.graphics.lineBetween(0, -size * 0.4, 0, size * 0.4);

    const time = this.scene.time.now * 0.005;
    const armSwing = Math.sin(time) * 10;
    this.graphics.lineBetween(0, -size * 0.2, -size * 0.8 + armSwing, size * 0.1);
    this.graphics.lineBetween(0, -size * 0.2, size * 0.8 - armSwing, size * 0.1);

    const legSwing = Math.sin(time) * 8;
    this.graphics.lineBetween(0, size * 0.4, -size * 0.5 - legSwing, size);
    this.graphics.lineBetween(0, size * 0.4, size * 0.5 + legSwing, size);

    if (this.enemyType === 'boss') {
      this.graphics.lineBetween(-size * 0.5, -size * 1.2, -size * 0.3, -size * 0.8);
      this.graphics.lineBetween(size * 0.5, -size * 1.2, size * 0.3, -size * 0.8);
      
      this.graphics.fillStyle(0xff0000, 1);
      this.graphics.fillCircle(-size * 0.25, -size * 0.6, 4);
      this.graphics.fillCircle(size * 0.25, -size * 0.6, 4);
    }

    this.graphics.restore();

    const hpBarWidth = size * 1.5;
    const hpPercent = this.hp / this.maxHp;
    this.graphics.fillStyle(0x333333, 1);
    this.graphics.fillRect(-hpBarWidth / 2, -size - 30, hpBarWidth, 6);
    this.graphics.fillStyle(0xff4444, 1);
    this.graphics.fillRect(-hpBarWidth / 2, -size - 30, hpBarWidth * hpPercent, 6);
  }

  update(_time: number, delta: number, player?: Phaser.GameObjects.Container) {
    if (player) {
      this.target = player;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    if (this.target) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
      
      if (distance < 60) {
        this.aiState = 'attack';
        this.body.setVelocityX(0);
        if (this.attackCooldown <= 0) {
          this.attackCooldown = this.enemyType === 'boss' ? 1500 : 1000;
        }
      } else if (distance < 300) {
        this.aiState = 'chase';
        const speed = this.enemyType === 'boss' ? 80 : this.enemyType === 'elite' ? 100 : 60;
        if (this.target.x < this.x) {
          this.body.setVelocityX(-speed);
        } else {
          this.body.setVelocityX(speed);
        }
      } else {
        this.aiState = 'patrol';
        this.patrolTimer += delta;
        if (this.patrolTimer > 2000) {
          this.patrolDirection *= -1;
          this.patrolTimer = 0;
        }
        this.body.setVelocityX(this.patrolDirection * 40);
      }
    }

    this.drawEnemy();
  }

  takeDamage(damage: number): boolean {
    this.hp = Math.max(0, this.hp - damage);
    this.aiState = 'hurt';
    
    this.scene.time.delayedCall(100, () => {
      if (this.hp > 0) {
        this.aiState = 'chase';
      }
    });

    this.body.setVelocityX(this.target && this.target.x < this.x ? 100 : -100);

    const damageText = this.scene.add.text(this.x, this.y - 50, `-${damage}`, {
      fontSize: '20px',
      color: '#ff4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: damageText,
      y: this.y - 100,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy()
    });

    return this.hp <= 0;
  }

  getDamage(): number {
    return this.damage;
  }

  canAttack(): boolean {
    return this.attackCooldown <= 0 && this.aiState === 'attack';
  }

  getType(): string {
    return this.enemyType;
  }
}
