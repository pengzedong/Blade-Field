# Blade Field

A 2D action survival arena game where you build an enormous rotating weapon halo to defeat waves of monsters and bosses.

## Game Overview

**Genre:** 2D action survival / arena "clean-up" game
**Perspective:** Top-down with 2.5D-styled visuals

### Core Gameplay

- **Orbiting Weapons:** Start with 3 blades that automatically orbit around you, damaging nearby enemies
- **Weapon Collection:** Pick up scattered weapon orbs to expand your halo up to 50 weapons
- **Halo vs Halo Combat:** Elite enemies and bosses have their own weapon halos - when halos collide, weapons cancel based on durability
- **Stage Progression:** Defeat target numbers of enemies (25 → 50 → 75) to progress through 3 stages
- **Boss Battles:** Face increasingly powerful bosses with massive weapon halos at the end of each stage

## Technology Stack

- **Language:** TypeScript
- **Game Engine:** Phaser 3
- **Build Tool:** Vite
- **Architecture:** Entity-Component-System (ECS) with data-driven design

## Project Structure

```
blade-field/
├── src/
│   ├── core/              # Core ECS architecture
│   │   ├── Entity.ts      # Base entity class
│   │   ├── Component.ts   # Base component class
│   │   ├── System.ts      # Base system class
│   │   ├── EventBus.ts    # Observer pattern event system
│   │   ├── GameState.ts   # Global game state manager
│   │   └── ObjectPool.ts  # Object pooling for performance
│   ├── components/        # Game components (data)
│   │   ├── PositionComponent.ts
│   │   ├── VelocityComponent.ts
│   │   ├── HealthComponent.ts
│   │   ├── HaloComponent.ts
│   │   ├── OrbitingWeaponComponent.ts
│   │   ├── AIComponent.ts
│   │   └── ColliderComponent.ts
│   ├── systems/           # Game systems (logic)
│   │   ├── InputSystem.ts       # Player input handling
│   │   ├── MovementSystem.ts    # Entity movement
│   │   ├── OrbitSystem.ts       # Weapon orbiting logic
│   │   ├── AISystem.ts          # Enemy AI
│   │   ├── CollisionSystem.ts   # All collision detection
│   │   ├── SpawnSystem.ts       # Enemy spawning
│   │   ├── PickupSystem.ts      # Pickup collection
│   │   ├── StageSystem.ts       # Stage progression
│   │   └── UISystem.ts          # HUD and UI
│   ├── entities/          # Entity factories
│   │   └── EntityFactory.ts
│   ├── scenes/            # Phaser scenes
│   │   ├── BootScene.ts         # Config loading
│   │   ├── MenuScene.ts         # Main menu
│   │   ├── GameScene.ts         # Main gameplay
│   │   └── GameOverScene.ts     # Game over screen
│   ├── utils/             # Utility functions
│   │   └── MathUtils.ts
│   └── main.ts            # Game entry point
├── public/
│   └── data/              # Configuration files (JSON)
│       ├── weapons.json   # Weapon types and tiers
│       ├── enemies.json   # Enemy definitions
│       └── stages.json    # Stage configurations
├── index.html             # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## How to Run Locally

### Prerequisites

- **Node.js:** Version 18 or higher ([Download](https://nodejs.org/))
- **npm:** Comes with Node.js

### Step 1: Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- `phaser` - Game framework
- `typescript` - TypeScript compiler
- `vite` - Development server and build tool

### Step 2: Start Development Server

Run the development server:

```bash
npm run dev
```

You should see output like:

```
VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Open in Browser

Open your web browser and navigate to:

```
http://localhost:5173
```

The game should load automatically!

### Alternative: Direct HTML Open (No Server)

For the simplest setup, after building:

```bash
npm run build
```

Then open `dist/index.html` directly in your browser.

## How to Run in a Cloud IDE

### GitHub Codespaces / VS Code in Browser

