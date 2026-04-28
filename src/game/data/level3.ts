import type { LevelData } from "../types";

export const levelThree: LevelData = {
  id: "restoration-zone",
  name: "Fase 3: Bosque da Restauracao",
  introTitle: "Bosque da Restauracao",
  introText:
    "A floresta engoliu as ruinas, mas ainda exige precisao. Cruze troncos vivos, dutos afogados e torres tomadas por raizes para despertar os tres nucleos finais.",
  victoryTitle: "Restauracao Completa",
  victoryText:
    "O ultimo nucleo desperta sob folhas, agua e luz azul. O mundo nao voltou a ser o que era, mas voltou a ter futuro.",
  width: 6464,
  height: 720,
  start: { x: 128, y: 512 },
  goalArea: { x: 6160, y: 272, width: 192, height: 288 },

  platforms: [
    // Zona 1: tutorial vivo
    { id: "z1-ground-start", kind: "static", x: 0, y: 608, width: 736, height: 112 },
    { id: "z1-branch-a", kind: "static", x: 800, y: 552, width: 96, height: 24, slippery: true },
    { id: "z1-branch-b", kind: "breakable", x: 960, y: 504, width: 96, height: 24, breakDelay: 0.84, respawnDelay: 2.5, slippery: true },
    {
      id: "z1-log-c",
      kind: "moving",
      x: 1120,
      y: 456,
      width: 96,
      height: 24,
      moveAxis: "x",
      range: 40,
      speed: 0.9,
      originX: 1120,
      originY: 456,
      slippery: true
    },
    { id: "z1-landing", kind: "static", x: 1280, y: 608, width: 192, height: 112 },

    // Zona 2: troncos moveis + nucleo do rio
    { id: "z2-bank-left", kind: "static", x: 1456, y: 608, width: 160, height: 112 },
    {
      id: "z2-log-a",
      kind: "moving",
      x: 1616,
      y: 552,
      width: 96,
      height: 24,
      moveAxis: "x",
      range: 84,
      speed: 1.18,
      originX: 1616,
      originY: 552,
      slippery: true
    },
    { id: "z2-stone-a", kind: "static", x: 1792, y: 504, width: 64, height: 24, slippery: true },
    {
      id: "z2-log-b",
      kind: "moving",
      x: 1952,
      y: 456,
      width: 96,
      height: 24,
      moveAxis: "y",
      range: 64,
      speed: 1.08,
      originX: 1952,
      originY: 456,
      slippery: true
    },
    { id: "z2-tower-base", kind: "static", x: 2112, y: 608, width: 192, height: 112 },
    { id: "z2-tower-body", kind: "static", x: 2144, y: 416, width: 96, height: 192 },
    { id: "z2-tower-top", kind: "static", x: 2112, y: 336, width: 160, height: 32 },
    { id: "z2-bank-right", kind: "static", x: 2352, y: 608, width: 192, height: 112 },

    // Zona 3: corredor alagado misto
    { id: "z3-floor-left", kind: "static", x: 2496, y: 608, width: 128, height: 112 },
    { id: "z3-break-a", kind: "breakable", x: 2688, y: 544, width: 96, height: 24, breakDelay: 0.38, respawnDelay: 2.8 },
    { id: "z3-safe-a", kind: "static", x: 2848, y: 496, width: 64, height: 24 },
    { id: "z3-fake-root", kind: "fake", x: 2976, y: 448, width: 96, height: 24, breakDelay: 0.05, respawnDelay: 2.6 },
    { id: "z3-break-b", kind: "breakable", x: 3136, y: 400, width: 96, height: 24, breakDelay: 0.34, respawnDelay: 2.8 },
    { id: "z3-landing", kind: "static", x: 3296, y: 608, width: 192, height: 112 },

    // Zona 4: ascensao da raiz + nucleo central
    { id: "z4-floor-left", kind: "static", x: 3584, y: 608, width: 192, height: 112 },
    { id: "z4-root-a", kind: "static", x: 3840, y: 560, width: 96, height: 24, slippery: true },
    { id: "z4-root-b", kind: "fake", x: 4000, y: 496, width: 96, height: 24, breakDelay: 0.04, respawnDelay: 2.6, slippery: true },
    {
      id: "z4-root-c",
      kind: "moving",
      x: 4160,
      y: 432,
      width: 80,
      height: 24,
      moveAxis: "x",
      range: 56,
      speed: 1.24,
      originX: 4160,
      originY: 432,
      slippery: true
    },
    { id: "z4-root-d", kind: "breakable", x: 4304, y: 368, width: 96, height: 24, breakDelay: 0.32, respawnDelay: 2.8 },
    { id: "z4-tower-base", kind: "static", x: 4464, y: 608, width: 192, height: 112 },
    { id: "z4-tower-body", kind: "static", x: 4496, y: 336, width: 96, height: 272 },
    { id: "z4-tower-top", kind: "static", x: 4464, y: 272, width: 160, height: 32 },
    { id: "z4-safe-right", kind: "static", x: 4704, y: 608, width: 192, height: 112 },

    // Zona 5: corredor de raizes esmagadoras + nucleo da luz
    { id: "z5-corridor", kind: "static", x: 4896, y: 608, width: 576, height: 112 },
    { id: "z5-mid-a", kind: "static", x: 4976, y: 528, width: 80, height: 24 },
    { id: "z5-mid-b", kind: "static", x: 5136, y: 528, width: 80, height: 24 },
    { id: "z5-mid-c", kind: "static", x: 5296, y: 528, width: 80, height: 24 },
    { id: "z5-tower-base", kind: "static", x: 5488, y: 608, width: 160, height: 112 },
    { id: "z5-tower-body", kind: "static", x: 5520, y: 352, width: 96, height: 256 },
    { id: "z5-tower-top", kind: "static", x: 5488, y: 272, width: 160, height: 32 },

    // Zona 6: dossel final
    { id: "z6-floor", kind: "static", x: 5760, y: 608, width: 640, height: 112 },
    { id: "z6-step-a", kind: "static", x: 5824, y: 544, width: 96, height: 24 },
    { id: "z6-step-b", kind: "static", x: 5984, y: 480, width: 96, height: 24 },
    { id: "z6-step-c", kind: "static", x: 6144, y: 416, width: 96, height: 24 },
    { id: "z6-goal-plat", kind: "static", x: 6240, y: 352, width: 192, height: 32 }
  ],

  levers: [],

  doors: [
    { id: "door-gate", label: "Portal da nascente", x: 6272, y: 160, width: 64, height: 192, open: false }
  ],

  generators: [
    { id: "core-west", label: "Nucleo do Rio", x: 2144, y: 256, width: 64, height: 80, active: false },
    { id: "core-mid", label: "Nucleo da Raiz", x: 4496, y: 192, width: 64, height: 80, active: false },
    { id: "core-east", label: "Nucleo da Luz", x: 5536, y: 192, width: 64, height: 80, active: false }
  ],

  checkpoints: [
    { id: "cp-start", x: 256, y: 480, width: 32, height: 128, activated: true },
    { id: "cp-mid", x: 4704, y: 480, width: 32, height: 128, activated: false }
  ],

  collectibles: [
    {
      id: "log-forest-intro",
      label: "Registro Aurora",
      x: 992,
      y: 456,
      width: 30,
      height: 30,
      collected: false,
      text: "Registro Aurora: A floresta nao perdoa pressa cega. Tudo o que floresceu aqui exige compasso."
    },
    {
      id: "log-forest-depth",
      label: "Registro Raiz",
      x: 2864,
      y: 432,
      width: 30,
      height: 30,
      collected: false,
      text: "Registro Raiz: As ruinas nao desapareceram. Elas foram reaproveitadas pela mata como prova de paciencia."
    },
    {
      id: "log-forest-apex",
      label: "Registro Horizonte",
      x: 5152,
      y: 480,
      width: 30,
      height: 30,
      collected: false,
      text: "Registro Horizonte: O ultimo caminho nao testa forca. Testa serenidade sob pressao."
    }
  ],

  windZones: [],

  hazards: [
    { id: "z2-laser-a", kind: "laser", x: 1664, y: 176, width: 8, height: 368, active: true, damage: 100, blinkOn: 0.72, blinkOff: 0.4 },
    { id: "z2-laser-b", kind: "laser", x: 1856, y: 176, width: 8, height: 368, active: true, damage: 100, blinkOn: 0.66, blinkOff: 0.36 },
    { id: "z2-laser-c", kind: "laser", x: 2048, y: 176, width: 8, height: 368, active: true, damage: 100, blinkOn: 0.62, blinkOff: 0.32 },
    { id: "z2-updraft", kind: "wind", x: 1504, y: 0, width: 704, height: 720, forceX: 0, forceY: -190, active: true },
    {
      id: "z4-drone-low",
      kind: "drone",
      x: 3904,
      y: 480,
      width: 56,
      height: 28,
      moveAxis: "y",
      range: 120,
      speed: 2.04,
      originX: 3904,
      originY: 480,
      damage: 40,
      active: true
    },
    {
      id: "z4-drone-mid",
      kind: "drone",
      x: 4224,
      y: 360,
      width: 56,
      height: 28,
      moveAxis: "y",
      range: 104,
      speed: 2.42,
      originX: 4224,
      originY: 360,
      damage: 40,
      active: true
    },
    {
      id: "z4-drone-high",
      kind: "drone",
      x: 4352,
      y: 304,
      width: 56,
      height: 28,
      moveAxis: "x",
      range: 96,
      speed: 2.72,
      originX: 4352,
      originY: 304,
      damage: 40,
      active: true
    },
    {
      id: "z5-crusher-a",
      kind: "crusher",
      x: 4992,
      y: 80,
      width: 80,
      height: 48,
      active: false,
      triggerId: "trigger-crusher-z5-1",
      direction: "down",
      speed: 450,
      homeX: 4992,
      homeY: 80,
      damage: 100
    },
    {
      id: "z5-crusher-b",
      kind: "crusher",
      x: 5152,
      y: 80,
      width: 80,
      height: 48,
      active: false,
      triggerId: "trigger-crusher-z5-2",
      direction: "down",
      speed: 410,
      homeX: 5152,
      homeY: 80,
      damage: 100
    },
    {
      id: "z5-crusher-c",
      kind: "crusher",
      x: 5312,
      y: 80,
      width: 80,
      height: 48,
      active: false,
      triggerId: "trigger-crusher-z5-3",
      direction: "down",
      speed: 480,
      homeX: 5312,
      homeY: 80,
      damage: 100
    },
    {
      id: "z6-drone-rush",
      kind: "drone",
      x: 6400,
      y: 320,
      width: 72,
      height: 30,
      active: false,
      triggerId: "trigger-rush-z6",
      direction: "left",
      speed: 500,
      homeX: 6400,
      homeY: 320,
      damage: 100
    }
  ],

  triggerZones: [
    { id: "trigger-z1-respawn-spikes", x: 356, y: 500, width: 24, height: 120, once: true, activated: false },
    { id: "trigger-z1-spikes", x: 640, y: 500, width: 24, height: 120, once: true, activated: false },
    { id: "trigger-z3-fake", x: 2944, y: 400, width: 96, height: 192, once: true, activated: false },
    { id: "trigger-z3-spikes", x: 3152, y: 352, width: 64, height: 176, once: true, activated: false },
    { id: "trigger-z4-fake", x: 3984, y: 432, width: 96, height: 176, once: true, activated: false },
    { id: "trigger-crusher-z5-1", x: 4912, y: 480, width: 64, height: 144, once: true, activated: false },
    { id: "trigger-crusher-z5-2", x: 5072, y: 480, width: 64, height: 144, once: true, activated: false },
    { id: "trigger-crusher-z5-3", x: 5232, y: 480, width: 64, height: 144, once: true, activated: false },
    { id: "trigger-z5-spikes", x: 5408, y: 464, width: 64, height: 160, once: true, activated: false },
    { id: "trigger-rush-z6", x: 6064, y: 352, width: 96, height: 224, once: true, activated: false }
  ],

  hiddenSpikes: [
    { id: "z1-spike-respawn", triggerId: "trigger-z1-respawn-spikes", x: 328, y: 576, width: 64, height: 32, active: false },
    { id: "z1-spike-tutorial", triggerId: "trigger-z1-spikes", x: 608, y: 576, width: 64, height: 32, active: false },
    { id: "z3-spike-fake", triggerId: "trigger-z3-fake", x: 2976, y: 576, width: 96, height: 32, active: false },
    { id: "z3-spike-exit", triggerId: "trigger-z3-spikes", x: 3136, y: 576, width: 96, height: 32, active: false },
    { id: "z4-spike-root-a", triggerId: "trigger-z4-fake", x: 4000, y: 576, width: 96, height: 32, active: false },
    { id: "z4-spike-root-b", triggerId: "trigger-z4-fake", x: 4096, y: 576, width: 96, height: 32, active: false },
    { id: "z5-spike-seal-a", triggerId: "trigger-z5-spikes", x: 5344, y: 576, width: 96, height: 32, active: false },
    { id: "z5-spike-seal-b", triggerId: "trigger-z5-spikes", x: 5440, y: 576, width: 96, height: 32, active: false }
  ],

  irrigationConsole: {
    id: "restoration-apex-console",
    x: 6256,
    y: 272,
    width: 80,
    height: 80,
    active: false
  }
};
