# EUG Engine — Modular Architecture

**EUG Engine** is a single-file HTML 3D mobile game builder powered by PlayCanvas.js.
This repo splits the engine into clean modules for easier debugging and development.

## Repository Structure

```
eug-engine/
├── index.html              ← Main engine (loads all modules)
├── README.md               ← This file
│
├── core/
│   ├── eug-core.js         ← PlayCanvas init, scene, sky, ground, grid
│   ├── eug-player.js       ← Player movement, collision, spawn, camera
│   └── eug-bullet.js       ← Bullet system + config
│
├── systems/
│   ├── eug-hud.js          ← GTA HUD, player state, weapon wheel, bombs
│   ├── eug-blueprint.js    ← Blueprint runtime, node catalog, executor
│   ├── eug-script.js       ← Script component system (per-entity JS)
│   ├── eug-npc.js          ← NPC AI (wander, patrol, follow, idle)
│   └── eug-weather.js      ← Weather system (8 presets + auto cycle)
│
├── editor/
│   ├── eug-editor.js       ← Edit mode, gizmo, selection, properties panel
│   ├── eug-build.js        ← Buildings, roads, props, GLB import
│   ├── eug-city.js         ← Procedural city generator
│   └── eug-publish.js      ← Publish / export standalone game
│
└── utils/
    ├── eug-save.js         ← Save / Load scene (JSON + localStorage)
    ├── eug-minimap.js      ← Minimap canvas overlay
    └── eug-console.js      ← Dev console / logger

```

## How Modules Load

`index.html` boots PlayCanvas, then loads modules in order via `loadScript()`:

```
1. core/eug-core.js        (PlayCanvas scene)
2. core/eug-player.js      (depends on core)
3. core/eug-bullet.js      (depends on player)
4. systems/eug-hud.js      (depends on player)
5. systems/eug-blueprint.js (depends on all systems)
6. editor/eug-editor.js    (depends on core)
7. editor/eug-build.js     (depends on editor)
8. editor/eug-publish.js   (depends on build)
9. utils/eug-save.js       (depends on build)
... etc
```

## CDN URLs (via jsDelivr)

Once pushed to GitHub (`user/eug-engine`), each module is available at:

```
https://cdn.jsdelivr.net/gh/YOUR_USERNAME/eug-engine@main/core/eug-core.js
https://cdn.jsdelivr.net/gh/YOUR_USERNAME/eug-engine@main/systems/eug-hud.js
```

## Development

- Edit any `.js` file → push to GitHub → engine auto-loads latest version
- Debug a specific system → open only that file, ~200-500 lines max
- No build step needed — plain JavaScript, no npm

## Version History

| File | Description |
|------|-------------|
| `EUG_BP_1779724026.html` | Last monolith — v3.0 Blueprint Edition |
| `EUG_RunFireColl_*.html` | Stable before blueprint upgrade |
| `EUG_Move_*.html` | Movement + collision stable |

