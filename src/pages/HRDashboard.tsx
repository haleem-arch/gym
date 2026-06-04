import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Heart, Maximize, Minimize, Bluetooth, BluetoothConnected } from 'lucide-react';

interface HRPoint {
  time: number;
  hr: number;
}

const MIN_VISIBLE_MS = 5 * 60 * 1000; // keep at least 5 min visible so axis isn't squashed

/* ── Animated live dot on the last point ── */
const LiveDot = (props: any) => {
  const { cx, cy, index, dataLength } = props;
  if (index !== dataLength - 1 || cx == null || cy == null) return null;
  return (
    <circle cx={cx} cy={cy} r={7} fill="#e07030" opacity={0.9}>
      <animate attributeName="r"       values="5;10;5"   dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.3;1"  dur="1.5s" repeatCount="indefinite" />
    </circle>
  );
};

/* ── Custom tooltip ── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15,12,9,0.95)',
      border: '1px solid #e07030',
      borderRadius: 10,
      padding: '8px 16px',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{ color: '#c8854a', fontSize: '0.78rem', marginBottom: 4 }}>
        {new Date(label).toLocaleTimeString()}
      </div>
      <div style={{ color: '#e07030', fontWeight: 700, fontSize: '1.5rem' }}>
        {payload[0].value} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#c8854a' }}>BPM</span>
      </div>
    </div>
  );
};

/* ── HR zone helper ── */
const getZone = (hr: number | null) => {
  if (!hr) return { label: '', color: '#e07030' };
  if (hr < 60)  return { label: 'Resting',  color: '#5b8fd9' };
  if (hr < 100) return { label: 'Normal',   color: '#68d9a4' };
  if (hr < 140) return { label: 'Aerobic',  color: '#d9c45b' };
  if (hr < 170) return { label: 'Cardio',   color: '#e5932a' };
  return              { label: 'Peak',      color: '#e53a2a' };
};

