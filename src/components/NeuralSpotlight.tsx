import { useEffect, useRef } from 'react';

type Node = { x: number; y: number };

type Network = {
  nodes: Node[];
  edges: Array<[number, number]>;
};

const POINTER_EASE = 0.12;
const INFLUENCE_RADIUS = 260;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasCoarsePointer(): boolean {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function buildNetwork(width: number, height: number): Network {
  const spacing = Math.max(96, Math.min(width, height) / 7.5);
  const nodes: Node[] = [];

  for (let y = spacing * 0.55; y < height; y += spacing) {
    for (let x = spacing * 0.55; x < width; x += spacing) {
      nodes.push({
        x: x + (Math.random() - 0.5) * spacing * 0.38,
        y: y + (Math.random() - 0.5) * spacing * 0.38,
      });
    }
  }

  const connectDist = spacing * 1.55;
  const edges: Array<[number, number]> = [];

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      if (Math.hypot(dx, dy) <= connectDist) {
        edges.push([i, j]);
      }
    }
  }

  return { nodes, edges };
}

function nodeActivation(node: Node, px: number, py: number): number {
  const distance = Math.hypot(node.x - px, node.y - py);
  if (distance >= INFLUENCE_RADIUS) return 0;
  const t = 1 - distance / INFLUENCE_RADIUS;
  return t * t;
}

/**
 * Desktop neural-field spotlight — synapse network brightens toward the cursor.
 */
export function NeuralSpotlight() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || hasCoarsePointer()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let network: Network = { nodes: [], edges: [] };
    let targetX = -1;
    let targetY = -1;
    let currentX = -1;
    let currentY = -1;
    let active = false;
    let time = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      network = buildNetwork(width, height);
    };

    const tick = (now: number) => {
      time = now;

      if (active && targetX >= 0) {
        currentX += (targetX - currentX) * POINTER_EASE;
        currentY += (targetY - currentY) * POINTER_EASE;
      }

      const pulse = 0.55 + Math.sin(now * 0.0012) * 0.12;
      const isDark = document.documentElement.classList.contains('dark');
      const lineHue = isDark ? 187 : 198;
      const bloomHue = isDark ? 187 : 192;

      ctx.clearRect(0, 0, width, height);

      for (const [a, b] of network.edges) {
        const nodeA = network.nodes[a];
        const nodeB = network.nodes[b];
        if (!nodeA || !nodeB) continue;

        const boost = active
          ? (nodeActivation(nodeA, currentX, currentY) + nodeActivation(nodeB, currentX, currentY)) * 0.5
          : 0;
        const alpha = 0.05 * pulse + boost * 0.42;
        if (alpha < 0.03) continue;

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.strokeStyle = `hsla(${lineHue}, 72%, ${isDark ? 58 : 48}%, ${alpha})`;
        ctx.lineWidth = 0.8 + boost * 1.4;
        ctx.stroke();
      }

      for (const node of network.nodes) {
        const boost = active ? nodeActivation(node, currentX, currentY) : 0;
        const alpha = 0.14 * pulse + boost * 0.9;
        const radius = 1.6 + boost * 3.2;

        if (boost > 0.08) {
          ctx.beginPath();
          ctx.fillStyle = `hsla(${lineHue}, 80%, 62%, ${boost * 0.22})`;
          ctx.arc(node.x, node.y, radius * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = `hsla(${lineHue}, 88%, ${isDark ? 68 : 52}%, ${alpha})`;
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (active && currentX >= 0) {
        const bloom = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, INFLUENCE_RADIUS * 0.9);
        bloom.addColorStop(0, `hsla(${bloomHue}, 85%, ${isDark ? 72 : 58}%, 0.14)`);
        bloom.addColorStop(0.35, `hsla(${bloomHue}, 80%, 58%, 0.06)`);
        bloom.addColorStop(1, 'hsla(187, 80%, 58%, 0)');
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, width, height);

        ctx.beginPath();
        ctx.fillStyle = `hsla(${bloomHue}, 92%, ${isDark ? 78 : 62}%, 0.75)`;
        ctx.arc(currentX, currentY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `hsla(${bloomHue}, 90%, 68%, 0.25)`;
        ctx.arc(currentX, currentY, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!active) {
        currentX = targetX;
        currentY = targetY;
      }
      active = true;
    };

    const onLeave = () => {
      active = false;
      targetX = -1;
      targetY = -1;
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
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="neural-spotlight print:hidden"
      aria-hidden
    />
  );
}
