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
  private isPaused: boolean = false
  private pauseText!: Phaser.GameObjects.Text
  private pauseButton!: Phaser.GameObjects.Rectangle
  private towerInfoPanel!: Phaser.GameObjects.Container
  private previewTower!: Phaser.GameObjects.Sprite | null
  private previewRange!: Phaser.GameObjects.Arc | null

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    this.gold = GameConfig.INITIAL_GOLD
    this.lives = GameConfig.INITIAL_LIVES
    this.selectedTowerType = null
    this.isPaused = false
    this.towers = []
    this.previewTower = null
    this.previewRange = null

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
        if (!this.isPaused) {
          this.startWave()
        }
      })
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.cancelTowerSelection()
        return
      }
      if (pointer.y < GameConfig.SECTIONS.GAME.height) {
        this.handleGameClick(pointer)
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < GameConfig.SECTIONS.GAME.height && this.selectedTowerType) {
        this.updateTowerPreview(pointer)
      } else {
        this.hideTowerPreview()
      }
    })

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.togglePause()
    })
    this.input.keyboard!.on('keydown-ESC', () => {
      this.cancelTowerSelection()
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

    this.createPauseButton(uiY)
    this.createTowerSelection(uiY)
    this.createTowerInfoPanel()
  }

  private createPauseButton(uiY: number): void {
    this.pauseButton = this.add.rectangle(GameConfig.CANVAS_WIDTH - 80, uiY + 35, 100, 40, 0xe74c3c)
    this.pauseButton.setInteractive({ useHandCursor: true })
    this.pauseButton.on('pointerover', () => this.pauseButton.setFillStyle(0xc0392b))
    this.pauseButton.on('pointerout', () => this.pauseButton.setFillStyle(0xe74c3c))
    this.pauseButton.on('pointerdown', () => this.togglePause())

    this.pauseText = this.add.text(GameConfig.CANVAS_WIDTH - 80, uiY + 35, '暂停 [空格]', {
      fontSize: '14px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5)
  }

  private createTowerSelection(uiY: number): void {
    this.towerButtons = this.add.container(350, uiY + 10)

    const towerTypes = Object.keys(TowerConfig)
    towerTypes.forEach((towerType, index) => {
      const config = TowerConfig[towerType]
      const x = index * 130

      const button = this.add.rectangle(x, 20, 120, 50, 0x3498db)
      button.setInteractive({ useHandCursor: true })
      button.on('pointerover', () => {
        button.setFillStyle(0x5dade2)
        this.showTowerInfo(towerType, x + 350, uiY - 100)
      })
      button.on('pointerout', () => {
        button.setFillStyle(0x3498db)
        this.hideTowerInfo()
      })
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

  private createTowerInfoPanel(): void {
    this.towerInfoPanel = this.add.container(0, 0)
    this.towerInfoPanel.setVisible(false)
    this.towerInfoPanel.setDepth(100)

    const background = this.add.rectangle(0, 0, 250, 150, 0x1a1a2e, 0.95)
    background.setStrokeStyle(2, 0x4a90d9)
    background.setOrigin(0, 0)

    const title = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#FFD700',
      fontStyle: 'bold'
    })

    const description = this.add.text(10, 35, '', {
      fontSize: '12px',
      color: '#FFFFFF',
      wordWrap: { width: 230 }
    })

    const stats = this.add.text(10, 70, '', {
      fontSize: '12px',
      color: '#90EE90'
    })

    const hint = this.add.text(10, 130, '右键或ESC取消选择', {
      fontSize: '10px',
      color: '#888888'
    })

    this.towerInfoPanel.add([background, title, description, stats, hint])
  }

  private showTowerInfo(towerType: string, x: number, y: number): void {
    const config = TowerConfig[towerType]
    const items = this.towerInfoPanel.list
    const title = items[1] as Phaser.GameObjects.Text
    const description = items[2] as Phaser.GameObjects.Text
    const stats = items[3] as Phaser.GameObjects.Text

    title.setText(config.name)
    description.setText(config.description)
    stats.setText(
      `⚔️ 伤害: ${config.damage}\n` +
      `⚡ 攻速: ${(1000 / config.attackSpeed).toFixed(1)}/秒\n` +
      `🎯 范围: ${config.range} 格\n` +
      `💎 属性: ${config.damageType === 'physical' ? '物理' : config.damageType === 'internal' ? '内功' : '毒素'}`
    )

    this.towerInfoPanel.setPosition(
      Math.min(x, GameConfig.CANVAS_WIDTH - 260),
      Math.max(y, 10)
    )
    this.towerInfoPanel.setVisible(true)
  }

  private hideTowerInfo(): void {
    this.towerInfoPanel.setVisible(false)
  }

  private selectTower(towerType: string): void {
    if (this.selectedTowerType === towerType) {
      this.cancelTowerSelection()
      return
    }

    const config = TowerConfig[towerType]
    if (this.gold >= config.cost) {
      this.selectedTowerType = towerType
      this.highlightSelectedTower()
    }
  }

  private cancelTowerSelection(): void {
    this.selectedTowerType = null
    this.highlightSelectedTower()
    this.hideTowerPreview()
    this.hideTowerInfo()
  }

  private updateTowerPreview(pointer: Phaser.Input.Pointer): void {
    const gridPos = CoordinateMapper.worldToGrid(pointer.x, pointer.y)
    const worldPos = CoordinateMapper.gridToWorld(gridPos.x, gridPos.y)

    if (!this.previewTower) {
      this.previewTower = this.add.sprite(worldPos.x, worldPos.y, '')
      this.previewTower.setAlpha(0.6)
      this.previewTower.setDepth(50)
    }

    if (!this.previewRange) {
      const config = TowerConfig[this.selectedTowerType!]
      this.previewRange = this.add.circle(
        worldPos.x,
        worldPos.y,
        config.range * GameConfig.TILE_SIZE,
        0x00ff00,
        0.2
      )
      this.previewRange.setStrokeStyle(2, 0x00ff00, 0.5)
      this.previewRange.setDepth(49)
    }

    this.previewTower.setPosition(worldPos.x, worldPos.y)
    this.previewRange.setPosition(worldPos.x, worldPos.y)

    const canPlace = this.gameMap.canPlaceTower(gridPos.x, gridPos.y)
    const color = canPlace ? 0x00ff00 : 0xff0000
    this.previewTower.setTint(color)
    this.previewRange.setStrokeStyle(2, color, 0.5)
    this.previewRange.setFillStyle(color, 0.1)
  }

  private hideTowerPreview(): void {
    if (this.previewTower) {
      this.previewTower.destroy()
      this.previewTower = null
    }
    if (this.previewRange) {
      this.previewRange.destroy()
      this.previewRange = null
    }
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused

    if (this.isPaused) {
      this.pauseButton.setFillStyle(0x27ae60)
      this.pauseText.setText('继续 [空格]')
      this.add.rectangle(
        GameConfig.CANVAS_WIDTH / 2,
        GameConfig.CANVAS_HEIGHT / 2 - 50,
        300,
        100,
        0x000000,
        0.7
      ).setOrigin(0.5).setDepth(999).setName('pauseBg')
      this.add.text(
        GameConfig.CANVAS_WIDTH / 2,
        GameConfig.CANVAS_HEIGHT / 2 - 50,
        '游戏暂停',
        {
          fontSize: '32px',
          color: '#FFFFFF'
        }
      ).setOrigin(0.5).setDepth(1000).setName('pauseText')
    } else {
      this.pauseButton.setFillStyle(0xe74c3c)
      this.pauseText.setText('暂停 [空格]')
      const pauseBg = this.children.getByName('pauseBg')
      const pauseText = this.children.getByName('pauseText')
      if (pauseBg) pauseBg.destroy()
      if (pauseText) pauseText.destroy()
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

    if (!this.gameMap.canPlaceTower(gridX, gridY)) return

    this.gold -= config.cost
    const tower = new Tower(this, gridX, gridY, this.selectedTowerType)
    this.towers.push(tower)
    this.gameMap.setTile(gridX, gridY, 0)

    this.selectedTowerType = null
    this.highlightSelectedTower()
    this.hideTowerPreview()
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
    if (this.isPaused) return

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
    this.isPaused = true

    this.add.rectangle(GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2, 400, 200, 0x000000, 0.9).setDepth(999)
    this.add.text(GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2 - 50, '游戏结束!', {
      fontSize: '32px',
      color: '#FF0000'
    }).setOrigin(0.5).setDepth(1000)
    this.add.text(GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2, `坚持到了第 ${this.waveManager.getCurrentWave()} 波`, {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(1000)
    this.add.text(GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2 + 50, '点击重新开始', {
      fontSize: '16px',
      color: '#FFD700'
    }).setOrigin(0.5).setDepth(1000)

    this.input.once('pointerdown', () => {
      this.scene.restart()
    })
  }
}
