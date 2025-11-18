import { Component } from '../core/Component';
import { Entity } from '../core/Entity';

/**
 * Halo component manages a collection of orbiting weapons for an entity
 */
export class HaloComponent extends Component {
  public readonly name = 'halo';
  public weapons: Entity[] = [];
  public angularSpeed: number = 1.0; // rotations per second

  constructor(angularSpeed: number = 1.0) {
    super();
    this.angularSpeed = angularSpeed;
  }

  addWeapon(weapon: Entity): void {
    this.weapons.push(weapon);
  }

  removeWeapon(weapon: Entity): void {
    const index = this.weapons.indexOf(weapon);
    if (index > -1) {
      this.weapons.splice(index, 1);
    }
  }

  getWeaponCount(): number {
    return this.weapons.filter(w => w.active).length;
  }

  reset(): void {
    this.weapons = [];
    this.angularSpeed = 1.0;
  }
}
