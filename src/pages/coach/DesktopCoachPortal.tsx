import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  Users, UserPlus, Database, ShieldAlert, Activity, Search, 
  Trash2, Shield, ChevronRight, Scale, Ruler, Calendar, 
  Dumbbell, Save, UserCheck, Apple, CheckCircle, RefreshCw,
  ChevronLeft, Plus, X, Edit3, Droplets, Clock, Droplet, Flame, 
  ChevronDown, ChevronUp, FileText, Settings, Sparkles, LogOut,
  CreditCard, AlertTriangle
} from 'lucide-react';
import { Card } from '../../components/Card';
import { DumbbellLoader } from '../../components/DumbbellLoader';
import { SegmentalBodyMap } from '../../components/SegmentalBodyMap';
import { GymReceipt } from '../../components/GymReceipt';

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

const formatTimeLeft = (diffMs: number, showDetailed: boolean) => {
  if (diffMs <= 0) return '0 minutes';
  
  const totalSec = Math.floor(diffMs / 1000);
  const totalMin = Math.floor(totalSec / 60);
  const totalHours = Math.floor(totalMin / 60);
  const totalDays = Math.floor(totalHours / 24);
  
  const years = Math.floor(totalDays / 365);
  const remainingDaysAfterYears = totalDays % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;
  const hours = totalHours % 24;
  const minutes = totalMin % 60;
  
  if (showDetailed) {
    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    
    return parts.join(', ') || 'under a minute';
  } else {
    if (years > 0) {
      return `${years}y, ${months}m, ${days}d`;
    }
    if (months > 0) {
      return `${months}m, ${days}d`;
    }
    if (days > 0) {
      return `${days} days`;
    }
    if (hours > 0) {
      return `${hours} hours`;
    }
    return `${minutes} minutes`;
  }
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
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
    <div className="bg-[#121624] border border-gray-850 p-3.5 rounded-2xl flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{emoji} {label}</span>
        <span className="text-[10px] font-black" style={{ color }}>{pct}%</span>
      </div>
      <ProgressBar value={value} max={max} color={color} />
      <div className="flex justify-between text-[9px] text-gray-500 font-bold">
        <span style={{ color }}>{value.toFixed(unit === 'L' ? 1 : 0)}{unit}</span>
        <span>/ {max.toFixed(unit === 'L' ? 1 : 0)}{unit}</span>
      </div>
    </div>
  );
}

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

