import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { GymReceipt } from '../../components/GymReceipt';
import { SegmentalBodyMap } from '../../components/SegmentalBodyMap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Dumbbell, ChevronLeft, ChevronRight, Trash2,
  LogOut, Search, X, Calendar, Sparkles, ArrowLeft,
  Plus, CheckCircle2, Clock, Droplets,
  ChevronDown, ChevronUp, Edit3, Save, FileText, RefreshCw,
  Activity, Droplet, Flame, Users
} from 'lucide-react';

const getLocalDateString = (d: Date = new Date()) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

// Use secure authenticated client for coach writes
const db = supabase;

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function StatCard({ label, value, max, unit, color, emoji }: {
  label: string; value: number; max: number; unit: string; color: string; emoji: string;
}) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-3.5 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{emoji} {label}</span>
        <span className="text-[11px] font-black" style={{ color }}>{pct}%</span>
      </div>
      <ProgressBar value={value} max={max} color={color} />
      <div className="flex justify-between text-[10px] text-gray-500 font-bold">
        <span style={{ color }}>{value.toFixed(unit === 'L' ? 1 : 0)}{unit}</span>
        <span>/ {max.toFixed(unit === 'L' ? 1 : 0)}{unit}</span>
      </div>
    </div>
  );
}

// Color for any day type badge
function dayColor(dt: string) {
  const u = dt.toUpperCase();
  if (u === 'PUSH') return 'bg-blue-900/40 text-blue-400 border-blue-800/30';
  if (u === 'PULL') return 'bg-purple-900/40 text-purple-400 border-purple-800/30';
  if (u === 'LEGS') return 'bg-green-900/40 text-green-400 border-green-800/30';
  if (u === 'REST') return 'bg-gray-800/80 text-gray-400 border-gray-700/30';
  if (u === 'RUN') return 'bg-amber-900/40 text-amber-400 border-amber-800/30';
  if (u.includes('REST') && u.includes('RUN')) return 'bg-orange-900/40 text-orange-400 border-orange-800/30';
  return 'bg-indigo-900/40 text-indigo-400 border-indigo-800/30';
}

