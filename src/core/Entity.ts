import { Component } from './Component';

let entityIdCounter = 0;

/**
 * Base Entity class
 * Entities are containers for components
 */
export class Entity {
  public id: number;
  public active: boolean = true;
  public tags: Set<string> = new Set();
  private components: Map<string, Component> = new Map();

  constructor() {
    this.id = entityIdCounter++;
  }

  addComponent(component: Component): this {
    this.components.set(component.name, component);
    component.entity = this;
    return this;
  }

  getComponent<T extends Component>(name: string): T | undefined {
    return this.components.get(name) as T;
  }

  hasComponent(name: string): boolean {
    return this.components.has(name);
  }

  removeComponent(name: string): void {
    const component = this.components.get(name);
    if (component) {
      component.entity = null;
      this.components.delete(name);
    }
  }

  addTag(tag: string): this {
    this.tags.add(tag);
    return this;
  }

  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  destroy(): void {
    this.active = false;
    this.components.clear();
    this.tags.clear();
  }

  reset(): void {
    this.active = true;
    this.components.clear();
    this.tags.clear();
  }
}