/* ════════════════════════════════════════════ */
export default function HRDashboard() {
  const [allData,      setAllData]      = useState<HRPoint[]>([]);
  const [currentHr,   setCurrentHr]    = useState<number | null>(null);
  const [minHr,        setMinHr]        = useState<number | null>(null);
  const [maxHr,        setMaxHr]        = useState<number | null>(null);
  const [isConnected,  setIsConnected]  = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now,          setNow]          = useState(Date.now());
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  const wakeLockRef = useRef<any>(null);

  /* tick clock every second → right edge of chart advances */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* session min / max */
  useEffect(() => {
    if (!allData.length) return;
    const hrs = allData.map(p => p.hr);
    setMinHr(Math.min(...hrs));
    setMaxHr(Math.max(...hrs));
  }, [allData]);

  /* fullscreen change */
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  /* re-acquire wake lock on tab focus */
  useEffect(() => {
    const h = async () => {
      if (document.visibilityState === 'visible' && isConnected) requestWakeLock();
    };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [isConnected]);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => { wakeLockRef.current = null; });
      }
    } catch { /* ignore */ }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) { await wakeLockRef.current.release(); wakeLockRef.current = null; }
  };

  /* parse BLE heart rate measurement */
  const handleHR = useCallback((event: any) => {
    const v = event.target.value as DataView;
    const flags = v.getUint8(0);
    const hr = (flags & 0x1) ? v.getUint16(1, true) : v.getUint8(1);
    const ts = Date.now();
    setCurrentHr(hr);
    setSessionStart(prev => prev ?? ts);
    setAllData(prev => [...prev, { time: ts, hr }]);
  }, []);

  /* connect via Web Bluetooth */
  const connectBluetooth = async () => {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
      });
      const server       = await device.gatt.connect();
      const service      = await server.getPrimaryService('heart_rate');
      const char         = await service.getCharacteristic('heart_rate_measurement');
      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', handleHR);

      const start = Date.now();
      setSessionStart(start);
      setIsConnected(true);
      requestWakeLock();

      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setCurrentHr(null);
        releaseWakeLock();
      });
    } catch (e) {
      console.error('Bluetooth error:', e);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  /* ── Chart domain: LEFT = sessionStart, RIGHT = now (grows right) ── */
  const xLeft  = sessionStart ? sessionStart : now - MIN_VISIBLE_MS;
  const xRight = sessionStart ? Math.max(now, sessionStart + MIN_VISIBLE_MS) : now;
  const xSpan  = xRight - xLeft;
  const xTicks = Array.from({ length: 7 }, (_, i) => xLeft + (i * xSpan) / 6);

  /* ── Dynamic Y with padding ── */
  const hrs  = allData.map(p => p.hr);
  const yMin = hrs.length ? Math.max(30,  Math.min(...hrs) - 15) : 40;
  const yMax = hrs.length ? Math.min(220, Math.max(...hrs) + 15) : 200;

  /* ── Avg of visible session ── */
  const avgHr = allData.length > 1
    ? Math.round(allData.reduce((s, p) => s + p.hr, 0) / allData.length)
    : null;

  /* ── Elapsed label ── */
  const elapsedMs  = sessionStart ? now - sessionStart : 0;
  const elapsedMin = Math.floor(elapsedMs / 60000);
  const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);
  const elapsed    = sessionStart
    ? (elapsedMin > 0 ? `${elapsedMin}m ${elapsedSec}s elapsed` : `${elapsedSec}s elapsed`)
    : 'Waiting for connection…';

  const zone = getZone(currentHr);

  return (
    <div style={S.root}>
      {/* ── HEADER ── */}
      <div style={S.header}>
        <div>
          {/* Title row */}
          <div style={S.titleRow}>
            <h1 style={S.title}>Heart Rate Monitor</h1>
            <span style={{ ...S.badge, ...(isConnected ? S.badgeLive : {}) }}>
              {isConnected ? '● LIVE' : '○ OFFLINE'}
            </span>
          </div>

          {/* Big BPM */}
          <div style={S.hrRow}>
            <span style={{ ...S.bpmBig, color: zone.color }}>
              {currentHr ?? '--'}
            </span>
            <div style={S.hrMeta}>
              <span style={S.bpmLabel}>BPM</span>
              {currentHr && (
                <span style={{ ...S.zoneBadge, color: zone.color, border: `1px solid ${zone.color}`, background: zone.color + '22' }}>
                  {zone.label}
                </span>
              )}
            </div>
          </div>

          {/* Session stats */}
          {(minHr || maxHr) && (
            <div style={S.stats}>
              <span style={{ opacity: 0.5 }}>Session:</span>
              <span style={{ color: '#5b8fd9' }}>↓ {minHr}</span>
              <span style={{ color: '#e53a2a' }}>↑ {maxHr}</span>
              {avgHr && <span style={{ color: '#d9c45b' }}>⌀ {avgHr}</span>}
              <span style={{ opacity: 0.4 }}>BPM</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={S.controls}>
          <button
            onClick={connectBluetooth}
            style={isConnected ? { ...S.btn, ...S.btnConnected } : { ...S.btn, ...S.btnPrimary }}
          >
            {isConnected ? <BluetoothConnected size={18} /> : <Bluetooth size={18} />}
            {isConnected ? 'Connected' : 'Connect Watch'}
          </button>
          <button onClick={toggleFullscreen} style={S.btn}>
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Elapsed */}
      <div style={S.elapsed}>{elapsed}</div>

      {/* ── CHART ── */}
      <div style={S.chartWrap}>
        {!isConnected && allData.length === 0 && (
          <div style={S.overlay}>
            <Heart size={56} color="#e07030" strokeWidth={1.5} />
            <div style={{ marginTop: 14, fontSize: '1.05rem' }}>Ready to connect</div>
            <div style={{ marginTop: 6, fontSize: '0.82rem', opacity: 0.45 }}>
              Open Chrome or Edge, then tap "Connect Watch"
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={allData} margin={{ top: 12, right: 60, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="hrLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#e07030" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#e07030" stopOpacity={1}    />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 8" stroke="#231a10" vertical={false} />

            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={[xLeft, xRight]}
              ticks={xTicks}
              tickFormatter={ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              stroke="transparent"
              tick={{ fill: '#7a5535', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              domain={[yMin, yMax]}
              stroke="transparent"
              tick={{ fill: '#7a5535', fontSize: 12 }}
              tickLine={false}
              width={46}
            />

            <Tooltip content={<CustomTooltip />} />

            {avgHr && (
              <ReferenceLine
                y={avgHr}
                stroke="#c8854a"
                strokeDasharray="6 5"
                strokeOpacity={0.3}
                label={{ value: `avg ${avgHr}`, fill: '#c8854a', opacity: 0.4, fontSize: 11, position: 'insideTopRight' }}
              />
            )}

            <Line
              type="monotoneX"
              dataKey="hr"
              stroke="url(#hrLine)"
              strokeWidth={3}
              dot={<LiveDot dataLength={allData.length} />}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer clock */}
      <div style={S.clock}>
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
    </div>
  );
}

/* ── Inline styles (no CSS file dependency) ── */
const S: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex', flexDirection: 'column',
    height: '100dvh', width: '100vw',
    background: '#0f0c09', color: '#c8854a',
    fontFamily: "'Inter', -apple-system, sans-serif",
    padding: '22px 30px 14px',
    boxSizing: 'border-box',
    gap: 6,
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    flexShrink: 0,
  },
  titleRow: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  title: {
    margin: 0, fontSize: '0.85rem', fontWeight: 500,
    letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.45,
  },
  badge: {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
    padding: '3px 10px', borderRadius: 20,
    background: '#1e1610', color: '#7a5535',
    border: '1px solid #2e2015',
  },
  badgeLive: {
    background: 'rgba(100,210,130,0.12)', color: '#68d9a4',
    border: '1px solid rgba(100,210,130,0.28)',
  },
  hrRow: {
    display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 6,
  },
  bpmBig: {
    fontSize: 'clamp(4.5rem, 9vw, 8rem)',
    fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em',
    transition: 'color 0.5s ease',
  },
  hrMeta: {
    display: 'flex', flexDirection: 'column', gap: 7, paddingBottom: 6,
  },
  bpmLabel: {
    fontSize: '0.95rem', fontWeight: 400, opacity: 0.35, letterSpacing: '0.1em',
  },
  zoneBadge: {
    fontSize: '0.73rem', fontWeight: 700, letterSpacing: '0.09em',
    textTransform: 'uppercase', padding: '3px 11px', borderRadius: 20,
  },
  stats: {
    display: 'flex', alignItems: 'center', gap: 12,
    fontSize: '0.82rem', marginTop: 4,
  },
  controls: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  btn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'transparent', color: '#c8854a',
    border: '1px solid #2e2015', padding: '10px 18px', borderRadius: 10,
    fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600,
    cursor: 'pointer', letterSpacing: '0.02em', transition: 'all .2s',
  },
  btnPrimary: {
    background: '#e07030', color: '#1a0d05', borderColor: '#e07030',
  },
  btnConnected: {
    background: 'rgba(100,210,130,0.1)', color: '#68d9a4',
    border: '1px solid rgba(100,210,130,0.25)',
  },
  elapsed: {
    fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#5a3d22', opacity: 0.8,
    paddingLeft: 47, flexShrink: 0,
  },
  chartWrap: {
    flex: 1, width: '100%', position: 'relative', minHeight: 0,
  },
  overlay: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center', pointerEvents: 'none', zIndex: 2,
  },
  clock: {
    textAlign: 'right', fontSize: '0.78rem', letterSpacing: '0.05em',
    fontVariantNumeric: 'tabular-nums', color: '#5a3d22', flexShrink: 0,
  },
};
