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
  gameOver: boolean = false;
  score: number = 0;
  scoreText?: Phaser.GameObjects.Text;
  scored?: boolean;

  preload() {
    this.load.image('bg', 'assets/Background/Background2.png');
    this.load.spritesheet('bird', 'assets/Player/bird1.png', { frameWidth: 16, frameHeight: 16 });
    this.load.atlas('pipe', 'assets/atlas/pipeatlas.png', 'assets/atlas/pipeatlas.json');
  }

  create() {
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('bird', { frames: [0, 1, 2, 3] }),
      frameRate: 6,
      repeat: -1
    });

    // set camera zoom
    this.cameras.main
      .setZoom(2)
    // .setViewport(0, 0, 360, 600)
    // .setSize(360, 600)

    this.add.rectangle(0, 0, 360, 600, 0x0df1ff).setOrigin(0, 0);
    let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg');

    this.pipeSpacing = this.cameras.main.width / 2;

    this.player = this.physics.add.sprite(this.cameras.main.centerX - 40, this.cameras.main.centerY, 'bird').play('idle');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(0, 500);
    this.player.body.setAllowGravity(false);

    this.pipe = this.createPipe(this.cameras.main.centerX);
    // this.pipe1 = this.createPipe(this.cameras.main.centerX + this.pipeSpacing);
    // this.pipe2 = this.createPipe(this.cameras.main.centerX + this.pipeSpacing * 2);

    let box = this.physics.add.staticGroup();
    let topBox = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY - 150, 360, 10, 0xff0000).setOrigin(0.5, 1);
    let botBox = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY + 150, 360, 10, 0xff0000).setOrigin(0.5, 0);
    box.add(topBox);
    box.add(botBox);
    this.physics.add.overlap(this.player, box, this.hit, undefined, this);


    this.scoreText = this.add.text(this.cameras.main.centerX - 8, this.cameras.main.centerY - 69, this.score.toString(), 
    { color: '#fff', fontSize: '14px', fontStyle: 'bold', align: 'center', stroke: '#000', strokeThickness: 2, resolution: 8 });
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


    var botTrunk = this.add.tileSprite(0, pipeGap + pipeHeight / 2, 32, 180, 'pipe', 'center').setOrigin(0.5, 0);
    var topTrunk = this.add.tileSprite(0, -pipeGap - pipeHeight / 2, 32, 180, 'pipe', 'center').setOrigin(0.5, 1);
    pipe.add(botTrunk)
    pipe.add(topTrunk)
    pipePhysics.add(botTrunk);
    pipePhysics.add(topTrunk);

    this.physics.add.overlap(this.player, pipePhysics, this.hit, undefined, this);

    return pipe;
  }

  update(time: number, delta: number) {

    if (this.input.activePointer.isDown) {
      this.player.body.setAllowGravity(true);
      this.player.setAccelerationY(400);
      this.player.setVelocityY(-250);
    }

    let rotVel = Phaser.Math.Clamp(this.player.body.velocity.y, -300, 300);

    this.player.setRotation(rotVel * 0.003);

    let leftScreen = this.cameras.main.centerX - this.cameras.main.width / 2;
    let rightScreen = this.cameras.main.centerX + this.cameras.main.width / 2;
    let minY = this.cameras.main.centerY - (this.cameras.main.height / 8) - pipeHeight;
    let maxY = this.cameras.main.centerY + (this.cameras.main.height / 8) - pipeHeight;


    if (this.pipe!.x < leftScreen) {
      this.pipeSpacing = this.pipeSpacing! * 0.9;

      this.pipe?.setX(rightScreen + this.pipeSpacing!);
      let posY = Phaser.Math.Between(minY, maxY);
      this.pipe?.setY(posY);
      this.scored = false
    }

    if (this.pipe!.x < this.player.x) {
      if(!this.scored) {
        this.scored = true
        this.score++;
      };
    }

    // if (this.pipe1!.x < leftScreen) {
    //   this.pipe1?.setX(rightScreen + this.pipeSpacing!);
    //   let posY = Phaser.Math.Between(minY, maxY);
    //   this.pipe1?.setY(posY);
    // }

    // if (this.pipe2!.x < leftScreen) {
    //   this.pipe2?.setX(rightScreen)
    // }

    if (!this.gameOver) {
      this.pipe?.setX(this.pipe!.x - 2);
      // this.pipe1?.setX(this.pipe1!.x - 2);
      // this.pipe2?.setX(this.pipe2!.x - 2);
    }

    this.scoreText?.setText(this.score.toString());

  }

  hit(player: any, pipePhysics: any) {
    this.physics.pause();
    player.setTint(0xff0000);
    this.gameOver = true
  }
}

