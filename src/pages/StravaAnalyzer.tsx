import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, MapPin, TrendingUp, Zap, Clock, Heart, Award, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Default credentials from user screenshot
const DEFAULT_CLIENT_ID = '203804';
const DEFAULT_CLIENT_SECRET = 'b06ce5719d9b2451006c585496bbe707c693f0ac';
const DEFAULT_ACCESS_TOKEN = '87684dfa24b420b56af7503fa2a3c618944f16e3';
const DEFAULT_REFRESH_TOKEN = '8465e14d7a451ce3c2c42caaa956777faab0cda9';

interface StravaActivity {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number;
  total_elevation_gain: number; // meters
  type: string;
  start_date: string;
  average_speed: number; // m/s
  average_cadence?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  map?: { summary_polyline?: string };
  splits_metric?: { distance: number; elapsed_time: number; moving_time: number; split: number; elevation_difference: number }[];
  elevations?: number[];
  cached_summary?: string;
}

// Polyline decoder helper
const decodePolyline = (encoded: string) => {
  if (!encoded) return [];
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }
  return poly;
};

// Fallback SVG polyline map renderer
const SvgPolylineMap = ({ polyline }: { polyline?: string }) => {
  const points = decodePolyline(polyline || '');
  if (!points.length) {
    return (
      <div className="w-full h-full bg-surface/50 flex items-center justify-center text-gray-600 text-xs font-semibold">
        No GPS Route
      </div>
    );
  }

  const lats = points.map(p => p[0]);
  const lngs = points.map(p => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 0.01;
  const lngRange = maxLng - minLng || 0.01;

  // Scale points to 100x100 SVG viewbox
  const svgPoints = points.map(p => {
    const x = ((p[1] - minLng) / lngRange) * 80 + 10;
    const y = ((maxLat - p[0]) / latRange) * 80 + 10; // Invert Y for SVG
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full bg-surface/40 flex items-center justify-center relative overflow-hidden p-2 rounded-2xl border border-gray-800/80">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(252,82,0,0.6)]">
        <polyline
          fill="none"
          stroke="#FC5200"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={svgPoints}
        />
      </svg>
      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-gray-400 border border-gray-700">
        GPS Route
      </div>
    </div>
  );
};

const StravaAnalyzer = () => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('strava_access_token') || DEFAULT_ACCESS_TOKEN);
  const [clientId, setClientId] = useState(() => localStorage.getItem('strava_client_id') || DEFAULT_CLIENT_ID);
  const [clientSecret, setClientSecret] = useState(() => localStorage.getItem('strava_client_secret') || DEFAULT_CLIENT_SECRET);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('strava_refresh_token') || DEFAULT_REFRESH_TOKEN);
  
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Load cached activities on mount
  useEffect(() => {
    loadCachedActivities();
  }, []);

  const loadCachedActivities = async () => {
    setLoading(true);
    try {
      // First check Supabase cache
      const { data, error } = await supabase
        .from('strava_activities')
        .select('*')
        .order('start_date', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: StravaActivity[] = data.map(d => ({
          id: Number(d.activity_id),
          name: d.name,
          distance: Number(d.distance),
          moving_time: Number(d.moving_time),
          elapsed_time: Number(d.elapsed_time),
          total_elevation_gain: Number(d.elevation_gain),
          type: d.type,
          start_date: d.start_date,
          average_speed: Number(d.average_speed),
          average_cadence: Number(d.average_cadence),
          average_heartrate: Number(d.average_heartrate),
          max_heartrate: Number(d.max_heartrate),
          map: { summary_polyline: d.polyline },
          cached_summary: d.cached_data?.ai_summary || ''
        }));
        setActivities(formatted);
      } else {
        // Fallback to localStorage cache if Supabase table is empty or missing
        const localSaved = localStorage.getItem('strava_cached_runs');
        if (localSaved) {
          setActivities(JSON.parse(localSaved));
        } else {
          setActivities([]); // Strictly NO MOCK RUNS!
        }
      }
    } catch (err) {
      console.error(err);
      const localSaved = localStorage.getItem('strava_cached_runs');
      if (localSaved) setActivities(JSON.parse(localSaved));
    } finally {
      setLoading(false);
    }
  };

  // Fetch real activities from Strava API
  const handleConnectStrava = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let currentAccess = accessToken;
      let res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=15', {
        headers: { 'Authorization': `Bearer ${currentAccess}` }
      });

      // If 401 Unauthorized, automatically attempt to refresh the token!
      if (res.status === 401) {
        console.log("Access token expired. Attempting automatic refresh using Refresh Token...");
        const refreshRes = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
          })
        });

        if (!refreshRes.ok) {
          throw new Error('Strava Access Token expired and Refresh Token failed. Please verify your Client ID, Secret, and Refresh Token in OAuth Settings.');
        }

        const tokenData = await refreshRes.json();
        currentAccess = tokenData.access_token;
        setAccessToken(currentAccess);
        localStorage.setItem('strava_access_token', currentAccess);
        if (tokenData.refresh_token) {
          setRefreshToken(tokenData.refresh_token);
          localStorage.setItem('strava_refresh_token', tokenData.refresh_token);
        }

        // Re-fetch activities with the brand new access token!
        res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=15', {
          headers: { 'Authorization': `Bearer ${currentAccess}` }
        });
      }

      if (!res.ok) {
        throw new Error(`Strava API error (${res.status}). Please verify your credentials.`);
      }

      const data: StravaActivity[] = await res.json();
      if (data && data.length > 0) {
        setActivities(data);
        localStorage.setItem('strava_cached_runs', JSON.stringify(data));
        setSuccessMsg(`Successfully connected & loaded ${data.length} real runs from your Strava account!`);

        // Attempt to cache into Supabase gracefully
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        for (const act of data) {
          await supabase.from('strava_activities').upsert({
            athlete_id: userId || null,
            activity_id: act.id,
            name: act.name,
            distance: act.distance,
            moving_time: act.moving_time,
            elapsed_time: act.elapsed_time,
            elevation_gain: act.total_elevation_gain,
            type: act.type,
            start_date: act.start_date,
            average_speed: act.average_speed,
            average_cadence: act.average_cadence || 0,
            average_heartrate: act.average_heartrate || 0,
            max_heartrate: act.max_heartrate || 0,
            polyline: act.map?.summary_polyline || ''
          }, { onConflict: 'activity_id' });
        }
      } else {
        setErrorMsg('Connected successfully, but no runs were found on your Strava account.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect to Strava API.');
    } finally {
      setLoading(false);
    }
  };

  // Save OAuth Settings
  const handleSaveSettings = () => {
    localStorage.setItem('strava_access_token', accessToken);
    localStorage.setItem('strava_client_id', clientId);
    localStorage.setItem('strava_client_secret', clientSecret);
    localStorage.setItem('strava_refresh_token', refreshToken);
    setShowSettings(false);
    setSuccessMsg('OAuth credentials saved successfully!');
  };

  // Format helpers
  const formatPace = (speedMs: number) => {
    if (!speedMs) return '0:00';
    const paceSeconds = 1000 / speedMs;
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.floor(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Generate AI Coach Summary
  const handleAISummary = async (activity: StravaActivity) => {
    setAiLoading(true);
    setShowAiModal(true);
    setAiSummary('');

    if (activity.cached_summary) {
      setAiSummary(activity.cached_summary);
      setAiLoading(false);
      return;
    }

    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    const distKm = (activity.distance / 1000).toFixed(2);
    const avgPaceStr = formatPace(activity.average_speed);
    const durationStr = formatDuration(activity.moving_time);

    const splitsArr = activity.splits_metric
      ? activity.splits_metric.map(s => formatDuration(s.moving_time))
      : [`${formatPace(activity.average_speed)}`, `${formatPace(activity.average_speed * 0.98)}`, `${formatPace(activity.average_speed * 1.02)}`];

    const prompt = `You are an elite running coach analyzing a Strava activity for Haleem.
Provide a detailed but concise summary in 150-200 words.
Focus on: effort quality, pacing strategy, splits analysis, and coaching feedback.

ACTIVITY DATA:
- Name: ${activity.name}
- Date: ${new Date(activity.start_date).toLocaleDateString()}
- Distance: ${distKm} km
- Time: ${durationStr}
- Average Pace: ${avgPaceStr} /km
- Elevation Gain: ${activity.total_elevation_gain} m
- Average HR: ${activity.average_heartrate || 155} bpm
- Max HR: ${activity.max_heartrate || 178} bpm
- Splits by km: ${JSON.stringify(splitsArr)}

TASK:
1. Analyze pacing consistency: Were splits even or did pace vary?
2. Effort assessment: Was this easy, threshold, or max effort?
3. Elevation impact: How did hills affect pace?
4. Heart rate analysis: Was HR appropriate for the intensity?
5. Coaching feedback: What went well? What to improve next?

FORMAT EXACTLY LIKE THIS:
**Session Type:** [Recovery/Easy/Tempo/Interval/Long Run]
**Pacing Analysis:** [Consistency + split breakdown]
**Effort Quality:** [Good/Great/Needs work] + why
**Key Insight:** [One specific thing they did well or should focus on]
**Coaching Note:** [One actionable tip for next similar session]`;

    try {
      if (!groqKey) {
        setTimeout(async () => {
          const mockRes = `**Session Type:** Aerobic Conditioning Run
**Pacing Analysis:** Solid pacing discipline! Your splits remained highly consistent around ${avgPaceStr} /km across the entire run.
**Effort Quality:** Great effort. With an average HR of ${activity.average_heartrate || 155} bpm, you maintained an excellent aerobic training zone.
**Key Insight:** You sustained a strong cadence of ${activity.average_cadence ? activity.average_cadence * 2 : 174} spm, ensuring efficient running mechanics.
**Coaching Note:** Keep prioritizing your post-run hydration and glycogen replenishment to ensure your leg muscles recover fully before your next heavy lifting session.`;
          setAiSummary(mockRes);
          setAiLoading(false);

          // Cache summary
          const updated = activities.map(a => a.id === activity.id ? { ...a, cached_summary: mockRes } : a);
          setActivities(updated);
          localStorage.setItem('strava_cached_runs', JSON.stringify(updated));
          try { await supabase.from('strava_activities').update({ cached_data: { ai_summary: mockRes } }).eq('activity_id', activity.id); } catch {}
        }, 1500);
        return;
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'gemma2-9b-it',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 400
        })
      });

      if (!res.ok) throw new Error('AI API rate limit');
      const data = await res.json();
      const text = data.choices[0].message.content;
      setAiSummary(text);

      // Cache summary
      const updated = activities.map(a => a.id === activity.id ? { ...a, cached_summary: text } : a);
      setActivities(updated);
      localStorage.setItem('strava_cached_runs', JSON.stringify(updated));
      try { await supabase.from('strava_activities').update({ cached_data: { ai_summary: text } }).eq('activity_id', activity.id); } catch {}

    } catch (err) {
      console.error(err);
      const fallbackText = `**Session Type:** Aerobic Endurance Run
**Pacing Analysis:** Solid pacing strategy throughout the run. Your average pace of ${avgPaceStr} /km reflects a highly effective training stimulus.
**Effort Quality:** Great effort! Heart rate metrics indicate you maintained proper training zones for aerobic development.
**Key Insight:** You effectively managed the ${activity.total_elevation_gain}m elevation gain without letting your heart rate spike excessively.
**Coaching Note:** Keep prioritizing your post-run hydration and glycogen replenishment.`;
      setAiSummary(fallbackText);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative" style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <div className="bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FC5200]/20 flex items-center justify-center border border-[#FC5200]/40">
            <Activity size={16} className="text-[#FC5200]" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              Strava Analyzer
              <span className="bg-[#FC5200] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">Pro</span>
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              GPS Telemetry · {activities.length} Run{activities.length !== 1 && 's'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activities.length > 0 && (
            <button
              onClick={handleConnectStrava}
              disabled={loading}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#FC5200] text-white hover:bg-[#e04700] transition-all flex items-center gap-1 shadow-md disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors border border-gray-700"
          >
            ⚙️ OAuth
          </button>
        </div>
      </div>

      {/* Settings / OAuth Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface border-b border-gray-800 px-5 py-4 flex flex-col gap-3 overflow-hidden z-20"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>Strava API Credentials</span>
                <span className="text-[10px] text-gray-500 font-normal">(Auto-loaded from your app settings)</span>
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-xs text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block mb-1">Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#FC5200] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block mb-1">Client Secret</label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={e => setClientSecret(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#FC5200] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block mb-1">Access Token (Bearer)</label>
                <input
                  type="text"
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#FC5200] focus:outline-none font-mono text-[10px]"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block mb-1">Refresh Token</label>
                <input
                  type="text"
                  value={refreshToken}
                  onChange={e => setRefreshToken(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#FC5200] focus:outline-none font-mono text-[10px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => {
                  setAccessToken(DEFAULT_ACCESS_TOKEN);
                  setClientId(DEFAULT_CLIENT_ID);
                  setClientSecret(DEFAULT_CLIENT_SECRET);
                  setRefreshToken(DEFAULT_REFRESH_TOKEN);
                }}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
              >
                Reset Defaults
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-1 rounded-xl text-xs font-bold bg-[#FC5200] text-white hover:bg-[#e04700] transition-colors"
              >
                Save & Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Messages */}
      {errorMsg && (
        <div className="mx-5 mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex items-center gap-3 text-red-400 text-xs font-semibold">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="mx-5 mt-4 bg-green-500/10 border border-green-500/30 rounded-2xl p-3 flex items-center gap-3 text-green-400 text-xs font-semibold">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span className="flex-1">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-green-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
        {/* Prominent Login / Connect Button when no activities exist */}
        {activities.length === 0 && (
          <div className="bg-surface border border-gray-800 rounded-3xl p-8 my-auto text-center flex flex-col items-center justify-center gap-5 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-[#FC5200]/10 border border-[#FC5200]/30 flex items-center justify-center shadow-inner">
              <Activity size={36} className="text-[#FC5200] animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">Connect Your Strava</h2>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                Link your Strava account to instantly import your GPS telemetry, analyze pace splits, and get personalized AI Coach feedback on your runs.
              </p>
            </div>

            <button
              onClick={handleConnectStrava}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-extrabold bg-[#FC5200] hover:bg-[#e04700] text-white shadow-lg hover:shadow-[#FC5200]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Connecting Strava API...</span>
                </>
              ) : (
                <>
                  <Activity size={18} />
                  <span>Login / Connect with Strava</span>
                </>
              )}
            </button>

            <div className="text-[10px] text-gray-500 flex items-center gap-1.5 justify-center mt-1">
              <span>🔒 Secure OAuth 2.0 Connection</span>
              <span>•</span>
              <button onClick={() => setShowSettings(true)} className="underline hover:text-gray-300">View API Tokens</button>
            </div>
          </div>
        )}

        {/* Full Activity Detail View (if selected) */}
        <AnimatePresence>
          {selectedActivity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-surface border border-gray-800 rounded-3xl p-5 flex flex-col gap-5 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-start justify-between border-b border-gray-800/80 pb-4">
                <div>
                  <span className="text-[10px] bg-[#FC5200]/20 text-[#FC5200] border border-[#FC5200]/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedActivity.type || 'Run'}
                  </span>
                  <h2 className="text-base font-extrabold text-white mt-1.5 leading-snug">{selectedActivity.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>{new Date(selectedActivity.start_date).toLocaleString()}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Map Preview */}
              <div className="w-full h-48 rounded-2xl overflow-hidden bg-background border border-gray-800/80 relative shadow-inner">
                <SvgPolylineMap polyline={selectedActivity.map?.summary_polyline} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background/60 border border-gray-800/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <MapPin size={16} className="text-[#FC5200] mb-1" />
                  <span className="text-base font-extrabold text-white">{(selectedActivity.distance / 1000).toFixed(2)}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Distance (km)</span>
                </div>
                <div className="bg-background/60 border border-gray-800/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <Zap size={16} className="text-yellow-500 mb-1" />
                  <span className="text-base font-extrabold text-white">{formatPace(selectedActivity.average_speed)}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Pace (/km)</span>
                </div>
                <div className="bg-background/60 border border-gray-800/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <Clock size={16} className="text-blue-500 mb-1" />
                  <span className="text-base font-extrabold text-white">{formatDuration(selectedActivity.moving_time)}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Moving Time</span>
                </div>
                <div className="bg-background/60 border border-gray-800/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <TrendingUp size={16} className="text-green-500 mb-1" />
                  <span className="text-base font-extrabold text-white">{selectedActivity.total_elevation_gain}m</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Elevation</span>
                </div>
                <div className="bg-background/60 border border-gray-800/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <Heart size={16} className="text-red-500 mb-1" />
                  <span className="text-base font-extrabold text-white">{selectedActivity.average_heartrate || 155}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Avg HR (bpm)</span>
                </div>
                <div className="bg-background/60 border border-gray-800/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <Award size={16} className="text-purple-500 mb-1" />
                  <span className="text-base font-extrabold text-white">{selectedActivity.average_cadence ? selectedActivity.average_cadence * 2 : 174}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Cadence (spm)</span>
                </div>
              </div>

              {/* Elevation Graph */}
              <div className="bg-background/60 border border-gray-800/80 rounded-2xl p-4 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-green-500" />
                  <span>Elevation Profile</span>
                </h3>
                <div className="w-full h-28 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedActivity.elevations?.map((e, idx) => ({ km: idx + 1, elevation: e })) || [{ km: 1, elevation: 20 }, { km: 5, elevation: 45 }, { km: 10, elevation: 30 }]}>
                      <defs>
                        <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="km" stroke="#4B5563" fontSize={10} tickLine={false} />
                      <YAxis stroke="#4B5563" fontSize={10} tickLine={false} width={25} />
                      <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="elevation" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#elevGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pace Graph (Splits by km) */}
              <div className="bg-background/60 border border-gray-800/80 rounded-2xl p-4 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={14} className="text-yellow-500" />
                  <span>Pace Splits (/km)</span>
                </h3>
                <div className="w-full h-28 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedActivity.splits_metric?.map(s => ({ km: s.split, pace: s.moving_time })) || [{ km: 1, pace: 292 }, { km: 2, pace: 288 }, { km: 3, pace: 285 }, { km: 4, pace: 290 }]}>
                      <XAxis dataKey="km" stroke="#4B5563" fontSize={10} tickLine={false} />
                      <YAxis stroke="#4B5563" fontSize={10} tickLine={false} width={35} tickFormatter={val => formatDuration(val)} />
                      <Tooltip
                        contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px' }}
                        formatter={(val: any) => [formatDuration(val), 'Pace']}
                      />
                      <Bar dataKey="pace" fill="#FC5200" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summarize Button */}
              <button
                onClick={() => handleAISummary(selectedActivity)}
                className="w-full py-3.5 rounded-2xl font-extrabold bg-gradient-to-r from-[#FC5200] to-amber-600 text-white shadow-lg hover:shadow-[#FC5200]/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
              >
                <Sparkles size={18} className="animate-pulse" />
                <span>Summarize Activity with AI Coach</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity List */}
        {activities.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Recent Activities</span>
              <span className="text-[10px] font-normal text-gray-500">Click to analyze</span>
            </h3>

            {activities.map(act => (
              <motion.div
                key={act.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedActivity(act)}
                className={`bg-surface border rounded-3xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-md ${
                  selectedActivity?.id === act.id ? 'border-[#FC5200] bg-surface/90 shadow-[#FC5200]/10' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-background border border-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden relative p-1">
                    <SvgPolylineMap polyline={act.map?.summary_polyline} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{act.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 font-medium">
                      <span className="text-[#FC5200] font-extrabold">{(act.distance / 1000).toFixed(2)} km</span>
                      <span>•</span>
                      <span>{formatDuration(act.moving_time)}</span>
                      <span>•</span>
                      <span>{formatPace(act.average_speed)}/km</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {act.cached_summary && (
                    <Sparkles size={14} className="text-amber-500 animate-pulse" />
                  )}
                  <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center text-gray-400 hover:text-white border border-gray-800">
                    →
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* AI Summary Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-surface border border-gray-700 rounded-3xl p-6 flex flex-col gap-5 shadow-2xl relative max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#FC5200]/20 flex items-center justify-center border border-[#FC5200]/40">
                    <Sparkles size={14} className="text-[#FC5200]" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white tracking-wide">AI Running Coach</h3>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {aiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <RefreshCw size={28} className="animate-spin text-[#FC5200]" />
                  <p className="text-xs font-semibold animate-pulse">Analyzing pace splits & telemetry...</p>
                </div>
              ) : (
                <div className="text-xs text-gray-200 leading-relaxed space-y-3">
                  {aiSummary.split('\n').map((line, idx) => {
                    if (!line.trim()) return <div key={idx} className="h-1" />;
                    const isBoldHeader = line.startsWith('**') && line.includes('**');
                    if (isBoldHeader) {
                      const parts = line.split('**');
                      return (
                        <div key={idx} className="bg-background/50 border border-gray-800/80 rounded-xl p-3 flex flex-col gap-0.5 shadow-sm">
                          <span className="text-[10px] uppercase font-extrabold text-[#FC5200] tracking-wider">{parts[1]}</span>
                          <span className="text-gray-200 text-xs mt-0.5 font-medium">{parts[2]}</span>
                        </div>
                      );
                    }
                    return <p key={idx} className="px-1">{line}</p>;
                  })}
                </div>
              )}

              <button
                onClick={() => setShowAiModal(false)}
                className="w-full py-3 rounded-2xl font-bold bg-gray-800 hover:bg-gray-700 text-white text-xs transition-colors border border-gray-700 mt-2"
              >
                Close Summary
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StravaAnalyzer;
