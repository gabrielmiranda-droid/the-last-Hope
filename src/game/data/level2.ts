import type { LevelData } from "../types";

export const levelTwo: LevelData = {
  id: "energy-facility",
  name: "Fase 2: Instalacao de Energia Abandonada",
  introTitle: "Instalacao de Energia Abandonada",
  introText:
    "A ala de energia cedeu para dentro da agua toxica. Catwalks molhadas, dutos pulsando e torres rachadas formam uma subida brutal ate tres nucleos isolados no alto da usina.",
  victoryTitle: "Energia Restaurada",
  victoryText:
    "A energia azul volta a correr pelos tubos da instalacao. Vapor, agua e metal respondem juntos, e a cidade industrial empurra a restauracao para o ultimo setor.",
  width: 6656,
  height: 720,
  start: { x: 96, y: 512 },
  goalArea: { x: 6320, y: 224, width: 272, height: 368 },

  platforms: [
    // Zona 1: docas alagadas
    { id: "z1-ground", kind: "static", x: 0, y: 608, width: 576, height: 112 },
    { id: "z1-slip-a", kind: "static", x: 640, y: 560, width: 96, height: 24, slippery: true },
    {
      id: "z1-move-a",
      kind: "moving",
      x: 832,
      y: 512,
      width: 104,
      height: 24,
      moveAxis: "x",
      range: 72,
      speed: 1.15,
      originX: 832,
      originY: 512,
      slippery: true
    },
    {
      id: "z1-timed-a",
      kind: "timed",
      x: 1024,
      y: 456,
      width: 96,
      height: 24,
      active: true,
      timer: 0.92,
      breakDelay: 0.92,
      respawnDelay: 0.58,
      slippery: true
    },
    { id: "z1-landing", kind: "static", x: 1184, y: 608, width: 224, height: 112 },

    // Zona 2: passarela falsa e primeiro nucleo
    { id: "z2-bank-left", kind: "static", x: 1456, y: 608, width: 160, height: 112 },
    { id: "z2-catwalk-a", kind: "static", x: 1600, y: 544, width: 96, height: 24, slippery: true },
    {
      id: "z2-fake-a",
      kind: "fake",
      x: 1760,
      y: 504,
      width: 112,
      height: 24,
      breakDelay: 0.04,
      respawnDelay: 2.9,
      slippery: true
    },
    {
      id: "z2-break-a",
      kind: "breakable",
      x: 1936,
      y: 456,
      width: 96,
      height: 24,
      breakDelay: 0.34,
      respawnDelay: 2.7,
      slippery: true
    },
    {
      id: "z2-move-a",
      kind: "moving",
      x: 2096,
      y: 400,
      width: 96,
      height: 24,
      moveAxis: "x",
      range: 72,
      speed: 1.55,
      originX: 2096,
      originY: 400
    },
    {
      id: "z2-timed-a",
      kind: "timed",
      x: 2256,
      y: 352,
      width: 96,
      height: 24,
      active: true,
      timer: 1.08,
      breakDelay: 1.08,
      respawnDelay: 0.62
    },
    { id: "z2-core1-base", kind: "static", x: 2224, y: 608, width: 192, height: 112 },
    { id: "z2-core1-body", kind: "static", x: 2256, y: 384, width: 96, height: 224 },
    { id: "z2-core1-top", kind: "static", x: 2208, y: 320, width: 160, height: 32 },
    { id: "z2-exit-step", kind: "static", x: 2480, y: 416, width: 96, height: 24 },
    { id: "z2-drop-ledge", kind: "static", x: 2624, y: 520, width: 72, height: 24, slippery: true },

    // Zona 3: eixo de lasers verticais
    { id: "z3-floor-left", kind: "static", x: 2656, y: 608, width: 160, height: 112 },
    { id: "z3-step-a", kind: "static", x: 2832, y: 552, width: 72, height: 24, slippery: true },
    { id: "z3-step-b", kind: "static", x: 3008, y: 496, width: 72, height: 24, slippery: true },
    {
      id: "z3-timed-a",
      kind: "timed",
      x: 3184,
      y: 440,
      width: 88,
      height: 24,
      active: true,
      timer: 0.82,
      breakDelay: 0.82,
      respawnDelay: 0.5
    },
    { id: "z3-step-c", kind: "static", x: 3360, y: 384, width: 72, height: 24, slippery: true },
    {
      id: "z3-timed-b",
      kind: "timed",
      x: 3520,
      y: 328,
      width: 88,
      height: 24,
      active: true,
      timer: 0.74,
      breakDelay: 0.74,
      respawnDelay: 0.48
    },
    { id: "z3-high-rail", kind: "static", x: 3664, y: 288, width: 160, height: 32 },
    { id: "z3-landing", kind: "static", x: 3600, y: 608, width: 224, height: 112 },

    // Zona 4: reator ventilado e segundo nucleo
    { id: "z4-bank", kind: "static", x: 3856, y: 608, width: 160, height: 112 },
    {
      id: "z4-lift-a",
      kind: "moving",
      x: 4016,
      y: 544,
      width: 96,
      height: 24,
      moveAxis: "y",
      range: 88,
      speed: 1.35,
      originX: 4016,
      originY: 544
    },
    { id: "z4-safe-a", kind: "static", x: 4192, y: 480, width: 80, height: 24, slippery: true },
    {
      id: "z4-lift-b",
      kind: "moving",
      x: 4352,
      y: 416,
      width: 96,
      height: 24,
      moveAxis: "x",
      range: 72,
      speed: 1.72,
      originX: 4352,
      originY: 416
    },
    { id: "z4-safe-b", kind: "static", x: 4512, y: 352, width: 72, height: 24 },
    { id: "z4-core2-base", kind: "static", x: 4512, y: 608, width: 192, height: 112 },
    { id: "z4-core2-body", kind: "static", x: 4544, y: 352, width: 96, height: 256 },
    { id: "z4-core2-top", kind: "static", x: 4512, y: 288, width: 160, height: 32 },
    { id: "z4-safe-right", kind: "static", x: 4752, y: 608, width: 224, height: 112 },

    // Zona 5: corredor de pressao industrial
    { id: "z5-corridor", kind: "static", x: 4992, y: 608, width: 704, height: 112 },
    { id: "z5-shelf-a", kind: "static", x: 5072, y: 536, width: 80, height: 24 },
    { id: "z5-shelf-b", kind: "static", x: 5248, y: 472, width: 80, height: 24 },
    { id: "z5-shelf-c", kind: "static", x: 5424, y: 536, width: 80, height: 24 },
    { id: "z5-shelf-d", kind: "static", x: 5600, y: 472, width: 80, height: 24 },
    {
      id: "z5-break-a",
      kind: "breakable",
      x: 5776,
      y: 536,
      width: 88,
      height: 24,
      breakDelay: 0.32,
      respawnDelay: 2.8,
      slippery: true
    },
    {
      id: "z5-break-b",
      kind: "breakable",
      x: 5920,
      y: 488,
      width: 88,
      height: 24,
      breakDelay: 0.28,
      respawnDelay: 2.8,
      slippery: true
    },

    // Zona 6: torre final e console mestre
    { id: "z6-floor", kind: "static", x: 6032, y: 608, width: 624, height: 112 },
    { id: "z6-step-a", kind: "static", x: 6096, y: 544, width: 96, height: 24, slippery: true },
    {
      id: "z6-step-b",
      kind: "breakable",
      x: 6240,
      y: 496,
      width: 96,
      height: 24,
      breakDelay: 0.3,
      respawnDelay: 2.7,
      slippery: true
    },
    { id: "z6-step-c", kind: "static", x: 6176, y: 432, width: 80, height: 24 },
    { id: "z6-step-d", kind: "static", x: 6304, y: 368, width: 80, height: 24 },
    {
      id: "z6-step-e",
      kind: "timed",
      x: 6176,
      y: 320,
      width: 96,
      height: 24,
      active: true,
      timer: 0.74,
      breakDelay: 0.74,
      respawnDelay: 0.44
    },
    { id: "z6-bridge", kind: "static", x: 6336, y: 320, width: 96, height: 24 },
    { id: "z6-core3-base", kind: "static", x: 6112, y: 608, width: 192, height: 112 },
    { id: "z6-core3-body", kind: "static", x: 6144, y: 352, width: 96, height: 256 },
    { id: "z6-core3-top", kind: "static", x: 6096, y: 288, width: 160, height: 32 },
    { id: "z6-console-base", kind: "static", x: 6368, y: 608, width: 288, height: 112 },
    { id: "z6-console-top", kind: "static", x: 6416, y: 432, width: 128, height: 32 }
  ],

  levers: [],

  doors: [
    { id: "door-gate", label: "Camara mestre de energia", x: 6464, y: 224, width: 64, height: 208, open: false }
  ],

  generators: [
    { id: "core-alpha", label: "Nucleo Alfa", x: 2240, y: 240, width: 64, height: 80, active: false },
    { id: "core-beta", label: "Nucleo Beta", x: 4560, y: 208, width: 64, height: 80, active: false },
    { id: "core-gamma", label: "Nucleo Gama", x: 6144, y: 208, width: 64, height: 80, active: false }
  ],

  checkpoints: [
    { id: "cp-start", x: 256, y: 480, width: 32, height: 128, activated: true },
    { id: "cp-mid", x: 4832, y: 480, width: 32, height: 128, activated: false }
  ],

  collectibles: [
    {
      id: "log-energy-1",
      label: "Registro Alfa",
      x: 1936,
      y: 408,
      width: 24,
      height: 24,
      collected: false,
      text: "Registro Alfa: As passarelas espelhadas foram feitas para parecer seguras. A agua nao mata so por baixo. Ela ensina a desconfiar do brilho."
    },
    {
      id: "log-energy-2",
      label: "Registro Beta",
      x: 3688,
      y: 248,
      width: 24,
      height: 24,
      collected: false,
      text: "Registro Beta: O eixo de manutencao perdeu o ritmo comum. Cada laser canta em um tempo. Quem escuta o metal sobe. Quem nao escuta cai."
    },
    {
      id: "log-energy-3",
      label: "Registro Gama",
      x: 5256,
      y: 424,
      width: 24,
      height: 24,
      collected: false,
      text: "Registro Gama: O corredor de pressao nao foi construido para atrasar. Foi construido para esmagar hesitacao, um pulso de cada vez."
    }
  ],

  windZones: [
    {
      id: "wind-z2-intake",
      x: 1544,
      y: 320,
      width: 880,
      height: 232,
      forceX: 18,
      forceY: -22,
      gravityScale: 0.96
    },
    {
      id: "wind-z3-shaft",
      x: 2768,
      y: 0,
      width: 928,
      height: 720,
      forceX: 6,
      forceY: -188,
      gravityScale: 0.92
    }
  ],

  hazards: [
    {
      id: "drone-z2",
      kind: "drone",
      x: 1784,
      y: 420,
      width: 56,
      height: 28,
      moveAxis: "x",
      range: 388,
      speed: 1.92,
      originX: 1784,
      originY: 420,
      damage: 40,
      active: true
    },

    {
      id: "laser-z3-a",
      kind: "laser",
      x: 2896,
      y: 176,
      width: 12,
      height: 376,
      active: true,
      damage: 100,
      blinkOn: 0.82,
      blinkOff: 0.42
    },
    {
      id: "laser-z3-b",
      kind: "laser",
      x: 3072,
      y: 160,
      width: 12,
      height: 392,
      active: true,
      damage: 100,
      blinkOn: 0.76,
      blinkOff: 0.38
    },
    {
      id: "laser-z3-c",
      kind: "laser",
      x: 3248,
      y: 144,
      width: 12,
      height: 408,
      active: true,
      damage: 100,
      blinkOn: 0.7,
      blinkOff: 0.36
    },
    {
      id: "laser-z3-d",
      kind: "laser",
      x: 3424,
      y: 128,
      width: 12,
      height: 424,
      active: true,
      damage: 100,
      blinkOn: 0.64,
      blinkOff: 0.32
    },

    {
      id: "drone-z4-low",
      kind: "drone",
      x: 4208,
      y: 456,
      width: 56,
      height: 28,
      moveAxis: "y",
      range: 124,
      speed: 2.05,
      originX: 4208,
      originY: 456,
      damage: 45,
      active: true
    },
    {
      id: "drone-z4-high",
      kind: "drone",
      x: 4464,
      y: 320,
      width: 56,
      height: 28,
      moveAxis: "x",
      range: 104,
      speed: 2.42,
      originX: 4464,
      originY: 320,
      damage: 45,
      active: true
    },

    {
      id: "crusher-z5-a",
      kind: "crusher",
      x: 5080,
      y: 80,
      width: 64,
      height: 48,
      active: false,
      triggerId: "trigger-crusher-z5-1",
      direction: "down",
      speed: 500,
      homeX: 5080,
      homeY: 80,
      damage: 100
    },
    {
      id: "crusher-z5-b",
      kind: "crusher",
      x: 5408,
      y: 472,
      width: 64,
      height: 48,
      active: false,
      triggerId: "trigger-crusher-z5-2",
      direction: "left",
      speed: 480,
      homeX: 5408,
      homeY: 472,
      damage: 100
    },
    {
      id: "crusher-z5-c",
      kind: "crusher",
      x: 5608,
      y: 80,
      width: 64,
      height: 48,
      active: false,
      triggerId: "trigger-crusher-z5-3",
      direction: "down",
      speed: 520,
      homeX: 5608,
      homeY: 80,
      damage: 100
    },
    {
      id: "vent-z5",
      kind: "wind",
      x: 5488,
      y: 320,
      width: 304,
      height: 224,
      forceX: 48,
      forceY: -24,
      gravityScale: 0.94,
      active: false,
      triggerId: "trigger-z5-vent"
    },

    {
      id: "drone-z6-guard",
      kind: "drone",
      x: 6368,
      y: 408,
      width: 56,
      height: 28,
      moveAxis: "x",
      range: 132,
      speed: 2.18,
      originX: 6368,
      originY: 408,
      damage: 40,
      active: true
    },
    {
      id: "drone-z6-rush",
      kind: "drone",
      x: 6608,
      y: 392,
      width: 72,
      height: 30,
      active: false,
      triggerId: "trigger-rush-z6",
      direction: "left",
      speed: 520,
      homeX: 6608,
      homeY: 392,
      damage: 100
    }
  ],

  triggerZones: [
    { id: "trigger-z1-respawn-spikes", x: 356, y: 500, width: 24, height: 120, once: true, activated: false },
    { id: "trigger-z1-spikes", x: 576, y: 480, width: 64, height: 160, once: true, activated: false },
    { id: "trigger-z2-fake", x: 1744, y: 384, width: 96, height: 224, once: true, activated: false },
    { id: "trigger-z4-fake", x: 3984, y: 392, width: 96, height: 216, once: true, activated: false },
    { id: "trigger-crusher-z5-1", x: 5024, y: 420, width: 72, height: 200, once: true, activated: false },
    { id: "trigger-crusher-z5-2", x: 5200, y: 360, width: 72, height: 224, once: true, activated: false },
    { id: "trigger-z5-vent", x: 5488, y: 360, width: 48, height: 220, once: true, activated: false },
    { id: "trigger-crusher-z5-3", x: 5520, y: 420, width: 72, height: 200, once: true, activated: false },
    { id: "trigger-z5-spikes", x: 5744, y: 400, width: 96, height: 220, once: true, activated: false },
    { id: "trigger-rush-z6", x: 6320, y: 320, width: 96, height: 256, once: true, activated: false }
  ],

  hiddenSpikes: [
    { id: "z1-spike-respawn", triggerId: "trigger-z1-respawn-spikes", x: 328, y: 576, width: 64, height: 32, active: false },
    { id: "z1-spike-a", triggerId: "trigger-z1-spikes", x: 560, y: 576, width: 96, height: 32, active: false },
    { id: "z1-spike-b", triggerId: "trigger-z1-spikes", x: 656, y: 576, width: 96, height: 32, active: false },
    { id: "z2-spike-a", triggerId: "trigger-z2-fake", x: 1760, y: 576, width: 96, height: 32, active: false },
    { id: "z2-spike-b", triggerId: "trigger-z2-fake", x: 1872, y: 576, width: 96, height: 32, active: false },
    { id: "z4-spike-a", triggerId: "trigger-z4-fake", x: 4016, y: 576, width: 96, height: 32, active: false },
    { id: "z4-spike-b", triggerId: "trigger-z4-fake", x: 4112, y: 576, width: 96, height: 32, active: false },
    { id: "z5-spike-a", triggerId: "trigger-z5-spikes", x: 5776, y: 576, width: 96, height: 32, active: false },
    { id: "z5-spike-b", triggerId: "trigger-z5-spikes", x: 5920, y: 576, width: 96, height: 32, active: false }
  ],

  irrigationConsole: {
    id: "energy-master-console",
    x: 6432,
    y: 352,
    width: 80,
    height: 80,
    active: false
  }
};
