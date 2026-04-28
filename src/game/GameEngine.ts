import {
  CAMERA_LERP,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  COYOTE_TIME,
  DAMAGE_COOLDOWN,
  DASH_COOLDOWN,
  DASH_DURATION,
  DASH_SPEED,
  DOUBLE_JUMP_SPEED,
  GRAVITY,
  JUMP_BUFFER,
  JUMP_SPEED,
  MAX_FALL_SPEED,
  MOVE_SPEED,
  PLAYER_MAX_ENERGY,
  RESPAWN_FADE,
} from "./constants";
import { audioManager } from "./AudioManager";
import { ASSET_PATHS, getAllImageAssetPaths } from "./assets";
import { DEFAULT_CHARACTER_ID, getCharacterOption } from "./characters";
import { levelOne } from "./data/level1";
import { levelTwo } from "./data/level2";
import { levelThree } from "./data/level3";
import { particles } from "./ParticleSystem";
import { TrapSystem } from "./systems/TrapSystem";
import { clamp, distance, lerp, overlaps } from "./utils";
import type {
  Checkpoint,
  Collectible,
  DamageSource,
  Door,
  GameSnapshot,
  Generator,
  Hazard,
  HiddenSpike,
  InputState,
  IrrigationConsole,
  Lever,
  LevelData,
  Platform,
  PlayerState,
  Rect,
  ScreenState,
  UiMessage,
  WindZone
} from "./types";

type InteractionTarget =
  | { type: "lever"; value: Lever }
  | { type: "generator"; value: Generator }
  | { type: "console"; value: IrrigationConsole }
  | { type: "collectible"; value: Collectible };

type DustParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
};

type Trail = {
  x: number;
  y: number;
};

const baseInput: InputState = {
  left: false,
  right: false,
  dashPressed: false,
  jumpPressed: false,
  jumpHeld: false,
  interactPressed: false,
  pausePressed: false
};

