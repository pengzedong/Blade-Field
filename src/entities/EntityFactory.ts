import Phaser from 'phaser';
import { Entity } from '../core/Entity';
import { PositionComponent } from '../components/PositionComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { HealthComponent } from '../components/HealthComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { HaloComponent } from '../components/HaloComponent';
import { AIComponent } from '../components/AIComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import { OrbitingWeaponComponent, WeaponData } from '../components/OrbitingWeaponComponent';
import { gameState } from '../core/GameState';

export class EntityFactory {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create player entity
   */
  createPlayer(x: number, y: number): Entity {
    const entity = new Entity();
    entity.addTag('player');

    // Position
    entity.addComponent(new PositionComponent(x, y));
    entity.addComponent(new VelocityComponent());

    // Health
    entity.addComponent(new HealthComponent(gameState.playerHP));

    // Sprite (simple circle for now)
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 15);
    graphics.setDepth(10);
    entity.addComponent(new SpriteComponent(graphics));

    // Collider
    entity.addComponent(new ColliderComponent(15, 'player'));

    // Halo for orbiting weapons
    entity.addComponent(new HaloComponent(1.0));

    return entity;
  }

  /**
   * Create enemy entity
   */
  createEnemy(x: number, y: number, enemyType: string): Entity {
    const enemyConfig = gameState.enemiesConfig.enemyTypes[enemyType];
    if (!enemyConfig) {
      console.error(`Enemy type ${enemyType} not found in config`);
      return new Entity();
    }

    const entity = new Entity();
    entity.addTag('enemy');
    entity.addTag(enemyType);

    // Position
    entity.addComponent(new PositionComponent(x, y));
    entity.addComponent(new VelocityComponent());

    // Health
    entity.addComponent(new HealthComponent(enemyConfig.hp));

    // AI
    entity.addComponent(new AIComponent(enemyConfig.speed));

    // Sprite
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(enemyConfig.color, 1);
    graphics.fillCircle(0, 0, enemyConfig.size);
    graphics.setDepth(5);
    entity.addComponent(new SpriteComponent(graphics));

    // Collider
    entity.addComponent(new ColliderComponent(enemyConfig.size, 'enemy'));

    // Halo if enemy has weapons
    if (enemyConfig.halo) {
      entity.addComponent(new HaloComponent(enemyConfig.halo.angularSpeed));
    }

    return entity;
  }

  /**
   * Create orbiting weapon entity
   */
  createOrbitingWeapon(weaponType: string, tier: number, radius: number, angle: number): Entity {
    const weaponConfig = gameState.weaponsConfig.weaponTypes[weaponType];
    if (!weaponConfig || !weaponConfig.tiers[tier]) {
      console.error(`Weapon ${weaponType} tier ${tier} not found`);
      return new Entity();
    }

    const tierConfig = weaponConfig.tiers[tier];

    const entity = new Entity();
    entity.addTag('weapon');

    // Position (will be updated by orbit system)
    entity.addComponent(new PositionComponent(0, 0));

    // Weapon data
    const weaponData: WeaponData = {
      type: weaponType,
      tier: tier,
      damage: tierConfig.damage,
      durability: tierConfig.durability,
      maxDurability: tierConfig.durability,
      radius: radius,
      angle: angle,
      color: tierConfig.color,
      scale: tierConfig.scale
    };
    entity.addComponent(new OrbitingWeaponComponent(weaponData));

    // Sprite
    const graphics = this.scene.add.graphics();
    const size = 8 * tierConfig.scale;
    graphics.fillStyle(tierConfig.color, 1);

    // Different shapes for different weapon types
    if (weaponType === 'blade') {
      graphics.fillRect(-size / 2, -size, size, size * 2); // Vertical rectangle
    } else if (weaponType === 'sword') {
      graphics.fillRect(-size / 2, -size * 1.5, size, size * 3); // Longer rectangle
    } else if (weaponType === 'staff' || weaponType === 'mythicrod') {
      graphics.fillCircle(0, 0, size); // Circle
    } else {
      graphics.fillRect(-size / 2, -size / 2, size, size); // Default square
    }

    graphics.setDepth(8);
    entity.addComponent(new SpriteComponent(graphics));

    // Collider
    entity.addComponent(new ColliderComponent(size, 'weapon'));

    return entity;
  }

  /**
   * Create pickup entity
   */
  createPickup(x: number, y: number, pickupType: string, data?: any): Entity {
    const entity = new Entity();
    entity.addTag('pickup');
    entity.addTag(pickupType);

    // Position
    entity.addComponent(new PositionComponent(x, y));

    // Sprite
    const graphics = this.scene.add.graphics();

    if (pickupType === 'health') {
      graphics.fillStyle(0xff0000, 1);
      graphics.fillCircle(0, 0, 10);
      graphics.lineStyle(2, 0xffffff);
      graphics.strokeCircle(0, 0, 10);
    } else if (pickupType === 'weapon') {
      // Color based on tier
      const tier = data?.tier || 1;
      const color = tier === 1 ? 0x888888 : tier === 2 ? 0x4444ff : 0xaa44ff;
      graphics.fillStyle(color, 1);

      // Draw a star shape manually
      const points = 5;
      const outerRadius = 12;
      const innerRadius = 6;
      graphics.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) {
          graphics.moveTo(x, y);
        } else {
          graphics.lineTo(x, y);
        }
      }
      graphics.closePath();
      graphics.fillPath();
    } else {
      graphics.fillStyle(0xffff00, 1);
      graphics.fillCircle(0, 0, 8);
    }

    graphics.setDepth(3);
    entity.addComponent(new SpriteComponent(graphics));

    // Collider
    entity.addComponent(new ColliderComponent(15, 'pickup'));

    // Store pickup data as a property
    (entity as any).pickupData = data || {};

    return entity;
  }
}
