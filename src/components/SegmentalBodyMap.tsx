import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Zone = 'laLean' | 'raLean' | 'trunkLean' | 'llLean' | 'rlLean';

const ZONES: { key: Zone; label: string }[] = [
  { key: 'laLean',    label: 'Left Arm'  },
  { key: 'raLean',    label: 'Right Arm' },
  { key: 'trunkLean', label: 'Trunk'     },
  { key: 'llLean',    label: 'Left Leg'  },
  { key: 'rlLean',    label: 'Right Leg' },
];

const ZONE_COLORS: Record<Zone, string> = {
  laLean:    '#34d399',
  raLean:    '#34d399',
  trunkLean: '#38bdf8',
  llLean:    '#a78bfa',
  rlLean:    '#a78bfa',
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10,10,20,0.95)',
        border: '1px solid rgba(52,211,153,0.4)',
        borderRadius: 10,
        padding: '8px 14px',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 2 }}>{label}</div>
        <div style={{ color: '#34d399', fontWeight: 700, fontSize: 18 }}>
          {payload[0].value?.toFixed(2)} <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280' }}>kg</span>
        </div>
      </div>
    );
  }
  return null;
};

interface Props {
  scan: any;
  allScans: any[];
}

export function SegmentalBodyMap({ scan, allScans }: Props) {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);
  const seg = scan.segmental || {};

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(prev => (prev === zone ? null : zone));
  };

  // Build chart data from all scans (oldest → newest)
  const chartData = selectedZone
    ? [...allScans]
        .filter(s => s.segmental?.[selectedZone] != null)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(s => ({
          date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Number(s.segmental[selectedZone]) || 0,
        }))
    : [];

  const firstVal  = chartData[0]?.value ?? 0;
  const lastVal   = chartData[chartData.length - 1]?.value ?? 0;
  const totalGain = lastVal - firstVal;
  const zoneColor = selectedZone ? ZONE_COLORS[selectedZone] : '#34d399';
  const zoneLabel = ZONES.find(z => z.key === selectedZone)?.label ?? '';

  /* ─────────── SVG body map geometry ─────────── */
  // viewBox: 0 0 120 300
  // Zones: simple geometric polygons for a clean vector silhouette look
  const isActive = (z: Zone) => selectedZone === z || hoveredZone === z;
  const fillFor  = (z: Zone) => isActive(z) ? ZONE_COLORS[z] + '55' : 'rgba(255,255,255,0.04)';
  const strokeFor = (z: Zone) => isActive(z) ? ZONE_COLORS[z] : 'rgba(255,255,255,0.12)';
  const strokeW   = (z: Zone) => isActive(z) ? 1.5 : 0.8;

  return (
    <div>
      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1">
        <TrendingUp size={14} /> Segmental Lean Analysis
        <span className="ml-1 text-gray-600 font-normal normal-case">— tap a zone</span>
      </h4>

      <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
        {/* Body map */}
        <div className="flex items-center justify-center pt-5 pb-2 px-4 gap-5">
          {/* Left labels */}
          <div className="flex flex-col gap-5 items-end text-right">
            <ZoneChip
              zone="laLean" label="L. Arm" value={seg.laLean}
              selected={selectedZone === 'laLean'}
              onClick={() => handleZoneClick('laLean')}
              color={ZONE_COLORS.laLean}
            />
            <ZoneChip
              zone="llLean" label="L. Leg" value={seg.llLean}
              selected={selectedZone === 'llLean'}
              onClick={() => handleZoneClick('llLean')}
              color={ZONE_COLORS.llLean}
            />
          </div>

          {/* SVG Silhouette */}
          <svg
            viewBox="0 0 120 300"
            width="100"
            height="250"
            style={{ flexShrink: 0, overflow: 'visible' }}
          >
            <defs>
              {Object.entries(ZONE_COLORS).map(([key, _color]) => (
                <filter key={key} id={`glow-${key}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            {/* Head */}
            <ellipse cx="60" cy="22" rx="16" ry="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

            {/* Neck */}
            <rect x="53" y="40" width="14" height="12" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />

            {/* LEFT ARM — appears on right side of screen (mirror convention) */}
            <g
              onClick={() => handleZoneClick('laLean')}
              onMouseEnter={() => setHoveredZone('laLean')}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ cursor: 'pointer' }}
              filter={isActive('laLean') ? 'url(#glow-laLean)' : undefined}
            >
              <path d="M 22 52 Q 10 70 8 105 Q 12 120 20 120 Q 28 120 30 105 Q 32 72 38 54 Z"
                fill={fillFor('laLean')} stroke={strokeFor('laLean')} strokeWidth={strokeW('laLean')} strokeLinejoin="round" />
            </g>

            {/* RIGHT ARM — appears on left side */}
            <g
              onClick={() => handleZoneClick('raLean')}
              onMouseEnter={() => setHoveredZone('raLean')}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ cursor: 'pointer' }}
              filter={isActive('raLean') ? 'url(#glow-raLean)' : undefined}
            >
              <path d="M 98 52 Q 110 70 112 105 Q 108 120 100 120 Q 92 120 90 105 Q 88 72 82 54 Z"
                fill={fillFor('raLean')} stroke={strokeFor('raLean')} strokeWidth={strokeW('raLean')} strokeLinejoin="round" />
            </g>

            {/* TRUNK */}
            <g
              onClick={() => handleZoneClick('trunkLean')}
              onMouseEnter={() => setHoveredZone('trunkLean')}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ cursor: 'pointer' }}
              filter={isActive('trunkLean') ? 'url(#glow-trunkLean)' : undefined}
            >
              <path d="M 38 52 Q 34 65 35 100 Q 40 145 45 155 L 75 155 Q 80 145 85 100 Q 86 65 82 52 Z"
                fill={fillFor('trunkLean')} stroke={strokeFor('trunkLean')} strokeWidth={strokeW('trunkLean')} strokeLinejoin="round" />
            </g>

            {/* LEFT LEG — right side of screen */}
            <g
              onClick={() => handleZoneClick('llLean')}
              onMouseEnter={() => setHoveredZone('llLean')}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ cursor: 'pointer' }}
              filter={isActive('llLean') ? 'url(#glow-llLean)' : undefined}
            >
              <path d="M 45 155 Q 38 175 37 215 Q 36 255 42 275 Q 48 285 55 275 Q 60 255 58 215 Q 58 175 55 155 Z"
                fill={fillFor('llLean')} stroke={strokeFor('llLean')} strokeWidth={strokeW('llLean')} strokeLinejoin="round" />
            </g>

            {/* RIGHT LEG — left side of screen */}
            <g
              onClick={() => handleZoneClick('rlLean')}
              onMouseEnter={() => setHoveredZone('rlLean')}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ cursor: 'pointer' }}
              filter={isActive('rlLean') ? 'url(#glow-rlLean)' : undefined}
            >
              <path d="M 75 155 Q 82 175 83 215 Q 84 255 78 275 Q 72 285 65 275 Q 60 255 62 215 Q 62 175 65 155 Z"
                fill={fillFor('rlLean')} stroke={strokeFor('rlLean')} strokeWidth={strokeW('rlLean')} strokeLinejoin="round" />
            </g>

            {/* Forearms (left) */}
            <path d="M 8 105 Q 6 128 10 140 Q 14 148 20 147 Q 26 148 28 140 Q 30 128 20 120 Z"
              fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
            {/* Forearms (right) */}
            <path d="M 112 105 Q 114 128 110 140 Q 106 148 100 147 Q 94 148 92 140 Q 90 128 100 120 Z"
              fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />

            {/* Feet (left) */}
            <ellipse cx="42" cy="280" rx="9" ry="5" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />
            {/* Feet (right) */}
            <ellipse cx="78" cy="280" rx="9" ry="5" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />
          </svg>

          {/* Right labels */}
          <div className="flex flex-col gap-5 items-start text-left">
            <ZoneChip
              zone="raLean" label="R. Arm" value={seg.raLean}
              selected={selectedZone === 'raLean'}
              onClick={() => handleZoneClick('raLean')}
              color={ZONE_COLORS.raLean}
            />
            <ZoneChip
              zone="rlLean" label="R. Leg" value={seg.rlLean}
              selected={selectedZone === 'rlLean'}
              onClick={() => handleZoneClick('rlLean')}
              color={ZONE_COLORS.rlLean}
            />
          </div>
        </div>

        {/* Trunk chip centered below the SVG */}
        <div className="flex justify-center pb-4">
          <ZoneChip
            zone="trunkLean" label="Trunk" value={seg.trunkLean}
            selected={selectedZone === 'trunkLean'}
            onClick={() => handleZoneClick('trunkLean')}
            color={ZONE_COLORS.trunkLean}
          />
        </div>

        {/* Progression Chart */}
        <AnimatePresence>
          {selectedZone && chartData.length > 0 && (
            <motion.div
              key={selectedZone}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-gray-700/40"
            >
              <div className="p-4 bg-black/30">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{zoneLabel} — Lean Mass Progression</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold" style={{ color: zoneColor }}>{lastVal.toFixed(2)} kg</span>
                      <GainBadge gain={totalGain} />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="text-gray-600 hover:text-gray-300 transition-colors p-1"
                  >
                    ✕
                  </button>
                </div>

                {chartData.length < 2 ? (
                  <p className="text-xs text-gray-600 text-center py-4">Add more scans to see progression</p>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`grad-${selectedZone}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor={zoneColor} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={zoneColor} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 5" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(v) => v.toFixed(1)}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={zoneColor}
                        strokeWidth={2}
                        fill={`url(#grad-${selectedZone})`}
                        dot={{ fill: zoneColor, r: 3, strokeWidth: 0 }}
                        activeDot={{ fill: zoneColor, r: 5, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {chartData.length >= 2 && (
                  <div className="flex justify-between text-[10px] text-gray-600 mt-2 px-1">
                    <span>First scan: <span className="text-gray-400 font-semibold">{firstVal.toFixed(2)} kg</span></span>
                    <span>Latest: <span className="text-gray-400 font-semibold">{lastVal.toFixed(2)} kg</span></span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function ZoneChip({
  zone: _zone, label, value, selected, onClick, color,
}: {
  zone: Zone; label: string; value: number | undefined;
  selected: boolean; onClick: () => void; color: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${selected ? color : 'rgba(255,255,255,0.1)'}`,
        background: selected ? `${color}18` : 'rgba(0,0,0,0.4)',
        boxShadow: selected ? `0 0 12px ${color}44` : 'none',
        color: selected ? color : '#9ca3af',
        transition: 'all 0.2s ease',
      }}
      className="rounded-xl px-2.5 py-1.5 text-center backdrop-blur-sm min-w-[64px]"
    >
      <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-sm font-bold mt-0.5">{value ?? 0} kg</p>
    </button>
  );
}

function GainBadge({ gain }: { gain: number }) {
  if (Math.abs(gain) < 0.01) {
    return <span className="text-xs text-gray-500 flex items-center gap-1"><Minus size={10} /> No change</span>;
  }
  const isPositive = gain > 0;
  return (
    <span
      className={`text-xs font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
    >
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isPositive ? '+' : ''}{gain.toFixed(2)} kg since first scan
    </span>
  );
}
