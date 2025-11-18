import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { PositionComponent } from '../components/PositionComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import { HealthComponent } from '../components/HealthComponent';
import { OrbitingWeaponComponent } from '../components/OrbitingWeaponComponent';
import { HaloComponent } from '../components/HaloComponent';
import { circlesOverlap } from '../utils/MathUtils';
import { eventBus } from '../core/EventBus';

export class CollisionSystem extends System {
  private checkedPairs = new Set<string>();

  update(delta: number, entities: Entity[]): void {
    this.checkedPairs.clear();

    const activeEntities = entities.filter(e => e.active);

    // Check weapon vs enemy collisions
    this.checkWeaponVsEnemy(activeEntities);

    // Check weapon vs weapon collisions
    this.checkWeaponVsWeapon(activeEntities);

    // Check player vs enemy collisions
    this.checkPlayerVsEnemy(activeEntities);

    // Check player vs pickup collisions
    this.checkPlayerVsPickup(activeEntities);
  }

  private checkWeaponVsEnemy(entities: Entity[]): void {
    const weapons = entities.filter(e => e.hasTag('weapon'));
    const enemies = entities.filter(e => e.hasTag('enemy'));

    for (const weapon of weapons) {
      const weaponPos = weapon.getComponent<PositionComponent>('position');
      const weaponCollider = weapon.getComponent<ColliderComponent>('collider');
      const weaponComp = weapon.getComponent<OrbitingWeaponComponent>('orbitingWeapon');

      if (!weaponPos || !weaponCollider || !weaponComp) continue;

      // Find weapon owner
      const owner = entities.find(e => {
        const halo = e.getComponent<HaloComponent>('halo');
        return halo && halo.weapons.includes(weapon);
      });

      if (!owner) continue;

      for (const enemy of enemies) {
        const enemyPos = enemy.getComponent<PositionComponent>('position');
        const enemyCollider = enemy.getComponent<ColliderComponent>('collider');
        const enemyHealth = enemy.getComponent<HealthComponent>('health');
        const enemyHalo = enemy.getComponent<HaloComponent>('halo');

        if (!enemyPos || !enemyCollider || !enemyHealth) continue;

        // Skip if enemy has weapons (will be handled by weapon vs weapon)
        if (enemyHalo && enemyHalo.getWeaponCount() > 0) continue;

        // Check collision
        if (circlesOverlap(
          weaponPos.x, weaponPos.y, weaponCollider.radius,
          enemyPos.x, enemyPos.y, enemyCollider.radius
        )) {
          // Damage enemy
          enemyHealth.takeDamage(weaponComp.weapon.damage);

          // Damage weapon
          const weaponDestroyed = weaponComp.takeDamage();

          if (weaponDestroyed) {
            this.destroyWeapon(weapon, owner);
          }

          // Check if enemy died
          if (enemyHealth.isDead()) {
            eventBus.emit('enemy:killed', { enemy, position: enemyPos });
          }
        }
      }
    }
  }

