import Phaser from 'phaser';
import { gameState } from '../core/GameState';

export class BootScene extends Phaser.Scene {
  private loadingText?: Phaser.GameObjects.Text;
  private errorText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show loading text
    this.loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Loading...',
      { fontSize: '32px', color: '#ffffff' }
    );
    this.loadingText.setOrigin(0.5);

    // Add error handlers
    this.load.on('loaderror', (file: any) => {
      console.error('Error loading file:', file.key, file.src);
      this.showError(`Failed to load: ${file.key}`);
    });

    this.load.on('complete', () => {
      console.log('All assets loaded successfully');
    });

    // Load configuration files
    this.load.json('weaponsConfig', '/data/weapons.json');
    this.load.json('enemiesConfig', '/data/enemies.json');
    this.load.json('stagesConfig', '/data/stages.json');
  }

  create(): void {
    // Try to get configs from cache
    const weaponsConfig = this.cache.json.get('weaponsConfig');
    const enemiesConfig = this.cache.json.get('enemiesConfig');
    const stagesConfig = this.cache.json.get('stagesConfig');

    // Check if all configs loaded successfully
    if (!weaponsConfig || !enemiesConfig || !stagesConfig) {
      console.error('Config loading failed:', {
        weaponsConfig: !!weaponsConfig,
        enemiesConfig: !!enemiesConfig,
        stagesConfig: !!stagesConfig
      });
      this.showError('Failed to load game configuration. Please refresh.');
      return;
    }

    // Store configs in game state
    gameState.weaponsConfig = weaponsConfig;
    gameState.enemiesConfig = enemiesConfig;
    gameState.stagesConfig = stagesConfig;

    console.log('Game configs loaded successfully');

    // Start main menu
    this.scene.start('MenuScene');
  }

  private showError(message: string): void {
    if (this.loadingText) {
      this.loadingText.destroy();
    }

    this.errorText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      message,
      { fontSize: '24px', color: '#ff0000', align: 'center' }
    );
    this.errorText.setOrigin(0.5);

    const retryText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 50,
      'Click to retry',
      { fontSize: '18px', color: '#ffffff' }
    );
    retryText.setOrigin(0.5);
    retryText.setInteractive({ useHandCursor: true });
    retryText.on('pointerdown', () => {
      this.scene.restart();
    });
  }
}
