import { Component } from '../core/Component';

export interface WeaponData {
  type: string;
  tier: number;
  damage: number;
  durability: number;
  maxDurability: number;
  radius: number;
  angle: number;
  color: number;
  scale: number;
}

export class OrbitingWeaponComponent extends Component {
  public readonly name = 'orbitingWeapon';
  public weapon: WeaponData;

  constructor(weapon: WeaponData) {
    super();
    this.weapon = weapon;
  }

  takeDamage(): boolean {
    this.weapon.durability -= 1;
    return this.weapon.durability <= 0;
  }

  reset(): void {
    this.weapon.durability = this.weapon.maxDurability;
  }
}
