import './style.css';
import Phaser from 'phaser';

const sizes = {
  width: 400,
  height: 600
};

const speed = 220;
const bulletSpeed = 400;
const enemySpeed = 200;
const fireRate = 100;

class GameScene extends Phaser.Scene {
  constructor() {
    super('scene-game');
    this.player;
    this.cursor;
    this.playerSpeed = speed;
    this.bullets;
    this.enemies;
    this.lastFired = 0;
    this.score = 0;
    this.scoreText;
    this.gameOver = false;
  }

  preload() {
    this.load.image('platform', '/assets/images/platform.png');
    this.load.image('player', '/assets/images/player.png');
    this.load.image('bullet', '/assets/images/bullet.png');
    this.load.image('enemy', '/assets/images/enemy.png');
  }

  create() {
    this.platform = this.add.image(0, 0, 'platform').setOrigin(0, 0);
    this.player = this.physics.add
      .image(0, sizes.height - 100, 'player')
      .setOrigin(0, 0);
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
    this.player.body.collideWorldBounds = true;
    // this.player.setDisplaySize(50, 50); // Set the display size of the player
    this.player
      .setSize(this.player.width * 0.8, this.player.height * 0.8)
      .setOffset(this.player.width * 0.1, this.player.height * 0.1);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 15,
      runChildUpdate: true,
      allowGravity: false,
      createCallback: (bullet) => {
        bullet.setDisplaySize(25, 25);
      }
    });

    this.spacebar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 15,
      runChildUpdate: true,
      allowGravity: false
    });

    this.time.addEvent({
      delay: 800,
      callback: this.addEnemy,
      callbackScope: this,
      loop: true
    });

    this.physics.add.collider(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );
    this.physics.add.collider(
      this.enemies,
      this.player,
      this.gameOverHandler,
      null,
      this
    );

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '25px',
      fill: '#fff'
    });

    this.gameOverText = this.add
      .text(sizes.width / 2, sizes.height / 2, '', {
        fontSize: '25px',
        fill: '#5c89d0',
        fontWeight: 'bold'
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);
  }

  update() {
    if (this.gameOver) {
      return; // Do nothing if the game is over
    }

    const { left, right, up, down } = this.cursor;

    if (left.isDown) {
      this.player.x -= (this.playerSpeed * this.game.loop.delta) / 1000;
    } else if (right.isDown) {
      this.player.x += (this.playerSpeed * this.game.loop.delta) / 1000;
    }

    if (up.isDown) {
      this.player.y -= (this.playerSpeed * this.game.loop.delta) / 1000;
    } else if (down.isDown) {
      this.player.y += (this.playerSpeed * this.game.loop.delta) / 1000;
    }

    if (this.spacebar.isDown && this.time.now > this.lastFired) {
      this.fireBullet();
      this.lastFired = this.time.now + fireRate;
    }

    this.bullets.children.each((bullet) => {
      if (bullet.active) {
        bullet.y -= (bulletSpeed * this.game.loop.delta) / 1000;
        if (bullet.y < 0) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    }, this);

    this.enemies.children.each((enemy) => {
      if (enemy.active) {
        enemy.y += (enemySpeed * this.game.loop.delta) / 1000;
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
      bullet.setPosition(
        this.player.x + this.player.width / 2 - 5,
        this.player.y
      );
    }
  }

  addEnemy() {
    if (this.gameOver) {
      return;
    }
    const enemy = this.enemies.get();

    if (enemy) {
      const xPosition = Phaser.Math.Between(80 / 2, sizes.width - 80 / 2);

      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setPosition(xPosition, 0);
    }
  }

  hitEnemy(bullet, enemy) {
    if (bullet.active && enemy.active) {
      bullet.setActive(false);
      bullet.setVisible(false);

      enemy.setActive(false);
      enemy.setVisible(false);

      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
    }
  }

  gameOverHandler() {
    this.gameOver = true;
    this.physics.pause();

    this.player.setVisible(false);
    this.enemies.children.each((enemy) => enemy.setVisible(false));
    this.bullets.children.each((bullet) => bullet.setVisible(false));
    this.scoreText.setVisible(false);

    this.cameras.main.shake(500); // Shake the camera
    this.platform.setVisible(false);
    this.cameras.main.setBackgroundColor('#000'); // Set background to black

    // Get highest score from localStorage
    const highestScore = localStorage.getItem('highestScore') || 0;
    if (this.score > highestScore) {
      localStorage.setItem('highestScore', this.score); // Save the new high score
    }

    this.cameras.main.setBackgroundColor('#000'); // Set background to black
    this.gameOverText.setText(
      `Game Over\n\n\nScore: ${this.score}\nHighest Score: ${Math.max(
        this.score,
        highestScore
      )}\n\nPress SPACE to Restart`
    );
    this.gameOverText.setVisible(true);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.score = 0; // Reset score for new game
      this.scene.restart(); // Restart the scene
      this.gameOver = false;
    });
  }
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);
