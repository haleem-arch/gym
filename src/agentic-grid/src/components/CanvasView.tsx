'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useSim } from '@/lib/SimulationContext';
import { Agent, DataWell, Hub, QuantumFissure, CameraState } from '@/lib/types';
import { vec } from '@/lib/vecMath';

// ─── Color constants ─────────────────────────────────────────
const C = {
  teal:    '#00F5D4',
  crimson: '#FF0055',
  violet:  '#7B2CBF',
  amber:   '#F59E0B',
  charcoal:'#242427',
  bg:      '#030303',
  surface: '#0F0F11',
};

function stateColor(state: string): string {
  switch (state) {
    case 'Routing':    return C.teal;
    case 'Harvesting': return C.amber;
    case 'Docking':    return C.violet;
    case 'Stalled':    return C.crimson;
    case 'Dead':       return C.charcoal;
    default:           return '#888';
  }
}

interface PointerState {
  isDragging: boolean;
  lastX: number;
  lastY: number;
}

export default function CanvasView() {
  const { engine } = useSim();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<PointerState>({ isDragging: false, lastX: 0, lastY: 0 });
  const rafRef = useRef<number>(0);

  // Pan/Zoom handlers
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const cam = engine.getState().camera;
    const delta = e.deltaY > 0 ? 0.92 : 1.09;
    const newZoom = Math.max(0.15, Math.min(3.5, cam.targetZoom * delta));
    engine.getState().camera.targetZoom = newZoom;
  }, [engine]);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    pointerRef.current = { isDragging: true, lastX: e.clientX, lastY: e.clientY };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const p = pointerRef.current;
    if (!p.isDragging) return;
    const cam = engine.getState().camera;
    const dx = (e.clientX - p.lastX) / cam.zoom;
    const dy = (e.clientY - p.lastY) / cam.zoom;
    cam.targetX -= dx;
    cam.targetY -= dy;
    cam.x -= dx;
    cam.y -= dy;
    p.lastX = e.clientX;
    p.lastY = e.clientY;
  }, [engine]);

  const handlePointerUp = useCallback(() => {
    pointerRef.current.isDragging = false;
  }, []);

  // Click to focus on agent
  const handleClick = useCallback((e: MouseEvent) => {
    if (pointerRef.current.isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cam = engine.getState().camera;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const wx = (e.clientX - rect.left - cx) / cam.zoom + cam.x;
    const wy = (e.clientY - rect.top - cy) / cam.zoom + cam.y;

    let clicked: Agent | null = null;
    let minDist = 25;
    for (const agent of engine.getState().agents) {
      if (agent.state === 'Dead') continue;
      const d = vec.dist({ x: wx, y: wy }, agent.pos);
      if (d < minDist) { minDist = d; clicked = agent; }
    }

    if (clicked) {
      engine.focusAgent(clicked.id);
    } else {
      engine.resetCamera();
    }
  }, [engine]);

  // Attach events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('click', handleClick);
    };
  }, [handleWheel, handlePointerDown, handlePointerMove, handlePointerUp, handleClick]);

  // Rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function render(_timestamp: number) {
      if (!canvas || !ctx) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const state = engine.getState();
      const cam = state.camera;
      const t = state.elapsed;

      ctx.save();
      // Background
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);

      // Grid
      drawGrid(ctx, W, H, cam);

      // World transform
      ctx.translate(W / 2, H / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x, -cam.y);

      // Draw fissures (behind everything)
      for (const f of state.fissures) {
        drawFissure(ctx, f, t);
      }

      // Draw data wells
      for (const well of state.dataWells) {
        drawDataWell(ctx, well, t);
      }

      // Draw hubs
      for (const hub of state.hubs) {
        drawHub(ctx, hub, t);
      }

      // Draw communication links
      drawCommunicationLinks(ctx, state.agents, t);

      // Draw agent trails
      for (const agent of state.agents) {
        if (agent.state === 'Dead') continue;
        drawTrail(ctx, agent);
      }

      // Draw agents
      for (const agent of state.agents) {
        drawAgent(ctx, agent, agent.id === state.selectedAgentId, t);
      }

      ctx.restore();

      // HUD Overlay: FPS / tick
      drawHUD(ctx, W, H, state.tick, t);

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'crosshair',
        background: C.bg,
      }}
    />
  );
}

