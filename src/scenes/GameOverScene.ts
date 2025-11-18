import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private won: boolean = false;
  private survivalTime: number = 0;
  private kills: number = 0;
  private stage: number = 1;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: any): void {
    this.won = data.won || false;
    this.survivalTime = data.survivalTime || 0;
    this.kills = data.kills || 0;
    this.stage = data.stage || 1;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    const title = this.add.text(
      width / 2,
      height / 3,
      this.won ? 'VICTORY!' : 'GAME OVER',
      {
        fontSize: '64px',
        color: this.won ? '#00ff88' : '#ff4444',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5);

    // Stats
    const minutes = Math.floor(this.survivalTime / 60);
    const seconds = Math.floor(this.survivalTime % 60);
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const stats = this.add.text(
      width / 2,
      height / 2,
      `Stage Reached: ${this.stage}\nEnemies Defeated: ${this.kills}\nSurvival Time: ${timeString}`,
      {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 10
      }
    );
    stats.setOrigin(0.5);

    // Play again button
    const playAgainButton = this.add.text(width / 2, height - 150, '[ PLAY AGAIN ]', {
      fontSize: '32px',
      color: '#00ff88',
      backgroundColor: '#0a0a0a',
      padding: { x: 20, y: 10 }
    });
    playAgainButton.setOrigin(0.5);
    playAgainButton.setInteractive({ useHandCursor: true });

    playAgainButton.on('pointerover', () => {
      playAgainButton.setColor('#ffff00');
    });

    playAgainButton.on('pointerout', () => {
      playAgainButton.setColor('#00ff88');
    });

    playAgainButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Menu button
    const menuButton = this.add.text(width / 2, height - 90, '[ MAIN MENU ]', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#0a0a0a',
      padding: { x: 20, y: 10 }
    });
    menuButton.setOrigin(0.5);
    menuButton.setInteractive({ useHandCursor: true });

    menuButton.on('pointerover', () => {
      menuButton.setColor('#ffff00');
    });

    menuButton.on('pointerout', () => {
      menuButton.setColor('#ffffff');
    });

    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Keyboard shortcuts
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard!.once('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }
}
