import Phaser, { GameObjects } from 'phaser'

const { Vector2 } = Phaser.Math

const pipeWidth = 32;
const pipeHeight = 16;
const pipeGap = 50;
export default class Gameplay extends Phaser.Scene {

  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  pipe?: Phaser.GameObjects.Container;
  pipe1?: Phaser.GameObjects.Container;
  pipe2?: Phaser.GameObjects.Container;
  pipeSpacing?: number;
  isStarted: boolean = false;
  isGameover: boolean = false;
  score: number = 0;
  scoreText?: Phaser.GameObjects.Text;
  isScored?: boolean;

  flapSfx?: Phaser.Sound.BaseSound;
  bgm?: Phaser.Sound.BaseSound;
  deadSfx?: Phaser.Sound.BaseSound;
  scoreSfx?: Phaser.Sound.BaseSound;

  preload() {
    this.load.image('bg', 'assets/Background/Background2.png');
    this.load.spritesheet('bird', 'assets/Player/bird1.png', { frameWidth: 16, frameHeight: 16 });
    this.load.atlas('pipe', 'assets/atlas/pipeatlas.png', 'assets/atlas/pipeatlas.json');

    this.load.audio('bgm', [
      'assets/sound/bgm.m4a'
    ]);
    this.load.audio('flap', [
      'assets/sound/flap.ogg'
    ])
    this.load.audio('dead', [
      'assets/sound/dead.ogg'
    ])
    this.load.audio('score', [
      'assets/sound/score.ogg'
    ])
  }

  create() {
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('bird', { frames: [0, 1, 2, 3] }),
      frameRate: 6,
      repeat: -1
    });

    this.bgm = this.sound.add('bgm');
    this.flapSfx = this.sound.add('flap');
    this.deadSfx = this.sound.add('dead');
    this.scoreSfx = this.sound.add('score');

    this.playBgm();

    // set camera zoom
    this.cameras.main
      .setZoom(2)
    // .setViewport(0, 0, 360, 600)
    // .setSize(360, 600)

    let canvas = this.add.rectangle(0, 0, 360, 600, 0x0df1ff).setOrigin(0, 0);
    let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg');

    this.pipeSpacing = this.cameras.main.width / 2;

    this.player = this.physics.add.sprite(this.cameras.main.centerX - 40, this.cameras.main.centerY, 'bird').play('idle');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(0, 500);
    this.player.body.setAllowGravity(false);
    this.player.setSize(12, 12);

    this.pipe = this.createPipe(this.cameras.main.centerX + this.pipeSpacing);

    let box = this.physics.add.staticGroup();
    let topBox = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY - 180, 360, 20, 0x000000).setOrigin(0.5, 1);
    let botBox = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY + 170, 360, 10, 0x0066ff).setOrigin(0.5, 0);
    box.add(topBox);
    box.add(botBox);
    this.physics.add.overlap(this.player, box, this.hit, undefined, this);


    this.scoreText = this.add.text(this.cameras.main.centerX - 8, this.cameras.main.centerY - 69, 'Tap to start',
      { color: '#fff', fontSize: '12px', fontStyle: 'bold', align: 'center', stroke: '#000', strokeThickness: 2, resolution: 8 });
    this.scoreText.setOrigin(0.5, 0.5);

    canvas.setInteractive();
    canvas.on('pointerdown', () => {
      if (!this.isGameover) {
        this.isStarted = true;
        this.handlePlayerJump();
      } else {
        this.isStarted = false;
        this.isGameover = false;
        this.score = 0;
        this.registry.destroy();
        this.scene.restart();
        // this.bgm?.stop();
      }
    })
  }

  playBgm() {
    this.bgm?.play({
      loop: true, volume: 0.7
    });
  }

  createPipe(x: number): Phaser.GameObjects.Container {
    let pipesPosY = this.cameras.main.centerY;

    let pipe = this.add.container(x, pipesPosY);

    let pipePhysics = this.physics.add.group({
      allowGravity: false,
    });

    let pipeBot = this.add.sprite(0, pipeGap, 'pipe', 'bot')
    let pipeTop = this.add.image(0, -pipeGap, 'pipe', 'top')
    pipe.add(pipeBot);
    pipe.add(pipeTop);
    pipePhysics.add(pipeBot);
    pipePhysics.add(pipeTop);


    var botTrunk = this.add.tileSprite(0, pipeGap + pipeHeight / 2, 32, 250, 'pipe', 'center').setOrigin(0.5, 0);
    var topTrunk = this.add.tileSprite(0, -pipeGap - pipeHeight / 2, 32, 250, 'pipe', 'center').setOrigin(0.5, 1);
    pipe.add(botTrunk)
    pipe.add(topTrunk)
    pipePhysics.add(botTrunk);
    pipePhysics.add(topTrunk);

    this.physics.add.overlap(this.player, pipePhysics, this.hit, undefined, this);

    return pipe;
  }

  handlePlayerJump() {
    this.player.body.setAllowGravity(true);
    this.player.setAccelerationY(400);
    this.player.setVelocityY(-230);
    this.isStarted = true; // start the game
    this.flapSfx?.play();
  }

  update(time: number, delta: number) {
    // handle player rotation
    let rotVel = Phaser.Math.Clamp(this.player.body.velocity.y, -300, 300);
    this.player.setRotation(rotVel * 0.003);

    // handle pipe movement
    if (this.isStarted && !this.isGameover) {
      this.pipe?.setX(this.pipe!.x - 2);
    }

    let leftScreen = this.cameras.main.centerX - this.cameras.main.width / 2;
    let rightScreen = this.cameras.main.centerX + this.cameras.main.width / 2;
    let minY = this.cameras.main.centerY - 100;
    let maxY = this.cameras.main.centerY + 100;

    // reset pipe if pass the left screen
    if (this.pipe!.x < leftScreen) {
      this.pipeSpacing = this.pipeSpacing! * 0.9;

      this.pipe?.setX(rightScreen + this.pipeSpacing!);
      let posY = Phaser.Math.Between(minY, maxY);
      this.pipe?.setY(posY);
      this.isScored = false
    }

    // handle scoring
    if (this.pipe!.x < this.player.x) {
      if (!this.isScored) {
        this.isScored = true
        this.score++;
        this.scoreSfx?.play();
      };
    }

    if (this.isStarted && !this.isGameover) {
      this.scoreText?.setText(this.score.toString());
    }
  }

  hit(player: any, pipePhysics: any) {
    this.physics.pause();
    player.setTint(0xff0000);
    this.isGameover = true
    this.scoreText?.setText('Game Over!\nScore: ' + this.score.toString());
    this.bgm?.stop();
    this.deadSfx?.play();
  }
}

