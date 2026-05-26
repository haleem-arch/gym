'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSim } from '@/lib/SimulationContext';
import { AgentState } from '@/lib/types';
import { BarChart2, Terminal, TrendingDown, Cpu } from 'lucide-react';

const STATE_COLORS: Record<AgentState, string> = {
  Idle:       '#555560',
  Routing:    '#00F5D4',
  Harvesting: '#F59E0B',
  Stalled:    '#FF0055',
  Dead:       '#3a3a3d',
  Docking:    '#7B2CBF',
};

interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
}

let terminalLineId = 0;

export default function AnalyticalInspector() {
  const { displayState, executeCommand } = useSim();
  const { metrics } = displayState;
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: terminalLineId++, type: 'output', text: '> Agentic Intelligence Grid v1.0.0' },
    { id: terminalLineId++, type: 'output', text: '> Type /help for available commands' },
    { id: terminalLineId++, type: 'output', text: '─────────────────────────────────' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const burnChartRef = useRef<HTMLCanvasElement>(null);
  const burnRafRef = useRef<number>(0);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Burn Rate Chart
  useEffect(() => {
    const canvas = burnChartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function drawBurnChart() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      const history = displayState.metrics.tokenBurnRateHistory;

      ctx.clearRect(0, 0, W, H);

      if (history.length < 2) {
        burnRafRef.current = requestAnimationFrame(drawBurnChart);
        return;
      }

      const max = Math.max(...history, 1);
      const min = 0;
      const toX = (i: number) => (i / (history.length - 1)) * W;
      const toY = (v: number) => H - 4 - ((v - min) / (max - min)) * (H - 8);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * H;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Area fill
      const areaPath = new Path2D();
      areaPath.moveTo(toX(0), toY(history[0]));
      for (let i = 1; i < history.length; i++) {
        const xPrev = toX(i - 1);
        const xCurr = toX(i);
        const yPrev = toY(history[i - 1]);
        const yCurr = toY(history[i]);
        const cpX = (xPrev + xCurr) / 2;
        areaPath.bezierCurveTo(cpX, yPrev, cpX, yCurr, xCurr, yCurr);
      }
      areaPath.lineTo(W, H);
      areaPath.lineTo(0, H);
      areaPath.closePath();

      const areaGrad = ctx.createLinearGradient(0, 0, 0, H);
      areaGrad.addColorStop(0, 'rgba(0,245,212,0.22)');
      areaGrad.addColorStop(1, 'rgba(0,245,212,0.01)');
      ctx.fillStyle = areaGrad;
      ctx.fill(areaPath);

      // Line
      const linePath = new Path2D();
      linePath.moveTo(toX(0), toY(history[0]));
      for (let i = 1; i < history.length; i++) {
        const xPrev = toX(i - 1);
        const xCurr = toX(i);
        const yPrev = toY(history[i - 1]);
        const yCurr = toY(history[i]);
        const cpX = (xPrev + xCurr) / 2;
        linePath.bezierCurveTo(cpX, yPrev, cpX, yCurr, xCurr, yCurr);
      }
      ctx.strokeStyle = '#00F5D4';
      ctx.lineWidth = 1.5;
      ctx.stroke(linePath);

      // Current value dot
      const lastIdx = history.length - 1;
      const dotX = toX(lastIdx);
      const dotY = toY(history[lastIdx]);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00F5D4';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,245,212,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Y-axis max label
      ctx.fillStyle = 'rgba(0,245,212,0.4)';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${max.toFixed(0)}`, W - 2, 12);
      ctx.fillText('0', W - 2, H - 2);

      burnRafRef.current = requestAnimationFrame(drawBurnChart);
    }

    burnRafRef.current = requestAnimationFrame(drawBurnChart);
    return () => cancelAnimationFrame(burnRafRef.current);
  }, [displayState.metrics.tokenBurnRateHistory]);

  const handleCommand = useCallback(() => {
    const cmd = inputValue.trim();
    if (!cmd) return;

    setTerminalLines(prev => [
      ...prev,
      { id: terminalLineId++, type: 'input', text: `> ${cmd}` },
    ]);

    const result = executeCommand(cmd);
    const isError = result.startsWith('ERROR');
    const isOk = result.startsWith('OK');

    // Multi-line output (for /help)
    const lines = result.split('\n');
    setTerminalLines(prev => [
      ...prev,
      ...lines.map(l => ({
        id: terminalLineId++,
        type: (isError ? 'error' : isOk ? 'success' : 'output') as TerminalLine['type'],
        text: l,
      })),
    ]);

    setCmdHistory(prev => [cmd, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    setInputValue('');
  }, [inputValue, executeCommand]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(newIdx);
      setInputValue(cmdHistory[newIdx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIdx);
      setInputValue(newIdx === -1 ? '' : cmdHistory[newIdx] ?? '');
    }
  }

  // State distribution data
  const stateDist = metrics.stateDistribution;
  const totalAgents = Object.values(stateDist).reduce((s, v) => s + v, 0) || 1;
  const stateEntries = Object.entries(stateDist).filter(([, v]) => v > 0) as [AgentState, number][];

  return (
    <aside style={{
      width: '380px',
      minWidth: '380px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0F0F11',
      borderLeft: '1px solid rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      {/* ── Header ─────────────────────────────── */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <BarChart2 size={14} color="#7B2CBF" />
        <span style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(123,44,191,0.8)', fontWeight: 600 }}>
          ANALYTICAL INSPECTOR
        </span>
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 8,
          color: 'rgba(0,245,212,0.5)',
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#00F5D4',
            boxShadow: '0 0 6px #00F5D4',
            animation: 'pulse 1s infinite',
          }} />
          LIVE
        </div>
      </div>

      {/* ── Token Burn Rate Chart ──────────────── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <TrendingDown size={11} color="rgba(0,245,212,0.5)" />
          <span style={{ fontSize: 9, color: 'rgba(232,232,236,0.3)', letterSpacing: '0.12em' }}>TOKEN BURN RATE / SEC</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#00F5D4', fontVariantNumeric: 'tabular-nums' }}>
            {(metrics.tokenBurnRateHistory[metrics.tokenBurnRateHistory.length - 1] ?? 0).toFixed(1)}
            <span style={{ fontSize: 8, color: 'rgba(0,245,212,0.5)', marginLeft: 3 }}>T/s</span>
          </span>
        </div>
        <canvas
          ref={burnChartRef}
          width={340}
          height={72}
          style={{
            width: '100%', height: 72,
            borderRadius: 4,
            background: 'rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* ── State Distribution ────────────────── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Cpu size={11} color="rgba(123,44,191,0.5)" />
          <span style={{ fontSize: 9, color: 'rgba(232,232,236,0.3)', letterSpacing: '0.12em' }}>STATE DISTRIBUTION</span>
        </div>

        {/* Bar chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stateEntries.sort((a, b) => b[1] - a[1]).map(([state, count]) => {
            const pct = (count / totalAgents) * 100;
            const color = STATE_COLORS[state];
            return (
              <div key={state}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 8, color, letterSpacing: '0.1em' }}>{state.toUpperCase()}</span>
                  <span style={{ fontSize: 8, color: 'rgba(232,232,236,0.4)', fontVariantNumeric: 'tabular-nums' }}>
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                    borderRadius: 2,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Efficiency gauge */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 8, color: 'rgba(232,232,236,0.3)', letterSpacing: '0.1em' }}>ALLOCATION EFFICIENCY</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', fontVariantNumeric: 'tabular-nums' }}>
              {metrics.allocationEfficiency.toFixed(1)}%
            </span>
          </div>
          <EfficiencyGauge value={metrics.allocationEfficiency} />
        </div>
      </div>

      {/* ── Cross Entropy + Token Velocity ─────── */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexShrink: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}>
        <StatBox
          label="CROSS ENTROPY"
          value={`${(metrics.crossEntropy * 100).toFixed(1)}%`}
          sub="Disorder metric"
          color="#7B2CBF"
          trend={metrics.crossEntropy > 0.6 ? 'high' : metrics.crossEntropy < 0.3 ? 'low' : 'mid'}
        />
        <StatBox
          label="TOKEN VELOCITY"
          value={`${metrics.totalTokenVelocity.toFixed(0)}`}
          sub="Tokens exchanged"
          color="#00F5D4"
          trend="mid"
        />
      </div>

      {/* ── Terminal ──────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          padding: '10px 20px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}>
          <Terminal size={11} color="rgba(0,245,212,0.5)" />
          <span style={{ fontSize: 9, color: 'rgba(232,232,236,0.3)', letterSpacing: '0.12em' }}>COMMAND TERMINAL</span>
        </div>

        {/* Output */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 16px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          lineHeight: 1.7,
        }}>
          {terminalLines.map(line => (
            <div
              key={line.id}
              style={{
                color: line.type === 'input' ? 'rgba(232,232,236,0.7)'
                  : line.type === 'error' ? '#FF0055'
                  : line.type === 'success' ? '#00F5D4'
                  : 'rgba(232,232,236,0.35)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {line.text}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Input */}
        <div style={{
          flexShrink: 0,
          padding: '8px 16px 12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ color: '#00F5D4', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>$</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type a command... (/help)"
            spellCheck={false}
            autoComplete="off"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#00F5D4',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              width: '100%',
              caretColor: '#00F5D4',
            }}
          />
          <button
            onClick={handleCommand}
            style={{
              background: 'rgba(0,245,212,0.1)',
              border: '1px solid rgba(0,245,212,0.3)',
              borderRadius: 4,
              color: '#00F5D4',
              fontSize: 9,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '4px 10px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            RUN
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Sub-components ──────────────────────────────────────────

function StatBox({ label, value, sub, color, trend }: {
  label: string; value: string; sub: string; color: string;
  trend: 'high' | 'mid' | 'low';
}) {
  const trendColor = trend === 'high' ? '#FF0055' : trend === 'low' ? '#00F5D4' : '#F59E0B';
  const trendSymbol = trend === 'high' ? '▲' : trend === 'low' ? '▼' : '●';

  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: 6,
      background: 'rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ fontSize: 7, color: 'rgba(232,232,236,0.3)', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 8, color: trendColor }}>{trendSymbol}</span>
        <span style={{ fontSize: 7, color: 'rgba(232,232,236,0.25)' }}>{sub}</span>
      </div>
    </div>
  );
}

function EfficiencyGauge({ value }: { value: number }) {
  const color = value > 70 ? '#00F5D4' : value > 40 ? '#F59E0B' : '#FF0055';
  const pct = value / 100;

  // SVG arc gauge
  const cx = 170, cy = 50, r = 38;
  const startAngle = Math.PI;
  const endAngle = Math.PI * 2;
  const angle = startAngle + pct * Math.PI;

  const arcX = (a: number) => cx + r * Math.cos(a);
  const arcY = (a: number) => cy + r * Math.sin(a);

  const bgArc = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 0 1 ${arcX(endAngle)} ${arcY(endAngle)}`;
  const fgArc = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${arcX(angle)} ${arcY(angle)}`;

  return (
    <svg width="100%" height={60} viewBox="0 0 340 60" style={{ display: 'block', overflow: 'visible' }}>
      {/* Background track */}
      <path d={bgArc} stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Value arc */}
      <path d={fgArc} stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Glow */}
      <path d={fgArc} stroke={color} strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.15" />
      {/* Center value */}
      <text x={cx} y={cy + 8} textAnchor="middle" fill={color}
        fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700">
        {value.toFixed(0)}%
      </text>
      {/* Tick marks */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const a = startAngle + t * Math.PI;
        const inner = 30, outer = 34;
        return (
          <line key={i}
            x1={cx + inner * Math.cos(a)} y1={cy + inner * Math.sin(a)}
            x2={cx + outer * Math.cos(a)} y2={cy + outer * Math.sin(a)}
            stroke="rgba(255,255,255,0.15)" strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}
