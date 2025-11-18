import { Entity } from './Entity';

/**
 * Base Component class
 * Components hold data, not logic
 */
export abstract class Component {
  public entity: Entity | null = null;
  public abstract readonly name: string;

  reset?(): void;
}