  private checkWeaponVsWeapon(entities: Entity[]): void {
    const weapons = entities.filter(e => e.hasTag('weapon'));

    for (let i = 0; i < weapons.length; i++) {
      for (let j = i + 1; j < weapons.length; j++) {
        const weaponA = weapons[i];
        const weaponB = weapons[j];

        const pairKey = `${Math.min(weaponA.id, weaponB.id)}-${Math.max(weaponA.id, weaponB.id)}`;
        if (this.checkedPairs.has(pairKey)) continue;
        this.checkedPairs.add(pairKey);

        // Find owners
        const ownerA = entities.find(e => {
          const halo = e.getComponent<HaloComponent>('halo');
          return halo && halo.weapons.includes(weaponA);
        });

        const ownerB = entities.find(e => {
          const halo = e.getComponent<HaloComponent>('halo');
          return halo && halo.weapons.includes(weaponB);
        });

        // Only check if weapons have different owners
        if (!ownerA || !ownerB || ownerA === ownerB) continue;

        const posA = weaponA.getComponent<PositionComponent>('position');
        const posB = weaponB.getComponent<PositionComponent>('position');
        const colliderA = weaponA.getComponent<ColliderComponent>('collider');
        const colliderB = weaponB.getComponent<ColliderComponent>('collider');
        const weaponCompA = weaponA.getComponent<OrbitingWeaponComponent>('orbitingWeapon');
        const weaponCompB = weaponB.getComponent<OrbitingWeaponComponent>('orbitingWeapon');

        if (!posA || !posB || !colliderA || !colliderB || !weaponCompA || !weaponCompB) continue;

        // Check collision
        if (circlesOverlap(
          posA.x, posA.y, colliderA.radius,
          posB.x, posB.y, colliderB.radius
        )) {
          // Both weapons lose durability
          const weaponADestroyed = weaponCompA.takeDamage();
          const weaponBDestroyed = weaponCompB.takeDamage();

          if (weaponADestroyed) {
            this.destroyWeapon(weaponA, ownerA);
          }

          if (weaponBDestroyed) {
            this.destroyWeapon(weaponB, ownerB);
          }

          eventBus.emit('weapon:clash', { weaponA, weaponB });
        }
      }
    }
  }

  private checkPlayerVsEnemy(entities: Entity[]): void {
    const player = entities.find(e => e.hasTag('player'));
    if (!player) return;

    const playerPos = player.getComponent<PositionComponent>('position');
    const playerCollider = player.getComponent<ColliderComponent>('collider');
    const playerHealth = player.getComponent<HealthComponent>('health');

    if (!playerPos || !playerCollider || !playerHealth) return;

    const enemies = entities.filter(e => e.hasTag('enemy'));

    for (const enemy of enemies) {
      const enemyPos = enemy.getComponent<PositionComponent>('position');
      const enemyCollider = enemy.getComponent<ColliderComponent>('collider');

      if (!enemyPos || !enemyCollider) continue;

      if (circlesOverlap(
        playerPos.x, playerPos.y, playerCollider.radius,
        enemyPos.x, enemyPos.y, enemyCollider.radius
      )) {
        // Get contact damage from enemy config
        const enemyType = Array.from(enemy.tags).find(t => t !== 'enemy') || 'minion';
        const enemyConfig = (this.scene as any).gameData?.enemiesConfig?.enemyTypes?.[enemyType];
        const damage = enemyConfig?.contactDamage || 10;

        playerHealth.takeDamage(damage);
        eventBus.emit('player:damaged', { damage, playerHP: playerHealth.hp });

        // Push player away slightly (simple knockback)
        const dx = playerPos.x - enemyPos.x;
        const dy = playerPos.y - enemyPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const pushX = (dx / dist) * 50;
          const pushY = (dy / dist) * 50;
          playerPos.x += pushX;
          playerPos.y += pushY;
        }
      }
    }
  }

  private checkPlayerVsPickup(entities: Entity[]): void {
    const player = entities.find(e => e.hasTag('player'));
    if (!player) return;

    const playerPos = player.getComponent<PositionComponent>('position');
    const playerCollider = player.getComponent<ColliderComponent>('collider');

    if (!playerPos || !playerCollider) return;

    const pickups = entities.filter(e => e.hasTag('pickup'));

    for (const pickup of pickups) {
      const pickupPos = pickup.getComponent<PositionComponent>('position');
      const pickupCollider = pickup.getComponent<ColliderComponent>('collider');

      if (!pickupPos || !pickupCollider) continue;

      if (circlesOverlap(
        playerPos.x, playerPos.y, playerCollider.radius,
        pickupPos.x, pickupPos.y, pickupCollider.radius
      )) {
        eventBus.emit('pickup:collected', { pickup, player });
        pickup.active = false;
      }
    }
  }

  private destroyWeapon(weapon: Entity, owner: Entity): void {
    const halo = owner.getComponent<HaloComponent>('halo');
    if (halo) {
      halo.removeWeapon(weapon);
    }
    weapon.active = false;
  }
}
