import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { GymReceipt } from '../../components/GymReceipt';
import { SegmentalBodyMap } from '../../components/SegmentalBodyMap';
import { motion } from 'framer-motion';
import {
  Dumbbell, ChevronLeft, ChevronRight, Trash2,
  Search, X, Calendar, Sparkles, ArrowLeft,
  Plus, Clock, Droplets, ChevronDown, ChevronUp,
  Edit3, Save, RefreshCw, Activity,
  Flame, Users, Settings, Lock, Phone, Database,
  ShieldCheck, ArrowRight, Copy, Send, DollarSign,
  AlertTriangle, Key, Trash, UserPlus
} from 'lucide-react';

const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

const getLocalDateString = (d: Date = new Date()) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const getLocalDateTimeString = (d: Date = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 bg-white/[0.03] border border-white/[0.02] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(255,255,255,0.15)]"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function CircularProgress({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5 bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl flex-1 text-center backdrop-blur-sm shadow-lg shadow-black/10">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r={radius} className="stroke-white/[0.03]" strokeWidth="3.5" fill="transparent" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="transition-all duration-700 ease-out"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
          />
        </svg>
        <div className="absolute text-[10px] font-black text-white">{Math.round(pct)}%</div>
      </div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[9px] font-bold text-white font-mono">{Math.round(value)}/{Math.round(max)}</span>
    </div>
  );
}

function dayColor(dt: string) {
  const u = dt.toUpperCase();
  if (u === 'PUSH') return 'bg-blue-900/40 text-blue-400 border-blue-800/30';
  if (u === 'PULL') return 'bg-purple-900/40 text-purple-400 border-purple-800/30';
  if (u === 'LEGS') return 'bg-green-900/40 text-green-400 border-green-800/30';
  if (u === 'REST') return 'bg-gray-850/80 text-gray-400 border-gray-700/30';
  if (u === 'RUN') return 'bg-amber-900/40 text-amber-400 border-amber-800/30';
  if (u.includes('REST') && u.includes('RUN')) return 'bg-orange-900/40 text-orange-400 border-orange-800/30';
  return 'bg-indigo-900/40 text-indigo-400 border-indigo-800/30';
}

const getClientStatus = (targets: any) => {
  const now = new Date();
  if (targets?.is_deactivated === true) return 'Suspended';
  if (targets?.subscription_end_date && now >= new Date(targets.subscription_end_date)) return 'Expired';
  if (targets?.subscription_start_date && now < new Date(targets.subscription_start_date)) return 'Pending';
  return 'Active';
};

const getClientStatusColor = (status: string) => {
  if (status === 'Suspended') return 'bg-red-950/40 text-red-400 border-red-900/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
  if (status === 'Expired') return 'bg-amber-950/40 text-amber-400 border-amber-900/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
  if (status === 'Pending') return 'bg-blue-950/40 text-blue-400 border-blue-900/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
  return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
};

