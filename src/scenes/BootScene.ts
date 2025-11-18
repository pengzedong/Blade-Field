import Phaser from 'phaser';
import { gameState } from '../core/GameState';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show loading text
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Loading...',
      { fontSize: '32px', color: '#ffffff' }
    );
    loadingText.setOrigin(0.5);

    // Load configuration files
    this.load.json('weaponsConfig', '/data/weapons.json');
    this.load.json('enemiesConfig', '/data/enemies.json');
    this.load.json('stagesConfig', '/data/stages.json');
  }

  create(): void {
    // Store configs in game state
    gameState.weaponsConfig = this.cache.json.get('weaponsConfig');
    gameState.enemiesConfig = this.cache.json.get('enemiesConfig');
    gameState.stagesConfig = this.cache.json.get('stagesConfig');

    // Start main menu
    this.scene.start('MenuScene');
  }
}
