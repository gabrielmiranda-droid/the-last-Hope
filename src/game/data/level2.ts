import type { LevelData } from "../types";

export const levelTwo: LevelData = {
  id: "energy-facility",
  name: "Fase 2: Instalacao de Energia Abandonada",
  introTitle: "Instalacao de Energia Abandonada",
  introText:
    "A usina afundou sem desligar. Dutos brilham sob agua toxica, plataformas molhadas cedem sob pressao e tres nucleos isolados sustentam o ultimo pulso da cidade industrial.",
  victoryTitle: "Energia Restaurada",
  victoryText:
    "Os tres nucleos voltam a pulsar em azul e a malha de energia responde em cascata. Vapor, metal e agua obedecem outra vez, abrindo caminho para a restauracao final.",
  width: 6656,
  height: 720,
  start: { x: 96, y: 512 },
  goalArea: { x: 6304, y: 224, width: 288, height: 368 },

  platforms: [
    // Zona 1: doca de entrada
    { id: "z1-ground", kind: "static", x: 0, y: 608, width: 576, height: 112 },
    { id: "z1-slip-a", kind: "static", x: 640, y: 560, width: 96, height: 24, slippery: true },
    {
      id: "z1-move-a",
      kind: "moving",
      x: 816,
      y: 520,
      width: 104,
      height: 24,
      moveAxis: "x",
      range: 68,
      speed: 1.1,
      originX: 816,
      originY: 520,
      slippery: true
    },
    {
      id: "z1-timed-a",
      kind: "timed",
      x: 1008,
      y: 472,
      width: 96,
      height: 24,
      active: true,
      timer: 0.9,
      breakDelay: 0.9,
      respawnDelay: 0.54,
      slippery: true
    },
    { id: "z1-landing", kind: "static", x: 1184, y: 608, width: 224, height: 112 },

    // Zona 2: passarelas espelhadas e nucleo alfa
    { id: "z2-bank-left", kind: "static", x: 1456, y: 608, width: 160, height: 112 },
    { id: "z2-catwalk-a", kind: "static", x: 1584, y: 552, width: 96, height: 24, slippery: true },
    {
      id: "z2-fake-a",
      kind: "fake",
      x: 1744,
      y: 512,
      width: 112,
      height: 24,
      breakDelay: 0.04,
      respawnDelay: 2.9,
      slippery: true
    },
    {
      id: "z2-break-a",
      kind: "breakable",
      x: 1904,
      y: 464,
      width: 96,
      height: 24,
      breakDelay: 0.32,
      respawnDelay: 2.7,
      slippery: true
    },
    {
      id: "z2-move-a",
      kind: "moving",
      x: 2080,
      y: 416,
      width: 96,
      height: 24,
      moveAxis: "x",
      range: 76,
      speed: 1.48,
      originX: 2080,
      originY: 416
    },
    { id: "z2-core1-brace", kind: "static", x: 2208, y: 384, width: 80, height: 24 },
    { id: "z2-core1-base", kind: "static", x: 2192, y: 608, width: 192, height: 112 },
    { id: "z2-core1-body", kind: "static", x: 2224, y: 384, width: 96, height: 224 },
    { id: "z2-core1-top", kind: "static", x: 2192, y: 320, width: 160, height: 32 },
    { id: "z2-exit-step", kind: "static", x: 2464, y: 400, width: 80, height: 24 },
    {
      id: "z2-exit-break",
      kind: "breakable",
      x: 2592,
      y: 472,
      width: 88,
      height: 24,
      breakDelay: 0.48,
      respawnDelay: 2.5,
      slippery: true
    },

    // Zona 3: chamines de manutencao
    { id: "z3-floor-left", kind: "static", x: 2704, y: 608, width: 128, height: 112 },
    { id: "z3-step-a", kind: "static", x: 2864, y: 560, width: 72, height: 24, slippery: true },
    { id: "z3-step-b", kind: "static", x: 3032, y: 504, width: 72, height: 24, slippery: true },
    {
      id: "z3-timed-a",
      kind: "timed",
      x: 3200,
      y: 448,
      width: 88,
      height: 24,
      active: true,
      timer: 0.82,
      breakDelay: 0.82,
      respawnDelay: 0.5
    },
    { id: "z3-step-c", kind: "static", x: 3368, y: 392, width: 72, height: 24, slippery: true },
    {
      id: "z3-timed-b",
      kind: "timed",
      x: 3536,
      y: 336,
      width: 88,
      height: 24,
      active: true,
      timer: 0.74,
      breakDelay: 0.74,
      respawnDelay: 0.48
    },
    { id: "z3-upper-rail", kind: "static", x: 3696, y: 272, width: 160, height: 32 },
    { id: "z3-landing", kind: "static", x: 3648, y: 608, width: 224, height: 112 },

    // Zona 4: reator ventilado e nucleo beta
    { id: "z4-bank", kind: "static", x: 3904, y: 608, width: 160, height: 112 },
    {
      id: "z4-lift-a",
      kind: "moving",
      x: 4080,
      y: 536,
      width: 96,
      height: 24,
      moveAxis: "y",
      range: 96,
      speed: 1.32,
      originX: 4080,
      originY: 536
    },
    { id: "z4-safe-a", kind: "static", x: 4256, y: 472, width: 80, height: 24, slippery: true },
    {
      id: "z4-fake-a",
      kind: "fake",
      x: 4400,
      y: 424,
      width: 96,
      height: 24,
      breakDelay: 0.05,
      respawnDelay: 2.8,
      slippery: true
    },
    {
      id: "z4-lift-b",
      kind: "moving",
      x: 4560,
      y: 368,
      width: 96,
      height: 24,
      moveAxis: "x",
      range: 68,
      speed: 1.76,
      originX: 4560,
      originY: 368
    },
    { id: "z4-safe-b", kind: "static", x: 4512, y: 352, width: 72, height: 24 },
    { id: "z4-core2-base", kind: "static", x: 4512, y: 608, width: 192, height: 112 },
    { id: "z4-core2-body", kind: "static", x: 4544, y: 352, width: 96, height: 256 },
    { id: "z4-core2-top", kind: "static", x: 4512, y: 288, width: 160, height: 32 },
    { id: "z4-safe-right", kind: "static", x: 4768, y: 608, width: 224, height: 112 },

    // Zona 5: galeria de compressao
    { id: "z5-corridor", kind: "static", x: 4992, y: 608, width: 736, height: 112 },
    { id: "z5-shelf-a", kind: "static", x: 5088, y: 544, width: 80, height: 24 },
    { id: "z5-shelf-b", kind: "static", x: 5264, y: 480, width: 80, height: 24 },
    { id: "z5-shelf-c", kind: "static", x: 5440, y: 544, width: 80, height: 24 },
    { id: "z5-shelf-d", kind: "static", x: 5616, y: 480, width: 80, height: 24 },
    {
      id: "z5-break-a",
      kind: "breakable",
      x: 5792,
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
      x: 5944,
      y: 488,
      width: 88,
      height: 24,
      breakDelay: 0.28,
      respawnDelay: 2.8,
      slippery: true
    },

    // Zona 6: coroa do reator
    { id: "z6-floor", kind: "static", x: 6064, y: 608, width: 592, height: 112 },
    { id: "z6-step-a", kind: "static", x: 6112, y: 544, width: 96, height: 24, slippery: true },
    {
      id: "z6-step-b",
      kind: "breakable",
      x: 6240,
      y: 488,
      width: 96,
      height: 24,
      breakDelay: 0.3,
      respawnDelay: 2.7,
      slippery: true
    },
    { id: "z6-step-c", kind: "static", x: 6384, y: 432, width: 96, height: 24 },
    {
      id: "z6-step-d",
      kind: "timed",
      x: 6240,
      y: 368,
      width: 96,
      height: 24,
      active: true,
      timer: 0.72,
      breakDelay: 0.72,
      respawnDelay: 0.44
    },
    { id: "z6-bridge", kind: "static", x: 6368, y: 320, width: 112, height: 24 },
    { id: "z6-core3-base", kind: "static", x: 6128, y: 608, width: 192, height: 112 },
    { id: "z6-core3-body", kind: "static", x: 6160, y: 352, width: 96, height: 256 },
    { id: "z6-core3-top", kind: "static", x: 6128, y: 288, width: 160, height: 32 },
    { id: "z6-console-base", kind: "static", x: 6384, y: 608, width: 272, height: 112 },
    { id: "z6-console-top", kind: "static", x: 6416, y: 432, width: 128, height: 32 }
  ],

  levers: [],

  doors: [
    { id: "door-gate", label: "Camara do reator mestre", x: 6464, y: 224, width: 64, height: 208, open: false }
  ],

  generators: [
    { id: "core-alpha", label: "Nucleo Alfa", x: 2240, y: 240, width: 64, height: 80, active: false },
    { id: "core-beta", label: "Nucleo Beta", x: 4560, y: 208, width: 64, height: 80, active: false },
    { id: "core-gamma", label: "Nucleo Gama", x: 6176, y: 208, width: 64, height: 80, active: false }
  ],

  checkpoints: [
    { id: "cp-start", x: 256, y: 480, width: 32, height: 128, activated: true },
    { id: "cp-mid", x: 4832, y: 480, width: 32, height: 128, activated: false }
  ],

  collectibles: [
    {
      id: "log-energy-1",
      label: "Registro Alfa",
      x: 1928,
      y: 416,
      width: 24,
      height: 24,
      collected: false,
      text: "Registro Alfa: O brilho no piso nao e reflexo inocente. A agua oleosa transforma passarelas em armadilhas para quem salta sem leitura."
    },
    {
      id: "log-energy-2",
      label: "Registro Beta",
      x: 3720,
      y: 232,
      width: 24,
      height: 24,
      collected: false,
      text: "Registro Beta: O eixo de manutencao perdeu o compasso unico. Cada laser trabalha num pulso. Quem aprende o canto do metal sobe vivo."
    },
    {
      id: "log-energy-3",
      label: "Registro Gama",
      x: 5280,
      y: 432,
      width: 24,
      height: 24,
      collected: false,
      text: "Registro Gama: O corredor de compressao nao tenta atrasar intrusos. Ele tenta quebrar o tempo de resposta deles, um impacto de cada vez."
    }
  ],

  windZones: [
    {
      id: "wind-z2-intake",
      x: 1520,
      y: 320,
      width: 880,
      height: 240,
      forceX: 18,
      forceY: -22,
      gravityScale: 0.96
    },
    {
      id: "wind-z3-shaft",
      x: 2816,
      y: 0,
      width: 912,
      height: 720,
      forceX: 6,
      forceY: -186,
      gravityScale: 0.92
    }
  ],

  hazards: [
    {
      id: "drone-z2",
      kind: "drone",
      x: 1760,
      y: 424,
      width: 56,
      height: 28,
      moveAxis: "x",
      range: 396,
      speed: 1.94,
      originX: 1760,
      originY: 424,
      damage: 40,
      active: true
    },

    {
      id: "laser-z3-a",
      kind: "laser",
      x: 2952,
      y: 184,
      width: 12,
      height: 368,
      active: true,
      damage: 100,
      blinkOn: 0.8,
      blinkOff: 0.42
    },
    {
      id: "laser-z3-b",
      kind: "laser",
      x: 3120,
      y: 168,
      width: 12,
      height: 384,
      active: true,
      damage: 100,
      blinkOn: 0.74,
      blinkOff: 0.38
    },
    {
      id: "laser-z3-c",
      kind: "laser",
      x: 3288,
      y: 152,
      width: 12,
      height: 400,
      active: true,
      damage: 100,
      blinkOn: 0.68,
      blinkOff: 0.34
    },
    {
      id: "laser-z3-d",
      kind: "laser",
      x: 3456,
      y: 136,
      width: 12,
      height: 416,
      active: true,
      damage: 100,
      blinkOn: 0.62,
      blinkOff: 0.3
    },

    {
      id: "drone-z4-low",
      kind: "drone",
      x: 4224,
      y: 448,
      width: 56,
      height: 28,
      moveAxis: "y",
      range: 124,
      speed: 2.04,
      originX: 4224,
      originY: 448,
      damage: 45,
      active: true
    },
    {
      id: "drone-z4-high",
      kind: "drone",
      x: 4480,
      y: 320,
      width: 56,
      height: 28,
      moveAxis: "x",
      range: 112,
      speed: 2.4,
      originX: 4480,
      originY: 320,
      damage: 45,
      active: true
    },

    {
      id: "crusher-z5-a",
      kind: "crusher",
      x: 5096,
      y: 80,
      width: 64,
      height: 48,
      active: false,
      triggerId: "trigger-crusher-z5-1",
      direction: "down",
      speed: 500,
      homeX: 5096,
      homeY: 80,
      damage: 100
    },
    {
      id: "crusher-z5-b",
      kind: "crusher",
      x: 5448,
      y: 480,
      width: 64,
      height: 48,
      active: false,
      triggerId: "trigger-crusher-z5-2",
      direction: "left",
      speed: 480,
      homeX: 5448,
      homeY: 480,
      damage: 100
    },
    {
      id: "crusher-z5-c",
      kind: "crusher",
      x: 5624,
      y: 80,
      width: 64,
      height: 48,
      active: false,
      triggerId: "trigger-crusher-z5-3",
      direction: "down",
      speed: 520,
      homeX: 5624,
      homeY: 80,
      damage: 100
    },
    {
      id: "vent-z5",
      kind: "wind",
      x: 5504,
      y: 320,
      width: 304,
      height: 240,
      forceX: 52,
      forceY: -24,
      gravityScale: 0.94,
      active: false,
      triggerId: "trigger-z5-vent"
    },

    {
      id: "drone-z6-guard",
      kind: "drone",
      x: 6384,
      y: 400,
      width: 56,
      height: 28,
      moveAxis: "x",
      range: 140,
      speed: 2.18,
      originX: 6384,
      originY: 400,
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
    { id: "trigger-z2-fake", x: 1728, y: 384, width: 96, height: 224, once: true, activated: false },
    { id: "trigger-z4-fake", x: 4384, y: 392, width: 96, height: 216, once: true, activated: false },
    { id: "trigger-crusher-z5-1", x: 5040, y: 420, width: 72, height: 200, once: true, activated: false },
    { id: "trigger-crusher-z5-2", x: 5216, y: 360, width: 72, height: 224, once: true, activated: false },
    { id: "trigger-z5-vent", x: 5488, y: 360, width: 48, height: 220, once: true, activated: false },
    { id: "trigger-crusher-z5-3", x: 5568, y: 420, width: 72, height: 200, once: true, activated: false },
    { id: "trigger-z5-spikes", x: 5776, y: 400, width: 96, height: 220, once: true, activated: false },
    { id: "trigger-rush-z6", x: 6320, y: 320, width: 96, height: 256, once: true, activated: false }
  ],

  hiddenSpikes: [
    { id: "z1-spike-respawn", triggerId: "trigger-z1-respawn-spikes", x: 328, y: 576, width: 64, height: 32, active: false },
    { id: "z1-spike-a", triggerId: "trigger-z1-spikes", x: 560, y: 576, width: 96, height: 32, active: false },
    { id: "z1-spike-b", triggerId: "trigger-z1-spikes", x: 656, y: 576, width: 96, height: 32, active: false },
    { id: "z2-spike-a", triggerId: "trigger-z2-fake", x: 1744, y: 576, width: 96, height: 32, active: false },
    { id: "z2-spike-b", triggerId: "trigger-z2-fake", x: 1856, y: 576, width: 96, height: 32, active: false },
    { id: "z4-spike-a", triggerId: "trigger-z4-fake", x: 4400, y: 576, width: 96, height: 32, active: false },
    { id: "z4-spike-b", triggerId: "trigger-z4-fake", x: 4496, y: 576, width: 96, height: 32, active: false },
    { id: "z5-spike-a", triggerId: "trigger-z5-spikes", x: 5792, y: 576, width: 96, height: 32, active: false },
    { id: "z5-spike-b", triggerId: "trigger-z5-spikes", x: 5944, y: 576, width: 96, height: 32, active: false }
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
