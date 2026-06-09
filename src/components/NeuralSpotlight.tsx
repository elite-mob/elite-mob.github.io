import { useEffect, useRef } from 'react';

type Node = { x: number; y: number };

type Network = {
  nodes: Node[];
  edges: Array<[number, number]>;
};

const POINTER_EASE = 0.14;
const INFLUENCE_RADIUS = 210;
const EDGE_THRESHOLD = 0.04;
const NODE_THRESHOLD = 0.05;
const FADE_EASE = 0.08;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasCoarsePointer(): boolean {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function buildNetwork(width: number, height: number): Network {
  const spacing = Math.max(110, Math.min(width, height) / 6.5);
  const nodes: Node[] = [];

  for (let y = spacing * 0.55; y < height; y += spacing) {
    for (let x = spacing * 0.55; x < width; x += spacing) {
      nodes.push({
        x: x + (Math.random() - 0.5) * spacing * 0.32,
        y: y + (Math.random() - 0.5) * spacing * 0.32,
      });
    }
  }

  const connectDist = spacing * 1.45;
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
  return t * t * t;
}

/**
 * Desktop neural spotlight — synapse lines appear only near the cursor.
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
    let pointerInside = false;
    let visibility = 0;

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

    const tick = () => {
      const targetVisibility = pointerInside ? 1 : 0;
      visibility += (targetVisibility - visibility) * FADE_EASE;

      if (pointerInside && targetX >= 0) {
        currentX += (targetX - currentX) * POINTER_EASE;
        currentY += (targetY - currentY) * POINTER_EASE;
      }

      ctx.clearRect(0, 0, width, height);

      if (visibility < 0.02 || !pointerInside || currentX < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const lineHue = isDark ? 187 : 198;
      const bloomHue = isDark ? 187 : 192;
      const fade = visibility;

      for (const [a, b] of network.edges) {
        const nodeA = network.nodes[a];
        const nodeB = network.nodes[b];
        if (!nodeA || !nodeB) continue;

        const boost =
          (nodeActivation(nodeA, currentX, currentY) + nodeActivation(nodeB, currentX, currentY)) * 0.5;
        if (boost < EDGE_THRESHOLD) continue;

        const alpha = boost * 0.48 * fade;
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.strokeStyle = `hsla(${lineHue}, 72%, ${isDark ? 58 : 48}%, ${alpha})`;
        ctx.lineWidth = 0.7 + boost * 1.5;
        ctx.stroke();
      }

      for (const node of network.nodes) {
        const boost = nodeActivation(node, currentX, currentY);
        if (boost < NODE_THRESHOLD) continue;

        const alpha = boost * 0.92 * fade;
        const radius = 1.4 + boost * 2.8;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${lineHue}, 80%, 62%, ${boost * 0.18 * fade})`;
        ctx.arc(node.x, node.y, radius * 2.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `hsla(${lineHue}, 88%, ${isDark ? 70 : 52}%, ${alpha})`;
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const bloom = ctx.createRadialGradient(
        currentX,
        currentY,
        0,
        currentX,
        currentY,
        INFLUENCE_RADIUS * 0.85,
      );
      bloom.addColorStop(0, `hsla(${bloomHue}, 85%, ${isDark ? 72 : 58}%, ${0.12 * fade})`);
      bloom.addColorStop(0.4, `hsla(${bloomHue}, 80%, 58%, ${0.04 * fade})`);
      bloom.addColorStop(1, 'hsla(187, 80%, 58%, 0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.fillStyle = `hsla(${bloomHue}, 92%, ${isDark ? 78 : 62}%, ${0.7 * fade})`;
      ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      pointerInside = true;
      if (currentX < 0) {
        currentX = targetX;
        currentY = targetY;
      }
    };

    const onLeave = () => {
      pointerInside = false;
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
