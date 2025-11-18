import { Component } from '../core/Component';

export class HealthComponent extends Component {
  public readonly name = 'health';
  public hp: number;
  public maxHp: number;

  constructor(hp: number) {
    super();
    this.hp = hp;
    this.maxHp = hp;
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  reset(): void {
    this.hp = this.maxHp;
  }
}
