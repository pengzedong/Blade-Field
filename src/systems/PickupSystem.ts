import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { eventBus } from '../core/EventBus';
import { HealthComponent } from '../components/HealthComponent';
import { gameState } from '../core/GameState';

export class PickupSystem extends System {
  private spawnSystem: any;

  constructor(scene: Phaser.Scene, spawnSystem: any) {
    super(scene);
    this.spawnSystem = spawnSystem;

    // Listen for pickup collection events
    eventBus.on('pickup:collected', this.onPickupCollected.bind(this));
  }

  update(delta: number, entities: Entity[]): void {
    // Pickups are handled via events
  }

  private onPickupCollected(data: { pickup: Entity; player: Entity }): void {
    const { pickup, player } = data;

    if (pickup.hasTag('health')) {
      this.handleHealthPickup(player);
    } else if (pickup.hasTag('weapon')) {
      this.handleWeaponPickup(player, pickup);
    }

    // Clean up pickup sprite
    const sprite = pickup.getComponent('sprite') as any;
    if (sprite) {
      sprite.sprite.destroy();
    }

    eventBus.emit('ui:popup', {
      text: this.getPickupText(pickup),
      x: pickup.getComponent<any>('position')?.x || 0,
      y: pickup.getComponent<any>('position')?.y || 0
    });
  }

  private handleHealthPickup(player: Entity): void {
    const health = player.getComponent<HealthComponent>('health');
    if (health) {
      health.heal(25);
      gameState.playerHP = health.hp;
      eventBus.emit('player:healed', { hp: health.hp });
    }
  }

  private handleWeaponPickup(player: Entity, pickup: Entity): void {
    const pickupData = (pickup as any).pickupData || {};
    const weaponType = pickupData.weaponType || 'blade';
    const tier = pickupData.tier || 1;

    this.spawnSystem.addWeaponToPlayer(player, weaponType, tier);
  }

  private getPickupText(pickup: Entity): string {
    if (pickup.hasTag('health')) {
      return '+25 HP';
    } else if (pickup.hasTag('weapon')) {
      const pickupData = (pickup as any).pickupData || {};
      const weaponType = pickupData.weaponType || 'blade';
      const tier = pickupData.tier || 1;
      const tierName = tier === 1 ? 'Common' : tier === 2 ? 'Rare' : 'Epic';
      return `+${tierName} ${weaponType}`;
    }
    return '+Item';
  }

  destroy(): void {
    eventBus.off('pickup:collected', this.onPickupCollected.bind(this));
  }
}
