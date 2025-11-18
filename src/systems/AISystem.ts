import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { PositionComponent } from '../components/PositionComponent';
import { VelocityComponent } from '../components/VelocityComponent';
import { AIComponent } from '../components/AIComponent';
import { normalize } from '../utils/MathUtils';

export class AISystem extends System {
  private playerEntity: Entity | null = null;

  update(delta: number, entities: Entity[]): void {
    // Find player
    if (!this.playerEntity) {
      this.playerEntity = entities.find(e => e.hasTag('player')) || null;
    }

    if (!this.playerEntity || !this.playerEntity.active) return;

    const playerPos = this.playerEntity.getComponent<PositionComponent>('position');
    if (!playerPos) return;

    const currentTime = Date.now();

    for (const entity of entities) {
      if (!entity.active || !entity.hasTag('enemy')) continue;

      const ai = entity.getComponent<AIComponent>('ai');
      const position = entity.getComponent<PositionComponent>('position');
      const velocity = entity.getComponent<VelocityComponent>('velocity');

      if (!ai || !position || !velocity) continue;

      // Update target periodically
      if (currentTime - ai.lastUpdate > ai.updateInterval) {
        ai.targetX = playerPos.x;
        ai.targetY = playerPos.y;
        ai.lastUpdate = currentTime;
      }

      // Move toward target
      const dx = ai.targetX - position.x;
      const dy = ai.targetY - position.y;
      const normalized = normalize(dx, dy);

      velocity.vx = normalized.x * ai.speed;
      velocity.vy = normalized.y * ai.speed;
    }
  }
}
