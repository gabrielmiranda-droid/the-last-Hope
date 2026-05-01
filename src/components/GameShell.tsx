import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { audioManager } from "../game/AudioManager";
import { CHARACTER_OPTIONS } from "../game/characters";
import { CANVAS_HEIGHT, CANVAS_WIDTH, DASH_COOLDOWN, PLAYER_MAX_ENERGY } from "../game/constants";
import { GameEngine } from "../game/GameEngine";
import type { GameSnapshot } from "../game/types";
import { useIsMobile } from "../hooks/useIsMobile";
import { useIsPortrait } from "../hooks/useIsPortrait";
import { TouchControls } from "./TouchControls";

const initialSnapshot: GameSnapshot = {
  screen: "menu",
  selectedCharacterId: "zion",
  playerEnergy: 100,
  playerDashCooldown: 0,
  playerDashCooldownMax: DASH_COOLDOWN,
  dashReadyFlash: 0,
  hudBarShake: 0,
  collectibles: 0,
  collectibleTotal: 3,
  interactionLabel: null,
  levelName: "Fase 1: Regiao da Seca",
  introTitle: "Regiao da Seca",
  introText: "Zion atravessa ruinas tecnologicas e terras mortas em busca de um sistema capaz de responder.",
  victoryTitle: "Irrigacao Restaurada",
  victoryText: "A agua voltou a circular. O ecossistema deu o primeiro sinal de recuperacao.",
  loadingTitle: "Carregando...",
  loadingSubtitle: "Fase 1: Regiao da Seca",
  loadingProgress: 0,
  hasNextLevel: true,
  narrativeText: "Ano 2168. O mundo secou antes de aprender a parar.",
  objectiveText: "Ative o gerador e restaure a irrigação.",
  generatorsActive: 0,
  generatorsTotal: 3,
  deathCount: 0,
  deathCause: "",
  deathCauseTimer: 0,
  restoration: 0,
  debugFlyUnlocked: false,
  debugFlyEnabled: false,
  playerWorldX: 0,
  playerWorldY: 0,
  transitionTitle: "",
  transitionSubtitle: "",
  transitionProgress: 0,
  options: {
    musicEnabled: true,
    musicVolume: 0.28,
    sfxVolume: 0.85,
    showHints: true
  }
};

const CHARACTER_DOSSIERS: Record<string, { callsign: string; profile: string; note: string }> = {
  zion: {
    callsign: "Z-01",
    profile: "Infiltracao vertical",
    note: "Le o terreno rapido e mantem o ritmo em estruturas instaveis."
  },
  kira: {
    callsign: "K-17",
    profile: "Corrida de sistema",
    note: "Opera em alta velocidade e reage bem a janelas curtas entre armadilhas."
  },
  brad: {
    callsign: "B-09",
    profile: "Suporte mecanico",
    note: "Aguenta a pressao e entra pesado quando o setor pede leitura tecnica."
  }
};

const LOADING_STEPS = [
  "Sincronizando o traje",
  "Mapeando o setor energizado",
  "Abrindo a rota de entrada"
] as const;