export default function DashboardPage() {
  const navigate = useNavigate();

  // Auth Lock Screen State
  const [passcode, setPasscode] = useState('');
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('coach_hub_authed') === 'true');
  const [shake, setShake] = useState(false);

  // General Coach states
  const [coachUserId, setCoachUserId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [exerciseDb, setExerciseDb] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // View States
  const [currentView, setCurrentView] = useState<'home' | 'roster' | 'deploy' | 'settings'>('home');
  const [selectedUserId, setSelectedUserId] = useState<string>(''); // Athlete Detail Drill-down trigger
  const [activeSubTab, setActiveSubTab] = useState<'plan' | 'diet' | 'water' | 'gym' | 'inbody' | 'control'>('plan');
  const [activeDateStr, setActiveDateStr] = useState(() => getLocalDateString());

  // Realtime Activity Feed States
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [recentDiets, setRecentDiets] = useState<any[]>([]);
  const [feedFilterMineOnly, setFeedFilterMineOnly] = useState(false);

  // Roster Search Query
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Selected Client Details States
  const [profileTargets, setProfileTargets] = useState<any>(null);
  const [dietLog, setDietLog] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [waterLogs, setWaterLogs] = useState<any[]>([]);
  const [workoutsList, setWorkoutsList] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [selectedReceiptWorkout, setSelectedReceiptWorkout] = useState<any>(null);

  // Selected Client Operations States
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

  // Deploy Athlete State
  const [deployStep, setDeployStep] = useState<1 | 2 | 3 | 4>(1);
  const [deletingClient, setDeletingClient] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);
  const [deploySuccessData, setDeploySuccessData] = useState<any | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployGender, setDeployGender] = useState<'male' | 'female' | null>(null);
  const [deploySplits] = useState<any[]>([
    { 
      key: 'PUSH', 
      label: 'Push', 
      color: '#3b82f6', 
      exercises: [
        { id: 'dp-push-0', name: 'Incline DB Bench Press (45°)', muscle_group: 'Chest', sets: 3, rest: 120 },
        { id: 'dp-push-1', name: 'DB Shoulder Press (seated neutral)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
        { id: 'dp-push-2', name: 'Incline DB Y-Raise (20-30°)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
        { id: 'dp-push-3', name: 'Cable Chest Fly (low pulley)', muscle_group: 'Chest', sets: 3, rest: 120 },
        { id: 'dp-push-4', name: 'Overhead Cable Extension (rope)', muscle_group: 'Triceps', sets: 3, rest: 120 },
        { id: 'dp-push-5', name: 'DB Lateral Raise (elbow-lead)', muscle_group: 'Shoulders', sets: 3, rest: 120 }
      ]
    },
    { 
      key: 'PULL', 
      label: 'Pull', 
      color: '#a855f7', 
      exercises: [
        { id: 'dp-pull-0', name: 'Lat Pulldown (wide grip)', muscle_group: 'Back', sets: 3, rest: 120 },
        { id: 'dp-pull-1', name: 'Chest-Supported DB Row', muscle_group: 'Back', sets: 3, rest: 120 },
        { id: 'dp-pull-2', name: 'Sideways One-Arm Rear Delt Fly', muscle_group: 'Rear Delts', sets: 3, rest: 120 },
        { id: 'dp-pull-3', name: 'Face Pull (rope eye height)', muscle_group: 'Rear Delts', sets: 3, rest: 120 },
        { id: 'dp-pull-4', name: 'Incline DB Curl - Bayesian', muscle_group: 'Biceps', sets: 3, rest: 120 },
        { id: 'dp-pull-5', name: 'Zottman Curl', muscle_group: 'Biceps', sets: 3, rest: 120 }
      ]
    },
    { 
      key: 'LEGS', 
      label: 'Legs', 
      color: '#10b981', 
      exercises: [
        { id: 'dp-legs-0', name: 'Leg Press (feet glute dominant)', muscle_group: 'Glutes', sets: 3, rest: 120 },
        { id: 'dp-legs-1', name: 'DB Romanian Deadlift', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'dp-legs-2', name: 'DB Bulgarian Split Squat', muscle_group: 'Quads', sets: 3, rest: 120 },
        { id: 'dp-legs-3', name: 'Seated Leg Curl', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'dp-legs-4', name: '45° Back Extension (BW/DB)', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'dp-legs-5', name: 'Standing Calf Raise', muscle_group: 'Calves', sets: 3, rest: 120 }
      ]
    }
  ]);
  const [deployActiveSplitKey, setDeployActiveSplitKey] = useState<string | null>(null);

  // Deploy target states
  const [deployKcal, setDeployKcal] = useState(2400);
  const [deployProtein, setDeployProtein] = useState(160);
  const [deployCarbs, setDeployCarbs] = useState(240);
  const [deployFat, setDeployFat] = useState(70);
  const [deployRestKcal, setDeployRestKcal] = useState(2100);
  const [deployRestProtein, setDeployRestProtein] = useState(150);
  const [deployRestCarbs, setDeployRestCarbs] = useState(218);
  const [deployRestFat, setDeployRestFat] = useState(70);
  const [deployIsRestOverridden, setDeployIsRestOverridden] = useState(false);
  const [deployWaterGoalLiters, setDeployWaterGoalLiters] = useState(3.5);

  // Deploy Biometrics states
  const [deployWeight, setDeployWeight] = useState('');
  const [deployBfPercent, setDeployBfPercent] = useState('');
  const [deploySmm, setDeploySmm] = useState('');
  const [deployBfm, setDeployBfm] = useState('');
  const [deployInbodyScore] = useState(75);

  // Validation checking states
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [isClientCodeChecking, setIsClientCodeChecking] = useState(false);
  const [isClientCodeTaken, setIsClientCodeTaken] = useState(false);

  const [deployFormData, setDeployFormData] = useState({
    displayName: '',
    username: '',
    password: '',
    clientCode: '',
    phoneNumber: '',
    age: '',
    height: '',
    experience_level: 'beginner',
    goals: '',
    injuries_notes: '',
    subscriptionPeriod: '1 month',
    subscriptionStartDelay: '0',
    customSubscriptionEnd: getLocalDateTimeString()
  });

  // Client Details Control/Management Tab States
  const [managementNewPassword, setManagementNewPassword] = useState('');
  const [managementUpdatingPassword, setManagementUpdatingPassword] = useState(false);
  const [managementUpdatingSuspension, setManagementUpdatingSuspension] = useState(false);
  const [managementUpdatingQuota, setManagementUpdatingQuota] = useState(false);
  const [managementUpdatingFeatures, setManagementUpdatingFeatures] = useState(false);
  const [managementAiQuotaInput, setManagementAiQuotaInput] = useState<number>(20);
  const [editSubscriptionPeriod, setEditSubscriptionPeriod] = useState('1 month');
  const [editSubscriptionDelay, setEditSubscriptionDelay] = useState('0');
  const [editCustomSubscriptionEnd, setEditCustomSubscriptionEnd] = useState(getLocalDateTimeString());
  const [updatingSubscriptionState, setUpdatingSubscriptionState] = useState(false);
  const [selectedClientProfile, setSelectedClientProfile] = useState<any | null>(null);

  // Coach Settings / Profile configurations
  const [ownWhatsAppNumber, setOwnWhatsAppNumber] = useState('');
  const [savingWhatsAppNumber, setSavingWhatsAppNumber] = useState(false);
  const [ownNewPassword, setOwnNewPassword] = useState('');
  const [ownConfirmPassword, setOwnConfirmPassword] = useState('');
  const [updatingOwnPassword, setUpdatingOwnPassword] = useState(false);

  // Owner System Tab configurations
  const [sqlQueryInput, setSqlQueryInput] = useState('');
  const [sqlQueryResult, setSqlQueryResult] = useState<any | null>(null);
  const [executingSql, setExecutingSql] = useState(false);
  const [systemCoaches, setSystemCoaches] = useState<any[]>([]);

  // Real-time Check for username availability in Deploy form
  useEffect(() => {
    const usernameVal = deployFormData.username.trim().toLowerCase();
    if (!usernameVal) {
      setIsUsernameTaken(false);
      return;
    }
    setIsUsernameChecking(true);
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', usernameVal)
          .maybeSingle();
        if (error) throw error;
        setIsUsernameTaken(!!data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUsernameChecking(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [deployFormData.username]);

  // Real-time Check for client code availability in Deploy form
  useEffect(() => {
    const codeVal = deployFormData.clientCode.trim();
    if (!codeVal) {
      setIsClientCodeTaken(false);
      return;
    }
    setIsClientCodeChecking(true);
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'client')
          .eq('targets->>client_code', codeVal)
          .maybeSingle();
        if (error) throw error;
        setIsClientCodeTaken(!!data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsClientCodeChecking(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [deployFormData.clientCode]);

  // Sync Deploy Rest macros with Work kcal automatically if not custom overridden
  useEffect(() => {
    if (!deployIsRestOverridden) {
      const crKcal = Math.max(1200, deployKcal - 300);
      const crProtein = Math.max(80, deployProtein - 10);
      const crFat = deployFat;
      const crCarbs = Math.max(50, Math.round((crKcal - crProtein * 4 - crFat * 9) / 4));
      
      setDeployRestKcal(crKcal);
      setDeployRestProtein(crProtein);
      setDeployRestFat(crFat);
      setDeployRestCarbs(crCarbs);
    }
  }, [deployKcal, deployProtein, deployFat, deployIsRestOverridden]);

  // Recalculate fat mass inside Deploy Form
  useEffect(() => {
    const w = parseFloat(deployWeight);
    const f = parseFloat(deployBfPercent);
    if (!isNaN(w) && !isNaN(f)) {
      setDeployBfm(((w * f) / 100).toFixed(1));
      if (!deploySmm) {
        setDeploySmm(((w * (100 - f) * 0.55) / 100).toFixed(1));
      }
    } else {
      setDeployBfm('');
    }
  }, [deployWeight, deployBfPercent, deploySmm]);

  // ─── INITIAL BASE DATA FETCH ──────────────────────────────────
  const fetchBaseData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        if (!silent) setLoading(false);
        else setRefreshing(false);
        return;
      }

      setCoachUserId(user.id);
      setSessionToken(session.access_token);

      const isOwner = user.id === OWNER_ID;

      // Fetch profiles
      let profileQuery = supabase.from('profiles').select('*').order('display_name');
      if (!isOwner) {
        profileQuery = profileQuery.eq('coach_id', user.id);
      }
      const { data: userProfiles, error: pe } = await profileQuery;
      if (pe) throw pe;
      
      if (userProfiles) {
        setProfiles(userProfiles);
        
        // Fetch list of coaches if owner
        if (isOwner) {
          const coaches = userProfiles.filter(p => p.role === 'coach' || p.id === OWNER_ID);
          setSystemCoaches(coaches);
        }
      }

      // Fetch exercises catalog
      const { data: exercises } = await supabase.from('exercises').select('*').order('name');
      if (exercises) setExerciseDb(exercises);

      // Fetch activity feed data
      await fetchActivityFeed(user.id, userProfiles || []);
    } catch (err) {
      console.error('Database fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthed) {
      fetchBaseData();
    }
  }, [isAuthed, feedFilterMineOnly]);

  // ─── ACTIVITY FEED LOADER ─────────────────────────────────────
  const fetchActivityFeed = async (coachId: string, allProfiles: any[]) => {
    try {
      const isOwner = coachId === OWNER_ID;
      const shouldFilter = !isOwner || feedFilterMineOnly;

      let workoutsQuery = supabase
        .from('workouts')
        .select('id, user_id, date, name, day_type, total_volume, duration, notes')
        .eq('status', 'completed')
        .order('date', { ascending: false });

      let dietLogsQuery = supabase
        .from('diet_logs')
        .select('id, user_id, date, daily_totals')
        .order('date', { ascending: false });

      if (shouldFilter) {
        const myClients = allProfiles.filter(p => p.role === 'client' && p.coach_id === coachId);
        const myClientIds = myClients.map(c => c.id);
        if (myClientIds.length > 0) {
          workoutsQuery = workoutsQuery.in('user_id', myClientIds);
          dietLogsQuery = dietLogsQuery.in('user_id', myClientIds);
        } else {
          setRecentWorkouts([]);
          setRecentDiets([]);
          return;
        }
      }

      const { data: workoutsData } = await workoutsQuery.limit(10);
      const { data: dietLogsData } = await dietLogsQuery.limit(10);

      const filteredDiets = (dietLogsData || []).filter(d => {
        const kcal = d.daily_totals?.kcal || 0;
        const protein = d.daily_totals?.protein || 0;
        return kcal > 0 || protein > 0;
      });

      const feedUserIds = Array.from(new Set([
        ...(workoutsData || []).map(w => w.user_id),
        ...filteredDiets.map(d => d.user_id)
      ]));

      const feedProfilesMap: Record<string, any> = {};
      if (feedUserIds.length > 0) {
        const { data: feedProfiles } = await supabase
          .from('profiles')
          .select('id, display_name, targets, role')
          .in('id', feedUserIds);
        
        if (feedProfiles) {
          feedProfiles.forEach(p => {
            if (p.role === 'client') {
              feedProfilesMap[p.id] = {
                display_name: p.display_name || 'Athlete',
                client_code: p.targets?.client_code
              };
            }
          });
        }
      }

      const stitchedWorkouts = (workoutsData || [])
        .map(w => ({
          ...w,
          profiles: feedProfilesMap[w.user_id]
        }))
        .filter(w => w.profiles !== undefined);

      const stitchedDiets = filteredDiets
        .map(d => ({
          ...d,
          profiles: feedProfilesMap[d.user_id]
        }))
        .filter(d => d.profiles !== undefined);

      setRecentWorkouts(stitchedWorkouts);
      setRecentDiets(stitchedDiets);
    } catch (err) {
      console.error('Error loading feed:', err);
    }
  };

  // ─── CLIENT DRILL-DOWN DATA FETCH ─────────────────────────────
  const fetchClientData = async (userId: string, dateStr: string, silent = false) => {
    if (!userId) return;
    if (!silent) setLoading(true);
    try {
      // 1. Fetch main Profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        const tgt = profile.targets || null;
        setProfileTargets(tgt);
        if (tgt) {
          setTargetKcal(tgt.kcal || 2400);
          setTargetProtein(tgt.protein || 160);
          setTargetCarbs(tgt.carbs || 240);
          setTargetFat(tgt.fat || 70);
          setTargetWaterLiters((tgt.water_goal_ml || 3500) / 1000);
          setDayNutrition(tgt.day_nutrition || {});
        }
      }

      // 2. Fetch Client Profile (extra biometrics config)
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select(`*, user:profiles!client_profiles_user_id_fkey(id, username, email, display_name, targets, created_at)`)
        .eq('user_id', userId)
        .maybeSingle();
      if (clientProfile) {
        setSelectedClientProfile(clientProfile);
        setManagementAiQuotaInput(clientProfile.user?.targets?.ai_quota_limit ?? 20);
        setEditSubscriptionPeriod(clientProfile.user?.targets?.subscription_duration ?? '1 month');
        setEditSubscriptionDelay(String(clientProfile.user?.targets?.subscription_delay_days ?? '0'));
        if (clientProfile.user?.targets?.subscription_end_date) {
          setEditCustomSubscriptionEnd(getLocalDateTimeString(new Date(clientProfile.user.targets.subscription_end_date)));
        }
      }

      // 3. Fetch actual user workout splits plans
      const { data: plansData } = await supabase
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      setWorkoutPlans(plansData || []);

      // 4. Diet logs
      const { data: dLog } = await supabase.from('diet_logs').select('*').eq('user_id', userId).eq('date', dateStr).maybeSingle();
      setDietLog(dLog || null);
      if (dLog) {
        const { data: dMeals } = await supabase.from('diet_meals').select('*').eq('diet_log_id', dLog.id).order('created_at', { ascending: true });
        setMeals(dMeals || []);
      } else {
        setMeals([]);
      }

      // 5. Water logs
      const { data: wLogs } = await supabase.from('water_logs').select('*').eq('user_id', userId).eq('date', dateStr).order('time', { ascending: true });
      setWaterLogs(wLogs || []);

      // 6. Workouts logs
      const { data: wList } = await supabase.from('workouts').select('*').eq('user_id', userId).eq('date', dateStr);
      setWorkoutsList(wList || []);

      // 7. InBody scans
      const { data: inbodyScans } = await supabase.from('inbody_scans').select('*').eq('user_id', userId).order('date', { ascending: false });
      setScans(inbodyScans || []);

    } catch (err) {
      console.error(err);
      toast.error('Unable to load client dossier records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchClientData(selectedUserId, activeDateStr);
    }
  }, [selectedUserId, activeDateStr]);

  // ─── REALTIME SUBSCRIPTION FOR OPEN DOSSIER ───────────────────
  useEffect(() => {
    if (!isAuthed || !selectedUserId || !activeDateStr) return;

    const channel = supabase
      .channel(`coach-hub-realtime-${selectedUserId}-${activeDateStr}`)
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

  // ─── AUTHENTICATION SUBMIT HANDLERS ───────────────────────────
  const handleUnlockSubmit = (code: string) => {
    if (code === '425336') {
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

  const handleNumPress = (num: string) => {
    if (passcode.length < 6) {
      const val = passcode + num;
      setPasscode(val);
      if (val.length === 6) {
        setTimeout(() => {
          handleUnlockSubmit(val);
        }, 150);
      }
    }
  };

  const handleNumBackspace = () => {
    setPasscode(prev => prev.slice(0, -1));
  };

  const handleLogOut = () => {
    sessionStorage.removeItem('coach_hub_authed');
    setIsAuthed(false);
    setPasscode('');
  };

  // ─── BASELINE TARGET MUTATORS ──────────────────────────────────
  const handleSaveBaselineNutrition = async () => {
    try {
      const upd = { ...profileTargets, kcal: targetKcal, protein: targetProtein, carbs: targetCarbs, fat: targetFat };
      const { error } = await supabase.from('profiles').update({ targets: upd }).eq('id', selectedUserId);
      if (error) throw error;
      setProfileTargets(upd);
      toast.success('Baseline targets updated!');
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update targets.');
    }
  };

  const handleSaveWaterGoal = async () => {
    try {
      const upd = { ...profileTargets, water_goal_ml: Math.round(targetWaterLiters * 1000) };
      const { error } = await supabase.from('profiles').update({ targets: upd }).eq('id', selectedUserId);
      if (error) throw error;
      setProfileTargets(upd);
      toast.success('Water goal updated!');
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update water goals.');
    }
  };

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
      const { error } = await supabase.from('profiles').update({ targets: upd }).eq('id', selectedUserId);
      if (error) throw error;
      setDayNutrition(updDN);
      setProfileTargets(upd);
      setEditingDayType(null);
      toast.success(`${editingDayType} day macros saved!`);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update day targets.');
    }
  };

  // ─── MEALS LOG MUTATORS ────────────────────────────────────────
  const handleAddMealLog = async () => {
    if (!newMealName.trim()) { toast.error('Enter a meal name'); return; }
    try {
      let logId = dietLog?.id;
      if (!logId) {
        const { data: newLog, error: le } = await supabase.from('diet_logs').insert({
          user_id: selectedUserId, date: activeDateStr,
          daily_totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0, completed: false }
        }).select().single();
        if (le) throw le;
        logId = newLog.id;
        setDietLog(newLog);
      }
      const item = { 
        id: `ci-${Date.now()}`, 
        food_id: 'custom', 
        name: newMealName, 
        grams: 100, 
        macros: { kcal: newMealKcal, protein: newMealProtein, carbs: newMealCarbs, fat: newMealFat } 
      };
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
      const { data: nm, error: me } = await supabase.from('diet_meals').insert({
        diet_log_id: logId, name: newMealName,
        time: timeStr,
        items: [item]
      }).select().single();
      if (me) throw me;

      const allMeals = [...meals, nm];
      const totals = allMeals.reduce((t, m) => {
        m.items?.forEach((i: any) => { 
          t.kcal += i.macros.kcal || 0; 
          t.protein += i.macros.protein || 0; 
          t.carbs += i.macros.carbs || 0; 
          t.fat += i.macros.fat || 0; 
        });
        return t;
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0, water: dietLog?.daily_totals?.water || 0, completed: false });
      await supabase.from('diet_logs').update({ daily_totals: totals }).eq('id', logId);

      toast.success('Meal logged!');
      setNewMealName(''); setShowAddMealForm(false);
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to log meal.');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase.from('diet_meals').delete().eq('id', mealId);
      if (error) throw error;
      const remaining = meals.filter(m => m.id !== mealId);
      const totals = remaining.reduce((t, m) => {
        m.items?.forEach((i: any) => { 
          t.kcal += i.macros.kcal || 0; 
          t.protein += i.macros.protein || 0; 
          t.carbs += i.macros.carbs || 0; 
          t.fat += i.macros.fat || 0; 
        });
        return t;
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0, water: dietLog?.daily_totals?.water || 0, completed: false });
      if (dietLog) await supabase.from('diet_logs').update({ daily_totals: totals }).eq('id', dietLog.id);
      toast.success('Meal deleted');
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to remove meal.');
    }
  };

  // ─── WATER LOG MUTATORS ────────────────────────────────────────
  const handleAddWater = async () => {
    if (!selectedUserId) return;
    try {
      const now = new Date();
      const { error } = await supabase.from('water_logs').insert({
        user_id: selectedUserId,
        date: activeDateStr,
        time: now.toISOString(),
        amount_ml: newWaterAmount
      });
      if (error) throw error;
      toast.success(`Logged ${newWaterAmount}ml water!`);
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to log water.');
    }
  };

  const handleDeleteWater = async (waterId: string) => {
    try {
      const { error } = await supabase.from('water_logs').delete().eq('id', waterId);
      if (error) throw error;
      toast.success('Water log deleted');
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to delete water log.');
    }
  };

  // ─── GYM WORKOUT ROUTINES MUTATORS ─────────────────────────────
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
      const { error } = await supabase.from('user_workout_plans').update({ exercises: upd }).eq('id', plan.id);
      if (error) throw error;
      setWorkoutPlans(prev => prev.map(p => p.plan_type === planType ? { ...p, exercises: upd } : p));
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update exercise split.');
    }
  };

  const handleAddExerciseToSplit = async (planType: string, exercise: any) => {
    try {
      const plan = workoutPlans.find(p => p.plan_type === planType);
      const exs = plan ? [...plan.exercises] : [];
      if (exs.some((e: any) => e.name === exercise.name)) { toast.error('Already in split'); return; }
      exs.push({ id: exercise.id || `ce-${Date.now()}`, name: exercise.name, muscle_group: exercise.muscle_group || '', sets: 3, rest: 120 });

      const { error } = await supabase.from('user_workout_plans').upsert(
        { user_id: selectedUserId, plan_type: planType, exercises: exs },
        { onConflict: 'user_id,plan_type' }
      );
      if (error) throw error;
      toast.success(`Added to ${planType}`);
      setSearchExerciseQuery('');
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to add exercise.');
    }
  };

  const handleRemoveExerciseFromSplit = async (planType: string, exId: string) => {
    try {
      const plan = workoutPlans.find(p => p.plan_type === planType);
      if (!plan) return;
      const upd = plan.exercises.filter((e: any) => e.id !== exId);
      const { error } = await supabase.from('user_workout_plans').update({ exercises: upd }).eq('id', plan.id);
      if (error) throw error;
      toast.success('Exercise removed');
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to remove exercise.');
    }
  };

  const handleCreateSplitDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSplitDayName.trim().toUpperCase();
    if (!name) return;
    if (workoutPlans.some(p => p.plan_type === name)) { toast.error('Already exists'); return; }
    try {
      const { error } = await supabase.from('user_workout_plans').insert({ user_id: selectedUserId, plan_type: name, exercises: [] });
      if (error) throw error;
      toast.success(`${name} day created!`);
      setNewSplitDayName(''); setShowAddSplitForm(false);
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to create split day.');
    }
  };

  const handleDeleteSplitDay = async (id: string) => {
    if (!window.confirm('Delete this split day? All exercises in it will be removed.')) return;
    const { error } = await supabase.from('user_workout_plans').delete().eq('id', id);
    if (error) {
      toast.error('Unable to delete split day.');
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
      const { error } = await supabase.from('user_workout_plans').update({ plan_type: newName }).eq('id', plan.id);
      if (error) throw error;
      toast.success(`Renamed to ${newName}!`);
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to rename split day.');
    }
  };

  // ─── INBODY COMPOSITION BIOMETRIC MUTATORS ──────────────────────
  const handleAddInBodyScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(newScanWeight);
    if (isNaN(wt) || wt <= 0) { toast.error('Enter valid weight'); return; }
    try {
      const bfVal = parseFloat(newScanBfPercent) || 0;
      const smmVal = parseFloat(newScanSmm) || 0;
      const { error } = await supabase.from('inbody_scans').insert({
        user_id: selectedUserId, date: newScanDate, weight: wt, smm: smmVal,
        bfm: parseFloat(((wt * bfVal) / 100).toFixed(1)), bf_percent: bfVal,
        bmr: Math.round(10 * wt + 6.25 * 175 - 5 * 25 + 5), score: newScanScore,
        segmental: { 
          visceralFat: 6, tbw: Math.round(wt * 0.6), protein: Math.round(wt * 0.18), 
          minerals: Math.round(wt * 0.05), raLean: Math.round(wt * 0.05), laLean: Math.round(wt * 0.05), 
          trunkLean: Math.round(wt * 0.28), rlLean: Math.round(wt * 0.12), llLean: Math.round(wt * 0.12) 
        }
      });
      if (error) throw error;
      toast.success('InBody record added!');
      setNewScanWeight(''); setNewScanBfPercent(''); setNewScanSmm(''); setShowAddScanForm(false);
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to log InBody scan.');
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    if (!window.confirm('Delete this scan entry permanently?')) return;
    try {
      const { error } = await supabase.from('inbody_scans').delete().eq('id', scanId);
      if (error) throw error;
      toast.success('Scan record deleted.');
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to delete scan record.');
    }
  };

  // ─── DEPLOY ATHLETE LOGIC ──────────────────────────────────────
  const isStep1Valid = () => {
    return deployFormData.displayName.trim() &&
      deployFormData.username.trim() &&
      deployFormData.password.trim().length >= 6 &&
      deployFormData.clientCode.trim() &&
      deployGender !== null &&
      !isUsernameTaken &&
      !isClientCodeTaken;
  };

  const handleDeployAthlete = async () => {
    if (!isStep1Valid()) {
      if (isUsernameTaken) toast.error('Username is already taken.');
      else if (isClientCodeTaken) toast.error('Client Code is already taken.');
      else if (deployGender === null) toast.error('Select sex.');
      else toast.error('Please fill in all identity fields.');
      return;
    }

    setDeployLoading(true);
    setDeployError(null);

    try {
      const emailAddress = `${deployFormData.username.trim().toLowerCase()}@stride.fit`;

      // 1. Create client auth user via API
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          email: emailAddress,
          password: deployFormData.password,
          display_name: deployFormData.displayName,
          gender: deployGender
        })
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || 'API auth user generation failed.');
      }

      const clientUserId = resData.user.id;

      // 2. Setup nutrition plan targets maps
      const dayNutritionMap: Record<string, any> = {};
      dayNutritionMap['REST'] = { kcal: deployRestKcal, protein: deployRestProtein, carbs: deployRestCarbs, fat: deployRestFat };
      dayNutritionMap['RUN'] = { kcal: deployKcal + 200, protein: deployProtein, carbs: deployCarbs + 50, fat: deployFat };
      dayNutritionMap['RUN + GYM'] = { kcal: deployKcal + 400, protein: deployProtein + 10, carbs: deployCarbs + 70, fat: deployFat + 5 };

      deploySplits.forEach(s => {
        dayNutritionMap[s.key] = { kcal: deployKcal, protein: deployProtein, carbs: deployCarbs, fat: deployFat };
      });

      // Calculate subscription dates
      let subscription_start_date = null;
      let subscription_end_date = null;
      const period = deployFormData.subscriptionPeriod;
      const delayDays = parseInt(deployFormData.subscriptionStartDelay) || 0;

      if (period && period !== 'none') {
        const now = new Date();
        const startDateObj = new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000);
        subscription_start_date = startDateObj.toISOString();

        if (period === 'custom') {
          if (deployFormData.customSubscriptionEnd) {
            subscription_end_date = new Date(deployFormData.customSubscriptionEnd).toISOString();
          } else {
            subscription_end_date = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
          }
        } else {
          let durationMs = 0;
          if (period === '2 weeks') durationMs = 14 * 24 * 60 * 60 * 1000;
          else if (period === '1 month') durationMs = 30 * 24 * 60 * 60 * 1000;
          else if (period === '3 months') durationMs = 90 * 24 * 60 * 60 * 1000;
          else if (period === '6 months') durationMs = 180 * 24 * 60 * 60 * 1000;
          else if (period === '12 months') durationMs = 365 * 24 * 60 * 60 * 1000;

          const endDateObj = new Date(startDateObj.getTime() + durationMs);
          subscription_end_date = endDateObj.toISOString();
        }
      }

      const clientCodeNumber = parseInt(deployFormData.clientCode);

      // 3. Profiles setup
      const targets = {
        onboarding_completed: true,
        show_welcome_animation: true,
        water_goal_ml: Math.round(deployWaterGoalLiters * 1000),
        day_nutrition: dayNutritionMap,
        gender: deployGender,
        kcal: deployKcal,
        protein: deployProtein,
        carbs: deployCarbs,
        fat: deployFat,
        client_code: clientCodeNumber,
        phone_number: deployFormData.phoneNumber.trim(),
        subscription_duration: period,
        subscription_delay_days: delayDays,
        subscription_start_date,
        subscription_end_date,
        subscription_history: [
          {
            timestamp: new Date().toISOString(),
            action: 'initial_activation',
            duration: period,
            delay_days: delayDays,
            start_date: subscription_start_date,
            end_date: subscription_end_date
          }
        ]
      };

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: clientUserId,
        username: deployFormData.username.trim().toLowerCase(),
        email: emailAddress,
        display_name: deployFormData.displayName,
        role: 'client',
        coach_id: coachUserId,
        targets
      });
      if (profileError) throw profileError;

      // 4. Client Profiles row
      const { error: clientProfileError } = await supabase.from('client_profiles').insert({
        user_id: clientUserId,
        coach_id: coachUserId,
        age: parseInt(deployFormData.age) || null,
        height: parseFloat(deployFormData.height) || null,
        experience_level: deployFormData.experience_level,
        workouts_per_week: deploySplits.length,
        goals: deployFormData.goals || '',
        injuries_notes: deployFormData.injuries_notes || '',
        generated_passcode: deployFormData.password
      });
      if (clientProfileError) throw clientProfileError;

      // 5. InBody scans setups
      const weightVal = parseFloat(deployWeight);
      if (!isNaN(weightVal) && weightVal > 0) {
        const bfVal = parseFloat(deployBfPercent) || 0;
        const smmVal = parseFloat(deploySmm) || 0;
        const bfmVal = parseFloat(deployBfm) || 0;

        await supabase.from('inbody_scans').insert({
          user_id: clientUserId,
          date: new Date().toISOString().split('T')[0],
          weight: weightVal,
          smm: smmVal,
          bfm: bfmVal,
          bf_percent: bfVal,
          bmr: Math.round(10 * weightVal + 6.25 * (parseFloat(deployFormData.height) || 175) - 5 * (parseInt(deployFormData.age) || 25) + 5),
          score: deployInbodyScore,
          segmental: {
            visceralFat: 6, tbw: Math.round(weightVal * 0.6), protein: Math.round(weightVal * 0.18),
            minerals: Math.round(weightVal * 0.05), raLean: Math.round(weightVal * 0.05),
            laLean: Math.round(weightVal * 0.05), trunkLean: Math.round(weightVal * 0.28),
            rlLean: Math.round(weightVal * 0.12), llLean: Math.round(weightVal * 0.12)
          }
        });
      }

      // 6. Workout plans templates splits
      const planPromises = deploySplits.map(split => {
        return supabase.from('user_workout_plans').upsert({
          user_id: clientUserId,
          plan_type: split.key,
          exercises: split.exercises
        });
      });
      await Promise.all(planPromises);

      setDeploySuccessData({
        displayName: deployFormData.displayName,
        username: deployFormData.username.trim().toLowerCase(),
        password: deployFormData.password,
        clientCode: clientCodeNumber
      });

      // Reset deploy forms
      setDeployFormData({
        displayName: '', username: '', password: '', clientCode: '', phoneNumber: '',
        age: '', height: '', experience_level: 'beginner', goals: '', injuries_notes: '',
        subscriptionPeriod: '1 month', subscriptionStartDelay: '0', customSubscriptionEnd: getLocalDateTimeString()
      });
      setDeployGender(null);
      setDeployWeight(''); setDeployBfPercent(''); setDeploySmm(''); setDeployBfm('');
      setDeployStep(1);

      toast.success('Athlete registered and deployed!');
      fetchBaseData(true);
    } catch (err: any) {
      console.error(err);
      setDeployError(err.message || 'Verification or deployment transaction failed.');
      toast.error('Wizards deployment transaction failed.');
    } finally {
      setDeployLoading(false);
    }
  };

  // ─── CLIENT CONTROL / SUBSCRIPTION UPDATE HANDLERS ────────────
  const handleUpdateClientPassword = async () => {
    if (!managementNewPassword || managementNewPassword.length < 6) {
      toast.error('Passcode must be at least 6 characters.');
      return;
    }
    setManagementUpdatingPassword(true);
    try {
      const res = await fetch('/api/update-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ uid: selectedUserId, password: managementNewPassword })
      });
      if (!res.ok) throw new Error('API request failed');

      // Update local catalog passcode key
      const { error } = await supabase.from('client_profiles').update({ generated_passcode: managementNewPassword }).eq('user_id', selectedUserId);
      if (error) throw error;

      toast.success('Athlete passcode updated!');
      setManagementNewPassword('');
      fetchClientData(selectedUserId, activeDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to change athlete passcode.');
    } finally {
      setManagementUpdatingPassword(false);
    }
  };

  const handleUpdateClientSuspension = async (deact: boolean) => {
    setManagementUpdatingSuspension(true);
    try {
      const upd = { ...profileTargets, is_deactivated: deact };
      const { error } = await supabase.from('profiles').update({ targets: upd }).eq('id', selectedUserId);
      if (error) throw error;
      setProfileTargets(upd);
      toast.success(deact ? 'Client suspended.' : 'Client unsuspended!');
      fetchBaseData(true);
    } catch (err) {
      console.error(err);
      toast.error('Suspension modification failed.');
    } finally {
      setManagementUpdatingSuspension(false);
    }
  };

  const handleUpdateClientQuota = async () => {
    setManagementUpdatingQuota(true);
    try {
      const upd = { ...profileTargets, ai_quota_limit: managementAiQuotaInput };
      const { error } = await supabase.from('profiles').update({ targets: upd }).eq('id', selectedUserId);
      if (error) throw error;
      setProfileTargets(upd);
      toast.success('AI messages limit updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save quota limits.');
    } finally {
      setManagementUpdatingQuota(false);
    }
  };

  const handleToggleClientFeatures = async (fKey: string, active: boolean) => {
    setManagementUpdatingFeatures(true);
    try {
      const currentFeatures = profileTargets?.features_disabled || [];
      let updatedFeatures = [...currentFeatures];
      if (active) {
        // Enable feature = remove from disabled list
        updatedFeatures = updatedFeatures.filter((f: string) => f !== fKey);
      } else {
        // Disable feature = add to disabled list
        if (!updatedFeatures.includes(fKey)) updatedFeatures.push(fKey);
      }

      const upd = { ...profileTargets, features_disabled: updatedFeatures };
      const { error } = await supabase.from('profiles').update({ targets: upd }).eq('id', selectedUserId);
      if (error) throw error;
      setProfileTargets(upd);
      toast.success('Features access updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to change feature state.');
    } finally {
      setManagementUpdatingFeatures(false);
    }
  };

  const handleUpdateClientSubscription = async () => {
    setUpdatingSubscriptionState(true);
    try {
      const isDeactivated = profileTargets?.is_deactivated || false;
      const history = Array.isArray(profileTargets?.subscription_history) ? [...profileTargets.subscription_history] : [];
      
      let subscription_start_date = null;
      let subscription_end_date = null;
      const delayDays = parseInt(editSubscriptionDelay) || 0;

      const now = new Date();
      const startDateObj = new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000);
      subscription_start_date = startDateObj.toISOString();

      if (editSubscriptionPeriod === 'custom') {
        subscription_end_date = new Date(editCustomSubscriptionEnd).toISOString();
      } else {
        let durationMs = 30 * 24 * 60 * 60 * 1000;
        if (editSubscriptionPeriod === '2 weeks') durationMs = 14 * 24 * 60 * 60 * 1000;
        else if (editSubscriptionPeriod === '1 month') durationMs = 30 * 24 * 60 * 60 * 1000;
        else if (editSubscriptionPeriod === '3 months') durationMs = 90 * 24 * 60 * 60 * 1000;
        else if (editSubscriptionPeriod === '6 months') durationMs = 180 * 24 * 60 * 60 * 1000;
        else if (editSubscriptionPeriod === '12 months') durationMs = 365 * 24 * 60 * 60 * 1000;

        const endDateObj = new Date(startDateObj.getTime() + durationMs);
        subscription_end_date = endDateObj.toISOString();
      }

      const newEntry = {
        timestamp: now.toISOString(),
        action: 'manual_override',
        duration: editSubscriptionPeriod,
        delay_days: delayDays,
        start_date: subscription_start_date,
        end_date: subscription_end_date
      };

      const updatedTargets = {
        ...profileTargets,
        subscription_duration: editSubscriptionPeriod,
        subscription_delay_days: delayDays,
        subscription_start_date,
        subscription_end_date,
        is_deactivated: isDeactivated,
        subscription_history: [...history, newEntry]
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', selectedUserId);

      if (error) throw error;
      toast.success('Subscription updated successfully!');
      fetchClientData(selectedUserId, activeDateStr, true);
      fetchBaseData(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update subscription.');
    } finally {
      setUpdatingSubscriptionState(false);
    }
  };

  const handleDeleteManagementClient = async () => {
    if (!selectedUserId || !selectedClientProfile) return;
    if (deletingClient) return;

    const name = selectedClientProfile.user?.display_name || 'this client';
    const conf = window.prompt(`Type "${name}" to confirm complete account deletion (workouts, InBody, and auth logs will be wiped):`);
    if (conf !== name) {
      if (conf !== null) toast.error('Verification failed. Deletion cancelled.');
      return;
    }

    setDeletingClient(true);
    const toastId = toast.loading('Deleting athlete account...');
    try {
      // Cascade delete client records
      try {
        const { data: userWorkouts } = await supabase.from('workouts').select('id').eq('user_id', selectedUserId);
        const workoutIds = userWorkouts?.map(w => w.id) || [];
        if (workoutIds.length > 0) {
          await supabase.from('workout_exercises').delete().in('workout_id', workoutIds);
          await supabase.from('workouts').delete().in('id', workoutIds);
        }
      } catch (e) { console.warn(e); }

      try {
        const { data: userDietLogs } = await supabase.from('diet_logs').select('id').eq('user_id', selectedUserId);
        const dietLogIds = userDietLogs?.map(d => d.id) || [];
        if (dietLogIds.length > 0) {
          await supabase.from('diet_meals').delete().in('diet_log_id', dietLogIds);
          await supabase.from('diet_logs').delete().in('id', dietLogIds);
        }
      } catch (e) { console.warn(e); }

      try { await supabase.from('progress_notes').delete().eq('user_id', selectedUserId); } catch (e) {}
      try { await supabase.from('water_logs').delete().eq('user_id', selectedUserId); } catch (e) {}
      try { await supabase.from('inbody_scans').delete().eq('user_id', selectedUserId); } catch (e) {}
      try { await supabase.from('user_workout_plans').delete().eq('user_id', selectedUserId); } catch (e) {}
      try { await supabase.from('schedules').delete().eq('user_id', selectedUserId); } catch (e) {}
      try { await supabase.from('food_inventory').delete().eq('user_id', selectedUserId); } catch (e) {}
      try { await supabase.from('ai_chat').delete().eq('user_id', selectedUserId); } catch (e) {}
      try { await supabase.from('client_profiles').delete().eq('user_id', selectedUserId); } catch (e) {}
      
      await supabase.from('profiles').delete().eq('id', selectedUserId);

      // Auth deletion
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ uid: selectedUserId })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn('Auth deletion warning:', errData.error);
      }

      toast.success('Athlete wiped successfully.', { id: toastId });
      setSelectedUserId('');
      fetchBaseData(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Wipe failed: ' + err.message, { id: toastId });
    } finally {
      setDeletingClient(false);
    }
  };

  // ─── COACH PROFILE & SETTINGS MUTATORS ────────────────────────
  const handleSaveWhatsAppNumber = async () => {
    if (!coachUserId) return;
    setSavingWhatsAppNumber(true);
    try {
      const coachProfile = profiles.find(p => p.id === coachUserId);
      const currentTargets = coachProfile?.targets || {};
      const updatedTargets = { ...currentTargets, phone_number: ownWhatsAppNumber.trim() };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', coachUserId);

      if (error) throw error;
      toast.success('WhatsApp contact number updated successfully!');
      fetchBaseData(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update contact number.');
    } finally {
      setSavingWhatsAppNumber(false);
    }
  };

  const handleUpdateOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownNewPassword || ownNewPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (ownNewPassword !== ownConfirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setUpdatingOwnPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: ownNewPassword });
      if (error) throw error;

      const coachProfile = profiles.find(p => p.id === coachUserId);
      const currentTargets = coachProfile?.targets || {};
      const updatedTargets = { ...currentTargets, generated_passcode: ownNewPassword.trim() };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', coachUserId);
      if (profileError) throw profileError;

      toast.success('Your password has been updated!');
      setOwnNewPassword(''); setOwnConfirmPassword('');
      fetchBaseData(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update your password.');
    } finally {
      setUpdatingOwnPassword(false);
    }
  };

  // ─── OWNER-ONLY SYSTEM & SQL OPERATIONS ────────────────────────
  const handleExecuteSQL = async () => {
    if (!sqlQueryInput.trim()) return;
    setExecutingSql(true);
    setSqlQueryResult(null);
    try {
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: sqlQueryInput.trim() });
      if (error) {
        setSqlQueryResult({ error: error.message });
        toast.error('Query returned database error.');
      } else {
        setSqlQueryResult({ success: true, rows: data || [] });
        toast.success('Query executed successfully!');
      }
    } catch (err: any) {
      console.error(err);
      setSqlQueryResult({ error: err.message || 'Execution error.' });
      toast.error('SQL Execution failed.');
    } finally {
      setExecutingSql(false);
    }
  };

  const handleApprovePayment = async (targetCoachId: string, duration: string, amount: string) => {
    try {
      const coachProfile = profiles.find(p => p.id === targetCoachId);
      if (!coachProfile) throw new Error("Coach profile not found");
      
      const tg = { ...(coachProfile.targets || {}) };
      let durationDays = 30;
      if (duration === '2 weeks') durationDays = 14;
      else if (duration === '1 month') durationDays = 30;
      else if (duration === '3 months') durationDays = 90;
      else if (duration === '6 months') durationDays = 180;
      
      const now = new Date();
      let startDate = now;
      let currentEndDate = tg.subscription_end_date ? new Date(tg.subscription_end_date) : null;
      if (currentEndDate && currentEndDate > now) {
        startDate = currentEndDate;
      }
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      
      const newHistoryEntry = {
        timestamp: now.toISOString(),
        duration, amount, status: 'approved',
        details: 'Approved by Owner via Mobile Console'
      };
      
      const history = Array.isArray(tg.subscription_history) ? [...tg.subscription_history] : [];
      history.push(newHistoryEntry);
      
      const updatedTargets = {
        ...tg,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        subscription_duration: duration,
        subscription_history: history,
        is_deactivated: false,
        last_payment_result: { status: 'approved', timestamp: now.toISOString(), plan: duration, amount }
      };
      delete updatedTargets.pending_payment;
      
      const { error } = await supabase.from('profiles').update({ targets: updatedTargets }).eq('id', targetCoachId);
      if (error) throw error;
      
      toast.success(`Subscription approved for ${coachProfile.display_name}!`);
      fetchBaseData(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Verification failed.');
    }
  };

  const handleRejectPayment = async (targetCoachId: string, reason: string) => {
    try {
      const coachProfile = profiles.find(p => p.id === targetCoachId);
      if (!coachProfile) throw new Error("Coach profile not found");
      
      const tg = { ...(coachProfile.targets || {}) };
      const pending = tg.pending_payment;
      
      const now = new Date();
      const updatedTargets = {
        ...tg,
        last_payment_result: {
          status: 'rejected',
          timestamp: now.toISOString(),
          reason,
          plan: pending?.duration || 'N/A',
          amount: pending?.amount || 'N/A'
        }
      };
      delete updatedTargets.pending_payment;
      
      const { error } = await supabase.from('profiles').update({ targets: updatedTargets }).eq('id', targetCoachId);
      if (error) throw error;
      
      toast.success(`Subscription rejected.`);
      fetchBaseData(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Rejection failed.');
    }
  };

  const handleCopyCredentials = (txt: string, fieldName: string) => {
    navigator.clipboard.writeText(txt);
    toast.success(`${fieldName} copied!`);
  };

  const handleReassignClient = async (clientId: string, newCoachId: string) => {
    if (!newCoachId) return;
    try {
      const { error } = await supabase.from('profiles').update({ coach_id: newCoachId }).eq('id', clientId);
      if (error) throw error;
      toast.success("Athlete re-assigned successfully!");
      fetchBaseData(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reassign client.");
    }
  };

  // ─── HELPERS ──────────────────────────────────────────────────
  const athletes = profiles.filter(p => p.role === 'client');
  const activeCount = athletes.filter(c => getClientStatus(c) === 'Active').length;
  const trialCount = athletes.filter(c => c.targets?.is_free_trial === true || c.targets?.subscription_status === 'trial').length;
  const expiredCount = athletes.filter(c => getClientStatus(c) === 'Expired').length;

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
    if (p.role !== 'client') return false;
    if (!searchUserQuery) return true;
    const q = searchUserQuery.toLowerCase();
    return p.display_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      String(p.targets?.client_code).includes(q);
  });

  const filteredCatalog = exerciseDb.filter(ex => {
    if (!searchExerciseQuery) return false;
    return ex.name.toLowerCase().includes(searchExerciseQuery.toLowerCase()) ||
      ex.muscle_group?.toLowerCase().includes(searchExerciseQuery.toLowerCase());
  }).slice(0, 6);

  const athleteDayTypes = Array.from(new Set([
    'REST', 
    'RUN', 
    'RUN + GYM', 
    ...workoutPlans.map(p => p.plan_type),
    ...Object.keys(dayNutrition)
  ])).filter(Boolean);

  // ─── AUTH VAULT LOCK SCREEN RENDER ────────────────────────────
  if (!isAuthed) {
    return (
      <div className="flex flex-col items-center justify-center p-5 min-h-[92vh] relative z-10 text-center w-full max-w-[390px] mx-auto select-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, -5, 5, -2, 2, 0] } : {}}
          transition={{ duration: 0.5 }}
          className={`w-full bg-[#0c0d16]/85 border backdrop-blur-md rounded-[32px] p-8 space-y-8 relative z-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 ${shake ? 'border-red-500/40 shadow-red-500/5' : 'border-white/[0.06]'}`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/5">
              <Dumbbell size={24} />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-widest font-mono">Coach Portal</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">Enter passcode to unlock dossier</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 my-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: passcode.length > i ? 1.25 : 1,
                  backgroundColor: passcode.length > i ? '#3b82f6' : 'rgba(255,255,255,0.03)',
                  boxShadow: passcode.length > i ? '0 0 12px rgba(59, 130, 246, 0.7)' : 'none',
                  borderColor: passcode.length > i ? '#60a5fa' : 'rgba(255,255,255,0.08)'
                }}
                className="w-3.5 h-3.5 rounded-full border transition-all duration-150"
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-y-4 gap-x-5 max-w-[260px] mx-auto pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumPress(num)}
                className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.04] active:bg-blue-600/10 active:border-blue-500/30 flex items-center justify-center text-xl font-black text-white transition-all duration-100 active:scale-90 cursor-pointer shadow-md"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-16 h-16 rounded-full flex items-center justify-center text-[10px] uppercase font-black text-gray-500 active:text-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleNumPress('0')}
              className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.04] active:bg-blue-600/10 active:border-blue-500/30 flex items-center justify-center text-xl font-black text-white transition-all duration-100 active:scale-90 cursor-pointer shadow-md"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleNumBackspace}
              className="w-16 h-16 rounded-full flex items-center justify-center text-[10px] uppercase font-black text-gray-500 active:text-red-400 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── VIEW 1: HOME/OVERVIEW VIEW ───────────────────────────────
  const renderHomeView = () => {
    return (
      <div className="space-y-5">
        {/* Roster Metrics Ring Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-[#0c0d16]/80 to-[#090a12]/90 border border-white/[0.05] rounded-3xl p-4 flex flex-col justify-between shadow-lg shadow-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Active</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-3">{activeCount}</span>
            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Athletes</span>
          </div>
          <div className="bg-gradient-to-br from-[#0c0d16]/80 to-[#090a12]/90 border border-white/[0.05] rounded-3xl p-4 flex flex-col justify-between shadow-lg shadow-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-full blur-xl" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Trial</span>
            <span className="text-2xl font-black text-blue-400 font-mono mt-3">{trialCount}</span>
            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Extendable</span>
          </div>
          <div className="bg-gradient-to-br from-[#0c0d16]/80 to-[#090a12]/90 border border-white/[0.05] rounded-3xl p-4 flex flex-col justify-between shadow-lg shadow-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-xl" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Expired</span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-3">{expiredCount}</span>
            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Require Attention</span>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-md rounded-[32px] p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/[0.05] pb-3 select-none">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                <Flame size={13} className="text-orange-500" /> Real-time Activity
              </h3>
              <p className="text-[8px] text-gray-500 font-bold uppercase mt-0.5">Chronological actions log</p>
            </div>
            <button onClick={() => fetchBaseData(true)} className="p-2 border border-white/[0.05] hover:bg-white/[0.02] rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer">
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex justify-between items-center bg-white/[0.01] border border-white/[0.03] p-3 rounded-2xl">
            <label className="text-[9px] text-gray-400 font-black uppercase tracking-wider select-none cursor-pointer flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={feedFilterMineOnly}
                onChange={e => setFeedFilterMineOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-850 bg-[#0c0d16] text-blue-500 focus:ring-0 outline-none"
              />
              Filter My Clients Only
            </label>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
            {recentWorkouts.length === 0 && recentDiets.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic text-center py-10 font-bold">No client records logged recently.</p>
            ) : (
              [
                ...recentWorkouts.map(w => ({ ...w, type: 'workout' })),
                ...recentDiets.map(d => ({ ...d, type: 'diet' }))
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 15)
                .map((log, idx) => {
                  const name = log.profiles?.display_name || 'Athlete';
                  const code = log.profiles?.client_code || 'N/A';

                  if (log.type === 'workout') {
                    return (
                      <div key={`w-${idx}`} className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl flex flex-col gap-2 shadow-inner">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Dumbbell size={11} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white leading-tight">{name}</p>
                              <p className="text-[8px] text-blue-400 font-mono mt-0.5">FIT-ID: #{code}</p>
                            </div>
                          </div>
                          <span className="text-[8px] font-black bg-blue-900/30 text-blue-400 border border-blue-800/30 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                            Workout
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-300 leading-normal">
                          Completed <span className="text-white font-black">{log.name}</span> ({log.day_type})
                        </p>
                        <div className="flex justify-between items-center text-[8px] text-gray-500 font-mono mt-1 pt-1.5 border-t border-white/[0.02]">
                          <span>Volume: {log.total_volume} kg · {log.duration} mins</span>
                          <button
                            onClick={() => setSelectedReceiptWorkout(log)}
                            className="text-[8px] font-black uppercase text-blue-400 hover:text-white cursor-pointer active:scale-95 transition-all"
                          >
                            Receipt 🎟️
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    const kc = log.daily_totals?.kcal || 0;
                    const pr = log.daily_totals?.protein || 0;
                    return (
                      <div key={`d-${idx}`} className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl flex flex-col gap-2 shadow-inner">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              <Clock size={11} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white leading-tight">{name}</p>
                              <p className="text-[8px] text-indigo-400 font-mono mt-0.5">FIT-ID: #{code}</p>
                            </div>
                          </div>
                          <span className="text-[8px] font-black bg-indigo-900/30 text-indigo-400 border border-indigo-800/30 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                            Macros
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-300 leading-normal">
                          Logged <span className="text-white font-black">{Math.round(kc)} kcal</span> and <span className="text-white font-black">{Math.round(pr)}g protein</span>
                        </p>
                        <div className="text-[8px] text-gray-500 font-mono mt-1 pt-1.5 border-t border-white/[0.02]">
                          Logged at: {log.date}
                        </div>
                      </div>
                    );
                  }
                })
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── VIEW 2: ROSTER DIRECTORY VIEW ────────────────────────────
  const renderRosterView = () => {
    return (
      <div className="space-y-4">
        {/* Elegant Search Bar */}
        <div className="relative select-none">
          <input
            type="text"
            placeholder="Search by name, FIT-ID or code..."
            value={searchUserQuery}
            onChange={e => setSearchUserQuery(e.target.value)}
            className="w-full bg-[#0c0d16]/75 border border-white/[0.05] rounded-2xl p-4.5 pl-11 text-xs text-white outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all font-bold placeholder-gray-600"
          />
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
          {searchUserQuery && (
            <button onClick={() => setSearchUserQuery('')} className="absolute right-4.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Directory Athletes List */}
        <div className="space-y-3">
          {filteredProfiles.length === 0 ? (
            <p className="text-[10px] text-gray-500 italic text-center py-20 font-bold">No athletes match the search criteria.</p>
          ) : (
            filteredProfiles.map(client => {
              const status = getClientStatus(client);
              const colorClass = getClientStatusColor(status);
              const kcalVal = client.targets?.kcal || 2400;
              const proteinVal = client.targets?.protein || 160;

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedUserId(client.id)}
                  className="bg-gradient-to-br from-[#0c0d16]/80 to-[#090a12]/90 border border-white/[0.05] rounded-3xl p-4 flex flex-col gap-3.5 shadow-lg active:scale-[0.98] transition-all duration-150 cursor-pointer hover:border-blue-500/30 group"
                >
                  <div className="flex justify-between items-center select-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm shadow-inner group-hover:scale-105 transition-transform">
                        {client.display_name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white tracking-wide group-hover:text-blue-400 transition-colors">{client.display_name}</h4>
                        <p className="text-[9px] font-mono text-slate-500 mt-0.5">FIT-ID: #{client.targets?.client_code || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${colorClass}`}>
                      {status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider select-none border-t border-white/[0.02] pt-3">
                    <span>Targets: {kcalVal} Kcal · {proteinVal}g Protein</span>
                    {client.targets?.phone_number && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          let clean = client.targets.phone_number.replace(/\D/g, '');
                          if (clean.startsWith('01') && clean.length === 11) clean = '2' + clean;
                          else if (clean.startsWith('1') && clean.length === 10) clean = '20' + clean;
                          window.open(`https://wa.me/${clean}`, '_blank');
                        }}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/25 rounded-xl cursor-pointer active:scale-90 transition-all flex items-center gap-1 text-[8px] font-black tracking-wider"
                      >
                        <Phone size={10} /> Message
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ─── VIEW 2B: ATHLETE DRILL-DOWN DOSSIER VIEW ─────────────────
  const renderAthleteDetailView = () => {
    if (!currentClient) return null;

    const status = getClientStatus(currentClient);
    const badgeColor = getClientStatusColor(status);

    return (
      <div className="space-y-4">
        {/* Dossier Header */}
        <div className="bg-gradient-to-br from-[#0c0d16]/80 to-[#090a12]/90 border border-white/[0.05] rounded-[32px] p-5 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start select-none">
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUserId('')}
                className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-md"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-xs font-black text-white uppercase tracking-widest mt-0.5">Dossier File</h2>
                <h3 className="text-sm font-black text-white mt-1 leading-tight flex items-center gap-2">
                  {currentClient.display_name}
                  <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border leading-none ${badgeColor}`}>
                    {status}
                  </span>
                </h3>
              </div>
            </div>

            {currentClient.targets?.phone_number && (
              <button
                onClick={() => {
                  let clean = currentClient.targets.phone_number.replace(/\D/g, '');
                  if (clean.startsWith('01') && clean.length === 11) clean = '2' + clean;
                  else if (clean.startsWith('1') && clean.length === 10) clean = '20' + clean;
                  window.open(`https://wa.me/${clean}`, '_blank');
                }}
                className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-lg shadow-emerald-500/5"
              >
                <Phone size={15} />
              </button>
            )}
          </div>

          {/* Date Presets Selector bar */}
          <div className="flex items-center justify-between bg-black/40 border border-white/[0.04] p-2 rounded-2xl select-none">
            <button onClick={() => shiftDate(-1)} className="p-2.5 hover:bg-white/[0.03] rounded-xl text-gray-400 hover:text-white cursor-pointer active:scale-95 transition-all">
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-wider">
              <Calendar size={11} className="text-blue-400" />
              <span>
                {activeDateStr === todayStr ? 'Today' : activeDateStr === yesterdayStr ? 'Yesterday' : activeDateStr}
              </span>
            </div>
            <button onClick={() => shiftDate(1)} className="p-2.5 hover:bg-white/[0.03] rounded-xl text-gray-400 hover:text-white cursor-pointer active:scale-95 transition-all">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Dynamic compliance status gauges */}
          <div className="grid grid-cols-3 gap-3">
            <CircularProgress value={consumedMacros.kcal} max={targetKcal} color="#3b82f6" label="Kcal" />
            <CircularProgress value={waterTotalMl} max={targetWaterLiters * 1000} color="#06b6d4" label="Water" />
            <CircularProgress value={workoutStatus} max={1.0} color="#10b981" label="Gym" />
          </div>
        </div>

        {/* Dossier Sliding Subtabs Switcher */}
        <div className="flex bg-[#0c0d16]/75 border border-white/[0.05] rounded-2xl p-1 overflow-x-auto no-scrollbar gap-1 relative z-25">
          {([
            { id: 'plan', label: 'Plan', icon: <Sparkles size={12} /> },
            { id: 'diet', label: 'Diet', icon: <Clock size={12} /> },
            { id: 'water', label: 'Water', icon: <Droplets size={12} /> },
            { id: 'gym', label: 'Gym', icon: <Dumbbell size={12} /> },
            { id: 'inbody', label: 'InBody', icon: <Activity size={12} /> },
            { id: 'control', label: 'Control', icon: <Settings size={12} /> }
          ] as const).map(tab => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors duration-250 cursor-pointer whitespace-nowrap shrink-0 z-10 ${
                  isActive ? 'text-white font-black' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="athleteSubTabHighlight"
                    className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-xl -z-10 shadow-inner"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub-tab Rendering */}
        <div className="pb-12">
          {/* PLAN SUB-TAB */}
          {activeSubTab === 'plan' && (
            <div className="space-y-4">
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5 select-none">
                  <Sparkles size={13} /> Base Plan Targets
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black text-gray-500 block mb-1 uppercase tracking-wider select-none">Work Day Calories</label>
                      <input
                        type="number"
                        value={targetKcal}
                        onChange={e => setTargetKcal(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white text-center font-mono font-black outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-gray-500 block mb-1 uppercase tracking-wider select-none">Water Target (Liters)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={targetWaterLiters}
                        onChange={e => setTargetWaterLiters(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white text-center font-mono font-black outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[8px] text-gray-500 text-center mb-1 uppercase font-black tracking-wider select-none">Protein (g)</p>
                      <input
                        type="number"
                        value={targetProtein}
                        onChange={e => setTargetProtein(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 text-xs text-white text-center font-mono font-black outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-500 text-center mb-1 uppercase font-black tracking-wider select-none">Carbs (g)</p>
                      <input
                        type="number"
                        value={targetCarbs}
                        onChange={e => setTargetCarbs(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 text-xs text-white text-center font-mono font-black outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-500 text-center mb-1 uppercase font-black tracking-wider select-none">Fat (g)</p>
                      <input
                        type="number"
                        value={targetFat}
                        onChange={e => setTargetFat(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 text-xs text-white text-center font-mono font-black outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2 border-t border-white/[0.04] select-none">
                    <button
                      onClick={handleSaveBaselineNutrition}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1"
                    >
                      <Save size={12} /> Save Macros
                    </button>
                    <button
                      onClick={handleSaveWaterGoal}
                      className="py-3 px-4.5 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center"
                    >
                      Save Water
                    </button>
                  </div>
                </div>
              </div>

              {/* Day-type Overrides list */}
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase text-violet-400 tracking-wider flex items-center gap-1.5 select-none">
                  <Calendar size={13} /> Day-type Overrides
                </h3>

                <div className="space-y-2.5">
                  {athleteDayTypes.map(dt => {
                    const exist = dayNutrition[dt];
                    const isEditing = editingDayType === dt;

                    return (
                      <div key={dt} className="bg-white/[0.01] border border-white/[0.04] rounded-2xl overflow-hidden p-3.5 space-y-3">
                        <div className="flex justify-between items-center select-none">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded ${dayColor(dt)}`}>
                            {dt} Day
                          </span>
                          {!isEditing && (
                            <button
                              onClick={() => handleOpenDayEdit(dt)}
                              className="p-1.5 bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white rounded-lg cursor-pointer active:scale-90 transition-all border border-white/[0.04]"
                            >
                              <Edit3 size={11} />
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-3 pt-1 border-t border-white/[0.02] select-none">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[7.5px] font-bold text-gray-500 uppercase tracking-wide">Calories (Kcal)</label>
                                <input
                                  type="number"
                                  value={editDayKcal}
                                  onChange={e => setEditDayKcal(Math.max(0, parseInt(e.target.value) || 0))}
                                  className="w-full bg-[#11121d] border border-white/[0.05] rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 font-mono font-bold text-center"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-1 col-span-1">
                                <div>
                                  <label className="text-[7.5px] font-bold text-gray-500 uppercase tracking-wide">P</label>
                                  <input
                                    type="number"
                                    value={editDayProtein}
                                    onChange={e => setEditDayProtein(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full bg-[#11121d] border border-[#ffffff09] rounded-lg p-2 text-[10px] text-white outline-none focus:border-blue-500 font-mono font-bold text-center"
                                  />
                                </div>
                                <div>
                                  <label className="text-[7.5px] font-bold text-gray-500 uppercase tracking-wide">C</label>
                                  <input
                                    type="number"
                                    value={editDayCarbs}
                                    onChange={e => setEditDayCarbs(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full bg-[#11121d] border border-[#ffffff09] rounded-lg p-2 text-[10px] text-white outline-none focus:border-blue-500 font-mono font-bold text-center"
                                  />
                                </div>
                                <div>
                                  <label className="text-[7.5px] font-bold text-gray-500 uppercase tracking-wide">F</label>
                                  <input
                                    type="number"
                                    value={editDayFat}
                                    onChange={e => setEditDayFat(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full bg-[#11121d] border border-[#ffffff09] rounded-lg p-2 text-[10px] text-white outline-none focus:border-blue-500 font-mono font-bold text-center"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button onClick={handleSaveDayNutrition} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider rounded-lg cursor-pointer active:scale-95 transition-all">
                                Save
                              </button>
                              <button onClick={() => setEditingDayType(null)} className="px-3 py-2 bg-white/[0.02] border border-white/[0.04] text-slate-400 hover:text-white text-[9px] font-bold uppercase rounded-lg cursor-pointer transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 font-mono mt-1 pt-1.5 border-t border-white/[0.02] font-semibold text-center select-none">
                            <div>
                              <p className="text-[7.5px] text-gray-500 uppercase font-black">Kcal</p>
                              <p className="text-white font-black mt-0.5">{exist?.kcal ?? targetKcal}</p>
                            </div>
                            <div>
                              <p className="text-[7.5px] text-gray-500 uppercase font-black">Prot</p>
                              <p className="text-white font-black mt-0.5">{exist?.protein ?? targetProtein}g</p>
                            </div>
                            <div>
                              <p className="text-[7.5px] text-gray-500 uppercase font-black">Carb</p>
                              <p className="text-white font-black mt-0.5">{exist?.carbs ?? targetCarbs}g</p>
                            </div>
                            <div>
                              <p className="text-[7.5px] text-gray-500 uppercase font-black">Fat</p>
                              <p className="text-white font-black mt-0.5">{exist?.fat ?? targetFat}g</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* DIET SUB-TAB */}
          {activeSubTab === 'diet' && (
            <div className="space-y-4">
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex justify-between items-center select-none">
                  <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                    <Clock size={13} /> Daily Logged Meals
                  </h3>
                  <button
                    onClick={() => setShowAddMealForm(prev => !prev)}
                    className="p-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/25 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center"
                  >
                    {showAddMealForm ? <X size={12} /> : <Plus size={12} />}
                  </button>
                </div>

                {/* Macro Progress Rings */}
                <div className="grid grid-cols-4 gap-2">
                  <CircularProgress value={consumedMacros.kcal} max={targetKcal} color="#3b82f6" label="Kcal" />
                  <CircularProgress value={consumedMacros.protein} max={targetProtein} color="#a855f7" label="Protein" />
                  <CircularProgress value={consumedMacros.carbs} max={targetCarbs} color="#10b981" label="Carbs" />
                  <CircularProgress value={consumedMacros.fat} max={targetFat} color="#fbbf24" label="Fat" />
                </div>

                {showAddMealForm && (
                  <form
                    onSubmit={e => { e.preventDefault(); handleAddMealLog(); }}
                    className="bg-[#11121d] border border-white/[0.04] p-4 rounded-2xl space-y-3 animate-fade-in"
                  >
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-500 block mb-1 select-none">Meal Name / Desc</label>
                      <input
                        type="text"
                        placeholder="e.g. Oatmeal with Whey & Berries"
                        value={newMealName}
                        onChange={e => setNewMealName(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 font-mono">
                      <div>
                        <label className="text-[7.5px] font-black uppercase text-slate-500 block mb-1 text-center select-none">Kcal</label>
                        <input
                          type="number"
                          value={newMealKcal}
                          onChange={e => setNewMealKcal(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 text-center font-black"
                        />
                      </div>
                      <div>
                        <label className="text-[7.5px] font-black uppercase text-slate-500 block mb-1 text-center select-none">Prot</label>
                        <input
                          type="number"
                          value={newMealProtein}
                          onChange={e => setNewMealProtein(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 text-center font-black"
                        />
                      </div>
                      <div>
                        <label className="text-[7.5px] font-black uppercase text-slate-500 block mb-1 text-center select-none">Carb</label>
                        <input
                          type="number"
                          value={newMealCarbs}
                          onChange={e => setNewMealCarbs(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 text-center font-black"
                        />
                      </div>
                      <div>
                        <label className="text-[7.5px] font-black uppercase text-slate-500 block mb-1 text-center select-none">Fat</label>
                        <input
                          type="number"
                          value={newMealFat}
                          onChange={e => setNewMealFat(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 text-center font-black"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-md"
                    >
                      Log Meal
                    </button>
                  </form>
                )}

                {/* Meals list */}
                <div className="space-y-2.5">
                  {meals.length === 0 ? (
                    <p className="text-[9px] text-gray-500 italic text-center py-6 select-none font-bold">No meals logged for this date.</p>
                  ) : (
                    meals.map(m => {
                      const macrosSum = m.items?.reduce((a: any, c: any) => {
                        a.kcal += c.macros?.kcal || 0;
                        a.protein += c.macros?.protein || 0;
                        a.carbs += c.macros?.carbs || 0;
                        a.fat += c.macros?.fat || 0;
                        return a;
                      }, { kcal: 0, protein: 0, carbs: 0, fat: 0 }) || { kcal: 0, protein: 0, carbs: 0, fat: 0 };

                      return (
                        <div key={m.id} className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-2xl flex flex-col gap-2 shadow-inner">
                          <div className="flex justify-between items-center select-none">
                            <div>
                              <p className="text-[10px] font-black text-white leading-snug">{m.name}</p>
                              <p className="text-[8px] text-gray-500 font-mono mt-0.5">Logged at: {m.time || 'N/A'}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteMeal(m.id)}
                              className="p-1.5 hover:bg-red-950/40 text-gray-500 hover:text-red-400 rounded-lg cursor-pointer active:scale-90 transition-all border border-transparent hover:border-red-900/20"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-[8.5px] text-slate-400 font-mono text-center bg-black/30 p-1.5 rounded-lg select-none">
                            <span>{Math.round(macrosSum.kcal)} kc</span>
                            <span>P: {Math.round(macrosSum.protein)}g</span>
                            <span>C: {Math.round(macrosSum.carbs)}g</span>
                            <span>F: {Math.round(macrosSum.fat)}g</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WATER SUB-TAB */}
          {activeSubTab === 'water' && (
            <div className="space-y-4">
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5 select-none">
                  <Droplets size={13} /> Daily Water Intake
                </h3>

                {/* Progress bar */}
                <div className="space-y-2 select-none">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Progress: {Math.round((waterTotalMl / (targetWaterLiters * 1000)) * 100)}%</span>
                    <span>{waterTotalMl} ml / {targetWaterLiters * 1000} ml</span>
                  </div>
                  <ProgressBar value={waterTotalMl} max={targetWaterLiters * 1000} color="#06b6d4" />
                </div>

                {/* Quick Log Cup Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2 select-none">
                  {([
                    { amount: 250, label: 'Cup 🥛' },
                    { amount: 500, label: 'Bottle 🍼' },
                    { amount: 1000, label: 'Jug 🫙' }
                  ] as const).map(preset => (
                    <button
                      key={preset.amount}
                      onClick={() => { setNewWaterAmount(preset.amount); setTimeout(handleAddWater, 50); }}
                      className="py-3 bg-white/[0.02] border border-white/[0.04] hover:bg-cyan-600/10 hover:border-cyan-500/30 text-white rounded-2xl cursor-pointer active:scale-95 transition-all shadow-md flex flex-col items-center gap-1.5 text-[9px] font-black uppercase tracking-wider"
                    >
                      <span>+{preset.amount}ml</span>
                      <span className="text-[8px] text-gray-500">{preset.label}</span>
                    </button>
                  ))}
                </div>

                {/* Logs list */}
                <div className="space-y-2 border-t border-white/[0.04] pt-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 select-none">Logs History</p>
                  {waterLogs.length === 0 ? (
                    <p className="text-[9px] text-gray-500 italic text-center py-4 select-none font-bold">No water logged for this date.</p>
                  ) : (
                    waterLogs.map(wl => (
                      <div key={wl.id} className="flex justify-between items-center bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl select-none shadow-inner">
                        <span className="text-[10px] font-black text-cyan-400 font-mono">+{wl.amount_ml} ml</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-gray-500 font-mono">{new Date(wl.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <button
                            onClick={() => handleDeleteWater(wl.id)}
                            className="p-1 hover:bg-red-950/40 text-gray-500 hover:text-red-400 rounded-lg cursor-pointer active:scale-90 transition-all border border-transparent hover:border-red-900/20"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GYM WORKOUTS SUB-TAB */}
          {activeSubTab === 'gym' && (
            <div className="space-y-4">
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex justify-between items-center select-none">
                  <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                    <Dumbbell size={13} /> Training Plan Routines
                  </h3>
                  <button
                    onClick={() => setShowAddSplitForm(prev => !prev)}
                    className="p-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/25 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center font-bold"
                  >
                    {showAddSplitForm ? <X size={12} /> : <Plus size={12} />}
                  </button>
                </div>

                {showAddSplitForm && (
                  <form
                    onSubmit={handleCreateSplitDay}
                    className="bg-[#11121d] border border-white/[0.04] p-4 rounded-2xl space-y-3 animate-fade-in"
                  >
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-500 block mb-1 select-none">Split Day Name</label>
                      <input
                        type="text"
                        placeholder="e.g. UPPER A, PUSH B"
                        value={newSplitDayName}
                        onChange={e => setNewSplitDayName(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono font-black"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-md"
                    >
                      Create Day Split
                    </button>
                  </form>
                )}

                {/* Workout plans/splits list */}
                <div className="space-y-3">
                  {workoutPlans.length === 0 ? (
                    <p className="text-[9px] text-gray-500 italic text-center py-6 select-none font-bold">No routines split days configured.</p>
                  ) : (
                    workoutPlans.map(plan => {
                      const isExpanded = activeSplitEditKey === plan.plan_type;
                      return (
                        <div key={plan.id} className="bg-white/[0.01] border border-white/[0.04] rounded-2xl overflow-hidden shadow-inner">
                          <div className="p-3.5 flex justify-between items-center bg-white/[0.01] select-none">
                            <button
                              onClick={() => setActiveSplitEditKey(isExpanded ? null : plan.plan_type)}
                              className="flex items-center gap-2 text-xs font-black text-white hover:text-blue-400 transition-colors cursor-pointer text-left flex-1"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                              {plan.plan_type} ({plan.exercises?.length || 0} exercises)
                            </button>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleRenameSplitDay(plan)}
                                className="p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer transition-colors active:scale-90"
                              >
                                <Edit3 size={11} />
                              </button>
                              <button
                                onClick={() => handleDeleteSplitDay(plan.id)}
                                className="p-1 text-slate-500 hover:text-red-400 rounded cursor-pointer transition-colors active:scale-90"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-3.5 border-t border-white/[0.04] bg-[#090a12]/50 space-y-3 animate-fade-in">
                              {/* Exercise Catalog Search */}
                              <div className="space-y-2">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Add exercise from database..."
                                    value={searchExerciseQuery}
                                    onChange={e => setSearchExerciseQuery(e.target.value)}
                                    className="w-full bg-[#11121d] border border-white/[0.05] rounded-xl p-2.5 pl-9 text-[10px] text-white outline-none focus:border-blue-500 font-bold"
                                  />
                                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                                </div>
                                {filteredCatalog.length > 0 && (
                                  <div className="bg-[#11121d] border border-white/[0.05] rounded-xl p-1 max-h-[160px] overflow-y-auto space-y-1 z-30 select-none shadow-md">
                                    {filteredCatalog.map(ex => (
                                      <button
                                        key={ex.id}
                                        onClick={() => handleAddExerciseToSplit(plan.plan_type, ex)}
                                        className="w-full text-left p-2 hover:bg-white/[0.02] text-[10px] text-gray-300 hover:text-white rounded-lg cursor-pointer flex justify-between items-center font-bold"
                                      >
                                        <span>{ex.name}</span>
                                        <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-gray-400 font-mono font-medium">{ex.muscle_group}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Exercises listed */}
                              <div className="space-y-2.5">
                                {(!plan.exercises || plan.exercises.length === 0) ? (
                                  <p className="text-[9px] text-gray-500 italic text-center py-4 select-none font-bold">No exercises added to this split.</p>
                                ) : (
                                  plan.exercises.map((ex: any, exIdx: number) => (
                                    <div key={ex.id || exIdx} className="bg-black/30 border border-white/[0.03] p-3 rounded-xl flex flex-col gap-2.5 shadow-md">
                                      <div className="flex justify-between items-start select-none">
                                        <div>
                                          <p className="text-[10px] font-black text-white leading-snug">{ex.name}</p>
                                          <p className="text-[8px] text-slate-500 font-mono mt-0.5">{ex.muscle_group || 'Any Muscle'}</p>
                                        </div>
                                        <button
                                          onClick={() => handleRemoveExerciseFromSplit(plan.plan_type, ex.id)}
                                          className="p-1 hover:bg-red-950/40 text-gray-500 hover:text-red-400 rounded cursor-pointer transition-all active:scale-90"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono select-none">
                                        <div className="flex items-center gap-1.5 bg-white/[0.01] border border-white/[0.03] px-2.5 py-1.5 rounded-lg">
                                          <span className="text-gray-500 font-black uppercase">Sets:</span>
                                          <input
                                            type="number"
                                            value={ex.sets}
                                            onChange={e => handleUpdateExerciseStats(plan.plan_type, ex.id, parseInt(e.target.value) || 3, ex.rest)}
                                            className="w-10 bg-transparent text-white font-black outline-none border-none text-center focus:ring-0 focus:outline-none p-0"
                                          />
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white/[0.01] border border-white/[0.03] px-2.5 py-1.5 rounded-lg">
                                          <span className="text-gray-500 font-black uppercase">Rest:</span>
                                          <input
                                            type="number"
                                            value={ex.rest}
                                            onChange={e => handleUpdateExerciseStats(plan.plan_type, ex.id, ex.sets, parseInt(e.target.value) || 120)}
                                            className="w-10 bg-transparent text-white font-black outline-none border-none text-center focus:ring-0 focus:outline-none p-0"
                                          />
                                          <span className="text-gray-500">s</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* INBODY SCANS SUB-TAB */}
          {activeSubTab === 'inbody' && (
            <div className="space-y-4">
              {/* Segmental Lean Body Map Card */}
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5 select-none">
                  <Activity size={13} /> Segmental Lean Map
                </h3>
                <div className="flex justify-center py-2 select-none">
                  <SegmentalBodyMap
                    scan={scans[0] || {}}
                    allScans={scans || []}
                  />
                </div>
              </div>

              {/* Scans List & Manual scans entry */}
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex justify-between items-center select-none">
                  <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <Activity size={13} /> Scans Log History
                  </h3>
                  <button
                    onClick={() => setShowAddScanForm(prev => !prev)}
                    className="p-1.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/25 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center font-bold"
                  >
                    {showAddScanForm ? <X size={12} /> : <Plus size={12} />}
                  </button>
                </div>

                {showAddScanForm && (
                  <form
                    onSubmit={handleAddInBodyScan}
                    className="bg-[#11121d] border border-white/[0.04] p-4 rounded-2xl space-y-3 animate-fade-in"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-500 block mb-1 select-none">Scan Date</label>
                        <input
                          type="date"
                          value={newScanDate}
                          onChange={e => setNewScanDate(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-500 block mb-1 select-none">Score</label>
                        <input
                          type="number"
                          value={newScanScore}
                          onChange={e => setNewScanScore(Math.max(0, parseInt(e.target.value) || 75))}
                          className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono font-bold text-center"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-500 block mb-1 text-center select-none">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 78.5"
                          value={newScanWeight}
                          onChange={e => setNewScanWeight(e.target.value)}
                          className="w-full bg-[#0c0d16] border border-white/[0.04] rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 font-mono text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-500 block mb-1 text-center select-none">SMM (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 36.2"
                          value={newScanSmm}
                          onChange={e => setNewScanSmm(e.target.value)}
                          className="w-full bg-[#0c0d16] border border-white/[0.04] rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 font-mono text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-500 block mb-1 text-center select-none">BF %</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 15.4"
                          value={newScanBfPercent}
                          onChange={e => setNewScanBfPercent(e.target.value)}
                          className="w-full bg-[#0c0d16] border border-white/[0.04] rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 font-mono text-center font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-md"
                    >
                      Save InBody scan
                    </button>
                  </form>
                )}

                {/* Scans list items */}
                <div className="space-y-2.5">
                  {scans.length === 0 ? (
                    <p className="text-[9px] text-gray-500 italic text-center py-6 select-none font-bold">No composition scans recorded.</p>
                  ) : (
                    scans.map(sc => {
                      const isExp = expandedScanId === sc.id;
                      return (
                        <div key={sc.id} className="bg-white/[0.01] border border-white/[0.04] rounded-2xl overflow-hidden shadow-inner">
                          <div className="p-3.5 flex justify-between items-center select-none">
                            <button
                              onClick={() => setExpandedScanId(isExp ? null : sc.id)}
                              className="text-left font-mono text-xs font-black text-white hover:text-emerald-400 transition-colors flex items-center gap-2 cursor-pointer flex-1"
                            >
                              <Calendar size={12} className="text-emerald-400" />
                              {sc.date} · {sc.weight} kg (BF: {sc.bf_percent}%)
                            </button>
                            <button
                              onClick={() => handleDeleteScan(sc.id)}
                              className="p-1 text-slate-500 hover:text-red-400 rounded cursor-pointer transition-colors active:scale-90"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>

                          {isExp && (
                            <div className="p-3.5 border-t border-white/[0.04] bg-[#090a12]/50 grid grid-cols-3 gap-2.5 text-[10px] text-slate-400 font-mono text-center select-none animate-fade-in font-bold">
                              <div>
                                <p className="text-[7.5px] text-gray-500 uppercase font-black">SMM Muscle</p>
                                <p className="text-white font-black mt-0.5">{sc.smm || 'N/A'} kg</p>
                              </div>
                              <div>
                                <p className="text-[7.5px] text-gray-500 uppercase font-black">BFM Fat Mass</p>
                                <p className="text-white font-black mt-0.5">{sc.bfm || 'N/A'} kg</p>
                              </div>
                              <div>
                                <p className="text-[7.5px] text-gray-500 uppercase font-black">Scan Score</p>
                                <p className="text-white font-black mt-0.5">{sc.score || 75} pts</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CONTROL SUB-TAB */}
          {activeSubTab === 'control' && (
            <div className="space-y-4">
              {/* Feature locks & permissions triggers */}
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4 select-none">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                  <Settings size={13} /> Features Availability
                </h3>

                <div className="space-y-3 font-semibold text-[10px] text-gray-300">
                  {([
                    { key: 'diet', label: 'Diet logs access', desc: 'Allows logging daily foods & macros progress.' },
                    { key: 'workout', label: 'Workouts logs access', desc: 'Allows active gym routine tracking.' },
                    { key: 'water', label: 'Water tracker access', desc: 'Enables quick daily water cups logging.' },
                    { key: 'chat', label: 'AI Coach assistant access', desc: 'Allows conversations with the AI coach.' },
                    { key: 'inbody', label: 'InBody composition scans', desc: 'Shows lean body map and scans history.' }
                  ] as const).map(feat => {
                    const isDisabled = (profileTargets?.features_disabled || []).includes(feat.key);
                    return (
                      <label key={feat.key} className="flex justify-between items-center bg-white/[0.01] border border-white/[0.04] p-3 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-colors">
                        <div className="flex flex-col gap-0.5 pr-4">
                          <span className="font-black text-white">{feat.label}</span>
                          <span className="text-[8px] text-gray-500 leading-normal">{feat.desc}</span>
                        </div>
                        <input
                          type="checkbox"
                          disabled={managementUpdatingFeatures}
                          checked={!isDisabled}
                          onChange={e => handleToggleClientFeatures(feat.key, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-850 bg-[#0c0d16] text-blue-500 focus:ring-0 outline-none cursor-pointer shrink-0"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* AI Message limits & quota setups */}
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5 select-none">
                  <Clock size={13} /> AI Assistant Messages Limit
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider select-none">
                    <span>Limit quota: {managementAiQuotaInput} messages</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={managementAiQuotaInput}
                    onChange={e => setManagementAiQuotaInput(parseInt(e.target.value))}
                    className="w-full bg-[#1c1d2e] border-none rounded-lg h-2 accent-blue-500 cursor-pointer"
                  />
                  <button
                    onClick={handleUpdateClientQuota}
                    disabled={managementUpdatingQuota}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-md select-none"
                  >
                    Save limit configurations
                  </button>
                </div>
              </div>

              {/* Subscriptions duration extensions */}
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5 select-none">
                  <Calendar size={13} /> Extend License Duration
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-[8px] font-black uppercase text-slate-500 block mb-1 select-none">Plan Extension period</label>
                    <select
                      value={editSubscriptionPeriod}
                      onChange={e => setEditSubscriptionPeriod(e.target.value)}
                      className="w-full bg-[#11121d] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-bold"
                    >
                      <option value="none">None / Free Trial</option>
                      <option value="2 weeks">Extend by 2 Weeks</option>
                      <option value="1 month">Extend by 1 Month</option>
                      <option value="3 months">Extend by 3 Months</option>
                      <option value="6 months">Extend by 6 Months</option>
                      <option value="12 months">Extend by 12 Months</option>
                      <option value="custom">Set Specific Custom End Date</option>
                    </select>
                  </div>

                  {editSubscriptionPeriod === 'custom' && (
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-500 block mb-1 select-none">Custom End Date/Time</label>
                      <input
                        type="datetime-local"
                        value={editCustomSubscriptionEnd}
                        onChange={e => setEditCustomSubscriptionEnd(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-mono font-black"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-500 block mb-1 select-none">Delay Start (Days)</label>
                      <input
                        type="number"
                        value={editSubscriptionDelay}
                        onChange={e => setEditSubscriptionDelay(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-mono font-black text-center"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <button
                        onClick={handleUpdateClientSubscription}
                        disabled={updatingSubscriptionState}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-md select-none"
                      >
                        {updatingSubscriptionState ? 'Updating...' : 'Update Plan'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.04] pt-3 flex gap-3.5 select-none">
                    <button
                      onClick={() => handleUpdateClientSuspension(!profileTargets?.is_deactivated)}
                      disabled={managementUpdatingSuspension || deletingClient}
                      className={`flex-1 py-3 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-md ${
                        profileTargets?.is_deactivated
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : 'bg-amber-600 hover:bg-amber-500'
                      } disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed`}
                    >
                      {profileTargets?.is_deactivated ? 'Reactivate access' : 'Suspend client'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Passcode changes */}
              <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5 select-none">
                  <Key size={13} /> Reset Fit Passcode
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="New client passcode PIN (min 6 characters)"
                    value={managementNewPassword}
                    onChange={e => setManagementNewPassword(e.target.value)}
                    disabled={managementUpdatingPassword || deletingClient}
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-bold disabled:opacity-50"
                  />
                  <button
                    onClick={handleUpdateClientPassword}
                    disabled={managementUpdatingPassword || deletingClient}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-md select-none"
                  >
                    Save client passcode
                  </button>
                </div>
              </div>

              {/* Danger Zone: delete completamente */}
              <div className="bg-[#1c080e]/60 border border-red-900/30 rounded-3xl p-5 shadow-xl space-y-3">
                <h3 className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5 select-none">
                  <AlertTriangle size={13} /> Wipe Athlete Account
                </h3>
                <p className="text-[9.5px] text-red-300 font-bold leading-normal select-none">
                  Completely delete this athlete profile, including exercise plans, weight history logs, meals logged, and user credentials. This operation is irreversible.
                </p>
                <button
                  onClick={handleDeleteManagementClient}
                  disabled={deletingClient}
                  className="w-full py-3.5 bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-400 hover:text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-800 disabled:cursor-not-allowed font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 select-none"
                >
                  <Trash size={12} /> {deletingClient ? 'Deleting dossier...' : 'Delete athlete dossiers'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── VIEW 3: DEPLOY ATHLETE VIEW WIZARD ────────────────────────
  const renderDeployView = () => {
    if (deploySuccessData) {
      return (
        <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-[32px] p-6 shadow-xl space-y-6 text-center animate-fade-in select-none">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mx-auto animate-pulse">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Athlete Deployed Successfully!</h3>
            <p className="text-[9px] text-gray-500 font-bold mt-1">Copy and share these Fit login details with the client</p>
          </div>

          <div className="bg-black/50 border border-white/[0.04] rounded-2xl p-4 text-left space-y-3 font-mono text-[10px]">
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
              <span className="text-gray-500 font-bold">CLIENT NUMBER:</span>
              <span className="text-emerald-400 font-black font-mono">#{deploySuccessData.clientCode}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
              <div>
                <p className="text-gray-500 font-bold text-[8px]">USERNAME / FIT-ID:</p>
                <p className="text-white font-extrabold mt-0.5">{deploySuccessData.username}</p>
              </div>
              <button onClick={() => handleCopyCredentials(deploySuccessData.username, 'Username')} className="p-2 hover:bg-white/[0.03] rounded-lg text-gray-400 hover:text-white cursor-pointer active:scale-95">
                <Copy size={13} />
              </button>
            </div>
            <div className="flex justify-between items-center pb-1">
              <div>
                <p className="text-gray-500 font-bold text-[8px]">FIT PASSCODE:</p>
                <p className="text-white font-extrabold mt-0.5">{deploySuccessData.password}</p>
              </div>
              <button onClick={() => handleCopyCredentials(deploySuccessData.password, 'Passcode')} className="p-2 hover:bg-white/[0.03] rounded-lg text-gray-400 hover:text-white cursor-pointer active:scale-95">
                <Copy size={13} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setDeploySuccessData(null)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
          >
            Deploy Another Athlete
          </button>
        </div>
      );
    }

    return (
      <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-[32px] p-5 shadow-xl space-y-4">
        {/* Wizard progress header */}
        <div className="flex justify-between items-center border-b border-white/[0.05] pb-3 select-none">
          <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider">Deploy Athlete Wizard</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  deployStep === step ? 'bg-blue-500 scale-125 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {deployError && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-black p-3.5 rounded-2xl select-none">
            {deployError}
          </div>
        )}

        {/* Step 1: Identity & Credentials */}
        {deployStep === 1 && (
          <div className="space-y-3">
            <div>
              <label className="text-[8px] font-black uppercase text-gray-500 block mb-1 select-none">Display Name</label>
              <input
                type="text"
                placeholder="e.g. Thor Odinson"
                value={deployFormData.displayName}
                onChange={e => setDeployFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] font-black uppercase text-gray-500 block mb-1 select-none">Username (No spaces)</label>
                <input
                  type="text"
                  placeholder="e.g. thorodinson"
                  value={deployFormData.username}
                  onChange={e => setDeployFormData(prev => ({ ...prev, username: e.target.value.replace(/[\s.]/g, '').toLowerCase() }))}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-bold"
                />
                {isUsernameChecking && <p className="text-[7.5px] text-gray-500 mt-1 select-none font-bold">Verifying...</p>}
                {isUsernameTaken && <p className="text-[7.5px] text-red-400 mt-1 select-none font-bold">Username taken.</p>}
              </div>
              <div>
                <label className="text-[8px] font-black uppercase text-gray-500 block mb-1 select-none">Passcode (PIN/Pass)</label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={deployFormData.password}
                  onChange={e => setDeployFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] font-black uppercase text-gray-500 block mb-1 select-none">Client Code (#)</label>
                <input
                  type="number"
                  placeholder="e.g. 2011"
                  value={deployFormData.clientCode}
                  onChange={e => setDeployFormData(prev => ({ ...prev, clientCode: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-mono font-black"
                />
                {isClientCodeChecking && <p className="text-[7.5px] text-gray-500 mt-1 select-none font-bold">Verifying...</p>}
                {isClientCodeTaken && <p className="text-[7.5px] text-red-400 mt-1 select-none font-bold">Number taken.</p>}
              </div>
              <div>
                <label className="text-[8px] font-black uppercase text-gray-500 block mb-1 select-none">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +201xxxxxxxx"
                  value={deployFormData.phoneNumber}
                  onChange={e => setDeployFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-mono font-black"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] font-black uppercase text-gray-500 block mb-1 select-none">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={deployFormData.age}
                  onChange={e => setDeployFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-mono font-black"
                />
              </div>
              <div>
                <label className="text-[8px] font-black uppercase text-gray-500 block mb-1 select-none">Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 180"
                  value={deployFormData.height}
                  onChange={e => setDeployFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-mono font-black"
                />
              </div>
            </div>
            
            {/* Gender Selector with sliding highlight */}
            <div>
              <label className="text-[8px] font-black uppercase text-gray-500 block mb-1.5 select-none">Sex / Gender</label>
              <div className="relative flex bg-[#11121d] border border-white/[0.05] rounded-xl p-1 w-full overflow-hidden select-none">
                {['male', 'female'].map((g) => {
                  const isSelected = deployGender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setDeployGender(g as any)}
                      className={`relative flex-1 py-3.5 text-xs font-black uppercase rounded-lg transition-colors duration-300 z-10 cursor-pointer ${
                        isSelected ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="deployGenderHighlight"
                          className="absolute inset-0 bg-blue-600 border border-blue-500 rounded-lg -z-10 shadow-lg shadow-blue-500/20"
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        />
                      )}
                      <span className="flex items-center justify-center gap-1.5">
                        {g === 'male' ? '♂️ Male' : '♀️ Female'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] font-black uppercase text-gray-500 block mb-1 select-none">Subscription length</label>
                <select
                  value={deployFormData.subscriptionPeriod}
                  onChange={e => setDeployFormData(prev => ({ ...prev, subscriptionPeriod: e.target.value }))}
                  className="w-full bg-[#11121d] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-bold"
                >
                  <option value="none">None / Free Trial</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="1 month">1 Month</option>
                  <option value="3 months">3 Months</option>
                  <option value="6 months">6 Months</option>
                  <option value="12 months">12 Months</option>
                </select>
              </div>
              <div>
                <label className="text-[8px] font-black uppercase text-gray-500 block mb-1 select-none">Start Delay (Days)</label>
                <input
                  type="number"
                  value={deployFormData.subscriptionStartDelay}
                  onChange={e => setDeployFormData(prev => ({ ...prev, subscriptionStartDelay: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-mono font-black"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Workout Splits configuration */}
        {deployStep === 2 && (
          <div className="space-y-4">
            <h4 className="text-[9px] font-black text-violet-400 uppercase tracking-widest select-none">Configure splits routines</h4>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar select-none">
              {deploySplits.map(split => {
                const isActive = deployActiveSplitKey === split.key;
                return (
                  <div key={split.key} className="bg-white/[0.01] border border-white/[0.04] rounded-2xl overflow-hidden shadow-inner">
                    <button
                      onClick={() => setDeployActiveSplitKey(isActive ? null : split.key)}
                      className="w-full p-3.5 flex justify-between items-center text-xs font-black text-white hover:bg-white/[0.02] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: split.color }} />
                        {split.label} Day ({split.exercises.length} exercises)
                      </span>
                      {isActive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {isActive && (
                      <div className="p-3.5 border-t border-white/[0.04] bg-[#090a12]/50 space-y-2.5 animate-fade-in">
                        {split.exercises.map((ex: any) => (
                          <div key={ex.id} className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/[0.02]">
                            <span className="text-[9.5px] text-gray-300 font-bold truncate max-w-[150px]">{ex.name}</span>
                            <span className="text-[8.5px] text-gray-500 font-mono font-bold">{ex.sets}x · {ex.rest}s</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Nutrition baseline targets */}
        {deployStep === 3 && (
          <div className="space-y-4">
            <h4 className="text-[9px] font-black text-amber-400 uppercase tracking-widest select-none">Nutrition baseline targets</h4>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <label className="text-[8px] font-black text-gray-500 block mb-1 uppercase tracking-wider select-none">Work Day kcal</label>
                <input type="number" value={deployKcal} onChange={e => setDeployKcal(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white text-center font-black outline-none" />
              </div>
              <div>
                <label className="text-[8px] font-black text-gray-500 block mb-1 uppercase tracking-wider select-none">Water Goal (Liters)</label>
                <input type="number" step="0.1" value={deployWaterGoalLiters} onChange={e => setDeployWaterGoalLiters(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white text-center font-black outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <div>
                <p className="text-[8px] text-gray-500 text-center mb-1 uppercase font-black tracking-wider select-none">Protein (g)</p>
                <input type="number" value={deployProtein} onChange={e => setDeployProtein(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[#0c0d16] border border-white/[0.05] rounded-xl p-2.5 text-xs text-white text-center font-black outline-none" />
              </div>
              <div>
                <p className="text-[8px] text-gray-500 text-center mb-1 uppercase font-black tracking-wider select-none">Carbs (g)</p>
                <input type="number" value={deployCarbs} onChange={e => setDeployCarbs(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[#0c0d16] border border-white/[0.05] rounded-xl p-2.5 text-xs text-white text-center font-black outline-none" />
              </div>
              <div>
                <p className="text-[8px] text-gray-500 text-center mb-1 uppercase font-black tracking-wider select-none">Fat (g)</p>
                <input type="number" value={deployFat} onChange={e => setDeployFat(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[#0c0d16] border border-white/[0.05] rounded-xl p-2.5 text-xs text-white text-center font-black outline-none" />
              </div>
            </div>

            <div className="border-t border-white/[0.04] pt-3 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={deployIsRestOverridden} onChange={e => setDeployIsRestOverridden(e.target.checked)} className="w-4 h-4 rounded border-gray-850 bg-[#0c0d16] text-blue-500 focus:ring-0 outline-none cursor-pointer" />
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Override Rest Day targets</span>
              </label>

              {deployIsRestOverridden && (
                <div className="space-y-3 animate-fade-in bg-white/[0.01] border border-white/[0.03] p-3 rounded-2xl font-mono">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black text-gray-500 block mb-1 uppercase tracking-wide">Rest Day kcal</label>
                      <input type="number" value={deployRestKcal} onChange={e => setDeployRestKcal(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[#0c0d16]/80 border border-white/[0.05] rounded-xl p-3 text-xs text-white text-center font-black outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[8px] text-gray-500 text-center mb-1 uppercase font-black tracking-wide">Protein (g)</p>
                      <input type="number" value={deployRestProtein} onChange={e => setDeployRestProtein(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-2.5 text-xs text-white text-center font-black outline-none" />
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-500 text-center mb-1 uppercase font-black tracking-wide">Carbs (g)</p>
                      <input type="number" value={deployRestCarbs} onChange={e => setDeployRestCarbs(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-2.5 text-xs text-white text-center font-black outline-none" />
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-500 text-center mb-1 uppercase font-black tracking-wide">Fat (g)</p>
                      <input type="number" value={deployRestFat} onChange={e => setDeployRestFat(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-2.5 text-xs text-white text-center font-black outline-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Biometrics initial setups */}
        {deployStep === 4 && (
          <div className="space-y-4 font-mono">
            <h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest select-none">Log Baseline Biometrics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] font-black text-gray-500 block mb-1 uppercase tracking-wide select-none">Weight (kg)</label>
                <input type="number" placeholder="e.g. 78.5" value={deployWeight} onChange={e => setDeployWeight(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 text-center font-black" />
              </div>
              <div>
                <label className="text-[8px] font-black text-gray-500 block mb-1 uppercase tracking-wide select-none">Body Fat %</label>
                <input type="number" placeholder="e.g. 15.2" value={deployBfPercent} onChange={e => setDeployBfPercent(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 text-center font-black" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] font-black text-gray-500 block mb-1 uppercase tracking-wide select-none">Muscle mass SMM (kg)</label>
                <input type="number" placeholder="e.g. 36.0" value={deploySmm} onChange={e => setDeploySmm(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 text-center font-black" />
              </div>
              <div>
                <label className="text-[8px] font-black text-gray-500 block mb-1 uppercase tracking-wide select-none">Fat mass BFM (kg)</label>
                <input type="number" disabled value={deployBfm} className="w-full bg-white/[0.01] border border-white/[0.03] rounded-xl p-3 text-xs text-gray-500 outline-none text-center font-black" />
              </div>
            </div>
          </div>
        )}

        {/* Wizard control buttons */}
        <div className="flex gap-3 pt-3 border-t border-white/[0.04] select-none">
          {deployStep > 1 && (
            <button
              onClick={() => setDeployStep(prev => (prev - 1) as any)}
              className="px-4.5 py-3.5 bg-[#0c0d16] border border-white/[0.05] hover:bg-gray-800 text-gray-300 font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={13} /> Back
            </button>
          )}
          
          <button
            disabled={deployLoading}
            onClick={() => {
              if (deployStep < 4) {
                setDeployStep(prev => (prev + 1) as any);
              } else {
                handleDeployAthlete();
              }
            }}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
          >
            {deployLoading ? 'Deploying...' : deployStep === 4 ? 'Deploy Athlete' : <><ArrowRight size={13} /> Continue</>}
          </button>
        </div>
      </div>
    );
  };

  // ─── VIEW 4: SETTINGS & OWNER CONSOLE ─────────────────────────
  const renderSettingsView = () => {
    const isOwner = coachUserId === OWNER_ID;
    const pendingRequests = systemCoaches.filter(c => c.targets?.pending_payment);

    return (
      <div className="space-y-4 pb-12">
        {/* WhatsApp Setup */}
        <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5 select-none">
            <Phone size={14} /> WhatsApp Link Config
          </h3>
          <p className="text-[9px] text-gray-500 font-bold leading-normal uppercase select-none">
            Establish the WhatsApp contact phone number athletes will tap to get direct coach communication.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. +201xxxxxxxxxx"
              value={ownWhatsAppNumber}
              onChange={e => setOwnWhatsAppNumber(e.target.value)}
              className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-mono font-black placeholder-gray-600"
            />
            <button
              onClick={handleSaveWhatsAppNumber}
              disabled={savingWhatsAppNumber}
              className="px-4.5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer shrink-0 shadow-md select-none"
            >
              {savingWhatsAppNumber ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Change Coach Account Password */}
        <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5 select-none">
            <Key size={14} /> Reset Coach Password
          </h3>
          <form onSubmit={handleUpdateOwnPassword} className="space-y-3 select-none">
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={ownNewPassword}
              onChange={e => setOwnNewPassword(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-bold placeholder-gray-600"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={ownConfirmPassword}
              onChange={e => setOwnConfirmPassword(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-bold placeholder-gray-600"
            />
            <button
              type="submit"
              disabled={updatingOwnPassword}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer shadow-md"
            >
              {updatingOwnPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Owner-only Payment Approvals */}
        {isOwner && (
          <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5 select-none">
              <DollarSign size={14} /> Pending License Approvals
            </h3>
            {pendingRequests.length === 0 ? (
              <p className="text-[9px] text-gray-500 italic text-center py-6 select-none font-bold">No pending payment verification requests</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(c => {
                  const p = c.targets.pending_payment;
                  return (
                    <div key={c.id} className="bg-white/[0.01] border border-white/[0.04] p-3.5 rounded-2xl space-y-2.5 shadow-inner">
                      <div className="flex justify-between items-center select-none">
                        <div>
                          <p className="text-xs font-black text-white">{c.display_name || c.email}</p>
                          <p className="text-[8px] text-gray-500 font-mono mt-0.5">{p.method} Transfer · {p.phone || p.username}</p>
                        </div>
                        <span className="text-[10px] font-mono font-black text-emerald-400">{p.amount}</span>
                      </div>
                      <div className="flex gap-2 select-none">
                        <button
                          onClick={() => handleApprovePayment(c.id, p.duration, p.amount)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer shadow-md"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = window.prompt('Enter rejection reason:');
                            if (reason) handleRejectPayment(c.id, reason);
                          }}
                          className="px-4 py-2.5 bg-red-955/40 hover:bg-red-900 border border-red-900/40 text-red-400 hover:text-white font-black text-[9px] uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Owner-only Coach Client Reassignments */}
        {isOwner && (
          <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-3 select-none">
            <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
              <Users size={14} /> Coach Client Reassignment
            </h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase leading-normal">
              Move assigned clients between coaches across the database.
            </p>
            <div className="space-y-3">
              {athletes.length === 0 ? (
                <p className="text-[9px] text-gray-500 italic text-center py-4 font-bold">No clients on system</p>
              ) : (
                athletes.map(client => {
                  const currentCoach = systemCoaches.find(c => c.id === client.coach_id);
                  return (
                    <div key={client.id} className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-2xl flex justify-between items-center gap-4">
                      <div>
                        <p className="text-[10px] font-black text-white">{client.display_name}</p>
                        <p className="text-[8px] text-gray-500 font-mono mt-0.5">
                          Coach: {currentCoach ? currentCoach.display_name : 'None / Owner'}
                        </p>
                      </div>
                      <select
                        onChange={e => handleReassignClient(client.id, e.target.value)}
                        defaultValue={client.coach_id || ''}
                        className="bg-[#11121d] border border-white/[0.05] rounded-xl p-2 text-[10px] text-white outline-none font-bold"
                      >
                        <option value="">Choose Coach...</option>
                        {systemCoaches.map(co => (
                          <option key={co.id} value={co.id}>
                            {co.display_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Owner-only SQL Console */}
        {isOwner && (
          <div className="bg-[#0c0d16]/75 border border-white/[0.05] backdrop-blur-sm rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5 select-none">
              <Database size={14} /> Database Console Query
            </h3>
            <p className="text-[9px] text-gray-500 font-bold leading-normal uppercase select-none">
              Execute raw Postgres SQL statements (DML/DDL) directly. Be extremely careful.
            </p>
            <div className="space-y-3 select-none">
              <textarea
                value={sqlQueryInput}
                onChange={e => setSqlQueryInput(e.target.value)}
                placeholder="SELECT * FROM profiles LIMIT 5;"
                rows={3}
                className="w-full bg-[#11121d] border border-white/[0.05] rounded-2xl p-3 text-xs text-white outline-none focus:border-red-500 font-mono font-bold placeholder-gray-700"
              />
              <button
                onClick={handleExecuteSQL}
                disabled={executingSql}
                className="w-full py-3.5 bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-400 hover:text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                {executingSql ? 'Executing query...' : <><Send size={12} /> Execute Query</>}
              </button>
            </div>

            {sqlQueryResult && (
              <div className="bg-black/60 border border-white/[0.04] p-3 rounded-2xl text-[10px] font-mono overflow-x-auto text-left shadow-inner max-h-[220px] no-scrollbar">
                {sqlQueryResult.error ? (
                  <span className="text-red-400 font-bold">SQL Error: {sqlQueryResult.error}</span>
                ) : (
                  <pre className="text-gray-300 font-mono leading-relaxed">
                    {JSON.stringify(sqlQueryResult.rows, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── MAIN APP RENDER ──────────────────────────────────────────
  return (
    <div className="p-4 flex flex-col gap-4 relative z-10 w-full pb-24" style={{ touchAction: 'pan-y' }}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Main Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.05] relative z-10 select-none">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer active:scale-95 shadow-inner">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Sparkles size={13} className="text-blue-400 animate-pulse" /> Coach Portal
            </h1>
            <p className="text-[9px] text-gray-500 font-black uppercase mt-0.5 tracking-wider">
              {currentView === 'home' ? 'Home Activity' : currentView === 'roster' ? (selectedUserId ? 'Client Dossier' : 'Athletes list') : currentView === 'deploy' ? 'Deployment' : 'Settings Dashboard'}
            </p>
          </div>
        </div>

        <button onClick={handleLogOut} className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 hover:text-red-400 border border-white/[0.04] hover:border-red-900/40 bg-white/[0.01] px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer uppercase shadow-md tracking-wider">
          <Lock size={10} /> Lock
        </button>
      </div>

      {/* View Switcher Routing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Dumbbell className="animate-spin text-blue-500" size={28} />
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest animate-pulse">Synchronizing cloud database...</p>
        </div>
      ) : (
        <>
          {/* Athlete Drill-down override in Roster View */}
          {currentView === 'roster' && selectedUserId ? (
            renderAthleteDetailView()
          ) : (
            <>
              {currentView === 'home' && renderHomeView()}
              {currentView === 'roster' && renderRosterView()}
              {currentView === 'deploy' && renderDeployView()}
              {currentView === 'settings' && renderSettingsView()}
            </>
          )}
        </>
      )}

      {/* Sticky Frosted Bottom Tab Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto p-3 bg-gradient-to-t from-[#05050b] to-transparent pointer-events-none z-50 select-none">
        <div className="bg-[#0c0d16]/80 border border-white/[0.06] backdrop-blur-md rounded-[24px] p-1 flex justify-between gap-1 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] pointer-events-auto">
          {([
            { id: 'home', label: 'Home', icon: <Flame size={15} /> },
            { id: 'roster', label: 'Roster', icon: <Users size={15} /> },
            { id: 'deploy', label: 'Deploy', icon: <UserPlus size={15} /> },
            { id: 'settings', label: 'Settings', icon: <Settings size={15} /> }
          ] as const).map(tab => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentView(tab.id);
                  if (tab.id === 'roster') {
                    setSelectedUserId('');
                  }
                }}
                className={`relative flex-1 py-3 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1 border border-transparent ${
                  isActive 
                    ? 'text-blue-400 font-black' 
                    : 'text-gray-500 hover:text-gray-300 active:scale-95'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavHighlight"
                    className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-2xl -z-10 shadow-inner"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{tab.icon}</span>
                <span className="text-[9px] tracking-wide font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal Gym Receipt Overlay */}
      {selectedReceiptWorkout && (
        <GymReceipt
          stats={selectedReceiptWorkout}
          onClose={() => setSelectedReceiptWorkout(null)}
        />
      )}
    </div>
  );
}
