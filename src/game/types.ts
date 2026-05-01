export type ScreenState =
  | "menu"
  | "options"
  | "loading"
  | "transition"
  | "playing"
  | "paused"
  | "victory";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PlayerState = {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  energy: number;
  collectibles: number;
  respawning: boolean;
  dashTimer: number;
  dashCooldown: number;
  jumpsRemaining: number;
  hurtTimer: number;
};

export type Platform = Rect & {
  id: string;
  kind: "static" | "moving" | "breakable" | "fake" | "timed";
  color?: string;
  slippery?: boolean;
  moveAxis?: "x" | "y";
  range?: number;
  speed?: number;
  originX?: number;
  originY?: number;
  active?: boolean;
  breakDelay?: number;
  respawnDelay?: number;
  timer?: number;
  broken?: boolean;
};

export type Lever = Rect & {
  id: string;
  label: string;
  targetDoorId?: string;
  toggled: boolean;
};

export type Door = Rect & {
  id: string;
  label: string;
  open: boolean;
};

export type Generator = Rect & {
  id: string;
  label: string;
  active: boolean;
};

export type Checkpoint = Rect & {
  id: string;
  activated: boolean;
};

export type Collectible = Rect & {
  id: string;
  label: string;
  text: string;
  collected: boolean;
};

export type WindZone = Rect & {
  id: string;
  forceX: number;
  forceY: number;
  gravityScale?: number;
};

export type Hazard = Rect & {
  id: string;
  kind: "drone" | "laser" | "crusher" | "wind";
  moveAxis?: "x" | "y";
  range?: number;
  speed?: number;
  originX?: number;
  originY?: number;
  active?: boolean;
  damage?: number;
  forceX?: number;
  forceY?: number;
  gravityScale?: number;
  triggerId?: string;
  direction?: "left" | "right" | "up" | "down";
  startDelay?: number;
  timer?: number;
  homeX?: number;
  homeY?: number;
  blinkOn?: number;
  blinkOff?: number;
};

export type TriggerZone = Rect & {
  id: string;
  once?: boolean;
  activated: boolean;
};

export type HiddenSpike = Rect & {
  id: string;
  triggerId: string;
  active: boolean;
};

export type IrrigationConsole = Rect & {
  id: string;
  active: boolean;
};

export type LevelData = {
  id: string;
  name: string;
  introTitle?: string;
  introText?: string;
  victoryTitle?: string;
  victoryText?: string;
  width: number;
  height: number;
  start: { x: number; y: number };
  goalArea: Rect;
  platforms: Platform[];
  levers: Lever[];
  doors: Door[];
  generators: Generator[];
  checkpoints: Checkpoint[];
  collectibles: Collectible[];
  windZones: WindZone[];
  hazards: Hazard[];
  triggerZones: TriggerZone[];
  hiddenSpikes: HiddenSpike[];
  irrigationConsole: IrrigationConsole;
};

export type InputState = {
  left: boolean;
  right: boolean;
  down: boolean;
  dashPressed: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
  interactPressed: boolean;
  pausePressed: boolean;
};

export type UiMessage = {
  text: string;
  ttl: number;
};

export type DamageSource = "spike" | "fall" | "laser" | "crusher" | "drone" | "generic";

export type GameSnapshot = {
  screen: ScreenState;
  selectedCharacterId: string;
  playerEnergy: number;
  playerDashCooldown: number;
  playerDashCooldownMax: number;
  dashReadyFlash: number;
  hudBarShake: number;
  collectibles: number;
  collectibleTotal: number;
  interactionLabel: string | null;
  levelName: string;
  introTitle: string;
  introText: string;
  victoryTitle: string;
  victoryText: string;
  loadingTitle: string;
  loadingSubtitle: string;
  loadingProgress: number;
  hasNextLevel: boolean;
  narrativeText: string | null;
  objectiveText: string;
  generatorsActive: number;
  generatorsTotal: number;
  deathCount: number;
  deathCause: string;
  deathCauseTimer: number;
  restoration: number;
  debugFlyUnlocked: boolean;
  debugFlyEnabled: boolean;
  playerWorldX: number;
  playerWorldY: number;
  transitionTitle: string;
  transitionSubtitle: string;
  transitionProgress: number;
  options: {
    musicEnabled: boolean;
    musicVolume: number;
    sfxVolume: number;
    showHints: boolean;
  };
};
