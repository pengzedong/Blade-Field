import Phaser from 'phaser';
import { Entity } from '../core/Entity';
import { EntityFactory } from '../entities/EntityFactory';
import { gameState } from '../core/GameState';
import { eventBus } from '../core/EventBus';

// Systems
import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { OrbitSystem } from '../systems/OrbitSystem';
import { AISystem } from '../systems/AISystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { PickupSystem } from '../systems/PickupSystem';
import { StageSystem } from '../systems/StageSystem';
import { UISystem } from '../systems/UISystem';
import { HealthComponent } from '../components/HealthComponent';

export class GameScene extends Phaser.Scene {
  private entities: Entity[] = [];
  private systems: any[] = [];
  private entityFactory!: EntityFactory;
  public gameData: any; // For collision system to access configs

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Reset game state
    gameState.reset();

    // Store game data reference
    this.gameData = {
      weaponsConfig: gameState.weaponsConfig,
      enemiesConfig: gameState.enemiesConfig,
      stagesConfig: gameState.stagesConfig
    };

    // Create background
    this.createBackground();

    // Initialize entity factory
    this.entityFactory = new EntityFactory(this);

    // Create player at center of world
    const player = this.entityFactory.createPlayer(2500, 2500);

    // Add initial weapons to player
    const halo = player.getComponent('halo') as any;
    if (halo) {
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const weapon = this.entityFactory.createOrbitingWeapon('blade', 1, 80, angle);
        halo.addWeapon(weapon);
        this.entities.push(weapon);
      }
    }

    this.entities.push(player);

    // Set up camera to follow player
    const playerSprite = player.getComponent<any>('sprite');
    if (playerSprite && playerSprite.sprite) {
      this.cameras.main.startFollow(playerSprite.sprite);
    }
    this.cameras.main.setBounds(0, 0, 5000, 5000);
    this.cameras.main.setZoom(1);

    // Initialize systems
    const spawnSystem = new SpawnSystem(this, this.entities);
    const stageSystem = new StageSystem(this, spawnSystem);
    const pickupSystem = new PickupSystem(this, spawnSystem);

    this.systems = [
      new InputSystem(this),
      new MovementSystem(this),
      new AISystem(this),
      new OrbitSystem(this),
      new CollisionSystem(this),
      spawnSystem,
      pickupSystem,
      stageSystem,
      new UISystem(this)
    ];

    // Set up pause
    this.input.keyboard!.on('keydown-ESC', () => {
      this.togglePause();
    });

    // Listen for game over events
    eventBus.on('game:over', this.onGameOver.bind(this));
    eventBus.on('game:won', this.onGameWon.bind(this));

    // Listen for boss events
    eventBus.on('boss:spawned', (data: any) => {
      this.showBanner('BOSS INCOMING!', '#ff0000');
    });

    eventBus.on('boss:defeated', () => {
      this.showBanner('BOSS DEFEATED!', '#00ff00');
    });

    eventBus.on('stage:started', (data: any) => {
      this.showBanner(`STAGE ${data.stage}`, '#00ffff');
    });

    // Check for player death
    this.time.addEvent({
      delay: 100,
      callback: this.checkPlayerHealth.bind(this),
      loop: true
    });
  }

  update(time: number, delta: number): void {
    if (gameState.isPaused) return;

    // Update all systems
    for (const system of this.systems) {
      if (system.enabled) {
        system.update(delta, this.entities);
      }
    }

    // Clean up inactive entities
    this.entities = this.entities.filter(entity => {
      if (!entity.active) {
        const sprite = entity.getComponent('sprite') as any;
        if (sprite && sprite.sprite && sprite.sprite.scene) {
          sprite.sprite.destroy();
        }
        return false;
      }
      return true;
    });
  }

  private createBackground(): void {
    // Create a simple grassland background
    const graphics = this.add.graphics();

    // Base grass layer
    graphics.fillStyle(0x4a7c59, 1);
    graphics.fillRect(0, 0, 5000, 5000);

    // Add some darker grass patches for variation
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 5000;
      const y = Math.random() * 5000;
      const size = 50 + Math.random() * 100;
      graphics.fillStyle(0x3a6c49, 0.5);
      graphics.fillCircle(x, y, size);
    }

    // Add some lighter grass patches
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 5000;
      const y = Math.random() * 5000;
      const size = 30 + Math.random() * 70;
      graphics.fillStyle(0x5a8c69, 0.5);
      graphics.fillCircle(x, y, size);
    }

    graphics.setDepth(0);
  }

  private togglePause(): void {
    gameState.isPaused = !gameState.isPaused;

    if (gameState.isPaused) {
      this.showPauseMenu();
    } else {
      this.hidePauseMenu();
    }
  }

  private showPauseMenu(): void {
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);
    (overlay as any).pauseMenuElement = true;

    const pauseText = this.add.text(width / 2, height / 2 - 100, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    pauseText.setOrigin(0.5);
    pauseText.setScrollFactor(0);
    pauseText.setDepth(201);
    (pauseText as any).pauseMenuElement = true;

    const resumeText = this.add.text(width / 2, height / 2, '[ RESUME ]', {
      fontSize: '32px',
      color: '#00ff88',
      backgroundColor: '#0a0a0a',
      padding: { x: 20, y: 10 }
    });
    resumeText.setOrigin(0.5);
    resumeText.setScrollFactor(0);
    resumeText.setDepth(201);
    resumeText.setInteractive({ useHandCursor: true });
    (resumeText as any).pauseMenuElement = true;

    resumeText.on('pointerdown', () => {
      this.togglePause();
    });

    const quitText = this.add.text(width / 2, height / 2 + 60, '[ QUIT TO MENU ]', {
      fontSize: '24px',
      color: '#ff4444',
      backgroundColor: '#0a0a0a',
      padding: { x: 20, y: 10 }
    });
    quitText.setOrigin(0.5);
    quitText.setScrollFactor(0);
    quitText.setDepth(201);
    quitText.setInteractive({ useHandCursor: true });
    (quitText as any).pauseMenuElement = true;

    quitText.on('pointerdown', () => {
      this.cleanup();
      this.scene.start('MenuScene');
    });
  }

  private hidePauseMenu(): void {
    this.children.list.forEach((child: any) => {
      if (child.pauseMenuElement) {
        child.destroy();
      }
    });
  }

  private checkPlayerHealth(): void {
    const player = this.entities.find(e => e.hasTag('player'));
    if (!player) return;

    const health = player.getComponent<HealthComponent>('health');
    if (health && health.isDead()) {
      eventBus.emit('game:over', {
        survivalTime: gameState.survivalTime,
        kills: gameState.kills,
        stage: gameState.currentStage
      });
    }
  }

  private onGameOver(data: any): void {
    this.cleanup();
    this.scene.start('GameOverScene', { won: false, ...data });
  }

  private onGameWon(data: any): void {
    this.cleanup();
    this.scene.start('GameOverScene', { won: true, ...data });
  }

  private showBanner(text: string, color: string): void {
    const { width, height } = this.cameras.main;

    const banner = this.add.text(width / 2, height / 2, text, {
      fontSize: '48px',
      color: color,
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 },
      stroke: color,
      strokeThickness: 4
    });
    banner.setOrigin(0.5);
    banner.setScrollFactor(0);
    banner.setDepth(150);
    banner.setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 2000,
      onComplete: () => banner.destroy()
    });
  }

  private cleanup(): void {
    eventBus.off('game:over', this.onGameOver.bind(this));
    eventBus.off('game:won', this.onGameWon.bind(this));

    // Clean up systems
    this.systems.forEach(system => {
      if (system.destroy) {
        system.destroy();
      }
    });
  }
}
