type ParticleRange = [number, number];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
};

type EmitOptions = {
  count: number;
  color: string | string[];
  speedX?: ParticleRange;
  speedY?: ParticleRange;
  size?: ParticleRange;
  life?: ParticleRange;
  gravity?: number;
};

export class ParticleSystem {
  private particles: Particle[] = [];

  emit(x: number, y: number, opts: EmitOptions) {
    const colors = Array.isArray(opts.color) ? opts.color : [opts.color];
    const speedX = opts.speedX ?? [-40, 40];
    const speedY = opts.speedY ?? [-40, 0];
    const size = opts.size ?? [2, 4];
    const life = opts.life ?? [0.2, 0.4];
    const gravity = opts.gravity ?? 0;
    const randomRange = ([min, max]: ParticleRange) => min + Math.random() * (max - min);

    for (let i = 0; i < opts.count; i += 1) {
      const particleLife = randomRange(life);
      this.particles.push({
        x,
        y,
        vx: randomRange(speedX),
        vy: randomRange(speedY),
        life: particleLife,
        maxLife: particleLife,
        size: randomRange(size),
        color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0] ?? "#ffffff",
        gravity
      });
    }
  }

  update(dt: number) {
    this.particles = this.particles.filter((particle) => particle.life > 0);

    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += particle.gravity * dt;
      particle.life -= dt;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const particle of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
  }
}

export const particles = new ParticleSystem();
