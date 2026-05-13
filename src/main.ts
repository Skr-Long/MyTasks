import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene'
import { ThreeScene } from './core/ThreeScene'
import { GameConfig } from './config/GameConfig'

function initGame(): void {
  new ThreeScene('three-canvas')

  const phaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-canvas',
    width: GameConfig.CANVAS_WIDTH,
    height: GameConfig.CANVAS_HEIGHT,
    scene: [GameScene],
    transparent: true,
    pixelArt: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  }

  new Phaser.Game(phaserConfig)

  const adjustCanvasPosition = (): void => {
    const phaserCanvas = document.querySelector('#phaser-canvas canvas') as HTMLCanvasElement
    const threeCanvas = document.getElementById('three-canvas') as HTMLCanvasElement

    if (phaserCanvas && threeCanvas) {
      const phaserRect = phaserCanvas.getBoundingClientRect()
      threeCanvas.style.left = `${phaserRect.left}px`
      threeCanvas.style.top = `${phaserRect.top}px`
      threeCanvas.style.width = `${phaserRect.width}px`
      threeCanvas.style.height = `${phaserRect.height}px`
    }
  }

  adjustCanvasPosition()
  window.addEventListener('resize', adjustCanvasPosition)
}

window.addEventListener('load', initGame)
