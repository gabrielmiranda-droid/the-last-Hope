import { overlaps } from "../utils";
import type { DamageSource, Hazard, HiddenSpike, LevelData, Platform, Rect } from "../types";

type StandingCheck = (player: Rect, platform: Rect) => boolean;

export type TrapDisplacement = {
  x: number;
  y: number;
};

export type TrapDamage = {
  amount: number;
  forceRespawn: boolean;
  cause: DamageSource;
};

export type TrapForces = {
  forceX: number;
  forceY: number;
  gravityScale: number;
};

export class TrapSystem {
  private baselineLevel: LevelData | null = null;
  private triggerSpikeSelections = new Map<string, string[]>();
  private simulationTime = 0;

  initializeRun(level: LevelData) {
    this.simulationTime = 0;
    this.triggerSpikeSelections = new Map();
    this.cacheTriggerSpikes(level);
    this.baselineLevel = structuredClone(level);
  }

  updateWorld(level: LevelData, delta: number, player: Rect & { onGround: boolean }, isStandingOn: StandingCheck): TrapDisplacement {
    this.simulationTime += delta;
    let carryX = 0;
    let carryY = 0;

    for (const platform of level.platforms) {
      if (platform.kind === "moving") {
        const movement = this.updateMovingPlatform(platform, delta, player, isStandingOn);
        carryX += movement.x;
        carryY += movement.y;
        continue;
      }

      if (platform.kind === "breakable") {
        this.updateBreakablePlatform(platform, delta);
        continue;
      }

      if (platform.kind === "fake") {
        this.updateFakePlatform(platform, delta);
        continue;
      }

      if (platform.kind === "timed") {
        this.updateTimedPlatform(platform, delta);
      }
    }

    for (const hazard of level.hazards) {
      if (hazard.kind === "laser") {
        this.updateLaserHazard(hazard, delta);
        continue;
      }

      if (hazard.kind === "crusher") {
        this.updateCrusherHazard(hazard, delta);
        continue;
      }

      if (hazard.kind === "drone" && hazard.triggerId) {
        this.updateTriggeredDrone(hazard, level.width, delta);
        continue;
      }

      if (hazard.active && hazard.moveAxis && hazard.range && hazard.speed) {
        const origin = hazard.moveAxis === "x" ? hazard.originX ?? hazard.x : hazard.originY ?? hazard.y;
        const offset = Math.sin(this.simulationTime * hazard.speed) * hazard.range;
        if (hazard.moveAxis === "x") {
          hazard.x = origin + offset;
        } else {
          hazard.y = origin + offset;
        }
      }
    }

    return { x: carryX, y: carryY };
  }

  armPlatformTrap(level: LevelData, platformId: string) {
    const platform = level.platforms.find((item) => item.id === platformId);
    if (!platform) {
      return;
    }

    if (platform.kind === "breakable" && (platform.timer === undefined || platform.timer === 0)) {
      platform.timer = platform.breakDelay ?? 0.45;
      return;
    }

    if (platform.kind === "fake" && !platform.broken && (platform.timer === undefined || platform.timer === 0)) {
      const triggerDelay = platform.breakDelay ?? 0;
      if (triggerDelay > 0) {
        platform.timer = triggerDelay;
      } else {
        platform.broken = true;
        platform.timer = -(platform.respawnDelay ?? 2.8);
      }
    }
  }

  updateTriggers(level: LevelData, player: Rect): string | null {
    let latestMessage: string | null = null;

    for (const zone of level.triggerZones) {
      if (zone.once && zone.activated) {
        continue;
      }

      if (!overlaps(player, zone)) {
        continue;
      }

      zone.activated = true;

      const selectedSpikes = this.triggerSpikeSelections.get(zone.id);
      for (const spike of level.hiddenSpikes) {
        if (spike.triggerId === zone.id && (!selectedSpikes || selectedSpikes.includes(spike.id))) {
          spike.active = true;
        }
      }

      for (const hazard of level.hazards) {
        if (hazard.triggerId === zone.id) {
          hazard.active = true;
          hazard.timer = 0;
          hazard.x = hazard.homeX ?? hazard.x;
          hazard.y = hazard.homeY ?? hazard.y;
        }
      }

      latestMessage = this.getTriggerMessage(zone.id);
    }

    return latestMessage;
  }