// ─── Draw Functions ───────────────────────────────────────────

function drawGrid(ctx: CanvasRenderingContext2D, W: number, H: number, cam: CameraState) {
  const gridSpacing = 60 * cam.zoom;
  const offsetX = ((-cam.x * cam.zoom) + W / 2) % gridSpacing;
  const offsetY = ((-cam.y * cam.zoom) + H / 2) % gridSpacing;

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();

  for (let x = offsetX; x < W; x += gridSpacing) {
    ctx.moveTo(x, 0); ctx.lineTo(x, H);
  }
  for (let y = offsetY; y < H; y += gridSpacing) {
    ctx.moveTo(0, y); ctx.lineTo(W, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawFissure(ctx: CanvasRenderingContext2D, f: QuantumFissure, t: number) {
  const { pos, eventHorizonRadius, pullRadius, phase } = f;
  const warpAmt = Math.sin(t * 2.5 + phase) * 0.15 + 1;

  // Outer pull gradient
  const outerGrad = ctx.createRadialGradient(pos.x, pos.y, eventHorizonRadius, pos.x, pos.y, pullRadius * 1.2);
  outerGrad.addColorStop(0, 'rgba(255,0,85,0.12)');
  outerGrad.addColorStop(0.6, 'rgba(255,0,85,0.03)');
  outerGrad.addColorStop(1, 'rgba(255,0,85,0)');
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, pullRadius * 1.2, 0, Math.PI * 2);
  ctx.fillStyle = outerGrad;
  ctx.fill();

  // Ripple rings
  for (let i = 0; i < 4; i++) {
    const ripplePhase = (t * 0.8 + i * 0.7 + phase) % (Math.PI * 2);
    const rippleR = eventHorizonRadius + (pullRadius - eventHorizonRadius) * (i / 4) + Math.sin(ripplePhase) * 8;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, rippleR * warpAmt, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,0,85,${0.15 - i * 0.03})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Event horizon core
  const coreGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, eventHorizonRadius * warpAmt);
  coreGrad.addColorStop(0,   'rgba(10,0,5,1)');
  coreGrad.addColorStop(0.5, 'rgba(80,0,30,0.9)');
  coreGrad.addColorStop(1,   'rgba(255,0,85,0.5)');
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, eventHorizonRadius * warpAmt, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();

  // Border glow
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, eventHorizonRadius * warpAmt, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255,0,85,${0.5 + Math.sin(t * 3) * 0.2})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Label
  ctx.fillStyle = 'rgba(255,0,85,0.7)';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(f.id, pos.x, pos.y + eventHorizonRadius + 14);
}

