import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent
} from "react";
import { audioManager } from "../game/AudioManager";
import { CHARACTER_OPTIONS } from "../game/characters";
import { DASH_COOLDOWN, PLAYER_MAX_ENERGY } from "../game/constants";
import { GameEngine } from "../game/GameEngine";
import type { GameSnapshot } from "../game/types";
import { useIsMobile } from "../hooks/useIsMobile";
import { useIsPortrait } from "../hooks/useIsPortrait";
import { TouchControls } from "./TouchControls";

type MenuView = "main" | "characters" | "settings";

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
  objectiveText: "Ative o gerador e restaure a irrigacao.",
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
  const settingsRefs = useRef<Array<HTMLInputElement | HTMLButtonElement | null>>([]);
  const screenRef = useRef<GameSnapshot["screen"]>(initialSnapshot.screen);
  const fullscreenTransitionRef = useRef(false);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>("main");
  const isMobile = useIsMobile();
  const isPortrait = useIsPortrait();
  const isMobileLandscape = isMobile && !isPortrait;

  async function ensureFullscreen() {
    const frame = canvasFrameRef.current;
    if (!frame) {
      return false;
    }

    if (document.fullscreenElement === frame) {
      return true;
    }

    if (fullscreenTransitionRef.current) {
      return false;
    }

    fullscreenTransitionRef.current = true;

    try {
      await frame.requestFullscreen();
      return true;
    } catch {
      fullscreenTransitionRef.current = false;
      return false;
    }
  }

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
    const previousScreen = screenRef.current;
    screenRef.current = snapshot.screen;

    if (snapshot.screen === "options") {
      startTransition(() => setMenuView("settings"));
      return;
    }

    if (snapshot.screen === "menu" && previousScreen !== "menu" && previousScreen !== "options") {
      startTransition(() => setMenuView("main"));
    }
  }, [snapshot.screen]);

  useEffect(() => {
    if (snapshot.screen !== "menu" && snapshot.screen !== "options") {
      return;
    }

    requestAnimationFrame(() => {
      if (menuView === "settings") {
        settingsRefs.current[0]?.focus();
        return;
      }

      menuButtonRefs.current[0]?.focus();
    });
  }, [menuView, snapshot.screen]);

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
    if (snapshot.screen !== "menu" && snapshot.screen !== "options") {
      return;
    }

    const tryEnterFullscreen = () => {
      void ensureFullscreen();
    };

    window.addEventListener("pointerdown", tryEnterFullscreen, true);
    window.addEventListener("keydown", tryEnterFullscreen, true);

    return () => {
      window.removeEventListener("pointerdown", tryEnterFullscreen, true);
      window.removeEventListener("keydown", tryEnterFullscreen, true);
    };
  }, [snapshot.screen]);

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
  const selectedCharacterIndex = Math.max(
    0,
    CHARACTER_OPTIONS.findIndex((character) => character.id === selectedCharacter.id)
  );
  const selectedDossier = CHARACTER_DOSSIERS[selectedCharacter.id] ?? CHARACTER_DOSSIERS.zion;
  const showFrontEnd = snapshot.screen === "menu" || snapshot.screen === "options";
  const showInGameHud =
    snapshot.screen === "playing" || snapshot.screen === "paused" || snapshot.screen === "victory";
  const uiTime = performance.now() / 1000;
  const energyPct = snapshot.playerEnergy / PLAYER_MAX_ENERGY;
  const dashProgress = Math.max(
    0,
    Math.min(1, 1 - snapshot.playerDashCooldown / Math.max(0.001, snapshot.playerDashCooldownMax || DASH_COOLDOWN))
  );
  const dashReady = snapshot.playerDashCooldown <= 0.001;
  const musicVolumePercent = Math.round(snapshot.options.musicVolume * 100);
  const sfxVolumePercent = Math.round(snapshot.options.sfxVolume * 100);
  const loadingStepIndex =
    snapshot.loadingProgress < 0.34 ? 0 : snapshot.loadingProgress < 0.67 ? 1 : LOADING_STEPS.length - 1;
  const deathOverlayTotal = 2.4;
  const deathOverlayElapsed = deathOverlayTotal - snapshot.deathCauseTimer;
  const deathOverlayOpacity =
    deathOverlayElapsed < 0.5
      ? Math.max(0, deathOverlayElapsed / 0.5)
      : deathOverlayElapsed < 2
        ? 1
        : Math.max(0, 1 - (deathOverlayElapsed - 2) / 0.4);

  let energyBarColor = "#45f2a4";
  if (energyPct <= 0.3) {
    energyBarColor = "#ffb347";
  }
  if (energyPct <= 0.12) {
    energyBarColor = Math.floor(uiTime * 8) % 2 === 0 ? "#ff4f5e" : "#8d1824";
  }

  const menuStatusText = isFullscreen
    ? "Tela cheia ativa. O setor abre sem molduras."
    : "O navegador libera a tela cheia na primeira interacao. Clique em qualquer comando para travar.";

  const menuStats = [
    { label: "Operativo", value: `0${selectedCharacterIndex + 1}`.slice(-2) },
    { label: "Canal", value: snapshot.options.musicEnabled ? `${musicVolumePercent}%` : "OFF" },
    { label: "Setor", value: snapshot.introTitle }
  ];

  const gameplayStats = [
    { label: "Nucleos", value: `${snapshot.generatorsActive}/${snapshot.generatorsTotal}` },
    { label: "Logs", value: `${snapshot.collectibles}/${snapshot.collectibleTotal}` },
    { label: "Mortes", value: `${snapshot.deathCount}` }
  ];

  const cycleCharacter = (direction: 1 | -1) => {
    const currentIndex = Math.max(
      0,
      CHARACTER_OPTIONS.findIndex((character) => character.id === snapshot.selectedCharacterId)
    );
    const nextIndex = (currentIndex + direction + CHARACTER_OPTIONS.length) % CHARACTER_OPTIONS.length;
    void ensureFullscreen();
    engine?.selectCharacter(CHARACTER_OPTIONS[nextIndex].id);
  };

  const handleStartGame = async () => {
    await ensureFullscreen();
    startTransition(() => setMenuView("main"));
    audioManager.fadeOutMusic(0.8);
    engine?.startGame();
  };

  const openMenuView = (view: MenuView) => {
    void ensureFullscreen();
    startTransition(() => setMenuView(view));
  };

  const handleReturnToMenu = () => {
    startTransition(() => setMenuView("main"));
    engine?.backToMenu();
  };

  const handleExit = async () => {
    await ensureFullscreen();
    engine?.exitGame();
  };

  const handleOptionsChange = (next: Parameters<GameEngine["setOptions"]>[0]) => {
    void ensureFullscreen();
    engine?.setOptions(next);
  };

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

  const handleFrontKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (menuView === "characters") {
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        event.preventDefault();
        cycleCharacter(-1);
        return;
      }

      if (event.code === "ArrowRight" || event.code === "KeyD") {
        event.preventDefault();
        cycleCharacter(1);
        return;
      }
    }

    if (event.code === "Escape" && menuView !== "main") {
      event.preventDefault();
      startTransition(() => setMenuView("main"));
      return;
    }

    if (menuView === "settings") {
      handleVerticalNavigation(event, settingsRefs.current as HTMLElement[]);
      return;
    }

    handleVerticalNavigation(event, menuButtonRefs.current as HTMLElement[]);
  };

  const menuButtons = [
    {
      label: "Jogar",
      description: "Entrar no setor agora",
      action: () => {
        void handleStartGame();
      }
    },
    {
      label: "Selecao de Personagem",
      description: "Trocar o operativo",
      action: () => openMenuView("characters")
    },
    {
      label: "Configuracoes",
      description: "Som e interface",
      action: () => openMenuView("settings")
    },
    {
      label: "Sair",
      description: "Encerrar transmissao",
      action: () => {
        void handleExit();
      }
    }
  ] as const;

  const renderMenuView = () => {
    if (menuView === "characters") {
      return (
        <section className="front-card front-card-wide">
          <div className="front-section-head">
            <p className="front-kicker">Selecao de personagem</p>
            <h2>Escolha quem entra primeiro</h2>
            <p>
              A mecanica do jogo continua a mesma. Aqui voce define so o estilo visual do operativo que vai abrir a
              expedicao.
            </p>
          </div>

          <div className="front-character-layout">
            <div className="front-character-focus">
              <div
                className="front-character-showcase"
                style={{ "--character-accent": selectedCharacter.accent } as CSSProperties}
              >
                <div className="front-character-glow" />
                <div
                  className="front-character-sprite"
                  style={{ "--sprite-sheet": `url(${selectedCharacter.animations.idle.path})` } as CSSProperties}
                />
              </div>

              <div className="front-character-copy">
                <p className="front-kicker">
                  Slot 0{selectedCharacterIndex + 1} // {selectedDossier.callsign}
                </p>
                <h3>{selectedCharacter.name}</h3>
                <strong>{selectedCharacter.title}</strong>
                <p>{selectedDossier.note}</p>
                <div className="front-inline-actions">
                  <button className="secondary" onClick={() => cycleCharacter(-1)}>
                    Anterior
                  </button>
                  <button className="secondary" onClick={() => cycleCharacter(1)}>
                    Proximo
                  </button>
                </div>
              </div>
            </div>

            <div className="front-roster-grid" aria-label="Roster de personagens">
              {CHARACTER_OPTIONS.map((character, index) => {
                const isActive = character.id === selectedCharacter.id;
                const dossier = CHARACTER_DOSSIERS[character.id] ?? CHARACTER_DOSSIERS.zion;

                return (
                  <button
                    key={character.id}
                    className={`front-roster-card${isActive ? " is-active" : ""}`}
                    style={
                      {
                        "--character-accent": character.accent,
                        "--character-shadow": character.shadow,
                        "--sprite-sheet": `url(${character.animations.idle.path})`
                      } as CSSProperties
                    }
                    onClick={() => {
                      void ensureFullscreen();
                      engine?.selectCharacter(character.id);
                    }}
                    aria-pressed={isActive}
                  >
                    <div className="front-roster-top">
                      <span>0{index + 1}</span>
                      <small>{isActive ? "ATIVO" : dossier.callsign}</small>
                    </div>
                    <div className="front-roster-preview">
                      <div className="front-roster-sprite" />
                    </div>
                    <strong>{character.name}</strong>
                    <span>{character.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="front-inline-actions front-inline-actions-end">
            <button className="ghost" onClick={() => openMenuView("main")}>
              Voltar
            </button>
            <button onClick={() => void handleStartGame()}>Jogar com {selectedCharacter.name}</button>
          </div>
        </section>
      );
    }

    if (menuView === "settings") {
      return (
        <section className="front-card front-card-wide">
          <div className="front-section-head">
            <p className="front-kicker">Configuracoes</p>
            <h2>Som e interface</h2>
            <p>Ajuste o que voce quer ouvir e quanto apoio visual quer ter antes de abrir a fase.</p>
          </div>

          <div className="front-settings-grid">
            <label className="front-setting-card">
              <div className="front-setting-head">
                <span>Musica</span>
                <strong>{snapshot.options.musicEnabled ? "Ligada" : "Desligada"}</strong>
              </div>
              <input
                ref={(element) => {
                  settingsRefs.current[0] = element;
                }}
                type="checkbox"
                checked={snapshot.options.musicEnabled}
                onChange={(event) => handleOptionsChange({ musicEnabled: event.target.checked })}
              />
            </label>

            <label className="front-setting-card">
              <div className="front-setting-head">
                <span>Volume da musica</span>
                <strong>{musicVolumePercent}%</strong>
              </div>
              <input
                ref={(element) => {
                  settingsRefs.current[1] = element;
                }}
                type="range"
                min="0"
                max="100"
                value={musicVolumePercent}
                onChange={(event) => handleOptionsChange({ musicVolume: Number(event.target.value) / 100 })}
              />
            </label>

            <label className="front-setting-card">
              <div className="front-setting-head">
                <span>Efeitos sonoros</span>
                <strong>{sfxVolumePercent}%</strong>
              </div>
              <input
                ref={(element) => {
                  settingsRefs.current[2] = element;
                }}
                type="range"
                min="0"
                max="100"
                value={sfxVolumePercent}
                onChange={(event) => handleOptionsChange({ sfxVolume: Number(event.target.value) / 100 })}
              />
            </label>

            <label className="front-setting-card">
              <div className="front-setting-head">
                <span>Dicas na tela</span>
                <strong>{snapshot.options.showHints ? "Ativas" : "Ocultas"}</strong>
              </div>
              <input
                ref={(element) => {
                  settingsRefs.current[3] = element;
                }}
                type="checkbox"
                checked={snapshot.options.showHints}
                onChange={(event) => handleOptionsChange({ showHints: event.target.checked })}
              />
            </label>
          </div>

          <div className="front-system-status">
            <div className="front-system-tile">
              <span>Estado da tela</span>
              <strong>{isFullscreen ? "Tela cheia ativa" : "Aguardando interacao"}</strong>
            </div>
            <div className="front-system-tile">
              <span>Operativo atual</span>
              <strong>{selectedCharacter.name}</strong>
            </div>
            <div className="front-system-tile">
              <span>Leitura visual</span>
              <strong>{snapshot.options.showHints ? "Assistida" : "Sem apoio"}</strong>
            </div>
          </div>

          <div className="front-inline-actions front-inline-actions-end">
            <button
              className="ghost"
              ref={(element) => {
                settingsRefs.current[4] = element;
              }}
              onClick={() => openMenuView("main")}
            >
              Voltar
            </button>
            <button onClick={() => void handleStartGame()}>Jogar agora</button>
          </div>
        </section>
      );
    }

    return (
      <section className="front-card front-card-hero">
        <div className="front-hero-copy">
          <p className="front-kicker">Setor inicial // {snapshot.introTitle}</p>
          <h2>{snapshot.introTitle}</h2>
          <p>{snapshot.introText}</p>

          <div className="front-stat-grid">
            {menuStats.map((item) => (
              <div key={item.label} className="front-stat-tile">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="front-brief-grid">
            <article className="front-brief-card">
              <span>Operativo selecionado</span>
              <strong>{selectedCharacter.name}</strong>
              <p>{selectedCharacter.title}</p>
            </article>
            <article className="front-brief-card">
              <span>Perfil</span>
              <strong>{selectedDossier.profile}</strong>
              <p>{selectedDossier.note}</p>
            </article>
            <article className="front-brief-card">
              <span>Fluxo</span>
              <strong>Menu, boot e fase</strong>
              <p>Ao clicar em jogar, o menu sai e a fase abre em tela cheia automaticamente.</p>
            </article>
          </div>

          <div className="front-inline-actions">
            <button onClick={() => void handleStartGame()}>Jogar</button>
            <button className="secondary" onClick={() => openMenuView("characters")}>
              Trocar personagem
            </button>
          </div>
        </div>

        <div className="front-hero-preview">
          <div className="front-character-shell" style={{ "--character-accent": selectedCharacter.accent } as CSSProperties}>
            <div className="front-character-glow" />
            <div
              className="front-character-sprite"
              style={{ "--sprite-sheet": `url(${selectedCharacter.animations.idle.path})` } as CSSProperties}
            />
          </div>

          <div className="front-preview-copy">
            <span>{selectedDossier.callsign}</span>
            <strong>{selectedCharacter.name}</strong>
            <p>{selectedDossier.note}</p>
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className={`fullscreen-shell${isMobile ? " is-mobile" : ""}${isMobileLandscape ? " is-mobile-landscape" : ""}`}>
      {isMobile && isPortrait && (
        <div className="portrait-warning" aria-live="polite">
          <div className="portrait-warning-icon">R</div>
          <strong>Vire o celular</strong>
          <p>O jogo foi refeito para ficar em tela cheia na horizontal.</p>
        </div>
      )}

      <div
        ref={canvasFrameRef}
        className={`game-stage${isFullscreen ? " is-native-fullscreen" : ""}${isMobileLandscape ? " game-stage-mobile-landscape" : ""}`}
      >
        <canvas ref={canvasRef} width={1280} height={720} onClick={() => canvasRef.current?.focus()} />

        {showFrontEnd && (
          <div className="front-overlay" onKeyDown={handleFrontKeyDown} onPointerDownCapture={() => void ensureFullscreen()}>
            <div className="front-grid-pattern" />
            <div className="front-orb front-orb-left" />
            <div className="front-orb front-orb-right" />

            <div className="front-layout">
              <aside className="front-sidebar">
                <div className="front-brand">
                  <p className="front-kicker">Menu principal</p>
                  <h1>THE LAST HOPE</h1>
                  <p>
                    Menu tradicional, personagem, configuracoes e fase abrindo sozinha em tela cheia quando voce
                    iniciar.
                  </p>
                </div>

                <nav className="classic-menu" aria-label="Navegacao principal">
                  {menuButtons.map((button, index) => (
                    <button
                      key={button.label}
                      ref={(element) => {
                        menuButtonRefs.current[index] = element;
                      }}
                      className={`classic-menu-button${menuView === "main" && index === 0 ? " is-primary" : ""}`}
                      onClick={button.action}
                    >
                      <strong>{button.label}</strong>
                      <small>{button.description}</small>
                    </button>
                  ))}
                </nav>

                <div className="front-sidebar-status">
                  <span>Status da tela</span>
                  <strong>{isFullscreen ? "FULLSCREEN" : "EM ESPERA"}</strong>
                  <p>{menuStatusText}</p>
                </div>

                <div className="front-sidebar-tabs" role="tablist" aria-label="Abas do menu">
                  <button
                    className={`front-tab${menuView === "main" ? " is-active" : ""}`}
                    onClick={() => openMenuView("main")}
                  >
                    Inicio
                  </button>
                  <button
                    className={`front-tab${menuView === "characters" ? " is-active" : ""}`}
                    onClick={() => openMenuView("characters")}
                    aria-label="Selecao de personagem"
                  >
                    Operativo
                  </button>
                  <button
                    className={`front-tab${menuView === "settings" ? " is-active" : ""}`}
                    onClick={() => openMenuView("settings")}
                    aria-label="Configuracoes"
                  >
                    Ajustes
                  </button>
                </div>
              </aside>

              <section className="front-panel">{renderMenuView()}</section>
            </div>
          </div>
        )}

        {snapshot.screen === "loading" && (
          <div className="boot-overlay">
            <div className="boot-card">
              <p className="front-kicker">Inicializacao</p>
              <h2>{snapshot.loadingTitle}</h2>
              <p>{snapshot.loadingSubtitle}</p>

              <div className="boot-character-row">
                <div
                  className="boot-character-stage"
                  style={{ "--character-accent": selectedCharacter.accent } as CSSProperties}
                >
                  <div className="front-character-glow" />
                  <div
                    className="front-character-sprite"
                    style={{ "--sprite-sheet": `url(${selectedCharacter.animations.idle.path})` } as CSSProperties}
                  />
                </div>

                <div className="boot-character-copy">
                  <span>{selectedDossier.callsign}</span>
                  <strong>{selectedCharacter.name}</strong>
                  <p>{selectedDossier.note}</p>
                </div>
              </div>

              <div className="boot-progress-track">
                <div className="boot-progress-fill" style={{ width: `${Math.round(snapshot.loadingProgress * 100)}%` }} />
              </div>

              <div className="boot-progress-meta">
                <span>Progresso do boot</span>
                <strong>{Math.round(snapshot.loadingProgress * 100)}%</strong>
              </div>

              <div className="boot-step-grid">
                {LOADING_STEPS.map((step, index) => (
                  <div key={step} className={`boot-step${index <= loadingStepIndex ? " is-active" : ""}`}>
                    <span>0{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {snapshot.screen === "transition" && (
          <div className="boot-overlay transition-overlay">
            <div className="boot-card transition-card">
              <p className="front-kicker">Proxima fase</p>
              <h2>{snapshot.transitionTitle}</h2>
              <p>{snapshot.transitionSubtitle}</p>
            </div>
          </div>
        )}

        {showInGameHud && (
          <div className="hud-overlay">
            <div className="hud-mission-card">
              <span>Objetivo</span>
              <strong>{snapshot.objectiveText}</strong>
            </div>

            <div className="hud-status-card">
              <div className="hud-status-head">
                <span>Energia</span>
                <strong>{Math.round(snapshot.playerEnergy)}%</strong>
              </div>
              <div className="hud-energy-track">
                <div
                  className="hud-energy-fill"
                  style={{
                    width: `${snapshot.playerEnergy}%`,
                    background: energyBarColor,
                    boxShadow: `0 0 18px ${energyBarColor}`
                  }}
                />
              </div>

              <div className="hud-status-head hud-status-head-compact">
                <span>Dash</span>
                <strong>{dashReady ? "PRONTO" : `${snapshot.playerDashCooldown.toFixed(1)}s`}</strong>
              </div>
              <div className="hud-dash-track">
                <div
                  className="hud-dash-fill"
                  style={{
                    width: `${dashProgress * 100}%`,
                    opacity: dashReady ? 0.65 + (Math.sin(uiTime * 4) * 0.5 + 0.5) * 0.35 : 1
                  }}
                />
              </div>

              <div className="hud-mini-grid">
                {gameplayStats.map((item) => (
                  <div key={item.label} className="hud-mini-tile">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {snapshot.debugFlyEnabled && (
              <div className="hud-pill hud-pill-warning">
                XITER ON | F desliga | X {snapshot.playerWorldX} Y {snapshot.playerWorldY}
              </div>
            )}

            {snapshot.interactionLabel && <div className="hud-pill">{snapshot.interactionLabel}</div>}
            {snapshot.narrativeText && <div className="hud-toast">{snapshot.narrativeText}</div>}

            {!isMobile && (
              <div className="hud-controls-card">
                <span>Controles</span>
                <div className="hud-controls-list">
                  <strong>
                    <b>A / D</b>
                    <small>mover</small>
                  </strong>
                  <strong>
                    <b>Espaco</b>
                    <small>pular</small>
                  </strong>
                  <strong>
                    <b>Shift</b>
                    <small>dash</small>
                  </strong>
                  <strong>
                    <b>E</b>
                    <small>interagir</small>
                  </strong>
                  <strong>
                    <b>Esc</b>
                    <small>pausa</small>
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}

        {isMobile && showInGameHud && (
          <div className="mobile-hud-strip">
            <div className="mobile-energy-wrap">
              <div className="mobile-energy-bar" style={{ width: `${snapshot.playerEnergy}%`, background: energyBarColor }} />
            </div>
            <span className="mobile-stat">
              {snapshot.generatorsActive}/{snapshot.generatorsTotal}
            </span>
            <span className="mobile-stat">
              {snapshot.collectibles}/{snapshot.collectibleTotal}
            </span>
            <span className="mobile-stat" style={{ color: dashReady ? "#a8f0ff" : "#9aa6b2" }}>
              {dashReady ? "DASH" : `${snapshot.playerDashCooldown.toFixed(1)}s`}
            </span>
          </div>
        )}

        {isMobile && snapshot.screen === "playing" && <TouchControls engineRef={engineRef} />}

        {snapshot.deathCauseTimer > 0 && snapshot.deathCause && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              opacity: deathOverlayOpacity,
              zIndex: 28
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
            <button className="secondary" onClick={handleReturnToMenu}>
              Voltar ao menu
            </button>
          </div>
        )}

        {snapshot.screen === "victory" && (
          <div className="victory-panel">
            <div className="front-card victory-card">
              <p className="front-kicker">Fase concluida</p>
              <h2>{snapshot.victoryTitle}</h2>
              <p>{snapshot.victoryText}</p>
              <div className="front-inline-actions">
                {snapshot.hasNextLevel ? (
                  <button onClick={() => engine?.startNextLevel()}>Proxima fase</button>
                ) : (
                  <button onClick={() => void handleStartGame()}>Jogar novamente</button>
                )}
                <button className="secondary" onClick={handleReturnToMenu}>
                  Menu inicial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