export function GameShell() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasFrameRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const menuButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const characterButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const optionsRefs = useRef<Array<HTMLInputElement | HTMLButtonElement | null>>([]);
  const screenRef = useRef<GameSnapshot["screen"]>(initialSnapshot.screen);
  const fullscreenTransitionRef = useRef(false);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const isPortrait = useIsPortrait();
  const isMobileLandscape = isMobile && !isPortrait;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const engine = new GameEngine(ctx, setSnapshot);
    engineRef.current = engine;
    engine.start();
    canvas.tabIndex = 0;
    canvas.focus();

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    screenRef.current = snapshot.screen;

    if (snapshot.screen === "menu") {
      menuButtonRefs.current[0]?.focus();
    } else if (snapshot.screen === "options") {
      optionsRefs.current[0]?.focus();
    }
  }, [snapshot.screen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenActive = document.fullscreenElement === canvasFrameRef.current;
      fullscreenTransitionRef.current = false;
      setIsFullscreen(fullscreenActive);

      if (screenRef.current === "playing" || screenRef.current === "paused" || screenRef.current === "victory") {
        requestAnimationFrame(() => {
          canvasRef.current?.focus({ preventScroll: true });
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const frame = canvasFrameRef.current;
    if (!frame) return;

    if (!isMobile || isMobileLandscape) {
      frame.style.width = "";
      frame.style.height = "";
      frame.style.padding = "";
      frame.style.flexShrink = "";
      return;
    }

    const fit = () => {
      if (frame.classList.contains("canvas-frame-fullscreen")) {
        frame.style.width = "";
        frame.style.height = "";
        frame.style.padding = "";
        frame.style.flexShrink = "";
        return;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let w = vw;
      let h = Math.round(w * (CANVAS_HEIGHT / CANVAS_WIDTH));
      if (h > vh) {
        h = vh;
        w = Math.round(h * (CANVAS_WIDTH / CANVAS_HEIGHT));
      }
      frame.style.width = `${w}px`;
      frame.style.height = `${h}px`;
      frame.style.padding = "0";
      frame.style.flexShrink = "0";
    };

    const delayedFit = () => setTimeout(fit, 120);

    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", delayedFit);

    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", delayedFit);
      const f = canvasFrameRef.current;
      if (f) {
        f.style.width = "";
        f.style.height = "";
        f.style.padding = "";
        f.style.flexShrink = "";
      }
    };
  }, [isMobile, isMobileLandscape]);

  useEffect(() => {
    audioManager.setMusicVolume(snapshot.options.musicEnabled ? snapshot.options.musicVolume : 0);
    audioManager.setSFXVolume(snapshot.options.sfxVolume);

    if (!snapshot.options.musicEnabled || snapshot.options.musicVolume <= 0.01) {
      audioManager.fadeOutMusic(0.25);
      return;
    }

    if (snapshot.screen === "menu" || snapshot.screen === "options") {
      audioManager.playMusic("menuMusic");
    }
  }, [snapshot.options.musicEnabled, snapshot.options.musicVolume, snapshot.options.sfxVolume, snapshot.screen]);

  const engine = engineRef.current;
  const selectedCharacter =
    CHARACTER_OPTIONS.find((character) => character.id === snapshot.selectedCharacterId) ?? CHARACTER_OPTIONS[0];
  const showShellChrome =
    snapshot.screen === "playing" || snapshot.screen === "paused" || snapshot.screen === "victory";
  const uiTime = performance.now() / 1000;
  const energyPct = snapshot.playerEnergy / PLAYER_MAX_ENERGY;
  let energyBarColor = "#44ff88";
  if (energyPct > 0.6) {
    energyBarColor = "#44ff88";
  } else if (energyPct > 0.3) {
    energyBarColor = "#ffcc00";
  } else if (energyPct > 0.1) {
    energyBarColor = "#ff4400";
  } else {
    energyBarColor = "#ff0000";
    if (Math.floor(uiTime * 8) % 2 === 0) {
      energyBarColor = "#880000";
    }
  }
  const energyBarOffsetX = snapshot.hudBarShake > 0 ? (Math.random() - 0.5) * 4 : 0;
  const dashProgress = Math.max(
    0,
    Math.min(1, 1 - snapshot.playerDashCooldown / Math.max(0.001, snapshot.playerDashCooldownMax || DASH_COOLDOWN))
  );
  const dashReady = snapshot.playerDashCooldown <= 0.001;
  const deathOverlayTotal = 2.4;
  const deathOverlayElapsed = deathOverlayTotal - snapshot.deathCauseTimer;
  const deathOverlayOpacity =
    deathOverlayElapsed < 0.5
      ? Math.max(0, deathOverlayElapsed / 0.5)
      : deathOverlayElapsed < 2
        ? 1
        : Math.max(0, 1 - (deathOverlayElapsed - 2) / 0.4);
  const transitionFadePortion = 0.8 / 2.3;
  const transitionAlpha =
    snapshot.screen === "transition"
      ? Math.min(1, snapshot.transitionProgress / transitionFadePortion)
      : 0;
  const shellSubtitle =
    snapshot.screen === "menu"
      ? "Tela Inicial"
      : snapshot.screen === "options"
        ? "Opções"
        : snapshot.screen === "loading"
          ? "Carregando"
          : snapshot.screen === "transition"
            ? "Transicao"
            : snapshot.levelName;

  const selectedCharacterIndex = Math.max(
    0,
    CHARACTER_OPTIONS.findIndex((character) => character.id === selectedCharacter.id)
  );
  const selectedDossier = CHARACTER_DOSSIERS[selectedCharacter.id] ?? CHARACTER_DOSSIERS.zion;
  const musicVolumePercent = Math.round(snapshot.options.musicVolume * 100);
  const sfxVolumePercent = Math.round(snapshot.options.sfxVolume * 100);
  const loadingStepIndex =
    snapshot.loadingProgress < 0.34 ? 0 : snapshot.loadingProgress < 0.67 ? 1 : LOADING_STEPS.length - 1;
  const menuTelemetry = [
    { label: "Operativos", value: `0${CHARACTER_OPTIONS.length}`.slice(-2) },
    { label: "Canal", value: snapshot.options.musicEnabled ? "Audio online" : "Silencio" },
    { label: "Setor inicial", value: snapshot.introTitle }
  ];

  const cycleCharacter = (direction: 1 | -1) => {
    const currentIndex = Math.max(
      0,
      CHARACTER_OPTIONS.findIndex((character) => character.id === snapshot.selectedCharacterId)
    );
    const nextIndex = (currentIndex + direction + CHARACTER_OPTIONS.length) % CHARACTER_OPTIONS.length;
    engine?.selectCharacter(CHARACTER_OPTIONS[nextIndex].id);
  };

  const menuButtons = [
    {
      label: "Iniciar expedicao",
      kind: "primary",
      action: () => {
        audioManager.fadeOutMusic(0.8);
        engine?.startGame();
      }
    },
    { label: "Tela cheia", kind: "secondary", action: () => void toggleFullscreen() },
    { label: "Opções", kind: "secondary", action: () => engine?.openOptions() },
    { label: "Sair", kind: "ghost", action: () => engine?.exitGame() }
  ] as const;

  const handleVerticalNavigation = (event: ReactKeyboardEvent<HTMLElement>, refs: Array<HTMLElement | null>) => {
    const activeRefs = refs.filter((item): item is HTMLElement => Boolean(item));
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    if (activeRefs.length === 0) {
      return;
    }

    const direction = event.key === "ArrowDown" ? 1 : -1;
    const activeIndex = activeRefs.findIndex((item) => item === document.activeElement);
    const nextIndex = activeIndex >= 0 ? (activeIndex + direction + activeRefs.length) % activeRefs.length : 0;
    activeRefs[nextIndex]?.focus();
  };

  const handleMenuKeyboard = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(event.code)) {
      event.preventDefault();
      cycleCharacter(event.code === "ArrowLeft" || event.code === "KeyA" ? -1 : 1);
      return;
    }

    handleVerticalNavigation(event, menuButtonRefs.current as HTMLElement[]);
  };

  const toggleFullscreen = async () => {
    if (fullscreenTransitionRef.current) {
      return;
    }

    fullscreenTransitionRef.current = true;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await canvasFrameRef.current?.requestFullscreen();
    } catch {
      fullscreenTransitionRef.current = false;
      // Ignore browser fullscreen failures and keep the current layout.
    }
  };

  return (
    <main
      className={`app-shell${isMobile ? " app-shell-mobile" : ""}${isMobileLandscape ? " app-shell-mobile-landscape" : ""}`}
    >
      {isMobile && isPortrait && (
        <div className="portrait-warning" aria-live="polite">
          <div className="portrait-warning-icon">↻</div>
          <strong>Vire o celular</strong>
          <p>Gire para horizontal para jogar melhor.</p>
        </div>
      )}
      <div className="backdrop-glow backdrop-glow-left" />
      <div className="backdrop-glow backdrop-glow-right" />

      <section className={`game-panel${isMobileLandscape ? " game-panel-mobile-landscape" : ""}`}>
        {showShellChrome && !isMobile && (
          <header className="hud-top">
            <div>
              <p className="eyebrow">Vertical Slice</p>
              <h1>The Last Hope</h1>
              <p className="subtitle">{shellSubtitle}</p>
            </div>

            <div className="hud-metrics">
              <div className="metric-card">
                <span>Energia</span>
                <div
                  className="energy-bar"
                  style={{
                    transform: `translateX(${energyBarOffsetX}px)`,
                    transition: snapshot.hudBarShake > 0 ? "none" : "transform 90ms ease-out"
                  }}
                >
                  <div
                    style={{
                      width: `${snapshot.playerEnergy}%`,
                      background: energyBarColor,
                      boxShadow: `0 0 18px ${energyBarColor}`
                    }}
                  />
                </div>
                <div style={{ marginTop: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      opacity: 0.82
                    }}
                  >
                    <span>DASH</span>
                    <strong style={{ color: dashReady ? selectedCharacter.accent : "#9aa6b2" }}>
                      {dashReady ? "PRONTO" : `${snapshot.playerDashCooldown.toFixed(1)}s`}
                    </strong>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      width: 120,
                      height: 8,
                      marginTop: 6,
                      borderRadius: 999,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <div
                      style={{
                        width: `${dashProgress * 120}px`,
                        height: "100%",
                        background: dashReady ? selectedCharacter.accent : "#444",
                        boxShadow: dashReady ? `0 0 14px ${selectedCharacter.accent}` : "none",
                        opacity: dashReady ? 0.72 + dashProgress * 0.28 * (Math.sin(uiTime * 4) * 0.5 + 0.5) : 1
                      }}
                    />
                    {snapshot.dashReadyFlash > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "#ffffff",
                          opacity: snapshot.dashReadyFlash / 0.1
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="metric-card compact">
                <span>Logs</span>
                <strong>
                  {snapshot.collectibles}/{snapshot.collectibleTotal}
                </strong>
              </div>
              <div className="metric-card compact">
                <span>Geradores</span>
                <strong>
                  {snapshot.generatorsActive}/{snapshot.generatorsTotal}
                </strong>
              </div>
            </div>
          </header>
        )}

        <div
          ref={canvasFrameRef}
          className={`canvas-frame${isFullscreen ? " canvas-frame-fullscreen" : ""}${isMobileLandscape ? " canvas-frame-mobile-landscape" : ""}`}
        >
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onClick={() => canvasRef.current?.focus()} />
          {isMobile && showShellChrome && (
            <div className="mobile-hud-strip">
              <div className="mobile-energy-wrap">
                <div className="mobile-energy-bar" style={{ width: `${snapshot.playerEnergy}%`, background: energyBarColor }} />
              </div>
              <span className="mobile-stat">{snapshot.generatorsActive}/{snapshot.generatorsTotal}&nbsp;⚡</span>
              <span className="mobile-stat">{snapshot.collectibles}/{snapshot.collectibleTotal}&nbsp;📋</span>
              <span className="mobile-stat" style={{ color: dashReady ? "#a8f0ff" : "#9aa6b2" }}>
                {dashReady ? "DASH✓" : `${snapshot.playerDashCooldown.toFixed(1)}s`}
              </span>
            </div>
          )}
          {isMobile && snapshot.screen === "playing" && <TouchControls engineRef={engineRef} />}

          {isFullscreen && (
            <button className="fullscreen-exit" onClick={() => void toggleFullscreen()}>
              Sair da tela cheia
            </button>
          )}

          {snapshot.screen === "menu" && (
            <div className="overlay-menu menu-screen" onKeyDown={handleMenuKeyboard}>
              <div className="menu-scene menu-scene-back" />
              <div className="menu-scene menu-scene-mid" />
              <div className="menu-dust menu-dust-a" />
              <div className="menu-dust menu-dust-b" />
              <div className="menu-background-orb menu-background-orb-left" />
              <div className="menu-background-orb menu-background-orb-right" />

              <div className="menu-cinematic">
                <section className="menu-hero">
                  <p className="eyebrow">Ruínas industriais em restauração</p>
                  <h2 className="menu-title">THE LAST HOPE</h2>
                  <p className="menu-tagline">Restaure o sistema. Traga a água de volta.</p>

                  <p className="menu-summary">
                    Escolha o operativo, ajuste o som e deixe a incursao pronta antes de abrir o setor.
                  </p>

                  <div className="menu-telemetry-row">
                    {menuTelemetry.map((item) => (
                      <div key={item.label} className="menu-telemetry-chip">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="featured-character-shell">
                    <button
                      ref={(element) => {
                        characterButtonRefs.current[0] = element;
                      }}
                      className="character-arrow ghost"
                      onClick={() => cycleCharacter(-1)}
                      aria-label="Personagem anterior"
                    >
                      {"<"}
                    </button>

                    <div className="featured-character-stage">
                      <div
                        className="featured-character-glow"
                        style={{ "--character-accent": selectedCharacter.accent } as CSSProperties}
                      />
                      <div
                        className="featured-character-sprite"
                        style={
                          {
                            "--sprite-sheet": `url(${selectedCharacter.animations.idle.path})`,
                            "--character-accent": selectedCharacter.accent
                          } as CSSProperties
                        }
                      />
                    </div>

                    <button
                      ref={(element) => {
                        characterButtonRefs.current[1] = element;
                      }}
                      className="character-arrow ghost"
                      onClick={() => cycleCharacter(1)}
                      aria-label="Próximo personagem"
                    >
                      {">"}
                    </button>
                  </div>

                  <div className="featured-character-copy">
                    <strong>{selectedCharacter.name}</strong>
                    <span>{selectedCharacter.title}</span>
                    <small>
                      Slot 0{selectedCharacterIndex + 1} // {selectedDossier.callsign} // {selectedDossier.profile} // use
                      A/D ou as setas para trocar
                    </small>
                  </div>

                  <div className="hero-briefing-card">
                    <div className="hero-briefing-top">
                      <span>Briefing do setor</span>
                      <strong>{snapshot.introTitle}</strong>
                    </div>
                    <p>{snapshot.introText}</p>
                    <div className="hero-briefing-grid">
                      <div>
                        <span>Operativo</span>
                        <strong>{selectedCharacter.name}</strong>
                      </div>
                      <div>
                        <span>Leitura</span>
                        <strong>{selectedDossier.note}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="character-selector-grid" aria-label="Selecao de personagem">
                    {CHARACTER_OPTIONS.map((character, index) => {
                      const isActive = character.id === selectedCharacter.id;
                      return (
                        <button
                          key={character.id}
                          className={`character-option-button${isActive ? " is-active" : ""}`}
                          style={
                            {
                              "--character-accent": character.accent,
                              "--character-shadow": character.shadow,
                              "--sprite-sheet": `url(${character.animations.idle.path})`
                            } as CSSProperties
                          }
                          onClick={() => engine?.selectCharacter(character.id)}
                          aria-pressed={isActive}
                        >
                          <div className="character-option-top">
                            <span>0{index + 1}</span>
                            {isActive && <small>ATIVO</small>}
                          </div>
                          <div className="character-option-preview">
                            <div className="character-option-sprite" />
                          </div>
                          <div className="character-option-copy">
                            <strong>{character.name}</strong>
                            <span>{character.title}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <nav className="menu-actions" aria-label="Menu principal">
                  <div className="menu-actions-panel">
                    <p className="eyebrow">Centro de comando</p>
                    <h3 className="menu-panel-title">Preparacao de missao</h3>
                    <p className="menu-panel-copy">
                      Configure o audio, revise o operativo e acione o jogo quando a expedicao estiver pronta.
                    </p>
                  </div>

                  {menuButtons.map((button, index) => (
                    <button
                      key={button.label}
                      ref={(element) => {
                        menuButtonRefs.current[index] = element;
                      }}
                      className={`menu-action ${button.kind}`}
                      onClick={button.action}
                    >
                      {button.label}
                    </button>
                  ))}

                  <div className="menu-mini-grid">
                    <div className="menu-mini-card">
                      <span>Operativo ativo</span>
                      <strong>{selectedCharacter.name}</strong>
                    </div>
                    <div className="menu-mini-card">
                      <span>Canal musical</span>
                      <strong>{snapshot.options.musicEnabled ? `${musicVolumePercent}%` : "OFF"}</strong>
                    </div>
                    <div className="menu-mini-card">
                      <span>Leitura HUD</span>
                      <strong>{snapshot.options.showHints ? "Assistida" : "Crua"}</strong>
                    </div>
                  </div>

                  <div className="menu-sound-panel">
                    <div className="menu-sound-head">
                      <span>Audio de campo</span>
                      <strong>{sfxVolumePercent}% SFX</strong>
                    </div>

                    <label className="menu-toggle-line">
                      <span>Musica</span>
                      <div className="menu-toggle-controls">
                        <strong>{snapshot.options.musicEnabled ? "Ligada" : "Desligada"}</strong>
                        <input
                          type="checkbox"
                          checked={snapshot.options.musicEnabled}
                          onChange={(event) => engine?.setOptions({ musicEnabled: event.target.checked })}
                        />
                      </div>
                    </label>

                    <label className="menu-range-block">
                      <div className="menu-range-header">
                        <span>Volume musical</span>
                        <strong>{musicVolumePercent}%</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicVolumePercent}
                        onChange={(event) => engine?.setOptions({ musicVolume: Number(event.target.value) / 100 })}
                      />
                    </label>

                    <label className="menu-range-block">
                      <div className="menu-range-header">
                        <span>Efeitos sonoros</span>
                        <strong>{sfxVolumePercent}%</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sfxVolumePercent}
                        onChange={(event) => engine?.setOptions({ sfxVolume: Number(event.target.value) / 100 })}
                      />
                    </label>
                  </div>

                  <p className="launch-note">
                    Depois de clicar em iniciar, a fase carrega e o jogo abre assim que o setor terminar de subir.
                  </p>
                  {snapshot.narrativeText?.includes("Se a aba") && <div className="menu-note">{snapshot.narrativeText}</div>}
                </nav>
              </div>
            </div>
          )}

          {snapshot.screen === "options" && (
            <div
              className="overlay-menu"
              onKeyDown={(event) =>
                handleVerticalNavigation(
                  event,
                  [optionsRefs.current[0], optionsRefs.current[1], optionsRefs.current[2], optionsRefs.current[5]] as HTMLElement[]
                )
              }
            >
              <div className="story-card menu-subscreen">
                <p className="eyebrow">Opções</p>
                <h2>Áudio e interface</h2>
                <div className="options-list">
                  <label className="option-block">
                    <span>Música</span>
                    <div className="toggle-row">
                      <strong>{snapshot.options.musicEnabled ? "Ligada" : "Desligada"}</strong>
                      <input
                        ref={(element) => {
                          optionsRefs.current[0] = element;
                        }}
                        type="checkbox"
                        checked={snapshot.options.musicEnabled}
                        onChange={(event) => engine?.setOptions({ musicEnabled: event.target.checked })}
                      />
                    </div>
                  </label>

                  <label className="option-block">
                    <span>Volume da música</span>
                    <strong>{Math.round(snapshot.options.musicVolume * 100)}%</strong>
                    <input
                      ref={(element) => {
                        optionsRefs.current[1] = element;
                      }}
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(snapshot.options.musicVolume * 100)}
                      onChange={(event) => engine?.setOptions({ musicVolume: Number(event.target.value) / 100 })}
                    />
                  </label>

                  <label className="option-block">
                    <span>Efeitos sonoros</span>
                    <strong>{Math.round(snapshot.options.sfxVolume * 100)}%</strong>
                    <input
                      ref={(element) => {
                        optionsRefs.current[2] = element;
                      }}
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(snapshot.options.sfxVolume * 100)}
                      onChange={(event) => engine?.setOptions({ sfxVolume: Number(event.target.value) / 100 })}
                    />
                  </label>

                  <label className="option-block">
                    <span>Dicas de interação</span>
                    <div className="toggle-row">
                      <strong>{snapshot.options.showHints ? "Ligadas" : "Desligadas"}</strong>
                      <input
                        type="checkbox"
                        checked={snapshot.options.showHints}
                        onChange={(event) => engine?.setOptions({ showHints: event.target.checked })}
                      />
                    </div>
                  </label>
                </div>

                <div className="button-column">
                  <button
                    ref={(element) => {
                      optionsRefs.current[5] = element;
                    }}
                    onClick={() => engine?.backToMenu()}
                  >
                    Voltar ao menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {snapshot.screen === "loading" && (
            <div className="overlay-menu">
              <div className="story-card menu-subscreen loading-card loading-card-rich">
                <p className="eyebrow">Transição</p>
                <h2>{snapshot.loadingTitle}</h2>
                <p>{snapshot.loadingSubtitle}</p>
                <div className="loading-stage">
                  <div
                    className="loading-character-stage"
                    style={{ "--character-accent": selectedCharacter.accent } as CSSProperties}
                  >
                    <div className="featured-character-glow" />
                    <div
                      className="featured-character-sprite"
                      style={
                        {
                          "--sprite-sheet": `url(${selectedCharacter.animations.idle.path})`,
                          "--character-accent": selectedCharacter.accent
                        } as CSSProperties
                      }
                    />
                  </div>

                  <div className="loading-character-copy">
                    <span>{selectedDossier.callsign}</span>
                    <strong>{selectedCharacter.name}</strong>
                    <p>{selectedDossier.note}</p>
                  </div>
                </div>

                <div className="loading-bar">
                  <div style={{ width: `${Math.round(snapshot.loadingProgress * 100)}%` }} />
                </div>
                <div className="loading-progress-meta">
                  <span>Progresso do boot</span>
                  <strong>{Math.round(snapshot.loadingProgress * 100)}%</strong>
                </div>
                <div className="loading-step-list">
                  {LOADING_STEPS.map((step, index) => (
                    <div key={step} className={`loading-step${index <= loadingStepIndex ? " is-active" : ""}`}>
                      <span>0{index + 1}</span>
                      <strong>{step}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {snapshot.screen === "transition" && (
            <div
              className="overlay-menu"
              style={{
                background: `rgba(0, 0, 0, ${transitionAlpha})`,
                backdropFilter: "blur(10px)"
              }}
            >
              <div
                className="story-card menu-subscreen loading-card"
                style={{
                  opacity: transitionAlpha,
                  transform: `translateY(${(1 - transitionAlpha) * 20}px) scale(${0.98 + transitionAlpha * 0.02})`
                }}
              >
                <p className="eyebrow">Proxima fase</p>
                <h2>{snapshot.transitionTitle}</h2>
                <p>{snapshot.transitionSubtitle}</p>
              </div>
            </div>
          )}

          {(snapshot.screen === "playing" || snapshot.screen === "paused" || snapshot.screen === "victory") && (
            <div className="play-hud">
              <div className="objective-card">
                <span>Objetivo</span>
                <strong>{snapshot.objectiveText}</strong>
              </div>
              {snapshot.debugFlyEnabled && (
                <div
                  className="interaction-pill"
                  style={{
                    bottom: snapshot.interactionLabel ? 88 : 32,
                    background: "rgba(24, 16, 10, 0.94)",
                    borderColor: "rgba(255, 204, 102, 0.46)"
                  }}
                >
                  XITER ON | F desliga | X {snapshot.playerWorldX} Y {snapshot.playerWorldY}
                </div>
              )}
              {snapshot.interactionLabel && <div className="interaction-pill">{snapshot.interactionLabel}</div>}
              {snapshot.narrativeText && <div className="narrative-toast">{snapshot.narrativeText}</div>}
              <div className="death-counter">
                <span>Mortes</span>
                <strong>{snapshot.deathCount}</strong>
              </div>
              {!isMobile && <div className="controls-card">
                <span>Controles</span>
                <div className="controls-list">
                  <strong>
                    <b>A/D</b>
                    <small>mover</small>
                  </strong>
                  <strong>
                    <b>Shift</b>
                    <small>dash</small>
                  </strong>
                <strong>Espaço (Pulo duplo)</strong>
                  <strong>
                    <b>E</b>
                    <small>interagir</small>
                  </strong>
                  {(snapshot.debugFlyUnlocked || snapshot.debugFlyEnabled) && (
                    <strong>
                      <b>F</b>
                      <small>{snapshot.debugFlyEnabled ? `voando X ${snapshot.playerWorldX} Y ${snapshot.playerWorldY}` : "xiter voo"}</small>
                    </strong>
                  )}
                  <strong>
                    <b>Esc</b>
                    <small>pause</small>
                  </strong>
                </div>
              </div>}
            </div>
          )}

          {snapshot.deathCauseTimer > 0 && snapshot.deathCause && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                opacity: deathOverlayOpacity
              }}
            >
              <div
                style={{
                  color: "#ffffff",
                  fontSize: 32,
                  fontWeight: 700,
                  textAlign: "center",
                  textShadow: "0 4px 14px rgba(0, 0, 0, 0.85), 0 0 2px rgba(0, 0, 0, 1)"
                }}
              >
                {snapshot.deathCause}
              </div>
            </div>
          )}

          {snapshot.screen === "paused" && (
            <div className="pause-panel">
              <button onClick={() => engine?.togglePause()}>Continuar</button>
              <button className="secondary" onClick={() => engine?.backToMenu()}>
                Voltar ao menu
              </button>
            </div>
          )}

          {snapshot.screen === "victory" && (
            <div className="victory-panel">
              <div className="story-card wide">
                <p className="eyebrow">Fase concluída</p>
                <h2>{snapshot.victoryTitle}</h2>
                <p>{snapshot.victoryText}</p>
                <p>
                  {snapshot.hasNextLevel
                    ? "O próximo setor já pode ser explorado."
                    : "A rota principal desta entrega foi concluída."}
                </p>
                <div className="button-row">
                  {snapshot.hasNextLevel ? (
                    <button onClick={() => engine?.startNextLevel()}>Próxima fase</button>
                  ) : (
                    <button onClick={() => engine?.startGame()}>Jogar novamente</button>
                  )}
                  <button className="secondary" onClick={() => engine?.backToMenu()}>
                    Menu inicial
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showShellChrome && !isMobile && (
          <footer className="footer-bar">
            <span>Movimentação precisa, puzzles ambientais e restauração do ecossistema.</span>
            <div className="footer-actions">
              <span>Placeholder de áudio documentado no README.</span>
              <button className="ghost fullscreen-toggle" onClick={() => void toggleFullscreen()}>
                {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              </button>
            </div>
          </footer>
        )}
      </section>
    </main>
  );
}