  collectDamage(level: LevelData, player: Rect): TrapDamage | null {
    for (const spike of level.hiddenSpikes) {
      if (spike.active && overlaps(player, this.getSpikeHitRect(spike))) {
        return { amount: 100, forceRespawn: true, cause: "spike" };
      }
    }

    for (const hazard of level.hazards) {
      if (hazard.kind === "wind") {
        continue;
      }

      if (hazard.active && overlaps(player, this.getHazardHitRect(hazard))) {
        return {
          amount: hazard.damage ?? (hazard.kind === "drone" ? 40 : 18),
          forceRespawn: hazard.kind === "crusher",
          cause: hazard.kind
        };
      }
    }

    return null;
  }

  sampleEnvironmentalForces(level: LevelData, player: Rect): TrapForces {
    let forceX = 0;
    let forceY = 0;
    let gravityScale = 1;

    for (const zone of level.windZones) {
      if (!overlaps(player, zone)) {
        continue;
      }

      forceX += zone.forceX;
      forceY += zone.forceY;
      if (zone.gravityScale !== undefined) {
        gravityScale = Math.min(gravityScale, zone.gravityScale);
      }
    }

    for (const hazard of level.hazards) {
      if (hazard.kind !== "wind" || hazard.active === false || !overlaps(player, hazard)) {
        continue;
      }

      forceX += hazard.forceX ?? 0;
      forceY += hazard.forceY ?? 0;
      if (hazard.gravityScale !== undefined) {
        gravityScale = Math.min(gravityScale, hazard.gravityScale);
      }
    }

    return { forceX, forceY, gravityScale };
  }

  getSolidRects(level: LevelData): Rect[] {
    const doorRects = level.doors.filter((door) => !door.open);
    const platformRects = level.platforms.filter((platform) => !platform.broken && platform.active !== false);
    return [...platformRects, ...doorRects];
  }

  restoreDynamicState(level: LevelData) {
    if (!this.baselineLevel) {
      return;
    }

    this.simulationTime = 0;
    const baselinePlatforms = new Map(this.baselineLevel.platforms.map((platform) => [platform.id, platform]));
    const baselineHazards = new Map(this.baselineLevel.hazards.map((hazard) => [hazard.id, hazard]));
    const baselineTriggers = new Map(this.baselineLevel.triggerZones.map((zone) => [zone.id, zone]));
    const baselineSpikes = new Map(this.baselineLevel.hiddenSpikes.map((spike) => [spike.id, spike]));

    for (const platform of level.platforms) {
      const baseline = baselinePlatforms.get(platform.id);
      if (!baseline) {
        continue;
      }

      platform.x = baseline.x;
      platform.y = baseline.y;
      platform.active = baseline.active;
      platform.timer = baseline.timer;
      platform.broken = baseline.broken;
      platform.breakDelay = baseline.breakDelay;
      platform.respawnDelay = baseline.respawnDelay;
    }

    for (const hazard of level.hazards) {
      const baseline = baselineHazards.get(hazard.id);
      if (!baseline) {
        continue;
      }

      hazard.x = baseline.x;
      hazard.y = baseline.y;
      hazard.active = baseline.active;
      hazard.timer = baseline.timer;
      hazard.speed = baseline.speed;
      hazard.blinkOn = baseline.blinkOn;
      hazard.blinkOff = baseline.blinkOff;
    }

    for (const zone of level.triggerZones) {
      const baseline = baselineTriggers.get(zone.id);
      zone.activated = baseline?.activated ?? false;
    }

    for (const spike of level.hiddenSpikes) {
      const baseline = baselineSpikes.get(spike.id);
      spike.active = baseline?.active ?? false;
    }
  }

  private updateMovingPlatform(
    platform: Platform,
    delta: number,
    player: Rect & { onGround: boolean },
    isStandingOn: StandingCheck
  ): TrapDisplacement {
    if (!platform.moveAxis || !platform.range || !platform.speed) {
      return { x: 0, y: 0 };
    }

    const origin = platform.moveAxis === "x" ? platform.originX ?? platform.x : platform.originY ?? platform.y;
    const offset = Math.sin(this.simulationTime * platform.speed) * platform.range;
    const previousX = platform.x;
    const previousY = platform.y;

    if (platform.moveAxis === "x") {
      platform.x = origin + offset;
    } else {
      platform.y = origin + offset;
    }

    if (player.onGround && isStandingOn(player, { ...platform, x: previousX, y: previousY })) {
      return {
        x: platform.x - previousX,
        y: platform.y - previousY
      };
    }

    return { x: 0, y: 0 };
  }

