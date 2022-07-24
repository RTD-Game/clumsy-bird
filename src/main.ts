import Phaser from 'phaser'
import Gameplay from './Scenes/Gameplay'
import './style.css'

let config = {
  type: Phaser.AUTO,
  width: 360,
  height: 600,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      // debug: true
    }
  },
  scene: [Gameplay]
}

const game = new Phaser.Game(config)
