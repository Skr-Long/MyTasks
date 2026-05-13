import Phaser from 'phaser'
import { EnemyConfig, EnemyConfigData } from '../config/EnemyConfig'
import { CoordinateMapper } from '../utils/CoordinateMapper'

export class Enemy {
  private scene: Phaser.Scene
  private enemyType: string
  private config: EnemyConfigData
  private path: { x: number; y: number }[]
  private currentPathIndex: number = 0
  private sprite: Phaser.GameObjects.Sprite
  private healthBar: Phaser.GameObjects.Graphics
  private currentHealth: number
  private maxHealth: number
  private speed: number
  private isDead: boolean = false
  private reachedEnd: boolean = false

  constructor(scene: Phaser.Scene, enemyType: string, path: { x: number; y: number }[]) {
    this.scene = scene
    this.enemyType = enemyType
    this.config = EnemyConfig[enemyType]
    this.path = path
    this.maxHealth = this.config.health
    this.currentHealth = this.maxHealth
    this.speed = this.config.speed

    const startPos = CoordinateMapper.gridToWorld(path[0].x, path[0].y)
    this.sprite = scene.add.sprite(startPos.x, startPos.y, this.getEnemyTexture())
    this.sprite.setDepth(20)
    this.sprite.setScale(0.7)

    this.healthBar = scene.add.graphics()
    this.healthBar.setDepth(25)
    this.updateHealthBar()
  }

  private getEnemyTexture(): string {
    const typeColors: Record<string, number> = {
      normal: 0xDC143C,
      fast: 0x9400D3,
      tank: 0x2F4F4F,
      ranged: 0xFF4500,
      boss: 0x8B0000,
    }

    const textureKey = `enemy_${this.enemyType}`
    if (!this.scene.textures.exists(textureKey)) {
      const graphics = this.scene.make.graphics() as Phaser.GameObjects.Graphics
      graphics.fillStyle(typeColors[this.config.type] || 0xDC143C)
      graphics.fillCircle(0, 0, 20)
      graphics.fillStyle(0x000000)
      graphics.fillCircle(-8, -5, 4)
      graphics.fillCircle(8, -5, 4)
      graphics.generateTexture(textureKey, 40, 40)
      graphics.destroy()
    }
    return textureKey
  }

  update(deltaTime: number): void {
    if (this.isDead || this.reachedEnd) return

    if (this.currentPathIndex < this.path.length) {
      const target = CoordinateMapper.gridToWorld(
        this.path[this.currentPathIndex].x,
        this.path[this.currentPathIndex].y
      )

      const dx = target.x - this.sprite.x
      const dy = target.y - this.sprite.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 5) {
        this.currentPathIndex++
      } else {
        const moveSpeed = this.speed * (deltaTime / 16) * 2
        this.sprite.x += (dx / distance) * moveSpeed
        this.sprite.y += (dy / distance) * moveSpeed
      }

      this.updateHealthBar()
    } else {
      this.reachedEnd = true
    }
  }

  private updateHealthBar(): void {
    this.healthBar.clear()
    const barWidth = 40
    const barHeight = 6
    const x = this.sprite.x - barWidth / 2
    const y = this.sprite.y - 30

    this.healthBar.fillStyle(0x333333)
    this.healthBar.fillRect(x, y, barWidth, barHeight)

    const healthPercent = this.currentHealth / this.maxHealth
    const healthColor = healthPercent > 0.5 ? 0x00FF00 : healthPercent > 0.25 ? 0xFFFF00 : 0xFF0000
    this.healthBar.fillStyle(healthColor)
    this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight)
  }

  takeDamage(damage: number): void {
    this.currentHealth -= damage
    this.sprite.setTint(0xFF0000)
    this.scene.time.delayedCall(100, () => {
      if (this.sprite.active) {
        this.sprite.clearTint()
      }
    })

    if (this.currentHealth <= 0) {
      this.isDead = true
    }
  }

  getReward(): number {
    return this.config.reward
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y }
  }

  getIsDead(): boolean {
    return this.isDead
  }

  getReachedEnd(): boolean {
    return this.reachedEnd
  }

  getType(): string {
    return this.enemyType
  }

  destroy(): void {
    this.sprite.destroy()
    this.healthBar.destroy()
  }
}
