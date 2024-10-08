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

let flag = false;

const gameStart = document.getElementById('gameStart');
const startbtn = document.getElementById('startbtn');

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
    this.bgMusic;
    this.shootSound;
    this.hitSound;
    this.explosionEmitter;
    this.speedParticles;
  }

  preload() {
    this.load.image('platform', 'assets/images/platform.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('bullet', 'assets/images/bullet.png');
    this.load.image('enemy', 'assets/images/enemy.png');
    this.load.image('explosion', 'assets/images/explosion.png');
    this.load.image('speedParticle', 'assets/images/speed.png');

    // Sound effects
    this.load.audio('bgMusic', 'assets/audios/backgroundSound.ogg');
    this.load.audio('gameOverSound', 'assets/audios/Defeated.ogg');
    this.load.audio('shootSound', 'assets/audios/alienshoot1.wav');
    this.load.audio('hitSound', 'assets/audios/explosion1.wav');
  }

  create() {
    this.bgMusic = this.sound.add('bgMusic', { loop: true });
    this.shootSound = this.sound.add('shootSound');
    this.hitSound = this.sound.add('hitSound');

    if (!flag) {
      this.scene.pause('scene-game');
    }
    // this.scene.pause('scene-game');

    // this.bgMusic.play();
    this.bgMusic.setVolume(0.5);

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
      allowGravity: false,
      createCallback: (enemy) => {
        enemy.setDisplaySize(80, 100);
      }
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

    this.physics.world.setBoundsCollision(true, true, true, true);

    this.explosionEmitter = this.add.particles(0, 0, 'explosion', {
      speed: 10,
      scale: {start: 1.8, end: 0},
      alpha: {start: 1, end: 0},
      duration: 350,
      emitting: false
    });

    this.speedParticles = this.add.particles(0, 0, 'speedParticle', {
      speed: 40,
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.4, end: 0 },
      blendMode: 'ADD',
    });
    this.speedParticles.startFollow(this.player, this.player.width/2, this.player.height, true);
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
      this.shootSound.play();
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

      this.explosionEmitter.explode(5, enemy.x, enemy.y);

      this.hitSound.stop();
      this.hitSound.play();

      this.c

      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
    }
  }

  gameOverHandler() {
    this.gameOver = true;
    this.physics.pause();
    this.sound.stopAll(); // Stop all sounds
    this.sound.play('gameOverSound'); // Play game over sound

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
      this.sound.stopAll(); // Stop all sounds
      this.bgMusic.play(); // Play background music again
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

startbtn.addEventListener('click', () => {
  flag = true;
  gameStart.style.display = 'none';
  game.scene.resume('scene-game');
  game.scene.getScene('scene-game').bgMusic.play();
});
