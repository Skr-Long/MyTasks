import Phaser from 'phaser'
import { TowerConfig, TowerConfigData } from '../config/TowerConfig'
import { CoordinateMapper } from '../utils/CoordinateMapper'
import { GameConfig } from '../config/GameConfig'

export class Tower {
  private scene: Phaser.Scene
  private gridX: number
  private gridY: number
  private towerType: string
  private config: TowerConfigData
  private level: number = 1
  private sprite: Phaser.GameObjects.Sprite
  private lastAttackTime: number = 0
  private rangeCircle: Phaser.GameObjects.Arc

  constructor(scene: Phaser.Scene, gridX: number, gridY: number, towerType: string) {
    this.scene = scene
    this.gridX = gridX
    this.gridY = gridY
    this.towerType = towerType
    this.config = TowerConfig[towerType]

    const worldPos = CoordinateMapper.gridToWorld(gridX, gridY)
    this.sprite = scene.add.sprite(worldPos.x, worldPos.y, this.getTowerTexture())
    this.sprite.setDepth(10)
    this.sprite.setScale(0.8)

    this.rangeCircle = scene.add.circle(worldPos.x, worldPos.y, this.getRange() * GameConfig.TILE_SIZE, 0x00ff00, 0.1)
    this.rangeCircle.setStrokeStyle(1, 0x00ff00, 0.3)
    this.rangeCircle.setVisible(false)
    this.rangeCircle.setDepth(5)

    this.sprite.setInteractive()
    this.sprite.on('pointerover', () => this.rangeCircle.setVisible(true))
    this.sprite.on('pointerout', () => this.rangeCircle.setVisible(false))
  }

  private getTowerTexture(): string {
    const sectColors: Record<string, number> = {
      shaolin: 0xFFD700,
      wudang: 0x4169E1,
      tangmen: 0x800080,
      emei: 0xFF69B4,
      gaibang: 0x8B4513,
    }

    const textureKey = `tower_${this.towerType}`
    if (!this.scene.textures.exists(textureKey)) {
      const graphics = this.scene.make.graphics() as Phaser.GameObjects.Graphics
      graphics.fillStyle(sectColors[this.config.sect] || 0x808080)
      graphics.beginPath()
      graphics.moveTo(0, -25)
      graphics.lineTo(20, 15)
      graphics.lineTo(-20, 15)
      graphics.closePath()
      graphics.fillPath()
      graphics.fillStyle(0x333333)
      graphics.fillRect(-15, 15, 30, 10)
      graphics.generateTexture(textureKey, 50, 50)
      graphics.destroy()
    }
    return textureKey
  }

  canAttack(currentTime: number): boolean {
    return currentTime - this.lastAttackTime >= this.getAttackSpeed()
  }

  attack(currentTime: number): void {
    this.lastAttackTime = currentTime
    this.sprite.setScale(0.9)
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 0.8,
      duration: 100,
      ease: 'Power2'
    })
  }

  upgrade(): boolean {
    if (this.level >= 4) return false
    this.level++
    this.sprite.setTint(0xFFD700)
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint()
    })
    this.rangeCircle.setRadius(this.getRange() * GameConfig.TILE_SIZE)
    return true
  }

  getUpgradeCost(): number {
    if (this.level >= 4) return 0
    return this.config.upgrades[this.level - 1].cost
  }

  getDamage(): number {
    let damage = this.config.damage
    for (let i = 0; i < this.level - 1; i++) {
      damage += this.config.upgrades[i].damage || 0
    }
    return damage
  }

  getRange(): number {
    let range = this.config.range
    for (let i = 0; i < this.level - 1; i++) {
      range += this.config.upgrades[i].range || 0
    }
    return range
  }

  getAttackSpeed(): number {
    let speed = this.config.attackSpeed
    for (let i = 0; i < this.level - 1; i++) {
      speed -= this.config.upgrades[i].attackSpeed || 0
    }
    return Math.max(200, speed)
  }

  getGridPosition(): { x: number; y: number } {
    return { x: this.gridX, y: this.gridY }
  }

  getWorldPosition(): { x: number; y: number } {
    return CoordinateMapper.gridToWorld(this.gridX, this.gridY)
  }

  getLevel(): number {
    return this.level
  }

  getType(): string {
    return this.towerType
  }

  getConfig(): TowerConfigData {
    return this.config
  }

  destroy(): void {
    this.sprite.destroy()
    this.rangeCircle.destroy()
  }
}
