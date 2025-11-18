import { Component } from '../core/Component';

export class VelocityComponent extends Component {
  public readonly name = 'velocity';
  public vx: number = 0;
  public vy: number = 0;

  constructor(vx: number = 0, vy: number = 0) {
    super();
    this.vx = vx;
    this.vy = vy;
  }

  reset(): void {
    this.vx = 0;
    this.vy = 0;
  }
}
