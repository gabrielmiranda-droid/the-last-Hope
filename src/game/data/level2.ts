import type { LevelData } from "../types";

export const levelTwo: LevelData = {
  id: "energy-facility",
  name: "Fase 2: Instalacao de Energia Abandonada",
  introTitle: "Instalacao de Energia Abandonada",
  introText:
    "A usina submergiu. Plataformas flutuam sobre agua contaminada, lasers verticais varrem corredores e os tres nucleos esperam nos andares mais altos. Nao ha como voltar.",
  victoryTitle: "Energia Restaurada",
  victoryText:
    "Os nucleos voltaram a pulsar em azul. A cidade industrial responde e envia energia suficiente para sustentar a restauracao final.",
  width: 6656,
  height: 720,
  start: { x: 80, y: 512 },
  goalArea: { x: 6320, y: 288, width: 240, height: 320 },

  platforms: [

    // ── ZONA 1: ENTRADA (x: 0 – 1100) ─────────────────────────────
    // Plataformas MÓVEIS logo no início — diferente da fase 1
    // Jogador aprende que o chão se move antes de qualquer armadilha
    { id: "z1-ground",    kind: "static",  x: 0,    y: 608, width: 560, height: 112 },

    // Três plataformas móveis horizontais — amplitude pequena, fáceis
    { id: "z1-moving-a",  kind: "moving",  x: 624,  y: 560, width: 112, height: 24,
      moveAxis: "x", range: 60, speed: 1.2, originX: 624, originY: 560 },
    { id: "z1-moving-b",  kind: "moving",  x: 816,  y: 512, width: 112, height: 24,
      moveAxis: "x", range: 60, speed: 1.4, originX: 816, originY: 512 },
    { id: "z1-moving-c",  kind: "moving",  x: 1008, y: 464, width: 112, height: 24,
      moveAxis: "x", range: 60, speed: 1.6, originX: 1008, originY: 464 },

    { id: "z1-landing",   kind: "static",  x: 1168, y: 608, width: 192, height: 112 },

    // ── ZONA 2: GERADOR 1 + FALSAS + DRONE (x: 1100 – 2500) ───────
    // Plataformas falsas intercaladas com reais — drone patrulha acima
    // GERADOR 1 no alto de uma torre no fim da zona
    { id: "z2-real-a",    kind: "static",  x: 1424, y: 544, width: 80, height: 24 },
    { id: "z2-fake-a",    kind: "fake",    x: 1568, y: 512, width: 96, height: 24,
      breakDelay: 0.05, respawnDelay: 2.8 },
    { id: "z2-real-b",    kind: "static",  x: 1728, y: 480, width: 80, height: 24 },
    { id: "z2-fake-b",    kind: "fake",    x: 1872, y: 448, width: 96, height: 24,
      breakDelay: 0.05, respawnDelay: 2.8 },
    { id: "z2-real-c",    kind: "static",  x: 2032, y: 416, width: 80, height: 24 },

    // Torre do Gerador 1
    { id: "z2-tower-base",kind: "static",  x: 2192, y: 608, width: 160, height: 112 },
    { id: "z2-tower-body",kind: "static",  x: 2224, y: 432, width: 96,  height: 176 },
    { id: "z2-tower-top", kind: "static",  x: 2192, y: 368, width: 160, height: 32  },
    { id: "z2-safe",      kind: "static",  x: 2416, y: 608, width: 192, height: 112 },

    // ── ZONA 3: CORREDOR DE LASERS VERTICAIS (x: 2500 – 3700) ─────
    // Lasers verticais (width pequeno, height grande) — DIFERENTE da fase 1
    // Degraus estáticos pequenos — jogador calcula janela dos lasers para subir
    // Vento para CIMA nessa zona (diferente da fase 1 que era lateral)
    { id: "z3-floor",     kind: "static",  x: 2672, y: 608, width: 128, height: 112 },
    { id: "z3-step-a",    kind: "static",  x: 2864, y: 552, width: 72,  height: 24  },
    { id: "z3-step-b",    kind: "static",  x: 3040, y: 496, width: 72,  height: 24  },
    { id: "z3-step-c",    kind: "static",  x: 3216, y: 440, width: 72,  height: 24  },
    { id: "z3-step-d",    kind: "static",  x: 3392, y: 384, width: 72,  height: 24  },
    { id: "z3-landing",   kind: "static",  x: 3568, y: 608, width: 192, height: 112 },

    // ── ZONA 4: GERADOR 2 + PLATAFORMAS MÓVEIS VERTICAIS (x: 3700 – 4900) ──
    // Plataformas móveis no EIXO Y — sobe e desce
    // Jogador precisa calcular o momento certo para pular entre elas
    // GERADOR 2 no alto
    { id: "z4-bank",      kind: "static",  x: 3824, y: 608, width: 128, height: 112 },

    // Móveis verticais — sobem e descem em amplitudes diferentes
    { id: "z4-vert-a",    kind: "moving",  x: 4016, y: 520, width: 96,  height: 24,
      moveAxis: "y", range: 80, speed: 1.3, originX: 4016, originY: 520 },
    { id: "z4-vert-b",    kind: "moving",  x: 4176, y: 480, width: 96,  height: 24,
      moveAxis: "y", range: 100, speed: 1.5, originX: 4176, originY: 480 },
    { id: "z4-vert-c",    kind: "moving",  x: 4336, y: 440, width: 96,  height: 24,
      moveAxis: "y", range: 80, speed: 1.7, originX: 4336, originY: 440 },

    // Torre do Gerador 2
    { id: "z4-tower-base",kind: "static",  x: 4512, y: 608, width: 160, height: 112 },
    { id: "z4-tower-body",kind: "static",  x: 4544, y: 368, width: 96,  height: 240 },
    { id: "z4-tower-top", kind: "static",  x: 4512, y: 304, width: 160, height: 32  },
    { id: "z4-safe",      kind: "static",  x: 4736, y: 608, width: 192, height: 112 },

    // ── ZONA 5: CORREDOR DE CRUSHERS (x: 4900 – 5900) ────────────
    // Corredor horizontal com 3 crushers descendo do teto
    // Shelves pequenas para o jogador parar e calcular
    // Plataformas quebradiças no final — sem pausa
    { id: "z5-corridor",  kind: "static",  x: 4992, y: 608, width: 704, height: 112 },
    { id: "z5-shelf-a",   kind: "static",  x: 5072, y: 536, width: 72,  height: 24  },
    { id: "z5-shelf-b",   kind: "static",  x: 5296, y: 536, width: 72,  height: 24  },
    { id: "z5-shelf-c",   kind: "static",  x: 5520, y: 536, width: 72,  height: 24  },

    // Quebradiças no fim do corredor — sem pausa antes da torre
    { id: "z5-break-a",   kind: "breakable", x: 5760, y: 544, width: 96, height: 24,
      breakDelay: 0.35, respawnDelay: 2.8 },
    { id: "z5-break-b",   kind: "breakable", x: 5920, y: 496, width: 96, height: 24,
      breakDelay: 0.32, respawnDelay: 2.8 },

    // ── ZONA 6: GERADOR 3 + CONSOLE (x: 5900 – 6656) ─────────────
    // Degraus simples — a dificuldade já passou
    // GERADOR 3 no alto, console final protegido por drone
    { id: "z6-floor",     kind: "static",  x: 6064, y: 608, width: 592, height: 112 },
    { id: "z6-step-a",    kind: "static",  x: 6144, y: 544, width: 96,  height: 24  },
    { id: "z6-step-b",    kind: "static",  x: 6288, y: 480, width: 96,  height: 24  },

    // Torre do Gerador 3
    { id: "z6-tower-base",kind: "static",  x: 6128, y: 608, width: 160, height: 112 },
    { id: "z6-tower-body",kind: "static",  x: 6160, y: 352, width: 96,  height: 256 },
    { id: "z6-tower-top", kind: "static",  x: 6128, y: 288, width: 160, height: 32  },

    // Console base
    { id: "z6-console-base",kind: "static",x: 6384, y: 608, width: 272, height: 112 },
    { id: "z6-console-top", kind: "static",x: 6416, y: 480, width: 128, height: 32  },
  ],

  levers: [],

  doors: [
    { id: "door-gate", label: "Camara de energia", x: 6464, y: 256, width: 64, height: 224, open: false }
  ],

  // Geradores BEM distribuídos — x≈2192, x≈4512, x≈6128
  generators: [
    { id: "core-alpha", label: "Nucleo Alfa",  x: 2240, y: 288, width: 64, height: 80, active: false },
    { id: "core-beta",  label: "Nucleo Beta",  x: 4560, y: 224, width: 64, height: 80, active: false },
    { id: "core-gamma", label: "Nucleo Gama",  x: 6176, y: 208, width: 64, height: 80, active: false }
  ],

  checkpoints: [
    { id: "cp-start", x: 256,  y: 480, width: 32, height: 128, activated: true  },
    { id: "cp-mid",   x: 4736, y: 480, width: 32, height: 128, activated: false }
  ],

  collectibles: [
    { id: "log-energy-1", label: "Registro Alfa", x: 1728, y: 432, width: 24, height: 24, collected: false,
      text: "Registro Alfa: As passarelas falsas foram instaladas para filtrar tecnicos sem autorizacao. So os mais atentos chegam aos nucleos." },
    { id: "log-energy-2", label: "Registro Beta", x: 3216, y: 392, width: 24, height: 24, collected: false,
      text: "Registro Beta: Os lasers verticais nao piscam no mesmo ritmo. Ha uma janela. Quem a encontra, passa." },
    { id: "log-energy-3", label: "Registro Gama", x: 5520, y: 488, width: 24, height: 24, collected: false,
      text: "Registro Gama: Tres crushers em sequencia. O primeiro ensina o ritmo. O segundo testa. O terceiro nao perdoa distração." }
  ],

  windZones: [
    // Vento para CIMA na zona dos lasers verticais — empurra o jogador
    // dificultando o controle nos degraus (diferente da fase 1 que era lateral)
    {
      id: "wind-z3-up",
      x: 2720, y: 0, width: 880, height: 720,
      forceX: 0, forceY: -160
    }
  ],

  hazards: [
    // ZONA 2 — Drone patrulha acima das plataformas falsas
    // Eixo X, posicionado 80px acima da z2-fake-a
    { id: "drone-z2",
      kind: "drone",
      x: 1568, y: 432, width: 56, height: 28,
      moveAxis: "x", range: 400, speed: 1.8,
      originX: 1568, originY: 432,
      damage: 40, active: true },

    // ZONA 3 — Lasers VERTICAIS (height grande, width pequeno)
    // Posicionados entre os degraus — jogador espera a janela para subir
    { id: "laser-z3-a", kind: "laser",
      x: 2920, y: 200, width: 12, height: 352,
      active: true, damage: 100, blinkOn: 0.8, blinkOff: 0.4 },
    { id: "laser-z3-b", kind: "laser",
      x: 3096, y: 200, width: 12, height: 352,
      active: true, damage: 100, blinkOn: 0.75, blinkOff: 0.38 },
    { id: "laser-z3-c", kind: "laser",
      x: 3272, y: 200, width: 12, height: 352,
      active: true, damage: 100, blinkOn: 0.7, blinkOff: 0.35 },

    // ZONA 5 — 3 crushers descendo do teto, um acima de cada shelf
    // Crusher acima de shelf-a (x:5072)
    { id: "crusher-z5-a", kind: "crusher",
      x: 5080, y: 80, width: 64, height: 48,
      active: false, triggerId: "trigger-crusher-a",
      direction: "down", speed: 480,
      homeX: 5080, homeY: 80, damage: 100 },

    // Crusher acima de shelf-b (x:5296)
    { id: "crusher-z5-b", kind: "crusher",
      x: 5304, y: 80, width: 64, height: 48,
      active: false, triggerId: "trigger-crusher-b",
      direction: "down", speed: 460,
      homeX: 5304, homeY: 80, damage: 100 },

    // Crusher acima de shelf-c (x:5520)
    { id: "crusher-z5-c", kind: "crusher",
      x: 5528, y: 80, width: 64, height: 48,
      active: false, triggerId: "trigger-crusher-c",
      direction: "down", speed: 440,
      homeX: 5528, homeY: 80, damage: 100 },

    // ZONA 6 — Drone rush guardando o console
    { id: "drone-z6-rush", kind: "drone",
      x: 6560, y: 400, width: 72, height: 30,
      active: false, triggerId: "trigger-drone-z6",
      direction: "left", speed: 480,
      homeX: 6560, homeY: 400, damage: 100 }
  ],

  triggerZones: [
    // Zona 1 — espinhos ao sair do chão inicial
    { id: "trigger-z1-spikes",  x: 560,  y: 480, width: 64, height: 160, once: true, activated: false },

    // Zona 2 — espinhos sob as falsas
    { id: "trigger-z2-fake",    x: 1520, y: 400, width: 80, height: 220, once: true, activated: false },

    // Zona 4 — espinhos na seção de móveis verticais
    { id: "trigger-z4-spikes",  x: 4000, y: 400, width: 80, height: 220, once: true, activated: false },

    // Zona 5 — crushers ativados em sequência ao entrar no corredor
    { id: "trigger-crusher-a",  x: 5024, y: 400, width: 64, height: 220, once: true, activated: false },
    { id: "trigger-crusher-b",  x: 5248, y: 400, width: 64, height: 220, once: true, activated: false },
    { id: "trigger-crusher-c",  x: 5472, y: 400, width: 64, height: 220, once: true, activated: false },

    // Zona 5 — espinhos nas quebradiças finais
    { id: "trigger-z5-spikes",  x: 5744, y: 400, width: 80, height: 220, once: true, activated: false },

    // Zona 6 — drone rush ao chegar perto do console
    { id: "trigger-drone-z6",   x: 6320, y: 320, width: 80, height: 288, once: true, activated: false }
  ],

  hiddenSpikes: [
    // Zona 1 — após o chão inicial
    { id: "spike-z1-a", triggerId: "trigger-z1-spikes", x: 560, y: 576, width: 96, height: 32, active: false },
    { id: "spike-z1-b", triggerId: "trigger-z1-spikes", x: 656, y: 576, width: 96, height: 32, active: false },

    // Zona 2 — sob as plataformas falsas
    { id: "spike-z2-a", triggerId: "trigger-z2-fake",   x: 1568, y: 576, width: 96, height: 32, active: false },
    { id: "spike-z2-b", triggerId: "trigger-z2-fake",   x: 1872, y: 576, width: 96, height: 32, active: false },

    // Zona 4 — sob as móveis verticais
    { id: "spike-z4-a", triggerId: "trigger-z4-spikes", x: 4016, y: 576, width: 96, height: 32, active: false },
    { id: "spike-z4-b", triggerId: "trigger-z4-spikes", x: 4176, y: 576, width: 96, height: 32, active: false },

    // Zona 5 — sob as quebradiças finais
    { id: "spike-z5-a", triggerId: "trigger-z5-spikes", x: 5760, y: 576, width: 96, height: 32, active: false },
    { id: "spike-z5-b", triggerId: "trigger-z5-spikes", x: 5920, y: 576, width: 96, height: 32, active: false }
  ],

  irrigationConsole: {
    id: "energy-master-console",
    x: 6432, y: 400, width: 80, height: 80, active: false
  }
};
