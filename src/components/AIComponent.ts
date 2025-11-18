import { Component } from '../core/Component';

export class AIComponent extends Component {
  public readonly name = 'ai';
  public targetX: number = 0;
  public targetY: number = 0;
  public speed: number = 150;
  public updateInterval: number = 500; // ms
  public lastUpdate: number = 0;

  constructor(speed: number = 150) {
    super();
    this.speed = speed;
  }

  reset(): void {
    this.targetX = 0;
    this.targetY = 0;
    this.lastUpdate = 0;
  }
}
