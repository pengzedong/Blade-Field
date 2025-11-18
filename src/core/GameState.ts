/**
 * Global game state manager
 * Holds player stats, stage info, and game configuration
 */
export class GameState {
  // Player stats
  public playerHP: number = 100;
  public playerMaxHP: number = 100;
  public playerSpeed: number = 200;

  // Stage progress
  public currentStage: number = 1;
  public kills: number = 0;
  public killTarget: number = 25;
  public bossSpawned: boolean = false;
  public bossDefeated: boolean = false;

  // Timing
  public survivalTime: number = 0;
  public isPaused: boolean = false;

  // Weapon count
  public weaponCount: number = 0;
  public maxWeapons: number = 50;

  // Configuration data (loaded from JSON)
  public weaponsConfig: any = null;
  public enemiesConfig: any = null;
  public stagesConfig: any = null;

  // Audio settings
  public masterVolume: number = 1.0;
  public sfxMuted: boolean = false;

  reset(): void {
    this.playerHP = 100;
    this.playerMaxHP = 100;
    this.playerSpeed = 200;
    this.currentStage = 1;
    this.kills = 0;
    this.killTarget = 25;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.survivalTime = 0;
    this.isPaused = false;
    this.weaponCount = 0;
    this.maxWeapons = 50;
  }
}

// Global game state instance
export const gameState = new GameState();
