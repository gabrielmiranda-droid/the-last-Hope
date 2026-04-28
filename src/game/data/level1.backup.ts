import type { LevelData } from "../types";

export const levelOneBackup: LevelData = {
  id: "dry-region",
  name: "Fase 1: Regiao da Seca",
  width: 4480,
  height: 720,
  start: { x: 128, y: 512 },
  goalArea: { x: 4064, y: 224, width: 224, height: 288 },
  platforms: [
    { id: "intro-ground", kind: "static", x: 0, y: 608, width: 608, height: 112 },
    { id: "intro-step-1", kind: "static", x: 640, y: 544, width: 96, height: 32 },
    { id: "intro-step-2", kind: "static", x: 800, y: 480, width: 96, height: 32 },
    { id: "intro-landing", kind: "static", x: 960, y: 608, width: 224, height: 112 },

    { id: "troll-platform-1", kind: "breakable", x: 1248, y: 512, width: 96, height: 32, breakDelay: 0.5, respawnDelay: 3.2 },
    { id: "troll-platform-2", kind: "static", x: 1408, y: 448, width: 64, height: 32 },
    { id: "troll-platform-3", kind: "static", x: 1536, y: 384, width: 64, height: 32 },
    { id: "troll-fake", kind: "fake", x: 1664, y: 352, width: 96, height: 32, respawnDelay: 2.5 },
    { id: "troll-recovery", kind: "static", x: 1824, y: 608, width: 160, height: 112 },

    { id: "precision-floor", kind: "static", x: 2016, y: 608, width: 128, height: 112 },
    { id: "precision-1", kind: "static", x: 2176, y: 512, width: 64, height: 32 },
    { id: "precision-2", kind: "static", x: 2304, y: 448, width: 64, height: 32 },
    { id: "precision-3", kind: "static", x: 2432, y: 384, width: 64, height: 32 },
    { id: "precision-4", kind: "moving", x: 2560, y: 384, width: 96, height: 32, moveAxis: "x", range: 96, speed: 1.1, originX: 2560, originY: 384 },
    { id: "precision-landing", kind: "static", x: 2752, y: 608, width: 160, height: 112 },

    { id: "wind-base", kind: "static", x: 2944, y: 608, width: 192, height: 112 },
    { id: "wind-platform-1", kind: "static", x: 3040, y: 544, width: 96, height: 32 },
    { id: "wind-platform-2", kind: "fake", x: 3200, y: 480, width: 96, height: 32, respawnDelay: 2.5 },
    { id: "wind-platform-3", kind: "breakable", x: 3360, y: 416, width: 96, height: 32, breakDelay: 0.5, respawnDelay: 3.2 },
    { id: "wind-platform-4", kind: "static", x: 3520, y: 352, width: 96, height: 32 },
    { id: "wind-safe-path", kind: "static", x: 3456, y: 544, width: 96, height: 32 },

    { id: "pressure-floor", kind: "static", x: 3680, y: 608, width: 352, height: 112 },
    { id: "pressure-obstacle-1", kind: "static", x: 3776, y: 544, width: 64, height: 64 },
    { id: "pressure-obstacle-2", kind: "static", x: 3904, y: 512, width: 64, height: 96 },
    { id: "pressure-obstacle-3", kind: "static", x: 4032, y: 544, width: 64, height: 64 },

    { id: "final-floor", kind: "static", x: 4128, y: 608, width: 352, height: 112 },
    { id: "final-gen-1", kind: "static", x: 4192, y: 512, width: 96, height: 32 },
    { id: "final-gen-2", kind: "static", x: 4320, y: 448, width: 96, height: 32 },
    { id: "final-gen-3", kind: "static", x: 4448, y: 384, width: 96, height: 32 },
    { id: "goal-platform", kind: "static", x: 4608, y: 416, width: 160, height: 32 }
  ],
  levers: [],
  doors: [
    { id: "door-gate", label: "Porta do nucleo antigo", x: 4512, y: 288, width: 64, height: 160, open: false }
  ],
  generators: [
    { id: "gen-west", label: "Gerador Oeste", x: 4208, y: 432, width: 70, height: 80, active: false },
    { id: "gen-central", label: "Gerador Central", x: 4336, y: 368, width: 70, height: 80, active: false },
    { id: "gen-east", label: "Gerador Leste", x: 4464, y: 304, width: 70, height: 80, active: false }
  ],
  checkpoints: [
    { id: "cp-start", x: 256, y: 480, width: 32, height: 128, activated: true },
    { id: "cp-mid", x: 1856, y: 480, width: 32, height: 128, activated: false },
    { id: "cp-end", x: 3584, y: 480, width: 32, height: 128, activated: false }
  ],
  collectibles: [
    {
      id: "log-1",
      label: "Log 01",
      x: 672,
      y: 448,
      width: 30,
      height: 30,
      collected: false,
      text: "Log 01: As bombas falharam. A seca venceu primeiro os campos, depois as cidades."
    },
    {
      id: "log-2",
      label: "Log 02",
      x: 2304,
      y: 416,
      width: 30,
      height: 30,
      collected: false,
      text: "Log 02: Os drones foram mantidos ativos para proteger estruturas que ninguem mais visitava."
    },
    {
      id: "log-3",
      label: "Log 03",
      x: 4352,
      y: 320,
      width: 30,
      height: 30,
      collected: false,
      text: "Log 03: Reiniciar a irrigacao nao salva o mundo, mas pode ensinar a terra a respirar de novo."
    }
  ],
  windZones: [
    { id: "wind-canyon", x: 2944, y: 256, width: 736, height: 320, forceX: 20, forceY: -205 }
  ],
  hazards: [
    { id: "drone-1", kind: "drone", x: 1280, y: 352, width: 60, height: 28, moveAxis: "x", range: 128, speed: 1.4, originX: 1280, originY: 352, active: true },
    { id: "crusher-left", kind: "crusher", x: 3648, y: 416, width: 64, height: 192, active: false, triggerId: "trigger-crusher", direction: "right", speed: 320, homeX: 3648, homeY: 416, damage: 100 },
    { id: "drone-rush", kind: "drone", x: 4064, y: 352, width: 72, height: 30, active: false, triggerId: "trigger-rush-drone", direction: "left", speed: 380, homeX: 4064, homeY: 352, damage: 100 }
  ],
  triggerZones: [
    { id: "trigger-fake-spikes", x: 2080, y: 352, width: 32, height: 64, once: true, activated: false },
    { id: "trigger-mid-spikes", x: 4176, y: 512, width: 32, height: 96, once: true, activated: false },
    { id: "trigger-crusher", x: 3728, y: 480, width: 64, height: 128, once: true, activated: false },
    { id: "trigger-rush-drone", x: 4016, y: 512, width: 64, height: 96, once: true, activated: false }
  ],
  hiddenSpikes: [
    { id: "spike-fake-1", triggerId: "trigger-fake-spikes", x: 2080, y: 576, width: 96, height: 32, active: false },
    { id: "spike-fake-2", triggerId: "trigger-fake-spikes", x: 2176, y: 576, width: 96, height: 32, active: false },
    { id: "spike-long-1", triggerId: "trigger-mid-spikes", x: 4192, y: 576, width: 96, height: 32, active: false },
    { id: "spike-long-2", triggerId: "trigger-mid-spikes", x: 4288, y: 576, width: 96, height: 32, active: false }
  ],
  irrigationConsole: {
    id: "irrigation-core",
    x: 4768,
    y: 352,
    width: 72,
    height: 80,
    active: false
  }
};