1. Open the project in your cloud IDE
2. Open the built-in terminal
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. When prompted, open the preview URL (usually port 5173)
5. The game will load in the preview panel or new tab

## Game Controls

### Movement
- **W** or **↑** - Move Up
- **A** or **←** - Move Left
- **S** or **↓** - Move Down
- **D** or **→** - Move Right

### Other
- **ESC** - Pause/Unpause
- **SPACE** - Quick restart (from menu)

## Gameplay Tips

1. **Keep Moving:** Standing still makes you an easy target
2. **Collect Weapons:** More weapons = stronger halo = better defense and offense
3. **Weapon Tiers Matter:** Higher tier weapons (Rare, Epic) have more durability
4. **Watch Your HP:** Collect health pickups (red orbs) when low
5. **Boss Strategy:** Let your weapon halo clash with the boss's weapons to wear them down

## Data-Driven Design

### Adding New Stages

To add Stage 4 and beyond, edit `public/data/stages.json`:

```json
{
  "stages": [
    // ... existing stages ...
    {
      "id": 4,
      "killTarget": 100,
      "spawnRate": 2.0,
      "enemyTypes": {
        "minion": { "weight": 0.3 },
        "elite": { "weight": 0.7 }
      },
      "boss": {
        "enabled": true,
        "enemyType": "boss_final"
      },
      "weaponDropRates": {
        "sword": { "tier": 2, "weight": 0.4 },
        "blade_epic": { "tier": 3, "weight": 0.3 },
        "mythicrod": { "tier": 3, "weight": 0.3 }
      }
    }
  ]
}
```

No code changes required!

### Adding New Enemy Types

Edit `public/data/enemies.json`:

```json
{
  "enemyTypes": {
    "super_elite": {
      "name": "Super Elite",
      "hp": 200,
      "contactDamage": 30,
      "speed": 200,
      "color": 0xffaa00,
      "size": 40,
      "halo": {
        "weaponType": "sword",
        "tier": 3,
        "count": 6,
        "radius": 70,
        "angularSpeed": 1.0
      },
      "xpValue": 10
    }
  }
}
```

### Adding New Weapon Types

Edit `public/data/weapons.json` to add new weapon types with custom tiers, damage, and durability.

## Architecture Highlights

### Entity-Component-System (ECS)

- **Entities:** Containers with unique IDs
- **Components:** Pure data (Position, Health, Velocity, etc.)
- **Systems:** Logic that operates on entities with specific components

### Object Pooling

Enemies and weapons use object pools to avoid frequent allocations:
- Pre-allocates objects at startup
- Reuses inactive objects instead of creating new ones
- Significantly improves performance with 100+ entities

### Event-Driven Communication

Uses an EventBus for decoupled communication:
- UI updates on `player:damaged`, `enemy:killed`
- Stage system listens for `enemy:killed` to track progress
- No tight coupling between systems

## Performance

Optimized for **60 FPS** with:
- 100-150 active enemies
- Up to 50 orbiting weapons per entity
- Camera culling (only updates/renders visible entities)
- Object pooling
- Efficient collision detection

## Build for Production

Create an optimized production build:

```bash
npm run build
```

Output will be in the `dist/` folder. You can:
- Host on any static file server
- Deploy to GitHub Pages, Netlify, Vercel, etc.
- Open `dist/index.html` directly in a browser

## Troubleshooting

### Port 5173 already in use

Change the port in `vite.config.ts`:

```typescript
server: {
  port: 3000, // Use different port
  open: true
}
```

### TypeScript errors

Make sure you have the correct Node.js version:

```bash
node --version  # Should be v18 or higher
```

### Game doesn't load

1. Check browser console for errors (F12)
2. Ensure all JSON config files are valid
3. Clear browser cache and reload

## License

This project is open source. See LICENSE file for details.

## Credits

Built with:
- **Phaser 3** - HTML5 game framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast dev server

---

**Enjoy playing Blade Field!**