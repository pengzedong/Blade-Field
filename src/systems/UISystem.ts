import Phaser from 'phaser';
import { System } from '../core/System';
import { Entity } from '../core/Entity';
import { eventBus } from '../core/EventBus';
import { gameState } from '../core/GameState';

export class UISystem extends System {
  private hpText!: Phaser.GameObjects.Text;
  private stageText!: Phaser.GameObjects.Text;
  private killsText!: Phaser.GameObjects.Text;
  private weaponsText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private popups: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.createHUD();

    // Listen for UI events
    eventBus.on('ui:popup', this.showPopup.bind(this));
    eventBus.on('player:damaged', this.flashScreen.bind(this));
  }

  private createHUD(): void {
    const textStyle = {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    };

    // Top-left: HP
    this.hpText = this.scene.add.text(10, 10, 'HP: 100/100', textStyle);
    this.hpText.setScrollFactor(0);
    this.hpText.setDepth(100);

    // Top-right: Stage and Kills
    this.stageText = this.scene.add.text(
      Number(this.scene.game.config.width) - 200,
      10,
      'Stage: 1',
      textStyle
    );
    this.stageText.setScrollFactor(0);
    this.stageText.setDepth(100);

    this.killsText = this.scene.add.text(
      Number(this.scene.game.config.width) - 200,
      40,
      'Kills: 0/25',
      textStyle
    );
    this.killsText.setScrollFactor(0);
    this.killsText.setDepth(100);

    // Bottom-left: Weapons
    this.weaponsText = this.scene.add.text(
      10,
      Number(this.scene.game.config.height) - 40,
      'Weapons: 3/50',
      textStyle
    );
    this.weaponsText.setScrollFactor(0);
    this.weaponsText.setDepth(100);

    // Bottom-right: Time
    this.timeText = this.scene.add.text(
      Number(this.scene.game.config.width) - 150,
      Number(this.scene.game.config.height) - 40,
      'Time: 00:00',
      textStyle
    );
    this.timeText.setScrollFactor(0);
    this.timeText.setDepth(100);
  }

  update(delta: number, entities: Entity[]): void {
    // Update HUD
    const player = entities.find(e => e.hasTag('player'));
    if (player) {
      const health = player.getComponent('health') as any;
      if (health) {
        this.hpText.setText(`HP: ${Math.ceil(health.hp)}/${health.maxHp}`);

        // Color based on HP percentage
        const hpPercent = health.hp / health.maxHp;
        if (hpPercent > 0.5) {
          this.hpText.setColor('#00ff00');
        } else if (hpPercent > 0.25) {
          this.hpText.setColor('#ffff00');
        } else {
          this.hpText.setColor('#ff0000');
        }
      }
    }

    this.stageText.setText(`Stage: ${gameState.currentStage}`);
    this.killsText.setText(`Kills: ${gameState.kills}/${gameState.killTarget}`);
    this.weaponsText.setText(`Weapons: ${gameState.weaponCount}/${gameState.maxWeapons}`);

    const minutes = Math.floor(gameState.survivalTime / 60);
    const seconds = Math.floor(gameState.survivalTime % 60);
    this.timeText.setText(`Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

    // Update popups
    this.popups = this.popups.filter(popup => {
      if (!popup.active) return false;

      const alpha = popup.alpha - 0.02;
      popup.setAlpha(alpha);
      popup.y -= 1;

      if (alpha <= 0) {
        popup.destroy();
        return false;
      }

      return true;
    });
  }

  private showPopup(data: { text: string; x: number; y: number }): void {
    const popup = this.scene.add.text(data.x, data.y, data.text, {
      fontSize: '16px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4
    });
    popup.setOrigin(0.5);
    popup.setDepth(99);
    this.popups.push(popup);
  }

  private flashScreen(data: any): void {
    const flash = this.scene.add.rectangle(
      0,
      0,
      Number(this.scene.game.config.width) * 2,
      Number(this.scene.game.config.height) * 2,
      0xff0000,
      0.3
    );
    flash.setScrollFactor(0);
    flash.setDepth(98);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
  }

  destroy(): void {
    eventBus.off('ui:popup', this.showPopup.bind(this));
    eventBus.off('player:damaged', this.flashScreen.bind(this));
  }
}
