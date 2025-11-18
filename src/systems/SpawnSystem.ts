import Phaser from 'phaser';
import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { ObjectPool } from '../core/ObjectPool';
import { EntityFactory } from '../entities/EntityFactory';
import { gameState } from '../core/GameState';
import { weightedRandom, randomRange } from '../utils/MathUtils';
import { PositionComponent } from '../components/PositionComponent';
import { HaloComponent } from '../components/HaloComponent';

export class SpawnSystem extends System {
  private entityFactory: EntityFactory;
  private enemyPool: ObjectPool<Entity>;
  private weaponPool: ObjectPool<Entity>;
  private spawnTimer: number = 0;
  private spawnInterval: number = 2000; // ms
  private camera: Phaser.Cameras.Scene2D.Camera;
  private entities: Entity[];

  constructor(scene: Phaser.Scene, entities: Entity[]) {
    super(scene);
    this.entityFactory = new EntityFactory(scene);
    this.entities = entities;
    this.camera = scene.cameras.main;

    // Initialize object pools
    this.enemyPool = new ObjectPool(
      () => this.entityFactory.createEnemy(0, 0, 'minion'),
      (entity) => entity.reset(),
      20
    );

    this.weaponPool = new ObjectPool(
      () => this.entityFactory.createOrbitingWeapon('blade', 1, 80, 0),
      (entity) => entity.reset(),
      100
    );
  }

  update(delta: number, entities: Entity[]): void {
    if (gameState.isPaused || gameState.bossSpawned) return;

    this.spawnTimer += delta;

    const currentStageConfig = this.getCurrentStageConfig();
    if (!currentStageConfig) return;

    const spawnInterval = this.spawnInterval / currentStageConfig.spawnRate;

    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy(currentStageConfig);
    }
  }

  private getCurrentStageConfig(): any {
    if (!gameState.stagesConfig) return null;
    return gameState.stagesConfig.stages.find((s: any) => s.id === gameState.currentStage);
  }

  private spawnEnemy(stageConfig: any): void {
    // Choose enemy type based on weights
    const enemyTypes = Object.entries(stageConfig.enemyTypes).map(([type, config]: [string, any]) => ({
      item: type,
      weight: config.weight
    }));

    const enemyType = weightedRandom(enemyTypes);

    // Spawn position outside camera view
    const spawnPos = this.getSpawnPosition();

    // Get or create enemy from pool
    const enemy = this.entityFactory.createEnemy(spawnPos.x, spawnPos.y, enemyType);

    // Add enemy weapons if configured
    const enemyConfig = gameState.enemiesConfig.enemyTypes[enemyType];
    if (enemyConfig.halo) {
      const halo = enemy.getComponent<HaloComponent>('halo');
      if (halo) {
        this.addWeaponsToEntity(enemy, halo, enemyConfig.halo);
      }
    }

    this.entities.push(enemy);
  }

  public spawnBoss(bossType: string, position?: { x: number; y: number }): void {
    const spawnPos = position || this.getSpawnPosition();
    const boss = this.entityFactory.createEnemy(spawnPos.x, spawnPos.y, bossType);

    // Add boss weapons
    const bossConfig = gameState.enemiesConfig.enemyTypes[bossType];
    if (bossConfig.halo) {
      const halo = boss.getComponent<HaloComponent>('halo');
      if (halo) {
        this.addWeaponsToEntity(boss, halo, bossConfig.halo);
      }
    }

    this.entities.push(boss);
    gameState.bossSpawned = true;
  }

  private addWeaponsToEntity(entity: Entity, halo: HaloComponent, haloConfig: any): void {
    const { weaponType, tier, count, radius } = haloConfig;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const weapon = this.entityFactory.createOrbitingWeapon(weaponType, tier, radius, angle);
      halo.addWeapon(weapon);
      this.entities.push(weapon);
    }
  }

  public addWeaponToPlayer(player: Entity, weaponType: string, tier: number): void {
    const halo = player.getComponent<HaloComponent>('halo');
    if (!halo) return;

    if (halo.getWeaponCount() >= gameState.maxWeapons) {
      console.log('Max weapons reached');
      return;
    }

    const orbitDefaults = gameState.weaponsConfig?.orbitDefaults || { radius: 80 };
    const weapon = this.entityFactory.createOrbitingWeapon(
      weaponType,
      tier,
      orbitDefaults.radius,
      Math.random() * Math.PI * 2
    );

    halo.addWeapon(weapon);
    this.entities.push(weapon);
  }

  private getSpawnPosition(): { x: number; y: number } {
    const playerEntity = this.entities.find(e => e.hasTag('player'));
    if (!playerEntity) {
      return { x: 2500, y: 2500 };
    }

    const playerPos = playerEntity.getComponent<PositionComponent>('position');
    if (!playerPos) {
      return { x: 2500, y: 2500 };
    }

    // Spawn at random angle around player, outside camera view
    const angle = Math.random() * Math.PI * 2;
    const distance = 800; // Distance from player

    return {
      x: playerPos.x + Math.cos(angle) * distance,
      y: playerPos.y + Math.sin(angle) * distance
    };
  }

  public spawnPickup(x: number, y: number, pickupType: string, data?: any): void {
    const pickup = this.entityFactory.createPickup(x, y, pickupType, data);
    this.entities.push(pickup);
  }
}
