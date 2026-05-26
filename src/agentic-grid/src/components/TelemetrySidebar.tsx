'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSim } from '@/lib/SimulationContext';
import { Agent, AgentState } from '@/lib/types';
import { formatTime } from '@/lib/vecMath';
import {
  Activity, Zap, AlertTriangle, Plus, RefreshCw,
  ChevronDown, ChevronUp, Circle
} from 'lucide-react';

const STATE_COLORS: Record<AgentState, string> = {
  Idle:       'rgba(232,232,236,0.45)',
  Routing:    '#00F5D4',
  Harvesting: '#F59E0B',
  Stalled:    '#FF0055',
  Dead:       '#3a3a3d',
  Docking:    '#7B2CBF',
};

const TIME_SCALES = [0.5, 1, 2.5, 5] as const;

export default function TelemetrySidebar() {
  const { displayState, focusAgent, resetCamera, setTimeScale, triggerShock, spawnAgent } = useSim();
  const { agents, metrics, systemLogs, elapsed } = displayState;
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [localTimeScale, setLocalTimeScale] = useState(1);

  // Heartbeat canvas
  const heartbeatRef = useRef<HTMLCanvasElement>(null);
  const heartbeatPhaseRef = useRef(0);
  useEffect(() => {
    const canvas = heartbeatRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;

    function drawHeartbeat() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      heartbeatPhaseRef.current += 0.04;
      const phase = heartbeatPhaseRef.current;

      // Draw line
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const t = (x / W) * Math.PI * 6 + phase;
        // ECG-like waveform
        let y = H / 2;
        const seg = (x / W * 6) % 1;
        if (seg > 0.3 && seg < 0.4) y = H / 2 - Math.sin((seg - 0.3) / 0.1 * Math.PI) * (H * 0.35);
        else if (seg > 0.4 && seg < 0.45) y = H / 2 + Math.sin((seg - 0.4) / 0.05 * Math.PI) * (H * 0.15);
        else y = H / 2 + Math.sin(t * 0.5) * (H * 0.06);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, 'rgba(0,245,212,0)');
      grad.addColorStop(0.3, 'rgba(0,245,212,0.8)');
      grad.addColorStop(0.7, 'rgba(0,245,212,0.8)');
      grad.addColorStop(1, 'rgba(0,245,212,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Scanning dot
      const dotX = ((phase * 15) % W + W) % W;
      ctx.beginPath();
      ctx.arc(dotX, H / 2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00F5D4';
      ctx.fill();

      raf = requestAnimationFrame(drawHeartbeat);
    }

    raf = requestAnimationFrame(drawHeartbeat);
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleTimeScale(scale: number) {
    setLocalTimeScale(scale);
    setTimeScale(scale);
  }

  function handleAgentClick(agent: Agent) {
    focusAgent(agent.id);
    setExpandedAgentId(prev => prev === agent.id ? null : agent.id);
  }

  return (
    <aside style={{
      width: '420px',
      minWidth: '420px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0F0F11',
      borderRight: '1px solid rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      {/* ── Header ─────────────────────────────── */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Activity size={14} color="#00F5D4" />
          <span style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(0,245,212,0.7)', fontWeight: 600 }}>
            TELEMETRY CONTROL
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(232,232,236,0.3)' }}>
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Heartbeat */}
        <canvas
          ref={heartbeatRef}
          width={380}
          height={36}
          style={{
            width: '100%',
            height: 36,
            marginTop: 8,
            borderRadius: 4,
            background: 'rgba(0,0,0,0.3)',
          }}
        />

        {/* System health pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <Pill label="ACTIVE" value={metrics.activeAgentCount} color="#00F5D4" />
          <Pill label="DEAD" value={metrics.deadAgentCount} color="#FF0055" />
          <Pill label="STALLED" value={metrics.stalledAgentCount} color="#F59E0B" />
        </div>
      </div>

      {/* ── System Controls ─────────────────────── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexShrink: 0,
      }}>
        <SectionLabel icon={<Zap size={11} />} text="SIMULATION CONTROLS" />

        {/* Time scale */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {TIME_SCALES.map(s => (
            <button
              key={s}
              onClick={() => handleTimeScale(s)}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 4,
                border: `1px solid ${localTimeScale === s ? 'rgba(0,245,212,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: localTimeScale === s ? 'rgba(0,245,212,0.1)' : 'rgba(255,255,255,0.02)',
                color: localTimeScale === s ? '#00F5D4' : 'rgba(232,232,236,0.4)',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <ActionButton
            icon={<AlertTriangle size={12} />}
            label="SYSTEM SHOCK"
            color="#FF0055"
            onClick={triggerShock}
          />
          <ActionButton
            icon={<Plus size={12} />}
            label="SPAWN AGENT"
            color="#7B2CBF"
            onClick={spawnAgent}
          />
          <ActionButton
            icon={<RefreshCw size={12} />}
            label="RESET CAM"
            color="rgba(232,232,236,0.4)"
            onClick={resetCamera}
          />
        </div>
      </div>

      {/* ── Macro Metrics ───────────────────────── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexShrink: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}>
        <MetricTile
          label="TOKEN VELOCITY"
          value={`${metrics.totalTokenVelocity.toFixed(0)}`}
          unit="T/s"
          color="#00F5D4"
        />
        <MetricTile
          label="CROSS ENTROPY"
          value={`${(metrics.crossEntropy * 100).toFixed(1)}`}
          unit="%"
          color="#7B2CBF"
        />
        <MetricTile
          label="ALLOC EFFICIENCY"
          value={`${metrics.allocationEfficiency.toFixed(1)}`}
          unit="%"
          color="#F59E0B"
        />
        <MetricTile
          label="TIME SCALE"
          value={`${displayState.timeScale}`}
          unit="×"
          color="#00F5D4"
        />
      </div>

      {/* ── Agent Inspector List ─────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        <SectionLabel icon={<Circle size={11} />} text="AGENT DIAGNOSTICS" />
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isExpanded={expandedAgentId === agent.id}
              isSelected={displayState.selectedAgentId === agent.id}
              onClick={() => handleAgentClick(agent)}
            />
          ))}
        </div>
      </div>

      {/* ── System Log ──────────────────────────── */}
      <div style={{
        height: 140,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(0,0,0,0.3)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          padding: '8px 12px 4px',
          fontSize: 9,
          letterSpacing: '0.12em',
          color: 'rgba(0,245,212,0.5)',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
        }}>
          ▸ SYSTEM LOG
        </div>
        <div style={{
          height: 108,
          overflowY: 'auto',
          padding: '4px 12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {systemLogs.slice(0, 30).map(log => (
            <div key={log.id} style={{
              fontSize: 9,
              lineHeight: 1.5,
              fontFamily: 'JetBrains Mono, monospace',
              color: log.level === 'error' ? '#FF0055'
                : log.level === 'success' ? '#00F5D4'
                : log.level === 'warn' ? '#F59E0B'
                : 'rgba(232,232,236,0.45)',
            }}>
              {log.message}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </aside>
  );
}

// ── Sub-components ────────────────────────────────────────────

function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      flex: 1,
      padding: '5px 8px',
      borderRadius: 4,
      background: 'rgba(0,0,0,0.3)',
      border: `1px solid ${color}22`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: 8, color: 'rgba(232,232,236,0.35)', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: 'rgba(0,245,212,0.5)' }}>{icon}</span>
      <span style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(232,232,236,0.3)', fontWeight: 600 }}>{text}</span>
    </div>
  );
}

function ActionButton({ icon, label, color, onClick }: {
  icon: React.ReactNode; label: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 4px',
        borderRadius: 6,
        border: `1px solid ${color}33`,
        background: `${color}08`,
        color,
        fontSize: 8,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.08em',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = `${color}18`;
        (e.currentTarget as HTMLElement).style.borderColor = `${color}66`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = `${color}08`;
        (e.currentTarget as HTMLElement).style.borderColor = `${color}33`;
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function MetricTile({ label, value, unit, color }: {
  label: string; value: string; unit: string; color: string;
}) {
  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: 6,
      background: 'rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ fontSize: 8, color: 'rgba(232,232,236,0.3)', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <span style={{ fontSize: 9, color: `${color}88` }}>{unit}</span>
      </div>
    </div>
  );
}

function AgentCard({ agent, isExpanded, isSelected, onClick }: {
  agent: Agent; isExpanded: boolean; isSelected: boolean; onClick: () => void;
}) {
  const color = STATE_COLORS[agent.state];
  const tokenPct = (agent.tokens / agent.maxTokens) * 100;
  const tokenColor = tokenPct > 50 ? '#00F5D4' : tokenPct > 25 ? '#F59E0B' : '#FF0055';

  return (
    <div
      className={`agent-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        borderRadius: 6,
        border: `1px solid ${isSelected ? 'rgba(0,245,212,0.45)' : 'rgba(255,255,255,0.05)'}`,
        background: isSelected ? 'rgba(0,245,212,0.07)' : 'rgba(0,0,0,0.2)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', gap: 8 }}>
        {/* Status dot */}
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: color,
          boxShadow: agent.state !== 'Dead' ? `0 0 6px ${color}` : 'none',
          flexShrink: 0,
        }} />

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(232,232,236,0.85)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {agent.name}
          </div>
          <div style={{ fontSize: 8, color: 'rgba(232,232,236,0.3)', marginTop: 1 }}>
            {agent.id}
          </div>
        </div>

        {/* State badge */}
        <div style={{
          fontSize: 8, padding: '2px 6px', borderRadius: 3,
          background: `${color}15`, color, border: `1px solid ${color}33`,
          letterSpacing: '0.08em', flexShrink: 0,
        }}>
          {agent.state.toUpperCase()}
        </div>

        {/* Expand toggle */}
        <div style={{ color: 'rgba(232,232,236,0.25)', flexShrink: 0 }}>
          {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </div>
      </div>

      {/* Token bar */}
      <div style={{ padding: '0 10px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          flex: 1, height: 3, borderRadius: 2,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${tokenPct}%`,
            background: `linear-gradient(90deg, ${tokenColor}88, ${tokenColor})`,
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }} />
        </div>
        <span style={{ fontSize: 8, color: tokenColor, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {Math.floor(agent.tokens)}T
        </span>
      </div>

      {/* Expanded detail panel */}
      {isExpanded && (
        <div style={{
          padding: '8px 10px 10px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          {/* Position + velocity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <DataRow label="POS X" value={agent.pos.x.toFixed(0)} />
            <DataRow label="POS Y" value={agent.pos.y.toFixed(0)} />
            <DataRow label="VEL X" value={agent.vel.x.toFixed(3)} />
            <DataRow label="VEL Y" value={agent.vel.y.toFixed(3)} />
          </div>

          {/* Bias profile */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 8, color: 'rgba(0,245,212,0.5)', letterSpacing: '0.1em', marginBottom: 4 }}>COGNITIVE BIAS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <BiasBar label="RESOURCE" value={agent.biasResource} />
              <BiasBar label="HUB" value={agent.biasHub} />
              <BiasBar label="AVOID" value={agent.biasAvoid} />
              <BiasBar label="SWARM" value={agent.biasSwarm} />
            </div>
          </div>

          {/* Mini token sparkline */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 8, color: 'rgba(0,245,212,0.5)', letterSpacing: '0.1em', marginBottom: 4 }}>TOKEN HISTORY</div>
            <TokenSparkline history={agent.tokenHistory} />
          </div>

          {/* Memory logs */}
          <div>
            <div style={{ fontSize: 8, color: 'rgba(0,245,212,0.5)', letterSpacing: '0.1em', marginBottom: 4 }}>MEMORY LOG</div>
            {agent.memoryLogs.slice(0, 3).map((log, i) => (
              <div key={i} style={{
                fontSize: 8, lineHeight: 1.5,
                color: 'rgba(232,232,236,0.4)',
                padding: '2px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}>
                <span style={{ color: 'rgba(0,245,212,0.35)' }}>[{formatTime(log.timestamp)}]</span>{' '}
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 8, color: 'rgba(232,232,236,0.3)', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: 9, color: 'rgba(0,245,212,0.8)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

function BiasBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 7, color: 'rgba(232,232,236,0.3)', letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontSize: 7, color: 'rgba(0,245,212,0.6)', fontVariantNumeric: 'tabular-nums' }}>
          {(value * 100).toFixed(0)}%
        </span>
      </div>
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
        <div style={{
          height: '100%', width: `${value * 100}%`,
          background: '#7B2CBF',
          borderRadius: 1,
        }} />
      </div>
    </div>
  );
}

function TokenSparkline({ history }: { history: number[] }) {
  const W = 360, H = 28;
  const max = 1000, min = 0;
  const points = history.slice(-50);
  if (points.length < 2) return null;

  const toX = (i: number) => (i / (points.length - 1)) * W;
  const toY = (v: number) => H - ((v - min) / (max - min)) * H;

  const pathD = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const areaD = pathD + ` L${toX(points.length - 1)},${H} L0,${H} Z`;

  const lastVal = points[points.length - 1];
  const color = lastVal > 500 ? '#00F5D4' : lastVal > 250 ? '#F59E0B' : '#FF0055';

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${history.length}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${history.length})`} />
      <path d={pathD} stroke={color} strokeWidth="1.2" fill="none" />
    </svg>
  );
}
