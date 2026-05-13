import { GameConfig } from '../config/GameConfig'

export class CoordinateMapper {
  static gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2,
      y: gridY * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2,
    }
  }

  static worldToGrid(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.floor(worldX / GameConfig.TILE_SIZE),
      y: Math.floor(worldY / GameConfig.TILE_SIZE),
    }
  }

  static gridToThree(gridX: number, gridY: number): { x: number; z: number } {
    return {
      x: (gridX - GameConfig.MAP_WIDTH / 2) * GameConfig.TILE_SIZE,
      z: (gridY - GameConfig.MAP_HEIGHT / 2) * GameConfig.TILE_SIZE,
    }
  }

  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }
}
