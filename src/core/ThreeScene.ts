import * as THREE from 'three'
import { GameConfig } from '../config/GameConfig'

export class ThreeScene {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private animationId: number = 0

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement
    
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a2e)
    this.scene.fog = new THREE.Fog(0x1a1a2e, 50, 500)

    const aspect = window.innerWidth / window.innerHeight
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
    this.camera.position.set(0, 400, 300)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true 
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.setupLights()
    this.createGround()
    this.createDecorations()
    this.setupResizeHandler()
    this.animate()
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(100, 200, 100)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 500
    directionalLight.shadow.camera.left = -300
    directionalLight.shadow.camera.right = 300
    directionalLight.shadow.camera.top = 300
    directionalLight.shadow.camera.bottom = -300
    this.scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0xffd700, 0.5, 200)
    pointLight.position.set(0, 100, 0)
    this.scene.add(pointLight)
  }

  private createGround(): void {
    const groundGeometry = new THREE.PlaneGeometry(1024, 768)
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d5a27,
      roughness: 0.8,
      metalness: 0.2
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.1
    ground.receiveShadow = true
    this.scene.add(ground)

    this.createPath()
    this.createTowerSpots()
  }

  private createPath(): void {
    const pathPoints = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
      { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
      { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 },
      { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 10, y: 6 },
      { x: 10, y: 7 }, { x: 10, y: 8 },
      { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
      { x: 13, y: 9 }, { x: 13, y: 10 }, { x: 14, y: 10 }, { x: 15, y: 10 }
    ]

    pathPoints.forEach((point) => {
      const tileGeometry = new THREE.BoxGeometry(60, 2, 60)
      const tileMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B7355,
        roughness: 0.9
      })
      const tile = new THREE.Mesh(tileGeometry, tileMaterial)
      const worldPos = this.gridToThree(point.x, point.y)
      tile.position.set(worldPos.x, 0, worldPos.z)
      tile.receiveShadow = true
      this.scene.add(tile)
    })
  }

  private createTowerSpots(): void {
    const towerSpots = [
      { x: 2, y: 1 }, { x: 4, y: 1 }, { x: 2, y: 4 }, { x: 5, y: 4 },
      { x: 8, y: 4 }, { x: 6, y: 7 }, { x: 9, y: 7 }, { x: 11, y: 7 },
      { x: 12, y: 9 }, { x: 14, y: 8 }
    ]

    towerSpots.forEach((spot) => {
      const spotGeometry = new THREE.CylinderGeometry(25, 28, 3, 8)
      const spotMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x90EE90,
        roughness: 0.7,
        transparent: true,
        opacity: 0.7
      })
      const spotMesh = new THREE.Mesh(spotGeometry, spotMaterial)
      const worldPos = this.gridToThree(spot.x, spot.y)
      spotMesh.position.set(worldPos.x, 1.5, worldPos.z)
      spotMesh.receiveShadow = true
      this.scene.add(spotMesh)
    })
  }

  private createDecorations(): void {
    for (let i = 0; i < 15; i++) {
      const tree = this.createTree()
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 600
      tree.position.set(x, 0, z)
      tree.scale.setScalar(0.5 + Math.random() * 0.5)
      this.scene.add(tree)
    }

    const rockGeometry = new THREE.DodecahedronGeometry(15, 0)
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x696969,
      roughness: 0.9
    })
    
    for (let i = 0; i < 8; i++) {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial)
      const x = (Math.random() - 0.5) * 700
      const z = (Math.random() - 0.5) * 500
      rock.position.set(x, 5, z)
      rock.rotation.set(Math.random(), Math.random(), Math.random())
      rock.scale.setScalar(0.3 + Math.random() * 0.7)
      rock.castShadow = true
      this.scene.add(rock)
    }

    this.createPagoda()
  }

  private createTree(): THREE.Group {
    const group = new THREE.Group()

    const trunkGeometry = new THREE.CylinderGeometry(3, 5, 30, 8)
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.9
    })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 15
    trunk.castShadow = true
    group.add(trunk)

    const leavesGeometry = new THREE.ConeGeometry(20, 35, 8)
    const leavesMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.8
    })
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial)
    leaves.position.y = 40
    leaves.castShadow = true
    group.add(leaves)

    return group
  }

  private createPagoda(): void {
    const pagoda = new THREE.Group()
    
    for (let i = 0; i < 3; i++) {
      const size = 20 - i * 5
      const height = 15
      const floorGeometry = new THREE.BoxGeometry(size, height, size)
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xCD853F,
        roughness: 0.7
      })
      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.position.y = i * height + height / 2
      floor.castShadow = true
      pagoda.add(floor)

      const roofGeometry = new THREE.ConeGeometry(size * 0.8, 10, 4)
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B0000,
        roughness: 0.6
      })
      const roof = new THREE.Mesh(roofGeometry, roofMaterial)
      roof.position.y = (i + 1) * height + 5
      roof.rotation.y = Math.PI / 4
      roof.castShadow = true
      pagoda.add(roof)
    }

    pagoda.position.set(-400, 0, -250)
    pagoda.scale.setScalar(1.5)
    this.scene.add(pagoda)
  }

  private gridToThree(gridX: number, gridY: number): { x: number; z: number } {
    return {
      x: (gridX - GameConfig.MAP_WIDTH / 2) * GameConfig.TILE_SIZE,
      z: (gridY - GameConfig.MAP_HEIGHT / 2) * GameConfig.TILE_SIZE,
    }
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      const aspect = window.innerWidth / window.innerHeight
      this.camera.aspect = aspect
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    })
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate)
    this.renderer.render(this.scene, this.camera)
  }

  destroy(): void {
    cancelAnimationFrame(this.animationId)
    this.renderer.dispose()
  }

  getScene(): THREE.Scene {
    return this.scene
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }
}