  private updateBreakablePlatform(platform: Platform, delta: number) {
    if (typeof platform.timer !== "number") {
      return;
    }

    if (!platform.broken && platform.timer > 0) {
      platform.timer -= delta;
      if (platform.timer <= 0) {
        platform.broken = true;
        platform.timer = -(platform.respawnDelay ?? 0);
      }
      return;
    }

    if (platform.broken && platform.timer < 0) {
      platform.timer += delta;
      if (platform.timer >= 0) {
        platform.broken = false;
        platform.timer = 0;
      }
    }
  }

  private updateFakePlatform(platform: Platform, delta: number) {
    if (typeof platform.timer !== "number") {
      return;
    }

    if (platform.broken) {
      platform.timer += delta;
      if (platform.timer >= 0) {
        platform.broken = false;
        platform.timer = 0;
      }
      return;
    }

    if (platform.timer > 0) {
      platform.timer -= delta;
      if (platform.timer <= 0) {
        platform.broken = true;
        platform.timer = -(platform.respawnDelay ?? 2.8);
      }
    }
  }

  private updateTimedPlatform(platform: Platform, delta: number) {
    if (platform.timer === undefined) {
      platform.active = platform.active ?? true;
      platform.timer = platform.active ? platform.breakDelay ?? 1 : platform.respawnDelay ?? 1;
    }

    platform.timer -= delta;
    if (platform.timer <= 0) {
      platform.active = !(platform.active ?? true);
      platform.timer = platform.active ? platform.breakDelay ?? 1.1 : platform.respawnDelay ?? 0.9;
    }
  }

  private updateLaserHazard(hazard: Hazard, delta: number) {
    if (!hazard.blinkOn || !hazard.blinkOff) {
      return;
    }

    hazard.timer = (hazard.timer ?? 0) + delta;
    const cycle = hazard.blinkOn + hazard.blinkOff;
    const phase = hazard.timer % cycle;
    hazard.active = phase < hazard.blinkOn;
  }

  private updateCrusherHazard(hazard: Hazard, delta: number) {
    if (!hazard.active) {
      hazard.x = hazard.homeX ?? hazard.x;
      hazard.y = hazard.homeY ?? hazard.y;
      return;
    }

    hazard.timer = (hazard.timer ?? 0) + delta;
    const phaseIn = Math.min((hazard.timer ?? 0) / 0.42, 1);
    const phaseOut = Math.max(0, ((hazard.timer ?? 0) - 0.42) / 0.5);
    const strength = phaseOut > 0 ? 1 - Math.min(phaseOut, 1) : phaseIn;
    const travel = 120 * strength;

    if (hazard.direction === "right") {
      hazard.x = (hazard.homeX ?? hazard.x) + travel;
    } else if (hazard.direction === "left") {
      hazard.x = (hazard.homeX ?? hazard.x) - travel;
    } else if (hazard.direction === "down") {
      hazard.y = (hazard.homeY ?? hazard.y) + travel;
    } else if (hazard.direction === "up") {
      hazard.y = (hazard.homeY ?? hazard.y) - travel;
    }

    if ((hazard.timer ?? 0) >= 0.92) {
      hazard.active = false;
      hazard.timer = 0;
      hazard.x = hazard.homeX ?? hazard.x;
      hazard.y = hazard.homeY ?? hazard.y;
    }
  }

  private updateTriggeredDrone(hazard: Hazard, levelWidth: number, delta: number) {
    if (!hazard.active) {
      hazard.x = hazard.homeX ?? hazard.x;
      hazard.y = hazard.homeY ?? hazard.y;
      return;
    }

    const direction = hazard.direction === "left" ? -1 : 1;
    hazard.x += direction * (hazard.speed ?? 320) * delta;
    if (hazard.x + hazard.width < -240 || hazard.x > levelWidth + 240) {
      hazard.active = false;
      hazard.x = hazard.homeX ?? hazard.x;
      hazard.y = hazard.homeY ?? hazard.y;
    }
  }