function drawDataWell(ctx: CanvasRenderingContext2D, well: DataWell, t: number) {
  const { pos, radius, pulsePhase, energy, maxEnergy } = well;
  const energyRatio = energy / maxEnergy;
  const pulse = Math.sin(t * 2 + pulsePhase) * 0.4 + 0.6;

  // Outer aura
  const auraR = radius * (2.5 + pulse * 1.5);
  const auraGrad = ctx.createRadialGradient(pos.x, pos.y, radius, pos.x, pos.y, auraR);
  auraGrad.addColorStop(0, `rgba(0,245,212,${0.12 * energyRatio * pulse})`);
  auraGrad.addColorStop(1, 'rgba(0,245,212,0)');
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, auraR, 0, Math.PI * 2);
  ctx.fillStyle = auraGrad;
  ctx.fill();

  // Pulsing ring
  for (let i = 0; i < 2; i++) {
    const ringPhase = (t * 1.5 + pulsePhase + i * Math.PI) % (Math.PI * 2);
    const ringR = radius + 8 + Math.sin(ringPhase) * 6;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,245,212,${0.3 * energyRatio})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // Core fill
  const coreGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
  coreGrad.addColorStop(0, `rgba(0,245,212,${0.9 * energyRatio})`);
  coreGrad.addColorStop(0.6, `rgba(0,180,155,${0.6 * energyRatio})`);
  coreGrad.addColorStop(1, `rgba(0,100,90,${0.3 * energyRatio})`);
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius * pulse, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();

  // Particle data emission
  const numParticles = 5;
  for (let i = 0; i < numParticles; i++) {
    const pAngle = (t * 0.8 + (i / numParticles) * Math.PI * 2 + pulsePhase);
    const pDist = radius + (t * 20 * energyRatio + i * 10) % (radius * 3);
    const px = pos.x + Math.cos(pAngle) * pDist;
    const py = pos.y + Math.sin(pAngle) * pDist;
    const pAlpha = Math.max(0, 1 - pDist / (radius * 3));
    ctx.beginPath();
    ctx.arc(px, py, 1.5 * energyRatio, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,245,212,${pAlpha * 0.8 * energyRatio})`;
    ctx.fill();
  }

  // Label
  ctx.fillStyle = `rgba(0,245,212,${0.6 + pulse * 0.3})`;
  ctx.font = '8px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(well.id, pos.x, pos.y + radius + 14);
  ctx.fillText(`${Math.floor(energyRatio * 100)}%`, pos.x, pos.y + radius + 24);
}

function drawHub(ctx: CanvasRenderingContext2D, hub: Hub, t: number) {
  const { pos, radius } = hub;
  const pulse = Math.sin(t * 1.2) * 0.3 + 0.7;

  // Glow
  const glowGrad = ctx.createRadialGradient(pos.x, pos.y, radius, pos.x, pos.y, radius * 3.5);
  glowGrad.addColorStop(0, 'rgba(123,44,191,0.15)');
  glowGrad.addColorStop(1, 'rgba(123,44,191,0)');
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius * 3.5, 0, Math.PI * 2);
  ctx.fillStyle = glowGrad;
  ctx.fill();

  // Rotating hexagonal ring
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(t * 0.4);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const r = radius + 10;
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.strokeStyle = `rgba(123,44,191,${0.5 * pulse})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Core
  const coreGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
  coreGrad.addColorStop(0, 'rgba(200,150,255,0.9)');
  coreGrad.addColorStop(0.5, 'rgba(123,44,191,0.8)');
  coreGrad.addColorStop(1, 'rgba(60,10,100,0.7)');
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(200,150,255,${0.5 + pulse * 0.4})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Cross/plus icon
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pos.x - 8, pos.y); ctx.lineTo(pos.x + 8, pos.y);
  ctx.moveTo(pos.x, pos.y - 8); ctx.lineTo(pos.x, pos.y + 8);
  ctx.stroke();

  // Label
  ctx.fillStyle = 'rgba(200,150,255,0.8)';
  ctx.font = 'bold 8px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(hub.name, pos.x, pos.y + radius + 14);
}

function drawCommunicationLinks(ctx: CanvasRenderingContext2D, agents: Agent[], t: number) {
  const COMM_RADIUS = 150;
  const liveAgents = agents.filter(a => a.state !== 'Dead');

  for (let i = 0; i < liveAgents.length; i++) {
    for (let j = i + 1; j < liveAgents.length; j++) {
      const a = liveAgents[i];
      const b = liveAgents[j];
      const d = vec.dist(a.pos, b.pos);
      if (d >= COMM_RADIUS) continue;

      const alpha = (1 - d / COMM_RADIUS) * 0.45;

      // Glowing link line
      const grad = ctx.createLinearGradient(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
      grad.addColorStop(0, `rgba(0,245,212,${alpha})`);
      grad.addColorStop(0.5, `rgba(123,44,191,${alpha * 1.5})`);
      grad.addColorStop(1, `rgba(0,245,212,${alpha})`);

      ctx.beginPath();
      ctx.moveTo(a.pos.x, a.pos.y);
      ctx.lineTo(b.pos.x, b.pos.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Animated data packet along link
      const progress = (t * 0.6) % 1;
      const px = a.pos.x + (b.pos.x - a.pos.x) * progress;
      const py = a.pos.y + (b.pos.y - a.pos.y) * progress;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,212,${alpha * 2.5})`;
      ctx.fill();

      // Reverse packet
      const progress2 = (t * 0.6 + 0.5) % 1;
      const px2 = a.pos.x + (b.pos.x - a.pos.x) * progress2;
      const py2 = a.pos.y + (b.pos.y - a.pos.y) * progress2;
      ctx.beginPath();
      ctx.arc(px2, py2, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(123,44,191,${alpha * 2})`;
      ctx.fill();
    }
  }
}

function drawTrail(ctx: CanvasRenderingContext2D, agent: Agent) {
  const trail = agent.trailPositions;
  if (trail.length < 2) return;
  const color = stateColor(agent.state);

  for (let i = 0; i < trail.length - 1; i++) {
    const p = trail[i];
    const fadeAlpha = Math.max(0, (1 - p.age / 1.5)) * 0.55;
    const size = (1 - p.age / 1.5) * 2.5;

    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.3, size), 0, Math.PI * 2);
    ctx.fillStyle = color.replace(')', `,${fadeAlpha})`).replace('rgb(', 'rgba(');
    // Simpler approach:
    ctx.fillStyle = hexWithAlpha(color, fadeAlpha);
    ctx.fill();
  }
}

