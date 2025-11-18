import { Component } from '../core/Component';

export class ColliderComponent extends Component {
  public readonly name = 'collider';
  public radius: number;
  public layer: string; // 'player', 'enemy', 'weapon', 'pickup'

  constructor(radius: number, layer: string) {
    super();
    this.radius = radius;
    this.layer = layer;
  }

  reset(): void {
    // Radius and layer typically don't need reset
  }
}
