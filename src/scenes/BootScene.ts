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
    console.log('[BootScene] create() called');

    // Try to get configs from cache
    const weaponsConfig = this.cache.json.get('weaponsConfig');
    const enemiesConfig = this.cache.json.get('enemiesConfig');
    const stagesConfig = this.cache.json.get('stagesConfig');

    console.log('[BootScene] Config status:', {
      weaponsConfig: !!weaponsConfig,
      enemiesConfig: !!enemiesConfig,
      stagesConfig: !!stagesConfig
    });

    // Store configs in game state (even if null, scene will handle it)
    gameState.weaponsConfig = weaponsConfig;
    gameState.enemiesConfig = enemiesConfig;
    gameState.stagesConfig = stagesConfig;

    // Always transition to menu scene - let the game handle missing configs
    console.log('[BootScene] Starting MenuScene...');

    // Use a small delay to ensure the transition happens
    this.time.delayedCall(100, () => {
      this.scene.start('MenuScene');
    });
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
