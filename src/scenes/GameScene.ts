import Phaser from 'phaser'
import { GameConfig } from '../config/GameConfig'
import { GameMap } from '../game/GameMap'
import { Tower } from '../game/Tower'
import { WaveManager } from '../game/WaveManager'
import { CoordinateMapper } from '../utils/CoordinateMapper'
import { EventBus, GameEvents } from '../utils/EventBus'
import { TowerConfig } from '../config/TowerConfig'

export class GameScene extends Phaser.Scene {
  private gameMap!: GameMap
  private towers: Tower[] = []
  private waveManager!: WaveManager
  private gold: number = GameConfig.INITIAL_GOLD
  private lives: number = GameConfig.INITIAL_LIVES
  private selectedTowerType: string | null = null
  private goldText!: Phaser.GameObjects.Text
  private livesText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text
  private towerButtons!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    this.gameMap = new GameMap()
    this.gameMap.draw(this)

    this.waveManager = new WaveManager(this, this.gameMap)

    this.setupEventListeners()
    this.createUI()
    this.startWave()
  }

  private setupEventListeners(): void {
    EventBus.on(GameEvents.ENEMY_KILLED, (enemy: any) => {
      this.gold += enemy.getReward()
      this.updateUI()
    })

    EventBus.on(GameEvents.ENEMY_REACHED_END, () => {
      this.lives--
      this.updateUI()
      if (this.lives <= 0) {
        this.gameOver()
      }
    })

    EventBus.on(GameEvents.WAVE_ENDED, () => {
      this.gold += 50 + this.waveManager.getCurrentWave() * 10
      this.updateUI()
      this.time.delayedCall(2000, () => {
        this.startWave()
      })
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < GameConfig.SECTIONS.GAME.height) {
        this.handleGameClick(pointer)
      }
    })
  }

  private createUI(): void {
    const uiY = GameConfig.SECTIONS.UI.y

    this.add.rectangle(0, uiY, GameConfig.CANVAS_WIDTH, GameConfig.SECTIONS.UI.height, 0x2c3e50).setOrigin(0)

    this.goldText = this.add.text(20, uiY + 15, `💰 金币: ${this.gold}`, {
      fontSize: '18px',
      color: '#FFD700',
      fontFamily: 'Arial'
    })

    this.livesText = this.add.text(20, uiY + 45, `❤️ 生命: ${this.lives}`, {
      fontSize: '18px',
      color: '#FF6B6B',
      fontFamily: 'Arial'
    })

    this.waveText = this.add.text(200, uiY + 30, `波次: 0`, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    })

    this.createTowerSelection(uiY)
  }

  private createTowerSelection(uiY: number): void {
    this.towerButtons = this.add.container(350, uiY + 10)

    const towerTypes = Object.keys(TowerConfig)
    towerTypes.forEach((towerType, index) => {
      const config = TowerConfig[towerType]
      const x = index * 130

      const button = this.add.rectangle(x, 20, 120, 50, 0x3498db)
      button.setInteractive({ useHandCursor: true })
      button.on('pointerover', () => button.setFillStyle(0x5dade2))
      button.on('pointerout', () => button.setFillStyle(0x3498db))
      button.on('pointerdown', () => this.selectTower(towerType))

      const nameText = this.add.text(x, 8, config.name, {
        fontSize: '12px',
        color: '#FFFFFF',
        align: 'center'
      }).setOrigin(0.5, 0)

      const costText = this.add.text(x, 28, `💰 ${config.cost}`, {
        fontSize: '12px',
        color: '#FFD700',
        align: 'center'
      }).setOrigin(0.5, 0)

      this.towerButtons.add([button, nameText, costText])
    })
  }

  private selectTower(towerType: string): void {
    if (this.selectedTowerType === towerType) {
      this.selectedTowerType = null
      this.highlightSelectedTower()
      return
    }

    const config = TowerConfig[towerType]
    if (this.gold >= config.cost) {
      this.selectedTowerType = towerType
      this.highlightSelectedTower()
    }
  }

  private highlightSelectedTower(): void {
    const towerTypes = Object.keys(TowerConfig)
    this.towerButtons.each((child: Phaser.GameObjects.GameObject, index: number) => {
      if (child.type === 'Rectangle') {
        const rect = child as Phaser.GameObjects.Rectangle
        if (towerTypes[index] === this.selectedTowerType) {
          rect.setFillStyle(0xf39c12)
        } else {
          rect.setFillStyle(0x3498db)
        }
      }
    })
  }

  private handleGameClick(pointer: Phaser.Input.Pointer): void {
    if (!this.selectedTowerType) return

    const gridPos = CoordinateMapper.worldToGrid(pointer.x, pointer.y)

    const existingTower = this.towers.find(t => 
      t.getGridPosition().x === gridPos.x && t.getGridPosition().y === gridPos.y
    )

    if (existingTower) {
      this.tryUpgradeTower(existingTower)
      return
    }

    if (this.gameMap.canPlaceTower(gridPos.x, gridPos.y)) {
      this.placeTower(gridPos.x, gridPos.y)
    }
  }

  private placeTower(gridX: number, gridY: number): void {
    if (!this.selectedTowerType) return

    const config = TowerConfig[this.selectedTowerType]
    if (this.gold < config.cost) return

    this.gold -= config.cost
    const tower = new Tower(this, gridX, gridY, this.selectedTowerType)
    this.towers.push(tower)
    this.gameMap.setTile(gridX, gridY, 0)

    this.selectedTowerType = null
    this.highlightSelectedTower()
    this.updateUI()
    EventBus.emit(GameEvents.TOWER_PLACED, tower)
  }

  private tryUpgradeTower(tower: Tower): void {
    const upgradeCost = tower.getUpgradeCost()
    if (upgradeCost > 0 && this.gold >= upgradeCost) {
      this.gold -= upgradeCost
      tower.upgrade()
      this.updateUI()
      EventBus.emit(GameEvents.TOWER_UPGRADED, tower)
    }
  }

  private startWave(): void {
    const nextWave = this.waveManager.getCurrentWave() + 1
    this.waveManager.startWave(nextWave)
    this.updateUI()
  }

  private updateUI(): void {
    this.goldText.setText(`💰 金币: ${this.gold}`)
    this.livesText.setText(`❤️ 生命: ${this.lives}`)
    this.waveText.setText(`波次: ${this.waveManager.getCurrentWave()}`)
  }

  update(_time: number, delta: number): void {
    this.waveManager.update(delta)
    this.updateTowerAttacks()
  }

  private updateTowerAttacks(): void {
    const currentTime = this.time.now
    const enemies = this.waveManager.getEnemies()

    this.towers.forEach(tower => {
      if (tower.canAttack(currentTime)) {
        const towerPos = tower.getWorldPosition()
        const range = tower.getRange() * GameConfig.TILE_SIZE

        let closestEnemy: any = null
        let closestDistance = Infinity

        enemies.forEach(enemy => {
          const enemyPos = enemy.getPosition()
          const distance = CoordinateMapper.distance(towerPos.x, towerPos.y, enemyPos.x, enemyPos.y)
          if (distance < range && distance < closestDistance) {
            closestDistance = distance
            closestEnemy = enemy
          }
        })

        if (closestEnemy) {
          tower.attack(currentTime)
          closestEnemy.takeDamage(tower.getDamage())

          const enemyPos = closestEnemy.getPosition()
          const line = this.add.line(0, 0, towerPos.x, towerPos.y, enemyPos.x, enemyPos.y, 0xffff00)
          line.setDepth(15)
          this.time.delayedCall(100, () => line.destroy())
        }
      }
    })
  }

  private gameOver(): void {
    this.add.rectangle(GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2, 400, 200, 0x000000, 0.8)
    this.add.text(GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2 - 40, '游戏结束!', {
      fontSize: '32px',
      color: '#FF0000'
    }).setOrigin(0.5)
    this.add.text(GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2 + 10, `坚持到了第 ${this.waveManager.getCurrentWave()} 波`, {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5)

    this.time.delayedCall(3000, () => {
      this.scene.restart()
    })
  }
}
