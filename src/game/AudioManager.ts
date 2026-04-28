export class AudioManager {
  private sounds = new Map<string, HTMLAudioElement>();
  private musicVolume = 0.4;
  private sfxVolume = 0.7;
  private currentMusic: HTMLAudioElement | null = null;
  private currentMusicKey: string | null = null;
  private fadeInterval: number | null = null;

  preload(paths: Record<string, string>) {
    for (const [key, path] of Object.entries(paths)) {
      if (this.sounds.has(key)) {
        continue;
      }

      const audio = new Audio(path);
      audio.preload = "auto";
      audio.load();
      this.sounds.set(key, audio);
    }
  }

  play(key: string, opts?: { volume?: number; loop?: boolean; rate?: number }) {
    const base = this.sounds.get(key);
    if (!base) {
      return;
    }

    const clone = base.cloneNode(true) as HTMLAudioElement;
    clone.volume = (opts?.volume ?? 1) * this.sfxVolume;
    clone.loop = opts?.loop ?? false;
    if (opts?.rate) {
      clone.playbackRate = opts.rate;
    }
    void clone.play().catch(() => undefined);
  }

  playMusic(key: string) {
    const music = this.sounds.get(key);
    if (!music) {
      return;
    }

    if (this.fadeInterval !== null) {
      window.clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (this.currentMusicKey === key && this.currentMusic === music) {
      music.volume = this.musicVolume;
      music.loop = true;
      if (music.paused) {
        void music.play().catch(() => undefined);
      }
      return;
    }

    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }

    music.volume = this.musicVolume;
    music.loop = true;
    music.currentTime = 0;
    void music.play().catch(() => undefined);
    this.currentMusic = music;
    this.currentMusicKey = key;
  }

  fadeOutMusic(duration = 1.0) {
    if (!this.currentMusic) {
      return;
    }

    if (this.fadeInterval !== null) {
      window.clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const music = this.currentMusic;
    const step = music.volume / Math.max(1, duration * 60);
    this.fadeInterval = window.setInterval(() => {
      music.volume = Math.max(0, music.volume - step);
      if (music.volume <= 0) {
        music.pause();
        music.currentTime = 0;
        if (this.fadeInterval !== null) {
          window.clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        if (this.currentMusic === music) {
          this.currentMusic = null;
          this.currentMusicKey = null;
        }
      }
    }, 1000 / 60);
  }

  setMusicVolume(v: number) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume;
    }
  }

  setSFXVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }

  stopMusic() {
    if (this.fadeInterval !== null) {
      window.clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }

    this.currentMusic = null;
    this.currentMusicKey = null;
  }
}

export const audioManager = new AudioManager();