  private cacheTriggerSpikes(level: LevelData) {
    const spikeGroups = new Map<string, string[]>();
    for (const spike of level.hiddenSpikes) {
      const group = spikeGroups.get(spike.triggerId) ?? [];
      group.push(spike.id);
      spikeGroups.set(spike.triggerId, group);
    }

    for (const [triggerId, ids] of spikeGroups.entries()) {
      this.triggerSpikeSelections.set(triggerId, ids);
    }
  }

  private getTriggerMessage(triggerId: string) {
    const triggerMessages: Record<string, string> = {
      "trigger-spikes": "O solo cedeu e respondeu ao seu peso.",
      "trigger-crusher": "As paredes antigas despertaram.",
      "trigger-start-spikes": "A passagem fechou atras de Zion.",
      "trigger-fake-spikes": "O caminho falso revelou espinhos ocultos.",
      "trigger-mid-spikes": "A plataforma longa nao era tao segura.",
      "trigger-rush-drone": "Um drone de seguranca entrou na rota.",
      "trigger-hidden-spikes": "A energia instavel abriu espinhos sob o piso.",
      "trigger-z1-respawn-spikes": "O checkpoint inicial ja esta sob pressao.",
      "trigger-z1-spikes": "O corredor inicial armou espinhos atras de voce.",
      "trigger-z2-spikes": "As placas quebradas esconderam um fosso armado.",
      "trigger-z2-fake-spikes": "A ponte falsa cedeu sobre o fosso de espinhos.",
      "trigger-z2-exit-seal": "A saida do gerador fechou a rota de volta.",
      "trigger-z3-fake": "O piso falso afundou e revelou a armadilha.",
      "trigger-z3-spikes": "A passagem adiante brotou espinhos entre as raizes.",
      "trigger-z4-fake": "A subida final abriu espinhos sob as placas ocas.",
      "trigger-z5-spikes": "O corredor final abriu um leito de espinhos no piso.",
      "trigger-rush-z5": "O drone de perseguicao entrou em rota de colisao.",
      "trigger-rush-z6": "Os ceus da clareira acordaram um ultimo drone.",
      "trigger-z6-drone-guard": "A camara energizada soltou um ultimo drone de guarda.",
      "trigger-drone-rush": "O drone de perseguicao entrou em rota de colisao.",
      "trigger-drone-final": "A aproximacao final chamou reforcos automaticos.",
      "trigger-z5-drone-rush": "A passarela final chamou um drone de perseguicao.",
      "trigger-crusher-z6": "A camara final reacendeu seus pistoes.",
      "trigger-crusher-z5-1": "O teto respondeu com um golpe seco.",
      "trigger-crusher-z5-2": "Outro pistao caiu no corredor.",
      "trigger-crusher-z5-3": "A ultima passada do corredor ficou comprometida.",
      "trigger-crusher-approach": "A passarela final armou um esmagador acima de voce.",
      "trigger-z5-crusher-approach": "O corredor do console armou um esmagador acima de voce.",
      "trigger-crusher-final": "O console central ainda tenta se defender.",
      "trigger-z5-crusher-final": "O console central ainda tenta se defender."
    };

    return triggerMessages[triggerId] ?? null;
  }

  private getHazardHitRect(hazard: Hazard): Rect {
    if (hazard.kind === "laser") {
      return {
        x: hazard.x + 2,
        y: hazard.y + 2,
        width: Math.max(4, hazard.width - 4),
        height: Math.max(4, hazard.height - 4)
      };
    }

    if (hazard.kind === "drone") {
      return {
        x: hazard.x + 4,
        y: hazard.y + 3,
        width: Math.max(8, hazard.width - 8),
        height: Math.max(8, hazard.height - 6)
      };
    }

    return hazard;
  }

  private getSpikeHitRect(spike: HiddenSpike): Rect {
    return {
      x: spike.x + 6,
      y: spike.y + 6,
      width: Math.max(12, spike.width - 12),
      height: Math.max(10, spike.height - 10)
    };
  }
}
