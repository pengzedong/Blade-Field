import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { PositionComponent } from '../components/PositionComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { clamp } from '../utils/MathUtils';

export class MovementSystem extends System {
  private worldBounds = { minX: 0, minY: 0, maxX: 5000, maxY: 5000 };

  update(delta: number, entities: Entity[]): void {
    const dt = delta / 1000; // Convert to seconds

    for (const entity of entities) {
      if (!entity.active) continue;

      const position = entity.getComponent<PositionComponent>('position');
      const velocity = entity.getComponent<VelocityComponent>('velocity');

      if (!position || !velocity) continue;

      // Update position
      position.x += velocity.vx * dt;
      position.y += velocity.vy * dt;

      // Clamp to world bounds
      position.x = clamp(position.x, this.worldBounds.minX, this.worldBounds.maxX);
      position.y = clamp(position.y, this.worldBounds.minY, this.worldBounds.maxY);

      // Update sprite position
      const sprite = entity.getComponent<SpriteComponent>('sprite');
      if (sprite) {
        sprite.setPosition(position.x, position.y);
      }
    }
  }
}
