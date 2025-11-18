import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { PositionComponent } from '../components/PositionComponent';
import { HaloComponent } from '../components/HaloComponent';
import { OrbitingWeaponComponent } from '../components/OrbitingWeaponComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { gameState } from '../core/GameState';

export class OrbitSystem extends System {
  update(delta: number, entities: Entity[]): void {
    const dt = delta / 1000;

    for (const entity of entities) {
      if (!entity.active) continue;

      const halo = entity.getComponent<HaloComponent>('halo');
      const position = entity.getComponent<PositionComponent>('position');

      if (!halo || !position) continue;

      // Update weapon positions and angles
      const activeWeapons = halo.weapons.filter(w => w.active);
      const weaponCount = activeWeapons.length;

      if (weaponCount === 0) continue;

      // Distribute weapons across multiple rings
      const ringRadii = gameState.weaponsConfig?.orbitDefaults?.ringRadii || [80, 120, 160];
      const weaponsPerRing = Math.ceil(weaponCount / ringRadii.length);

      activeWeapons.forEach((weapon, index) => {
        const weaponComp = weapon.getComponent<OrbitingWeaponComponent>('orbitingWeapon');
        const weaponPos = weapon.getComponent<PositionComponent>('position');
        const weaponSprite = weapon.getComponent<SpriteComponent>('sprite');

        if (!weaponComp || !weaponPos) return;

        // Determine which ring this weapon is on
        const ringIndex = Math.floor(index / weaponsPerRing);
        const weaponIndexInRing = index % weaponsPerRing;
        const weaponsInThisRing = Math.min(weaponsPerRing, weaponCount - ringIndex * weaponsPerRing);

        // Update radius based on ring
        weaponComp.weapon.radius = ringRadii[Math.min(ringIndex, ringRadii.length - 1)];

        // Update angle
        weaponComp.weapon.angle += halo.angularSpeed * Math.PI * 2 * dt;

        // Evenly space weapons in the ring
        const angleOffset = (weaponIndexInRing / weaponsInThisRing) * Math.PI * 2;
        const finalAngle = weaponComp.weapon.angle + angleOffset;

        // Calculate position
        weaponPos.x = position.x + Math.cos(finalAngle) * weaponComp.weapon.radius;
        weaponPos.y = position.y + Math.sin(finalAngle) * weaponComp.weapon.radius;

        // Update sprite
        if (weaponSprite) {
          weaponSprite.setPosition(weaponPos.x, weaponPos.y);
          weaponSprite.sprite.setRotation(finalAngle);
        }
      });

      // Update weapon count in game state for player
      if (entity.hasTag('player')) {
        gameState.weaponCount = weaponCount;
      }
    }
  }
}