const GAME_LEVELS = [levelOne, levelTwo, levelThree];
const GROUND_ACCELERATION = 2200;
const GROUND_DECELERATION = 2800;
const AIR_ACCELERATION = 1200;
const AIR_DECELERATION = 800;
const TURN_BOOST = 1.4;
const FALL_GRAVITY_MULTIPLIER = 1.52;
const LOW_JUMP_GRAVITY_MULTIPLIER = 1.3;
const AIR_CONTROL_CAP = 0.96;
const EDGE_GRACE = 10;
const DASH_EXIT_CONTROL_FACTOR = 0.62;
const DASH_GRAVITY_MULTIPLIER = 0.28;
const PLAYER_RENDER_SCALE = 1.4;

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private snapshotListener: (snapshot: GameSnapshot) => void;
  private lastFrame = 0;
  private animationFrame = 0;
  private screen: ScreenState = "menu";
  private currentLevelIndex = 0;
  private level: LevelData = this.cloneLevel(GAME_LEVELS[0]);
  private player: PlayerState = this.createPlayer();
  private input: InputState = { ...baseInput };
  private cameraX = 0;
  private checkpoint = { ...GAME_LEVELS[0].start };
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private damageTimer = 0;
  private respawnTimer = 0;
  private restoration = 0;
  private narrativeText: UiMessage | null = null;
  private interactionLabel: string | null = null;
  private objectiveText = this.getBaseObjectiveText(this.level);
  private deathCount = 0;
  private deathCause = "";
  private deathCauseTimer = 0;
  private musicEnabled = true;
  private musicVolume = 0.28;
  private sfxVolume = 0.85;
  private showHints = true;
  private respawnPulsePoint = { x: 0, y: 0 };
  private respawnPulseTimer = 0;
  private assetImages = new Map<string, HTMLImageElement>();
  private images = {
    centralCityBase: null as HTMLImageElement | null,
    centralCityProps: null as HTMLImageElement | null,
    centralCityMidFog: null as HTMLImageElement | null,
    centralCityFrontalFog: null as HTMLImageElement | null,
    forestBg1: null as HTMLImageElement | null,
    forestBg2: null as HTMLImageElement | null,
    forestBg3: null as HTMLImageElement | null,
    sky: null as HTMLImageElement | null,
    dunes: null as HTMLImageElement | null,
    clouds: null as HTMLImageElement | null,
    groundLeft: null as HTMLImageElement | null,
    groundCenter: null as HTMLImageElement | null,
    groundRight: null as HTMLImageElement | null,
    groundSingle: null as HTMLImageElement | null,
    dirtA: null as HTMLImageElement | null,
    dirtB: null as HTMLImageElement | null,
    dirtC: null as HTMLImageElement | null,
    dirtD: null as HTMLImageElement | null,
    breakable: null as HTMLImageElement | null,
    metalPlatform: null as HTMLImageElement | null,
    gem: null as HTMLImageElement | null
  };
  private assetsReady = false;
  private animationTime = 0;
  private cameraShake = 0;
  private shakeTimer = 0;
  private shakeIntensity = 0;
  private hitStopTimer = 0;
  private damageFlash = 0;
  private currentZoom = 1;
  private targetZoom = 1;
  private enterTimer = 0;
  private enterStartY = 0;
  private hudBarShake = 0;
  private dashReadyFlash = 0;
  private transitionTimer = 0;
  private transitionDuration = 2.3;
  private transitionTitle = "";
  private transitionSubtitle = "";
  private pendingLevelIndex: number | null = null;
  private previousOnGround = false;
  private dustParticles: DustParticle[] = [];
  private dashTrail: Trail[] = [];
  private previousScreen: ScreenState = "menu";
  private soundCooldowns = new Map<string, number>();
  private restorationLockTimer = 0;
  private selectedCharacterId = DEFAULT_CHARACTER_ID;
  private loadingTimer = 0;
  private loadingDuration = 1.15;
  private loadingTitle = "Carregando...";
  private loadingSubtitle = "";
  private trapSystem = new TrapSystem();

  constructor(ctx: CanvasRenderingContext2D, onSnapshot: (snapshot: GameSnapshot) => void) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.snapshotListener = onSnapshot;
    this.loadAssets();
    this.preloadAudio();
    audioManager.playMusic("gameplayMusic");
    this.bindEvents();
    this.syncMusicForScreen();
    this.publishSnapshot();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    audioManager.stopMusic();
  }

  start() {
    this.lastFrame = performance.now();
    this.loop(this.lastFrame);
  }

  startGame = () => {
    if (!this.selectedCharacterId) {
      this.selectedCharacterId = DEFAULT_CHARACTER_ID;
    }
    this.currentLevelIndex = 0;
    this.deathCount = 0;
    this.deathCause = "";
    this.deathCauseTimer = 0;
    this.pendingLevelIndex = null;
    this.transitionTimer = 0;
    this.transitionTitle = "";
    this.transitionSubtitle = "";
    this.resetRun();
    this.startLoadingScreen(`Carregando ${this.level.name}...`, this.level.introTitle ?? this.level.name);
  };

  openCharacterSelect = () => {
    this.screen = "menu";
    this.publishSnapshot();
  };

  selectCharacter = (characterId: string) => {
    this.selectedCharacterId = characterId;
    this.publishSnapshot();
  };

  confirmCharacterSelection = () => {
    if (!this.selectedCharacterId) {
      this.selectedCharacterId = DEFAULT_CHARACTER_ID;
    }
    this.screen = "menu";
    this.syncMusicForScreen();
    this.publishSnapshot();
  };

  startNextLevel = () => {
    if (this.currentLevelIndex >= GAME_LEVELS.length - 1) {
      this.startGame();
      return;
    }

    const nextIndex = this.currentLevelIndex + 1;
    const nextLevel = GAME_LEVELS[nextIndex] ?? GAME_LEVELS[this.currentLevelIndex];
    this.pendingLevelIndex = nextIndex;
    this.transitionTimer = this.transitionDuration;
    this.transitionTitle = nextLevel.name;
    this.transitionSubtitle = nextLevel.introText ?? nextLevel.introTitle ?? "Um novo setor aguarda reativacao.";
    this.screen = "transition";
    this.syncMusicForScreen();
    this.publishSnapshot();
  };

  beginLevel = () => {
    this.enterStartY = this.player.y;
    this.enterTimer = 0.5;
    this.player.y = this.enterStartY - 150;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.onGround = false;
    this.targetZoom = 1;
    this.currentZoom = 1;
    this.screen = "playing";
    this.syncMusicForScreen();
    this.publishSnapshot();
  };

  openOptions = () => {
    this.screen = "options";
    this.syncMusicForScreen();
    this.publishSnapshot();
  };

  backToMenu = () => {
    this.screen = "menu";
    this.currentLevelIndex = 0;
    this.loadingTimer = 0;
    this.resetRun();
    this.syncMusicForScreen();
    this.publishSnapshot();
  };

  togglePause = () => {
    if (this.screen !== "playing" && this.screen !== "paused") {
      return;
    }

    this.screen = this.screen === "paused" ? "playing" : "paused";
    this.syncMusicForScreen();
    this.publishSnapshot();
  };

  setOptions(next: { musicEnabled?: boolean; musicVolume?: number; sfxVolume?: number; showHints?: boolean }) {
    if (typeof next.musicEnabled === "boolean") {
      this.musicEnabled = next.musicEnabled;
      audioManager.setMusicVolume(this.musicEnabled ? this.musicVolume : 0);
      this.syncMusicForScreen();
    }

    if (typeof next.musicVolume === "number") {
      this.musicVolume = clamp(next.musicVolume, 0, 1);
      audioManager.setMusicVolume(this.musicEnabled ? this.musicVolume : 0);
      this.syncMusicForScreen();
    }

    if (typeof next.sfxVolume === "number") {
      this.sfxVolume = clamp(next.sfxVolume, 0, 1);
      audioManager.setSFXVolume(this.sfxVolume);
    }

    if (typeof next.showHints === "boolean") {
      this.showHints = next.showHints;
    }

    this.publishSnapshot();
  }

  exitGame = () => {
    window.close();
    this.narrativeText = {
      text: "Se a aba nao fechar automaticamente, use o navegador para sair.",
      ttl: 3
    };
    this.publishSnapshot();
  };

  private cloneLevel(source: LevelData): LevelData {
    return structuredClone(source);
  }

  private getCurrentLevelTemplate() {
    return GAME_LEVELS[this.currentLevelIndex] ?? GAME_LEVELS[0];
  }

  private getBaseObjectiveText(level: LevelData) {
    return level.id === "energy-facility"
      ? `Ative ${level.generators.length} nucleo(s) e estabilize a instalacao.`
      : level.id === "restoration-zone"
        ? `Ative ${level.generators.length} nucleo(s) e estabilize a restauracao ativa.`
        : `Ative ${level.generators.length} gerador(es) e restaure a irrigacao.`;
  }

  private getDeathCauseMessage(cause: DamageSource) {
    switch (cause) {
      case "spike":
      case "fall":
        return "Voce caiu no abismo.";
      case "laser":
        return "Queimado pelo laser.";
      case "crusher":
        return "Esmagado.";
      case "drone":
        return "Abatido pelo drone.";
      default:
        return "Tente novamente.";
    }
  }

  private loadAssets() {
    const imageSources: Record<keyof typeof this.images, string> = {
      centralCityBase: ASSET_PATHS.centralCity.bgBase,
      centralCityProps: ASSET_PATHS.centralCity.bgProps,
      centralCityMidFog: ASSET_PATHS.centralCity.midFog,
      centralCityFrontalFog: ASSET_PATHS.centralCity.frontalFog,
      forestBg1: ASSET_PATHS.forestFantasy.bg1,
      forestBg2: ASSET_PATHS.forestFantasy.bg2,
      forestBg3: ASSET_PATHS.forestFantasy.bg3,
      sky: ASSET_PATHS.backgrounds.sky,
      dunes: ASSET_PATHS.backgrounds.dunes,
      clouds: ASSET_PATHS.backgrounds.clouds,
      groundLeft: ASSET_PATHS.tiles.groundLeft,
      groundCenter: ASSET_PATHS.tiles.groundCenter,
      groundRight: ASSET_PATHS.tiles.groundRight,
      groundSingle: ASSET_PATHS.tiles.groundSingle,
      dirtA: ASSET_PATHS.tiles.dirtA,
      dirtB: ASSET_PATHS.tiles.dirtB,
      dirtC: ASSET_PATHS.tiles.dirtC,
      dirtD: ASSET_PATHS.tiles.dirtD,
      breakable: ASSET_PATHS.tiles.breakable,
      metalPlatform: ASSET_PATHS.tiles.metalPlatform,
      gem: ASSET_PATHS.tiles.gem
    };
    const namedEntries = Object.entries(imageSources) as Array<[keyof typeof this.images, string]>;
    const paths = [...new Set([...getAllImageAssetPaths(), ...namedEntries.map(([, path]) => path)])];
    let settled = 0;

    for (const path of paths) {
      const image = new Image();
      const namedEntry = namedEntries.find(([, imagePath]) => imagePath === path);
      image.src = path;
      image.onload = image.onerror = () => {
        settled += 1;
        if (settled === paths.length) {
          this.assetsReady = true;
        }
      };
      if (namedEntry) {
        this.images[namedEntry[0]] = image;
      }
      this.assetImages.set(path, image);
    }
  }

  private getAsset(path: string) {
    return this.assetImages.get(path);
  }

  private preloadAudio() {
    audioManager.preload({
      jump: ASSET_PATHS.audio.jump,
      impact: ASSET_PATHS.audio.impact,
      respawn: ASSET_PATHS.audio.respawn,
      gameOver: ASSET_PATHS.audio.gameOver,
      gameplayMusic: ASSET_PATHS.audio.gameplayMusic,
      menuMusic: ASSET_PATHS.audio.menuMusic
    });
    audioManager.setMusicVolume(this.musicEnabled ? this.musicVolume : 0);
    audioManager.setSFXVolume(this.sfxVolume);
  }

  private playSfx(key: string, volume: number, cooldownMs = 0) {
    if (this.sfxVolume <= 0.01) {
      return;
    }

    const now = performance.now();
    const lastPlayed = this.soundCooldowns.get(key) ?? 0;
    if (cooldownMs > 0 && now - lastPlayed < cooldownMs) {
      return;
    }

    this.soundCooldowns.set(key, now);
    audioManager.play(key, { volume });
  }

  private syncMusicForScreen() {
    if (!this.musicEnabled || this.musicVolume <= 0.01) {
      audioManager.setMusicVolume(0);
      audioManager.fadeOutMusic(0.25);
      return;
    }

    audioManager.setMusicVolume(this.musicVolume);
    audioManager.setSFXVolume(this.sfxVolume);
    const isGameplay = this.screen === "playing" || this.screen === "paused" || this.screen === "victory";

    if (isGameplay) {
      audioManager.playMusic("gameplayMusic");
    }
  }

  private startLoadingScreen(title: string, subtitle: string) {
    this.loadingTitle = title;
    this.loadingSubtitle = subtitle;
    this.loadingDuration = 1.1;
    this.loadingTimer = this.loadingDuration;
    this.screen = "loading";
    this.syncMusicForScreen();
    this.publishSnapshot();
  }

  private createPlayer(): PlayerState {
    return {
      x: this.level.start.x,
      y: this.level.start.y,
      width: 42,
      height: 68,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      energy: PLAYER_MAX_ENERGY,
      collectibles: 0,
      respawning: false,
      dashTimer: 0,
      dashCooldown: 0,
      jumpsRemaining: 1,
      hurtTimer: 0
    };
  }

  private triggerScreenShake(duration: number, intensity: number) {
    this.shakeTimer = Math.max(this.shakeTimer, duration);
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  private emitJumpParticles(x: number, y: number) {
    particles.emit(x, y, {
      count: 5,
      color: ["#fff", "#aaccff"],
      speedX: [-40, 40],
      speedY: [-30, 0],
      life: [0.15, 0.35],
      gravity: 400
    });
  }

  private emitLandingParticles(x: number, y: number) {
    particles.emit(x, y, {
      count: 8,
      color: ["#c8a96e", "#e8c98e", "#a07040"],
      speedX: [-80, 80],
      speedY: [-60, -10],
      life: [0.2, 0.5],
      gravity: 300
    });
  }

  private emitDashParticles(direction: 1 | -1) {
    const player = this.player;
    const character = getCharacterOption(this.selectedCharacterId);
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    for (let i = 0; i < 10; i += 1) {
      particles.emit(centerX - direction * i * 6, centerY, {
        count: 1,
        color: [character.accent, "#fff"],
        speedX: [-20, 20],
        speedY: [-30, 30],
        life: [0.1, 0.25],
        gravity: 0
      });
    }
  }

  private emitDamageParticles() {
    const player = this.player;
    particles.emit(player.x + player.width / 2, player.y + player.height / 2, {
      count: 12,
      color: ["#5bc0eb", "#a8f0ff", "#ffcc66", "#fff"],
      speedX: [-120, 120],
      speedY: [-150, -30],
      life: [0.3, 0.6],
      gravity: 250
    });
  }

  private emitCheckpointParticles(checkpoint: Checkpoint) {
    particles.emit(checkpoint.x + 15, checkpoint.y, {
      count: 20,
      color: ["#5bc0eb", "#87d37c", "#fff", "#ffcc66"],
      speedX: [-100, 100],
      speedY: [-200, -50],
      life: [0.4, 0.9],
      gravity: 150
    });
  }

  private emitDeathParticles() {
    const player = this.player;
    particles.emit(player.x + player.width / 2, player.y + player.height / 2, {
      count: 25,
      color: ["#5bc0eb", "#87d37c", "#ffcc66", "#eef4f6"],
      speedX: [-200, 200],
      speedY: [-250, -50],
      life: [0.5, 1.0],
      gravity: 300
    });
  }

  private resetRun() {
    this.level = this.cloneLevel(this.getCurrentLevelTemplate());
    this.player = this.createPlayer();
    this.checkpoint = { ...this.level.start };
    this.cameraX = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.damageTimer = 0;
    this.respawnTimer = 0;
    this.restoration = 0;
    this.interactionLabel = null;
    this.respawnPulseTimer = 0;
    this.cameraShake = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    this.hitStopTimer = 0;
    this.damageFlash = 0;
    this.currentZoom = 1;
    this.targetZoom = 1;
    this.enterTimer = 0;
    this.enterStartY = this.player.y;
    this.hudBarShake = 0;
    this.dashReadyFlash = 0;
    this.deathCause = "";
    this.deathCauseTimer = 0;
    this.transitionTimer = 0;
    this.transitionTitle = "";
    this.transitionSubtitle = "";
    this.pendingLevelIndex = null;
    this.previousOnGround = false;
    this.dustParticles = [];
    this.dashTrail = [];
    particles.clear();
    this.trapSystem.initializeRun(this.level);
    this.narrativeText = {
      text:
        this.level.id === "energy-facility"
          ? "A energia azul ainda pulsa entre as paredes da usina. Zion precisa estabilizar o complexo."
          : "Ano 2168. Zion procura sistemas esquecidos para devolver agua a terras mortas.",
      ttl: 5
    };
    this.objectiveText = this.getBaseObjectiveText(this.level);
  }

  private bindEvents() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) {
      event.preventDefault();
    }

    switch (event.code) {
      case "ArrowLeft":
      case "KeyA":
        this.input.left = true;
        break;
      case "ArrowRight":
      case "KeyD":
        this.input.right = true;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        if (!event.repeat) {
          this.input.dashPressed = true;
        }
        break;
      case "Space":
      case "KeyW":
      case "ArrowUp":
        if (!this.input.jumpHeld) {
          this.input.jumpPressed = true;
        }
        this.input.jumpHeld = true;
        break;
      case "KeyE":
        this.input.interactPressed = true;
        break;
      case "Escape":
        event.preventDefault();
        this.input.pausePressed = true;
        break;
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case "ArrowLeft":
      case "KeyA":
        this.input.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        this.input.right = false;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        break;
      case "Space":
      case "KeyW":
      case "ArrowUp":
        this.input.jumpHeld = false;
        break;
    }
  };

  private loop = (time: number) => {
    const realDelta = Math.max(0, (time - this.lastFrame) / 1000);
    const delta = Math.min(realDelta, 1 / 30);
    this.lastFrame = time;
    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.15;

    if (this.hitStopTimer > 0) {
      this.hitStopTimer = Math.max(0, this.hitStopTimer - realDelta);
      this.render(realDelta);
      this.animationFrame = requestAnimationFrame(this.loop);
      return;
    }

    this.update(delta);
    particles.update(this.screen === "paused" ? 0 : delta);
    this.render(realDelta);
    this.animationFrame = requestAnimationFrame(this.loop);
  };

  private update(delta: number) {
    const screenBeforeUpdate = this.screen;
    this.animationTime += delta;

    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - delta);
      this.shakeIntensity *= 0.85;
      if (this.shakeTimer === 0 || this.shakeIntensity < 0.15) {
        this.shakeIntensity = 0;
      }
    }

    if (this.hudBarShake > 0) {
      this.hudBarShake = Math.max(0, this.hudBarShake - delta * 3);
    }

    if (this.dashReadyFlash > 0) {
      this.dashReadyFlash = Math.max(0, this.dashReadyFlash - delta);
    }

    if (this.deathCauseTimer > 0) {
      this.deathCauseTimer = Math.max(0, this.deathCauseTimer - delta);
    }

    if (this.input.pausePressed) {
      this.togglePause();
      this.input.pausePressed = false;
    }

    if (this.narrativeText) {
      this.narrativeText.ttl -= delta;
      if (this.narrativeText.ttl <= 0) {
        this.narrativeText = null;
      }
    }

    if (this.screen === "loading") {
      this.loadingTimer = Math.max(0, this.loadingTimer - delta);
      if (this.loadingTimer <= 0) {
        this.beginLevel();
        return;
      }
      this.publishSnapshot();
      return;
    }

    if (this.screen === "transition") {
      this.transitionTimer = Math.max(0, this.transitionTimer - delta);
      if (this.transitionTimer <= 0 && this.pendingLevelIndex !== null) {
        this.currentLevelIndex = this.pendingLevelIndex;
        this.pendingLevelIndex = null;
        this.resetRun();
        this.startLoadingScreen(`Carregando ${this.level.name}...`, this.level.introTitle ?? this.level.name);
        return;
      }
      this.publishSnapshot();
      return;
    }

    if (this.screen !== "playing") {
      this.targetZoom = 1;
      this.publishSnapshot();
      return;
    }

    if (this.damageTimer > 0) {
      this.damageTimer -= delta;
    }

    if (this.player.hurtTimer > 0) {
      this.player.hurtTimer = Math.max(0, this.player.hurtTimer - delta);
    }

    if (this.respawnTimer > 0) {
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        this.finishRespawn();
      }
      this.publishSnapshot();
      return;
    }

    if (this.restorationLockTimer > 0) {
      this.restorationLockTimer = Math.max(0, this.restorationLockTimer - delta);
      const previousY = this.player.y;
      this.player.vx = 0;
      this.player.vy = Math.min(this.player.vy + GRAVITY * delta * 0.65, MAX_FALL_SPEED);
      this.player.y += this.player.vy * delta;
      this.solveVerticalCollisions(previousY);
      this.updateRestoration(delta);
      this.updateCamera();
      this.updateDust(delta);
      this.publishSnapshot();
      return;
    }

    this.updateDynamicWorld(delta);

    if (this.enterTimer > 0) {
      this.input.dashPressed = false;
      this.input.jumpPressed = false;
      this.input.interactPressed = false;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.dashTimer = 0;
      this.player.y = this.enterStartY - 150 * (this.enterTimer / 0.5);
      this.enterTimer = Math.max(0, this.enterTimer - delta);

      if (this.enterTimer <= 0) {
        this.player.y = this.enterStartY;
        this.player.onGround = true;
        this.player.jumpsRemaining = 1;
        this.previousOnGround = true;
        this.spawnDust(this.player.x + this.player.width / 2, this.player.y + this.player.height, 5, 1);
        this.emitLandingParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height);
      }

      this.updateCamera();
      this.updateDust(delta);
      this.publishSnapshot();
      return;
    }

    this.updatePlayer(delta);
    this.updateTriggers();
    this.updateCheckpoints();
    this.updateInteractions();
    this.updateHazards();
    this.updateRestoration(delta);
    this.updateCamera();
    this.updateDust(delta);

    if (screenBeforeUpdate !== this.screen) {
      this.previousScreen = screenBeforeUpdate;
      this.syncMusicForScreen();
    }

    this.publishSnapshot();
  }

  private updateDynamicWorld(delta: number) {
    const carry = this.trapSystem.updateWorld(this.level, delta, this.player, (player, platform) =>
      this.isStandingOn(player, platform)
    );
    this.player.x += carry.x;
    this.player.y += carry.y;

    this.respawnPulseTimer = Math.max(0, this.respawnPulseTimer - delta);
    this.cameraShake = Math.max(0, this.cameraShake - delta * 2.4);
  }

  private updatePlayer(delta: number) {
    const player = this.player;
    const wasOnGround = player.onGround;
    const dashWasActive = player.dashTimer > 0;
    const moveDirection = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    const targetSpeed = MOVE_SPEED;
    let gravityScale = 1;
    const previousX = player.x;
    const previousY = player.y;
    const preVerticalVelocity = player.vy;
    const desiredVelocity = moveDirection * targetSpeed;
    const changingDirection = moveDirection !== 0 && Math.sign(player.vx) !== Math.sign(moveDirection) && Math.abs(player.vx) > 10;
    const standingPlatform = player.onGround ? this.getStandingPlatform() : null;
    const slipperyFactor = standingPlatform?.slippery ? 0.48 : 1;
    const accelerationBase = player.onGround ? GROUND_ACCELERATION * slipperyFactor : AIR_ACCELERATION;
    const decelerationBase = player.onGround ? GROUND_DECELERATION * slipperyFactor : AIR_DECELERATION;

    const dashWasCoolingDown = player.dashCooldown > 0;
    player.dashCooldown = Math.max(0, player.dashCooldown - delta);
    if (dashWasCoolingDown && player.dashCooldown <= 0) {
      this.dashReadyFlash = 0.1;
    }
    player.dashTimer = Math.max(0, player.dashTimer - delta);
    const dashEndedThisFrame = dashWasActive && player.dashTimer <= 0;

    if (moveDirection !== 0) {
      player.facing = moveDirection > 0 ? 1 : -1;
    }

    if (this.input.dashPressed && player.dashCooldown <= 0 && !player.respawning) {
      const dashDirection = moveDirection !== 0 ? (moveDirection > 0 ? 1 : -1) : player.facing;
      player.facing = dashDirection;
      player.dashTimer = DASH_DURATION;
      player.dashCooldown = DASH_COOLDOWN;
      this.dashReadyFlash = 0;
      this.targetZoom = 1.08;
      player.vx = dashDirection * DASH_SPEED;
      player.vy = 0;
      this.dashTrail = [];
      this.emitDashParticles(dashDirection);
      this.cameraShake = Math.max(this.cameraShake, 0.18);
      this.spawnDust(player.x + player.width / 2, player.y + player.height - 4, player.onGround ? 5 : 3, player.onGround ? 1 : 0.55);
      this.playSfx("impact", 0.22, 50);
    }
    this.input.dashPressed = false;

    if (player.dashTimer > 0) {
      player.vx = player.facing * DASH_SPEED;
    } else if (dashEndedThisFrame) {
      this.targetZoom = 1;
      const carrySpeed = moveDirection === 0
        ? targetSpeed * DASH_EXIT_CONTROL_FACTOR
        : moveDirection === player.facing
          ? targetSpeed
          : targetSpeed * 0.4;
      player.vx = moveDirection === 0
        ? player.facing * carrySpeed
        : moveDirection * carrySpeed;
    } else if (moveDirection !== 0) {
      const acceleration = accelerationBase * (changingDirection ? TURN_BOOST : 1);
      const maxAirSpeed = player.onGround ? targetSpeed : targetSpeed * AIR_CONTROL_CAP;
      const clampedDesired = player.onGround ? desiredVelocity : clamp(desiredVelocity, -maxAirSpeed, maxAirSpeed);
      const deltaVelocity = clampedDesired - player.vx;
      const step = clamp(deltaVelocity, -acceleration * delta, acceleration * delta);
      player.vx += step;
    } else {
      const slowdown = decelerationBase * delta;
      if (Math.abs(player.vx) <= slowdown) {
        player.vx = 0;
      } else {
        player.vx -= Math.sign(player.vx) * slowdown;
      }
    }

    if (player.dashTimer <= 0) {
      this.targetZoom = 1;
    }

    this.coyoteTimer = player.onGround ? COYOTE_TIME : Math.max(0, this.coyoteTimer - delta);

    if (this.input.jumpPressed) {
      this.jumpBufferTimer = JUMP_BUFFER;
      this.input.jumpPressed = false;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
    }

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      player.vy = -JUMP_SPEED;
      player.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      player.jumpsRemaining = 1;
      this.spawnDust(player.x + player.width / 2, player.y + player.height - 2, 2, 0.4);
      this.emitJumpParticles(player.x + player.width / 2, player.y + player.height);
      this.cameraShake = Math.max(this.cameraShake, 0.06);
      audioManager.play("jump", { volume: 0.8 });
    } else if (this.jumpBufferTimer > 0 && !player.onGround && player.jumpsRemaining > 0) {
      player.vy = -DOUBLE_JUMP_SPEED;
      player.jumpsRemaining -= 1;
      this.jumpBufferTimer = 0;
      player.dashTimer = 0;
      this.spawnDust(player.x + player.width / 2, player.y + player.height / 2, 4, 0.7);
      this.emitJumpParticles(player.x + player.width / 2, player.y + player.height);
      this.cameraShake = Math.max(this.cameraShake, 0.12);
      audioManager.play("jump", { volume: 0.8 });
    }

    const environmentalForces = this.trapSystem.sampleEnvironmentalForces(this.level, player);
    player.vx += environmentalForces.forceX * delta;
    player.vy += environmentalForces.forceY * delta;
    gravityScale = Math.min(gravityScale, environmentalForces.gravityScale);

    let gravityMultiplier = 1;
    if (player.vy < 0 && !this.input.jumpHeld) {
      gravityMultiplier = LOW_JUMP_GRAVITY_MULTIPLIER;
    } else if (player.vy > 0) {
      gravityMultiplier = FALL_GRAVITY_MULTIPLIER;
    }

    player.vy += GRAVITY * delta * gravityMultiplier * gravityScale * (player.dashTimer > 0 ? DASH_GRAVITY_MULTIPLIER : 1);
    if (player.vy > 0) {
      player.vy += GRAVITY * 0.6 * delta;
      player.vy = Math.min(player.vy, MAX_FALL_SPEED);
    }
    player.vy = Math.min(player.vy, MAX_FALL_SPEED);
    if (player.dashTimer > 0) {
      player.vy = 0;
    }

    player.x += player.vx * delta;
    this.solveHorizontalCollisions(previousX, previousY);
    player.y += player.vy * delta;
    this.solveVerticalCollisions(previousY);

    if (player.dashTimer > 0) {
      this.dashTrail.push({ x: player.x, y: player.y });
      if (this.dashTrail.length > 8) {
        this.dashTrail.shift();
      }
    } else if (this.dashTrail.length > 0) {
      this.dashTrail = [];
    }

    if (!wasOnGround && player.onGround) {
      player.jumpsRemaining = 1;
      this.spawnDust(player.x + player.width / 2, player.y + player.height, 5, 1);
      this.emitLandingParticles(player.x + player.width / 2, player.y + player.height);
      this.cameraShake = Math.max(this.cameraShake, Math.min(0.24, 0.12 + Math.abs(preVerticalVelocity) / 2200));
      this.playSfx("impact", 0.32, 90);
    }

    if (player.onGround && Math.abs(player.vx) > 180 && Math.random() < 0.2) {
      this.spawnDust(
        player.facing > 0 ? player.x + 6 : player.x + player.width - 6,
        player.y + player.height - 2,
        1,
        0.35
      );
    }

    this.previousOnGround = player.onGround;

    if (player.y > this.level.height + 240) {
      this.damagePlayer(40, true, "fall");
    }
  }

  private updateDust(delta: number) {
    this.dustParticles = this.dustParticles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx * delta,
        y: particle.y + particle.vy * delta,
        vy: particle.vy + 120 * delta,
        life: particle.life - delta
      }))
      .filter((particle) => particle.life > 0);
  }

  private spawnDust(x: number, y: number, count: number, intensity: number) {
    for (let i = 0; i < count; i += 1) {
      this.dustParticles.push({
        x,
        y,
        vx: (-40 + Math.random() * 80) * intensity,
        vy: (-20 - Math.random() * 55) * intensity,
        life: 0.22 + Math.random() * 0.18,
        size: 4 + Math.random() * 5
      });
    }
  }

  private getSolidRects(): Rect[] {
    return this.trapSystem.getSolidRects(this.level);
  }

  private solveHorizontalCollisions(previousX: number, previousY: number) {
    const player = this.player;

    for (const solid of this.getSolidRects()) {
      if (!overlaps(player, solid)) {
        continue;
      }

      const previousBottom = previousY + player.height;
      const previousTop = previousY;
      if (previousBottom <= solid.y + EDGE_GRACE || previousTop >= solid.y + solid.height - EDGE_GRACE) {
        continue;
      }

      if (player.vx > 0) {
        player.x = solid.x - player.width;
      } else if (player.vx < 0) {
        player.x = solid.x + solid.width;
      } else if (previousX + player.width <= solid.x) {
        player.x = solid.x - player.width;
      } else if (previousX >= solid.x + solid.width) {
        player.x = solid.x + solid.width;
      }
      player.vx = 0;
      player.dashTimer = 0;
    }

    player.x = clamp(player.x, 0, this.level.width - player.width);
  }

  private solveVerticalCollisions(previousY: number) {
    const player = this.player;
    player.onGround = false;

    for (const solid of this.getSolidRects()) {
      if (!overlaps(player, solid)) {
        continue;
      }

      const previousBottom = previousY + player.height;
      const previousTop = previousY;

      if (player.vy >= 0 && previousBottom <= solid.y + EDGE_GRACE) {
        player.y = solid.y - player.height;
        player.vy = 0;
        player.onGround = true;

        const platform = this.level.platforms.find((item) => item.id === (solid as Platform).id);
        if (platform) {
          this.trapSystem.armPlatformTrap(this.level, platform.id);
        }
      } else if (player.vy < 0 && previousTop >= solid.y + solid.height - EDGE_GRACE) {
        player.y = solid.y + solid.height;
        player.vy = 0;
      }
    }
  }

  private updateTriggers() {
    const message = this.trapSystem.updateTriggers(this.level, this.player);
    if (message) {
      this.playSfx("impact", 0.16, 120);
      this.narrativeText = { text: message, ttl: 2.1 };
    }
  }

  private updateCheckpoints() {
    for (const checkpoint of this.level.checkpoints) {
      if (overlaps(this.player, checkpoint) && !checkpoint.activated) {
        for (const other of this.level.checkpoints) {
          other.activated = false;
        }

        checkpoint.activated = true;
        this.checkpoint = this.getCheckpointSpawn(checkpoint);
        this.emitCheckpointParticles(checkpoint);
        this.narrativeText = {
          text: "Checkpoint sincronizado.",
          ttl: 2.2
        };
      }
    }
  }

  private updateInteractions() {
    const playerCenter = {
      x: this.player.x + this.player.width / 2,
      y: this.player.y + this.player.height / 2
    };

    const candidates: InteractionTarget[] = [
      ...this.level.levers.map((value) => ({ type: "lever" as const, value })),
      ...this.level.generators.map((value) => ({ type: "generator" as const, value })),
      { type: "console" as const, value: this.level.irrigationConsole },
      ...this.level.collectibles
        .filter((value) => !value.collected)
        .map((value) => ({ type: "collectible" as const, value }))
    ];

    const nearest = candidates
      .map((candidate) => ({
        candidate,
        distance: distance(playerCenter, {
          x: candidate.value.x + candidate.value.width / 2,
          y: candidate.value.y + candidate.value.height / 2
        })
      }))
      .filter((item) => item.distance <= 90)
      .sort((a, b) => a.distance - b.distance)[0];

    this.interactionLabel = nearest
      ? this.getInteractionPrompt(nearest.candidate)
      : null;

    if (this.input.interactPressed && nearest) {
      this.handleInteraction(nearest.candidate);
    }

    this.input.interactPressed = false;
  }

  private getInteractionPrompt(target: InteractionTarget) {
    switch (target.type) {
      case "lever":
        return `E  Alternar ${target.value.label}`;
      case "generator":
        return target.value.active ? null : `E  Ativar ${target.value.label}`;
      case "console":
        if (target.value.active) {
          return null;
        }
        return this.level.generators.every((generator) => generator.active)
          ? this.level.id === "energy-facility"
            ? "E  Estabilizar rede principal"
            : this.level.id === "restoration-zone"
              ? "E  Ativar nucleo final"
            : "E  Restaurar sistema de irrigacao"
          : this.level.id === "energy-facility"
            ? "Ative todos os nucleos primeiro"
            : this.level.id === "restoration-zone"
              ? "Ative todos os nucleos antes do apex"
            : "Ative todos os geradores primeiro";
      case "collectible":
        return `E  Ler ${target.value.label}`;
    }
  }

  private handleInteraction(target: InteractionTarget) {
    switch (target.type) {
      case "lever":
        target.value.toggled = !target.value.toggled;
        if (target.value.targetDoorId) {
          const door = this.level.doors.find((item) => item.id === target.value.targetDoorId);
          if (door) {
            door.open = target.value.toggled;
          }
        }
        this.narrativeText = {
          text: target.value.toggled
            ? "Comporta liberada. A estufa antiga foi aberta."
            : "Comporta fechada.",
          ttl: 2.5
        };
        break;
      case "generator":
        if (!target.value.active) {
          target.value.active = true;
          const activeCount = this.level.generators.filter((generator) => generator.active).length;
          const totalCount = this.level.generators.length;

          if (activeCount === totalCount) {
            const finalDoor = this.level.doors.find((door) => door.id === "door-gate");
            if (finalDoor) {
              finalDoor.open = true;
            }
          }

          this.narrativeText = {
            text:
              activeCount === totalCount
                ? `${target.value.label} reativado. ${this.level.id === "energy-facility" ? "Camara final energizada." : "Porta final liberada."}`
                : `${target.value.label} reativado.`,
            ttl: 2
          };
          this.objectiveText =
            this.level.id === "energy-facility"
              ? `${activeCount}/${totalCount} nucleo(s) energizados.`
              : this.level.id === "restoration-zone"
                ? `${activeCount}/${totalCount} nucleo(s) sincronizados.`
              : `${activeCount}/${totalCount} gerador(es) ativos.`;
        }
        break;
      case "console":
        if (!target.value.active && this.level.generators.every((generator) => generator.active)) {
          this.activateFinalObjective();
        }
        break;
      case "collectible":
        target.value.collected = true;
        this.player.collectibles += 1;
        this.narrativeText = {
          text: target.value.text,
          ttl: 5
        };
        break;
    }
  }

  private updateHazards() {
    const damageResult = this.trapSystem.collectDamage(this.level, this.player);
    if (damageResult) {
      this.damagePlayer(damageResult.amount, damageResult.forceRespawn, damageResult.cause);
      if (damageResult && !damageResult.forceRespawn && !this.player.respawning && this.player.energy > 0) {
        const dir = this.player.vx >= 0 ? -1 : 1;
        this.player.vx = dir * 320;
        this.player.vy = -280;
      }
    }
  }

  private updateRestoration(delta: number) {
    if (!this.level.irrigationConsole.active) {
      return;
    }

    this.restoration = Math.min(1, this.restoration + delta * 0.25);

    if (this.restoration >= 1) {
      if (this.screen !== "victory") {
        audioManager.fadeOutMusic(1.5);
      }
      this.screen = "victory";
    }
  }

  private activateFinalObjective() {
    if (this.level.irrigationConsole.active) {
      return;
    }

    this.level.irrigationConsole.active = true;
    this.cameraShake = Math.max(this.cameraShake, 0.28);
    this.restorationLockTimer = 0.45;
    this.player.vx = 0;
    this.playSfx("impact", 0.38, 40);
    this.narrativeText = {
      text:
        this.level.id === "energy-facility"
          ? "Sistema restaurado. A rede principal voltou a pulsar com energia azul."
          : this.level.id === "restoration-zone"
            ? "Sistema restaurado. A zona ativa entrou em equilibrio e a restauracao acelerou."
          : "Sistema restaurado. O fluxo de irrigacao voltou a circular.",
      ttl: 4
    };
    this.objectiveText =
      this.level.id === "energy-facility"
        ? "Observe a reativacao da instalacao."
        : this.level.id === "restoration-zone"
          ? "Observe a restauracao total da zona ativa."
        : "Observe a restauracao da Regiao da Seca.";
  }

  private updateCamera() {
    const targetX = clamp(
      this.player.x + this.player.width / 2 - CANVAS_WIDTH / 2,
      0,
      this.level.width - CANVAS_WIDTH
    );
    this.cameraX = lerp(this.cameraX, targetX, CAMERA_LERP);
  }

  private damagePlayer(amount: number, forceRespawn = false, cause: DamageSource = "generic") {
    if (this.player.respawning || this.respawnTimer > 0) {
      return;
    }

    if (this.damageTimer > 0 && !forceRespawn) {
      return;
    }

    this.player.energy -= amount;
    this.damageTimer = DAMAGE_COOLDOWN;
    this.hitStopTimer = 0.06;
    this.damageFlash = 1;
    this.hudBarShake = 0.3;
    audioManager.play("impact", { volume: 1.0 });
    this.narrativeText = {
      text: "Integridade do traje comprometida.",
      ttl: 1.2
    };

    if (!forceRespawn && this.player.energy > 0) {
      this.player.hurtTimer = 0.4;
      this.emitDamageParticles();
      this.triggerScreenShake(0.3, 8);
    }

    if (this.player.energy <= 0 || forceRespawn) {
      this.deathCount += 1;
      this.deathCause = this.getDeathCauseMessage(cause);
      this.deathCauseTimer = 2.4;
      this.emitDeathParticles();
      this.triggerScreenShake(0.5, 14);
      this.player.energy = 0;
      this.player.dashTimer = 0;
      this.player.dashCooldown = 0.18;
      this.player.respawning = true;
      this.respawnTimer = RESPAWN_FADE;
      this.cameraShake = 0.6;
      audioManager.play("respawn", { volume: 0.9 });
      audioManager.play("gameOver", { volume: 0.4 });
      this.respawnPulsePoint = {
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2
      };
      this.respawnPulseTimer = 0.5;
      this.narrativeText = {
        text: "Sinal vital instavel. Reiniciando no ultimo checkpoint...",
        ttl: RESPAWN_FADE + 0.4
      };
    }
  }

  private finishRespawn() {
    this.player.x = this.checkpoint.x;
    this.player.y = this.checkpoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.energy = PLAYER_MAX_ENERGY;
    this.player.respawning = false;
    this.player.dashTimer = 0;
    this.player.dashCooldown = 0;
    this.player.jumpsRemaining = 1;
    this.player.hurtTimer = 0;
    this.damageTimer = 0;
    this.restorationLockTimer = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.hitStopTimer = 0;
    this.damageFlash = 0;
    this.currentZoom = 1;
    this.targetZoom = 1;
    this.enterTimer = 0;
    this.enterStartY = this.checkpoint.y;
    this.hudBarShake = 0;
    this.dashReadyFlash = 0;
    this.input.dashPressed = false;
    this.input.jumpPressed = false;
    this.input.interactPressed = false;
    this.interactionLabel = null;
    this.previousOnGround = false;
    this.dashTrail = [];
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    particles.clear();
    this.restoreDynamicState();
  }

  private restoreDynamicState() {
    this.trapSystem.restoreDynamicState(this.level);
  }

  private getCheckpointSpawn(checkpoint: Checkpoint) {
    return {
      x: clamp(checkpoint.x + checkpoint.width / 2 - this.player.width / 2, 0, this.level.width - this.player.width),
      y: checkpoint.y + checkpoint.height - this.player.height
    };
  }

  private isStandingOn(player: Rect, platform: Rect) {
    const feet = player.y + player.height;
    return (
      feet >= platform.y - 4 &&
      feet <= platform.y + 8 &&
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width
    );
  }

  private getStandingPlatform() {
    return this.level.platforms.find((platform) => !platform.broken && platform.active !== false && this.isStandingOn(this.player, platform));
  }

  private publishSnapshot() {
    this.snapshotListener({
      screen: this.screen,
      selectedCharacterId: this.selectedCharacterId,
      playerEnergy: this.player.energy,
      playerDashCooldown: this.player.dashCooldown,
      playerDashCooldownMax: DASH_COOLDOWN,
      dashReadyFlash: this.dashReadyFlash,
      hudBarShake: this.hudBarShake,
      collectibles: this.player.collectibles,
      collectibleTotal: this.level.collectibles.length,
      interactionLabel: this.showHints ? this.interactionLabel : null,
      levelName: this.level.name,
      introTitle: this.level.introTitle ?? this.level.name,
      introText:
        this.level.introText ??
        "Zion atravessa ruinas tecnologicas em busca de um sistema antigo que ainda possa responder.",
      victoryTitle: this.level.victoryTitle ?? "Sistema Restaurado",
      victoryText:
        this.level.victoryText ??
        "O mecanismo antigo respondeu. Um novo trecho da jornada foi destravado.",
      loadingTitle: this.loadingTitle,
      loadingSubtitle: this.loadingSubtitle,
      loadingProgress: this.loadingDuration > 0 ? 1 - this.loadingTimer / this.loadingDuration : 1,
      hasNextLevel: this.currentLevelIndex < GAME_LEVELS.length - 1,
      narrativeText: this.narrativeText?.text ?? null,
      objectiveText: this.objectiveText,
      generatorsActive: this.level.generators.filter((item) => item.active).length,
      generatorsTotal: this.level.generators.length,
      deathCount: this.deathCount,
      deathCause: this.deathCause,
      deathCauseTimer: this.deathCauseTimer,
      restoration: this.restoration,
      transitionTitle: this.transitionTitle,
      transitionSubtitle: this.transitionSubtitle,
      transitionProgress:
        this.screen === "transition"
          ? 1 - this.transitionTimer / this.transitionDuration
          : 0,
      options: {
        musicEnabled: this.musicEnabled,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        showHints: this.showHints
      }
    });
  }

  private render(frameDelta: number) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    if (this.shakeTimer > 0) {
      ctx.translate((Math.random() - 0.5) * this.shakeIntensity, (Math.random() - 0.5) * this.shakeIntensity);
    }
    this.renderBackground(ctx);
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.scale(this.currentZoom, this.currentZoom);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    this.renderWorld(ctx);
    ctx.restore();
    ctx.restore();

    if (this.damageFlash > 0) {
      ctx.save();
      ctx.globalAlpha = this.damageFlash * 0.28;
      ctx.fillStyle = "rgba(91, 192, 235, 0.9)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
      this.damageFlash = Math.max(0, this.damageFlash - frameDelta * 5);
    }

    this.renderForeground(ctx);
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    const cW = CANVAS_WIDTH;
    const cH = CANVAS_HEIGHT;
    const camX = this.cameraX;

    if (this.level.id === "dry-region") {
      const g = ctx.createLinearGradient(0, 0, 0, cH * 0.65);
      g.addColorStop(0, "#1a0a00");
      g.addColorStop(0.45, "#8B3A00");
      g.addColorStop(0.75, "#C4561E");
      g.addColorStop(1, "#A8491A");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cW, cH * 0.65);

      ctx.globalAlpha = 0.18;
      this.drawTiledBG(ctx, this.images.sky, camX, 0.02, cW, cH * 0.55);
      ctx.globalAlpha = 0.4;
      this.drawTiledBG(ctx, this.images.clouds, camX, 0.05, cW, 80, 20);
      ctx.globalAlpha = 1;

      this.drawTiledBG(ctx, this.images.dunes, camX, 0.2, cW, 120, cH * 0.45);
      this.renderDryRegionSkyline(ctx, this.restoration);

      const g2 = ctx.createLinearGradient(0, cH * 0.62, 0, cH);
      g2.addColorStop(0, "#C8762A");
      g2.addColorStop(1, "#7A4010");
      ctx.fillStyle = g2;
      ctx.fillRect(0, cH * 0.62, cW, cH * 0.38);
    } else if (this.level.id === "energy-facility") {
      this.drawTiledBG(ctx, this.images.centralCityBase, camX, 0.05, cW, cH);
      this.drawTiledBG(ctx, this.images.centralCityProps, camX, 0.15, cW, cH);
      ctx.globalAlpha = 0.7;
      this.drawTiledBG(ctx, this.images.centralCityMidFog, camX, 0.3, cW, cH);
      ctx.globalAlpha = 0.5;
      this.drawTiledBG(ctx, this.images.centralCityFrontalFog, camX, 0.5, cW, cH * 0.6, cH * 0.4);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(45,0,96,0.25)";
      ctx.fillRect(0, 0, cW, cH);
    } else if (this.level.id === "restoration-zone") {
      this.drawTiledBG(ctx, this.images.forestBg1, camX, 0.05, cW, cH);
      this.drawTiledBG(ctx, this.images.forestBg2, camX, 0.2, cW, cH);
      this.drawTiledBG(ctx, this.images.forestBg3, camX, 0.4, cW, cH);

      const fog = ctx.createLinearGradient(0, cH * 0.75, 0, cH);
      fog.addColorStop(0, "rgba(80,180,100,0)");
      fog.addColorStop(1, "rgba(80,180,100,0.14)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, cH * 0.75, cW, cH * 0.25);
    }

    const vig = ctx.createRadialGradient(cW / 2, cH / 2, cH * 0.25, cW / 2, cH / 2, cH * 0.85);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, cW, cH);
  }

  private drawTiledBG(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement | null,
    camX: number,
    factor: number,
    cW: number,
    cH: number,
    yOff = 0,
    h?: number
  ) {
    if (!img || !img.complete) {
      return;
    }

    const w = img.naturalWidth || cW;
    const drawH = h ?? cH;
    const sx = (camX * factor) % w;
    for (let i = -1; i <= 1; i += 1) {
      ctx.drawImage(img, -sx + i * w, yOff, w, drawH);
    }
  }

  private drawParallaxTiles(
    ctx: CanvasRenderingContext2D,
    path: string,
    factor: number,
    y: number,
    size: number,
    repeatCount: number,
    alpha = 1
  ) {
    const image = this.getAsset(path);
    if (!image) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    const total = Math.ceil(CANVAS_WIDTH / size) + 3;
    for (let i = -1; i < total; i += 1) {
      const x = i * size - ((this.cameraX * factor) % size);
      ctx.drawImage(image, x, y, size, size);
      if (repeatCount > 10 && i % 2 === 0) {
        ctx.drawImage(image, x, y + size - 4, size, size);
      }
    }
    ctx.restore();
  }

  private renderParallaxLayer(
    ctx: CanvasRenderingContext2D,
    factor: number,
    baseline: number,
    _height: number,
    color: string,
    variation: number
  ) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    for (let i = 0; i <= 9; i += 1) {
      const x = i * 160 - ((this.cameraX * factor) % 160);
      const wave = Math.sin(i * 0.85 + performance.now() * 0.0002) * variation;
      ctx.lineTo(x, baseline + wave);
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  private renderWorld(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const shakeX = this.cameraShake > 0 ? Math.sin(performance.now() * 0.08) * this.cameraShake * 8 : 0;
    const shakeY = this.cameraShake > 0 ? Math.cos(performance.now() * 0.11) * this.cameraShake * 5 : 0;
    ctx.translate(-this.cameraX + shakeX, shakeY);

    this.renderRuins(ctx);
    this.renderWind(ctx, this.level.windZones);
    this.renderPlatforms(ctx, this.level.platforms);
    this.renderDoors(ctx, this.level.doors);
    this.renderCheckpoints(ctx, this.level.checkpoints);
    this.renderGenerators(ctx, this.level.generators);
    this.renderLevers(ctx, this.level.levers);
    this.renderCollectibles(ctx, this.level.collectibles);
    this.renderHiddenSpikes(ctx, this.level.hiddenSpikes);
    this.renderHazards(ctx, this.level.hazards);
    this.renderConsole(ctx, this.level.irrigationConsole);
    this.renderGoal(ctx, this.level.goalArea);
    this.renderDashTrail(ctx);
    this.renderPlayer(ctx);
    particles.draw(ctx);
    this.renderDust(ctx);

    ctx.restore();
  }

  private renderRuins(ctx: CanvasRenderingContext2D) {
    if (this.level.id === "restoration-zone") {
      const pools = [
        { x: 2320, y: 620, width: 720, height: 68 },
        { x: 5330, y: 620, width: 920, height: 70 }
      ];
      for (const pool of pools) {
        ctx.fillStyle = "rgba(40, 113, 138, 0.52)";
        ctx.fillRect(pool.x, pool.y, pool.width, pool.height);
        ctx.fillStyle = "rgba(138, 235, 255, 0.24)";
        for (let i = 0; i < 6; i += 1) {
          const waveX = pool.x + ((this.animationTime * 120 + i * 130) % pool.width);
          ctx.fillRect(waveX, pool.y + 10 + (i % 2) * 12, 58, 6);
        }
      }

      ctx.strokeStyle = `rgba(110, 214, 235, ${0.24 + this.restoration * 0.32})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(200, 548);
      ctx.lineTo(1230, 548);
      ctx.lineTo(1230, 520);
      ctx.lineTo(2240, 520);
      ctx.lineTo(2240, 582);
      ctx.lineTo(3180, 582);
      ctx.lineTo(3180, 548);
      ctx.lineTo(4200, 548);
      ctx.lineTo(4200, 488);
      ctx.lineTo(5160, 488);
      ctx.lineTo(5160, 432);
      ctx.lineTo(6120, 432);
      ctx.stroke();

      if (this.assetsReady) {
        const terrain = ASSET_PATHS.forestFantasy.terrain;
        const propClusters = [
          { x: 120, y: 426, sx: 96, sy: 224, sw: 96, sh: 112, dw: 150, dh: 176 },
          { x: 1040, y: 390, sx: 160, sy: 192, sw: 96, sh: 128, dw: 156, dh: 208 },
          { x: 2140, y: 432, sx: 32, sy: 352, sw: 96, sh: 96, dw: 144, dh: 144 },
          { x: 3970, y: 366, sx: 128, sy: 288, sw: 96, sh: 128, dw: 150, dh: 204 },
          { x: 5660, y: 250, sx: 96, sy: 192, sw: 128, sh: 160, dw: 220, dh: 276 }
        ];
        for (const prop of propClusters) {
          this.drawSheetRegion(ctx, terrain, prop.sx, prop.sy, prop.sw, prop.sh, prop.x, prop.y, prop.dw, prop.dh, 0.96);
        }

        const waterFalls = [
          { x: 2550, y: 544 },
          { x: 5820, y: 446 }
        ];
        for (const fall of waterFalls) {
          this.drawSheetRegion(ctx, terrain, 64, 448, 64, 64, fall.x, fall.y, 74, 74, 0.92);
        }
      }

      const reeds = [
        { x: 2360, y: 592 }, { x: 2410, y: 592 }, { x: 2970, y: 592 }, { x: 3010, y: 592 },
        { x: 5370, y: 592 }, { x: 5440, y: 592 }, { x: 6010, y: 592 }, { x: 6090, y: 592 }
      ];
      for (const reed of reeds) {
        ctx.fillStyle = "rgba(119, 194, 111, 0.7)";
        ctx.fillRect(reed.x, reed.y, 4, 22);
        ctx.fillRect(reed.x - 6, reed.y + 8, 6, 4);
        ctx.fillRect(reed.x + 4, reed.y + 4, 7, 4);
      }
      return;
    }

    if (this.level.id === "energy-facility") {
      if (this.assetsReady) {
        const cityBlocks = [
          { x: 80, y: 376, sx: 0, sy: 0, sw: 110, sh: 130, dw: 180, dh: 210 },
          { x: 980, y: 334, sx: 120, sy: 0, sw: 120, sh: 140, dw: 190, dh: 222 },
          { x: 2140, y: 308, sx: 240, sy: 0, sw: 100, sh: 140, dw: 170, dh: 238 },
          { x: 3400, y: 270, sx: 0, sy: 120, sw: 140, sh: 120, dw: 220, dh: 240 },
          { x: 4930, y: 230, sx: 180, sy: 120, sw: 120, sh: 120, dw: 210, dh: 290 },
          { x: 6120, y: 170, sx: 280, sy: 60, sw: 110, sh: 150, dw: 220, dh: 360 }
        ];

        for (const block of cityBlocks) {
          this.drawSheetRegion(ctx, ASSET_PATHS.centralCity.buildings, block.sx, block.sy, block.sw, block.sh, block.x, block.y, block.dw, block.dh, 0.88);
        }

        const machineProps = [
          { x: 260, y: 484, sx: 0, sy: 0, sw: 64, sh: 80, dw: 96, dh: 120 },
          { x: 1250, y: 452, sx: 64, sy: 0, sw: 56, sh: 72, dw: 90, dh: 116 },
          { x: 2850, y: 430, sx: 0, sy: 144, sw: 70, sh: 80, dw: 108, dh: 124 },
          { x: 4520, y: 340, sx: 72, sy: 120, sw: 48, sh: 92, dw: 74, dh: 140 }
        ];
        for (const prop of machineProps) {
          this.drawSheetRegion(ctx, ASSET_PATHS.centralCity.props, prop.sx, prop.sy, prop.sw, prop.sh, prop.x, prop.y, prop.dw, prop.dh, 0.9);
        }
      }

      ctx.strokeStyle = "rgba(88, 183, 213, 0.18)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(160, 540);
      ctx.lineTo(980, 540);
      ctx.lineTo(980, 500);
      ctx.lineTo(1830, 500);
      ctx.lineTo(1830, 470);
      ctx.lineTo(2680, 470);
      ctx.lineTo(2680, 520);
      ctx.lineTo(3540, 520);
      ctx.lineTo(3540, 470);
      ctx.lineTo(4470, 470);
      ctx.lineTo(4470, 540);
      ctx.lineTo(5310, 540);
      ctx.lineTo(5310, 450);
      ctx.lineTo(6420, 450);
      ctx.stroke();

      if (this.restoration > 0) {
        ctx.strokeStyle = `rgba(126, 241, 255, ${0.42 + this.restoration * 0.34})`;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(160, 540);
        ctx.lineTo(980, 540);
        ctx.lineTo(980, 500);
        ctx.lineTo(1830, 500);
        ctx.lineTo(1830, 470);
        ctx.lineTo(2680, 470);
        ctx.lineTo(2680, 520);
        ctx.lineTo(3540, 520);
        ctx.lineTo(3540, 470);
        ctx.lineTo(4470, 470);
        ctx.lineTo(4470, 540);
        ctx.lineTo(5310, 540);
        ctx.lineTo(5310, 450);
        ctx.lineTo(6420, 450);
        ctx.stroke();
      }

      return;
    }

    const sectionStructures = [
      { x: 60, y: 430, w: 180, h: 170, glow: 0.05 },
      { x: 1460, y: 404, w: 172, h: 196, glow: 0.07 },
      { x: 2236, y: 270, w: 208, h: 330, glow: 0.14 },
      { x: 3472, y: 286, w: 208, h: 314, glow: 0.16 },
      { x: 4920, y: 210, w: 168, h: 390, glow: 0.2 },
      { x: 5528, y: 284, w: 180, h: 316, glow: 0.18 }
    ];

    for (const structure of sectionStructures) {
      ctx.fillStyle = "rgba(30, 27, 25, 0.3)";
      ctx.fillRect(structure.x, structure.y, structure.w, structure.h);
      ctx.fillStyle = "rgba(74, 63, 54, 0.22)";
      ctx.fillRect(structure.x + 16, structure.y + 22, 22, structure.h - 44);
      ctx.fillRect(structure.x + structure.w - 38, structure.y + 18, 20, structure.h - 36);
      ctx.fillStyle = `rgba(91, 192, 235, ${structure.glow})`;
      ctx.fillRect(structure.x + structure.w * 0.5 - 12, structure.y + 34, 24, 84);
    }

    const frameSets = [
      { x: 392, y: 442, w: 136, h: 158 },
      { x: 1544, y: 448, w: 140, h: 152 },
      { x: 2830, y: 422, w: 160, h: 178 },
      { x: 4236, y: 404, w: 170, h: 196 },
      { x: 5344, y: 430, w: 140, h: 170 }
    ];

    for (const frame of frameSets) {
      ctx.strokeStyle = "rgba(57, 47, 40, 0.48)";
      ctx.lineWidth = 10;
      ctx.strokeRect(frame.x, frame.y, frame.w, frame.h);
      ctx.fillStyle = "rgba(91, 192, 235, 0.06)";
      ctx.fillRect(frame.x + 20, frame.y + 18, frame.w - 40, 22);
      ctx.fillStyle = "rgba(72, 64, 56, 0.16)";
      ctx.fillRect(frame.x + 34, frame.y + 72, frame.w - 68, frame.h - 92);
    }

    if (this.assetsReady) {
      const ruins = [
        { x: 88, y: 360, sx: 0, sy: 0, sw: 110, sh: 130, dw: 168, dh: 220 },
        { x: 1440, y: 338, sx: 120, sy: 0, sw: 120, sh: 140, dw: 180, dh: 234 },
        { x: 2230, y: 270, sx: 240, sy: 0, sw: 100, sh: 140, dw: 176, dh: 250 },
        { x: 3490, y: 270, sx: 0, sy: 120, sw: 140, sh: 120, dw: 228, dh: 250 },
        { x: 4924, y: 196, sx: 180, sy: 120, sw: 120, sh: 120, dw: 220, dh: 304 },
        { x: 5480, y: 270, sx: 280, sy: 60, sw: 110, sh: 150, dw: 196, dh: 284 }
      ];

      for (const ruin of ruins) {
        this.drawSheetRegion(
          ctx,
          ASSET_PATHS.centralCity.buildings,
          ruin.sx,
          ruin.sy,
          ruin.sw,
          ruin.sh,
          ruin.x,
          ruin.y,
          ruin.dw,
          ruin.dh,
          0.7
        );
      }

      const machineProps = [
        { x: 302, y: 494, sx: 0, sy: 0, sw: 64, sh: 80, dw: 86, dh: 108 },
        { x: 1660, y: 502, sx: 64, sy: 0, sw: 56, sh: 72, dw: 84, dh: 110 },
        { x: 2866, y: 464, sx: 0, sy: 144, sw: 70, sh: 80, dw: 98, dh: 120 },
        { x: 4380, y: 392, sx: 72, sy: 120, sw: 48, sh: 92, dw: 74, dh: 140 },
        { x: 5570, y: 446, sx: 64, sy: 0, sw: 56, sh: 72, dw: 92, dh: 118 }
      ];

      for (const prop of machineProps) {
        this.drawSheetRegion(
          ctx,
          ASSET_PATHS.centralCity.props,
          prop.sx,
          prop.sy,
          prop.sw,
          prop.sh,
          prop.x,
          prop.y,
          prop.dw,
          prop.dh,
          0.82
        );
      }

      const pipeRuns = [
        { x: 114, y: 388, count: 3 },
        { x: 1490, y: 430, count: 3 },
        { x: 2302, y: 316, count: 4 },
        { x: 3536, y: 348, count: 4 },
        { x: 4960, y: 270, count: 5 },
        { x: 5580, y: 346, count: 3 }
      ];

      for (const run of pipeRuns) {
        for (let i = 0; i < run.count; i += 1) {
          this.drawTile(ctx, ASSET_PATHS.tiles.pipeVertical, run.x + i * 34, run.y + i * 4, 36);
          this.drawTile(ctx, ASSET_PATHS.tiles.pipeVertical, run.x + i * 34, run.y + 36 + i * 4, 36);
        }
        this.drawTile(ctx, ASSET_PATHS.tiles.pipeJoint, run.x - 2, run.y + 68, 42);
      }

      const elbows = [
        { x: 546, y: 512 },
        { x: 1588, y: 510 },
        { x: 2480, y: 446 },
        { x: 3680, y: 430 },
        { x: 5080, y: 384 },
        { x: 5452, y: 414 }
      ];

      for (const elbow of elbows) {
        this.drawTile(ctx, ASSET_PATHS.tiles.pipeElbowA, elbow.x, elbow.y, 38);
        this.drawTile(ctx, ASSET_PATHS.tiles.pipeElbowB, elbow.x + 30, elbow.y, 38);
      }

      const catwalks = [
        { x: 188, y: 578, count: 7 },
        { x: 1540, y: 578, count: 4 },
        { x: 2796, y: 574, count: 4 },
        { x: 3476, y: 332, count: 6 },
        { x: 4920, y: 268, count: 6 },
        { x: 5536, y: 444, count: 6 }
      ];

      for (const catwalk of catwalks) {
        for (let i = 0; i < catwalk.count; i += 1) {
          this.drawTile(ctx, ASSET_PATHS.tiles.metalPlatform, catwalk.x + i * 20, catwalk.y, 20, 0.68);
        }
      }

      const props = [
        { x: 210, y: 566, size: 22, path: ASSET_PATHS.tiles.sprout },
        { x: 534, y: 552, size: 24, path: ASSET_PATHS.tiles.signBoard },
        { x: 528, y: 574, size: 26, path: ASSET_PATHS.tiles.post },
        { x: 1564, y: 552, size: 24, path: ASSET_PATHS.tiles.signArrow },
        { x: 1828, y: 566, size: 28, path: ASSET_PATHS.tiles.crate },
        { x: 1862, y: 566, size: 28, path: ASSET_PATHS.tiles.crate },
        { x: 2750, y: 552, size: 24, path: ASSET_PATHS.tiles.signBoard },
        { x: 2744, y: 574, size: 26, path: ASSET_PATHS.tiles.post },
        { x: 3848, y: 566, size: 28, path: ASSET_PATHS.tiles.crate },
        { x: 3882, y: 566, size: 28, path: ASSET_PATHS.tiles.crate },
        { x: 4250, y: 566, size: 22, path: ASSET_PATHS.tiles.sprout },
        { x: 5184, y: 302, size: 24, path: ASSET_PATHS.tiles.signArrow },
        { x: 5482, y: 552, size: 24, path: ASSET_PATHS.tiles.signBoard },
        { x: 5476, y: 574, size: 26, path: ASSET_PATHS.tiles.post },
        { x: 5632, y: 566, size: 30, path: ASSET_PATHS.tiles.crate },
        { x: 5668, y: 566, size: 30, path: ASSET_PATHS.tiles.crate }
      ];

      for (const item of props) {
        this.drawTile(ctx, item.path, item.x, item.y, item.size);
      }
    } else {
      for (const structure of sectionStructures) {
        ctx.fillStyle = "rgba(31, 26, 22, 0.34)";
        ctx.fillRect(structure.x, structure.y, 52, structure.h);
        ctx.fillStyle = "rgba(93, 69, 50, 0.2)";
        ctx.fillRect(structure.x - 24, structure.y + 110, structure.w * 0.8, 14);
      }
    }

    ctx.strokeStyle = "rgba(91, 192, 235, 0.14)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(140, 570);
    ctx.lineTo(1456, 570);
    ctx.lineTo(1456, 524);
    ctx.lineTo(2176, 524);
    ctx.lineTo(2176, 570);
    ctx.lineTo(2870, 570);
    ctx.lineTo(2870, 520);
    ctx.lineTo(3600, 520);
    ctx.lineTo(3600, 570);
    ctx.lineTo(4300, 570);
    ctx.lineTo(4300, 510);
    ctx.lineTo(5000, 510);
    ctx.lineTo(5000, 458);
    ctx.lineTo(5620, 458);
    ctx.stroke();

    if (this.restoration > 0) {
      ctx.strokeStyle = `rgba(88, 183, 213, ${0.34 + this.restoration * 0.46})`;
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(140, 570);
      ctx.lineTo(1456, 570);
      ctx.lineTo(1456, 524);
      ctx.lineTo(2176, 524);
      ctx.lineTo(2176, 570);
      ctx.lineTo(2870, 570);
      ctx.lineTo(2870, 520);
      ctx.lineTo(3600, 520);
      ctx.lineTo(3600, 570);
      ctx.lineTo(4300, 570);
      ctx.lineTo(4300, 510);
      ctx.lineTo(5000, 510);
      ctx.lineTo(5000, 458);
      ctx.lineTo(5620, 458);
      ctx.stroke();

      const flowAlpha = 0.24 + this.restoration * 0.4;
      ctx.fillStyle = `rgba(120, 226, 245, ${flowAlpha})`;
      const channels = [
        { x: 176, y: 548, width: 560, height: 10 },
        { x: 1488, y: 548, width: 560, height: 10 },
        { x: 2902, y: 498, width: 620, height: 10 },
        { x: 4370, y: 446, width: 710, height: 12 }
      ];

      for (const channel of channels) {
        ctx.fillRect(channel.x, channel.y, channel.width, channel.height);
        for (let i = 0; i < 4; i += 1) {
          const shimmerX = channel.x + ((this.animationTime * 120 + i * 140) % channel.width);
          ctx.fillStyle = `rgba(210, 250, 255, ${0.18 + this.restoration * 0.26})`;
          ctx.fillRect(shimmerX, channel.y + 1, 36, channel.height - 2);
        }
        ctx.fillStyle = `rgba(120, 226, 245, ${flowAlpha})`;
      }

      const sprouts = [
        { x: 208, y: 570 },
        { x: 1508, y: 570 },
        { x: 2310, y: 568 },
        { x: 3568, y: 568 },
        { x: 4966, y: 568 },
        { x: 5594, y: 566 }
      ];

      for (const sprout of sprouts) {
        ctx.fillStyle = `rgba(135, 211, 124, ${0.12 + this.restoration * 0.4})`;
        ctx.fillRect(sprout.x, sprout.y, 4, 14);
        ctx.fillRect(sprout.x - 6, sprout.y + 4, 6, 4);
        ctx.fillRect(sprout.x + 4, sprout.y + 2, 6, 4);
      }
    }
  }

  private renderDryRegionSkyline(ctx: CanvasRenderingContext2D, restored: number) {
    const farSilhouettes = [
      { x: -60, y: 280, w: 200, h: 170 },
      { x: 220, y: 250, w: 260, h: 210 },
      { x: 560, y: 292, w: 180, h: 150 },
      { x: 860, y: 238, w: 320, h: 230 },
      { x: 1260, y: 286, w: 190, h: 156 }
    ];

    for (const item of farSilhouettes) {
      const x = item.x - this.cameraX * 0.09;
      ctx.fillStyle = restored > 0 ? "rgba(79, 95, 88, 0.14)" : "rgba(72, 56, 46, 0.16)";
      ctx.beginPath();
      ctx.moveTo(x, CANVAS_HEIGHT);
      ctx.lineTo(x + item.w * 0.14, item.y + item.h * 0.34);
      ctx.lineTo(x + item.w * 0.36, item.y);
      ctx.lineTo(x + item.w * 0.54, item.y + item.h * 0.24);
      ctx.lineTo(x + item.w * 0.76, item.y + item.h * 0.08);
      ctx.lineTo(x + item.w, item.y + item.h * 0.5);
      ctx.lineTo(x + item.w, CANVAS_HEIGHT);
      ctx.closePath();
      ctx.fill();
    }

    const towers = [
      { x: 80, y: 306, w: 52, h: 180 },
      { x: 420, y: 330, w: 64, h: 154 },
      { x: 780, y: 280, w: 72, h: 204 },
      { x: 1120, y: 300, w: 56, h: 186 }
    ];

    for (const tower of towers) {
      const x = tower.x - this.cameraX * 0.14;
      ctx.fillStyle = "rgba(46, 36, 31, 0.2)";
      ctx.fillRect(x, tower.y, tower.w, tower.h);
      ctx.fillRect(x - 24, tower.y + 102, tower.w + 48, 14);
    }
  }

  private renderFacilityLandmark(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.fillStyle = "rgba(28, 35, 42, 0.28)";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "rgba(78, 90, 101, 0.20)";
    ctx.fillRect(x + 18, y + 22, 24, height - 44);
    ctx.fillRect(x + width - 42, y + 18, 22, height - 36);
    ctx.fillStyle = "rgba(91, 192, 235, 0.12)";
    ctx.fillRect(x + width * 0.5 - 10, y + 38, 20, 60);
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[]) {
    for (const platform of platforms) {
      if (platform.broken) {
        continue;
      }

      ctx.save();
      if (platform.kind === "timed" && platform.active === false) {
        ctx.globalAlpha = 0.28;
      }

      if (this.assetsReady) {
        const isBreakableShaking =
          platform.kind === "breakable" &&
          !platform.broken &&
          typeof platform.timer === "number" &&
          platform.timer > 0;

        if (isBreakableShaking) {
          ctx.save();
          const breakTimer = platform.timer ?? 0;
          const shakeStrength = breakTimer < 0.15 ? 3 : 1;
          ctx.translate((Math.random() - 0.5) * shakeStrength, (Math.random() - 0.5) * shakeStrength);
          this.renderPlatformTiles(ctx, platform);
          ctx.restore();
        } else {
          this.renderPlatformTiles(ctx, platform);
        }
        ctx.restore();
        continue;
      }

      const fill =
        platform.kind === "moving"
          ? "#6d7363"
          : platform.kind === "breakable"
            ? "#916544"
            : platform.kind === "fake"
              ? "#b88e68"
              : "#7b5539";
      const topFill =
        platform.kind === "moving"
          ? "#9ba08d"
          : platform.kind === "breakable"
            ? "#d2a06e"
            : platform.kind === "fake"
              ? "#f1cc9d"
              : "#b6845c";

      ctx.fillStyle = fill;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

      ctx.fillStyle = topFill;
      ctx.fillRect(platform.x, platform.y, platform.width, 8);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let x = platform.x + 10; x < platform.x + platform.width - 10; x += 26) {
        ctx.fillRect(x, platform.y + 10, 14, 3);
      }

      if (platform.kind === "breakable") {
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.beginPath();
        ctx.moveTo(platform.x + 16, platform.y + 6);
        ctx.lineTo(platform.x + 34, platform.y + 18);
        ctx.lineTo(platform.x + 54, platform.y + 10);
        ctx.stroke();
      }

      if (platform.kind === "fake") {
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.setLineDash([8, 7]);
        ctx.strokeRect(platform.x + 4, platform.y + 4, platform.width - 8, platform.height - 8);
        ctx.setLineDash([]);
      }

      ctx.restore();
    }
  }

  private renderPlatformTiles(ctx: CanvasRenderingContext2D, platform: Platform, tileSize = 18) {
    const cols = Math.max(1, Math.ceil(platform.width / tileSize));
    const rows = Math.max(1, Math.ceil(platform.height / tileSize));
    const useMetalSurface =
      this.level.id === "energy-facility" ||
      platform.kind === "moving" ||
      platform.kind === "timed" ||
      Boolean(platform.slippery);
    const dirtTiles = [this.images.dirtA, this.images.dirtB, this.images.dirtC, this.images.dirtD].filter(
      (tile): tile is HTMLImageElement => Boolean(tile)
    );

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = platform.x + col * tileSize;
        const y = platform.y + row * tileSize;
        const drawWidth = Math.min(tileSize, platform.x + platform.width - x);
        const drawHeight = Math.min(tileSize, platform.y + platform.height - y);
        if (drawWidth <= 0 || drawHeight <= 0) {
          continue;
        }

        let image: HTMLImageElement | null = null;
        if (platform.kind === "breakable") {
          image = this.images.breakable;
        } else if (row === 0) {
          if (useMetalSurface) {
            image = this.images.metalPlatform;
          } else if (cols === 1) {
            image = this.images.groundSingle;
          } else if (col === 0) {
            image = this.images.groundLeft;
          } else if (col === cols - 1) {
            image = this.images.groundRight;
          } else {
            image = this.images.groundCenter;
          }
        } else if (useMetalSurface) {
          image = this.images.metalPlatform;
        } else {
          image = dirtTiles[(col + row * 3 + platform.id.length) % dirtTiles.length] ?? this.images.dirtA;
        }

        this.drawLoadedImage(ctx, image, x, y, drawWidth, drawHeight);
      }
    }

    if (platform.kind === "timed") {
      ctx.save();
      const warning = typeof platform.timer === "number" && platform.timer < 0.35;
      ctx.strokeStyle = warning ? "rgba(173, 245, 255, 0.95)" : "rgba(88, 183, 213, 0.7)";
      ctx.lineWidth = 3;
      ctx.strokeRect(platform.x + 1, platform.y + 1, platform.width - 2, platform.height - 2);
      if (platform.active === false) {
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = "rgba(88, 183, 213, 0.45)";
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      }
      ctx.restore();
    }

    if (platform.y < 560 && platform.kind !== "moving" && platform.kind !== "fake" && platform.kind !== "timed") {
      const supportX = platform.x + platform.width / 2 - 6;
      ctx.fillStyle = this.level.id === "energy-facility" ? "rgba(53, 67, 77, 0.48)" : "rgba(56, 49, 44, 0.42)";
      ctx.fillRect(supportX, platform.y + platform.height, 12, Math.max(20, 600 - (platform.y + platform.height)));
      if (platform.kind === "static" && platform.width <= 110) {
        ctx.fillRect(supportX - 18, platform.y + platform.height + 20, 48, 6);
      }
    }

    if (this.level.id !== "energy-facility" && platform.kind === "static" && platform.y >= 560 && platform.width >= 120) {
      ctx.fillStyle = "rgba(86, 63, 48, 0.3)";
      for (let x = platform.x + 24; x < platform.x + platform.width - 20; x += 64) {
        ctx.fillRect(x, platform.y - 8, 18, 8);
      }
    }

    if (platform.kind === "fake") {
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.setLineDash([6, 5]);
      ctx.strokeRect(platform.x + 2, platform.y + 2, platform.width - 4, platform.height - 4);
      ctx.setLineDash([]);
    }

    if (platform.slippery) {
      ctx.fillStyle = "rgba(168, 240, 255, 0.16)";
      ctx.fillRect(platform.x + 2, platform.y + 2, platform.width - 4, 8);
    }
  }

  private drawLoadedImage(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement | null,
    x: number,
    y: number,
    width: number,
    height: number,
    alpha = 1
  ) {
    if (!image || !image.complete) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, x, y, width, height);
    ctx.restore();
  }

  private drawSheetRegion(
    ctx: CanvasRenderingContext2D,
    path: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    alpha = 1
  ) {
    const image = this.getAsset(path);
    if (!image) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.restore();
  }

  private drawParallaxBackdrop(
    ctx: CanvasRenderingContext2D,
    path: string,
    factor: number,
    y: number,
    scale: number,
    alpha: number
  ) {
    const image = this.getAsset(path);
    if (!image) {
      return;
    }

    const width = image.width * scale;
    const height = image.height * scale;
    ctx.save();
    ctx.globalAlpha = alpha;
    const total = Math.ceil(CANVAS_WIDTH / width) + 3;
    for (let i = -1; i < total; i += 1) {
      const x = i * width - ((this.cameraX * factor) % width);
      ctx.drawImage(image, x, y, width, height);
    }
    ctx.restore();
  }

  private renderDoors(ctx: CanvasRenderingContext2D, doors: Door[]) {
    for (const door of doors) {
      if (door.open) {
        ctx.strokeStyle = COLORS.tech;
        ctx.lineWidth = 3;
        ctx.strokeRect(door.x, door.y, door.width, door.height);
        continue;
      }

      ctx.fillStyle = "#2c3940";
      ctx.fillRect(door.x, door.y, door.width, door.height);
      ctx.fillStyle = COLORS.tech;
      ctx.fillRect(door.x + 8, door.y + 18, door.width - 16, 10);
    }
  }

  private renderCheckpoints(ctx: CanvasRenderingContext2D, checkpoints: Checkpoint[]) {
    for (const checkpoint of checkpoints) {
      ctx.fillStyle = checkpoint.activated ? COLORS.techBright : "rgba(255,255,255,0.35)";
      ctx.fillRect(checkpoint.x, checkpoint.y, checkpoint.width, checkpoint.height);
      ctx.fillStyle = checkpoint.activated ? "rgba(91, 192, 235, 0.25)" : "rgba(255,255,255,0.12)";
      ctx.fillRect(checkpoint.x - 10, checkpoint.y + 12, 46, 18);
    }
  }

  private renderGenerators(ctx: CanvasRenderingContext2D, generators: Generator[]) {
    if (this.level.id === "restoration-zone") {
      for (const generator of generators) {
        ctx.fillStyle = generator.active ? "#3e6b5f" : "#4f4338";
        ctx.fillRect(generator.x, generator.y, generator.width, generator.height);
        ctx.fillStyle = generator.active ? "rgba(168,240,255,0.34)" : "rgba(152, 198, 124, 0.16)";
        ctx.fillRect(generator.x - 12, generator.y - 10, generator.width + 24, generator.height + 20);
        ctx.fillStyle = generator.active ? COLORS.techBright : "#c8e1a6";
        ctx.fillRect(generator.x + 14, generator.y + 14, generator.width - 28, 16);
        ctx.fillRect(generator.x + 20, generator.y + 44, generator.width - 40, 10);
        ctx.fillStyle = "rgba(88, 124, 77, 0.65)";
        ctx.fillRect(generator.x - 6, generator.y + 18, 6, 40);
        ctx.fillRect(generator.x + generator.width, generator.y + 26, 6, 34);
      }
      return;
    }

    for (const generator of generators) {
      ctx.fillStyle = generator.active ? "#244e5a" : "#463831";
      ctx.fillRect(generator.x, generator.y, generator.width, generator.height);
      ctx.fillStyle = generator.active ? COLORS.techBright : COLORS.warning;
      ctx.fillRect(generator.x + 16, generator.y + 16, generator.width - 32, 14);
      ctx.fillRect(generator.x + 20, generator.y + 44, generator.width - 40, 10);
    }
  }

  private renderLevers(ctx: CanvasRenderingContext2D, levers: Lever[]) {
    for (const lever of levers) {
      ctx.fillStyle = "#1e2428";
      ctx.fillRect(lever.x, lever.y + 32, 36, 24);
      ctx.strokeStyle = lever.toggled ? COLORS.success : COLORS.warning;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(lever.x + 18, lever.y + 36);
      ctx.lineTo(lever.x + (lever.toggled ? 28 : 8), lever.y + 8);
      ctx.stroke();
    }
  }

  private renderCollectibles(ctx: CanvasRenderingContext2D, collectibles: Collectible[]) {
    for (const item of collectibles) {
      if (item.collected) {
        continue;
      }

      if (this.assetsReady && this.images.gem?.complete) {
        const gemY = item.y + Math.sin(this.animationTime * 2) * 4;
        ctx.save();
        ctx.shadowColor = "#ffdd44";
        ctx.shadowBlur = 8 + Math.sin(this.animationTime * 3) * 4;
        ctx.drawImage(this.images.gem, item.x, gemY, 18, 18);
        ctx.restore();
        continue;
      }

      ctx.fillStyle = COLORS.techBright;
      ctx.fillRect(item.x, item.y, item.width, item.height);
      ctx.fillStyle = "#072331";
      ctx.fillRect(item.x + 8, item.y + 8, item.width - 16, item.height - 16);
    }
  }

  private renderHiddenSpikes(ctx: CanvasRenderingContext2D, spikes: HiddenSpike[]) {
    for (const spike of spikes) {
      const slotY = spike.y + spike.height - 4;
      const slotWidth = spike.width + 8;
      const slotX = spike.x - 4;
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.fillRect(slotX, slotY, slotWidth, 4);
      ctx.fillStyle = this.level.id === "energy-facility" ? "rgba(124, 218, 243, 0.38)" : "rgba(212, 169, 119, 0.42)";
      ctx.fillRect(slotX, slotY - 1, slotWidth, 1);

      const visibleHeight = spike.active ? spike.height : 8;
      const offsetY = spike.active ? 0 : spike.height - visibleHeight;
      ctx.fillStyle = spike.active ? "#e8d9bf" : "#5d4638";
      for (let i = 0; i < 4; i += 1) {
        const baseX = spike.x + i * (spike.width / 4);
        ctx.beginPath();
        ctx.moveTo(baseX, spike.y + spike.height);
        ctx.lineTo(baseX + spike.width / 8, spike.y + offsetY);
        ctx.lineTo(baseX + spike.width / 4, spike.y + spike.height);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  private renderHazards(ctx: CanvasRenderingContext2D, hazards: Hazard[]) {
    for (const hazard of hazards) {
      if (hazard.kind === "wind") {
        if (!hazard.active) {
          continue;
        }
        ctx.strokeStyle = "rgba(168,240,255,0.34)";
        ctx.lineWidth = 2;
        ctx.fillStyle = "rgba(88,183,213,0.08)";
        ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
        for (let i = 0; i < 5; i += 1) {
          const baseY = hazard.y + 40 + i * 92;
          ctx.beginPath();
          ctx.moveTo(hazard.x + 20, baseY);
          ctx.bezierCurveTo(
            hazard.x + hazard.width * 0.28,
            baseY - 16,
            hazard.x + hazard.width * 0.66,
            baseY + 16,
            hazard.x + hazard.width - 20,
            baseY
          );
          ctx.stroke();
        }
        continue;
      }

      if (hazard.kind === "laser") {
        const isHorizontal = hazard.width >= hazard.height;
        const beamAlpha = hazard.active ? 0.82 : 0.16;
        const emitterColor = this.level.id === "energy-facility" ? "#2d3841" : "#5a3528";
        const glowColor = this.level.id === "energy-facility" ? "rgba(103, 231, 255, 1)" : "rgba(255, 167, 99, 1)";

        ctx.fillStyle = emitterColor;
        if (isHorizontal) {
          ctx.fillRect(hazard.x - 10, hazard.y - 6, 12, hazard.height + 12);
          ctx.fillRect(hazard.x + hazard.width - 2, hazard.y - 6, 12, hazard.height + 12);
        } else {
          ctx.fillRect(hazard.x - 6, hazard.y - 10, hazard.width + 12, 12);
          ctx.fillRect(hazard.x - 6, hazard.y + hazard.height - 2, hazard.width + 12, 12);
        }

        ctx.save();
        ctx.globalAlpha = beamAlpha;
        ctx.fillStyle = glowColor;
        ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
        ctx.restore();

        if (hazard.active) {
          ctx.fillStyle = "rgba(216, 254, 255, 0.92)";
          if (isHorizontal) {
            ctx.fillRect(hazard.x, hazard.y + hazard.height / 2 - 2, hazard.width, 4);
          } else {
            ctx.fillRect(hazard.x + hazard.width / 2 - 2, hazard.y, 4, hazard.height);
          }
        } else {
          ctx.strokeStyle = this.level.id === "energy-facility" ? "rgba(168,240,255,0.18)" : "rgba(255,204,102,0.18)";
          ctx.lineWidth = 1;
          ctx.strokeRect(hazard.x, hazard.y, hazard.width, hazard.height);
        }
        continue;
      }

      if (hazard.kind === "drone") {
        const drawX = hazard.active || !hazard.triggerId ? hazard.x : hazard.homeX ?? hazard.x;
        const drawY = hazard.active || !hazard.triggerId ? hazard.y : hazard.homeY ?? hazard.y;
        const alpha = hazard.active ? 1 : 0.3;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#33434d";
        ctx.fillRect(drawX, drawY, hazard.width, hazard.height);
        ctx.fillStyle = this.level.id === "energy-facility" ? COLORS.techBright : COLORS.danger;
        ctx.fillRect(drawX + 10, drawY + 10, hazard.width - 20, 6);
        ctx.fillStyle = "rgba(168,240,255,0.5)";
        ctx.fillRect(drawX + 4, drawY + 4, hazard.width - 8, 4);
        ctx.restore();
        if (!hazard.active && hazard.triggerId) {
          ctx.fillStyle = "rgba(255, 122, 107, 0.18)";
          ctx.fillRect(drawX - 8, drawY + hazard.height + 6, hazard.width + 16, 4);
        }
        continue;
      }

      if (hazard.kind === "crusher") {
        const drawX = hazard.active ? hazard.x : hazard.homeX ?? hazard.x;
        const drawY = hazard.active ? hazard.y : hazard.homeY ?? hazard.y;
        const railColor = this.level.id === "energy-facility" ? "rgba(124, 218, 243, 0.18)" : "rgba(198, 160, 116, 0.2)";
        ctx.fillStyle = railColor;
        if (hazard.direction === "down" || hazard.direction === "up") {
          ctx.fillRect((hazard.homeX ?? hazard.x) + 10, (hazard.homeY ?? hazard.y), 8, 150);
          ctx.fillRect((hazard.homeX ?? hazard.x) + hazard.width - 18, (hazard.homeY ?? hazard.y), 8, 150);
        } else {
          ctx.fillRect((hazard.homeX ?? hazard.x), (hazard.homeY ?? hazard.y) + 10, 150, 8);
          ctx.fillRect((hazard.homeX ?? hazard.x), (hazard.homeY ?? hazard.y) + hazard.height - 18, 150, 8);
        }

        ctx.save();
        ctx.globalAlpha = hazard.active ? 1 : 0.4;
        ctx.fillStyle = this.level.id === "energy-facility" ? "#24303a" : "#4b3c35";
        ctx.fillRect(drawX, drawY, hazard.width, hazard.height);
        ctx.fillStyle = this.level.id === "energy-facility" ? "#7cdaf3" : "#c6a074";
        for (let y = drawY + 12; y < drawY + hazard.height - 8; y += 22) {
          ctx.fillRect(drawX + 8, y, hazard.width - 16, 8);
        }
        ctx.restore();
        continue;
      }
    }
  }

  private renderConsole(ctx: CanvasRenderingContext2D, consoleUnit: IrrigationConsole) {
    if (this.level.id === "restoration-zone") {
      const pulse = 0.24 + Math.sin(this.animationTime * 5) * 0.06;
      ctx.fillStyle = `rgba(88, 183, 213, ${pulse + this.restoration * 0.18})`;
      ctx.fillRect(consoleUnit.x - 40, consoleUnit.y - 36, consoleUnit.width + 80, consoleUnit.height + 70);
      ctx.fillStyle = "rgba(50, 67, 56, 0.92)";
      ctx.fillRect(consoleUnit.x - 68, consoleUnit.y + 48, consoleUnit.width + 136, 120);
      ctx.fillStyle = consoleUnit.active ? "#4a8578" : "#5a5648";
      ctx.fillRect(consoleUnit.x, consoleUnit.y, consoleUnit.width, consoleUnit.height);
      ctx.fillStyle = consoleUnit.active ? COLORS.techBright : "#d6e7ba";
      ctx.fillRect(consoleUnit.x + 10, consoleUnit.y + 12, consoleUnit.width - 20, 18);
      ctx.fillRect(consoleUnit.x + 16, consoleUnit.y + 44, consoleUnit.width - 32, 10);
      ctx.fillStyle = "rgba(119, 194, 111, 0.65)";
      ctx.fillRect(consoleUnit.x - 10, consoleUnit.y + 10, 8, 46);
      ctx.fillRect(consoleUnit.x + consoleUnit.width + 2, consoleUnit.y + 18, 8, 40);
      return;
    }

    if (this.level.id === "dry-region") {
      const glow = consoleUnit.active ? 0.34 : 0.18;
      ctx.fillStyle = `rgba(88, 183, 213, ${glow})`;
      ctx.fillRect(consoleUnit.x - 28, consoleUnit.y - 26, consoleUnit.width + 56, consoleUnit.height + 52);
      ctx.fillStyle = "rgba(32, 36, 42, 0.84)";
      ctx.fillRect(consoleUnit.x - 18, consoleUnit.y - 14, consoleUnit.width + 36, consoleUnit.height + 28);
      ctx.fillStyle = "rgba(22, 28, 34, 0.64)";
      ctx.fillRect(consoleUnit.x - 68, consoleUnit.y + 48, consoleUnit.width + 148, 92);
      ctx.fillStyle = `rgba(88, 183, 213, ${0.08 + this.restoration * 0.24})`;
      ctx.fillRect(consoleUnit.x - 44, consoleUnit.y + 62, consoleUnit.width + 92, 42);
      ctx.fillStyle = consoleUnit.active ? "#2a6e7b" : "#394149";
      ctx.fillRect(consoleUnit.x, consoleUnit.y, consoleUnit.width, consoleUnit.height);
      ctx.fillStyle = consoleUnit.active ? COLORS.techBright : COLORS.warning;
      ctx.fillRect(consoleUnit.x + 10, consoleUnit.y + 10, consoleUnit.width - 20, 18);
      ctx.fillRect(consoleUnit.x + 16, consoleUnit.y + 40, consoleUnit.width - 32, 10);
      ctx.fillStyle = "rgba(168, 240, 255, 0.26)";
      ctx.fillRect(consoleUnit.x + 24, consoleUnit.y - 24, 24, 24);
      if (consoleUnit.active) {
        ctx.fillStyle = `rgba(168, 240, 255, ${0.24 + Math.sin(this.animationTime * 6) * 0.08})`;
        ctx.fillRect(consoleUnit.x - 4, consoleUnit.y - 10, consoleUnit.width + 8, 8);
      }
      return;
    }

    ctx.fillStyle = consoleUnit.active ? "#264d58" : "#2d2e35";
    ctx.fillRect(consoleUnit.x, consoleUnit.y, consoleUnit.width, consoleUnit.height);
    ctx.fillStyle = consoleUnit.active ? COLORS.techBright : COLORS.warning;
    ctx.fillRect(consoleUnit.x + 14, consoleUnit.y + 14, consoleUnit.width - 28, 16);
    ctx.fillRect(consoleUnit.x + 18, consoleUnit.y + 42, consoleUnit.width - 36, 10);
  }

  private renderGoal(ctx: CanvasRenderingContext2D, goal: Rect) {
    if (this.level.id === "restoration-zone") {
      const ready = this.level.generators.every((generator) => generator.active);
      ctx.fillStyle = ready ? "rgba(88,183,213,0.18)" : "rgba(229,255,214,0.08)";
      ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
      ctx.fillStyle = ready ? "rgba(168, 240, 255, 0.24)" : "rgba(162,214,120,0.08)";
      ctx.fillRect(goal.x + 18, goal.y + 18, goal.width - 36, goal.height - 36);
      ctx.fillStyle = ready ? COLORS.techBright : "#d6e7ba";
      ctx.fillRect(goal.x + goal.width / 2 - 16, goal.y + 26, 32, goal.height - 52);
      if (this.restoration > 0) {
        ctx.fillStyle = `rgba(168,240,255,${0.26 + this.restoration * 0.22})`;
        ctx.fillRect(goal.x + 26, goal.y + goal.height - 46, goal.width - 52, 20);
      }
      ctx.fillStyle = "rgba(122, 191, 108, 0.34)";
      ctx.fillRect(goal.x + 20, goal.y + goal.height - 20, goal.width - 40, 12);
      return;
    }

    if (this.level.id === "dry-region") {
      const ready = this.level.generators.every((generator) => generator.active);
      const pulse = 0.18 + (Math.sin(this.animationTime * 3) + 1) * 0.05;
      ctx.fillStyle = ready ? `rgba(88,183,213,${pulse + 0.08})` : "rgba(255, 204, 102, 0.08)";
      ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
      ctx.fillStyle = ready ? "rgba(168, 240, 255, 0.2)" : "rgba(255,255,255,0.06)";
      ctx.fillRect(goal.x + 18, goal.y + 18, goal.width - 36, goal.height - 36);
      ctx.fillStyle = ready ? COLORS.techBright : COLORS.warning;
      ctx.fillRect(goal.x + goal.width / 2 - 18, goal.y + 24, 36, 18);
      ctx.fillRect(goal.x + goal.width / 2 - 12, goal.y + goal.height - 54, 24, 26);
      if (this.restoration > 0) {
        ctx.fillStyle = `rgba(88,183,213,${0.24 + this.restoration * 0.24})`;
        ctx.fillRect(goal.x + 26, goal.y + goal.height - 48, goal.width - 52, 18);
      }
      return;
    }

    if (this.restoration <= 0) {
      return;
    }

    ctx.fillStyle = `rgba(88,183,213,${0.14 + this.restoration * 0.22})`;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    if (this.level.id === "energy-facility") {
      ctx.fillStyle = "rgba(140, 243, 255, 0.9)";
      ctx.fillRect(goal.x + goal.width / 2 - 12, goal.y + 36, 24, goal.height - 72);
      ctx.fillStyle = "rgba(88, 183, 213, 0.6)";
      ctx.fillRect(goal.x + 24, goal.y + goal.height - 54, goal.width - 48, 18);
    } else {
      ctx.fillStyle = COLORS.water;
      ctx.fillRect(goal.x + 20, goal.y + 180, goal.width - 40, 22);
    }
  }

  private renderDashTrail(ctx: CanvasRenderingContext2D) {
    if (this.dashTrail.length === 0) {
      return;
    }

    const player = this.player;
    const character = getCharacterOption(this.selectedCharacterId);
    const renderW = player.width * PLAYER_RENDER_SCALE;
    const renderH = player.height * PLAYER_RENDER_SCALE;
    const animation = character.animations.dash;
    const image = this.getAsset(animation.path);

    if (!image) {
      for (let i = 0; i < this.dashTrail.length; i += 1) {
        const trail = this.dashTrail[i];
        const alpha = ((i + 1) / this.dashTrail.length) * 0.22;
        const renderX = trail.x - (renderW - player.width) / 2;
        const renderY = trail.y - (renderH - player.height);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = character.shadow;
        ctx.fillRect(renderX + renderW * 0.24, renderY + renderH * 0.16, renderW * 0.52, renderH * 0.68);
        ctx.restore();
      }
      return;
    }

    const frameWidth = image.width / animation.frames;
    const frameHeight = image.height;
    const frameIndex = Math.floor(this.animationTime * animation.fps) % animation.frames;
    const srcX = frameWidth * frameIndex;

    for (let i = 0; i < this.dashTrail.length; i += 1) {
      const trail = this.dashTrail[i];
      const alpha = ((i + 1) / this.dashTrail.length) * 0.22;
      const renderX = trail.x - (renderW - player.width) / 2;
      const renderY = trail.y - (renderH - player.height);
      ctx.save();
      ctx.globalAlpha = alpha;
      if (player.facing < 0) {
        ctx.translate(renderX + renderW, renderY);
        ctx.scale(-1, 1);
        ctx.drawImage(image, srcX, 0, frameWidth, frameHeight, 0, 0, renderW, renderH);
      } else {
        ctx.drawImage(image, srcX, 0, frameWidth, frameHeight, renderX, renderY, renderW, renderH);
      }
      ctx.restore();
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const player = this.player;
    const character = getCharacterOption(this.selectedCharacterId);
    const renderScale = PLAYER_RENDER_SCALE;
    const renderW = player.width * renderScale;
    const renderH = player.height * renderScale;
    const renderX = player.x - (renderW - player.width) / 2;
    const renderY = player.y - (renderH - player.height);
    const isDashing = player.dashTimer > 0;
    const isDeathState = player.respawning || this.respawnTimer > 0;

    if (player.hurtTimer > 0) {
      const shouldDraw = Math.floor(player.hurtTimer * 10) % 2 === 0;
      if (!shouldDraw) {
        return;
      }
    }

    ctx.save();
    const airFactor = player.onGround ? 1 : 0.4;
    ctx.globalAlpha = 0.25 * airFactor;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, player.y + player.height + 3, player.width * 0.38, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (this.assetsReady) {
      const animation = isDeathState
        ? character.animations.death
        : player.hurtTimer > 0
          ? character.animations.hurt
          : isDashing
            ? character.animations.dash
            : !player.onGround
              ? character.animations.jump
              : Math.abs(player.vx) > 10
                ? character.animations.run
                : character.animations.idle;
      const image = this.getAsset(animation.path);
      if (image) {
        const frameWidth = image.width / animation.frames;
        const frameHeight = image.height;
        const frameIndex = isDeathState
          ? Math.min(
              animation.frames - 1,
              Math.floor((1 - clamp(this.respawnTimer / RESPAWN_FADE, 0, 1)) * animation.frames)
            )
          : !player.onGround && player.vy < 0 && player.hurtTimer <= 0 && !isDashing
            ? animation.frames - 1
            : Math.floor(this.animationTime * animation.fps) % animation.frames;
        const srcX = frameWidth * frameIndex;
        ctx.save();
        if (isDeathState) {
          ctx.globalAlpha = 0.52 + Math.sin(this.animationTime * 28) * 0.08;
        }
        if (player.facing < 0) {
          ctx.translate(renderX + renderW, renderY);
          ctx.scale(-1, 1);
          ctx.drawImage(image, srcX, 0, frameWidth, frameHeight, 0, 0, renderW, renderH);
        } else {
          ctx.drawImage(image, srcX, 0, frameWidth, frameHeight, renderX, renderY, renderW, renderH);
        }
        ctx.restore();

        if (player.onGround && Math.abs(player.vx) > 50) {
          for (let i = 0; i < 3; i += 1) {
            const dustX = player.x + (player.facing > 0 ? 0 : player.width) - i * player.facing * 8;
            const dustY = player.y + player.height - 4 + i * 2;
            ctx.fillStyle = "rgba(240, 214, 174, 0.35)";
            ctx.fillRect(dustX, dustY, 6 - i, 3);
          }
        }

        if (player.dashCooldown <= 0 && !player.respawning && this.enterTimer <= 0) {
          const pulse = Math.sin(this.animationTime * 4) * 0.5 + 0.5;
          ctx.save();
          ctx.globalAlpha = pulse * 0.6;
          ctx.strokeStyle = character.accent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(player.x + 4, player.y + player.height + 4);
          ctx.lineTo(player.x + player.width - 4, player.y + player.height + 4);
          ctx.stroke();
          ctx.restore();
        }
        return;
      }
    }

    ctx.fillStyle = player.respawning && Math.floor(performance.now() / 80) % 2 === 0 ? COLORS.techBright : "#d6c9b8";
    ctx.fillRect(renderX, renderY, renderW, renderH);
    ctx.fillStyle = character.accent;
    ctx.fillRect(renderX + 10, renderY + 14, renderW - 20, 16);
    ctx.fillStyle = "#26313c";
    ctx.fillRect(renderX + (player.facing > 0 ? renderW - 18 : 8), renderY + 34, 10, 8);
    ctx.fillRect(renderX + 12, renderY + 54, renderW - 24, 24);

    if (player.dashCooldown <= 0 && !player.respawning && this.enterTimer <= 0) {
      const pulse = Math.sin(this.animationTime * 4) * 0.5 + 0.5;
      ctx.save();
      ctx.globalAlpha = pulse * 0.6;
      ctx.strokeStyle = character.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(player.x + 4, player.y + player.height + 4);
      ctx.lineTo(player.x + player.width - 4, player.y + player.height + 4);
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderDust(ctx: CanvasRenderingContext2D) {
    for (const particle of this.dustParticles) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, particle.life / 0.35);
      ctx.fillStyle = "rgba(240, 214, 174, 0.75)";
      ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size * 0.6);
      ctx.restore();
    }
  }

  private drawTile(
    ctx: CanvasRenderingContext2D,
    path: string,
    x: number,
    y: number,
    size: number,
    alpha = 1
  ) {
    const image = this.getAsset(path);
    if (!image) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, x, y, size, size);
    ctx.restore();
  }

  private renderWind(ctx: CanvasRenderingContext2D, zones: WindZone[]) {
    for (const zone of zones) {
      if (this.level.id === "restoration-zone") {
        ctx.strokeStyle = "rgba(168,240,255,0.34)";
        ctx.lineWidth = 2;
        ctx.fillStyle = "rgba(88,183,213,0.12)";
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        for (let i = 0; i < 5; i += 1) {
          const baseY = zone.y + 30 + i * 46;
          ctx.beginPath();
          ctx.moveTo(zone.x + 18, baseY);
          ctx.bezierCurveTo(
            zone.x + zone.width * 0.22,
            baseY - 12,
            zone.x + zone.width * 0.64,
            baseY + 12,
            zone.x + zone.width - 22,
            baseY
          );
          ctx.stroke();
          const arrowX = zone.x + ((this.animationTime * 120 + i * 90) % Math.max(40, zone.width - 50));
          ctx.fillStyle = "rgba(214,253,255,0.42)";
          ctx.fillRect(arrowX, baseY - 2, 14, 4);
        }
        continue;
      }

      ctx.strokeStyle = "rgba(168,240,255,0.28)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i += 1) {
        const baseY = zone.y + 40 + i * 60;
        ctx.beginPath();
        ctx.moveTo(zone.x + 20, baseY);
        ctx.bezierCurveTo(
          zone.x + zone.width * 0.3,
          baseY - 14,
          zone.x + zone.width * 0.65,
          baseY + 14,
          zone.x + zone.width - 20,
          baseY
        );
        ctx.stroke();
      }
    }
  }

  private renderForeground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(0, CANVAS_HEIGHT - 120, CANVAS_WIDTH, 120);

    if (this.player.respawning || this.respawnTimer > 0) {
      const alpha = clamp(this.respawnTimer / RESPAWN_FADE, 0, 1);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.04 + alpha * 0.08})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = `rgba(6, 10, 14, ${0.18 + alpha * 0.3})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = COLORS.white;
      ctx.font = "600 28px 'Segoe UI', sans-serif";
      ctx.fillText("Reconstruindo rota a partir do checkpoint...", 370, 340);
    }

    if (this.screen === "paused") {
      ctx.fillStyle = "rgba(6, 10, 14, 0.52)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = COLORS.white;
      ctx.font = "700 42px 'Segoe UI', sans-serif";
      ctx.fillText("PAUSADO", 525, 320);
    }

    if (this.screen === "victory") {
      ctx.fillStyle = "rgba(6, 10, 14, 0.44)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = COLORS.white;
      ctx.font = "700 48px 'Segoe UI', sans-serif";
      ctx.fillText(this.level.victoryTitle ?? "Sistema Restaurado", 400, 280);
      ctx.font = "500 24px 'Segoe UI', sans-serif";
      ctx.fillText(
        this.level.id === "energy-facility"
          ? "Os nucleos voltaram a pulsar e o complexo respondeu."
          : "A agua retorna aos canais. A ultima esperanca ainda resiste.",
        230,
        330
      );
    }
  }
}
