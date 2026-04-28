import type { LevelData } from "../types";

export const levelTwo: LevelData = {
  id: "energy-facility",
  name: "Fase 2: Instalacao de Energia Abandonada",
  introTitle: "Instalacao de Energia Abandonada",
  introText:
    "Trilhos energizados, vento industrial e camaras automatizadas. Reative os tres nucleos e atravesse a usina antes que a instalacao volte a se fechar.",
  victoryTitle: "Energia Restaurada",
  victoryText:
    "Os nucleos voltaram a pulsar em azul. A cidade industrial responde e envia energia suficiente para sustentar a restauracao final.",
  width: 6656,
  height: 720,
  start: { x: 128, y: 512 },
  goalArea: { x: 6400, y: 288, width: 224, height: 320 },

  platforms: [
    // Zona 1: tutorial de pressao
    { id: "z1-ground-start", kind: "static", x: 0, y: 608, width: 736, height: 112 },
    { id: "z1-step-a", kind: "breakable", x: 800, y: 552, width: 96, height: 24, breakDelay: 0.88, respawnDelay: 2.5 },
    { id: "z1-step-b", kind: "timed", x: 960, y: 504, width: 96, height: 24, active: true, timer: 0.9, breakDelay: 0.9, respawnDelay: 0.82 },
    { id: "z1-step-c", kind: "static", x: 1120, y: 456, width: 96, height: 24 },
    { id: "z1-landing", kind: "static", x: 1280, y: 608, width: 192, height: 112 },

    // Zona 2: gauntlet ritmico + nucleo alfa
    { id: "z2-bank-left", kind: "static", x: 1456, y: 608, width: 160, height: 112 },
    { id: "z2-charge-a", kind: "timed", x: 1616, y: 552, width: 96, height: 24, active: true, timer: 1.08, breakDelay: 1.08, respawnDelay: 0.9 },
    { id: "z2-charge-b", kind: "timed", x: 1776, y: 504, width: 96, height: 24, active: true, timer: 1.0, breakDelay: 1.0, respawnDelay: 0.88 },
    { id: "z2-charge-c", kind: "timed", x: 1936, y: 456, width: 96, height: 24, active: true, timer: 0.94, breakDelay: 0.94, respawnDelay: 0.86 },
    { id: "z2-reactor-base", kind: "static", x: 2112, y: 608, width: 192, height: 112 },
    { id: "z2-reactor-body", kind: "static", x: 2144, y: 416, width: 96, height: 192 },
    { id: "z2-reactor-top", kind: "static", x: 2112, y: 336, width: 160, height: 32 },
    { id: "z2-reactor-exit", kind: "static", x: 2368, y: 392, width: 72, height: 24 },
    { id: "z2-safe-right", kind: "static", x: 2464, y: 608, width: 192, height: 112 },

    // Zona 3: corredor de vento + lasers
    { id: "z3-floor-left", kind: "static", x: 2688, y: 608, width: 128, height: 112 },
    { id: "z3-step-a", kind: "static", x: 2864, y: 544, width: 64, height: 24 },
    { id: "z3-step-b", kind: "static", x: 3008, y: 496, width: 64, height: 24 },
    { id: "z3-step-c", kind: "static", x: 3152, y: 448, width: 64, height: 24 },
    { id: "z3-step-d", kind: "static", x: 3296, y: 400, width: 64, height: 24 },
    { id: "z3-landing", kind: "static", x: 3456, y: 608, width: 192, height: 112 },

    // Zona 4: catwalks falsas + nucleo beta
    { id: "z4-floor-left", kind: "static", x: 3648, y: 608, width: 128, height: 112 },
    { id: "z4-break-a", kind: "breakable", x: 3824, y: 544, width: 96, height: 24, breakDelay: 0.3, respawnDelay: 2.6 },
    { id: "z4-safe-a", kind: "static", x: 3984, y: 496, width: 64, height: 24 },
    { id: "z4-fake-catwalk", kind: "fake", x: 4144, y: 448, width: 96, height: 24, breakDelay: 0.04, respawnDelay: 2.5 },
    { id: "z4-break-b", kind: "breakable", x: 4304, y: 400, width: 96, height: 24, breakDelay: 0.26, respawnDelay: 2.6 },
    { id: "z4-tower-base", kind: "static", x: 4464, y: 608, width: 192, height: 112 },
    { id: "z4-tower-body", kind: "static", x: 4496, y: 368, width: 96, height: 240 },
    { id: "z4-tower-top", kind: "static", x: 4464, y: 304, width: 160, height: 32 },
    { id: "z4-safe-right", kind: "static", x: 4720, y: 608, width: 192, height: 112 },

    // Zona 5: precisao industrial
    { id: "z5-floor-left", kind: "static", x: 4896, y: 608, width: 128, height: 112 },
    { id: "z5-precision-a", kind: "breakable", x: 5088, y: 544, width: 64, height: 24, breakDelay: 0.26, respawnDelay: 2.4 },
    { id: "z5-precision-b", kind: "static", x: 5216, y: 480, width: 48, height: 24 },
    { id: "z5-precision-c", kind: "breakable", x: 5328, y: 416, width: 64, height: 24, breakDelay: 0.22, respawnDelay: 2.4 },
    { id: "z5-precision-d", kind: "static", x: 5456, y: 352, width: 48, height: 24 },
    { id: "z5-precision-e", kind: "breakable", x: 5568, y: 304, width: 96, height: 24, breakDelay: 0.2, respawnDelay: 2.4 },
    { id: "z5-safe", kind: "static", x: 5728, y: 608, width: 192, height: 112 },

    // Zona 6: nucleo gama + console final
    { id: "z6-floor", kind: "static", x: 5888, y: 608, width: 576, height: 112 },
    { id: "z6-step-a", kind: "static", x: 5968, y: 544, width: 96, height: 24 },
    { id: "z6-step-b", kind: "static", x: 6112, y: 480, width: 96, height: 24 },
    { id: "z6-tower-base", kind: "static", x: 6288, y: 608, width: 160, height: 112 },
    { id: "z6-tower-body", kind: "static", x: 6320, y: 384, width: 96, height: 224 },
    { id: "z6-tower-top", kind: "static", x: 6288, y: 320, width: 160, height: 32 },
    { id: "z6-console-base", kind: "static", x: 6400, y: 608, width: 256, height: 112 },
    { id: "z6-console-top", kind: "static", x: 6432, y: 480, width: 128, height: 32 }
  ],

  levers: [],

  doors: [
    { id: "door-gate", label: "Camara de energia", x: 6464, y: 288, width: 64, height: 192, open: false }
  ],

  generators: [
    { id: "core-alpha", label: "Nucleo Alfa", x: 2144, y: 256, width: 64, height: 80, active: false },
    { id: "core-beta", label: "Nucleo Beta", x: 4496, y: 224, width: 64, height: 80, active: false },
    { id: "core-gamma", label: "Nucleo Gama", x: 6336, y: 240, width: 64, height: 80, active: false }
  ],

  checkpoints: [
    { id: "cp-start", x: 256, y: 480, width: 32, height: 128, activated: true },
    { id: "cp-mid", x: 4784, y: 480, width: 32, height: 128, activated: false }
  ],

  collectibles: [
    {
      id: "log-energy-intro",
      label: "Registro Alfa",
      x: 976,
      y: 464,
      width: 30,
      height: 30,
      collected: false,
      text: "Registro Alfa: Aqui o piso nao cai por acidente. Cada plataforma foi afinada para punir atraso."
    },
    {
      id: "log-energy-rhythm",
      label: "Registro Beta",
      x: 3168,
      y: 416,
      width: 30,
      height: 30,
      collected: false,
      text: "Registro Beta: O vento dos dutos nao empurra aleatoriamente. Ele protege o corredor dos indecisos."
    },
    {
      id: "log-energy-apex",
      label: "Registro Gama",
      x: 5536,
      y: 272,
      width: 30,
      height: 30,
      collected: false,
      text: "Registro Gama: A camara final mede nervo e compasso. So passa quem atravessa a usina sem hesitar."
    }
  ],

  windZones: [],

  hazards: [
    { id: "z3-laser-a", kind: "laser", x: 2832, y: 596, width: 128, height: 12, active: true, damage: 100, blinkOn: 0.74, blinkOff: 0.34 },
    { id: "z3-laser-b", kind: "laser", x: 3008, y: 596, width: 128, height: 12, active: true, damage: 100, blinkOn: 0.68, blinkOff: 0.32 },
    { id: "z3-laser-c", kind: "laser", x: 3184, y: 596, width: 128, height: 12, active: true, damage: 100, blinkOn: 0.62, blinkOff: 0.3 },
    { id: "z3-wind-tunnel", kind: "wind", x: 2784, y: 0, width: 704, height: 720, forceX: -18, forceY: 0, active: true },
    {
      id: "z3-drone-patrol",
      kind: "drone",
      x: 3040,
      y: 472,
      width: 56,
      height: 28,
      moveAxis: "x",
      range: 128,
      speed: 2.2,
      originX: 3040,
      originY: 472,
      damage: 40,
      active: true
    },
    { id: "z5-laser-a", kind: "laser", x: 5168, y: 596, width: 128, height: 12, active: true, damage: 100, blinkOn: 0.86, blinkOff: 0.26 },
    { id: "z5-laser-b", kind: "laser", x: 5424, y: 596, width: 128, height: 12, active: true, damage: 100, blinkOn: 0.82, blinkOff: 0.24 },
    {
      id: "z5-drone-rush",
      kind: "drone",
      x: 5808,
      y: 392,
      width: 72,
      height: 30,
      active: false,
      triggerId: "trigger-rush-z5",
      direction: "left",
      speed: 470,
      homeX: 5808,
      homeY: 392,
      damage: 100
    },
    {
      id: "z6-drone-guard",
      kind: "drone",
      x: 6576,
      y: 360,
      width: 72,
      height: 30,
      active: false,
      triggerId: "trigger-z6-drone-guard",
      direction: "left",
      speed: 500,
      homeX: 6576,
      homeY: 360,
      damage: 100
    },
    {
      id: "z6-crusher-final",
      kind: "crusher",
      x: 6448,
      y: 88,
      width: 80,
      height: 48,
      active: false,
      triggerId: "trigger-crusher-z6",
      direction: "down",
      speed: 500,
      homeX: 6448,
      homeY: 88,
      damage: 100
    }
  ],

  triggerZones: [
    { id: "trigger-z1-respawn-spikes", x: 356, y: 500, width: 24, height: 120, once: true, activated: false },
    { id: "trigger-z1-spikes", x: 640, y: 500, width: 24, height: 120, once: true, activated: false },
    { id: "trigger-z4-fake", x: 4128, y: 384, width: 96, height: 192, once: true, activated: false },
    { id: "trigger-z5-spikes", x: 5312, y: 336, width: 64, height: 176, once: true, activated: false },
    { id: "trigger-rush-z5", x: 5680, y: 320, width: 64, height: 240, once: true, activated: false },
    { id: "trigger-z6-drone-guard", x: 6336, y: 320, width: 96, height: 208, once: true, activated: false },
    { id: "trigger-crusher-z6", x: 6384, y: 416, width: 96, height: 192, once: true, activated: false }
  ],

  hiddenSpikes: [
    { id: "z1-spike-respawn", triggerId: "trigger-z1-respawn-spikes", x: 328, y: 576, width: 64, height: 32, active: false },
    { id: "z1-spike-tutorial", triggerId: "trigger-z1-spikes", x: 608, y: 576, width: 64, height: 32, active: false },
    { id: "z4-spike-fake-a", triggerId: "trigger-z4-fake", x: 4144, y: 576, width: 96, height: 32, active: false },
    { id: "z4-spike-fake-b", triggerId: "trigger-z4-fake", x: 4240, y: 576, width: 96, height: 32, active: false },
    { id: "z5-spike-precision-a", triggerId: "trigger-z5-spikes", x: 5184, y: 576, width: 96, height: 32, active: false },
    { id: "z5-spike-precision-b", triggerId: "trigger-z5-spikes", x: 5280, y: 576, width: 96, height: 32, active: false }
  ],

  irrigationConsole: {
    id: "energy-master-console",
    x: 6448,
    y: 400,
    width: 80,
    height: 80,
    active: false
  }
};