export default function DashboardPage() {
  const navigate = useNavigate();

  // Auth
  const [passcode, setPasscode] = useState('');
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('coach_hub_authed') === 'true');
  const [shake, setShake] = useState(false);

  // Data
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [activeDateStr, setActiveDateStr] = useState(() => getLocalDateString());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'diet' | 'water' | 'workouts' | 'inbody'>('overview');

  // Client data
  const [profileTargets, setProfileTargets] = useState<any>(null);
  const [dietLog, setDietLog] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [waterLogs, setWaterLogs] = useState<any[]>([]);
  const [workoutsList, setWorkoutsList] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [exerciseDb, setExerciseDb] = useState<any[]>([]);
  const [selectedReceiptWorkout, setSelectedReceiptWorkout] = useState<any>(null);

  // CSV Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // UI state
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [searchExerciseQuery, setSearchExerciseQuery] = useState('');
  const [activeSplitEditKey, setActiveSplitEditKey] = useState<string | null>(null);
  const [showAddMealForm, setShowAddMealForm] = useState(false);
  const [showAddScanForm, setShowAddScanForm] = useState(false);
  const [expandedScanId, setExpandedScanId] = useState<string | null>(null);
  const [showAddSplitForm, setShowAddSplitForm] = useState(false);
  const [editingDayType, setEditingDayType] = useState<string | null>(null);

  // Day-type nutrition target inputs
  const [targetKcal, setTargetKcal] = useState(2400);
  const [targetProtein, setTargetProtein] = useState(160);
  const [targetCarbs, setTargetCarbs] = useState(240);
  const [targetFat, setTargetFat] = useState(70);
  const [targetWaterLiters, setTargetWaterLiters] = useState(3.5);
  const [dayNutrition, setDayNutrition] = useState<Record<string, { kcal: number; protein: number; carbs: number; fat: number }>>({});
  const [editDayKcal, setEditDayKcal] = useState(0);
  const [editDayProtein, setEditDayProtein] = useState(0);
  const [editDayCarbs, setEditDayCarbs] = useState(0);
  const [editDayFat, setEditDayFat] = useState(0);

  // Meal form inputs
  const [newMealName, setNewMealName] = useState('');
  const [newMealKcal, setNewMealKcal] = useState(400);
  const [newMealProtein, setNewMealProtein] = useState(30);
  const [newMealCarbs, setNewMealCarbs] = useState(45);
  const [newMealFat, setNewMealFat] = useState(10);

  // Water inputs
  const [newWaterAmount, setNewWaterAmount] = useState(500);

  // Scan inputs
  const [newScanDate, setNewScanDate] = useState(() => getLocalDateString());
  const [newScanWeight, setNewScanWeight] = useState('');
  const [newScanSmm, setNewScanSmm] = useState('');
  const [newScanBfPercent, setNewScanBfPercent] = useState('');
  const [newScanScore, setNewScanScore] = useState(75);

  // Split inputs
  const [newSplitDayName, setNewSplitDayName] = useState('');

  // Owner dashboard state
  const [coachUserId, setCoachUserId] = useState<string | null>(null);

  // ─── BASE DATA FETCH ────────────────────────────────────
  useEffect(() => {
    if (!isAuthed) return;
    const fetchBase = async () => {
      // Fetch coach's auth ID
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCoachUserId(session.user.id);
      }

      const { data: userProfiles } = await db.from('profiles').select('*').order('display_name');
      if (userProfiles) {
        setProfiles(userProfiles);
        if (userProfiles.length > 0 && !selectedUserId) setSelectedUserId(userProfiles[0].id);
      }
      const { data: exercises } = await db.from('exercises').select('*').order('name');
      if (exercises) setExerciseDb(exercises);
    };
    fetchBase();
  }, [isAuthed]);

  // ─── CLIENT DATA FETCH ───────────────────────────────────
  const fetchClientData = async (userId: string, dateStr: string, silent = false) => {
    if (!userId) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      // Profile & targets
      const { data: profile } = await db.from('profiles').select('*').eq('id', userId).single();
      const tgt = profile?.targets || null;
      setProfileTargets(tgt);
      if (tgt) {
        setTargetKcal(tgt.kcal || 2400);
        setTargetProtein(tgt.protein || 160);
        setTargetCarbs(tgt.carbs || 240);
        setTargetFat(tgt.fat || 70);
        setTargetWaterLiters((tgt.water_goal_ml || 3500) / 1000);
        setDayNutrition(tgt.day_nutrition || {});
      }

      // Fetch actual user workout plans (never seed – show exactly what athlete has)
      const { data: plansData } = await db
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      setWorkoutPlans(plansData || []);

      // Diet log for the date
      const { data: dLog } = await db.from('diet_logs').select('*').eq('user_id', userId).eq('date', dateStr).maybeSingle();
      setDietLog(dLog || null);

      if (dLog) {
        const { data: dMeals } = await db.from('diet_meals').select('*').eq('diet_log_id', dLog.id).order('created_at', { ascending: true });
        setMeals(dMeals || []);
      } else {
        setMeals([]);
      }

      // Water logs for the date
      const { data: wLogs } = await db.from('water_logs').select('*').eq('user_id', userId).eq('date', dateStr).order('time', { ascending: true });
      setWaterLogs(wLogs || []);

      // Workouts for the date
      const { data: wList } = await db.from('workouts').select('*').eq('user_id', userId).eq('date', dateStr);
      setWorkoutsList(wList || []);

      // InBody scans (all, newest first)
      const { data: inbodyScans } = await db.from('inbody_scans').select('*').eq('user_id', userId).order('date', { ascending: false });
      setScans(inbodyScans || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load client data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) fetchClientData(selectedUserId, activeDateStr);
  }, [selectedUserId, activeDateStr]);

  // ─── REAL-TIME SUBSCRIPTION ─────────────────────────────
  useEffect(() => {
    if (!isAuthed || !selectedUserId || !activeDateStr) return;

    const channel = supabase
      .channel(`coach-realtime-${selectedUserId}-${activeDateStr}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'water_logs' }, () => {
        fetchClientData(selectedUserId, activeDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diet_meals' }, () => {
        fetchClientData(selectedUserId, activeDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diet_logs' }, () => {
        fetchClientData(selectedUserId, activeDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts' }, () => {
        fetchClientData(selectedUserId, activeDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbody_scans' }, () => {
        fetchClientData(selectedUserId, activeDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchClientData(selectedUserId, activeDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_workout_plans' }, () => {
        fetchClientData(selectedUserId, activeDateStr, true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthed, selectedUserId, activeDateStr]);



  // ─── AUTH ────────────────────────────────────────────────
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '425336') {
      sessionStorage.setItem('coach_hub_authed', 'true');
      setIsAuthed(true);
      toast.success('Welcome Coach! 💪');
    } else {
      setShake(true);
      toast.error('Access denied. Incorrect passcode.');
      setPasscode('');
      setTimeout(() => setShake(false), 600);
    }
  };

  const handleLogOut = () => {
    sessionStorage.removeItem('coach_hub_authed');
    setIsAuthed(false);
    setPasscode('');
  };

  const handleOpenReceipt = async (w: any) => {
    navigate(`/workout/${w.id}`);
  };

  const calculateInBodyDelta = (current: number, previous: number, invertColors = false) => {
    if (previous === undefined || previous === null || previous === 0) return null;
    const diff = current - previous;
    if (diff === 0) return <span className="text-gray-500 text-[10px] ml-1">(-)</span>;
    const isPositive = diff > 0;
    const isGood = invertColors ? !isPositive : isPositive;
    return (
      <span className={`text-[10px] ml-1 font-bold ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
        ({isPositive ? '+' : ''}{diff.toFixed(1)})
      </span>
    );
  };

  // ─── HELPERS ─────────────────────────────────────────────
  const currentClient = profiles.find(p => p.id === selectedUserId);

  const shiftDate = (days: number) => {
    const d = new Date(activeDateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setActiveDateStr(getLocalDateString(d));
  };

  const todayStr = getLocalDateString();
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  })();

  const consumedMacros = meals.reduce(
    (acc, m) => {
      m.items?.forEach((item: any) => {
        acc.kcal += item.macros?.kcal || 0;
        acc.protein += item.macros?.protein || 0;
        acc.carbs += item.macros?.carbs || 0;
        acc.fat += item.macros?.fat || 0;
      });
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const waterTotalMl = waterLogs.reduce((acc, log) => acc + (log.amount_ml || 0), 0);
  const hasCompleted = workoutsList.some(w => w.status === 'completed');
  const hasInProgress = workoutsList.some(w => w.status === 'in_progress');
  const workoutStatus = hasCompleted ? 1.0 : hasInProgress ? 0.5 : 0;

  const filteredProfiles = profiles.filter(p => {
    if (!searchUserQuery) return true;
    return p.display_name?.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchUserQuery.toLowerCase());
  });

  const filteredCatalog = exerciseDb.filter(ex => {
    if (!searchExerciseQuery) return false;
    return ex.name.toLowerCase().includes(searchExerciseQuery.toLowerCase()) ||
      ex.muscle_group?.toLowerCase().includes(searchExerciseQuery.toLowerCase());
  }).slice(0, 6);

  // Athlete day types from their actual plans
  const athleteDayTypes = workoutPlans.map(p => p.plan_type);

  // ─── SAVE DAY-TYPE NUTRITION ────────────────────────────
  const handleOpenDayEdit = (dt: string) => {
    const existing = dayNutrition[dt];
    setEditDayKcal(existing?.kcal ?? targetKcal);
    setEditDayProtein(existing?.protein ?? targetProtein);
    setEditDayCarbs(existing?.carbs ?? targetCarbs);
    setEditDayFat(existing?.fat ?? targetFat);
    setEditingDayType(dt);
  };

  const handleSaveDayNutrition = async () => {
    try {
      const updDN = { ...dayNutrition, [editingDayType!]: { kcal: editDayKcal, protein: editDayProtein, carbs: editDayCarbs, fat: editDayFat } };
      const upd = { ...profileTargets, day_nutrition: updDN };
      const { error } = await db.from('profiles').update({ targets: upd }).eq('id', selectedUserId);
      if (error) throw error;
      setDayNutrition(updDN);
      setProfileTargets(upd);
      setEditingDayType(null);
      toast.success(`${editingDayType} day macros saved!`);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update targets. Please try again.');
    }
  };

  // ─── SAVE WATER GOAL ─────────────────────────────────────
  const handleSaveWaterGoal = async () => {
    try {
      const upd = { ...profileTargets, water_goal_ml: Math.round(targetWaterLiters * 1000) };
      const { error } = await db.from('profiles').update({ targets: upd }).eq('id', selectedUserId);
      if (error) throw error;
      setProfileTargets(upd);
      toast.success('Water goal updated!');
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update water goals. Please try again.');
    }
  };

  // ─── ADD MEAL ────────────────────────────────────────────
  const handleAddMealLog = async () => {
    if (!newMealName.trim()) { toast.error('Enter a meal name'); return; }
    try {
      let logId = dietLog?.id;
      if (!logId) {
        const { data: newLog, error: le } = await db.from('diet_logs').insert({
          user_id: selectedUserId, date: activeDateStr,
          daily_totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0, completed: false }
        }).select().single();
        if (le) throw le;
        logId = newLog.id;
        setDietLog(newLog);
      }
      const item = { id: `ci-${Date.now()}`, food_id: 'custom', name: newMealName, grams: 100, macros: { kcal: newMealKcal, protein: newMealProtein, carbs: newMealCarbs, fat: newMealFat } };
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
      const { data: nm, error: me } = await db.from('diet_meals').insert({
        diet_log_id: logId, name: newMealName,
        time: timeStr,
        items: [item]
      }).select().single();
      if (me) throw me;

      const allMeals = [...meals, nm];
      const totals = allMeals.reduce((t, m) => {
        m.items?.forEach((i: any) => { t.kcal += i.macros.kcal || 0; t.protein += i.macros.protein || 0; t.carbs += i.macros.carbs || 0; t.fat += i.macros.fat || 0; });
        return t;
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0, water: dietLog?.daily_totals?.water || 0, completed: false });
      await db.from('diet_logs').update({ daily_totals: totals }).eq('id', logId);

      toast.success('Meal logged!');
      setNewMealName(''); setShowAddMealForm(false);
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to log meal. Please try again.');
    }
  };

  // ─── DELETE MEAL ─────────────────────────────────────────
  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await db.from('diet_meals').delete().eq('id', mealId);
      if (error) throw error;
      const remaining = meals.filter(m => m.id !== mealId);
      const totals = remaining.reduce((t, m) => {
        m.items?.forEach((i: any) => { t.kcal += i.macros.kcal || 0; t.protein += i.macros.protein || 0; t.carbs += i.macros.carbs || 0; t.fat += i.macros.fat || 0; });
        return t;
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0, water: dietLog?.daily_totals?.water || 0, completed: false });
      if (dietLog) await db.from('diet_logs').update({ daily_totals: totals }).eq('id', dietLog.id);
      toast.success('Meal deleted');
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to remove meal. Please try again.');
    }
  };

  // ─── WATER LOGS ──────────────────────────────────────────
  const handleAddWater = async () => {
    if (!selectedUserId) return;
    try {
      const now = new Date();
      const { error } = await db.from('water_logs').insert({
        user_id: selectedUserId,
        date: activeDateStr,
        time: now.toISOString(),
        amount_ml: newWaterAmount
      });
      if (error) throw error;
      toast.success(`${newWaterAmount}ml logged for ${currentClient?.display_name}!`);
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update water log. Please try again.');
    }
  };

  const handleDeleteWater = async (id: string) => {
    const { error } = await db.from('water_logs').delete().eq('id', id);
    if (error) {
      console.error(error);
      toast.error('Unable to delete water log. Please try again.');
      return;
    }
    toast.success('Entry removed');
    fetchClientData(selectedUserId, activeDateStr, true);
  };

  const handleClearWater = async () => {
    const { error } = await db.from('water_logs').delete().eq('user_id', selectedUserId).eq('date', activeDateStr);
    if (error) {
      console.error(error);
      toast.error('Unable to clear water logs. Please try again.');
      return;
    }
    toast.success('Water logs cleared');
    fetchClientData(selectedUserId, activeDateStr, true);
  };

  // ─── INBODY SCANS ────────────────────────────────────────
  const handleAddInBodyScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(newScanWeight);
    if (isNaN(wt) || wt <= 0) { toast.error('Enter valid weight'); return; }
    try {
      const bfVal = parseFloat(newScanBfPercent) || 0;
      const smmVal = parseFloat(newScanSmm) || 0;
      const { error } = await db.from('inbody_scans').insert({
        user_id: selectedUserId, date: newScanDate, weight: wt, smm: smmVal,
        bfm: parseFloat(((wt * bfVal) / 100).toFixed(1)), bf_percent: bfVal,
        bmr: Math.round(10 * wt + 6.25 * 175 - 5 * 25 + 5), score: newScanScore,
        segmental: { visceralFat: 6, tbw: Math.round(wt * 0.6), protein: Math.round(wt * 0.18), minerals: Math.round(wt * 0.05), raLean: Math.round(wt * 0.05), laLean: Math.round(wt * 0.05), trunkLean: Math.round(wt * 0.28), rlLean: Math.round(wt * 0.12), llLean: Math.round(wt * 0.12) }
      });
      if (error) throw error;
      toast.success('Scan saved!');
      setNewScanWeight(''); setNewScanSmm(''); setNewScanBfPercent(''); setShowAddScanForm(false);
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to save biometrics record. Please try again.');
    }
  };

  const handleDeleteScan = async (id: string) => {
    if (!window.confirm('Delete this scan?')) return;
    const { error } = await db.from('inbody_scans').delete().eq('id', id);
    if (error) {
      console.error(error);
      toast.error('Unable to delete scan. Please try again.');
      return;
    }
    toast.success('Scan deleted');
    fetchClientData(selectedUserId, activeDateStr, true);
  };

  // InBody CSV upload & parsing
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) { setIsImporting(false); return; }

      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        toast.error('Invalid CSV file or empty file.');
        setIsImporting(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const payloads = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(v => v.trim());
        if (row.length < 5) continue;

        const getValue = (keyContains: string) => {
          const idx = headers.findIndex(h => h.includes(keyContains.toLowerCase()));
          return idx !== -1 ? parseFloat(row[idx]) : 0;
        };

        const getString = (keyContains: string) => {
          const idx = headers.findIndex(h => h.includes(keyContains.toLowerCase()));
          return idx !== -1 ? row[idx] : '';
        };

        const dateRaw = getString('date');
        if (!dateRaw) continue;

        let dateStr = getLocalDateString();
        if (dateRaw.length >= 8) {
          dateStr = `${dateRaw.substring(0, 4)}-${dateRaw.substring(4, 6)}-${dateRaw.substring(6, 8)}`;
        }

        const segmental = {
          visceralFat: getValue('visceral fat level'),
          tbw: getValue('total body water'),
          protein: getValue('protein'),
          minerals: getValue('mineral'),
          raLean: getValue('right arm lean'),
          laLean: getValue('left arm lean'),
          trunkLean: getValue('trunk lean'),
          rlLean: getValue('right leg lean'),
          llLean: getValue('left leg lean'),
        };

        payloads.push({
          user_id: selectedUserId,
          date: dateStr,
          weight: getValue('weight(kg)'),
          smm: getValue('skeletal muscle mass'),
          bfm: getValue('body fat mass'),
          bf_percent: getValue('percent body fat'),
          bmr: getValue('basal metabolic rate'),
          score: getValue('inbody score'),
          segmental: segmental
        });
      }

      if (payloads.length > 0) {
        const { error } = await db.from('inbody_scans').insert(payloads);
        if (error) {
          toast.error('Error during bulk upload: ' + error.message);
        } else {
          toast.success(`Successfully imported ${payloads.length} scans!`);
          fetchClientData(selectedUserId, activeDateStr, true);
        }
      } else {
        toast.error('No valid data found in CSV.');
      }

      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // ─── SPLIT ROUTINES ──────────────────────────────────────
  const handleUpdateExerciseStats = async (planType: string, exId: string, sets: number, rest: number) => {
    try {
      const plan = workoutPlans.find(p => p.plan_type === planType);
      if (!plan) return;
      const upd = plan.exercises.map((e: any) => {
        if (e.id === exId) {
          return { ...e, sets: Math.max(1, sets), rest: Math.max(0, rest) };
        }
        return e;
      });
      const { error } = await db.from('user_workout_plans').update({ exercises: upd }).eq('id', plan.id);
      if (error) throw error;
      setWorkoutPlans(prev => prev.map(p => p.plan_type === planType ? { ...p, exercises: upd } : p));
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update exercise split. Please try again.');
    }
  };

  const handleAddExerciseToSplit = async (planType: string, exercise: any) => {
    try {
      const plan = workoutPlans.find(p => p.plan_type === planType);
      const exs = plan ? [...plan.exercises] : [];
      if (exs.some((e: any) => e.name === exercise.name)) { toast.error('Already in split'); return; }
      exs.push({ id: exercise.id || `ce-${Date.now()}`, name: exercise.name, muscle_group: exercise.muscle_group || '', sets: 3, rest: 120 });

      const { error } = await db.from('user_workout_plans').upsert(
        { user_id: selectedUserId, plan_type: planType, exercises: exs },
        { onConflict: 'user_id,plan_type' }
      );
      if (error) throw error;
      toast.success(`Added to ${planType}`);
      setSearchExerciseQuery('');
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to add exercise. Please try again.');
    }
  };

  const handleRemoveExerciseFromSplit = async (planType: string, exId: string) => {
    try {
      const plan = workoutPlans.find(p => p.plan_type === planType);
      if (!plan) return;
      const upd = plan.exercises.filter((e: any) => e.id !== exId);
      const { error } = await db.from('user_workout_plans').update({ exercises: upd }).eq('id', plan.id);
      if (error) throw error;
      toast.success('Exercise removed');
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to remove exercise. Please try again.');
    }
  };

  const handleCreateSplitDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSplitDayName.trim().toUpperCase();
    if (!name) return;
    if (workoutPlans.some(p => p.plan_type === name)) { toast.error('Already exists'); return; }
    try {
      const { error } = await db.from('user_workout_plans').insert({ user_id: selectedUserId, plan_type: name, exercises: [] });
      if (error) throw error;
      toast.success(`${name} day created!`);
      setNewSplitDayName(''); setShowAddSplitForm(false);
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to create split day. Please try again.');
    }
  };

  const handleDeleteSplitDay = async (id: string) => {
    if (!window.confirm('Delete this split day? All exercises in it will be removed.')) return;
    const { error } = await db.from('user_workout_plans').delete().eq('id', id);
    if (error) {
      console.error(error);
      toast.error('Unable to delete split day. Please try again.');
      return;
    }
    toast.success('Split deleted');
    fetchClientData(selectedUserId, activeDateStr, true);
  };

  const handleRenameSplitDay = async (plan: any) => {
    const newName = window.prompt(`Rename "${plan.plan_type}" to:`, plan.plan_type)?.trim().toUpperCase();
    if (!newName || newName === plan.plan_type) return;
    try {
      if (workoutPlans.some(p => p.plan_type === newName && p.id !== plan.id)) {
        toast.error('A split day with that name already exists');
        return;
      }
      const { error } = await db.from('user_workout_plans').update({ plan_type: newName }).eq('id', plan.id);
      if (error) throw error;
      toast.success(`Renamed to ${newName}!`);
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to rename split day. Please try again.');
    }
  };

  // ─── LOCK SCREEN ─────────────────────────────────────────
  if (!isAuthed) {
    return (
      <div className="flex flex-col items-center justify-center p-5 min-h-[80vh] relative z-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className={`w-full max-w-xs bg-[#0d1220] border border-gray-800 rounded-3xl p-8 space-y-7 relative z-10 shadow-2xl transition-all duration-300 ${shake ? 'scale-95 border-red-800' : ''}`}>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Dumbbell className="text-blue-400" size={28} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Coach Hub</h2>
            <p className="text-xs text-gray-500 mt-1.5">Enter passcode to unlock</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="password" required value={passcode} onChange={e => setPasscode(e.target.value)}
                placeholder="••••••" autoFocus
                className="w-full bg-[#131b2e] border border-gray-700 rounded-2xl py-4 pl-11 pr-4 text-white text-center text-lg tracking-[0.4em] outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-lg shadow-blue-500/20 cursor-pointer">
              Unlock
            </button>
          </form>
          <button onClick={() => navigate(-1)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors cursor-pointer block mx-auto">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN DASHBOARD ──────────────────────────────────────
  return (
    <div
      className="p-4 flex flex-col gap-4 relative z-10 w-full pb-28"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/6 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />

      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-white active:scale-95">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} className="text-blue-400" /> Coach Hub
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">{currentClient?.display_name || 'Select athlete'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {refreshing && <RefreshCw size={13} className="text-blue-400 animate-spin" />}
          <button 
            onClick={() => navigate('/coach/clients')} 
            className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 border border-blue-900/40 hover:border-blue-800 bg-blue-950/20 px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer uppercase"
          >
            <Users size={12} /> Clients
          </button>
          <button onClick={handleLogOut} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-red-400 border border-gray-800 hover:border-red-900/50 bg-gray-900 px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer uppercase">
            <LogOut size={12} /> Lock
          </button>
        </div>
      </div>

      {/* ── ATHLETE SELECTOR ── */}
      <div className="bg-[#0d1220] border border-gray-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowUserPanel(!showUserPanel)}
          className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-sm font-black text-blue-400">
              {currentClient?.display_name?.charAt(0) || '?'}
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-white">{currentClient?.display_name || 'No athlete selected'}</p>
              <p className="text-[10px] text-gray-500">{currentClient?.email}</p>
            </div>
          </div>
          {showUserPanel ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {showUserPanel && (
          <div className="border-t border-gray-800 p-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                value={searchUserQuery} onChange={e => setSearchUserQuery(e.target.value)}
                placeholder="Search athletes..."
                className="w-full bg-[#131b2e] border border-gray-700 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/coach/clients')} 
                className="flex-1 bg-[#131b2e] hover:bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-650 py-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Users size={13} className="text-gray-400" />
                Manage Clients
              </button>
              <button 
                onClick={() => navigate('/coach/clients/new')} 
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus size={13} />
                Add Client
              </button>
            </div>
            <div className="max-h-52 overflow-y-auto space-y-1" style={{ touchAction: 'pan-y' }}>
              {filteredProfiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedUserId(p.id); setShowUserPanel(false); setSearchUserQuery(''); setActiveSplitEditKey(null); }}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${selectedUserId === p.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-gray-800/40'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-black text-gray-300">
                    {p.display_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{p.display_name || 'No name'}</p>
                    <p className="text-[10px] text-gray-500">{p.email}</p>
                  </div>
                  {selectedUserId === p.id && <CheckCircle2 size={14} className="text-blue-400 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* ── OWNER PERSONAL DASHBOARD LINK ── */}
      {coachUserId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' && (
        <button
          onClick={() => navigate('/coach/owner')}
          className="w-full bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-900/40 p-4 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer hover:bg-gray-800/10 shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">👑</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Owner Console</p>
              <p className="text-xs text-white mt-0.5 font-bold">Configure toggles & view system metrics</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      )}

      {/* ── DATE NAVIGATOR ── */}
      <div className="bg-[#0d1220] border border-gray-800 rounded-2xl p-3 flex items-center justify-between gap-2">
        <button onClick={() => shiftDate(-1)} className="p-3 hover:bg-gray-800 rounded-xl transition-colors active:scale-95 cursor-pointer text-gray-400 hover:text-white">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <Calendar size={13} className="text-blue-400" />
          <input
            type="date" value={activeDateStr} onChange={e => setActiveDateStr(e.target.value)}
            className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer"
          />
        </div>
        <button onClick={() => shiftDate(1)} className="p-3 hover:bg-gray-800 rounded-xl transition-colors active:scale-95 cursor-pointer text-gray-400 hover:text-white">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Date presets */}
      <div className="flex gap-2">
        {[{ label: 'Today', val: todayStr }, { label: 'Yesterday', val: yesterdayStr }].map(({ label, val }) => (
          <button
            key={val}
            onClick={() => setActiveDateStr(val)}
            className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer ${activeDateStr === val ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-[#0d1220] border border-gray-800 text-gray-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Dumbbell className="animate-spin text-blue-500" size={28} />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Loading client data...</p>
        </div>
      ) : !selectedUserId ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-500">
          <p className="text-sm font-bold">No athlete selected</p>
        </div>
      ) : (
        <>
          {/* ── COMPLIANCE OVERVIEW ── */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Daily Compliance</h2>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Calories */}
              <div className="bg-[#0d1220] border border-orange-900/30 rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="text-lg">🔥</div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Calories</p>
                  <p className="text-base font-black text-white mt-0.5">{Math.round(consumedMacros.kcal)}</p>
                  <p className="text-[10px] text-orange-400 font-bold">/ {targetKcal}</p>
                </div>
                <ProgressBar value={consumedMacros.kcal} max={targetKcal} color="#f97316" />
              </div>
              {/* Water */}
              <div className="bg-[#0d1220] border border-sky-900/30 rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="text-lg">💧</div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Water</p>
                  <p className="text-base font-black text-white mt-0.5">{(waterTotalMl / 1000).toFixed(1)}L</p>
                  <p className="text-[10px] text-sky-400 font-bold">/ {targetWaterLiters}L</p>
                </div>
                <ProgressBar value={waterTotalMl} max={targetWaterLiters * 1000} color="#38bdf8" />
              </div>
              {/* Training */}
              <div className="bg-[#0d1220] border border-violet-900/30 rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="text-lg">🏋️</div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Training</p>
                  <p className={`text-base font-black mt-0.5 ${workoutStatus === 1.0 ? 'text-green-400' : workoutStatus === 0.5 ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {workoutStatus === 1.0 ? '✓ Done' : workoutStatus === 0.5 ? '⚡ Active' : 'Pending'}
                  </p>
                  <p className="text-[10px] text-violet-400 font-bold">{workoutsList.length} session{workoutsList.length !== 1 ? 's' : ''}</p>
                </div>
                <ProgressBar value={workoutStatus} max={1} color="#a78bfa" />
              </div>
            </div>

            {/* AI Coach Usage Card */}
            <div className="bg-[#0d1220] border border-blue-900/30 rounded-2xl p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-lg select-none">🤖</span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">AI Coach Usage</p>
                  {(() => {
                    const selectedProfile = profiles.find(p => p.id === selectedUserId);
                    const isCoachUser = selectedProfile?.role === 'coach' || selectedUserId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
                    if (isCoachUser) {
                      return (
                        <p className="text-base font-black text-white mt-0.5">
                          Unlimited <span className="text-xs text-gray-500 font-bold">(Coach)</span>
                        </p>
                      );
                    }
                    const limit = profileTargets?.ai_quota_limit ?? 20;
                    const usage = profileTargets?.ai_usage || { date: '', count: 0 };
                    const count = usage.date === activeDateStr ? usage.count : 0;
                    return (
                      <p className="text-base font-black text-white mt-0.5">
                        {count} <span className="text-xs text-gray-500 font-bold">/ {limit} msgs</span>
                      </p>
                    );
                  })()}
                </div>
              </div>
              <div className="flex-1 max-w-[120px]">
                {(() => {
                  const selectedProfile = profiles.find(p => p.id === selectedUserId);
                  const isCoachUser = selectedProfile?.role === 'coach' || selectedUserId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
                  if (isCoachUser) {
                    return <ProgressBar value={0} max={1} color="#3b82f6" />;
                  }
                  const limit = profileTargets?.ai_quota_limit ?? 20;
                  const usage = profileTargets?.ai_usage || { date: '', count: 0 };
                  const count = usage.date === activeDateStr ? usage.count : 0;
                  return <ProgressBar value={count} max={limit} color="#3b82f6" />;
                })()}
              </div>
            </div>

            {/* Macros row */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Protein" value={Math.round(consumedMacros.protein)} max={targetProtein} unit="g" color="#60a5fa" emoji="🍳" />
              <StatCard label="Carbs" value={Math.round(consumedMacros.carbs)} max={targetCarbs} unit="g" color="#fbbf24" emoji="🍯" />
              <StatCard label="Fat" value={Math.round(consumedMacros.fat)} max={targetFat} unit="g" color="#f87171" emoji="🥑" />
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="grid grid-cols-5 bg-[#0d1220] border border-gray-800 rounded-2xl p-1 gap-1">
            {([
              { id: 'overview', label: 'Plan', emoji: '📋' },
              { id: 'diet', label: 'Diet', emoji: '🍎' },
              { id: 'water', label: 'Water', emoji: '💧' },
              { id: 'workouts', label: 'Gym', emoji: '🏋️' },
              { id: 'inbody', label: 'InBody', emoji: '📊' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <span className="block text-sm mb-0.5">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: PLAN / DAY-TYPE NUTRITION ── */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-[#0d1220] border border-gray-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider">📋 Nutrition By Day Type</h3>
                  <p className="text-[10px] text-gray-500">Tap to set macros per day</p>
                </div>

                {athleteDayTypes.length === 0 ? (
                  <div className="text-center py-6 text-gray-600">
                    <p className="text-xs font-bold">No workout days set</p>
                    <p className="text-[10px] mt-1">Go to Gym tab to add days</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {athleteDayTypes.map(dt => {
                      const dn = dayNutrition[dt];
                      const isEditing = editingDayType === dt;
                      return (
                        <div key={dt} className="bg-[#111827] border border-gray-800/80 rounded-xl overflow-hidden">
                          <button
                            onClick={() => isEditing ? setEditingDayType(null) : handleOpenDayEdit(dt)}
                            className="w-full flex items-center justify-between p-3.5 cursor-pointer hover:bg-gray-800/20 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${dayColor(dt)}`}>{dt}</span>
                              {dn ? (
                                <span className="text-[10px] text-gray-400 font-bold">{dn.kcal} kcal · P{dn.protein}g · C{dn.carbs}g · F{dn.fat}g</span>
                              ) : (
                                <span className="text-[10px] text-gray-600 italic">Uses default targets</span>
                              )}
                            </div>
                            <Edit3 size={13} className="text-gray-500 shrink-0" />
                          </button>

                          {isEditing && (
                            <div className="border-t border-gray-800 p-3.5 space-y-3 bg-[#0a0f1a]">
                              <div className="grid grid-cols-2 gap-2.5">
                                {[
                                  { label: 'Calories', val: editDayKcal, set: setEditDayKcal },
                                  { label: 'Protein (g)', val: editDayProtein, set: setEditDayProtein },
                                  { label: 'Carbs (g)', val: editDayCarbs, set: setEditDayCarbs },
                                  { label: 'Fat (g)', val: editDayFat, set: setEditDayFat },
                                ].map(({ label, val, set }) => (
                                  <div key={label}>
                                    <label className="text-[9px] text-gray-500 block mb-1 font-bold uppercase">{label}</label>
                                    <input
                                      type="number" value={val} onChange={e => set(parseInt(e.target.value) || 0)}
                                      className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-blue-500 text-center font-bold"
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button onClick={handleSaveDayNutrition} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl active:scale-95 transition-all cursor-pointer">
                                  <Save size={13} /> Save {dt}
                                </button>
                                <button onClick={() => setEditingDayType(null)} className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Latest InBody quick view */}
              {scans.length > 0 && (
                <div className="bg-[#0d1220] border border-gray-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider">📊 Latest Body Composition</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Weight', val: `${scans[0].weight} kg`, color: 'text-white' },
                      { label: 'Muscle', val: `${scans[0].smm} kg`, color: 'text-blue-400' },
                      { label: 'Body Fat', val: `${scans[0].bf_percent}%`, color: 'text-red-400' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-[#111827] border border-gray-800 rounded-xl p-3 text-center">
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider mb-1">{label}</p>
                        <p className={`text-sm font-black ${color}`}>{val}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-600 text-center">
                    Scan from {new Date(scans[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · Score {scans[0].score}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: DIET ── */}
          {activeTab === 'diet' && (
            <div className="space-y-4">
              <div className="bg-[#0d1220] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                    Meals <span className="text-gray-600">({meals.length})</span>
                  </h3>
                  <button onClick={() => setShowAddMealForm(!showAddMealForm)} className="text-xs font-black text-blue-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                    <Plus size={13} /> {showAddMealForm ? 'Cancel' : 'Add Meal'}
                  </button>
                </div>

                {showAddMealForm && (
                  <div className="border-b border-gray-800 p-4 space-y-3 bg-[#0a0f1a]">
                    <input
                      type="text" value={newMealName} onChange={e => setNewMealName(e.target.value)}
                      placeholder="Meal name (e.g. Chicken & Rice)"
                      className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'kcal', val: newMealKcal, set: setNewMealKcal },
                        { label: 'Protein', val: newMealProtein, set: setNewMealProtein },
                        { label: 'Carbs', val: newMealCarbs, set: setNewMealCarbs },
                        { label: 'Fat', val: newMealFat, set: setNewMealFat },
                      ].map(({ label, val, set }) => (
                        <div key={label}>
                          <p className="text-[9px] text-gray-500 font-bold text-center mb-1">{label}</p>
                          <input type="number" value={val} onChange={e => set(parseInt(e.target.value) || 0)}
                            className="w-full bg-[#0d1220] border border-gray-800 rounded-xl p-2 text-xs text-white text-center outline-none font-bold" />
                        </div>
                      ))}
                    </div>
                    <button onClick={handleAddMealLog} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl active:scale-95 transition-all cursor-pointer">
                      Log Meal for {currentClient?.display_name}
                    </button>
                  </div>
                )}

                <div className="divide-y divide-gray-800/60">
                  {meals.length === 0 ? (
                    <p className="text-xs text-gray-600 italic text-center py-8">No meals logged for this date</p>
                  ) : meals.map(meal => {
                    const mm = meal.items?.reduce((t: any, i: any) => ({
                      kcal: t.kcal + (i.macros?.kcal || 0),
                      protein: t.protein + (i.macros?.protein || 0),
                      carbs: t.carbs + (i.macros?.carbs || 0),
                      fat: t.fat + (i.macros?.fat || 0),
                    }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
                    return (
                      <div key={meal.id} className="flex items-center justify-between p-3.5 gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{meal.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            🔥{Math.round(mm?.kcal || 0)} · P{Math.round(mm?.protein || 0)}g · C{Math.round(mm?.carbs || 0)}g · F{Math.round(mm?.fat || 0)}g
                          </p>
                        </div>
                        <button onClick={() => handleDeleteMeal(meal.id)} className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors shrink-0 cursor-pointer active:scale-95">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: WATER ── */}
          {activeTab === 'water' && (
            <div className="space-y-4">
              {/* Goal editor */}
              <div className="bg-[#0d1220] border border-gray-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-2">
                  <Droplets size={14} /> Daily Water Goal for {currentClient?.display_name}
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number" step="0.25" value={targetWaterLiters} onChange={e => setTargetWaterLiters(parseFloat(e.target.value) || 0)}
                    className="flex-1 min-w-0 bg-[#131b2e] border border-gray-700 rounded-xl p-3 text-lg font-black text-white outline-none focus:border-blue-500 text-center"
                  />
                  <span className="shrink-0 text-sm font-bold text-gray-400">L</span>
                  <button onClick={handleSaveWaterGoal} className="shrink-0 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl active:scale-95 transition-all cursor-pointer">
                    Save
                  </button>
                </div>
                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-sky-400">{(waterTotalMl / 1000).toFixed(2)}L consumed</span>
                    <span className="text-gray-500">{targetWaterLiters > 0 ? Math.round((waterTotalMl / (targetWaterLiters * 1000)) * 100) : 0}%</span>
                  </div>
                  <ProgressBar value={waterTotalMl} max={targetWaterLiters * 1000} color="#38bdf8" />
                </div>
              </div>

              {/* Add water */}
              <div className="bg-[#0d1220] border border-gray-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Log Water</h3>
                  {waterLogs.length > 0 && (
                    <button onClick={handleClearWater} className="text-[10px] font-bold text-red-400 hover:text-red-300 cursor-pointer">Clear All</button>
                  )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {[250, 330, 500, 750, 1000].map(ml => (
                    <button key={ml} onClick={() => setNewWaterAmount(ml)}
                      className={`px-3 py-2 text-[10px] font-black rounded-xl transition-all cursor-pointer ${newWaterAmount === ml ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {ml}ml
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number" step="50" value={newWaterAmount} onChange={e => setNewWaterAmount(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-[#131b2e] border border-gray-700 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-sky-500 text-center"
                  />
                  <span className="self-center text-sm font-bold text-gray-500">ml</span>
                  <button onClick={handleAddWater} className="px-5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer whitespace-nowrap">
                    + Add
                  </button>
                </div>
              </div>

              {/* Water log list */}
              {waterLogs.length > 0 && (
                <div className="bg-[#0d1220] border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-gray-800/60">
                    {waterLogs.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sky-900/30 border border-sky-800/30 flex items-center justify-center text-sm">💧</div>
                          <div>
                            <p className="text-sm font-black text-white">{log.amount_ml}ml</p>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Clock size={9} /> {log.time?.includes('T') ? new Date(log.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : log.time}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteWater(log.id)} className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer active:scale-95">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {waterLogs.length === 0 && (
                <div className="bg-[#0d1220] border border-gray-800/60 rounded-2xl p-6 text-center">
                  <p className="text-2xl mb-2">💧</p>
                  <p className="text-xs text-gray-600 font-bold">{currentClient?.display_name} hasn't logged water today</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: WORKOUTS ── */}
          {activeTab === 'workouts' && (
            <div className="space-y-4">
              {/* Sessions for the day */}
              <div className="bg-[#0d1220] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                    Sessions on {activeDateStr} <span className="text-gray-600">({workoutsList.length})</span>
                  </h3>
                </div>
                {workoutsList.length === 0 ? (
                  <p className="text-xs text-gray-600 italic text-center py-8">No workouts logged on this date</p>
                ) : (
                  <div className="divide-y divide-gray-800/60">
                    {workoutsList.map(w => (
                      <div
                        key={w.id}
                        onClick={() => w.status === 'completed' && handleOpenReceipt(w)}
                        className={`p-4 space-y-2.5 transition-all ${w.status === 'completed'
                          ? 'hover:bg-gray-800/40 cursor-pointer'
                          : ''
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${dayColor(w.day_type || '')}`}>{w.day_type || 'WORKOUT'}</span>
                            <span className="text-xs font-bold text-white">{w.name || 'Workout'}</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${w.status === 'completed' ? 'bg-green-900/40 text-green-400' :
                            w.status === 'in_progress' ? 'bg-yellow-900/40 text-yellow-400 animate-pulse' :
                              'bg-gray-800 text-gray-500'
                            }`}>
                            {w.status === 'completed' ? '✓ view receipt' : w.status || 'pending'}
                          </span>
                        </div>
                        {w.exercises && w.exercises.length > 0 && (
                          <div className="space-y-1.5">
                            {w.exercises.map((ex: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-xs bg-[#111827] rounded-xl px-3 py-2.5 border border-gray-800/60">
                                <span className="text-gray-200 font-semibold">{ex.name}</span>
                                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-mono font-bold">
                                  {ex.completed_sets?.length > 0 ? (
                                    <span className="text-green-400">{ex.completed_sets.length} sets done</span>
                                  ) : (
                                    <span>{ex.sets} sets planned</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Split Plans Manager */}
              <div className="bg-[#0d1220] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider">
                    Workout Splits
                    <span className="text-gray-600 ml-1 font-bold normal-case">({workoutPlans.length} days)</span>
                  </h3>
                  <button onClick={() => setShowAddSplitForm(!showAddSplitForm)} className="text-xs font-black text-blue-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                    <Plus size={13} /> {showAddSplitForm ? 'Cancel' : 'New Day'}
                  </button>
                </div>

                {showAddSplitForm && (
                  <div className="border-b border-gray-800 p-4 bg-[#0a0f1a]">
                    <form onSubmit={handleCreateSplitDay} className="flex gap-2">
                      <input
                        type="text" value={newSplitDayName} onChange={e => setNewSplitDayName(e.target.value)}
                        placeholder="Day name (e.g. UPPER, FUN, YOGA)"
                        className="flex-1 bg-[#131b2e] border border-gray-700 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 uppercase font-black"
                      />
                      <button type="submit" className="px-4 bg-blue-600 text-white rounded-xl font-bold text-xs active:scale-95 cursor-pointer">Create</button>
                    </form>
                  </div>
                )}

                {workoutPlans.length === 0 ? (
                  <div className="p-8 text-center text-gray-600">
                    <p className="text-xs font-bold">No workout days yet</p>
                    <p className="text-[10px] mt-1">Click "New Day" to create a split</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800/60">
                    {workoutPlans.map(plan => {
                      const dt = plan.plan_type;
                      const isExp = activeSplitEditKey === dt;
                      return (
                        <div key={plan.id}>
                          <div
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-800/10 transition-colors"
                          >
                            <div
                              className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                              onClick={() => setActiveSplitEditKey(isExp ? null : dt)}
                            >
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${dayColor(dt)}`}>{dt}</span>
                              <span className="text-[11px] text-gray-400 font-bold">{plan.exercises?.length || 0} exercises</span>
                            </div>
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleRenameSplitDay(plan)}
                                className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-950/20 rounded-xl transition-colors cursor-pointer"
                                title="Rename Day"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteSplitDay(plan.id)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
                                title="Delete Plan"
                              >
                                <Trash2 size={13} />
                              </button>
                              <button
                                onClick={() => setActiveSplitEditKey(isExp ? null : dt)}
                                className="p-2 text-gray-500 hover:text-white rounded-xl cursor-pointer"
                              >
                                {isExp ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                              </button>
                            </div>
                          </div>

                          {isExp && (
                            <div className="border-t border-gray-800 bg-[#080d18] p-4 space-y-3">
                              {/* Exercises list */}
                              {!plan.exercises || plan.exercises.length === 0 ? (
                                <p className="text-[10px] text-gray-600 italic text-center py-2">No exercises yet. Search below to add.</p>
                              ) : (
                                <div className="space-y-1.5">
                                  {plan.exercises.map((ex: any, idx: number) => (
                                    <div key={ex.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0d1220] border border-gray-800 rounded-xl p-3 gap-2">
                                      <div>
                                        <p className="text-xs font-bold text-gray-200">{ex.name}</p>
                                        <p className="text-[9px] text-gray-600 uppercase font-bold">{ex.muscle_group}</p>
                                      </div>
                                      <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="number"
                                            min="1"
                                            value={ex.sets || 3}
                                            onChange={e => handleUpdateExerciseStats(dt, ex.id, parseInt(e.target.value) || 3, ex.rest || 120)}
                                            className="w-10 bg-[#131b2e] border border-gray-700 rounded px-1.5 py-1 text-[11px] font-bold text-center text-white outline-none focus:border-blue-500"
                                            title="Sets"
                                          />
                                          <span className="text-[10px] text-gray-500 font-bold">sets</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="number"
                                            min="0"
                                            step="5"
                                            value={ex.rest || 120}
                                            onChange={e => handleUpdateExerciseStats(dt, ex.id, ex.sets || 3, parseInt(e.target.value) || 0)}
                                            className="w-14 bg-[#131b2e] border border-gray-700 rounded px-1.5 py-1 text-[11px] font-bold text-center text-white outline-none focus:border-blue-500"
                                            title="Rest (seconds)"
                                          />
                                          <span className="text-[10px] text-gray-500 font-bold">s rest</span>
                                        </div>
                                        <button onClick={() => handleRemoveExerciseFromSplit(dt, ex.id)}
                                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer shrink-0 active:scale-95">
                                          <X size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Exercise search */}
                              <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                                <input
                                  value={searchExerciseQuery} onChange={e => setSearchExerciseQuery(e.target.value)}
                                  placeholder="Search exercises to add..."
                                  className="w-full bg-[#131b2e] border border-gray-700 rounded-xl py-2.5 pl-9 pr-9 text-xs text-white outline-none focus:border-blue-500"
                                />
                                {searchExerciseQuery && (
                                  <button onClick={() => setSearchExerciseQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer">
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                              {searchExerciseQuery && (
                                <div className="bg-[#0d1220] border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                                  {filteredCatalog.length === 0 ? (
                                    <p className="text-[10px] text-gray-500 italic text-center p-3">No exercises found</p>
                                  ) : filteredCatalog.map(ex => (
                                    <button key={ex.id} onClick={() => handleAddExerciseToSplit(dt, ex)}
                                      className="w-full text-left px-4 py-3 text-xs hover:bg-blue-600/20 flex items-center justify-between border-b border-gray-800/60 last:border-0 transition-colors cursor-pointer active:bg-blue-600/30">
                                      <span className="font-semibold text-gray-200">{ex.name}</span>
                                      <span className="text-[9px] font-black uppercase bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded">{ex.muscle_group}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: INBODY ── */}
          {activeTab === 'inbody' && (
            <div className="space-y-4">
              {/* CSV Upload Zone */}
              <div className="bg-[#0d1220] border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between relative overflow-hidden gap-4">
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] pointer-events-none" />
                <div className="flex-1 text-center sm:text-left z-10">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                    <FileText size={15} className="text-blue-400" /> Bulk Import InBody CSV
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">Upload the athlete's exported CSV to sync all body scan history automatically.</p>
                </div>
                <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 shrink-0 z-10 w-full sm:w-auto text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVUpload}
                    disabled={isImporting}
                  />
                  {isImporting ? 'Importing...' : 'Upload CSV'}
                </label>
              </div>

              {/* Add scan manual */}
              <div className="bg-[#0d1220] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider">📊 Log Manual Scan</h3>
                  <button onClick={() => setShowAddScanForm(!showAddScanForm)} className="text-xs font-black text-blue-400 hover:text-white cursor-pointer flex items-center gap-1">
                    <Plus size={13} /> {showAddScanForm ? 'Cancel' : 'New Scan'}
                  </button>
                </div>
                {showAddScanForm && (
                  <form onSubmit={handleAddInBodyScan} className="p-4 space-y-3 bg-[#0a0f1a]">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-1 font-bold uppercase">Scan Date</label>
                        <input type="date" value={newScanDate} onChange={e => setNewScanDate(e.target.value)} required className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-1 font-bold uppercase">InBody Score</label>
                        <input type="number" value={newScanScore} onChange={e => setNewScanScore(parseInt(e.target.value) || 0)} className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-xs text-white text-center font-bold outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-1 font-bold uppercase">Weight (kg)</label>
                        <input type="number" step="any" required placeholder="e.g. 78.5" value={newScanWeight} onChange={e => setNewScanWeight(e.target.value)} className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-1 font-bold uppercase">Body Fat %</label>
                        <input type="number" step="any" placeholder="e.g. 14.8" value={newScanBfPercent} onChange={e => setNewScanBfPercent(e.target.value)} className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] text-gray-500 block mb-1 font-bold uppercase">Muscle Mass SMM (kg)</label>
                        <input type="number" step="any" placeholder="e.g. 36.5" value={newScanSmm} onChange={e => setNewScanSmm(e.target.value)} className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl active:scale-95 transition-all cursor-pointer">
                      Save Composition Record
                    </button>
                  </form>
                )}
              </div>

              {/* Scan History */}
              <div className="bg-[#0d1220] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">History <span className="text-gray-600">({scans.length} scans)</span></h3>
                </div>
                {scans.length === 0 ? (
                  <p className="text-xs text-gray-600 italic text-center py-8">No scans recorded for this athlete</p>
                ) : (
                  <div className="divide-y divide-gray-800/60">
                    {scans.map((scan, idx) => {
                      const isExpanded = expandedScanId === scan.id;
                      const prev = idx + 1 < scans.length ? scans[idx + 1] : null;
                      const seg = scan.segmental || {};
                      const prevSeg = prev?.segmental || {};

                      return (
                        <div key={scan.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 cursor-pointer" 
                              onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}
                            >
                              <p className="text-sm font-black text-white flex items-center gap-1.5">
                                {new Date(scan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Score: <span className="text-emerald-400 font-black">{scan.score || 75}</span>
                                {idx === 0 && <span className="ml-2 bg-blue-900/40 text-blue-400 text-[9px] font-black px-1.5 py-0.5 rounded">LATEST</span>}
                              </p>
                            </div>
                            <button onClick={() => handleDeleteScan(scan.id)} className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer active:scale-95">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div 
                            className="grid grid-cols-3 gap-2 cursor-pointer"
                            onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}
                          >
                            <div className="bg-[#111827] border border-gray-800 rounded-xl p-3 text-center">
                              <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Weight</p>
                              <p className="text-sm font-black text-white">
                                {scan.weight} kg
                                {prev && calculateInBodyDelta(scan.weight, prev.weight, true)}
                              </p>
                            </div>
                            <div className="bg-[#111827] border border-gray-800 rounded-xl p-3 text-center">
                              <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Muscle</p>
                              <p className="text-sm font-black text-blue-400">
                                {scan.smm} kg
                                {prev && calculateInBodyDelta(scan.smm, prev.smm)}
                              </p>
                            </div>
                            <div className="bg-[#111827] border border-gray-800 rounded-xl p-3 text-center">
                              <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Body Fat</p>
                              <p className="text-sm font-black text-red-400">
                                {scan.bf_percent}%
                                {prev && calculateInBodyDelta(scan.bf_percent, prev.bf_percent, true)}
                              </p>
                            </div>
                          </div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-gray-800/50 mt-3 pt-3"
                              >
                                <div className="space-y-5 bg-[#080d1a]/50 p-3 rounded-2xl border border-gray-800/80">
                                  {/* Muscle-Fat Analysis */}
                                  <div>
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                      <Activity size={12} /> Muscle-Fat Analysis
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2.5">
                                      <div className="bg-[#111827] p-2.5 rounded-xl border border-gray-800/80">
                                        <p className="text-[8px] text-gray-500 uppercase font-bold">Skeletal Muscle Mass</p>
                                        <p className="text-xs text-white font-black">
                                          {scan.smm} <span className="text-[9px] text-gray-500 font-bold">kg</span>
                                          {prev && calculateInBodyDelta(scan.smm, prev.smm)}
                                        </p>
                                      </div>
                                      <div className="bg-[#111827] p-2.5 rounded-xl border border-gray-800/80">
                                        <p className="text-[8px] text-gray-500 uppercase font-bold">Body Fat Mass</p>
                                        <p className="text-xs text-white font-black">
                                          {scan.bfm} <span className="text-[9px] text-gray-500 font-bold">kg</span>
                                          {prev && calculateInBodyDelta(scan.bfm, prev.bfm, true)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Body Composition Analysis */}
                                  <div>
                                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                      <Droplet size={12} /> Body Composition
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="bg-[#111827] p-2 rounded-xl text-center border border-gray-800/80">
                                        <p className="text-[8px] text-gray-500 mb-0.5 uppercase font-bold">Total Water</p>
                                        <p className="text-[10px] text-white font-black">{seg.tbw || 0}L</p>
                                      </div>
                                      <div className="bg-[#111827] p-2 rounded-xl text-center border border-gray-800/80">
                                        <p className="text-[8px] text-gray-500 mb-0.5 uppercase font-bold">Protein</p>
                                        <p className="text-[10px] text-white font-black">{seg.protein || 0}kg</p>
                                      </div>
                                      <div className="bg-[#111827] p-2 rounded-xl text-center border border-gray-800/80">
                                        <p className="text-[8px] text-gray-500 mb-0.5 uppercase font-bold">Minerals</p>
                                        <p className="text-[10px] text-white font-black">{seg.minerals || 0}kg</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Obesity Evaluation */}
                                  <div>
                                    <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                      <Flame size={12} /> Obesity Evaluation
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2.5">
                                      <div className="bg-[#111827] p-2.5 rounded-xl border border-gray-800/80">
                                        <p className="text-[8px] text-gray-500 uppercase font-bold">Visceral Fat Level</p>
                                        <p className="text-xs text-white font-black">
                                          {seg.visceralFat || 0}
                                          {prev && calculateInBodyDelta(seg.visceralFat, prevSeg.visceralFat, true)}
                                        </p>
                                      </div>
                                      <div className="bg-[#111827] p-2.5 rounded-xl border border-gray-800/80">
                                        <p className="text-[8px] text-gray-500 uppercase font-bold">Basal Metabolic Rate</p>
                                        <p className="text-xs text-white font-black">{scan.bmr} <span className="text-[9px] text-gray-500 font-bold">kcal</span></p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Segmental Lean Analysis – Interactive Body Map */}
                                  <div className="border-t border-gray-800/50 pt-3">
                                    <SegmentalBodyMap scan={scan} allScans={scans} />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {selectedReceiptWorkout && (
        <GymReceipt
          stats={selectedReceiptWorkout}
          onClose={() => setSelectedReceiptWorkout(null)}
        />
      )}
    </div>
  );
}
