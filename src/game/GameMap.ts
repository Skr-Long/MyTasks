import Phaser from 'phaser'
import { GameConfig } from '../config/GameConfig'

export type TileType = 0 | 1 | 2

export class GameMap {
  private map: TileType[][]
  private path: { x: number; y: number }[]
  private graphics!: Phaser.GameObjects.Graphics

  constructor() {
    this.map = this.createMap()
    this.path = this.createPath()
  }

  private createMap(): TileType[][] {
    const map: TileType[][] = Array(GameConfig.MAP_HEIGHT)
      .fill(0)
      .map(() => Array(GameConfig.MAP_WIDTH).fill(0 as TileType))

    const pathCoords = [
      [0, 0], [1, 0], [2, 0], [3, 0],
      [3, 1], [3, 2], [3, 3],
      [4, 3], [5, 3], [6, 3], [7, 3],
      [7, 4], [7, 5], [7, 6],
      [8, 6], [9, 6], [10, 6],
      [10, 7], [10, 8],
      [11, 8], [12, 8], [13, 8],
      [13, 9], [13, 10], [14, 10], [15, 10]
    ]

    pathCoords.forEach(([x, y]) => {
      if (y < GameConfig.MAP_HEIGHT && x < GameConfig.MAP_WIDTH) {
        map[y][x] = 1
      }
    })

    const towerSpots = [
      [2, 1], [4, 1], [2, 4], [5, 4],
      [8, 4], [6, 7], [9, 7], [11, 7],
      [12, 9], [14, 8]
    ]

    towerSpots.forEach(([x, y]) => {
      if (y < GameConfig.MAP_HEIGHT && x < GameConfig.MAP_WIDTH) {
        map[y][x] = 2
      }
    })

    return map
  }

  private createPath(): { x: number; y: number }[] {
    return [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
      { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
      { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 },
      { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 10, y: 6 },
      { x: 10, y: 7 }, { x: 10, y: 8 },
      { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
      { x: 13, y: 9 }, { x: 13, y: 10 }, { x: 14, y: 10 }, { x: 15, y: 10 }
    ]
  }

  getTile(x: number, y: number): TileType {
    if (y < 0 || y >= GameConfig.MAP_HEIGHT || x < 0 || x >= GameConfig.MAP_WIDTH) {
      return 0
    }
    return this.map[y][x]
  }

  getPath(): { x: number; y: number }[] {
    return [...this.path]
  }

  canPlaceTower(x: number, y: number): boolean {
    return this.getTile(x, y) === 2
  }

  setTile(x: number, y: number, type: TileType): void {
    if (y >= 0 && y < GameConfig.MAP_HEIGHT && x >= 0 && x < GameConfig.MAP_WIDTH) {
      this.map[y][x] = type
    }
  }

  draw(scene: Phaser.Scene): void {
    this.graphics = scene.add.graphics()
    this.graphics.setDepth(-1)
    
    for (let y = 0; y < GameConfig.MAP_HEIGHT; y++) {
      for (let x = 0; x < GameConfig.MAP_WIDTH; x++) {
        const tile = this.map[y][x]
        const worldX = x * GameConfig.TILE_SIZE
        const worldY = y * GameConfig.TILE_SIZE
        
        if (tile === 1) {
          this.graphics.fillStyle(GameConfig.COLORS.PATH)
          this.graphics.fillRect(worldX, worldY, GameConfig.TILE_SIZE, GameConfig.TILE_SIZE)
          
          this.graphics.lineStyle(1, 0x6B5344)
          this.graphics.strokeRect(worldX, worldY, GameConfig.TILE_SIZE, GameConfig.TILE_SIZE)
        } else if (tile === 2) {
          this.graphics.fillStyle(GameConfig.COLORS.TOWER_SPOT, 0.5)
          this.graphics.fillRect(worldX + 4, worldY + 4, GameConfig.TILE_SIZE - 8, GameConfig.TILE_SIZE - 8)
          
          this.graphics.lineStyle(2, 0x228B22)
          this.graphics.strokeRect(worldX + 4, worldY + 4, GameConfig.TILE_SIZE - 8, GameConfig.TILE_SIZE - 8)
        }
      }
    }
  }
}
