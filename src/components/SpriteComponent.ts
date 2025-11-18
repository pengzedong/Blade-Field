import Phaser from 'phaser';
import { Component } from '../core/Component';

export class SpriteComponent extends Component {
  public readonly name = 'sprite';
  public sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Sprite;

  constructor(sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Sprite) {
    super();
    this.sprite = sprite;
  }

  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }

  setVisible(visible: boolean): void {
    this.sprite.setVisible(visible);
  }

  destroy(): void {
    this.sprite.destroy();
  }

  reset(): void {
    this.sprite.setVisible(true);
  }
}
