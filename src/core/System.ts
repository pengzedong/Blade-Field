import Phaser from 'phaser';
import { Entity } from './Entity';

/**
 * Base System class
 * Systems contain logic and operate on entities with specific components
 */
export abstract class System {
  protected scene: Phaser.Scene;
  public enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  abstract update(delta: number, entities: Entity[]): void;

  destroy?(): void;
}
