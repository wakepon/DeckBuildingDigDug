import { Container, Graphics } from 'pixi.js';
import {
  PARTICLE_COUNT,
  PARTICLE_SPEED_MIN,
  PARTICLE_SPEED_MAX,
  PARTICLE_LIFETIME,
  PARTICLE_SIZE_MIN,
  PARTICLE_SIZE_MAX,
} from './constants';

interface Particle {
  graphics: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export class ParticleManager {
  public container: Container;
  private particles: Particle[] = [];

  constructor() {
    this.container = new Container();
  }

  emit(x: number, y: number, color: number): void {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.createParticle(x, y, color);
    }
  }

  private createParticle(x: number, y: number, color: number): void {
    const angle = Math.random() * Math.PI * 2;
    const speed = PARTICLE_SPEED_MIN + Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN);
    const size = PARTICLE_SIZE_MIN + Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN);

    const graphics = new Graphics();

    // Draw particle as rectangle (debris)
    graphics.rect(-size / 2, -size / 2, size, size);
    graphics.fill(color);

    // Add highlight
    graphics.rect(-size / 2, -size / 2, size / 2, size / 2);
    graphics.fill({ color: 0xffffff, alpha: 0.3 });

    graphics.x = x;
    graphics.y = y;

    const particle: Particle = {
      graphics,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50, // Initial upward boost
      life: PARTICLE_LIFETIME,
      maxLife: PARTICLE_LIFETIME,
      size,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 10,
    };

    this.particles.push(particle);
    this.container.addChild(graphics);
  }

  update(deltaTime: number): void {
    const gravity = 400; // pixels per second squared

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update physics
      p.vy += gravity * deltaTime;
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.rotation += p.rotationSpeed * deltaTime;
      p.life -= deltaTime;

      // Update graphics
      p.graphics.x = p.x;
      p.graphics.y = p.y;
      p.graphics.rotation = p.rotation;

      // Fade out
      const lifeRatio = p.life / p.maxLife;
      p.graphics.alpha = lifeRatio;
      p.graphics.scale.set(0.5 + lifeRatio * 0.5);

      // Remove dead particles
      if (p.life <= 0) {
        this.container.removeChild(p.graphics);
        p.graphics.destroy();
        this.particles.splice(i, 1);
      }
    }
  }
}
