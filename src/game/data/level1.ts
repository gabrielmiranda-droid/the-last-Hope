import type { LevelData } from "../types";

export const levelOne: LevelData = {
  id: "dry-region",
  name: "Fase 1: Regiao da Seca",
  introTitle: "Regiao da Seca",
  introText:
    "Ruinas industriais, vento cortante e um sistema de irrigacao morto. Sobreviva aos cinco setores, religue os geradores e tome o console final.",
  victoryTitle: "Sistema restaurado",
  victoryText:
    "Os geradores responderam. Agua azul volta a cruzar os canos e a velha instalacao de restauracao respira outra vez.",
  width: 5904,
  height: 720,
  start: { x: 80, y: 520 },
  goalArea: { x: 5536, y: 272, width: 224, height: 336 },

  platforms: [
    // Zona 1: tutorial perigoso
    { id: "z1-ground-start", kind: "static", x: 0, y: 608, width: 704, height: 112 },
    { id: "z1-step-a", kind: "breakable", x: 792, y: 560, width: 96, height: 24, breakDelay: 0.82, respawnDelay: 2.4 },
    { id: "z1-step-b", kind: "breakable", x: 952, y: 512, width: 96, height: 24, breakDelay: 0.68, respawnDelay: 2.2 },
    { id: "z1-step-c", kind: "timed", x: 1112, y: 464, width: 96, height: 24, active: true, timer: 0.78, breakDelay: 0.78, respawnDelay: 0.9 },
    { id: "z1-landing", kind: "static", x: 1264, y: 608, width: 192, height: 112 },

    // Zona 2: fake floor + spikes + vento
    { id: "z2-bank-left", kind: "static", x: 1456, y: 608, width: 160, height: 112 },
    { id: "z2-fake-bridge", kind: "fake", x: 1600, y: 560, width: 112, height: 24, breakDelay: 0.05, respawnDelay: 2.7 },
    { id: "z2-safe-step", kind: "static", x: 1776, y: 520, width: 80, height: 24 },
    { id: "z2-break-a", kind: "breakable", x: 1920, y: 472, width: 96, height: 24, breakDelay: 0.32, respawnDelay: 2.5 },
    { id: "z2-break-b", kind: "breakable", x: 2080, y: 424, width: 96, height: 24, breakDelay: 0.28, respawnDelay: 2.4 },
    { id: "z2-tower-base", kind: "static", x: 2240, y: 608, width: 192, height: 112 },
    { id: "z2-tower-body", kind: "static", x: 2272, y: 392, width: 96, height: 216 },
    { id: "z2-tower-top", kind: "static", x: 2240, y: 328, width: 160, height: 32 },
    { id: "z2-exit-step", kind: "static", x: 2456, y: 392, width: 72, height: 24 },
    { id: "z2-exit-break", kind: "breakable", x: 2560, y: 456, width: 80, height: 24, breakDelay: 0.56, respawnDelay: 2.2 },

    // Zona 3: lasers + timed platforms
    { id: "z3-floor-left", kind: "static", x: 2592, y: 608, width: 128, height: 112 },
    { id: "z3-rest", kind: "static", x: 2720, y: 568, width: 80, height: 24 },
    {
      id: "z3-timed-a",
      kind: "timed",
      x: 2864,
      y: 552,
      width: 112,
      height: 24,
      active: true,
      timer: 1.8,
      breakDelay: 1.8,
      respawnDelay: 0.6
    },
    {
      id: "z3-timed-b",
      kind: "timed",
      x: 3040,
      y: 504,
      width: 112,
      height: 24,
      active: true,
      timer: 1.7,
      breakDelay: 1.7,
      respawnDelay: 0.7
    },
    {
      id: "z3-timed-c",
      kind: "timed",
      x: 3216,
      y: 456,
      width: 112,
      height: 24,
      active: true,
      timer: 1.6,
      breakDelay: 1.6,
      respawnDelay: 0.8
    },
    {
      id: "z3-timed-d",
      kind: "timed",
      x: 3392,
      y: 408,
      width: 112,
      height: 24,
      active: true,
      timer: 1.5,
      breakDelay: 1.5,
      respawnDelay: 0.9
    },
    { id: "z3-step-top", kind: "static", x: 3424, y: 360, width: 72, height: 24 },
    { id: "z3-tower-base", kind: "static", x: 3504, y: 608, width: 192, height: 112 },
    { id: "z3-tower-body", kind: "static", x: 3536, y: 368, width: 96, height: 240 },
    { id: "z3-tower-top", kind: "static", x: 3504, y: 304, width: 160, height: 32 },
    { id: "z3-safe", kind: "static", x: 3776, y: 608, width: 224, height: 112 },

    // Zona 4: moving platforms + drones
    { id: "z4-floor-left", kind: "static", x: 4080, y: 608, width: 160, height: 112 },
    {
      id: "z4-move-a",
      kind: "moving",
      x: 4288,
      y: 552,
      width: 96,
      height: 24,
      moveAxis: "y",
      range: 64,
      speed: 1.18,
      originX: 4288,
      originY: 552
    },
    { id: "z4-safe-a", kind: "static", x: 4448, y: 496, width: 72, height: 24 },
    {
      id: "z4-move-b",
      kind: "moving",
      x: 4608,
      y: 432,
      width: 96,
      height: 24,
      moveAxis: "x",
      range: 84,
      speed: 1.42,
      originX: 4608,
      originY: 432
    },
    { id: "z4-safe-b", kind: "static", x: 4784, y: 368, width: 72, height: 24 },
    { id: "z4-tower-base", kind: "static", x: 4912, y: 608, width: 192, height: 112 },
    { id: "z4-tower-body", kind: "static", x: 4944, y: 304, width: 96, height: 304 },
    { id: "z4-tower-top", kind: "static", x: 4912, y: 240, width: 160, height: 32 },
    { id: "z4-approach-step", kind: "static", x: 5136, y: 320, width: 96, height: 24 },

    // Zona 5: climax final
    { id: "z5-step-a", kind: "static", x: 5248, y: 368, width: 96, height: 24 },
    { id: "z5-step-b", kind: "static", x: 5408, y: 416, width: 96, height: 24 },
    { id: "z5-console-base", kind: "static", x: 5536, y: 480, width: 256, height: 128 },
    { id: "z5-console-top", kind: "static", x: 5536, y: 400, width: 160, height: 32 }
  ],

  levers: [],

  doors: [
    { id: "door-gate", label: "Console central", x: 5600, y: 272, width: 64, height: 128, open: false }
  ],

  generators: [
    { id: "z2-generator-west", label: "Gerador Oeste", x: 2288, y: 248, width: 64, height: 80, active: false },
    { id: "z3-generator-central", label: "Gerador Central", x: 3552, y: 224, width: 64, height: 80, active: false },
    { id: "z4-generator-east", label: "Gerador Leste", x: 4960, y: 160, width: 64, height: 80, active: false }
  ],

  checkpoints: [
    { id: "cp-start", x: 256, y: 480, width: 32, height: 128, activated: true },
    { id: "cp-mid", x: 3856, y: 480, width: 32, height: 128, activated: false }
  ],

  collectibles: [
    {
      id: "log-intro",
      label: "Log 01",
      x: 960,
      y: 472,
      width: 24,
      height: 24,
      collected: false,
      text: "Log 01: O primeiro corredor foi armado para punir reflexos preguiçosos. Ate o tutorial quer ferir."
    },
    {
      id: "log-maintenance",
      label: "Log 02",
      x: 3088,
      y: 416,
      width: 24,
      height: 24,
      collected: false,
      text: "Log 02: As plataformas ritmicas eram teste de manutencao. Hoje filtram quem nao entende o padrao."
    },
    {
      id: "log-apex",
      label: "Log 03",
      x: 5344,
      y: 328,
      width: 24,
      height: 24,
      collected: false,
      text: "Log 03: O console final exige tres nucleos ativos e nervos intactos. A ultima defesa nunca dorme."
    }
  ],

  windZones: [
    { id: "wind-z2-cross", x: 1480, y: 320, width: 760, height: 300, forceX: 26, forceY: -34, gravityScale: 0.95 }
  ],

  hazards: [
    { id: "z3-laser-a", kind: "laser", x: 2768, y: 596, width: 112, height: 12, active: true, damage: 100, blinkOn: 0.68, blinkOff: 0.32 },
    { id: "z3-laser-b", kind: "laser", x: 2912, y: 596, width: 112, height: 12, active: true, damage: 100, blinkOn: 0.62, blinkOff: 0.3 },
    { id: "z3-laser-c", kind: "laser", x: 3056, y: 596, width: 112, height: 12, active: true, damage: 100, blinkOn: 0.58, blinkOff: 0.28 },
    { id: "z3-laser-d", kind: "laser", x: 3200, y: 596, width: 112, height: 12, active: true, damage: 100, blinkOn: 0.54, blinkOff: 0.28 },
    {
      id: "z4-drone-low",
      kind: "drone",
      x: 4384,
      y: 468,
      width: 56,
      height: 28,
      moveAxis: "y",
      range: 108,
      speed: 2.08,
      originX: 4384,
      originY: 468,
      damage: 50,
      active: true
    },
    {
      id: "z4-drone-high",
      kind: "drone",
      x: 4696,
      y: 328,
      width: 56,
      height: 28,
      moveAxis: "x",
      range: 104,
      speed: 2.46,
      originX: 4696,
      originY: 328,
      damage: 50,
      active: true
    },
    {
      id: "z5-crusher-approach",
      kind: "crusher",
      x: 5264,
      y: 248,
      width: 80,
      height: 80,
      active: false,
      triggerId: "trigger-z5-crusher-approach",
      direction: "down",
      speed: 520,
      homeX: 5264,
      homeY: 248,
      damage: 100
    },
    {
      id: "z5-drone-rush",
      kind: "drone",
      x: 5904,
      y: 376,
      width: 72,
      height: 32,
      active: false,
      triggerId: "trigger-z5-drone-rush",
      direction: "left",
      speed: 520,
      homeX: 5904,
      homeY: 376,
      damage: 100
    },
    {
      id: "z5-crusher-final",
      kind: "crusher",
      x: 5600,
      y: 220,
      width: 80,
      height: 80,
      active: false,
      triggerId: "trigger-z5-crusher-final",
      direction: "down",
      speed: 520,
      homeX: 5600,
      homeY: 220,
      damage: 100
    }
  ],

  triggerZones: [
    { id: "trigger-z1-respawn-spikes", x: 356, y: 500, width: 24, height: 120, once: true, activated: false },
    { id: "trigger-z1-spikes", x: 604, y: 500, width: 24, height: 120, once: true, activated: false },
    { id: "trigger-z2-fake-spikes", x: 1624, y: 452, width: 56, height: 160, once: true, activated: false },
    { id: "trigger-z2-exit-seal", x: 2656, y: 500, width: 24, height: 120, once: true, activated: false },
    { id: "trigger-z5-crusher-approach", x: 5216, y: 304, width: 64, height: 152, once: true, activated: false },
    { id: "trigger-z5-drone-rush", x: 5360, y: 344, width: 64, height: 168, once: true, activated: false },
    { id: "trigger-z5-crusher-final", x: 5536, y: 336, width: 160, height: 208, once: true, activated: false }
  ],

  hiddenSpikes: [
    { id: "z1-spike-respawn", triggerId: "trigger-z1-respawn-spikes", x: 328, y: 576, width: 64, height: 32, active: false },
    { id: "z1-spike-tutorial", triggerId: "trigger-z1-spikes", x: 576, y: 576, width: 64, height: 32, active: false },
    { id: "z2-spike-pit-a", triggerId: "trigger-z2-fake-spikes", x: 1600, y: 576, width: 96, height: 32, active: false },
    { id: "z2-spike-pit-b", triggerId: "trigger-z2-fake-spikes", x: 1712, y: 576, width: 96, height: 32, active: false },
    { id: "z2-spike-exit-seal", triggerId: "trigger-z2-exit-seal", x: 2576, y: 576, width: 64, height: 32, active: false }
  ],

  irrigationConsole: {
    id: "irrigation-core",
    x: 5600,
    y: 320,
    width: 80,
    height: 80,
    active: false
  }
};
