import './style.css'
import Phaser from 'phaser'

const sizes = {
  width: 400,
  height: 600
}

const speed = 240;
const bulletSpeed = 400;
const enemySpeed = 200;
const fireRate = 100;

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game")
    this.player
    this.cursor
    this.playerSpeed = speed
    this.bullets;
    this.enemies;
    this.lastFired = 0;
    this.score = 0;
  }

  preload() {
    this.load.image('platform', '/assets/images/platform.png')
    this.load.image('player', '/assets/images/player.png')
    this.load.image('bullet', '/assets/images/bullet.png')
    this.load.image('enemy', '/assets/images/enemy.png')
  }

  create() {
    this.add.image(0, 0, 'platform').setOrigin(0, 0)
    this.player = this.physics.add.image(0, sizes.height - 100, 'player').setOrigin(0, 0)
    this.player.setImmovable(true)
    this.player.body.allowGravity = false
    this.player.body.collideWorldBounds = true
  
    this.cursor = this.input.keyboard.createCursorKeys()

    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 15,
      runChildUpdate: true,
      allowGravity: false,
    });

    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 15,
      runChildUpdate: true,
      allowGravity: false,
    });

    this.time.addEvent({
      delay: 800,
      callback: this.addEnemy,
      callbackScope: this,
      loop: true,
    });
  
    this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.collider(this.enemies, this.player, () => {
      console.log("Game Over");
      this.scene.restart();
    });
  }

  update() {
    const { left, right, up, down } = this.cursor

    if (left.isDown) {
      this.player.x -= this.playerSpeed * this.game.loop.delta / 1000
    } else if (right.isDown) {
      this.player.x += this.playerSpeed * this.game.loop.delta / 1000
    }

    if (up.isDown) {
      this.player.y -= this.playerSpeed * this.game.loop.delta / 1000
    } else if (down.isDown) {
      this.player.y += this.playerSpeed * this.game.loop.delta / 1000
    }

    if (this.spacebar.isDown && this.time.now > this.lastFired) {
      this.fireBullet();
      this.lastFired = this.time.now + fireRate;
    }

    this.bullets.children.each(bullet => {
      if (bullet.active) {
        bullet.y -= bulletSpeed * this.game.loop.delta / 1000
        if (bullet.y < 0) {
          bullet.setActive(false)
          bullet.setVisible(false)
        }
      }
    }, this);
  
    this.enemies.children.each(enemy => {
      if (enemy.active) {
        enemy.y += enemySpeed * this.game.loop.delta / 1000;
        if (enemy.y > sizes.height) {
          enemy.setActive(false);
          enemy.setVisible(false);
        }
      }
    });
  }

  fireBullet() {
    const bullet = this.bullets.get();

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(this.player.x + this.player.width / 2 - 5, this.player.y);
    }
  }

  addEnemy() {
    const enemy = this.enemies.get();

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setPosition(Math.random() * sizes.width, 0);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);

    enemy.setActive(false);
    enemy.setVisible(false);

    this.score += 10; // Increase score
    console.log("Score: ", this.score); // Log the score for now (You can display it later)
  }
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas:gameCanvas,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene]
}

const game = new Phaser.Game(config)
