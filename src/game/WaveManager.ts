import Phaser from 'phaser'
import { Enemy } from './Enemy'
import { GameMap } from './GameMap'
import { EventBus, GameEvents } from '../utils/EventBus'

export class WaveManager {
  private scene: Phaser.Scene
  private gameMap: GameMap
  private enemies: Enemy[] = []
  private currentWave: number = 0
  private waveInProgress: boolean = false
  private enemiesToSpawn: string[] = []
  private spawnTimer: Phaser.Time.TimerEvent | null = null
  private enemySpawnIndex: number = 0

  constructor(scene: Phaser.Scene, gameMap: GameMap) {
    this.scene = scene
    this.gameMap = gameMap
  }

  startWave(waveNumber: number): void {
    if (this.waveInProgress) return

    this.currentWave = waveNumber
    this.waveInProgress = true
    this.enemySpawnIndex = 0
    this.enemiesToSpawn = this.generateWaveEnemies(waveNumber)

    EventBus.emit(GameEvents.WAVE_STARTED, waveNumber)

    this.spawnTimer = this.scene.time.addEvent({
      delay: 800,
      callback: this.spawnNextEnemy,
      callbackScope: this,
      loop: true
    })
  }

  private generateWaveEnemies(waveNumber: number): string[] {
    const enemies: string[] = []
    const baseCount = 3 + Math.floor(waveNumber * 1.5)

    for (let i = 0; i < baseCount; i++) {
      enemies.push('cultist')
    }

    if (waveNumber >= 3) {
      const swordsmanCount = Math.floor(waveNumber / 2)
      for (let i = 0; i < swordsmanCount; i++) {
        enemies.push('swordsman')
      }
    }

    if (waveNumber >= 5) {
      const assassinCount = Math.floor(waveNumber / 3)
      for (let i = 0; i < assassinCount; i++) {
        enemies.push('assassin')
      }
    }

    if (waveNumber >= 7) {
      const shieldmanCount = Math.floor(waveNumber / 4)
      for (let i = 0; i < shieldmanCount; i++) {
        enemies.push('shieldman')
      }
    }

    if (waveNumber >= 10) {
      const mageCount = Math.floor(waveNumber / 5)
      for (let i = 0; i < mageCount; i++) {
        enemies.push('mage')
      }
    }

    if (waveNumber >= 15 && waveNumber % 5 === 0) {
      enemies.push('boss')
    }

    return enemies.sort(() => Math.random() - 0.5)
  }

  private spawnNextEnemy(): void {
    if (this.enemySpawnIndex >= this.enemiesToSpawn.length) {
      if (this.spawnTimer) {
        this.spawnTimer.destroy()
        this.spawnTimer = null
      }
      return
    }

    const enemyType = this.enemiesToSpawn[this.enemySpawnIndex]
    const enemy = new Enemy(this.scene, enemyType, this.gameMap.getPath())
    this.enemies.push(enemy)
    EventBus.emit(GameEvents.ENEMY_SPAWNED, enemy)
    this.enemySpawnIndex++
  }

  update(deltaTime: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      enemy.update(deltaTime)

      if (enemy.getIsDead()) {
        EventBus.emit(GameEvents.ENEMY_KILLED, enemy)
        enemy.destroy()
        this.enemies.splice(i, 1)
      } else if (enemy.getReachedEnd()) {
        EventBus.emit(GameEvents.ENEMY_REACHED_END, enemy)
        enemy.destroy()
        this.enemies.splice(i, 1)
      }
    }

    if (this.waveInProgress && 
        this.enemies.length === 0 && 
        this.enemySpawnIndex >= this.enemiesToSpawn.length) {
      this.waveInProgress = false
      EventBus.emit(GameEvents.WAVE_ENDED, this.currentWave)
    }
  }

  getEnemies(): Enemy[] {
    return this.enemies
  }

  getCurrentWave(): number {
    return this.currentWave
  }

  isWaveInProgress(): boolean {
    return this.waveInProgress
  }

  destroy(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy()
    }
    this.enemies.forEach(enemy => enemy.destroy())
    this.enemies = []
  }
}
