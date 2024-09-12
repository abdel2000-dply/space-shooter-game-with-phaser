import './style.css'
import Phaser from 'phaser'

const sizes = {
  width: 400,
  height: 600
}

const speed = 240

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game")
    this.player
  }

  preload() {
    this.load.image('platform', '/assets/images/platform.png')
    this.load.image('player', '/assets/images/player.png')
  }

  create() {
    this.add.image(0, 0, 'platform').setOrigin(0, 0)
    this.player = this.add.image(0, sizes.height - 100, 'player').setOrigin(0, 0)
  }

  update() {

  }
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas:gameCanvas,
  Physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: speed },
      debug: true
    }
  },
  scene: [GameScene]
}

const game = new Phaser.Game(config)
