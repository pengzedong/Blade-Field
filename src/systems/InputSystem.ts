import Phaser from 'phaser';
import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { VelocityComponent } from '../components/VelocityComponent';
import { gameState } from '../core/GameState';
import { normalize } from '../utils/MathUtils';

export class InputSystem extends System {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene) {
    super(scene);

    // Set up keyboard input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  }

  update(delta: number, entities: Entity[]): void {
    if (gameState.isPaused) return;

    const player = entities.find(e => e.hasTag('player'));
    if (!player) return;

    const velocity = player.getComponent<VelocityComponent>('velocity');
    if (!velocity) return;

    // Get input
    let inputX = 0;
    let inputY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      inputX -= 1;
    }
    if (this.cursors.right.isDown || this.wasd.D.isDown) {
      inputX += 1;
    }
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      inputY -= 1;
    }
    if (this.cursors.down.isDown || this.wasd.S.isDown) {
      inputY += 1;
    }

    // Normalize diagonal movement
    if (inputX !== 0 || inputY !== 0) {
      const normalized = normalize(inputX, inputY);
      velocity.vx = normalized.x * gameState.playerSpeed;
      velocity.vy = normalized.y * gameState.playerSpeed;
    } else {
      velocity.vx = 0;
      velocity.vy = 0;
    }
  }
}
