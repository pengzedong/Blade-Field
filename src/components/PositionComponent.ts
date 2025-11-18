import { Component } from '../core/Component';

export class PositionComponent extends Component {
  public readonly name = 'position';
  public x: number = 0;
  public y: number = 0;

  constructor(x: number = 0, y: number = 0) {
    super();
    this.x = x;
    this.y = y;
  }

  reset(): void {
    this.x = 0;
    this.y = 0;
  }
}
