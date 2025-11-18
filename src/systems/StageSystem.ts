import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { eventBus } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { PositionComponent } from '../components/PositionComponent';
import { weightedRandom } from '../utils/MathUtils';

export class StageSystem extends System {
  private spawnSystem: any;

  constructor(scene: Phaser.Scene, spawnSystem: any) {
    super(scene);
    this.spawnSystem = spawnSystem;

    // Listen for enemy kills
    eventBus.on('enemy:killed', this.onEnemyKilled.bind(this));

    // Initialize first stage
    this.initStage();
  }

  update(delta: number, entities: Entity[]): void {
    // Stage progression is event-driven
    if (!gameState.isPaused) {
      gameState.survivalTime += delta / 1000;
    }
  }

  private initStage(): void {
    const stageConfig = this.getCurrentStageConfig();
    if (stageConfig) {
      gameState.killTarget = stageConfig.killTarget;
      gameState.kills = 0;
      gameState.bossSpawned = false;
      gameState.bossDefeated = false;

      eventBus.emit('stage:started', { stage: gameState.currentStage });
    }
  }

  private onEnemyKilled(data: { enemy: Entity; position: PositionComponent }): void {
    gameState.kills++;

    // Drop pickup chance
    if (Math.random() < 0.3) {
      this.dropPickup(data.position);
    }

    // Check if boss was killed
    if (data.enemy.hasTag('boss_basic') || data.enemy.hasTag('boss_shield') || data.enemy.hasTag('boss_final')) {
      gameState.bossDefeated = true;
      eventBus.emit('boss:defeated', {});

      // Drop multiple pickups for boss
      for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 100;
        this.dropPickup({ x: data.position.x + offsetX, y: data.position.y + offsetY } as any);
      }

      // Advance to next stage
      this.advanceStage();
    } else if (gameState.kills >= gameState.killTarget && !gameState.bossSpawned) {
      // Spawn boss
      this.spawnStageBoss();
    }

    eventBus.emit('enemy:kill_count', { kills: gameState.kills, target: gameState.killTarget });

    // Clean up enemy sprite
    const sprite = data.enemy.getComponent('sprite') as any;
    if (sprite) {
      sprite.sprite.destroy();
    }
    data.enemy.active = false;
  }

  private spawnStageBoss(): void {
    const stageConfig = this.getCurrentStageConfig();
    if (!stageConfig || !stageConfig.boss || !stageConfig.boss.enabled) {
      this.advanceStage();
      return;
    }

    const bossType = stageConfig.boss.enemyType;
    this.spawnSystem.spawnBoss(bossType);

    eventBus.emit('boss:spawned', { bossType });
  }

  private advanceStage(): void {
    gameState.currentStage++;

    // Check if there's a next stage
    const nextStageConfig = this.getCurrentStageConfig();
    if (nextStageConfig) {
      this.initStage();
    } else {
      // Game won
      eventBus.emit('game:won', {
        survivalTime: gameState.survivalTime,
        kills: gameState.kills
      });
    }
  }

  private dropPickup(position: PositionComponent): void {
    const stageConfig = this.getCurrentStageConfig();
    if (!stageConfig) return;

    // Random chance for health vs weapon
    if (Math.random() < 0.2) {
      this.spawnSystem.spawnPickup(position.x, position.y, 'health');
    } else {
      // Drop weapon based on stage config
      const weaponDrop = this.getRandomWeaponDrop(stageConfig);
      this.spawnSystem.spawnPickup(position.x, position.y, 'weapon', weaponDrop);
    }
  }

  private getRandomWeaponDrop(stageConfig: any): any {
    const weaponDropRates = stageConfig.weaponDropRates || {};

    const items = Object.entries(weaponDropRates).map(([key, value]: [string, any]) => {
      // Parse weapon type and tier from key (e.g., "blade_rare" or "blade")
      const parts = key.split('_');
      const weaponType = parts[0];
      const tier = value.tier || 1;

      return {
        item: { weaponType, tier },
        weight: value.weight || 0.1
      };
    });

    if (items.length === 0) {
      return { weaponType: 'blade', tier: 1 };
    }

    return weightedRandom(items);
  }

  private getCurrentStageConfig(): any {
    if (!gameState.stagesConfig) return null;
    return gameState.stagesConfig.stages.find((s: any) => s.id === gameState.currentStage);
  }

  destroy(): void {
    eventBus.off('enemy:killed', this.onEnemyKilled.bind(this));
  }
}
