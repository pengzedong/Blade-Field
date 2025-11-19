import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    console.log('[MenuScene] create() called');
    const { width, height } = this.cameras.main;
    console.log('[MenuScene] Camera dimensions:', width, height);

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    const title = this.add.text(width / 2, height / 3, 'BLADE FIELD', {
      fontSize: '64px',
      color: '#00ff88',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 3 + 70, 'Survive the Arena', {
      fontSize: '24px',
      color: '#ffffff'
    });
    subtitle.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(width / 2, height / 2 + 50,
      'Controls:\nWASD or Arrow Keys - Move\nESC - Pause\n\nCollect weapons to build your halo!\nDefeat enemies and survive!',
      {
        fontSize: '18px',
        color: '#cccccc',
        align: 'center',
        lineSpacing: 8
      }
    );
    instructions.setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height - 150, '[ START GAME ]', {
      fontSize: '32px',
      color: '#00ff88',
      backgroundColor: '#0a0a0a',
      padding: { x: 20, y: 10 }
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });
    console.log('[MenuScene] Start button created and made interactive');

    startButton.on('pointerover', () => {
      console.log('[MenuScene] Start button hover');
      startButton.setColor('#ffff00');
    });

    startButton.on('pointerout', () => {
      console.log('[MenuScene] Start button hover out');
      startButton.setColor('#00ff88');
    });

    startButton.on('pointerdown', () => {
      console.log('[MenuScene] Start button clicked!');
      this.scene.start('GameScene');
    });

    // Credits
    const credits = this.add.text(width / 2, height - 30,
      'Built with Phaser 3 & TypeScript',
      {
        fontSize: '14px',
        color: '#666666'
      }
    );
    credits.setOrigin(0.5);

    // Add keyboard shortcut to start
    console.log('[MenuScene] Setting up keyboard listener');
    this.input.keyboard!.once('keydown-SPACE', () => {
      console.log('[MenuScene] SPACE key pressed!');
      this.scene.start('GameScene');
    });

    console.log('[MenuScene] Setup complete');
  }
}
