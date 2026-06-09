import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  star: boolean;
};

const MAX_PARTICLES = 260;
const HUES = [187, 198, 165, 45, 280, 210] as const;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasCoarsePointer(): boolean {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function spawnBurst(x: number, y: number, intensity: number, particles: Particle[]): void {
  const count = Math.round(18 + intensity * 16);
  const room = MAX_PARTICLES - particles.length;
  const spawnCount = Math.min(count, room);
  if (spawnCount <= 0) return;

  for (let i = 0; i < spawnCount; i += 1) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(2.2, 7.5) * (0.85 + intensity * 0.5);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - randomBetween(0.8, 2.8),
      life: 1,
      maxLife: randomBetween(42, 82),
      size: randomBetween(3.2, 6.8),
      hue: HUES[Math.floor(Math.random() * HUES.length)] ?? 187,
      star: Math.random() < 0.34,
    });
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  hue: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = `hsla(${hue}, 88%, 68%, ${alpha})`;
  ctx.fillRect(-radius, -radius * 0.35, radius * 2, radius * 0.7);
  ctx.fillRect(-radius * 0.35, -radius, radius * 0.7, radius * 2);
  ctx.restore();
}

/**
 * Viewport-level cursor fireworks — visible over hero and section overlays.
 */
export function PointerFireworks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || hasCoarsePointer()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let lastX = -1;
    let lastY = -1;
    let lastSpawn = 0;
    let pointerX = -1;
    let pointerY = -1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const tick = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= 1;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.vy += 0.07;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = (p.life / p.maxLife) * 1;
        if (p.star) {
          drawStar(ctx, p.x, p.y, p.size * 2.4, alpha * 0.35, p.hue);
          drawStar(ctx, p.x, p.y, p.size * 1.65, alpha, p.hue);
        } else {
          ctx.beginPath();
          ctx.fillStyle = `hsla(${p.hue}, 88%, 58%, ${alpha * 0.35})`;
          ctx.arc(p.x, p.y, p.size * 1.65, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = `hsla(${p.hue}, 90%, 62%, ${alpha})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = `hsla(${p.hue}, 95%, 82%, ${alpha * 0.7})`;
          ctx.arc(p.x, p.y, p.size * 0.42, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (pointerX >= 0 && pointerY >= 0 && particles.length < MAX_PARTICLES - 2) {
        particles.push({
          x: pointerX,
          y: pointerY,
          vx: randomBetween(-0.5, 0.5),
          vy: randomBetween(-0.75, -0.15),
          life: 18,
          maxLife: 18,
          size: 3.2,
          hue: 187,
          star: false,
        });
      }

      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      const now = performance.now();
      const dx = lastX < 0 ? 999 : pointerX - lastX;
      const dy = lastY < 0 ? 999 : pointerY - lastY;
      const dist = Math.hypot(dx, dy);
      const elapsed = now - lastSpawn;

      if (dist > 8 || elapsed > 70) {
        const intensity = Math.min(1.2, dist / 40);
        spawnBurst(pointerX, pointerY, intensity, particles);
        lastX = pointerX;
        lastY = pointerY;
        lastSpawn = now;
      }
    };

    const onLeave = () => {
      pointerX = -1;
      pointerY = -1;
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    document.body.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.body.removeEventListener('mouseleave', onLeave);
      particles.length = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-fireworks print:hidden"
      aria-hidden
    />
  );
}
