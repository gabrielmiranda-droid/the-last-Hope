export type CharacterAnimation = {
  path: string;
  frames: number;
  fps: number;
};

export type CharacterOption = {
  id: string;
  name: string;
  title: string;
  preview: string;
  accent: string;
  tint: string;
  shadow: string;
  animations: {
    idle: CharacterAnimation;
    run: CharacterAnimation;
    jump: CharacterAnimation;
    dash: CharacterAnimation;
    hurt: CharacterAnimation;
    death: CharacterAnimation;
  };
};

export const CHARACTER_OPTIONS: CharacterOption[] = [
  {
    id: "zion",
    name: "Zion",
    title: "Explorador de Restauração",
    preview: "/assets/cyberpunk_chars/1%20Biker/Biker_idle.png",
    accent: "#5bc0eb",
    tint: "rgba(91, 192, 235, 0.16)",
    shadow: "rgba(91, 192, 235, 0.32)",
    animations: {
      idle: { path: "/assets/cyberpunk_chars/1%20Biker/Biker_idle.png", frames: 4, fps: 7 },
      run: { path: "/assets/cyberpunk_chars/1%20Biker/Biker_run.png", frames: 6, fps: 12 },
      jump: { path: "/assets/cyberpunk_chars/1%20Biker/Biker_jump.png", frames: 4, fps: 8 },
      dash: { path: "/assets/cyberpunk_chars/1%20Biker/Biker_doublejump.png", frames: 6, fps: 14 },
      hurt: { path: "/assets/cyberpunk_chars/1%20Biker/Biker_hurt.png", frames: 2, fps: 16 },
      death: { path: "/assets/cyberpunk_chars/1%20Biker/Biker_hurt.png", frames: 2, fps: 8 }
    }
  },
  {
    id: "kira",
    name: "Kira",
    title: "Corredora de Sistemas",
    preview: "/assets/cyberpunk_chars/2%20Punk/Punk_idle.png",
    accent: "#87d37c",
    tint: "rgba(135, 211, 124, 0.16)",
    shadow: "rgba(135, 211, 124, 0.32)",
    animations: {
      idle: { path: "/assets/cyberpunk_chars/2%20Punk/Punk_idle.png", frames: 4, fps: 7 },
      run: { path: "/assets/cyberpunk_chars/2%20Punk/Punk_run.png", frames: 6, fps: 12 },
      jump: { path: "/assets/cyberpunk_chars/2%20Punk/Punk_jump.png", frames: 4, fps: 8 },
      dash: { path: "/assets/cyberpunk_chars/2%20Punk/Punk_doublejump.png", frames: 6, fps: 14 },
      hurt: { path: "/assets/cyberpunk_chars/2%20Punk/Punk_hurt.png", frames: 2, fps: 16 },
      death: { path: "/assets/cyberpunk_chars/2%20Punk/Punk_hurt.png", frames: 2, fps: 8 }
    }
  },
  {
    id: "brad",
    name: "Brad",
    title: "Mecânico de Fronteira",
    preview: "/assets/cyberpunk_chars/3%20Cyborg/Cyborg_idle.png",
    accent: "#ffcc66",
    tint: "rgba(255, 204, 102, 0.16)",
    shadow: "rgba(255, 204, 102, 0.32)",
    animations: {
      idle: { path: "/assets/cyberpunk_chars/3%20Cyborg/Cyborg_idle.png", frames: 4, fps: 7 },
      run: { path: "/assets/cyberpunk_chars/3%20Cyborg/Cyborg_run.png", frames: 6, fps: 12 },
      jump: { path: "/assets/cyberpunk_chars/3%20Cyborg/Cyborg_jump.png", frames: 4, fps: 8 },
      dash: { path: "/assets/cyberpunk_chars/3%20Cyborg/Cyborg_doublejump.png", frames: 6, fps: 14 },
      hurt: { path: "/assets/cyberpunk_chars/3%20Cyborg/Cyborg_hurt.png", frames: 2, fps: 16 },
      death: { path: "/assets/cyberpunk_chars/3%20Cyborg/Cyborg_hurt.png", frames: 2, fps: 8 }
    }
  }
];

export const DEFAULT_CHARACTER_ID = CHARACTER_OPTIONS[0].id;

export function getCharacterOption(characterId: string) {
  return CHARACTER_OPTIONS.find((character) => character.id === characterId) ?? CHARACTER_OPTIONS[0];
}