export default function DesktopCoachPortal() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'deploy' | 'management' | 'system' | 'subscriptions'>('overview');
  const [coachUserId, setCoachUserId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotCoach, setIsNotCoach] = useState(false);

  // Lists & DB Data
  const [profiles, setProfiles] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [dbHealthy, setDbHealthy] = useState<boolean>(true);

  // Live Feed
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [recentDiets, setRecentDiets] = useState<any[]>([]);
  const [refreshingFeed, setRefreshingFeed] = useState(false);

  // Selected Client (Clients Tab)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientProfile, setSelectedClientProfile] = useState<any | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [loadingClientDetails, setLoadingClientDetails] = useState(false);

  // Client sub-tabs layout
  const [clientActiveTab, setClientActiveTab] = useState<'overview' | 'diet' | 'water' | 'workouts' | 'inbody'>('overview');
  const [clientActiveDateStr, setClientActiveDateStr] = useState<string>(() => getLocalDateString());

  // Client daily data records (for selected date and client)
  const [clientDietLog, setClientDietLog] = useState<any>(null);
  const [clientMeals, setClientMeals] = useState<any[]>([]);
  const [clientWaterLogs, setClientWaterLogs] = useState<any[]>([]);
  const [clientWorkoutsList, setClientWorkoutsList] = useState<any[]>([]);
  const [clientScans, setClientScans] = useState<any[]>([]);
  const [clientWorkoutPlans, setClientWorkoutPlans] = useState<any[]>([]);
  const [exerciseDb, setExerciseDb] = useState<any[]>([]);

  // Exercise catalog search in training tab
  const [searchExerciseQuery, setSearchExerciseQuery] = useState('');
  const [activeSplitEditKey, setActiveSplitEditKey] = useState<string | null>(null);

  // Dialog/modal states
  const [selectedReceiptWorkout, setSelectedReceiptWorkout] = useState<any>(null);
  const [showAddScanForm, setShowAddScanForm] = useState(false);
  const [expandedScanId, setExpandedScanId] = useState<string | null>(null);

  const [newWaterAmount, setNewWaterAmount] = useState(500);

  // Preset/Form states
  const [newMealName, setNewMealName] = useState('');
  const [newMealKcal, setNewMealKcal] = useState(400);
  const [newMealProtein, setNewMealProtein] = useState(30);
  const [newMealCarbs, setNewMealCarbs] = useState(45);
  const [newMealFat, setNewMealFat] = useState(10);

  // InBody scan form states
  const [newScanDate, setNewScanDate] = useState(() => getLocalDateString());
  const [newScanWeight, setNewScanWeight] = useState('');
  const [newScanSmm, setNewScanSmm] = useState('');
  const [newScanBfPercent, setNewScanBfPercent] = useState('');
  const [newScanScore, setNewScanScore] = useState(75);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client target updates (Clients Tab)
  const [targetKcal, setTargetKcal] = useState(2400);
  const [targetProtein, setTargetProtein] = useState(160);
  const [targetCarbs, setTargetCarbs] = useState(240);
  const [targetFat, setTargetFat] = useState(70);
  const [targetWaterLiters, setTargetWaterLiters] = useState(3.5);
  const [savingTargets, setSavingTargets] = useState(false);
  const [unsavedChangesPendingAction, setUnsavedChangesPendingAction] = useState<{ type: 'sidebar' | 'subtab' | 'client', payload: any } | null>(null);

  // Day nutrition templates target map
  const [dayNutrition, setDayNutrition] = useState<Record<string, { kcal: number; protein: number; carbs: number; fat: number }>>({});
  const [editingDayType, setEditingDayType] = useState<string | null>(null);
  const [editDayKcal, setEditDayKcal] = useState(0);
  const [editDayProtein, setEditDayProtein] = useState(0);
  const [editDayCarbs, setEditDayCarbs] = useState(0);
  const [editDayFat, setEditDayFat] = useState(0);

  // Athlete Control Tab states
  const [managementSelectedClientId, setManagementSelectedClientId] = useState<string>('');
  const [managementClientProfile, setManagementClientProfile] = useState<any | null>(null);
  const [managementNewPassword, setManagementNewPassword] = useState('');
  const [managementUpdatingPassword, setManagementUpdatingPassword] = useState(false);
  const [managementUpdatingSuspension, setManagementUpdatingSuspension] = useState(false);
  const [managementUpdatingQuota, setManagementUpdatingQuota] = useState(false);
  const [managementUpdatingFeatures, setManagementUpdatingFeatures] = useState(false);
  const [managementAiQuotaInput, setManagementAiQuotaInput] = useState<number>(20);
  const [editSubscriptionPeriod, setEditSubscriptionPeriod] = useState('1 month');
  const [editSubscriptionDelay, setEditSubscriptionDelay] = useState('0');
  const [editCustomSubscriptionEnd, setEditCustomSubscriptionEnd] = useState(getLocalDateTimeString());
  const [showDetailedSubscriptionTime, setShowDetailedSubscriptionTime] = useState(false);
  const [updatingSubscriptionState, setUpdatingSubscriptionState] = useState(false);

  // Subscriptions Tab Reactivation Modal state
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
  const [reactivateClientId, setReactivateClientId] = useState<string | null>(null);
  const [reactivateClientName, setReactivateClientName] = useState('');
  const [reactivatePeriod, setReactivatePeriod] = useState('1 month');
  const [reactivateDelay, setReactivateDelay] = useState('0');
  const [reactivateCustomEnd, setReactivateCustomEnd] = useState(getLocalDateTimeString());
  const [reactivateSaving, setReactivateSaving] = useState(false);

  // Search queries
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Coach portal login suspension check
  const [isCoachSuspended, setIsCoachSuspended] = useState(false);

  // System Tab - Coach Management refactored states
  const [systemSelectedCoachId, setSystemSelectedCoachId] = useState<string | null>(null);
  const [coachSearchQuery, setCoachSearchQuery] = useState('');
  const [reassignCoachTargetId, setReassignCoachTargetId] = useState<Record<string, string>>({});
  const [updatingCoachStatus, setUpdatingCoachStatus] = useState(false);
  const [isRegisteringNewCoach, setIsRegisteringNewCoach] = useState(false);
  const [newCoachName, setNewCoachName] = useState('');
  const [newCoachEmail, setNewCoachEmail] = useState('');
  const [newCoachPassword, setNewCoachPassword] = useState('');
  const [isCreatingNewCoach, setIsCreatingNewCoach] = useState(false);
  const [createdNewCoachCredentials, setCreatedNewCoachCredentials] = useState<any | null>(null);

  // Deploy Athlete Multi-step Wizard
  const [deployStep, setDeployStep] = useState(1);
  const [deployLoading, setDeployLoading] = useState(false);
  const [deploySuccessData, setDeploySuccessData] = useState<any | null>(null);
  const [formData, setFormData] = useState({
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
  const [deployGender, setDeployGender] = useState<'male' | 'female'>('male');
  
  // Deploy Wizard Split template state
  const [deploySplits, setDeploySplits] = useState<any[]>([
    { 
      key: 'PUSH', 
      label: 'Push', 
      emoji: '🔴',
      color: '#ef4444', 
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
      emoji: '🔵',
      color: '#3b82f6', 
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
      emoji: '🟡',
      color: '#eab308', 
      exercises: [
        { id: 'dp-legs-0', name: 'Leg Press (feet high for glutes)', muscle_group: 'Glutes', sets: 3, rest: 120 },
        { id: 'dp-legs-1', name: 'DB Romanian Deadlift', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'dp-legs-2', name: 'DB Bulgarian Split Squat', muscle_group: 'Quads', sets: 3, rest: 120 },
        { id: 'dp-legs-3', name: 'Seated Leg Curl', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'dp-legs-4', name: '45° Back Extension (BW/DB)', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'dp-legs-5', name: 'Standing Calf Raise', muscle_group: 'Calves', sets: 3, rest: 120 }
      ]
    }
  ]);
  const [newDeploySplitName, setNewDeploySplitName] = useState('');
  const [deployActiveSplitKey, setDeployActiveSplitKey] = useState<string | null>(null);

  // Deploy Nutrition inputs
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

  // Deploy Biometrics inputs
  const [deployWeight, setDeployWeight] = useState('');
  const [deployBfPercent, setDeployBfPercent] = useState('');
  const [deploySmm, setDeploySmm] = useState('');
  const [deployBfm, setDeployBfm] = useState('');
  const [deployInbodyScore, setDeployInbodyScore] = useState(75);
  const [deployCsvScans, setDeployCsvScans] = useState<any[]>([]);



  // Day-type auto rest updates inside Deploy Athlete Form
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

  // Recalculate fat mass inside Deploy Athlete Form
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
  }, [deployWeight, deployBfPercent]);

  // Enforce security block on system tab for standard coaches
  useEffect(() => {
    if (activeTab === 'system' && coachUserId && coachUserId !== OWNER_ID) {
      setActiveTab('overview');
    }
  }, [activeTab, coachUserId]);

  const handleHardReload = async () => {
    toast.loading('Checking for updates & clearing cache...');
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      } catch (e) {
        console.error(e);
      }
    }
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      } catch (e) {
        console.error(e);
      }
    }
    window.location.reload();
  };

  // ─── INITIAL BOOTSTRAP & PERIODIC SYNC ─────────────────────
  useEffect(() => {
    fetchBaseData();

    // Poll base data every 10 seconds to ensure client counts and quota indicators refresh dynamically
    const interval = setInterval(() => {
      fetchBaseData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchBaseData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!silent) setLoading(false);
        return;
      }
      setCoachUserId(session.user.id);
      setSessionToken(session.access_token);

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('role, targets')
        .eq('id', session.user.id)
        .maybeSingle();

      if (myProfile?.role !== 'coach' && session.user.id !== OWNER_ID) {
        setIsNotCoach(true);
        if (!silent) setLoading(false);
        return;
      }

      // Check if coach is suspended (Owner cannot be suspended)
      if (session.user.id !== OWNER_ID && myProfile?.targets?.is_deactivated === true) {
        setIsCoachSuspended(true);
        if (!silent) setLoading(false);
        return;
      }

      const isOwner = session.user.id === OWNER_ID;

      // Fetch profiles
      let profilesQuery = supabase.from('profiles').select('*').order('display_name');
      if (!isOwner) {
        profilesQuery = profilesQuery.eq('coach_id', session.user.id);
      }
      const { data: userProfiles } = await profilesQuery;
      if (userProfiles) {
        setProfiles(userProfiles);
        setClientsList(userProfiles.filter(p => p.role === 'client'));
      }

      // Fetch exercises database catalog
      const { data: exercises } = await supabase.from('exercises').select('*').order('name');
      if (exercises) {
        setExerciseDb(exercises);
      }

      // Fetch feed data
      await fetchFeedData();

      setDbHealthy(true);
    } catch (err) {
      console.error(err);
      setDbHealthy(false);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchFeedData = async () => {
    try {
      setRefreshingFeed(true);
      
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('id, user_id, date, day_type, total_volume')
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .limit(10);

      const { data: dietLogsData } = await supabase
        .from('diet_logs')
        .select('id, user_id, date, daily_totals')
        .order('date', { ascending: false })
        .limit(10);

      const feedUserIds = Array.from(new Set([
        ...(workoutsData || []).map(w => w.user_id),
        ...(dietLogsData || []).map(d => d.user_id)
      ]));

      const feedProfilesMap: Record<string, string> = {};
      if (feedUserIds.length > 0) {
        const { data: feedProfiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', feedUserIds);
        
        if (feedProfiles) {
          feedProfiles.forEach(p => {
            feedProfilesMap[p.id] = p.display_name || 'Athlete';
          });
        }
      }

      const stitchedWorkouts = (workoutsData || []).map(w => ({
        ...w,
        profiles: { display_name: feedProfilesMap[w.user_id] || 'Athlete' }
      }));

      const stitchedDiets = (dietLogsData || []).map(d => ({
        ...d,
        profiles: { display_name: feedProfilesMap[d.user_id] || 'Athlete' }
      }));

      setRecentWorkouts(stitchedWorkouts);
      setRecentDiets(stitchedDiets);
    } catch (err) {
      console.error('Error fetching live activity feed:', err);
    } finally {
      setRefreshingFeed(false);
    }
  };

  // ─── UNSAVED CHANGES NAVIGATION GUARD ───────────────────────
  const clientTargets = selectedClientProfile?.user?.targets || {};
  const hasUnsavedChanges = selectedClientId !== null && activeTab === 'clients' && (
    targetKcal !== (clientTargets.kcal || 2400) ||
    targetProtein !== (clientTargets.protein || 160) ||
    targetCarbs !== (clientTargets.carbs || 240) ||
    targetFat !== (clientTargets.fat || 70) ||
    targetWaterLiters !== ((clientTargets.water_goal_ml || 3500) / 1000)
  );

  const resetTargetsToDb = () => {
    if (!selectedClientProfile) return;
    const targets = selectedClientProfile.user?.targets || {};
    setTargetKcal(targets.kcal || 2400);
    setTargetProtein(targets.protein || 160);
    setTargetCarbs(targets.carbs || 240);
    setTargetFat(targets.fat || 70);
    setTargetWaterLiters((targets.water_goal_ml || 3500) / 1000);
  };

  const executePendingAction = (action: { type: 'sidebar' | 'subtab' | 'client', payload: any }) => {
    if (action.type === 'sidebar') {
      setActiveTab(action.payload);
    } else if (action.type === 'subtab') {
      setClientActiveTab(action.payload);
    } else if (action.type === 'client') {
      fetchClientDetails(action.payload, true);
    }
  };

  const handleSidebarTabClick = (newTab: 'overview' | 'clients' | 'deploy' | 'management' | 'system' | 'subscriptions') => {
    if (hasUnsavedChanges) {
      setUnsavedChangesPendingAction({ type: 'sidebar', payload: newTab });
    } else {
      setActiveTab(newTab);
    }
  };

  const handleClientSubTabClick = (newSubTab: 'overview' | 'diet' | 'water' | 'workouts' | 'inbody') => {
    if (hasUnsavedChanges) {
      setUnsavedChangesPendingAction({ type: 'subtab', payload: newSubTab });
    } else {
      setClientActiveTab(newSubTab);
    }
  };

  const handleClientSelectClick = (newClientId: string) => {
    if (hasUnsavedChanges) {
      setUnsavedChangesPendingAction({ type: 'client', payload: newClientId });
    } else {
      fetchClientDetails(newClientId, true);
    }
  };

  // ─── FETCH CLIENT DETAILS ──────────────────────────────────
  const fetchClientDetails = async (clientId: string, forceReset = false) => {
    try {
      setLoadingClientDetails(true);
      setSelectedClientId(clientId);

      // Fetch client profiles
      const { data: clientProfile, error: cpError } = await supabase
        .from('client_profiles')
        .select(`
          *,
          user:profiles!client_profiles_user_id_fkey(id, username, email, display_name, targets, created_at)
        `)
        .eq('user_id', clientId)
        .maybeSingle();

      if (cpError || !clientProfile) {
        console.error(cpError);
        toast.error('Could not retrieve detailed client file.');
        setLoadingClientDetails(false);
        return;
      }

      setSelectedClientProfile(clientProfile);

      // Set initial macro states only if we are forced to reset, or if the user doesn't have unsaved changes
      const targets = clientProfile.user?.targets || {};
      const dbKcal = targets.kcal || 2400;
      const dbProtein = targets.protein || 160;
      const dbCarbs = targets.carbs || 240;
      const dbFat = targets.fat || 70;
      const dbWater = (targets.water_goal_ml || 3500) / 1000;

      if (forceReset || (
        targetKcal === (selectedClientProfile?.user?.targets?.kcal || 2400) &&
        targetProtein === (selectedClientProfile?.user?.targets?.protein || 160) &&
        targetCarbs === (selectedClientProfile?.user?.targets?.carbs || 240) &&
        targetFat === (selectedClientProfile?.user?.targets?.fat || 70) &&
        targetWaterLiters === ((selectedClientProfile?.user?.targets?.water_goal_ml || 3500) / 1000)
      )) {
        setTargetKcal(dbKcal);
        setTargetProtein(dbProtein);
        setTargetCarbs(dbCarbs);
        setTargetFat(dbFat);
        setTargetWaterLiters(dbWater);
      }
      setDayNutrition(targets.day_nutrition || {});

    } catch (err) {
      console.error(err);
      toast.error('Failed to load client profile details.');
    } finally {
      setLoadingClientDetails(false);
    }
  };

  // ─── FETCH CLIENT RECORDS (Realtime/Date synced logs) ───────
  const fetchClientData = async (userId: string, dateStr: string, silent = false) => {
    if (!userId) return;
    if (!silent) setLoadingClientDetails(true);
    try {
      // 1. Diet log & meals
      const { data: dLog } = await supabase.from('diet_logs').select('*').eq('user_id', userId).eq('date', dateStr).maybeSingle();
      setClientDietLog(dLog || null);

      if (dLog) {
        const { data: dMeals } = await supabase.from('diet_meals').select('*').eq('diet_log_id', dLog.id).order('created_at', { ascending: true });
        setClientMeals(dMeals || []);
      } else {
        setClientMeals([]);
      }

      // 2. Water logs
      const { data: wLogs } = await supabase.from('water_logs').select('*').eq('user_id', userId).eq('date', dateStr).order('time', { ascending: true });
      setClientWaterLogs(wLogs || []);

      // 3. Workouts logged
      const { data: wList } = await supabase.from('workouts').select('*').eq('user_id', userId).eq('date', dateStr);
      setClientWorkoutsList(wList || []);

      // 4. InBody scans history
      const { data: inbodyScans } = await supabase.from('inbody_scans').select('*').eq('user_id', userId).order('date', { ascending: false });
      setClientScans(inbodyScans || []);

      if (inbodyScans && inbodyScans.length > 0) {
        setLatestWeight(inbodyScans[0].weight);
      } else {
        setLatestWeight(null);
      }

      // 5. Workout Splits Templates
      const { data: plansData } = await supabase
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      setClientWorkoutPlans(plansData || []);

    } catch (err) {
      console.error(err);
      toast.error('Unable to sync active client database logs.');
    } finally {
      if (!silent) setLoadingClientDetails(false);
    }
  };

  // Fetch client logs when date changes or client selection is active
  useEffect(() => {
    if (selectedClientId) {
      fetchClientData(selectedClientId, clientActiveDateStr);
    }
  }, [selectedClientId, clientActiveDateStr]);

  // Real-time synchronization subscription for active client logs
  useEffect(() => {
    if (!selectedClientId || !clientActiveDateStr) return;

    const channel = supabase
      .channel(`desktop-coach-realtime-${selectedClientId}-${clientActiveDateStr}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'water_logs', filter: `user_id=eq.${selectedClientId}` }, () => {
        fetchClientData(selectedClientId, clientActiveDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diet_meals' }, () => {
        fetchClientData(selectedClientId, clientActiveDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diet_logs', filter: `user_id=eq.${selectedClientId}` }, () => {
        fetchClientData(selectedClientId, clientActiveDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts', filter: `user_id=eq.${selectedClientId}` }, () => {
        fetchClientData(selectedClientId, clientActiveDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbody_scans', filter: `user_id=eq.${selectedClientId}` }, () => {
        fetchClientData(selectedClientId, clientActiveDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${selectedClientId}` }, () => {
        fetchClientDetails(selectedClientId, false);
        fetchClientData(selectedClientId, clientActiveDateStr, true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_workout_plans', filter: `user_id=eq.${selectedClientId}` }, () => {
        fetchClientData(selectedClientId, clientActiveDateStr, true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClientId, clientActiveDateStr]);

  // Real-time listener for profiles (system-wide and management)
  useEffect(() => {
    const channel = supabase
      .channel('coach-global-profiles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload: any) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          // Update profiles list
          setProfiles(prev => {
            const index = prev.findIndex(p => p.id === payload.new.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = payload.new;
              return updated;
            } else {
              return [...prev, payload.new];
            }
          });
          // Update management selected client details if updated profile matches
          if (payload.new.id === managementSelectedClientId) {
            setManagementClientProfile((prev: any) => {
              if (!prev) return null;
              return {
                ...prev,
                user: payload.new
              };
            });
          }
          // Update clientsList if it matches
          setClientsList(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [managementSelectedClientId]);

  // ─── SAVE TARGETS ──────────────────────────────────────────
  const handleSaveTargets = async () => {
    if (!selectedClientId || !selectedClientProfile) return;
    setSavingTargets(true);
    try {
      const currentTargets = selectedClientProfile.user?.targets || {};
      const updatedTargets = {
        ...currentTargets,
        kcal: targetKcal,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
        water_goal_ml: Math.round(targetWaterLiters * 1000)
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', selectedClientId);

      if (error) throw error;
      toast.success('Macros and hydration goals updated successfully!');
      
      setSelectedClientProfile((prev: any) => ({
        ...prev,
        user: {
          ...prev.user,
          targets: updatedTargets
        }
      }));
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save updated goals: ' + err.message);
    } finally {
      setSavingTargets(false);
    }
  };

  // ─── SAVE DAY-TYPE TARGET NUTRITION ────────────────────────
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
      const currentTargets = selectedClientProfile?.user?.targets || {};
      const updatedTargets = { ...currentTargets, day_nutrition: updDN };

      const { error } = await supabase.from('profiles').update({ targets: updatedTargets }).eq('id', selectedClientId!);
      if (error) throw error;
      setDayNutrition(updDN);
      setSelectedClientProfile((prev: any) => ({
        ...prev,
        user: { ...prev.user, targets: updatedTargets }
      }));
      setEditingDayType(null);
      toast.success(`${editingDayType} day macros saved!`);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update targets. Please try again.');
    }
  };

  // ─── DIET LOGGER OPERATIONS ────────────────────────────────
  const handleAddMealLog = async () => {
    if (!newMealName.trim() || !selectedClientId) { toast.error('Enter a meal name'); return; }
    try {
      let logId = clientDietLog?.id;
      if (!logId) {
        const { data: newLog, error: le } = await supabase.from('diet_logs').insert({
          user_id: selectedClientId, date: clientActiveDateStr,
          daily_totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0, completed: false }
        }).select().single();
        if (le) throw le;
        logId = newLog.id;
        setClientDietLog(newLog);
      }
      const item = { id: `ci-${Date.now()}`, food_id: 'custom', name: newMealName, grams: 100, macros: { kcal: newMealKcal, protein: newMealProtein, carbs: newMealCarbs, fat: newMealFat } };
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
      const { data: nm, error: me } = await supabase.from('diet_meals').insert({
        diet_log_id: logId, name: newMealName,
        time: timeStr,
        items: [item]
      }).select().single();
      if (me) throw me;

      const allMeals = [...clientMeals, nm];
      const totals = allMeals.reduce((t, m) => {
        m.items?.forEach((i: any) => { t.kcal += i.macros.kcal || 0; t.protein += i.macros.protein || 0; t.carbs += i.macros.carbs || 0; t.fat += i.macros.fat || 0; });
        return t;
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0, water: clientDietLog?.daily_totals?.water || 0, completed: false });
      await supabase.from('diet_logs').update({ daily_totals: totals }).eq('id', logId);

      toast.success('Meal logged for athlete!');
      setNewMealName('');
      fetchClientData(selectedClientId, clientActiveDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to log meal. Please try again.');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase.from('diet_meals').delete().eq('id', mealId);
      if (error) throw error;
      const remaining = clientMeals.filter(m => m.id !== mealId);
      const totals = remaining.reduce((t, m) => {
        m.items?.forEach((i: any) => { t.kcal += i.macros.kcal || 0; t.protein += i.macros.protein || 0; t.carbs += i.macros.carbs || 0; t.fat += i.macros.fat || 0; });
        return t;
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0, water: clientDietLog?.daily_totals?.water || 0, completed: false });
      if (clientDietLog) await supabase.from('diet_logs').update({ daily_totals: totals }).eq('id', clientDietLog.id);
      toast.success('Meal deleted');
      fetchClientData(selectedClientId!, clientActiveDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to remove meal. Please try again.');
    }
  };

  // ─── WATER LOGGER OPERATIONS ───────────────────────────────
  const handleAddWater = async (amountOverride?: number) => {
    if (!selectedClientId) return;
    const amount = amountOverride !== undefined ? amountOverride : newWaterAmount;
    try {
      const now = new Date();
      const { error } = await supabase.from('water_logs').insert({
        user_id: selectedClientId,
        date: clientActiveDateStr,
        time: now.toISOString(),
        amount_ml: amount
      });
      if (error) throw error;
      toast.success(`${amount}ml logged!`);
      fetchClientData(selectedClientId, clientActiveDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to log water intake.');
    }
  };

  const handleDeleteWater = async (id: string) => {
    const { error } = await supabase.from('water_logs').delete().eq('id', id);
    if (error) {
      toast.error('Unable to remove water log.');
      return;
    }
    toast.success('Entry removed');
    fetchClientData(selectedClientId!, clientActiveDateStr, true);
  };

  const handleClearWater = async () => {
    if (!selectedClientId) return;
    try {
      const { error } = await supabase.from('water_logs').delete().eq('user_id', selectedClientId).eq('date', clientActiveDateStr);
      if (error) throw error;
      toast.success('Water logs cleared');
      fetchClientData(selectedClientId!, clientActiveDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to clear water logs.');
    }
  };

  // ─── INBODY SCAN OPERATIONS ────────────────────────────────
  const handleAddInBodyScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(newScanWeight);
    if (isNaN(wt) || wt <= 0 || !selectedClientId) { toast.error('Enter valid weight'); return; }
    try {
      const bfVal = parseFloat(newScanBfPercent) || 0;
      const smmVal = parseFloat(newScanSmm) || 0;
      const { error } = await supabase.from('inbody_scans').insert({
        user_id: selectedClientId, date: newScanDate, weight: wt, smm: smmVal,
        bfm: parseFloat(((wt * bfVal) / 100).toFixed(1)), bf_percent: bfVal,
        bmr: Math.round(10 * wt + 6.25 * 175 - 5 * 25 + 5), score: newScanScore,
        segmental: { visceralFat: 6, tbw: Math.round(wt * 0.6), protein: Math.round(wt * 0.18), minerals: Math.round(wt * 0.05), raLean: Math.round(wt * 0.05), laLean: Math.round(wt * 0.05), trunkLean: Math.round(wt * 0.28), rlLean: Math.round(wt * 0.12), llLean: Math.round(wt * 0.12) }
      });
      if (error) throw error;
      toast.success('Scan logged!');
      setNewScanWeight(''); setNewScanSmm(''); setNewScanBfPercent(''); setShowAddScanForm(false);
      fetchClientData(selectedClientId, clientActiveDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to save biometrics record.');
    }
  };

  const handleDeleteScan = async (id: string) => {
    if (!window.confirm('Delete this scan?')) return;
    const { error } = await supabase.from('inbody_scans').delete().eq('id', id);
    if (error) {
      toast.error('Unable to delete scan.');
      return;
    }
    toast.success('Scan deleted');
    fetchClientData(selectedClientId!, clientActiveDateStr, true);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedClientId) return;

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
          visceralFat: getValue('visceral fat level') || 6,
          tbw: getValue('total body water') || Math.round(getValue('weight(kg)') * 0.6) || 40,
          protein: getValue('protein') || Math.round(getValue('weight(kg)') * 0.18) || 12,
          minerals: getValue('mineral') || Math.round(getValue('weight(kg)') * 0.05) || 4,
          raLean: getValue('right arm lean') || 3.2,
          laLean: getValue('left arm lean') || 3.2,
          trunkLean: getValue('trunk lean') || 22,
          rlLean: getValue('right leg lean') || 8.5,
          llLean: getValue('left leg lean') || 8.5,
        };

        payloads.push({
          user_id: selectedClientId,
          date: dateStr,
          weight: getValue('weight(kg)') || getValue('weight') || 0,
          smm: getValue('skeletal muscle mass') || getValue('smm') || 0,
          bfm: getValue('body fat mass') || getValue('bfm') || 0,
          bf_percent: getValue('percent body fat') || getValue('bf_percent') || 0,
          bmr: getValue('basal metabolic rate') || getValue('bmr') || 1600,
          score: getValue('inbody score') || getValue('score') || 75,
          segmental: segmental
        });
      }

      if (payloads.length > 0) {
        const { error } = await supabase.from('inbody_scans').insert(payloads);
        if (error) {
          toast.error('Error during bulk upload: ' + error.message);
        } else {
          toast.success(`Successfully imported ${payloads.length} scans!`);
          fetchClientData(selectedClientId, clientActiveDateStr, true);
        }
      } else {
        toast.error('No valid data found in CSV.');
      }

      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // ─── SPLIT TEMPLATE BUILDER OPERATIONS ────────────────────
  const handleUpdateExerciseStats = async (planType: string, exId: string, sets: number, rest: number) => {
    try {
      const plan = clientWorkoutPlans.find(p => p.plan_type === planType);
      if (!plan) return;
      const upd = plan.exercises.map((e: any) => {
        if (e.id === exId) {
          return { ...e, sets: Math.max(1, sets), rest: Math.max(0, rest) };
        }
        return e;
      });
      const { error } = await supabase.from('user_workout_plans').update({ exercises: upd }).eq('id', plan.id);
      if (error) throw error;
      setClientWorkoutPlans(prev => prev.map(p => p.plan_type === planType ? { ...p, exercises: upd } : p));
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update exercise split template.');
    }
  };

  const handleAddExerciseToSplit = async (planType: string, exercise: any) => {
    try {
      const plan = clientWorkoutPlans.find(p => p.plan_type === planType);
      const exs = plan ? [...plan.exercises] : [];
      if (exs.some((e: any) => e.name === exercise.name)) { toast.error('Already in split'); return; }
      exs.push({ id: exercise.id || `ce-${Date.now()}`, name: exercise.name, muscle_group: exercise.muscle_group || '', sets: 3, rest: 120 });

      const { error } = await supabase.from('user_workout_plans').upsert(
        { user_id: selectedClientId, plan_type: planType, exercises: exs },
        { onConflict: 'user_id,plan_type' }
      );
      if (error) throw error;
      toast.success(`Added to ${planType}`);
      setSearchExerciseQuery('');
      fetchClientData(selectedClientId!, clientActiveDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to add exercise.');
    }
  };

  const handleRemoveExerciseFromSplit = async (planType: string, exId: string) => {
    try {
      const plan = clientWorkoutPlans.find(p => p.plan_type === planType);
      if (!plan) return;
      const upd = plan.exercises.filter((e: any) => e.id !== exId);
      const { error } = await supabase.from('user_workout_plans').update({ exercises: upd }).eq('id', plan.id);
      if (error) throw error;
      toast.success('Exercise removed');
      fetchClientData(selectedClientId!, clientActiveDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to remove exercise.');
    }
  };

  const handleCreateSplitDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newDeploySplitName.trim().toUpperCase();
    if (!name || !selectedClientId) return;
    if (clientWorkoutPlans.some(p => p.plan_type === name)) { toast.error('Already exists'); return; }
    try {
      const { error } = await supabase.from('user_workout_plans').insert({ user_id: selectedClientId, plan_type: name, exercises: [] });
      if (error) throw error;
      toast.success(`${name} day created!`);
      setNewDeploySplitName('');
      fetchClientData(selectedClientId, clientActiveDateStr, true);
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
    fetchClientData(selectedClientId!, clientActiveDateStr, true);
  };

  const handleRenameSplitDay = async (plan: any) => {
    const newName = window.prompt(`Rename "${plan.plan_type}" to:`, plan.plan_type)?.trim().toUpperCase();
    if (!newName || newName === plan.plan_type) return;
    try {
      if (clientWorkoutPlans.some(p => p.plan_type === newName && p.id !== plan.id)) {
        toast.error('A split day with that name already exists');
        return;
      }
      const { error } = await supabase.from('user_workout_plans').update({ plan_type: newName }).eq('id', plan.id);
      if (error) throw error;
      toast.success(`Renamed to ${newName}!`);
      fetchClientData(selectedClientId!, clientActiveDateStr, true);
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to rename split day.');
    }
  };

  // ─── ATHLETE CONTROL TAB ACTIONS ───────────────────────────
  useEffect(() => {
    if (managementSelectedClientId) {
      fetchManagementClientDetails(managementSelectedClientId);
    } else {
      setManagementClientProfile(null);
    }
  }, [managementSelectedClientId]);

  useEffect(() => {
    if (clientsList.length > 0 && !managementSelectedClientId) {
      setManagementSelectedClientId(clientsList[0].id);
    }
  }, [clientsList]);

  const fetchManagementClientDetails = async (clientId: string) => {
    try {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select(`
          *,
          user:profiles!client_profiles_user_id_fkey(id, username, email, display_name, targets, created_at)
        `)
        .eq('user_id', clientId)
        .maybeSingle();

      if (clientProfile) {
        setManagementClientProfile(clientProfile);
        setManagementAiQuotaInput(clientProfile.user?.targets?.ai_quota_limit ?? 20);
        setEditSubscriptionPeriod(clientProfile.user?.targets?.subscription_duration ?? '1 month');
        setEditSubscriptionDelay(String(clientProfile.user?.targets?.subscription_delay_days ?? '0'));
        if (clientProfile.user?.targets?.subscription_end_date) {
          setEditCustomSubscriptionEnd(getLocalDateTimeString(new Date(clientProfile.user.targets.subscription_end_date)));
        } else {
          setEditCustomSubscriptionEnd(getLocalDateTimeString());
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load client management file.');
    }
  };

  const handleToggleManagementSuspension = async () => {
    if (!managementSelectedClientId || !managementClientProfile) return;
    const isSuspended = managementClientProfile.user?.targets?.is_deactivated === true;
    const msg = isSuspended ? 'Reactivate athlete access?' : 'Suspend athlete access immediately?';
    if (!window.confirm(msg)) return;

    setManagementUpdatingSuspension(true);
    try {
      const currentTargets = managementClientProfile.user?.targets || {};
      const updatedTargets = { ...currentTargets, is_deactivated: !isSuspended };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', managementSelectedClientId);

      if (error) throw error;
      toast.success(isSuspended ? 'Athlete reactivated!' : 'Athlete account suspended.');
      setManagementClientProfile((prev: any) => ({
        ...prev,
        user: { ...prev.user, targets: updatedTargets }
      }));
      fetchBaseData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update suspension status.');
    } finally {
      setManagementUpdatingSuspension(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!managementSelectedClientId || !managementClientProfile) return;
    setUpdatingSubscriptionState(true);
    try {
      let subscription_start_date = null;
      let subscription_end_date = null;
      const period = editSubscriptionPeriod;
      const delayDays = parseInt(editSubscriptionDelay) || 0;

      if (period && period !== 'none') {
        const now = new Date();
        const startDateObj = new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000);
        subscription_start_date = startDateObj.toISOString();

        if (period === 'custom') {
          if (editCustomSubscriptionEnd) {
            subscription_end_date = new Date(editCustomSubscriptionEnd).toISOString();
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
          else if (period === '2 years') durationMs = 730 * 24 * 60 * 60 * 1000;

          const endDateObj = new Date(startDateObj.getTime() + durationMs);
          subscription_end_date = endDateObj.toISOString();
        }
      }

      const currentTargets = managementClientProfile.user?.targets || {};
      
      // Calculate is_deactivated state dynamically
      let isDeactivated = false;
      if (subscription_start_date && subscription_end_date) {
        const nowObj = new Date();
        const startObj = new Date(subscription_start_date);
        const endObj = new Date(subscription_end_date);
        if (nowObj < startObj || nowObj >= endObj) {
          isDeactivated = true;
        }
      }

      const updatedTargets = {
        ...currentTargets,
        subscription_duration: period,
        subscription_delay_days: delayDays,
        subscription_start_date,
        subscription_end_date,
        is_deactivated: isDeactivated
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', managementSelectedClientId);

      if (error) throw error;
      toast.success('Subscription updated successfully!');
      
      setManagementClientProfile((prev: any) => ({
        ...prev,
        user: { ...prev.user, targets: updatedTargets }
      }));
      
      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update subscription: ' + err.message);
    } finally {
      setUpdatingSubscriptionState(false);
    }
  };

  const handleSaveReactivation = async () => {
    if (!reactivateClientId) return;
    setReactivateSaving(true);
    try {
      let subscription_start_date = null;
      let subscription_end_date = null;
      const period = reactivatePeriod;
      const delayDays = parseInt(reactivateDelay) || 0;

      if (period && period !== 'none') {
        const now = new Date();
        const startDateObj = new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000);
        subscription_start_date = startDateObj.toISOString();

        if (period === 'custom') {
          if (reactivateCustomEnd) {
            subscription_end_date = new Date(reactivateCustomEnd).toISOString();
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
          else if (period === '2 years') durationMs = 730 * 24 * 60 * 60 * 1000;

          const endDateObj = new Date(startDateObj.getTime() + durationMs);
          subscription_end_date = endDateObj.toISOString();
        }
      }

      // Fetch current profile targets first
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('targets')
        .eq('id', reactivateClientId)
        .maybeSingle();

      const currentTargets = targetProfile?.targets || {};
      
      // Calculate is_deactivated state dynamically
      let isDeactivated = false;
      if (subscription_start_date && subscription_end_date) {
        const nowObj = new Date();
        const startObj = new Date(subscription_start_date);
        const endObj = new Date(subscription_end_date);
        if (nowObj < startObj || nowObj >= endObj) {
          isDeactivated = true;
        }
      }

      const updatedTargets = {
        ...currentTargets,
        subscription_duration: period,
        subscription_delay_days: delayDays,
        subscription_start_date,
        subscription_end_date,
        is_deactivated: isDeactivated
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', reactivateClientId)
        .select();

      if (error) throw error;
      toast.success(`${reactivateClientName} subscription reactivated!`);
      setReactivateModalOpen(false);
      
      // If the reactivated athlete is the currently selected management client, reload the profile
      if (managementSelectedClientId === reactivateClientId) {
        fetchManagementClientDetails(reactivateClientId);
      }
      
      // Refresh the client lists
      fetchBaseData(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to reactivate subscription.');
    } finally {
      setReactivateSaving(false);
    }
  };

  const handleUpdateManagementPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managementSelectedClientId || !managementNewPassword.trim()) return;
    if (managementNewPassword.length < 6) {
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
        body: JSON.stringify({ uid: managementSelectedClientId, password: managementNewPassword.trim() })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error');
      }
      await supabase
        .from('client_profiles')
        .update({ generated_passcode: managementNewPassword.trim() })
        .eq('user_id', managementSelectedClientId);

      toast.success('Passcode updated successfully!');
      setManagementNewPassword('');
      fetchManagementClientDetails(managementSelectedClientId);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update passcode.');
    } finally {
      setManagementUpdatingPassword(false);
    }
  };



  const handleSaveManagementQuota = async () => {
    if (!managementSelectedClientId || !managementClientProfile) return;
    setManagementUpdatingQuota(true);
    try {
      const currentTargets = managementClientProfile.user?.targets || {};
      const updatedTargets = { ...currentTargets, ai_quota_limit: managementAiQuotaInput };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', managementSelectedClientId);

      if (error) throw error;
      toast.success('AI Coach quota updated!');
      setManagementClientProfile((prev: any) => ({
        ...prev,
        user: { ...prev.user, targets: updatedTargets }
      }));
      fetchBaseData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update quota.');
    } finally {
      setManagementUpdatingQuota(false);
    }
  };

  const handleToggleManagementFeature = async (featureKey: string, currentValue: boolean) => {
    if (!managementSelectedClientId || !managementClientProfile) return;
    setManagementUpdatingFeatures(true);
    try {
      const currentTargets = managementClientProfile.user?.targets || {};
      const updatedTargets = {
        ...currentTargets,
        [featureKey]: !currentValue
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', managementSelectedClientId);

      if (error) throw error;
      toast.success('Feature permissions updated.');
      setManagementClientProfile((prev: any) => ({
        ...prev,
        user: { ...prev.user, targets: updatedTargets }
      }));
      fetchBaseData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update feature accessibility.');
    } finally {
      setManagementUpdatingFeatures(false);
    }
  };

  const handleReassignClient = async (clientId: string, newCoachId: string) => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ coach_id: newCoachId })
        .eq('id', clientId);

      if (profileError) throw profileError;

      const { error: clientProfileError } = await supabase
        .from('client_profiles')
        .update({ coach_id: newCoachId })
        .eq('user_id', clientId);

      if (clientProfileError) {
        console.error('Failed to update coach_id in client_profiles:', clientProfileError);
      }

      toast.success("Athlete re-assigned successfully!");
      // Update local profiles list to reflect changes instantly
      setProfiles(prev => prev.map(p => p.id === clientId ? { ...p, coach_id: newCoachId } : p));
      // Clear reassign selection for this client
      setReassignCoachTargetId(prev => {
        const copy = { ...prev };
        delete copy[clientId];
        return copy;
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to re-assign athlete. Please try again.");
    }
  };

  const handleToggleCoachSuspension = async (coachId: string, currentDeactivated: boolean) => {
    if (coachId === OWNER_ID) {
      toast.error("Owner account cannot be suspended.");
      return;
    }
    setUpdatingCoachStatus(true);
    try {
      const coachProfile = profiles.find(p => p.id === coachId);
      const currentTargets = coachProfile?.targets || {};
      const updatedTargets = { ...currentTargets, is_deactivated: !currentDeactivated };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', coachId);

      if (error) throw error;
      toast.success(currentDeactivated ? "Coach reactivated!" : "Coach suspended!");
      setProfiles(prev => prev.map(p => p.id === coachId ? { ...p, targets: updatedTargets } : p));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update coach suspension status.");
    } finally {
      setUpdatingCoachStatus(false);
    }
  };

  const handleCreateNewCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoachName || !newCoachEmail || !newCoachPassword) {
      toast.error('Coach Name, Email and Password are required.');
      return;
    }
    setIsCreatingNewCoach(true);
    setCreatedNewCoachCredentials(null);

    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          email: newCoachEmail,
          password: newCoachPassword,
          display_name: newCoachName,
          gender: 'male',
          role: 'coach'
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create coach account');
      }

      setCreatedNewCoachCredentials({
        name: newCoachName,
        email: newCoachEmail,
        password: newCoachPassword
      });

      toast.success('Coach registered successfully!');
      setNewCoachName('');
      setNewCoachEmail('');
      setNewCoachPassword('');
      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to register coach.');
    } finally {
      setIsCreatingNewCoach(false);
    }
  };

  const handleDeleteManagementClient = async () => {
    if (!managementSelectedClientId || !managementClientProfile) return;
    const name = managementClientProfile.user?.display_name || 'this client';
    const conf = window.prompt(`Type "${name}" to confirm complete account deletion (workouts, InBody, and auth logs will be wiped):`);
    if (conf !== name) {
      if (conf !== null) toast.error('Verification failed. Deletion cancelled.');
      return;
    }

    const toastId = toast.loading('Deleting athlete account...');
    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ uid: managementSelectedClientId })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn('Auth deletion warning:', errData.error);
      }

      await supabase.from('inbody_scans').delete().eq('user_id', managementSelectedClientId);
      await supabase.from('client_workout_days').delete().eq('user_id', managementSelectedClientId);
      await supabase.from('user_workout_plans').delete().eq('user_id', managementSelectedClientId);
      await supabase.from('progress_notes').delete().eq('user_id', managementSelectedClientId);
      await supabase.from('water_logs').delete().eq('user_id', managementSelectedClientId);
      await supabase.from('client_profiles').delete().eq('user_id', managementSelectedClientId);
      await supabase.from('profiles').delete().eq('id', managementSelectedClientId);

      toast.success('Athlete wiped successfully.', { id: toastId });
      
      const remainingClients = clientsList.filter(c => c.id !== managementSelectedClientId);
      if (remainingClients.length > 0) {
        setManagementSelectedClientId(remainingClients[0].id);
      } else {
        setManagementSelectedClientId('');
        setManagementClientProfile(null);
      }
      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Wipe failed: ' + err.message, { id: toastId });
    }
  };

  // ─── DEPLOY ATHLETE 4-STEP ACTION ──────────────────────────
  const handleDeployAthlete = async () => {
    if (!formData.displayName.trim() || !formData.username.trim() || !formData.password.trim()) {
      toast.error('Name, Username, and Password are required.');
      return;
    }
    setDeployLoading(true);
    setDeploySuccessData(null);

    try {
      // 1. Calculate next client code
      let nextClientCode = parseInt(formData.clientCode);
      if (isNaN(nextClientCode)) {
        const { data: existing } = await supabase.from('profiles').select('targets').eq('role', 'client');
        nextClientCode = 101;
        if (existing && existing.length > 0) {
          const codes = existing.map(p => p.targets?.client_code).filter(c => typeof c === 'number');
          if (codes.length > 0) nextClientCode = Math.max(...codes) + 1;
          else nextClientCode = 101 + existing.length;
        }
      } else {
        const { data: duplicate } = await supabase.from('profiles').select('id').eq('role', 'client').eq('targets->>client_code', String(nextClientCode)).maybeSingle();
        if (duplicate) throw new Error(`Client Number #${nextClientCode} is already assigned.`);
      }

      const emailAddress = `${formData.username.trim().toLowerCase()}@stride.fit`;

      // 2. Fetch API create-user
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          email: emailAddress,
          password: formData.password,
          display_name: formData.displayName,
          gender: deployGender
        })
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || 'API User generation failed.');
      }

      const clientUserId = resData.user.id;

      // 3. Setup split nutrition day map
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
      const period = formData.subscriptionPeriod;
      const delayDays = parseInt(formData.subscriptionStartDelay) || 0;

      if (period && period !== 'none') {
        const now = new Date();
        const startDateObj = new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000);
        subscription_start_date = startDateObj.toISOString();

        if (period === 'custom') {
          if (formData.customSubscriptionEnd) {
            subscription_end_date = new Date(formData.customSubscriptionEnd).toISOString();
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
          else if (period === '2 years') durationMs = 730 * 24 * 60 * 60 * 1000;

          const endDateObj = new Date(startDateObj.getTime() + durationMs);
          subscription_end_date = endDateObj.toISOString();
        }
      }

      // 4. Public Profiles setup
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
        client_code: nextClientCode,
        phone_number: formData.phoneNumber.trim(),
        subscription_duration: period,
        subscription_delay_days: delayDays,
        subscription_start_date,
        subscription_end_date
      };

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: clientUserId,
        username: formData.username.trim().toLowerCase(),
        email: emailAddress,
        display_name: formData.displayName,
        role: 'client',
        coach_id: coachUserId,
        targets
      });
      if (profileError) throw profileError;

      // 5. Client Profiles row
      const { error: clientProfileError } = await supabase.from('client_profiles').insert({
        user_id: clientUserId,
        coach_id: coachUserId,
        age: parseInt(formData.age) || null,
        height: parseFloat(formData.height) || null,
        experience_level: formData.experience_level,
        workouts_per_week: deploySplits.length,
        goals: formData.goals || '',
        injuries_notes: formData.injuries_notes || '',
        generated_passcode: formData.password
      });
      if (clientProfileError) throw clientProfileError;

      // 6. Save initial InBody composition scan(s)
      if (deployCsvScans.length > 0) {
        const scansToInsert = deployCsvScans.map(scan => ({
          ...scan,
          user_id: clientUserId
        }));
        await supabase.from('inbody_scans').insert(scansToInsert);
      } else {
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
            bmr: Math.round(10 * weightVal + 6.25 * (parseFloat(formData.height) || 175) - 5 * (parseInt(formData.age) || 25) + 5),
            score: deployInbodyScore,
            segmental: {
              visceralFat: 6,
              tbw: Math.round(weightVal * 0.6),
              protein: Math.round(weightVal * 0.18),
              minerals: Math.round(weightVal * 0.05),
              raLean: Math.round(weightVal * 0.05),
              laLean: Math.round(weightVal * 0.05),
              trunkLean: Math.round(weightVal * 0.28),
              rlLean: Math.round(weightVal * 0.12),
              llLean: Math.round(weightVal * 0.12)
            }
          });
        }
      }

      // 7. Workout plans templates & days
      const planPromises = deploySplits.map(split => {
        return supabase.from('user_workout_plans').upsert({
          user_id: clientUserId,
          plan_type: split.key,
          exercises: split.exercises
        });
      });
      await Promise.all(planPromises);

      const dayPromises = deploySplits.map((split, i) => {
        return supabase.from('client_workout_days').insert({
          user_id: clientUserId,
          day_number: i + 1,
          day_name: `${split.key} Day`,
          exercises: split.exercises
        });
      });
      await Promise.all(dayPromises);

      setDeploySuccessData({
        displayName: formData.displayName,
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        clientCode: nextClientCode
      });

      toast.success('Athlete registered and splits deployed successfully!');
      
      // Reset form & states
      setFormData({
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
      setDeployStep(1);
      setDeployWeight('');
      setDeployBfPercent('');
      setDeploySmm('');
      setDeployCsvScans([]);

      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Deployment encountered an error.');
    } finally {
      setDeployLoading(false);
    }
  };

  const handleDeployCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const parsedScans = [];

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
          visceralFat: getValue('visceral fat level') || 6,
          tbw: getValue('total body water') || Math.round(getValue('weight(kg)') * 0.6) || 40,
          protein: getValue('protein') || Math.round(getValue('weight(kg)') * 0.18) || 12,
          minerals: getValue('mineral') || Math.round(getValue('weight(kg)') * 0.05) || 4,
          raLean: getValue('right arm lean') || 3.2,
          laLean: getValue('left arm lean') || 3.2,
          trunkLean: getValue('trunk lean') || 22,
          rlLean: getValue('right leg lean') || 8.5,
          llLean: getValue('left leg lean') || 8.5,
        };

        const parsedWeight = getValue('weight(kg)') || getValue('weight') || 0;
        const parsedSmm = getValue('skeletal muscle mass') || getValue('smm') || 0;
        const parsedBfPercent = getValue('percent body fat') || getValue('bf_percent') || 0;

        if (parsedWeight > 0) {
          parsedScans.push({
            date: dateStr,
            weight: parsedWeight,
            smm: parsedSmm,
            bfm: parseFloat(((parsedWeight * parsedBfPercent) / 100).toFixed(1)),
            bf_percent: parsedBfPercent,
            bmr: getValue('basal metabolic rate') || 1600,
            score: getValue('inbody score') || 75,
            segmental: segmental
          });
        }
      }

      if (parsedScans.length > 0) {
        parsedScans.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDeployCsvScans(parsedScans);

        const latestScan = parsedScans[parsedScans.length - 1];
        setDeployWeight(latestScan.weight.toString());
        setDeployBfPercent(latestScan.bf_percent.toString());
        setDeploySmm(latestScan.smm.toString());
        setDeployInbodyScore(latestScan.score || 75);

        toast.success(`Loaded ${parsedScans.length} scans from CSV for deployment!`);
      } else {
        toast.error('No valid data found in CSV.');
      }
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  // Add/remove exercises to splits in deployment flow
  const handleAddExerciseToDeploySplit = (splitKey: string, ex: any) => {
    setDeploySplits(prev => prev.map(s => {
      if (s.key === splitKey) {
        if (s.exercises.some((e: any) => e.name === ex.name)) {
          toast.error(`${ex.name} is already in split`);
          return s;
        }
        return {
          ...s,
          exercises: [
            ...s.exercises,
            {
              id: ex.id || `dp-custom-${Date.now()}`,
              name: ex.name,
              muscle_group: ex.muscle_group || '',
              sets: 3,
              rest: 120
            }
          ]
        };
      }
      return s;
    }));
    toast.success(`Added ${ex.name}`);
  };

  const handleRemoveExerciseFromDeploySplit = (splitKey: string, exId: string) => {
    setDeploySplits(prev => prev.map(s => {
      if (s.key === splitKey) {
        return {
          ...s,
          exercises: s.exercises.filter((ex: any) => ex.id !== exId)
        };
      }
      return s;
    }));
  };

  const addDeploySplit = () => {
    const trimmed = newDeploySplitName.trim();
    if (!trimmed) return;
    if (deploySplits.some(s => s.key.toUpperCase() === trimmed.toUpperCase())) {
      toast.error('This split name already exists.');
      return;
    }
    const colorOptions = ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#ec4899', '#10b981', '#f97316', '#06b6d4'];
    const randomColor = colorOptions[deploySplits.length % colorOptions.length];
    
    setDeploySplits(prev => [
      ...prev,
      {
        key: trimmed.toUpperCase(),
        label: trimmed,
        emoji: '🏋️‍♂️',
        color: randomColor,
        exercises: []
      }
    ]);
    setNewDeploySplitName('');
    toast.success(`Split "${trimmed}" added!`);
  };

  const removeDeploySplit = (key: string) => {
    if (deploySplits.length <= 1) {
      toast.error('You must keep at least one training split.');
      return;
    }
    setDeploySplits(prev => prev.filter(s => s.key !== key));
    if (deployActiveSplitKey === key) setDeployActiveSplitKey(null);
  };
  // Helper date preseters
  const shiftClientDate = (days: number) => {
    const d = new Date(clientActiveDateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setClientActiveDateStr(getLocalDateString(d));
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

  // Filters
  const filteredClients = clientsList.filter(c => 
    c.display_name?.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.username?.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const systemCoaches = profiles.filter(p => p.role === 'coach' || p.id === OWNER_ID);
  const filteredSystemCoaches = systemCoaches.filter(coach => {
    const q = coachSearchQuery.toLowerCase();
    return (
      coach.display_name?.toLowerCase().includes(q) ||
      coach.username?.toLowerCase().includes(q) ||
      (coach.email && coach.email.toLowerCase().includes(q))
    );
  });

  const selectedCoachProfile = systemSelectedCoachId 
    ? systemCoaches.find(c => c.id === systemSelectedCoachId) 
    : null;

  const selectedCoachClients = selectedCoachProfile 
    ? profiles.filter(p => p.role === 'client' && p.coach_id === selectedCoachProfile.id) 
    : [];

  // Filter Catalog exercises inside Directory template split builder
  const filteredCatalog = exerciseDb.filter(ex => {
    if (!searchExerciseQuery) return false;
    return ex.name.toLowerCase().includes(searchExerciseQuery.toLowerCase()) ||
      ex.muscle_group?.toLowerCase().includes(searchExerciseQuery.toLowerCase());
  }).slice(0, 6);

  // Filter catalog inside Deploy Athlete wizard
  const filteredDeployCatalog = exerciseDb.filter(ex => {
    if (!searchExerciseQuery) return false;
    return ex.name.toLowerCase().includes(searchExerciseQuery.toLowerCase()) ||
      ex.muscle_group?.toLowerCase().includes(searchExerciseQuery.toLowerCase());
  }).slice(0, 5);

  const deployStepsInfo = [
    { label: 'Identity', icon: <UserCheck size={14} /> },
    { label: 'Workouts', icon: <Dumbbell size={14} /> },
    { label: 'Diet', icon: <Apple size={14} /> },
    { label: 'InBody', icon: <Scale size={14} /> }
  ];

  // Daily statistics for chosen client tab
  const consumedMacros = clientMeals.reduce(
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

  const waterTotalMl = clientWaterLogs.reduce((acc, log) => acc + (log.amount_ml || 0), 0);

  const athleteDayTypes = Array.from(new Set([
    'REST', 
    'RUN', 
    'RUN + GYM', 
    ...clientWorkoutPlans.map(p => p.plan_type),
    ...Object.keys(dayNutrition)
  ])).filter(Boolean);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05050b] text-gray-200">
        <DumbbellLoader label="Initializing Desktop Coach Portal..." size={120} />
      </div>
    );
  }

  if (isNotCoach) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05050b] text-gray-200 text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <ShieldAlert size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-black text-white">Access Denied</h1>
        <p className="text-gray-400 text-xs mt-3 max-w-[280px] leading-relaxed">
          Only authorized coaches and system administrators can access the Desktop Coach Portal.
        </p>
      </div>
    );
  }

  if (isCoachSuspended) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05050b] text-gray-200 text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
          <ShieldAlert size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-black text-white">Account Suspended</h1>
        <p className="text-gray-400 text-xs mt-3 max-w-[320px] leading-relaxed">
          Your administrative coach access has been suspended by the system administrator. Please contact the owner if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050b] text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Visual background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Top Header Navbar */}
      <header className="border-b border-gray-800 bg-[#070710]/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Users size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-widest bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Stride Rite Fitness
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">Desktop Coach Portal / Version 3.0</p>
          </div>
        </div>

        {/* System Health Check indicator */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-xl px-3 py-1.5 font-medium">
            <Database size={13} className={dbHealthy ? 'text-emerald-400' : 'text-red-400'} />
            <span className="text-[10px] text-gray-400">Database:</span>
            <span className={dbHealthy ? 'text-emerald-400 font-black' : 'text-red-400 font-black'}>
              {dbHealthy ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <button 
            onClick={() => fetchBaseData()}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900/40 text-[10px] font-bold text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Refresh database data only"
          >
            <RefreshCw size={11} /> Sync Data
          </button>

          <button 
            onClick={handleHardReload}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-blue-900/40 hover:border-blue-700 bg-blue-950/20 text-[10px] font-bold text-blue-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Force browser update and clear cache"
          >
            <RefreshCw size={11} /> Force Update (Hard Reload)
          </button>

          <button 
            onClick={async () => {
              if (window.confirm("Are you sure you want to sign out?")) {
                await supabase.auth.signOut();
                window.location.href = '/coach-portal';
              }
            }}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-red-900/40 hover:border-red-700 bg-red-950/20 text-[10px] font-bold text-red-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Log Out"
          >
            <LogOut size={11} /> Log Out
          </button>
        </div>
      </header>

      {/* Main Grid Sidebar + Panel */}
      <div className="flex-1 flex items-stretch">
        
        {/* Sidebar Nav */}
        <aside className="w-[240px] border-r border-gray-850 bg-[#070710]/40 flex flex-col p-4 space-y-1.5">
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 px-3.5 mb-2">Main Navigation</p>
          
          <button 
            onClick={() => handleSidebarTabClick('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'overview' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            <Activity size={15} /> Operational Overview
          </button>

          <button 
            onClick={() => handleSidebarTabClick('clients')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'clients' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            <Users size={15} /> Athlete Directory
          </button>

          <button 
            onClick={() => handleSidebarTabClick('deploy')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'deploy' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            <UserPlus size={15} /> Deploy New Athlete
          </button>

          <button 
            onClick={() => handleSidebarTabClick('management')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'management' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            <Settings size={15} /> Athlete Control
          </button>

          <button 
            onClick={() => handleSidebarTabClick('subscriptions')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'subscriptions' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            <CreditCard size={15} /> Subscriptions
          </button>

          {coachUserId === OWNER_ID && (
            <button 
              onClick={() => handleSidebarTabClick('system')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                activeTab === 'system' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black' 
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
              }`}
            >
              <Shield size={15} /> System Console
            </button>
          )}
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-6xl">
              
              {/* Demographics Widgets Grid */}
              <div className={`grid grid-cols-1 ${coachUserId === OWNER_ID ? 'md:grid-cols-4' : 'md:grid-cols-2'} gap-4`}>
                {coachUserId === OWNER_ID && (
                  <>
                    <Card className="p-6 flex flex-col gap-1 relative overflow-hidden bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                      <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total System Accounts</p>
                      <p className="text-3xl font-black text-white mt-2">{profiles.length}</p>
                    </Card>
                    <Card className="p-6 flex flex-col gap-1 relative overflow-hidden bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Coaches Active</p>
                      <p className="text-3xl font-black text-blue-400 mt-2">{profiles.filter(p => p.role === 'coach').length}</p>
                    </Card>
                  </>
                )}
                <Card className="p-6 flex flex-col gap-1 relative overflow-hidden bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Managed Athletes</p>
                  <p className="text-3xl font-black text-indigo-400 mt-2">{clientsList.length}</p>
                </Card>
                <Card className="p-6 flex flex-col gap-1 relative overflow-hidden bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">System Status</p>
                  <p className="text-3xl font-black text-emerald-400 mt-2 flex items-center gap-1.5">
                    <CheckCircle className="text-emerald-500" size={24} /> SECURE
                  </p>
                </Card>
              </div>

              {/* Feed & Systems Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Workouts Feed */}
                <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                      <Dumbbell size={15} /> Workouts Completed Feed
                    </h3>
                    {refreshingFeed && <span className="text-[10px] text-gray-500">updating...</span>}
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                    {recentWorkouts.length === 0 ? (
                      <p className="text-xs text-gray-500 italic text-center py-12">No recent completions recorded.</p>
                    ) : (
                      recentWorkouts.map((w, idx) => (
                        <div key={idx} className="bg-gray-900/40 border border-gray-850/80 p-4 rounded-2xl flex justify-between items-center text-xs hover:border-gray-800 transition-colors">
                          <div className="space-y-1">
                            <p className="font-extrabold text-white">{w.profiles?.display_name}</p>
                            <p className="text-gray-500">Completed a <span className="text-blue-400 font-bold">{w.day_type}</span> day</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-gray-200">{w.total_volume > 0 ? `${w.total_volume} kg` : 'Run/Rest'}</p>
                            <p className="text-gray-500 font-mono text-[10px] mt-0.5">{w.date}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Diets Feed */}
                <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                      <Apple size={15} /> Nutritional Intake Feed
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                    {recentDiets.length === 0 ? (
                      <p className="text-xs text-gray-500 italic text-center py-12">No recent diet logs recorded.</p>
                    ) : (
                      recentDiets.map((d, idx) => (
                        <div key={idx} className="bg-gray-900/40 border border-gray-850/80 p-4 rounded-2xl flex justify-between items-center text-xs hover:border-gray-800 transition-colors">
                          <div className="space-y-1">
                            <p className="font-extrabold text-white">{d.profiles?.display_name}</p>
                            <p className="text-gray-500">Tracked daily totals</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-emerald-400">
                              {Math.round(d.daily_totals?.kcal || 0)} kcal / {Math.round(d.daily_totals?.protein || 0)}g P
                            </p>
                            <p className="text-gray-500 font-mono text-[10px] mt-0.5">{d.date}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CLIENT DETAILS (Athlete Directory Split View) */}
          {activeTab === 'clients' && (
            <div className="flex gap-6 h-[calc(100vh-140px)] items-stretch">
              
              {/* Left Column: Search & List */}
              <div className="w-[300px] flex flex-col gap-4 bg-[#0b0c16] border border-gray-800 rounded-3xl p-4 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                  <input 
                    type="text"
                    value={clientSearchQuery}
                    onChange={e => setClientSearchQuery(e.target.value)}
                    placeholder="Search athletes..."
                    className="w-full bg-[#121624] border border-gray-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
                  {filteredClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => handleClientSelectClick(client.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        selectedClientId === client.id 
                          ? 'bg-blue-600/10 border-blue-500/50' 
                          : 'bg-[#121624]/40 border-gray-850/80 hover:border-gray-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-900/40 text-blue-300 font-black flex items-center justify-center text-xs uppercase">
                        {client.display_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{client.display_name || 'Unnamed Client'}</p>
                        <p className="text-[10px] text-gray-500 truncate">@{client.username}</p>
                      </div>
                      <ChevronRight size={13} className="text-gray-600" />
                    </button>
                  ))}
                  {filteredClients.length === 0 && (
                    <p className="text-xs text-gray-500 italic text-center py-12">No athletes found.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Detail Sheets */}
              <div className="flex-1 bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 overflow-y-auto no-scrollbar relative">
                
                {loadingClientDetails ? (
                  <div className="absolute inset-0 bg-[#0b0c16]/80 flex flex-col items-center justify-center z-20 rounded-3xl">
                    <DumbbellLoader label="Retrieving client dossier..." size={100} />
                  </div>
                ) : null}

                {!selectedClientProfile ? (
                  <div className="h-full flex flex-col justify-center items-center text-center text-gray-500 space-y-2">
                    <Users size={48} className="text-gray-700" />
                    <p className="text-sm font-bold">No Athlete Selected</p>
                    <p className="text-xs max-w-[280px] leading-relaxed">Select an athlete from the side directory to view their complete nutrition goals, training split templates, biometrics, and scan records.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Detail Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center font-black text-base uppercase">
                          {selectedClientProfile.user?.display_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-white flex items-center gap-2">
                            {selectedClientProfile.user?.display_name || 'Unnamed Athlete'}
                            {selectedClientProfile.user?.targets?.client_code && (
                              <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-black tracking-normal">
                                #{selectedClientProfile.user.targets.client_code}
                              </span>
                            )}
                          </h2>
                          <p className="text-xs text-gray-500">Handle: @{selectedClientProfile.user?.username || 'no-username'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          selectedClientProfile.user?.targets?.is_deactivated === true 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {selectedClientProfile.user?.targets?.is_deactivated === true ? 'Suspended' : 'Active'}
                        </span>
                      </div>
                    </div>

                    {/* Client Detail Sub-Tabs Navigation */}
                    <div className="flex border-b border-gray-800 gap-4 mt-4">
                      {([
                        { id: 'overview', label: 'Overview', icon: <Activity size={13} /> },
                        { id: 'diet', label: 'Diet Logs', icon: <Apple size={13} /> },
                        { id: 'water', label: 'Water Logs', icon: <Droplets size={13} /> },
                        { id: 'workouts', label: 'Training Plans', icon: <Dumbbell size={13} /> },
                        { id: 'inbody', label: 'InBody Scans', icon: <Scale size={13} /> },
                      ] as const).map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => handleClientSubTabClick(tab.id)}
                          className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                            clientActiveTab === tab.id
                              ? 'border-blue-500 text-blue-400 font-extrabold'
                              : 'border-transparent text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* CLIENT TAB: OVERVIEW */}
                    {clientActiveTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Biometrics row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-[#121624] border border-gray-850 p-4 rounded-2xl text-center">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1"><Scale size={10} /> Weight</p>
                            <p className="text-base font-black text-white mt-1.5">{latestWeight ? `${latestWeight} kg` : 'N/A'}</p>
                          </div>
                          <div className="bg-[#121624] border border-gray-850 p-4 rounded-2xl text-center">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1"><Ruler size={10} /> Height</p>
                            <p className="text-base font-black text-white mt-1.5">{selectedClientProfile.height ? `${selectedClientProfile.height} cm` : 'N/A'}</p>
                          </div>
                          <div className="bg-[#121624] border border-gray-850 p-4 rounded-2xl text-center">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1"><Calendar size={10} /> Age</p>
                            <p className="text-base font-black text-white mt-1.5">{selectedClientProfile.age ? `${selectedClientProfile.age} yrs` : 'N/A'}</p>
                          </div>
                          <div className="bg-[#121624] border border-gray-850 p-4 rounded-2xl text-center">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1">Passcode</p>
                            <p className="text-base font-black text-yellow-500 font-mono mt-1.5">{selectedClientProfile.generated_passcode || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Nutrition targets editor */}
                        <div className="flex flex-col gap-6">
                          <Card className="p-5 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 border-b border-gray-800 pb-2 flex items-center gap-2">
                              <Apple size={14} /> Macro &amp; Hydration Targets
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Calories (kcal)</label>
                                <input 
                                  type="number" value={targetKcal} onChange={e => setTargetKcal(parseInt(e.target.value) || 0)}
                                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Protein (g)</label>
                                <input 
                                  type="number" value={targetProtein} onChange={e => setTargetProtein(parseInt(e.target.value) || 0)}
                                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Carbs (g)</label>
                                <input 
                                  type="number" value={targetCarbs} onChange={e => setTargetCarbs(parseInt(e.target.value) || 0)}
                                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Fat (g)</label>
                                <input 
                                  type="number" value={targetFat} onChange={e => setTargetFat(parseInt(e.target.value) || 0)}
                                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="space-y-1 col-span-2">
                                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Water Goal (Liters)</label>
                                <input 
                                  type="number" step="0.1" value={targetWaterLiters} onChange={e => setTargetWaterLiters(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <button
                              onClick={handleSaveTargets}
                              disabled={savingTargets}
                              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {savingTargets ? 'Saving Targets...' : <><Save size={13} /> Save Nutrition Targets</>}
                            </button>
                          </Card>

                          {/* Nutrition by day type */}
                          <div className="bg-[#121624] border border-gray-800 rounded-2xl p-6 space-y-5">
                            <h3 className="text-sm font-black uppercase tracking-wide text-blue-400 border-b border-gray-800 pb-3 flex items-center gap-1.5">📋 Day-Type Custom Targets</h3>
                            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                              {athleteDayTypes.map(dt => {
                                const dn = dayNutrition[dt];
                                const isEditing = editingDayType === dt;
                                return (
                                  <div key={dt} className="bg-gray-900/60 border border-gray-850 rounded-xl overflow-hidden shadow-sm">
                                    <button
                                      onClick={() => isEditing ? setEditingDayType(null) : handleOpenDayEdit(dt)}
                                      className="w-full flex items-center justify-between py-4 px-5 hover:bg-gray-800/20 transition-colors"
                                    >
                                      <span className={`text-[10px] font-black px-2.5 py-1 rounded border uppercase ${dayColor(dt)}`}>{dt}</span>
                                      {dn ? (
                                        <span className="text-xs md:text-sm text-gray-300 font-bold">{dn.kcal} kcal · P{dn.protein}g · C{dn.carbs}g · F{dn.fat}g</span>
                                      ) : (
                                        <span className="text-xs text-gray-500 italic font-medium">Default Work Macros</span>
                                      )}
                                    </button>

                                    {isEditing && (
                                      <div className="border-t border-gray-800 p-6 space-y-5 bg-[#0a0f1a]">
                                        <div className="grid grid-cols-4 gap-4">
                                          {[
                                            { label: 'Kcal', val: editDayKcal, set: setEditDayKcal },
                                            { label: 'Prot (g)', val: editDayProtein, set: setEditDayProtein },
                                            { label: 'Carb (g)', val: editDayCarbs, set: setEditDayCarbs },
                                            { label: 'Fat (g)', val: editDayFat, set: setEditDayFat },
                                          ].map(({ label, val, set }) => (
                                            <div key={label}>
                                              <label className="text-[10px] text-gray-400 block mb-1.5 font-bold uppercase tracking-wider">{label}</label>
                                              <input
                                                type="number" value={val} onChange={e => set(parseInt(e.target.value) || 0)}
                                                className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-3 text-sm text-white text-center font-extrabold shadow-inner focus:border-blue-500 outline-none"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                        <div className="flex gap-3">
                                          <button onClick={handleSaveDayNutrition} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase py-3 rounded-xl transition-all shadow-md">Save Changes</button>
                                          <button onClick={() => setEditingDayType(null)} className="px-4 bg-gray-800 text-gray-400 font-bold text-xs rounded-xl transition-all">Cancel</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CLIENT TAB: DIET LOGS */}
                    {clientActiveTab === 'diet' && (
                      <div className="space-y-6">
                        {/* Date Navigator */}
                        <div className="flex items-center justify-between bg-[#121624] border border-gray-850 p-3 rounded-2xl">
                          <button onClick={() => shiftClientDate(-1)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400"><ChevronLeft size={16} /></button>
                          <span className="text-xs font-bold text-white flex items-center gap-1.5"><Calendar size={13} className="text-blue-400" /> {clientActiveDateStr}</span>
                          <button onClick={() => shiftClientDate(1)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400"><ChevronRight size={16} /></button>
                        </div>

                        {/* Nutrition indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                          <StatCard label="Calories" value={consumedMacros.kcal} max={targetKcal} unit=" kcal" color="#f97316" emoji="🔥" />
                          <StatCard label="Protein" value={consumedMacros.protein} max={targetProtein} unit="g" color="#60a5fa" emoji="🍳" />
                          <StatCard label="Carbs" value={consumedMacros.carbs} max={targetCarbs} unit="g" color="#fbbf24" emoji="🍯" />
                          <StatCard label="Fat" value={consumedMacros.fat} max={targetFat} unit="g" color="#f87171" emoji="🥑" />
                        </div>

                        {/* Custom food logger & meals table */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                          {/* Log Meal Form */}
                          <Card className="p-5 space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                              <h3 className="text-xs font-black uppercase text-blue-400">Log Custom Meal</h3>
                            </div>

                            <div className="space-y-3">
                              <input 
                                type="text" value={newMealName} onChange={e => setNewMealName(e.target.value)}
                                placeholder="Meal Name (e.g. Oatmeal & Eggs)"
                                className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[8px] text-gray-500 uppercase font-black">Calories (kcal)</label>
                                  <input type="number" value={newMealKcal} onChange={e => setNewMealKcal(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                  <label className="text-[8px] text-gray-500 uppercase font-black">Protein (g)</label>
                                  <input type="number" value={newMealProtein} onChange={e => setNewMealProtein(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                  <label className="text-[8px] text-gray-500 uppercase font-black">Carbs (g)</label>
                                  <input type="number" value={newMealCarbs} onChange={e => setNewMealCarbs(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                  <label className="text-[8px] text-gray-500 uppercase font-black">Fat (g)</label>
                                  <input type="number" value={newMealFat} onChange={e => setNewMealFat(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white outline-none focus:border-blue-500" />
                                </div>
                              </div>
                              <button onClick={handleAddMealLog} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer">Save Meal Entry</button>
                            </div>
                          </Card>

                          {/* Logged Meals List */}
                          <div className="lg:col-span-2 bg-[#121624]/30 border border-gray-800 rounded-2xl p-5 flex flex-col justify-start">
                            <h3 className="text-xs font-black uppercase text-gray-400 border-b border-gray-850 pb-2">Meals Logged Timeline</h3>
                            <div className="divide-y divide-gray-850 mt-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                              {clientMeals.length === 0 ? (
                                <p className="text-xs text-gray-500 italic py-8 text-center">No meals recorded for this date.</p>
                              ) : (
                                clientMeals.map(meal => {
                                  const mm = meal.items?.reduce((t: any, i: any) => ({
                                    kcal: t.kcal + (i.macros?.kcal || 0),
                                    protein: t.protein + (i.macros?.protein || 0),
                                    carbs: t.carbs + (i.macros?.carbs || 0),
                                    fat: t.fat + (i.macros?.fat || 0),
                                  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
                                  return (
                                    <div key={meal.id} className="flex justify-between items-center py-3.5 gap-4">
                                      <div>
                                        <p className="text-xs font-bold text-white">{meal.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                          {Math.round(mm?.kcal || 0)} kcal · P{Math.round(mm?.protein || 0)}g · C{Math.round(mm?.carbs || 0)}g · F{Math.round(mm?.fat || 0)}g
                                        </p>
                                      </div>
                                      <button onClick={() => handleDeleteMeal(meal.id)} className="p-2 text-gray-500 hover:text-red-400 rounded-xl transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CLIENT TAB: WATER LOGS */}
                    {clientActiveTab === 'water' && (
                      <div className="space-y-6">
                        {/* Date Navigator */}
                        <div className="flex items-center justify-between bg-[#121624] border border-gray-850 p-3 rounded-2xl">
                          <button onClick={() => shiftClientDate(-1)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400"><ChevronLeft size={16} /></button>
                          <span className="text-xs font-bold text-white flex items-center gap-1.5"><Calendar size={13} className="text-blue-400" /> {clientActiveDateStr}</span>
                          <button onClick={() => shiftClientDate(1)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400"><ChevronRight size={16} /></button>
                        </div>

                        {/* Hydration Goal Status */}
                        <div className="bg-[#121624] border border-gray-850 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">💧</span>
                            <div>
                              <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Water Consumed Progress</p>
                              <p className="text-lg font-black text-white mt-0.5">
                                {(waterTotalMl / 1000).toFixed(2)}L <span className="text-xs text-gray-500">/ {targetWaterLiters}L Goal</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex-1 max-w-[240px]">
                            <ProgressBar value={waterTotalMl} max={targetWaterLiters * 1000} color="#38bdf8" />
                          </div>
                        </div>

                        {/* Logger inputs & timeline logs */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                          {/* Log Water presets */}
                          <Card className="p-5 space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                              <h3 className="text-xs font-black uppercase text-blue-400">Log Hydration</h3>
                              {clientWaterLogs.length > 0 && (
                                <button onClick={handleClearWater} className="text-[9px] font-black uppercase text-red-400">Clear Day</button>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {[250, 330, 500, 750, 1000].map(ml => (
                                <button 
                                  key={ml} 
                                  type="button"
                                  onClick={() => { 
                                    setNewWaterAmount(ml); 
                                    handleAddWater(ml); 
                                  }}
                                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all border ${newWaterAmount === ml ? 'bg-sky-600 border-sky-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
                                >
                                  {ml}ml
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                              <input 
                                type="number" value={newWaterAmount} onChange={e => setNewWaterAmount(parseInt(e.target.value) || 0)}
                                className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-sky-500 text-center font-bold"
                              />
                              <button onClick={() => handleAddWater()} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all">+ Log Custom Amount</button>
                            </div>
                          </Card>

                          {/* Water log timeline */}
                          <div className="lg:col-span-2 bg-[#121624]/30 border border-gray-800 rounded-2xl p-5 flex flex-col justify-start">
                            <h3 className="text-xs font-black uppercase text-gray-400 border-b border-gray-850 pb-2">Daily Timeline logs</h3>
                            <div className="divide-y divide-gray-850 mt-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                              {clientWaterLogs.length === 0 ? (
                                <p className="text-xs text-gray-500 italic py-8 text-center">No water logged for this date.</p>
                              ) : (
                                clientWaterLogs.map(log => (
                                  <div key={log.id} className="flex justify-between items-center py-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">💧</span>
                                      <div>
                                        <p className="text-xs font-black text-white">{log.amount_ml} ml</p>
                                        <p className="text-[9px] text-gray-500 flex items-center gap-0.5 mt-0.5">
                                          <Clock size={8} /> {log.time?.includes('T') ? new Date(log.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : log.time}
                                        </p>
                                      </div>
                                    </div>
                                    <button onClick={() => handleDeleteWater(log.id)} className="p-2 text-gray-500 hover:text-red-400"><Trash2 size={13} /></button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CLIENT TAB: TRAINING PLANS */}
                    {clientActiveTab === 'workouts' && (
                      <div className="space-y-6">
                        {/* Completed sessions on selected date */}
                        <div className="bg-[#121624]/30 border border-gray-800 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                            <h3 className="text-xs font-black uppercase text-blue-400">Completed Sessions</h3>
                            {/* Short Date Navigator */}
                            <div className="flex items-center gap-2 border border-gray-800 bg-[#121624] py-1 px-3.5 rounded-xl">
                              <button onClick={() => shiftClientDate(-1)} className="text-gray-400 hover:text-white"><ChevronLeft size={12} /></button>
                              <span className="text-[10px] font-bold text-gray-300 font-mono">{clientActiveDateStr}</span>
                              <button onClick={() => shiftClientDate(1)} className="text-gray-400 hover:text-white"><ChevronRight size={12} /></button>
                            </div>
                          </div>

                          <div className="space-y-2 mt-2">
                            {clientWorkoutsList.length === 0 ? (
                              <p className="text-xs text-gray-500 italic py-4 text-center">No completed workouts logged on this date.</p>
                            ) : (
                              clientWorkoutsList.map(w => (
                                <div 
                                  key={w.id} 
                                  onClick={() => w.status === 'completed' && setSelectedReceiptWorkout(w)}
                                  className={`bg-[#121624]/50 border border-gray-850 p-3 rounded-2xl flex justify-between items-center text-xs transition-all ${w.status === 'completed' ? 'hover:border-gray-700 cursor-pointer hover:bg-gray-900/20' : ''}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${dayColor(w.day_type || '')}`}>{w.day_type || 'GYM'}</span>
                                    <span className="font-bold text-white">{w.name || 'Workout Session'}</span>
                                  </div>
                                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                                    w.status === 'completed' ? 'bg-green-500/10 border border-green-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'
                                  }`}>
                                    {w.status === 'completed' ? '✓ View Receipt' : w.status || 'pending'}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Splits template editor */}
                        <div className="bg-[#121624]/30 border border-gray-800 rounded-3xl p-5 space-y-4">
                          <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                            <h3 className="text-xs font-black uppercase text-blue-400">Gym Program templates splits ({clientWorkoutPlans.length})</h3>
                            
                            <form onSubmit={handleCreateSplitDay} className="flex gap-2">
                              <input 
                                type="text" value={newDeploySplitName} onChange={e => setNewDeploySplitName(e.target.value)}
                                placeholder="E.g. PUSH, LEGS"
                                className="bg-[#121624] border border-gray-800 rounded-xl px-3 py-1.5 text-[10px] text-white outline-none focus:border-blue-500 font-bold uppercase"
                              />
                              <button type="submit" className="bg-blue-600 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-xl uppercase transition-all">+ Add Split</button>
                            </form>
                          </div>

                          <div className="divide-y divide-gray-850">
                            {clientWorkoutPlans.map(plan => {
                              const dt = plan.plan_type;
                              const isExp = activeSplitEditKey === dt;
                              return (
                                <div key={plan.id} className="py-2.5">
                                  <div className="w-full flex items-center justify-between py-2">
                                    <div 
                                      className="flex items-center gap-2 cursor-pointer"
                                      onClick={() => setActiveSplitEditKey(isExp ? null : dt)}
                                    >
                                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded border uppercase ${dayColor(dt)}`}>{dt}</span>
                                      <span className="text-[10px] text-gray-400 font-bold">({plan.exercises?.length || 0} exercises)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <button onClick={() => handleRenameSplitDay(plan)} className="p-2 text-gray-500 hover:text-blue-400" title="Rename"><Edit3 size={13} /></button>
                                      <button onClick={() => handleDeleteSplitDay(plan.id)} className="p-2 text-gray-500 hover:text-red-400" title="Delete"><Trash2 size={13} /></button>
                                      <button onClick={() => setActiveSplitEditKey(isExp ? null : dt)} className="p-2 text-gray-500 hover:text-white">{isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                                    </div>
                                  </div>

                                  {isExp && (
                                    <div className="mt-3 bg-[#0d1220] border border-gray-850 p-4 rounded-2xl space-y-4">
                                      {/* Exercises rows */}
                                      {!plan.exercises || plan.exercises.length === 0 ? (
                                        <p className="text-[10px] text-gray-500 italic py-2 text-center">No exercises added. Use search below.</p>
                                      ) : (
                                        <div className="space-y-1.5">
                                          {plan.exercises.map((ex: any, idx: number) => (
                                            <div key={ex.id || idx} className="flex justify-between items-center bg-[#121624] border border-gray-850 rounded-xl p-2.5 text-xs">
                                              <div>
                                                <p className="font-bold text-white">{ex.name}</p>
                                                <p className="text-[9px] text-gray-500 font-black uppercase mt-0.5">{ex.muscle_group}</p>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                  <input 
                                                    type="number" value={ex.sets || 3} min="1"
                                                    onChange={e => handleUpdateExerciseStats(dt, ex.id, parseInt(e.target.value) || 3, ex.rest || 120)}
                                                    className="w-10 bg-[#131b2e] text-white border border-gray-700 rounded text-center text-[10px]"
                                                  />
                                                  <span className="text-[9px] text-gray-500 uppercase font-black">Sets</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <input 
                                                    type="number" value={ex.rest || 120} min="0" step="5"
                                                    onChange={e => handleUpdateExerciseStats(dt, ex.id, ex.sets || 3, parseInt(e.target.value) || 0)}
                                                    className="w-12 bg-[#131b2e] text-white border border-gray-700 rounded text-center text-[10px]"
                                                  />
                                                  <span className="text-[9px] text-gray-500 uppercase font-black">Rest</span>
                                                </div>
                                                <button onClick={() => handleRemoveExerciseFromSplit(dt, ex.id)} className="p-1 text-gray-500 hover:text-red-400"><X size={14} /></button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Search Exercises catalog to insert */}
                                      <div className="border-t border-gray-850 pt-3 space-y-2 relative">
                                        <div className="relative">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                                          <input 
                                            type="text" value={searchExerciseQuery} onChange={e => setSearchExerciseQuery(e.target.value)}
                                            placeholder="Search catalog to add exercise..."
                                            className="w-full bg-[#121624] border border-gray-800 rounded-xl py-2 pl-9 pr-8 text-xs text-white outline-none focus:border-blue-500"
                                          />
                                          {searchExerciseQuery && <button onClick={() => setSearchExerciseQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><X size={12} /></button>}
                                        </div>

                                        {searchExerciseQuery && (
                                          <div className="bg-[#121624] border border-gray-800 rounded-xl overflow-hidden shadow-2xl max-h-[160px] overflow-y-auto">
                                            {filteredCatalog.length === 0 ? (
                                              <p className="text-[10px] text-gray-500 italic p-3 text-center">No exercises found.</p>
                                            ) : (
                                              filteredCatalog.map(ex => (
                                                <button 
                                                  key={ex.id} 
                                                  onClick={() => handleAddExerciseToSplit(dt, ex)}
                                                  className="w-full text-left px-3 py-2 text-xs hover:bg-blue-600/20 flex justify-between border-b border-gray-800/60 last:border-0"
                                                >
                                                  <span className="font-bold text-gray-200">{ex.name}</span>
                                                  <span className="text-[8px] bg-gray-800 border border-gray-700 text-gray-500 font-extrabold px-1.5 py-0.5 rounded uppercase">{ex.muscle_group}</span>
                                                </button>
                                              ))
                                            )}
                                          </div>
                                        )}
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

                    {/* CLIENT TAB: INBODY SCANS */}
                    {clientActiveTab === 'inbody' && (
                      <div className="space-y-6">
                        {/* CSV Import Zone */}
                        <div className="bg-[#121624] border border-gray-850 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between relative overflow-hidden gap-4 shadow-xl">
                          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] pointer-events-none" />
                          <div className="flex-1 text-center sm:text-left z-10">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                              <FileText size={15} className="text-blue-400" /> Bulk Import InBody CSV
                            </h3>
                            <p className="text-[10px] text-gray-400 mt-1">Upload the athlete's exported CSV to sync body composition trends immediately.</p>
                          </div>
                          <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all cursor-pointer shadow-lg active:scale-95 shrink-0 z-10 text-center w-full sm:w-auto">
                            <input
                              type="file" ref={fileInputRef} accept=".csv" className="hidden"
                              onChange={handleCSVUpload} disabled={isImporting}
                            />
                            {isImporting ? 'Importing...' : 'Upload CSV'}
                          </label>
                        </div>

                        {/* Log manual InBody scan */}
                        <div className="bg-[#121624]/30 border border-gray-800 rounded-2xl overflow-hidden">
                          <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/10">
                            <h3 className="text-xs font-black uppercase text-blue-400">Log Manual Scan</h3>
                            <button onClick={() => setShowAddScanForm(!showAddScanForm)} className="text-xs font-black text-blue-400 hover:text-white cursor-pointer flex items-center gap-1">
                              <Plus size={13} /> {showAddScanForm ? 'Cancel' : 'New Scan'}
                            </button>
                          </div>

                          {showAddScanForm && (
                            <form onSubmit={handleAddInBodyScan} className="p-4 space-y-3 bg-[#0a0f1a]">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="text-[8px] text-gray-500 block mb-1 font-bold uppercase">Scan Date</label>
                                  <input type="date" value={newScanDate} onChange={e => setNewScanDate(e.target.value)} required className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-xs text-white" />
                                </div>
                                <div>
                                  <label className="text-[8px] text-gray-500 block mb-1 font-bold uppercase">InBody Score</label>
                                  <input type="number" value={newScanScore} onChange={e => setNewScanScore(parseInt(e.target.value) || 0)} className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-xs text-white text-center font-bold" />
                                </div>
                                <div>
                                  <label className="text-[8px] text-gray-500 block mb-1 font-bold uppercase">Weight (kg)</label>
                                  <input type="number" step="any" required placeholder="e.g. 78.5" value={newScanWeight} onChange={e => setNewScanWeight(e.target.value)} className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-xs text-white" />
                                </div>
                                <div>
                                  <label className="text-[8px] text-gray-500 block mb-1 font-bold uppercase">Body Fat %</label>
                                  <input type="number" step="any" placeholder="e.g. 14.8" value={newScanBfPercent} onChange={e => setNewScanBfPercent(e.target.value)} className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-xs text-white" />
                                </div>
                                <div className="col-span-2 md:col-span-4">
                                  <label className="text-[8px] text-gray-500 block mb-1 font-bold uppercase">Muscle Mass SMM (kg)</label>
                                  <input type="number" step="any" placeholder="e.g. 36.5" value={newScanSmm} onChange={e => setNewScanSmm(e.target.value)} className="w-full bg-[#131b2e] border border-gray-700 rounded-xl p-2.5 text-xs text-white" />
                                </div>
                              </div>
                              <button type="submit" className="w-full bg-blue-600 text-white font-bold text-xs uppercase py-3.5 rounded-xl">Save composition record</button>
                            </form>
                          )}
                        </div>

                        {/* Scans list */}
                        <div className="bg-[#121624]/30 border border-gray-800 rounded-2xl overflow-hidden p-5">
                          <h3 className="text-xs font-black uppercase text-gray-400 border-b border-gray-850 pb-2">Historical Scans timeline ({clientScans.length})</h3>
                          <div className="divide-y divide-gray-850 mt-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                            {clientScans.length === 0 ? (
                              <p className="text-xs text-gray-500 italic py-8 text-center">No InBody scans recorded.</p>
                            ) : (
                              clientScans.map((scan, idx) => {
                                const isExpanded = expandedScanId === scan.id;
                                const prev = idx + 1 < clientScans.length ? clientScans[idx + 1] : null;
                                const seg = scan.segmental || {};

                                return (
                                  <div key={scan.id} className="py-4">
                                    <div className="flex justify-between items-center">
                                      <div className="flex-1 cursor-pointer" onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}>
                                        <p className="text-sm font-black text-white flex items-center gap-1.5">
                                          {new Date(scan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                          {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                          Score: <span className="text-emerald-400 font-black">{scan.score || 75}</span>
                                          {idx === 0 && <span className="ml-2 bg-blue-900/40 text-blue-400 text-[8px] font-black px-1.5 py-0.5 rounded">LATEST</span>}
                                        </p>
                                      </div>
                                      <button onClick={() => handleDeleteScan(scan.id)} className="p-2 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-2 cursor-pointer" onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}>
                                      <div className="bg-[#121624] border border-gray-850 rounded-xl p-3 text-center">
                                        <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Weight</p>
                                        <p className="text-xs font-black text-white">{scan.weight} kg{prev && calculateInBodyDelta(scan.weight, prev.weight, true)}</p>
                                      </div>
                                      <div className="bg-[#121624] border border-gray-850 rounded-xl p-3 text-center">
                                        <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Muscle SMM</p>
                                        <p className="text-xs font-black text-blue-400">{scan.smm} kg{prev && calculateInBodyDelta(scan.smm, prev.smm)}</p>
                                      </div>
                                      <div className="bg-[#121624] border border-gray-850 rounded-xl p-3 text-center">
                                        <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Body Fat</p>
                                        <p className="text-xs font-black text-red-400">{scan.bf_percent}%{prev && calculateInBodyDelta(scan.bf_percent, prev.bf_percent, true)}</p>
                                      </div>
                                    </div>

                                    {isExpanded && (
                                      <div className="border-t border-gray-850 mt-3 pt-3 space-y-4">
                                        <div className="space-y-4 bg-gray-950/20 border border-gray-850 p-4 rounded-2xl">
                                          <div>
                                            <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Activity size={10} /> Muscle-Fat balance</h4>
                                            <div className="grid grid-cols-2 gap-2.5">
                                              <div className="bg-[#121624] p-2 rounded-xl text-xs"><span className="text-gray-500">Skeletal Muscle Mass:</span> <span className="text-white font-black">{scan.smm} kg</span></div>
                                              <div className="bg-[#121624] p-2 rounded-xl text-xs"><span className="text-gray-500">Body Fat Mass:</span> <span className="text-white font-black">{scan.bfm} kg</span></div>
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <h4 className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Droplet size={10} /> Body Composition</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                              <div className="bg-[#121624] p-2 rounded-xl text-center text-xs"><p className="text-gray-500">Water</p><p className="text-white font-black">{seg.tbw || 0}L</p></div>
                                              <div className="bg-[#121624] p-2 rounded-xl text-center text-xs"><p className="text-gray-500">Protein</p><p className="text-white font-black">{seg.protein || 0}kg</p></div>
                                              <div className="bg-[#121624] p-2 rounded-xl text-center text-xs"><p className="text-gray-500">Minerals</p><p className="text-white font-black">{seg.minerals || 0}kg</p></div>
                                            </div>
                                          </div>

                                          <div>
                                            <h4 className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Flame size={10} /> Obesity Evaluator</h4>
                                            <div className="grid grid-cols-2 gap-2.5">
                                              <div className="bg-[#121624] p-2 rounded-xl text-xs"><span className="text-gray-500">Visceral Fat Level:</span> <span className="text-white font-black">{seg.visceralFat || 0}</span></div>
                                              <div className="bg-[#121624] p-2 rounded-xl text-xs"><span className="text-gray-500">BMR calories:</span> <span className="text-white font-black">{scan.bmr} kcal</span></div>
                                            </div>
                                          </div>

                                          <div className="border-t border-gray-800 pt-3">
                                            <SegmentalBodyMap scan={scan} allScans={clientScans} />
                                          </div>
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

                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEPLOY NEW ATHLETE (Stepped Wizard Form) */}
          {activeTab === 'deploy' && (
            <div className="max-w-4xl bg-[#0b0c16] border border-gray-800 rounded-3xl p-8 space-y-6">
              
              <div className="flex justify-between items-start border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Deploy Athlete Setup Wizard</h2>
                  <p className="text-xs text-gray-500 mt-1">Register a client account, initialize dynamic work/rest calorie targets, and deploy split templates.</p>
                </div>
                {deploySuccessData && (
                  <button 
                    onClick={() => { setDeploySuccessData(null); setDeployStep(1); }}
                    className="text-xs font-black text-blue-400 hover:text-white underline cursor-pointer"
                  >
                    Deploy another client
                  </button>
                )}
              </div>

              {deploySuccessData ? (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle size={16} /> Athlete Deployed Successfully!
                  </h3>
                  <p className="text-xs text-gray-400">Share these login details with the athlete to access their custom PWA space:</p>
                  <div className="bg-gray-950/60 p-5 rounded-2xl space-y-2 text-xs font-mono text-gray-300 border border-gray-800/80">
                    <p><span className="text-gray-500">Name:</span> {deploySuccessData.displayName}</p>
                    <p><span className="text-gray-500">Client Code:</span> #{deploySuccessData.clientCode}</p>
                    <p><span className="text-gray-500">Username:</span> {deploySuccessData.username}</p>
                    <p><span className="text-gray-500">Passcode:</span> {deploySuccessData.password}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stepper indicator */}
                  <div className="flex justify-between relative px-2 max-w-lg mx-auto">
                    <div className="absolute top-4 left-6 right-6 h-[2px] bg-gray-850 z-0">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${((deployStep - 1) / (deployStepsInfo.length - 1)) * 100}%` }}
                      />
                    </div>

                    {deployStepsInfo.map((info, idx) => {
                      const isCompleted = deployStep > idx + 1;
                      const isActive = deployStep === idx + 1;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 z-10 relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (idx + 1 > deployStep && (!formData.displayName.trim() || !formData.username.trim() || !formData.password.trim())) {
                                toast.error('Complete basic account fields first.');
                                return;
                              }
                              setDeployStep(idx + 1);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                              isCompleted 
                                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                                : isActive 
                                  ? 'bg-blue-600 border-blue-400 text-white shadow-md scale-110'
                                  : 'bg-[#121620] border-gray-800 text-gray-500'
                            }`}
                          >
                            {isCompleted ? <CheckCircle size={14} /> : info.icon}
                          </button>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {info.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Form step contents */}
                  <div className="bg-[#121624]/30 border border-gray-800 rounded-3xl p-6 min-h-[300px]">
                    
                    {/* STEP 1: IDENTITY */}
                    {deployStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-blue-400 border-b border-gray-800 pb-2">Step 1: Identity &amp; Auth Credentials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Full Name</label>
                            <input 
                              type="text" required value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                              placeholder="e.g. Captain Ahmed"
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Username / Handle</label>
                            <input 
                              type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                              placeholder="e.g. ahmedfit"
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Access Passcode (min 6 chars)</label>
                            <input 
                              type="text" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                              placeholder="e.g. 123456"
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Client Code (Auto-increment or custom)</label>
                            <input 
                              type="text" value={formData.clientCode} onChange={e => setFormData({ ...formData, clientCode: e.target.value })}
                              placeholder="Leave blank to auto-increment"
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Phone Number</label>
                            <input 
                              type="text" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                              placeholder="e.g. +20 123 456789"
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Sex</label>
                            <div className="flex gap-2">
                              <button
                                type="button" onClick={() => setDeployGender('male')}
                                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${deployGender === 'male' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
                              >
                                Male
                              </button>
                              <button
                                type="button" onClick={() => setDeployGender('female')}
                                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${deployGender === 'female' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
                              >
                                Female
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Age</label>
                            <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} placeholder="Years" className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Height (cm)</label>
                            <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} placeholder="Centimeters" className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none" />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <label className="text-[9px] font-black uppercase text-gray-500">Onboarding Experience Level</label>
                            <select value={formData.experience_level} onChange={e => setFormData({ ...formData, experience_level: e.target.value })} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none">
                              <option value="beginner">Beginner (Under 1 Year)</option>
                              <option value="intermediate">Intermediate (1-3 Years)</option>
                              <option value="advanced">Advanced (3+ Years)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Subscription Period</label>
                            <select 
                              value={formData.subscriptionPeriod} 
                              onChange={e => setFormData({ ...formData, subscriptionPeriod: e.target.value })} 
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none font-sans"
                            >
                              <option value="none">No Expiry (Always Active)</option>
                              <option value="2 weeks">2 Weeks (14 Days)</option>
                              <option value="1 month">1 Month (30 Days)</option>
                              <option value="3 months">3 Months (90 Days)</option>
                              <option value="6 months">6 Months (180 Days)</option>
                              <option value="12 months">12 Months (365 Days)</option>
                              <option value="2 years">2 Years (730 Days)</option>
                              <option value="custom">Custom Date &amp; Time (Calendar)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Subscription Start Delay (Days)</label>
                            <input 
                              type="number" 
                              min="0"
                              value={formData.subscriptionStartDelay} 
                              onChange={e => setFormData({ ...formData, subscriptionStartDelay: e.target.value })} 
                              placeholder="e.g. 3 days" 
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none font-sans" 
                            />
                          </div>

                          {formData.subscriptionPeriod === 'custom' && (
                            <div className="space-y-1 col-span-2 mt-1 animate-fadeIn">
                              <label className="text-[9px] font-black uppercase text-indigo-400">Custom End Date &amp; Time (Includes Seconds)</label>
                              <input 
                                type="datetime-local" 
                                step="1"
                                value={formData.customSubscriptionEnd} 
                                onChange={e => setFormData({ ...formData, customSubscriptionEnd: e.target.value })} 
                                className="w-full bg-[#121624] border border-indigo-500/30 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 transition-colors" 
                              />
                            </div>
                          )}
                          <div className="space-y-1 col-span-2">
                            <label className="text-[9px] font-black uppercase text-gray-500">Injuries &amp; Medical Notes</label>
                            <textarea value={formData.injuries_notes} onChange={e => setFormData({ ...formData, injuries_notes: e.target.value })} placeholder="Enter details about any injuries, operations, or medical conditions..." className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none h-20" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: WORKOUTS TEMPLATE PROGRAM */}
                    {deployStep === 2 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                          <h3 className="text-xs font-black uppercase text-blue-400">Step 2: Training template splits ({deploySplits.length} splits)</h3>
                          <div className="flex gap-2">
                            <input 
                              type="text" value={newDeploySplitName} onChange={e => setNewDeploySplitName(e.target.value)}
                              placeholder="E.g. UPPER, ARMS"
                              className="bg-[#121624] border border-gray-800 rounded-lg px-2.5 py-1 text-[10px] text-white outline-none uppercase font-bold"
                            />
                            <button onClick={addDeploySplit} className="bg-blue-600 text-white text-[10px] px-3.5 py-1 rounded-lg uppercase font-bold">+ Day</button>
                          </div>
                        </div>

                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                          {deploySplits.map(split => {
                            const isExp = deployActiveSplitKey === split.key;
                            return (
                              <div key={split.key} className="bg-[#121624]/60 border border-gray-800 rounded-2xl overflow-hidden" style={{ borderLeft: `4px solid ${split.color}` }}>
                                <div onClick={() => setDeployActiveSplitKey(isExp ? null : split.key)} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-800/10 transition-all">
                                  <div>
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">{split.label} Split Day</p>
                                    <p className="text-[10px] text-gray-500 font-bold">{split.exercises?.length || 0} exercises planned</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); removeDeploySplit(split.key); }} className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={14} /></button>
                                    <span className="text-[10px] bg-gray-900 border border-gray-850 text-gray-400 px-2 py-1 rounded font-bold uppercase">{isExp ? 'Close' : 'Edit'}</span>
                                  </div>
                                </div>

                                {isExp && (
                                  <div className="p-3.5 bg-black/10 border-t border-gray-850 space-y-3">
                                    {/* Exercises in split */}
                                    {split.exercises.length === 0 ? (
                                      <p className="text-[10px] text-gray-500 italic py-2 text-center">No exercises. Search catalog below.</p>
                                    ) : (
                                      <div className="space-y-1.5">
                                        {split.exercises.map((ex: any, idx: number) => (
                                          <div key={ex.id || idx} className="flex justify-between items-center bg-[#121624] border border-gray-800 p-2.5 rounded-xl text-xs">
                                            <div>
                                              <p className="font-bold text-white">{ex.name}</p>
                                              <p className="text-[9px] text-gray-500 font-black uppercase mt-0.5">{ex.muscle_group}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <span className="text-[10px] text-purple-400 font-extrabold">{ex.sets} sets x {ex.rest}s rest</span>
                                              <button onClick={() => handleRemoveExerciseFromDeploySplit(split.key, ex.id)} className="p-1 text-gray-500 hover:text-red-400"><X size={14} /></button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Exercise catalog search inside deploy wizard split */}
                                    <div className="border-t border-gray-800 pt-3 relative">
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                                        <input 
                                          type="text" value={searchExerciseQuery} onChange={e => setSearchExerciseQuery(e.target.value)}
                                          placeholder="Search exercises to add to split..."
                                          className="w-full bg-[#121624] border border-gray-800 rounded-xl py-2 pl-9 pr-8 text-xs text-white outline-none"
                                        />
                                        {searchExerciseQuery && <button onClick={() => setSearchExerciseQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><X size={12} /></button>}
                                      </div>

                                      {searchExerciseQuery && (
                                        <div className="bg-[#121624] border border-gray-800 rounded-xl overflow-hidden shadow-2xl z-55 max-h-[140px] overflow-y-auto">
                                          {filteredDeployCatalog.length === 0 ? (
                                            <p className="text-[10px] text-gray-500 italic p-3 text-center">No exercises found</p>
                                          ) : (
                                            filteredDeployCatalog.map(ex => (
                                              <button 
                                                key={ex.id} 
                                                onClick={() => {
                                                  handleAddExerciseToDeploySplit(split.key, ex);
                                                  setSearchExerciseQuery('');
                                                }}
                                                className="w-full text-left px-3 py-2.5 text-xs hover:bg-blue-600/20 flex justify-between border-b border-gray-850"
                                              >
                                                <span className="font-bold text-gray-200">{ex.name}</span>
                                                <span className="text-[8px] bg-gray-800 border border-gray-700 text-gray-500 font-extrabold px-1.5 py-0.5 rounded uppercase">{ex.muscle_group}</span>
                                              </button>
                                            ))
                                          )}
                                        </div>
                                      )}
                                    </div>

                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: DIET & NUTRITION GOALS */}
                    {deployStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-blue-400 border-b border-gray-800 pb-2">Step 3: Baseline &amp; Rest Day nutrition macros</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Training Day macros */}
                          <div className="bg-[#121624] border border-gray-850 p-4 rounded-2xl space-y-3.5">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Baseline Training Day Goals</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Calories (kcal)</label>
                                <input type="number" value={deployKcal} onChange={e => setDeployKcal(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Protein (g)</label>
                                <input type="number" value={deployProtein} onChange={e => setDeployProtein(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Carbs (g)</label>
                                <input type="number" value={deployCarbs} onChange={e => setDeployCarbs(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Fat (g)</label>
                                <input type="number" value={deployFat} onChange={e => setDeployFat(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 uppercase font-black">Daily Hydration Goal (Liters)</label>
                              <input type="number" step="0.1" value={deployWaterGoalLiters} onChange={e => setDeployWaterGoalLiters(parseFloat(e.target.value) || 0)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white" />
                            </div>
                          </div>

                          {/* Rest day overrides */}
                          <div className="bg-[#121624] border border-gray-850 p-4 rounded-2xl space-y-3.5 relative">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rest Day Target Override</h4>
                              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-blue-400 font-bold select-none">
                                <input 
                                  type="checkbox" checked={deployIsRestOverridden} onChange={e => setDeployIsRestOverridden(e.target.checked)}
                                  className="rounded border-gray-800 text-blue-600 bg-gray-900 focus:ring-0"
                                />
                                Override Auto
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Calories (kcal)</label>
                                <input type="number" disabled={!deployIsRestOverridden} value={deployRestKcal} onChange={e => setDeployRestKcal(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] disabled:bg-gray-900 border border-gray-800 rounded-xl p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Protein (g)</label>
                                <input type="number" disabled={!deployIsRestOverridden} value={deployRestProtein} onChange={e => setDeployRestProtein(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] disabled:bg-gray-900 border border-gray-800 rounded-xl p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Carbs (g)</label>
                                <input type="number" disabled={!deployIsRestOverridden} value={deployRestCarbs} onChange={e => setDeployRestCarbs(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] disabled:bg-gray-900 border border-gray-800 rounded-xl p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Fat (g)</label>
                                <input type="number" disabled={!deployIsRestOverridden} value={deployRestFat} onChange={e => setDeployRestFat(parseInt(e.target.value) || 0)} className="w-full bg-[#121624] disabled:bg-gray-900 border border-gray-800 rounded-xl p-2 text-xs text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: BIOMETRICS & INBODY INITIALIZATION */}
                    {deployStep === 4 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-blue-400 border-b border-gray-800 pb-2">Step 4: Initial Biometrics Scan &amp; CSV upload</h3>
                        
                        {/* CSV Import */}
                        <div className="bg-[#121624] border border-gray-850 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5"><FileText size={13} className="text-blue-400" /> Import Historical InBody CSV</h4>
                            <p className="text-[9px] text-gray-400 mt-1">Upload the athlete's exported file to pre-populate scan charts.</p>
                          </div>
                          <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                            <input type="file" accept=".csv" className="hidden" onChange={handleDeployCSVUpload} />
                            Upload CSV File
                          </label>
                        </div>

                        <div className="border-t border-gray-850 pt-3">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Or enter manual baseline scan stats:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="text-[9px] text-gray-500 block uppercase font-black mb-1">Weight (kg)</label>
                              <input type="number" step="any" placeholder="e.g. 78.5" value={deployWeight} onChange={e => setDeployWeight(e.target.value)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block uppercase font-black mb-1">Body Fat %</label>
                              <input type="number" step="any" placeholder="e.g. 14.2" value={deployBfPercent} onChange={e => setDeployBfPercent(e.target.value)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block uppercase font-black mb-1">Muscle SMM (kg)</label>
                              <input type="number" step="any" placeholder="e.g. 36.1" value={deploySmm} onChange={e => setDeploySmm(e.target.value)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block uppercase font-black mb-1">InBody Score</label>
                              <input type="number" placeholder="75" value={deployInbodyScore} onChange={e => setDeployInbodyScore(parseInt(e.target.value) || 75)} className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white text-center font-bold" />
                            </div>
                          </div>
                        </div>

                        {deployCsvScans.length > 0 && (
                          <div className="bg-emerald-950/10 border border-emerald-500/20 p-3.5 rounded-xl">
                            <p className="text-[10px] text-emerald-400 font-bold">✓ Ready to insert {deployCsvScans.length} historical scans from CSV on account deployment.</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Deploy wizard action buttons */}
                  <div className="flex justify-between items-center gap-4 bg-gray-950/20 p-4 border border-gray-800 rounded-2xl">
                    <button 
                      onClick={() => { if (deployStep > 1) setDeployStep(prev => prev - 1); }} 
                      disabled={deployStep === 1}
                      className="px-4 py-2.5 bg-gray-900 border border-gray-850 hover:border-gray-700 disabled:opacity-50 text-gray-400 hover:text-white rounded-xl text-xs uppercase font-black"
                    >
                      Back Step
                    </button>
                    {deployStep < 4 ? (
                      <button 
                        onClick={() => {
                          if (deployStep === 1 && (!formData.displayName.trim() || !formData.username.trim() || !formData.password.trim())) {
                            toast.error('Complete basic account credentials fields.');
                            return;
                          }
                          setDeployStep(prev => prev + 1);
                        }}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs uppercase font-black"
                      >
                        Next Step
                      </button>
                    ) : (
                      <button 
                        onClick={handleDeployAthlete} 
                        disabled={deployLoading}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs uppercase font-black shadow-lg shadow-blue-500/20"
                      >
                        {deployLoading ? 'Deploying...' : 'Deploy Athlete'}
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB: ATHLETE CONTROL */}
          {activeTab === 'management' && (
            <div className="space-y-8 max-w-5xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Athlete Control Center</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage athlete access, security credentials, quotas, and feature permissions.</p>
                </div>
                
                {/* Select Client Dropdown */}
                <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Athlete:</span>
                  <select
                    value={managementSelectedClientId}
                    onChange={e => setManagementSelectedClientId(e.target.value)}
                    className="bg-transparent text-xs font-black text-white outline-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0b0c16]">Select client...</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#0b0c16]">
                        {c.display_name} (@{c.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!managementClientProfile ? (
                <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-12 text-center text-gray-500">
                  <p className="text-sm font-bold">No Client Selected or Loaded</p>
                  <p className="text-xs text-gray-400 mt-2">Please select an athlete from the dropdown above to load management controls.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Column 1: Credentials & Subscription */}
                  <div className="space-y-6">
                    {/* Card 1: Credentials & Status */}
                    <Card className="p-6 space-y-6 bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                    <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                        <Shield size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase text-yellow-500">Security &amp; Account Status</h3>
                        <p className="text-[10px] text-gray-500">Suspend access, update passcodes, or delete the profile.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Current Status Info */}
                      <div className="flex justify-between items-center bg-gray-900/40 p-3.5 border border-gray-850 rounded-2xl">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Account Access</p>
                          <p className="text-xs font-black text-white mt-1">
                            {managementClientProfile.user?.targets?.is_deactivated === true ? '🚨 SUSPENDED' : '✓ ACTIVE ACCESS'}
                          </p>
                        </div>
                        <button
                          onClick={handleToggleManagementSuspension}
                          disabled={managementUpdatingSuspension}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 cursor-pointer ${
                            managementClientProfile.user?.targets?.is_deactivated === true
                              ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/25 text-white'
                              : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {managementUpdatingSuspension ? 'Updating...' : (managementClientProfile.user?.targets?.is_deactivated === true ? 'Reactivate' : 'Suspend')}
                        </button>
                      </div>

                      {/* Password Reset */}
                      <form onSubmit={handleUpdateManagementPassword} className="bg-gray-900/40 p-3.5 border border-gray-850 rounded-2xl space-y-3">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Reset Access Passcode</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={managementNewPassword}
                            onChange={e => setManagementNewPassword(e.target.value)}
                            placeholder="New passcode (Min 6 chars)"
                            className="flex-1 bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                          />
                          <button
                            type="submit"
                            disabled={managementUpdatingPassword || !managementNewPassword.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                          >
                            Update
                          </button>
                        </div>
                        {managementClientProfile.generated_passcode && (
                          <p className="text-[9px] text-gray-500">
                            Current passcode in database: <span className="text-yellow-500 font-mono font-bold">{managementClientProfile.generated_passcode}</span>
                          </p>
                        )}
                      </form>

                      {/* Wipe/Delete */}
                      <div className="bg-red-950/5 border border-red-950/20 p-4 rounded-2xl space-y-3">
                        <h4 className="text-[10px] text-red-400 font-black uppercase">Dangerous Actions</h4>
                        <p className="text-[9px] text-red-400/60 leading-relaxed">
                          Permanently delete the user's login, workouts list, InBody scans, and nutrition logs. This cannot be undone.
                        </p>
                        <button
                          onClick={handleDeleteManagementClient}
                          className="w-full bg-red-650 hover:bg-red-650 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <Trash2 size={13} /> Complete Cascade Wipe
                        </button>
                      </div>
                    </div>
                  </Card>

                  {/* Subscription Details & Expiry Management */}
                  <Card className="p-6 space-y-6 bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                    <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Clock size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase text-indigo-400 font-sans">Subscription &amp; Validity</h3>
                        <p className="text-[10px] text-gray-500 font-sans">Monitor validity ranges, delay starts, or extend client subscription plans.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Current Subscription Status */}
                      <div 
                        onClick={() => setShowDetailedSubscriptionTime(!showDetailedSubscriptionTime)}
                        className="bg-gray-900/40 p-3.5 border border-gray-850 rounded-2xl cursor-pointer hover:border-gray-700 transition-all select-none"
                      >
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Plan Duration</p>
                        <p className="text-xs font-black text-white mt-1">
                          {managementClientProfile.user?.targets?.subscription_duration 
                            ? managementClientProfile.user.targets.subscription_duration.toUpperCase()
                            : 'NO EXPIRY (UNLIMITED)'}
                        </p>
                        
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-3">Time Remaining</p>
                        <p className="text-xs font-bold text-indigo-400 mt-1 flex items-center gap-1">
                          {(() => {
                            const targets = managementClientProfile.user?.targets || {};
                            if (!targets.subscription_start_date || !targets.subscription_end_date) {
                              return 'Unlimited access';
                            }
                            const now = new Date();
                            const start = new Date(targets.subscription_start_date);
                            const end = new Date(targets.subscription_end_date);
                            
                            if (now < start) {
                              const diffMs = start.getTime() - now.getTime();
                              const formatted = formatTimeLeft(diffMs, showDetailedSubscriptionTime);
                              return `Pending (Starts in ${formatted})`;
                            } else if (now >= end) {
                              return 'Expired (Access Suspended)';
                            } else {
                              const diffMs = end.getTime() - now.getTime();
                              const formatted = formatTimeLeft(diffMs, showDetailedSubscriptionTime);
                              return `${formatted} remaining`;
                            }
                          })()}
                        </p>
                        <p className="text-[8px] text-gray-550 italic mt-1.5">
                          {showDetailedSubscriptionTime ? 'Click to show simple countdown' : 'Click to show exact details (years, months, days, minutes)'}
                        </p>
                      </div>

                      {/* Update Subscription Plan Form */}
                      <div className="bg-[#121624]/40 p-4 border border-gray-850 rounded-2xl space-y-4">
                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Update Client Subscription</label>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] text-gray-500 font-bold uppercase">Duration</label>
                            <select 
                              value={editSubscriptionPeriod} 
                              onChange={e => setEditSubscriptionPeriod(e.target.value)} 
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                            >
                              <option value="none">No Expiry</option>
                              <option value="2 weeks">2 Weeks</option>
                              <option value="1 month">1 Month</option>
                              <option value="3 months">3 Months</option>
                              <option value="6 months">6 Months</option>
                              <option value="12 months">12 Months</option>
                              <option value="2 years">2 Years</option>
                              <option value="custom">Custom Date &amp; Time (Calendar)</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] text-gray-500 font-bold uppercase">Start Delay (Days)</label>
                            <input 
                              type="number" 
                              min="0"
                              value={editSubscriptionDelay} 
                              onChange={e => setEditSubscriptionDelay(e.target.value)} 
                              placeholder="e.g. 0" 
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white outline-none" 
                            />
                          </div>

                          {editSubscriptionPeriod === 'custom' && (
                            <div className="space-y-1 col-span-2 mt-1 animate-fadeIn">
                              <label className="text-[8px] text-indigo-400 font-bold uppercase">Custom End Date &amp; Time (Includes Seconds)</label>
                              <input 
                                type="datetime-local" 
                                step="1"
                                value={editCustomSubscriptionEnd} 
                                onChange={e => setEditCustomSubscriptionEnd(e.target.value)} 
                                className="w-full bg-[#121624] border border-indigo-500/30 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-colors" 
                              />
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleUpdateSubscription}
                          disabled={updatingSubscriptionState}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                          {updatingSubscriptionState ? 'Updating Plan...' : 'Save Subscription Plan'}
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Column 2: Feature Toggles */}
                <div className="space-y-6">
                  {/* Card 2: Feature Toggles */}
                  <Card className="p-6 space-y-6 bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                    <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Activity size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase text-indigo-400">Feature Access Toggles</h3>
                        <p className="text-[10px] text-gray-500">Enable or disable specific features inside the athlete PWA workspace.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {([
                        { key: 'disable_workout_templates', label: 'Hide Workout Templates', desc: 'Removes templates & programs button for clients.' },
                        { key: 'disable_nutrition_targets', label: 'Hide Nutrition Targets', desc: 'Removes daily targets setup menu for clients.' },
                      ] as const).map(({ key, label, desc }) => {
                        const isHidden = !!managementClientProfile.user?.targets?.[key];
                        return (
                          <div key={key} className="flex items-center justify-between bg-gray-900/40 p-4 border border-gray-850 rounded-2xl gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white">{label}</p>
                              <p className="text-[9px] text-gray-500 mt-0.5 leading-normal">{desc}</p>
                            </div>
                            <button
                              onClick={() => handleToggleManagementFeature(key, isHidden)}
                              disabled={managementUpdatingFeatures}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                                isHidden
                                  ? 'bg-red-950/20 border-red-900/25 text-red-400'
                                  : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {isHidden ? 'HIDDEN' : 'VISIBLE'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>


                  {/* Card 3: AI Quota & Global usage stats (Col Span 2) */}
                  <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-[#0c1020] to-[#0d1222] space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase text-blue-400">AI Coach Assistant Quota &amp; usage statistics</h3>
                        <p className="text-[10px] text-gray-500">Configure client message limits and view system-wide dashboard aggregate totals.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Individual limit config */}
                      <div className="bg-gray-900/40 border border-gray-850 p-4 rounded-2xl flex flex-col justify-between gap-4">
                        <div>
                          <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Configure Individual Quota</h4>
                          <p className="text-[9px] text-gray-400 mt-0.5">Set the maximum daily message limit for this athlete.</p>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={managementAiQuotaInput}
                            onChange={e => setManagementAiQuotaInput(parseInt(e.target.value) || 0)}
                            className="flex-1 bg-[#121624] border border-gray-850 rounded-xl p-2.5 text-xs text-white text-center font-bold"
                          />
                          <button
                            onClick={handleSaveManagementQuota}
                            disabled={managementUpdatingQuota}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                          >
                            Set Limit
                          </button>
                        </div>
                        <p className="text-[9px] text-gray-500 font-medium">
                          Active Daily limit: <span className="text-blue-400 font-black">{managementClientProfile.user?.targets?.ai_quota_limit ?? 20} messages</span>
                        </p>
                      </div>

                      {/* Global AI quota indicator */}
                      {(() => {
                        const todayStr = getLocalDateString();
                        let totalAiToday = 0;
                        profiles.forEach(p => {
                          if (p.targets?.ai_usage?.date === todayStr) {
                            totalAiToday += p.targets.ai_usage.count || 0;
                          }
                        });
                        const limit = 1500;
                        const remaining = Math.max(0, limit - totalAiToday);
                        const pct = Math.min((totalAiToday / limit) * 100, 100);

                        return (
                          <div className="bg-gray-900/40 border border-gray-850 p-4 rounded-2xl flex flex-col justify-between gap-4">
                            <div>
                              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">System-Wide Quota (Today)</h4>
                              <p className="text-[9px] text-gray-400 mt-0.5">Total API queries processed across all dashboard clients.</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs font-black text-gray-300">
                                <span>{totalAiToday} messages</span>
                                <span className="text-blue-400">{remaining} remaining</span>
                              </div>
                              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <p className="text-[8px] text-gray-500 text-right">Aggregate Limit: 1500 / day</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </Card>

                </div>
              )}
            </div>
          )}

          {/* TAB 5: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center bg-[#0c1020]/40 p-6 border border-gray-850 rounded-3xl">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="text-blue-500" /> Subscriptions Manager
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Track statuses, expiration countdowns, and manage reactivations for all athletes.
                  </p>
                </div>
              </div>

              {/* Status Stats Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const now = new Date();
                  const total = clientsList.length;
                  let active = 0;
                  let suspendedOrExpired = 0;

                  clientsList.forEach((c: any) => {
                    const targets = c.targets || {};
                    const isDeactivated = targets.is_deactivated === true;
                    const isExpired = targets.subscription_end_date && now >= new Date(targets.subscription_end_date);
                    if (isDeactivated || isExpired) {
                      suspendedOrExpired++;
                    } else {
                      active++;
                    }
                  });

                  return (
                    <>
                      <Card className="p-5 flex items-center gap-4 bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Tracked Clients</p>
                          <p className="text-xl font-black text-white mt-0.5">{total}</p>
                        </div>
                      </Card>
                      
                      <Card className="p-5 flex items-center gap-4 bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <CheckCircle size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Client Access</p>
                          <p className="text-xl font-black text-emerald-400 mt-0.5">{active}</p>
                        </div>
                      </Card>

                      <Card className="p-5 flex items-center gap-4 bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Suspended / Expired</p>
                          <p className="text-xl font-black text-red-400 mt-0.5">{suspendedOrExpired}</p>
                        </div>
                      </Card>
                    </>
                  );
                })()}
              </div>

              {/* Clients Table Card */}
              <Card className="p-6 bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-850 text-[10px] uppercase tracking-wider text-gray-500 font-black">
                        <th className="pb-3.5 pl-2">Athlete</th>
                        <th className="pb-3.5">Subscription Tier</th>
                        <th className="pb-3.5">Started At</th>
                        <th className="pb-3.5">Expires At</th>
                        <th className="pb-3.5">Status</th>
                        <th className="pb-3.5 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850/60 text-xs">
                      {clientsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-550">
                            No clients deployed under your account.
                          </td>
                        </tr>
                      ) : (
                        clientsList.map((c: any) => {
                          const targets = c.targets || {};
                          const now = new Date();
                          const isDeactivated = targets.is_deactivated === true;
                          const isExpired = targets.subscription_end_date && now >= new Date(targets.subscription_end_date);
                          const isPending = targets.subscription_start_date && now < new Date(targets.subscription_start_date);
                          
                          let statusLabel = 'ACTIVE';
                          let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                          if (isDeactivated) {
                            statusLabel = 'SUSPENDED';
                            statusColor = 'text-red-400 bg-red-500/10 border-red-500/20';
                          } else if (isExpired) {
                            statusLabel = 'EXPIRED';
                            statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                          } else if (isPending) {
                            statusLabel = 'PENDING';
                            statusColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                          }

                          return (
                            <tr key={c.id} className="hover:bg-gray-900/20 transition-colors">
                              <td className="py-4 pl-2 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/25 flex items-center justify-center font-black text-xs text-blue-400 uppercase">
                                  {c.full_name?.substring(0, 2) || 'AT'}
                                </div>
                                <div>
                                  <p className="font-black text-white">{c.full_name}</p>
                                  <p className="text-[9px] text-gray-500 lowercase mt-0.5">{c.email}</p>
                                </div>
                              </td>
                              <td className="py-4 font-bold text-gray-400">
                                {targets.subscription_duration || 'No Expiry'}
                              </td>
                              <td className="py-4 text-gray-500">
                                {targets.subscription_start_date ? new Date(targets.subscription_start_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4 text-gray-500">
                                {targets.subscription_end_date ? new Date(targets.subscription_end_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColor}`}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="py-4 text-right pr-2">
                                {(isDeactivated || isExpired) ? (
                                  <button
                                    onClick={() => {
                                      setReactivateClientId(c.id);
                                      setReactivateClientName(c.full_name || 'Client');
                                      setReactivatePeriod('1 month');
                                      setReactivateDelay('0');
                                      setReactivateModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/25 transition-all cursor-pointer"
                                  >
                                    Re-activate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      // Switch to management tab and select client
                                      setManagementSelectedClientId(c.id);
                                      fetchManagementClientDetails(c.id);
                                      setActiveTab('management');
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-400 bg-gray-900/60 border border-gray-800 hover:text-white hover:border-gray-700 transition-all cursor-pointer"
                                  >
                                    Manage Settings
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: SYSTEM CONSOLE */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              {/* Header warning if not Owner */}
              {coachUserId && coachUserId !== OWNER_ID && (
                <div className="bg-red-950/20 border border-red-900/30 p-5 rounded-3xl flex items-start gap-4 max-w-2xl mx-auto mt-8">
                  <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={24} />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Access Restricted</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      You are logged in as a standard coach account. Only the system owner has access to view other coaches, inspect their clients, and reassign athletes.
                    </p>
                  </div>
                </div>
              )}

              {coachUserId === OWNER_ID && (
                <div className="flex gap-6 h-[calc(100vh-140px)] items-stretch">
                  
                  {/* Left Column: Coaches List */}
                  <div className="w-[320px] flex flex-col gap-4 bg-[#0b0c16] border border-gray-800 rounded-3xl p-4 shrink-0">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                        <input 
                          type="text"
                          value={coachSearchQuery}
                          onChange={e => setCoachSearchQuery(e.target.value)}
                          placeholder="Search coaches..."
                          className="w-full bg-[#121624] border border-gray-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSystemSelectedCoachId(null);
                          setIsRegisteringNewCoach(true);
                        }}
                        className={`p-2.5 rounded-xl border text-white transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95 ${
                          isRegisteringNewCoach && !systemSelectedCoachId
                            ? 'bg-blue-600/20 border-blue-500'
                            : 'bg-[#121624] border-gray-800 hover:border-gray-700'
                        }`}
                        title="Register New Coach"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
                      {filteredSystemCoaches.map(coach => {
                        const isDeact = coach.targets?.is_deactivated === true;
                        const coachClients = profiles.filter(p => p.role === 'client' && p.coach_id === coach.id);
                        const isSelf = coach.id === OWNER_ID;
                        return (
                          <button
                            key={coach.id}
                            type="button"
                            onClick={() => {
                              setSystemSelectedCoachId(systemSelectedCoachId === coach.id ? null : coach.id);
                              setIsRegisteringNewCoach(false);
                            }}
                            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                              systemSelectedCoachId === coach.id 
                                ? 'bg-blue-600/10 border-blue-500/50' 
                                : 'bg-[#121624]/40 border-gray-850/80 hover:border-gray-750'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-xs uppercase ${
                              isSelf ? 'bg-indigo-900/40 text-indigo-300' : 'bg-blue-900/40 text-blue-300'
                            }`}>
                              {coach.display_name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                {coach.display_name || 'Unnamed Coach'}
                                {isSelf && <span className="text-[7px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-1 rounded uppercase tracking-wider font-mono">Owner</span>}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate">@{coach.username || 'no-username'}</p>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                              <span className="text-[10px] font-black text-gray-300">{coachClients.length} clients</span>
                              {!isSelf && (
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                  isDeact ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {isDeact ? 'SUSPENDED' : 'ACTIVE'}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {filteredSystemCoaches.length === 0 && (
                        <p className="text-xs text-gray-500 italic text-center py-12">No coaches found.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Coach Dossier & Analytics */}
                  <div className="flex-1 bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 overflow-y-auto no-scrollbar relative flex flex-col justify-start">
                    
                    {isRegisteringNewCoach && !selectedCoachProfile ? (
                      <div className="space-y-6">
                        <div className="border-b border-gray-800 pb-4">
                          <h2 className="text-lg font-black text-white flex items-center gap-2">
                            <UserPlus className="text-blue-500" size={20} /> Register New Coach Account
                          </h2>
                          <p className="text-xs text-gray-500 mt-1">Fill out the credentials below to register a new coach user login on the platform.</p>
                        </div>

                        {createdNewCoachCredentials ? (
                          <div className="bg-emerald-950/20 border border-emerald-500/25 p-6 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 text-emerald-400">
                              <CheckCircle size={18} />
                              <span className="text-xs font-black uppercase tracking-wider">Coach Registered Successfully!</span>
                            </div>
                            <p className="text-xs text-gray-400">Please provide the new coach with their login details:</p>
                            <div className="bg-gray-900/60 p-4 rounded-2xl space-y-2 text-xs font-mono border border-gray-800">
                              <p className="text-gray-400">Name: <span className="text-white font-bold">{createdNewCoachCredentials.name}</span></p>
                              <p className="text-gray-400">Email: <span className="text-white font-bold">{createdNewCoachCredentials.email}</span></p>
                              <p className="text-gray-400">Password: <span className="text-white font-bold">{createdNewCoachCredentials.password}</span></p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCreatedNewCoachCredentials(null);
                                setIsRegisteringNewCoach(false);
                              }}
                              className="w-full bg-[#121624] hover:bg-gray-850 text-white font-black text-xs uppercase py-3 rounded-2xl transition-all cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleCreateNewCoach} className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Coach Display Name</label>
                              <input
                                type="text"
                                value={newCoachName}
                                onChange={e => setNewCoachName(e.target.value)}
                                placeholder="e.g. Coach John Doe"
                                className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Coach Email Address</label>
                              <input
                                type="email"
                                value={newCoachEmail}
                                onChange={e => setNewCoachEmail(e.target.value)}
                                placeholder="e.g. coach@striderite.com"
                                className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Login Password</label>
                              <input
                                type="text"
                                value={newCoachPassword}
                                onChange={e => setNewCoachPassword(e.target.value)}
                                placeholder="Choose a secure password"
                                className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                                required
                              />
                            </div>

                            <div className="flex gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => setIsRegisteringNewCoach(false)}
                                className="flex-1 bg-transparent border border-gray-800 text-gray-400 hover:bg-gray-900 text-xs font-black uppercase py-3 rounded-2xl transition-all cursor-pointer text-center"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isCreatingNewCoach}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase py-3 rounded-2xl transition-all cursor-pointer disabled:bg-gray-800"
                              >
                                {isCreatingNewCoach ? 'Registering...' : 'Register Coach'}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ) : !selectedCoachProfile ? (
                      <div className="h-full flex-1 flex flex-col justify-center items-center text-center text-gray-500 space-y-4 py-16">
                        <Shield size={48} className="text-gray-700" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">No Coach Selected</p>
                          <p className="text-xs max-w-[280px] leading-relaxed mx-auto">Select a coach profile from the directory on the left to view active managed clients, inspect platform metrics, or reassign users.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsRegisteringNewCoach(true)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase px-4 py-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 mx-auto"
                        >
                          <UserPlus size={14} /> Register Coach Account
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        
                        {/* Dossier Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center font-black text-base uppercase">
                              {selectedCoachProfile.display_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <h2 className="text-lg font-black text-white flex items-center gap-2">
                                {selectedCoachProfile.display_name}
                                {selectedCoachProfile.id === OWNER_ID && (
                                  <span className="text-[9px] bg-indigo-500/20 border border-indigo-500/25 text-indigo-400 px-2 py-0.5 rounded font-black tracking-normal uppercase">
                                    System Owner
                                  </span>
                                )}
                              </h2>
                              <p className="text-xs text-gray-500">Handle: @{selectedCoachProfile.username || 'no-username'} | Email: {selectedCoachProfile.email || 'no-email'}</p>
                            </div>
                          </div>

                          {selectedCoachProfile.id !== OWNER_ID && (
                            <button
                              onClick={() => handleToggleCoachSuspension(selectedCoachProfile.id, selectedCoachProfile.targets?.is_deactivated === true)}
                              disabled={updatingCoachStatus}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 cursor-pointer ${
                                selectedCoachProfile.targets?.is_deactivated === true 
                                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/25 text-white' 
                                  : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                              }`}
                            >
                              {updatingCoachStatus ? 'Updating...' : (selectedCoachProfile.targets?.is_deactivated === true ? 'Reactivate Coach' : 'Suspend Coach')}
                            </button>
                          )}
                        </div>

                        {/* Analytics Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="p-5 flex flex-col gap-1 relative overflow-hidden bg-[#121624]/60">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Clients Managed</p>
                            <p className="text-3xl font-black text-white mt-1.5">{selectedCoachClients.length}</p>
                          </Card>
                          <Card className="p-5 flex flex-col gap-1 relative overflow-hidden bg-[#121624]/60">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Athletes</p>
                            <p className="text-3xl font-black text-emerald-400 mt-1.5">
                              {selectedCoachClients.filter(c => c.targets?.is_deactivated !== true).length}
                            </p>
                          </Card>
                          <Card className="p-5 flex flex-col gap-1 relative overflow-hidden bg-[#121624]/60">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Suspended Athletes</p>
                            <p className="text-3xl font-black text-red-400 mt-1.5">
                              {selectedCoachClients.filter(c => c.targets?.is_deactivated === true).length}
                            </p>
                          </Card>
                        </div>

                        {/* Interactive Client re-assignment list */}
                        <div className="bg-[#121624]/30 border border-gray-800 rounded-2xl p-5 space-y-4">
                          <div className="border-b border-gray-850 pb-2 flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-wide text-blue-400">Assigned Clients &amp; Re-assignment</h3>
                            <span className="text-[10px] text-gray-500 font-bold">{selectedCoachClients.length} users</span>
                          </div>

                          <div className="divide-y divide-gray-850 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                            {selectedCoachClients.length === 0 ? (
                              <p className="text-xs text-gray-500 italic py-12 text-center">No athletes assigned to this coach.</p>
                            ) : (
                              selectedCoachClients.map(client => {
                                const selectedDestCoachId = reassignCoachTargetId[client.id] || '';
                                return (
                                  <div key={client.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div>
                                      <p className="font-extrabold text-white">{client.display_name || 'Unnamed Client'}</p>
                                      <p className="text-[10px] text-gray-500">@{client.username}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={selectedDestCoachId}
                                        onChange={e => setReassignCoachTargetId(prev => ({ ...prev, [client.id]: e.target.value }))}
                                        className="bg-[#131b2e] border border-gray-700 rounded-xl px-2 py-1.5 text-[10px] text-white outline-none font-bold"
                                      >
                                        <option value="" disabled>Select destination coach...</option>
                                        {systemCoaches
                                          .filter(c => c.id !== selectedCoachProfile.id)
                                          .map(c => (
                                            <option key={c.id} value={c.id}>Move to {c.display_name}</option>
                                          ))
                                        }
                                      </select>
                                      <button
                                        onClick={() => handleReassignClient(client.id, selectedDestCoachId)}
                                        disabled={!selectedDestCoachId}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                                      >
                                        Move
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                  
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* COMPLETED WORKOUT RECEIPT DIALOG MODAL */}
      {selectedReceiptWorkout && (
        <GymReceipt 
          stats={selectedReceiptWorkout}
          onClose={() => setSelectedReceiptWorkout(null)}
        />
      )}

      {/* REACTIVATE SUBSCRIPTION DIALOG MODAL */}
      {reactivateModalOpen && (
        <div className="fixed inset-0 bg-[#05050b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1220] border border-gray-800 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <CreditCard size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Reactivate Subscription
                </h3>
                <p className="text-[10px] text-gray-500">For {reactivateClientName}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Duration selection */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">Subscription Period</label>
                <select 
                  value={reactivatePeriod} 
                  onChange={e => setReactivatePeriod(e.target.value)} 
                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="none">No Expiry (Lifetime)</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="1 month">1 Month</option>
                  <option value="3 months">3 Months</option>
                  <option value="6 months">6 Months</option>
                  <option value="12 months">12 Months</option>
                  <option value="2 years">2 Years</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>

              {reactivatePeriod === 'custom' && (
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Custom Expiration Date</label>
                  <input 
                    type="datetime-local" 
                    value={reactivateCustomEnd} 
                    onChange={e => setReactivateCustomEnd(e.target.value)} 
                    className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              )}

              {/* Start Date Delay Selection */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">Start Date Delay</label>
                <select 
                  value={reactivateDelay} 
                  onChange={e => setReactivateDelay(e.target.value)} 
                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="0">Immediately (Today)</option>
                  <option value="1">1 Day Delay</option>
                  <option value="3">3 Days Delay</option>
                  <option value="7">7 Days Delay</option>
                  <option value="14">14 Days Delay</option>
                </select>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-3.5 space-y-2">
                <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-wider">Calculated Access Schedule</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                  <div>
                    <span className="text-gray-500">Starts:</span>{' '}
                    {(() => {
                      const delayDays = parseInt(reactivateDelay) || 0;
                      const start = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);
                      return start.toLocaleDateString();
                    })()}
                  </div>
                  <div>
                    <span className="text-gray-500">Expires:</span>{' '}
                    {(() => {
                      if (reactivatePeriod === 'none') return 'Never (Lifetime)';
                      const delayDays = parseInt(reactivateDelay) || 0;
                      const start = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);
                      if (reactivatePeriod === 'custom') {
                        return reactivateCustomEnd ? new Date(reactivateCustomEnd).toLocaleDateString() : 'N/A';
                      }
                      let durationMs = 0;
                      if (reactivatePeriod === '2 weeks') durationMs = 14 * 24 * 60 * 60 * 1000;
                      else if (reactivatePeriod === '1 month') durationMs = 30 * 24 * 60 * 60 * 1000;
                      else if (reactivatePeriod === '3 months') durationMs = 90 * 24 * 60 * 60 * 1000;
                      else if (reactivatePeriod === '6 months') durationMs = 180 * 24 * 60 * 60 * 1000;
                      else if (reactivatePeriod === '12 months') durationMs = 365 * 24 * 60 * 60 * 1000;
                      else if (reactivatePeriod === '2 years') durationMs = 730 * 24 * 60 * 60 * 1000;
                      return new Date(start.getTime() + durationMs).toLocaleDateString();
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setReactivateModalOpen(false)}
                className="flex-1 bg-gray-900 border border-gray-850 hover:border-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveReactivation}
                disabled={reactivateSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                {reactivateSaving ? 'Saving...' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNSAVED CHANGES WARNING DIALOG MODAL */}
      {unsavedChangesPendingAction && (
        <div className="fixed inset-0 bg-[#05050b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1220] border border-gray-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 text-yellow-500">
              ⚠️ Unsaved Nutrition Changes
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              You have modified this athlete's nutrition targets but have not saved them yet. Do you want to save them now, discard the changes, or cancel navigation?
            </p>
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={async () => {
                  await handleSaveTargets();
                  const action = unsavedChangesPendingAction;
                  setUnsavedChangesPendingAction(null);
                  executePendingAction(action);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Save &amp; Continue
              </button>
              <button 
                onClick={() => {
                  const action = unsavedChangesPendingAction;
                  setUnsavedChangesPendingAction(null);
                  resetTargetsToDb();
                  executePendingAction(action);
                }}
                className="w-full bg-gray-900 border border-gray-850 hover:border-gray-800 text-gray-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Discard Changes
              </button>
              <button 
                onClick={() => setUnsavedChangesPendingAction(null)}
                className="w-full bg-transparent hover:bg-gray-900/40 text-gray-500 hover:text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