function drawAgent(ctx: CanvasRenderingContext2D, agent: Agent, selected: boolean, t: number) {
  const { pos, state, tokens, maxTokens } = agent;
  const color = stateColor(state);
  const tokenRatio = tokens / maxTokens;
  const isDead = state === 'Dead';
  const pulse = Math.sin(t * 3 + pos.x * 0.01) * 0.2 + 0.8;
  const radius = isDead ? 5 : 8;

  if (isDead) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(36,36,39,0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,80,85,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    return;
  }

  // Selection ring
  if (selected) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius + 14, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,245,212,${0.5 + pulse * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dashed selection ring
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(t * 1.5);
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, radius + 20, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,245,212,0.3)`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Outer glow
  const glowGrad = ctx.createRadialGradient(pos.x, pos.y, radius * 0.5, pos.x, pos.y, radius * 3.5);
  glowGrad.addColorStop(0, hexWithAlpha(color, 0.2 * pulse));
  glowGrad.addColorStop(1, hexWithAlpha(color, 0));
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius * 3.5, 0, Math.PI * 2);
  ctx.fillStyle = glowGrad;
  ctx.fill();

  // Agent body
  const bodyGrad = ctx.createRadialGradient(pos.x - 2, pos.y - 2, 0, pos.x, pos.y, radius);
  bodyGrad.addColorStop(0, hexWithAlpha(color, 1));
  bodyGrad.addColorStop(0.5, hexWithAlpha(color, 0.8));
  bodyGrad.addColorStop(1, hexWithAlpha(color, 0.3));
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Agent border
  ctx.strokeStyle = hexWithAlpha(color, 0.9);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Token health arc (outer arc)
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + tokenRatio * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius + 4, startAngle, endAngle);
  ctx.strokeStyle = tokenRatio > 0.5 ? C.teal : tokenRatio > 0.25 ? C.amber : C.crimson;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Direction indicator
  const angle = Math.atan2(agent.vel.y, agent.vel.x);
  const tipX = pos.x + Math.cos(angle) * (radius + 6);
  const tipY = pos.y + Math.sin(angle) * (radius + 6);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  ctx.lineTo(tipX, tipY);
  ctx.strokeStyle = hexWithAlpha(color, 0.7);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Name label
  ctx.fillStyle = 'rgba(232,232,236,0.75)';
  ctx.font = '7px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(agent.name.replace('AGENT_', ''), pos.x, pos.y - radius - 5);
}

function drawHUD(ctx: CanvasRenderingContext2D, W: number, H: number, tick: number, _elapsed: number) {
  // Corner decorators
  const decorLen = 12;
  ctx.strokeStyle = 'rgba(0,245,212,0.3)';
  ctx.lineWidth = 1;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(8, 8 + decorLen); ctx.lineTo(8, 8); ctx.lineTo(8 + decorLen, 8);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(W - 8, 8 + decorLen); ctx.lineTo(W - 8, 8); ctx.lineTo(W - 8 - decorLen, 8);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(8, H - 8 - decorLen); ctx.lineTo(8, H - 8); ctx.lineTo(8 + decorLen, H - 8);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(W - 8, H - 8 - decorLen); ctx.lineTo(W - 8, H - 8); ctx.lineTo(W - 8 - decorLen, H - 8);
  ctx.stroke();

  // Tick counter
  ctx.fillStyle = 'rgba(0,245,212,0.35)';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`TICK: ${tick.toString().padStart(8, '0')}`, 16, H - 14);

  ctx.textAlign = 'right';
  ctx.fillText(`ZOOM: SCROLL  │  PAN: DRAG  │  FOCUS: CLICK AGENT`, W - 16, H - 14);
}

// ─── Utility ─────────────────────────────────────────────────
function hexWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
}
