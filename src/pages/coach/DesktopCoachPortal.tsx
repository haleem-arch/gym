import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  Users, User, UserPlus, UserX, Database, ShieldAlert, Activity, Search, Filter, Bell,
  Trash2, Shield, ChevronRight, Scale, Ruler, Calendar, 
  Dumbbell, Save, UserCheck, Apple, CheckCircle, RefreshCw,
  ChevronLeft, Plus, X, Edit3, Droplets, Clock, Droplet, Flame, 
  ChevronDown, ChevronUp, FileText, Settings, Sparkles, LogOut, Crown, ArrowUpCircle,
  CreditCard, AlertTriangle, History, Key, Eye, EyeOff, Copy, Check,
  DollarSign, TrendingUp, PieChart, Lock, Phone, Mail, ShieldCheck,
  ArrowRight, Maximize, Minimize, WifiOff, Lightbulb, Star
} from 'lucide-react';
import { Card } from '../../components/Card';
import { DumbbellLoader } from '../../components/DumbbellLoader';
import { SegmentalBodyMap } from '../../components/SegmentalBodyMap';
import { GymReceipt } from '../../components/GymReceipt';
import { FAKE_CLIENTS, getMockClientProfile, getMockClientData } from '../../utils/mockTutorialData';
import ConfirmationModal from '../../components/ConfirmationModal';

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

const calculateActiveDays = (targets: any): number => {
  if (!targets) return 0;
  
  if (Array.isArray(targets.subscription_history) && targets.subscription_history.length > 0) {
    let totalDays = 0;
    targets.subscription_history.forEach((entry: any) => {
      if (entry.start_date && entry.end_date) {
        const start = new Date(entry.start_date);
        const end = new Date(entry.end_date);
        if (end > start) {
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalDays += diffDays;
        }
      }
    });
    if (totalDays > 0) return totalDays;
  }

  if (targets.subscription_start_date && targets.subscription_end_date) {
    const start = new Date(targets.subscription_start_date);
    const end = new Date(targets.subscription_end_date);
    if (end > start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  return 0;
};

const getWeekStart = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const getWeekDays = (dateStr: string) => {
  const weekStart = getWeekStart(dateStr);
  const start = new Date(weekStart);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
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

const formatDateTime = (dateString: string | Date) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return String(dateString);
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

function formatDayTypeLabel(dayType: string, totalVolume: number) {
  if (totalVolume > 0) {
    return `${totalVolume} kg`;
  }
  if (!dayType) return 'Rest';
  const upper = dayType.toUpperCase();
  if (upper === 'RUN') return 'Run';
  if (upper === 'REST') return 'Rest';
  if (upper === 'RUN + GYM' || upper === 'RUN/GYM' || upper === 'RUN_GYM' || (upper.includes('RUN') && (upper.includes('GYM') || upper.includes('PUSH') || upper.includes('PULL') || upper.includes('LEGS')))) {
    return 'Run / Gym';
  }
  return dayType.charAt(0).toUpperCase() + dayType.slice(1).toLowerCase();
}

const isRunningInElectron = typeof window !== 'undefined' && (!!(window as any).electronAPI || navigator.userAgent.includes('Electron'));

export default function DesktopCoachPortal() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'deploy' | 'management' | 'system' | 'subscriptions' | 'profile' | 'financials'>('overview');
  const [financialsSearchQuery, setFinancialsSearchQuery] = useState('');
  const [financialsStatusFilter, setFinancialsStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
  const [planPrices, setPlanPrices] = useState<Record<string, string>>({
    '2 weeks': '2,000 EGP',
    '1 month': '3,500 EGP',
    '3 months': '8,500 EGP',
    '6 months': '14,000 EGP'
  });
  const [editPrices2Weeks, setEditPrices2Weeks] = useState('2,000');
  const [editPrices1Month, setEditPrices1Month] = useState('3,500');
  const [editPrices3Months, setEditPrices3Months] = useState('8,500');
  const [editPrices6Months, setEditPrices6Months] = useState('14,000');
  const [updatingPlanPrices, setUpdatingPlanPrices] = useState(false);
  const [coachUserId, setCoachUserId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotCoach, setIsNotCoach] = useState(false);

  // Profile Card Toggles
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

    // Feedback States
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'feedback' | 'bug'>('feedback');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccessShow, setFeedbackSuccessShow] = useState(false);
  const [lastFeedbackTime, setLastFeedbackTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('coach_last_feedback_time');
    return saved ? parseInt(saved, 10) : null;
  });
  const [lockMinutesLeft, setLockMinutesLeft] = useState(0);

  useEffect(() => {
    if (!lastFeedbackTime) return;
    const updateLock = () => {
      const diff = Date.now() - lastFeedbackTime;
      const ONE_HOUR = 60 * 60 * 1000;
      if (diff < ONE_HOUR) {
        setLockMinutesLeft(Math.ceil((ONE_HOUR - diff) / 60000));
      } else {
        setLockMinutesLeft(0);
      }
    };
    updateLock();
    const interval = setInterval(updateLock, 10000);
    return () => clearInterval(interval);
  }, [lastFeedbackTime]);

  // Lists & DB Data
  const [profiles, setProfiles] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [dbHealthy, setDbHealthy] = useState<boolean>(true);

  // Athletes Analytics Report Modal State
  const [showAthletesAnalytics, setShowAthletesAnalytics] = useState(false);
  const [analyticsAges, setAnalyticsAges] = useState<Record<string, number>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Live Feed
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [recentDiets, setRecentDiets] = useState<any[]>([]);
  const [refreshingFeed, setRefreshingFeed] = useState(false);
  const [feedFilterMineOnly, setFeedFilterMineOnly] = useState(false);
  const feedFilterMineOnlyRef = useRef(feedFilterMineOnly);
  useEffect(() => {
    feedFilterMineOnlyRef.current = feedFilterMineOnly;
  }, [feedFilterMineOnly]);

  // Athlete Directory Filter
  const [directoryFilterMineOnly, setDirectoryFilterMineOnly] = useState(false);

  // Guided Tutorial States
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1); // 1: Welcome, 2: Spotlight, 3: First Action Prompt
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isTutorialModeActive, setIsTutorialModeActive] = useState(false);
  const [isSimulatingDeployment, setIsSimulatingDeployment] = useState(false);
  const [simulatedDeployedClient, setSimulatedDeployedClient] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && coachUserId) {
      const completed = localStorage.getItem(`lifegym_tutorial_completed_${coachUserId}`);
      if (!completed) {
        setIsTutorialModeActive(true);
        setShowTutorial(true);
        setTutorialStep(1);
        setSpotlightIndex(0);
      }
    }
  }, [loading, coachUserId]);

  // Fullscreen state and listeners
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Instant Offline Reconnect state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Electron App Update State
  const [updateStatus, setUpdateStatus] = useState<{
    available: boolean;
    checking: boolean;
    downloading: boolean;
    progress: number;
    version?: string;
    error?: string;
  }>({
    available: false,
    checking: false,
    downloading: false,
    progress: 0,
  });

  useEffect(() => {
    const checkUpdate = async () => {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI) return;

      try {
        setUpdateStatus(prev => ({ ...prev, checking: true }));
        const currentVersion = await electronAPI.getAppVersion();
        const response = await fetch('/app-version.json?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to fetch version catalog');
        const data = await response.json();
        
        if (data.version && data.version !== currentVersion) {
          setUpdateStatus({
            available: true,
            checking: false,
            downloading: false,
            progress: 0,
            version: data.version
          });
        } else {
          setUpdateStatus(prev => ({ ...prev, checking: false }));
        }
      } catch (err) {
        console.error('Failed to check for updates:', err);
        setUpdateStatus(prev => ({ ...prev, checking: false }));
      }
    };

    checkUpdate();
  }, []);

  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI) return;

    const unsubscribeProgress = electronAPI.onUpdateProgress((progress: number) => {
      setUpdateStatus(prev => ({
        ...prev,
        progress: progress,
        downloading: true,
        error: undefined
      }));
    });

    const unsubscribeError = electronAPI.onUpdateError((err: string) => {
      setUpdateStatus(prev => ({
        ...prev,
        error: err,
        downloading: false
      }));
    });

    return () => {
      if (unsubscribeProgress) unsubscribeProgress();
      if (unsubscribeError) unsubscribeError();
    };
  }, []);

  const handleStartUpdate = async () => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI) return;

    try {
      setUpdateStatus(prev => ({ ...prev, downloading: true, progress: 0, error: undefined }));
      const response = await fetch('/app-version.json?t=' + Date.now());
      const data = await response.json();
      electronAPI.downloadAndInstallUpdate(data.url);
    } catch (err: any) {
      setUpdateStatus(prev => ({ ...prev, downloading: false, error: err.message }));
    }
  };

  // Selected Client (Clients Tab)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientProfile, setSelectedClientProfile] = useState<any | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [loadingClientDetails, setLoadingClientDetails] = useState(false);

  // Client sub-tabs layout
  const [clientActiveTab, setClientActiveTab] = useState<'overview' | 'diet' | 'water' | 'workouts' | 'inbody' | 'history'>('overview');
  const [clientActiveDateStr, setClientActiveDateStr] = useState<string>(() => getLocalDateString());
  const [myCoachProfile, setMyCoachProfile] = useState<any | null>(null);

  // Client daily data records (for selected date and client)
  const [clientDietLog, setClientDietLog] = useState<any>(null);
  const [clientMeals, setClientMeals] = useState<any[]>([]);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [clientWaterLogs, setClientWaterLogs] = useState<any[]>([]);
  const [clientWorkoutsList, setClientWorkoutsList] = useState<any[]>([]);
  const [clientScans, setClientScans] = useState<any[]>([]);
  const [clientWorkoutPlans, setClientWorkoutPlans] = useState<any[]>([]);
  const [exerciseDb, setExerciseDb] = useState<any[]>([]);

  // Weekly schedule states
  const [clientActiveSchedule, setClientActiveSchedule] = useState<any | null>(null);

  // Unified history state variables
  const [clientHistoryWorkouts, setClientHistoryWorkouts] = useState<any[]>([]);
  const [clientHistoryDiets, setClientHistoryDiets] = useState<any[]>([]);
  const [clientHistoryWater, setClientHistoryWater] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedReceiptDiet, setSelectedReceiptDiet] = useState<any | null>(null);
  const [selectedReceiptDietMeals, setSelectedReceiptDietMeals] = useState<any[]>([]);
  const [loadingReceiptDietMeals, setLoadingReceiptDietMeals] = useState(false);

  // Exercise catalog search in training tab
  const [searchExerciseQuery, setSearchExerciseQuery] = useState('');
  const [activeSplitEditKey, setActiveSplitEditKey] = useState<string | null>(null);

  // Dialog/modal states
  const [selectedReceiptWorkout, setSelectedReceiptWorkout] = useState<any>(null);
  const [showAddScanForm, setShowAddScanForm] = useState(false);
  const [expandedScanId, setExpandedScanId] = useState<string | null>(null);


  const [coachSuspensionReason, setCoachSuspensionReason] = useState('Your subscription to the coaching platform has ended. Please renew your plan to reactivate access.');
  const [coachCountdownText, setCoachCountdownText] = useState('');
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [coachSubPeriod, setCoachSubPeriod] = useState('1 month');
  const [showCoachWarningBanner, setShowCoachWarningBanner] = useState(false);
  const [coachSubDelay, setCoachSubDelay] = useState('0');
  const [coachSubIsFreeTrial, setCoachSubIsFreeTrial] = useState(false);
  const [coachSubCustomEnd, setCoachSubCustomEnd] = useState(getLocalDateTimeString());
  const [updatingCoachSub, setUpdatingCoachSub] = useState(false);
  
  const [registerCoachSubPeriod, setRegisterCoachSubPeriod] = useState('1 month');
  const [registerCoachSubDelay, setRegisterCoachSubDelay] = useState('0');
  const [registerCoachSubIsFreeTrial, setRegisterCoachSubIsFreeTrial] = useState(false);
  const [registerCoachSubCustomEnd, setRegisterCoachSubCustomEnd] = useState(getLocalDateTimeString());

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
  const [managementSearchQuery, setManagementSearchQuery] = useState('');
  const [managementClientProfile, setManagementClientProfile] = useState<any | null>(null);
  const [managementNewPassword, setManagementNewPassword] = useState('');
  const [managementUpdatingPassword, setManagementUpdatingPassword] = useState(false);
  const [managementUpdatingSuspension, setManagementUpdatingSuspension] = useState(false);
  const [managementUpdatingFeatures, setManagementUpdatingFeatures] = useState(false);
  const [deletingClient, setDeletingClient] = useState(false);
  const [editSubscriptionPeriod, setEditSubscriptionPeriod] = useState('1 month');
  const [editSubscriptionDelay, setEditSubscriptionDelay] = useState('0');
  const [editCustomSubscriptionEnd, setEditCustomSubscriptionEnd] = useState(getLocalDateTimeString());
  const [showDetailedSubscriptionTime, setShowDetailedSubscriptionTime] = useState(false);
  const [updatingSubscriptionState, setUpdatingSubscriptionState] = useState(false);

  // Edit Profile details states for Athlete Control
  const [editClientDisplayName, setEditClientDisplayName] = useState('');
  const [editClientContactEmail, setEditClientContactEmail] = useState('');
  const [editClientPhoneNumber, setEditClientPhoneNumber] = useState('');
  const [updatingProfileDetails, setUpdatingProfileDetails] = useState(false);

  // Profile settings password updating state
  const [ownNewPassword, setOwnNewPassword] = useState('');
  const [ownConfirmPassword, setOwnConfirmPassword] = useState('');
  const [updatingOwnPassword, setUpdatingOwnPassword] = useState(false);
  // Coach WhatsApp Phone Number states
  const [ownWhatsAppNumber, setOwnWhatsAppNumber] = useState('');
  const [savingWhatsAppNumber, setSavingWhatsAppNumber] = useState(false);
  
  const [hasPrefilledSettings, setHasPrefilledSettings] = useState(false);

  // Coach Subscription Renewal Flow states
  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);
  const [subOverlayPlan, setSubOverlayPlan] = useState('1 month');
  const [subOverlayMethod, setSubOverlayMethod] = useState('wallet');
  const [subOverlayPhone, setSubOverlayPhone] = useState('');
  const [subOverlayTeldaUser, setSubOverlayTeldaUser] = useState('');
  const [subOverlayScreenshot, setSubOverlayScreenshot] = useState('');
  const [subOverlayTermsChecked, setSubOverlayTermsChecked] = useState(false);
  const [subOverlayRefundChecked, setSubOverlayRefundChecked] = useState(false);
  const [subOverlaySubmitting, setSubOverlaySubmitting] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // History ledger modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Custom styled prompt modal states
  const [customPromptOpen, setCustomPromptOpen] = useState(false);
  const [customPromptTitle, setCustomPromptTitle] = useState('');
  const [customPromptMessage, setCustomPromptMessage] = useState('');
  const [customPromptValue, setCustomPromptValue] = useState('');
  const [customPromptPlaceholder, setCustomPromptPlaceholder] = useState('');
  const [customPromptCallback, setCustomPromptCallback] = useState<((val: string | null) => void) | null>(null);

  const showPrompt = (title: string, message: string, defaultValue: string, placeholder: string, callback: (val: string | null) => void) => {
    setCustomPromptTitle(title);
    setCustomPromptMessage(message);
    setCustomPromptValue(defaultValue);
    setCustomPromptPlaceholder(placeholder);
    setCustomPromptCallback(() => callback);
    setCustomPromptOpen(true);
  };

  // Custom styled confirm modal states
  const [customConfirmOpen, setCustomConfirmOpen] = useState(false);
  const [customConfirmTitle, setCustomConfirmTitle] = useState('');
  const [customConfirmMessage, setCustomConfirmMessage] = useState('');
  const [customConfirmVariant, setCustomConfirmVariant] = useState<'danger' | 'warning' | 'info' | 'success'>('info');
  const [customConfirmCallback, setCustomConfirmCallback] = useState<(() => void) | null>(null);
  
  const showConfirm = (
    title: string,
    message: string,
    variant: 'danger' | 'warning' | 'info' | 'success',
    callback: () => void
  ) => {
    setCustomConfirmTitle(title);
    setCustomConfirmMessage(message);
    setCustomConfirmVariant(variant);
    setCustomConfirmCallback(() => callback);
    setCustomConfirmOpen(true);
  };

  // Subscriptions Tab Reactivation Modal state
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
  const [reactivateClientId, setReactivateClientId] = useState<string | null>(null);
  const [reactivateClientName, setReactivateClientName] = useState('');
  const [reactivatePeriod, setReactivatePeriod] = useState('1 month');
  const [reactivateDelay, setReactivateDelay] = useState('0');
  const [reactivateCustomEnd, setReactivateCustomEnd] = useState(getLocalDateTimeString());
  const [reactivateSaving, setReactivateSaving] = useState(false);
  const [selectedSubClient, setSelectedSubClient] = useState<any | null>(null);
  const [selectedSystemCoach, setSelectedSystemCoach] = useState<any | null>(null);

  // Coach Reactivation Modal state
  const [coachReactivateModalOpen, setCoachReactivateModalOpen] = useState(false);
  const [coachReactivateId, setCoachReactivateId] = useState<string | null>(null);
  const [coachReactivateName, setCoachReactivateName] = useState('');
  const [coachReactivatePeriod, setCoachReactivatePeriod] = useState('1 month');
  const [coachReactivateDelay, setCoachReactivateDelay] = useState('0');
  const [coachReactivateCustomEnd, setCoachReactivateCustomEnd] = useState(getLocalDateTimeString());
  const [coachReactivateIsFreeTrial, setCoachReactivateIsFreeTrial] = useState(false);
  const [coachReactivateSaving, setCoachReactivateSaving] = useState(false);

  // Search queries
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Coach portal login suspension check
  const [isCoachSuspended, setIsCoachSuspended] = useState(false);

  // System Tab - Coach Management refactored states
  const [coachSearchQuery, setCoachSearchQuery] = useState('');
  const [reassignCoachTargetId, setReassignCoachTargetId] = useState<Record<string, string>>({});
  const [updatingCoachStatus, setUpdatingCoachStatus] = useState(false);
  const [isDeletingCoach, setIsDeletingCoach] = useState(false);
  const [isRegisteringNewCoach, setIsRegisteringNewCoach] = useState(false);
  const [newCoachName, setNewCoachName] = useState('');
  const [newCoachEmail, setNewCoachEmail] = useState('');
  const [newCoachPassword, setNewCoachPassword] = useState('');
  const [newCoachPhoneNumber, setNewCoachPhoneNumber] = useState('');
  const [newCoachContactEmail, setNewCoachContactEmail] = useState('');
  const [isCreatingNewCoach, setIsCreatingNewCoach] = useState(false);
  const [createdNewCoachCredentials, setCreatedNewCoachCredentials] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyField = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Deploy Athlete Multi-step Wizard
  const [deployStep, setDeployStep] = useState(1);
  const [deployLoading, setDeployLoading] = useState(false);
  const [deploySuccessData, setDeploySuccessData] = useState<any | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    password: '',
    clientCode: '',
    contactEmail: '',
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
  const [deployGender, setDeployGender] = useState<'male' | 'female' | null>(null);

  const [attemptedStep1Submit, setAttemptedStep1Submit] = useState(false);
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [isClientCodeChecking, setIsClientCodeChecking] = useState(false);
  const [isClientCodeTaken, setIsClientCodeTaken] = useState(false);

  // Helper to clean usernames by removing spaces and dots
  const cleanUsername = (val: string) => {
    return val.replace(/[\s.]/g, '').toLowerCase();
  };

  // Real-time checks for client username availability
  useEffect(() => {
    const usernameVal = formData.username.trim().toLowerCase();
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
  }, [formData.username]);

  // Real-time checks for client code availability
  useEffect(() => {
    const codeVal = formData.clientCode.trim();
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
  }, [formData.clientCode]);

  const isStep1Valid = () => {
    return (
      formData.displayName.trim() !== '' &&
      formData.username.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.contactEmail.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim()) &&
      formData.phoneNumber.trim() !== '' &&
      formData.age.trim() !== '' &&
      formData.height.trim() !== '' &&
      formData.subscriptionStartDelay.trim() !== '' &&
      (formData.subscriptionPeriod !== 'custom' || formData.customSubscriptionEnd.trim() !== '') &&
      !isUsernameTaken &&
      !isClientCodeTaken &&
      deployGender !== null
    );
  };
  
  // Deploy Wizard Split template state
  const [deploySplits, setDeploySplits] = useState<any[]>([
    { 
      key: 'PUSH', 
      label: 'Push', 
      emoji: '🔴',
      color: '#ef4444', 
      exercises: [
        { id: 'dp-push-0', name: 'Incline DB Bench Press (45 Degree)', muscle_group: 'Chest', sets: 3, rest: 120 },
        { id: 'dp-push-1', name: 'DB Shoulder Press (seated neutral)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
        { id: 'dp-push-2', name: 'Incline DB Y-Raise (20-30 Degree)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
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
        { id: 'dp-legs-4', name: '45 Degree Back Extension (BW/DB)', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
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

  useEffect(() => {
    if (showTutorial && spotlightIndex === 1 && activeTab === 'deploy' && deployStep === 2) {
      const timer = setTimeout(() => {
        setDeployActiveSplitKey('PUSH');
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [showTutorial, spotlightIndex, activeTab, deployStep]);

  // Synchronize layout active tab, step, and selection with spotlightIndex
  useEffect(() => {
    if (showTutorial && tutorialStep === 2) {
      if (spotlightIndex >= 0 && spotlightIndex <= 3) {
        if (activeTab !== 'deploy') {
          setActiveTab('deploy');
        }
        const targetStep = spotlightIndex + 1;
        if (deployStep !== targetStep) {
          setDeployStep(targetStep as 1 | 2 | 3 | 4);
        }
      } else if (spotlightIndex >= 4 && spotlightIndex <= 9) {
        if (activeTab !== 'clients') {
          setActiveTab('clients');
        }
        if (selectedClientId !== 'fake_deployed_thor') {
          fetchClientDetails('fake_deployed_thor', true);
        }
        const subTabs = ['overview', 'diet', 'water', 'workouts', 'inbody', 'history'] as const;
        const targetSubTab = subTabs[spotlightIndex - 4];
        if (clientActiveTab !== targetSubTab) {
          handleClientSubTabClick(targetSubTab, true);
        }
      } else if (spotlightIndex === 10) {
        if (activeTab !== 'management') {
          setActiveTab('management');
        }
        if (managementSelectedClientId !== 'fake_deployed_thor') {
          setManagementSelectedClientId('fake_deployed_thor');
          fetchManagementClientDetails('fake_deployed_thor');
        }
      }
    }
  }, [showTutorial, tutorialStep, spotlightIndex, activeTab, deployStep, selectedClientId, clientActiveTab, managementSelectedClientId]);

  useEffect(() => {
    if (showTutorial && tutorialStep === 2) {
      const updateRect = () => {
        // If the warning dialog is open, focus on it!
        const modalEl = document.getElementById('tutorial-unsaved-modal');
        if (modalEl) {
          const rect = modalEl.getBoundingClientRect();
          setSpotlightRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
          return;
        }

        // If a receipt modal is open, focus on it!
        const receiptEl = document.getElementById('tutorial-receipt-modal');
        if (receiptEl) {
          const rect = receiptEl.getBoundingClientRect();
          setSpotlightRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
          return;
        }

        const stepIds = [
          'tutorial-deploy-container',       // 0: Deploy Identity
          'tutorial-deploy-container',       // 1: Deploy Workouts
          'tutorial-deploy-container',       // 2: Deploy Nutrition
          'tutorial-deploy-container',       // 3: Deploy Biometrics
          'tutorial-client-tabs-container',  // 4: Overview
          'tutorial-client-tabs-container',  // 5: Diet
          'tutorial-client-tabs-container',  // 6: Water
          'tutorial-client-tabs-container',  // 7: Workouts
          'tutorial-client-tabs-container',  // 8: InBody
          'tutorial-client-tabs-container',  // 9: History
          'tutorial-management-container'    // 10: Athlete Control
        ];
        const id = stepIds[spotlightIndex];
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Constrain top to be below header or screen top
          const top = Math.max(0, rect.top);
          // Constrain height so the highlight box never goes off the bottom of the screen
          const maxHeight = window.innerHeight - top - 24; 
          const height = Math.min(rect.height, maxHeight);
          
          setSpotlightRect({
            top: top,
            left: rect.left,
            width: rect.width,
            height: height
          });
        } else {
          setSpotlightRect(null);
        }
      };

      const timer = setTimeout(updateRect, 100);
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect, true);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect, true);
      };
    } else {
      setSpotlightRect(null);
    }
  }, [showTutorial, tutorialStep, spotlightIndex, activeTab, clientActiveTab, selectedClientId, deployStep, managementSelectedClientId, unsavedChangesPendingAction, selectedReceiptDiet, selectedReceiptWorkout]);



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

  // Enforce security block on system and financials tabs for standard coaches
  useEffect(() => {
    if ((activeTab === 'system' || activeTab === 'financials') && coachUserId && coachUserId !== OWNER_ID) {
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

  useEffect(() => {
    fetchFeedData();

    // Subscribe to real-time updates for workouts and diet_logs to update coach feed dynamically
    const channelId = `coach-feed-channel-${Date.now()}-${Math.random()}`;
    const subscription = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts' }, () => {
        fetchFeedData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diet_logs' }, () => {
        fetchFeedData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [feedFilterMineOnly]);

  // Coach subscription warning and free trial countdown timer
  useEffect(() => {
    if (!myCoachProfile || coachUserId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c') {
      setShowCoachWarningBanner(false);
      return;
    }

    const endDateStr = myCoachProfile.targets?.subscription_end_date;
    if (!endDateStr) {
      setShowCoachWarningBanner(false);
      return;
    }

    const updateCountdown = () => {
      const nowVal = new Date().getTime();
      const endVal = new Date(endDateStr).getTime();
      const diffVal = endVal - nowVal;

      if (diffVal <= 0) {
        setCoachCountdownText('Expired');
        setShowCoachWarningBanner(false);
        return;
      }

      const daysVal = Math.floor(diffVal / (24 * 60 * 60 * 1000));
      const hoursVal = Math.floor((diffVal % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutesVal = Math.floor((diffVal % (60 * 60 * 1000)) / (60 * 1000));
      const secondsVal = Math.floor((diffVal % (60 * 1000)) / 1000);

      const timeStr = `${daysVal}d ${hoursVal}h ${minutesVal}m ${secondsVal}s`;
      setCoachCountdownText(timeStr);

      const trial = myCoachProfile.targets?.is_free_trial === true || myCoachProfile.targets?.subscription_status === 'trial';
      setIsTrialActive(trial);

      // Warning banner is displayed for Free Trials OR if subscription is under 7 days (7 * 24 * 3600 * 1000)
      const isUnder7Days = diffVal < 7 * 24 * 60 * 60 * 1000;
      if (trial || isUnder7Days) {
        setShowCoachWarningBanner(true);
      } else {
        setShowCoachWarningBanner(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [myCoachProfile, coachUserId]);

  // Prefill own WhatsApp number
  useEffect(() => {
    if (myCoachProfile && !hasPrefilledSettings) {
      if (myCoachProfile.targets?.phone_number) {
        setOwnWhatsAppNumber(String(myCoachProfile.targets.phone_number));
      }
      setHasPrefilledSettings(true);
    }
  }, [myCoachProfile, hasPrefilledSettings]);

  const handleSaveWhatsAppNumber = async () => {
    if (!coachUserId) return;
    try {
      setSavingWhatsAppNumber(true);
      const currentTargets = myCoachProfile?.targets || {};
      const updatedTargets = {
        ...currentTargets,
        phone_number: ownWhatsAppNumber.trim()
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', coachUserId);

      if (error) throw error;

      toast.success('WhatsApp contact number updated successfully.');
      // Refresh local profile
      setMyCoachProfile((prev: any) => ({
        ...prev,
        targets: updatedTargets
      }));
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update WhatsApp number: ' + err.message);
    } finally {
      setSavingWhatsAppNumber(false);
    }
  };

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
        .select('role, targets, email, username, display_name, created_at')
        .eq('id', session.user.id)
        .maybeSingle();

      if (myProfile) {
        myProfile.email = myProfile.email || session.user.email;
        myProfile.targets = myProfile.targets || {};
        
        // Auto-initialize 2-week free trial if not set for coach accounts
        if (myProfile.role === 'coach' && !myProfile.targets.subscription_end_date) {
          const start = myProfile.created_at ? new Date(myProfile.created_at) : new Date();
          const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
          myProfile.targets.subscription_start_date = start.toISOString();
          myProfile.targets.subscription_end_date = end.toISOString();
          myProfile.targets.trial_end_date = end.toISOString();
          myProfile.targets.is_free_trial = true;
          myProfile.targets.subscription_status = 'trial';
          myProfile.targets.subscription_plan = '2_weeks';
          
          try {
            await supabase
              .from('profiles')
              .update({ targets: myProfile.targets })
              .eq('id', session.user.id);
          } catch (updateErr) {
            console.error('Failed to auto-persist 2-week free trial targets:', updateErr);
          }
        }
      }
      setMyCoachProfile(myProfile);

      // Fetch plan prices configuration from Owner's targets.plan_prices
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('targets')
        .eq('id', OWNER_ID)
        .maybeSingle();
      const ownerPlanPrices = ownerProfile?.targets?.plan_prices || null;
      if (ownerPlanPrices) {
        setPlanPrices(ownerPlanPrices);
        if (session.user.id === OWNER_ID) {
          setEditPrices2Weeks(ownerPlanPrices['2 weeks']?.replace(/[^0-9]/g, '') || '2,000');
          setEditPrices1Month(ownerPlanPrices['1 month']?.replace(/[^0-9]/g, '') || '3,500');
          setEditPrices3Months(ownerPlanPrices['3 months']?.replace(/[^0-9]/g, '') || '8,500');
          setEditPrices6Months(ownerPlanPrices['6 months']?.replace(/[^0-9]/g, '') || '14,000');
        }
      }

      if (myProfile?.role !== 'coach' && session.user.id !== OWNER_ID) {
        setIsNotCoach(true);
        if (!silent) setLoading(false);
        return;
      }

      // Check if coach is suspended or subscription is expired/not-started (Owner cannot be suspended)
      const nowObj = new Date();
      const myTargets = myProfile?.targets || {};
      const isDeactivated = myTargets.is_deactivated === true;
      const isExpired = myTargets.subscription_end_date && nowObj >= new Date(myTargets.subscription_end_date);
      const isPending = myTargets.subscription_start_date && nowObj < new Date(myTargets.subscription_start_date);

      if (session.user.id !== OWNER_ID && (isDeactivated || isExpired || isPending)) {
        setIsCoachSuspended(true);
        let reason = 'Your subscription to the coaching platform has ended. Please renew your plan to reactivate access.';
        if (isExpired) {
          reason = 'Your subscription to the coaching platform has ended. Please renew your plan to reactivate access.';
        } else if (isPending) {
          reason = `Your coach subscription starts on ${new Date(myTargets.subscription_start_date).toLocaleDateString()}.`;
        }
        setCoachSuspensionReason(reason);
        if (!silent) setLoading(false);
        return;
      } else {
        setIsCoachSuspended(false);
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
      
      let activeUid = coachUserId;
      if (!activeUid) {
        const { data: { session } } = await supabase.auth.getSession();
        activeUid = session?.user?.id || '';
      }
      if (!activeUid) {
        setRefreshingFeed(false);
        return;
      }
      
      const isOwner = activeUid === OWNER_ID;
      const shouldFilter = !isOwner || feedFilterMineOnlyRef.current;

      let workoutsQuery = supabase
        .from('workouts')
        .select('id, user_id, date, day_type, total_volume, duration, name, notes')
        .eq('status', 'completed')
        .order('date', { ascending: false });

      let dietLogsQuery = supabase
        .from('diet_logs')
        .select('id, user_id, date, daily_totals')
        .order('date', { ascending: false });

      if (shouldFilter) {
        // Fetch only clients belonging to this coach
        const { data: myClients } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'client')
          .eq('coach_id', activeUid);
        const myClientIds = myClients?.map(c => c.id) || [];
        
        if (myClientIds.length > 0) {
          workoutsQuery = workoutsQuery.in('user_id', myClientIds);
          dietLogsQuery = dietLogsQuery.in('user_id', myClientIds);
        } else {
          setRecentWorkouts([]);
          setRecentDiets([]);
          setRefreshingFeed(false);
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
      console.error('Error fetching live activity feed:', err);
    } finally {
      setRefreshingFeed(false);
    }
  };

  const handleOpenAnalytics = async () => {
    setShowAthletesAnalytics(true);
    setLoadingAnalytics(true);
    try {
      const clientIds = clientsList.map(c => c.id);
      if (clientIds.length > 0) {
        const { data: cpData } = await supabase
          .from('client_profiles')
          .select('user_id, age')
          .in('user_id', clientIds);
        
        if (cpData) {
          const agesMap: Record<string, number> = {};
          cpData.forEach(item => {
            if (item.age) agesMap[item.user_id] = item.age;
          });
          setAnalyticsAges(agesMap);
        }
      }
    } catch (err) {
      console.error('Error loading analytics ages:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleExportAnalyticsCsv = () => {
    const athletes = feedFilterMineOnly
      ? clientsList.filter(c => c.coach_id === coachUserId)
      : clientsList;

    const headers = [
      'Client Code',
      'Display Name',
      'Username',
      'Email',
      'Gender',
      'Age',
      'Subscription Plan',
      'Subscription End Date',
      'Status'
    ];
    
    const rows = athletes.map(c => {
      const age = analyticsAges[c.id] || 'Not Set';
      let duration = c.targets?.subscription_duration || 'custom';
      const expDate = c.targets?.subscription_end_date 
        ? formatDateTime(c.targets.subscription_end_date) 
        : 'No Expiry';
      if (expDate === 'No Expiry' && duration.toLowerCase() === 'none') {
        duration = 'unlimited';
      }
      
      const now = new Date();
      const isDeactivated = c.targets?.is_deactivated === true;
      const isExpired = c.targets?.subscription_end_date && now >= new Date(c.targets.subscription_end_date);
      const status = isDeactivated ? 'Suspended' : isExpired ? 'Expired' : 'Active';
      
      return [
        c.targets?.client_code ? `#${c.targets.client_code}` : 'N/A',
        `"${(c.display_name || 'Athlete').replace(/"/g, '""')}"`,
        `"${(c.username || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        c.targets?.gender || 'Not Set',
        age,
        `"${duration.replace(/"/g, '""')}"`,
        expDate,
        status
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `athletes_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleSidebarTabClick = (newTab: 'overview' | 'clients' | 'deploy' | 'management' | 'system' | 'subscriptions' | 'profile' | 'financials', force = false) => {
    if (showTutorial && !force) return;
    if (hasUnsavedChanges) {
      setUnsavedChangesPendingAction({ type: 'sidebar', payload: newTab });
    } else {
      setActiveTab(newTab);
    }
  };

  const handleClientSubTabClick = (newSubTab: 'overview' | 'diet' | 'water' | 'workouts' | 'inbody' | 'history', force = false) => {
    if (showTutorial && !force) return;
    if (hasUnsavedChanges) {
      setUnsavedChangesPendingAction({ type: 'subtab', payload: newSubTab });
    } else {
      setClientActiveTab(newSubTab);
    }
  };

  const handleClientSelectClick = (newClientId: string) => {
    if (showTutorial) return;
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

      if (clientId && (clientId.startsWith('fake_client_') || clientId === 'fake_deployed_thor')) {
        const clientProfile = clientId === 'fake_deployed_thor' ? {
          id: 'fake_cp_thor',
          user_id: 'fake_deployed_thor',
          coach_id: 'tutorial_coach',
          age: 1500,
          height: 198,
          experience_level: 'advanced',
          workouts_per_week: 5,
          goals: 'Maintain lightning channel capacity, cardiorespiratory endurance, and high volume lifting.',
          injuries_notes: 'Missing right eye, reconstructed with prosthetic. Prone to lightning discharges.',
          has_active_plan: true,
          user: {
            id: 'fake_deployed_thor',
            display_name: 'Thor Odinson',
            username: 'thor_god_of_thunder',
            role: 'client',
            coach_id: 'tutorial_coach',
            targets: {
              client_code: '2011',
              kcal: 4000,
              protein: 250,
              carbs: 450,
              fat: 90,
              water_goal_ml: 5000,
              ai_quota_limit: 50,
              subscription_duration: '12 months',
              subscription_delay_days: '0',
              is_deactivated: false
            }
          }
        } : getMockClientProfile(clientId);

        setSelectedClientProfile(clientProfile);
        const targets = clientProfile.user?.targets || {};
        const dbKcal = targets.kcal || 2400;
        const dbProtein = targets.protein || 160;
        const dbCarbs = targets.carbs || 240;
        const dbFat = targets.fat || 70;
        const dbWater = (targets.water_goal_ml || 3500) / 1000;

        setTargetKcal(dbKcal);
        setTargetProtein(dbProtein);
        setTargetCarbs(dbCarbs);
        setTargetFat(dbFat);
        setTargetWaterLiters(dbWater);
        setDayNutrition((targets as any).day_nutrition || {});
        setLoadingClientDetails(false);
        return;
      }

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
    setExpandedMealId(null);
    try {
      if (userId.startsWith('fake_client_') || userId === 'fake_deployed_thor') {
        const mockData = getMockClientData(userId, dateStr);
        setClientDietLog(mockData.dietLog);
        setClientMeals(mockData.meals);
        setClientWaterLogs(mockData.waterLogs);
        setClientWorkoutsList(mockData.workoutsList);
        setClientScans(mockData.scans);
        if (mockData.scans && mockData.scans.length > 0) {
          setLatestWeight(mockData.scans[0].weight);
        } else {
          setLatestWeight(null);
        }
        setClientWorkoutPlans(mockData.workoutPlans);
        setClientActiveSchedule(mockData.schedule);
        if (!silent) setLoadingClientDetails(false);
        return;
      }

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

      // 6. Weekly Schedule
      const weekStart = getWeekStart(dateStr);
      const { data: schedData } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .maybeSingle();

      setClientActiveSchedule(schedData || null);

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules', filter: `user_id=eq.${selectedClientId}` }, () => {
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
          
          // Update coach's own profile and recalculate suspension state in real-time
          if (payload.new.id === coachUserId) {
            setMyCoachProfile(payload.new);
            const nowObj = new Date();
            const myTargets = payload.new.targets || {};
            const isDeactivated = myTargets.is_deactivated === true;
            const isExpired = myTargets.subscription_end_date && nowObj >= new Date(myTargets.subscription_end_date);
            const isPending = myTargets.subscription_start_date && nowObj < new Date(myTargets.subscription_start_date);

            if (coachUserId !== OWNER_ID && (isDeactivated || isExpired || isPending)) {
              setIsCoachSuspended(true);
              let reason = 'Your subscription to the coaching platform has ended. Please renew your plan to reactivate access.';
              if (isExpired) {
                reason = 'Your subscription to the coaching platform has ended. Please renew your plan to reactivate access.';
              } else if (isPending) {
                reason = `Your coach subscription starts on ${new Date(myTargets.subscription_start_date).toLocaleDateString()}.`;
              }
              setCoachSuspensionReason(reason);
            } else {
              setIsCoachSuspended(false);
            }
          }

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
    
    // Safety limit check: 10 Liters (10000 ml)
    const currentTotalMl = clientWaterLogs.reduce((sum: number, entry: any) => sum + (entry.amount_ml || 0), 0);
    if (currentTotalMl + amount > 10000) {
      toast.error("Water intake cannot exceed 10 liters per day!");
      return;
    }

    if (selectedClientId.startsWith('fake_')) {
      const now = new Date();
      const newEntry = {
        id: 'fake_water_' + Math.random().toString(36).substr(2, 9),
        user_id: selectedClientId,
        date: clientActiveDateStr,
        time: now.toISOString(),
        amount_ml: amount
      };
      setClientWaterLogs(prev => [...(prev || []), newEntry]);
      setClientHistoryWater(prev => [...(prev || []), newEntry]);
      toast.success(`${amount}ml logged!`);
      return;
    }
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
    if (selectedClientId && selectedClientId.startsWith('fake_')) {
      setClientWaterLogs(prev => prev.filter(w => w.id !== id));
      setClientHistoryWater(prev => prev.filter(w => w.id !== id));
      toast.success('Entry removed');
      return;
    }
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
    if (selectedClientId.startsWith('fake_')) {
      setClientWaterLogs([]);
      setClientHistoryWater(prev => prev.filter(w => w.user_id !== selectedClientId || w.date !== clientActiveDateStr));
      toast.success('Water logs cleared');
      return;
    }
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

  const handleDeleteScan = (id: string) => {
    showConfirm(
      'Delete Scan',
      'Are you sure you want to delete this biometrics scan? This action cannot be undone.',
      'danger',
      async () => {
        const { error } = await supabase.from('inbody_scans').delete().eq('id', id);
        if (error) {
          toast.error('Unable to delete scan.');
          return;
        }
        toast.success('Scan deleted');
        fetchClientData(selectedClientId!, clientActiveDateStr, true);
      }
    );
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

  const handleDeleteSplitDay = (id: string) => {
    showConfirm(
      'Delete Split Day',
      'Are you sure you want to delete this split day? All exercises in it will be removed.',
      'danger',
      async () => {
        const { error } = await supabase.from('user_workout_plans').delete().eq('id', id);
        if (error) {
          toast.error('Unable to delete split day.');
          return;
        }
        toast.success('Split deleted');
        fetchClientData(selectedClientId!, clientActiveDateStr, true);
      }
    );
  };

  const handleRenameSplitDay = async (plan: any) => {
    showPrompt(
      'Rename Workout Split',
      `Enter the new name for the split "${plan.plan_type}":`,
      plan.plan_type,
      'e.g. UPPER BODY',
      async (newName) => {
        if (!newName || newName.trim() === '' || newName.trim() === plan.plan_type) return;
        const cleanName = newName.trim().toUpperCase();
        try {
          if (clientWorkoutPlans.some(p => p.plan_type === cleanName && p.id !== plan.id)) {
            toast.error('A split day with that name already exists');
            return;
          }
          const { error } = await supabase.from('user_workout_plans').update({ plan_type: cleanName }).eq('id', plan.id);
          if (error) throw error;
          toast.success(`Renamed to ${cleanName}!`);
          fetchClientData(selectedClientId!, clientActiveDateStr, true);
        } catch (err: any) {
          console.error(err);
          toast.error('Unable to rename split day.');
        }
      }
    );
  };

  const handleUpdateClientDayType = async (date: string, newType: string) => {
    if (!selectedClientId) return;
    try {
      const weekStart = getWeekStart(date);
      
      const { data: schedData, error: selectError } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', selectedClientId)
        .eq('week_start', weekStart)
        .maybeSingle();

      if (selectError) throw selectError;

      let newDays = schedData?.days || {};
      newDays[date] = newType;

      let error;
      if (schedData) {
        const { error: updateError } = await supabase
          .from('schedules')
          .update({ days: newDays })
          .eq('id', schedData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('schedules')
          .insert({
            user_id: selectedClientId,
            week_start: weekStart,
            days: newDays
          });
        error = insertError;
      }

      if (error) throw error;
      toast.success('Schedule updated successfully');
      fetchClientData(selectedClientId, clientActiveDateStr, true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update scheduled day type.');
    }
  };

  const fetchClientHistory = async (clientId: string) => {
    if (!clientId) return;
    setLoadingHistory(true);
    try {
      if (clientId.startsWith('fake_client_') || clientId === 'fake_deployed_thor') {
        const mockData = getMockClientData(clientId, clientActiveDateStr);
        setClientHistoryWorkouts(mockData.workoutsList);
        setClientHistoryDiets([mockData.dietLog]);
        setClientHistoryWater(mockData.waterLogs.map(w => ({ ...w, date: clientActiveDateStr })));
        setLoadingHistory(false);
        return;
      }

      const [workoutsRes, dietsRes, waterRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', clientId).order('date', { ascending: false }),
        supabase.from('diet_logs').select('*').eq('user_id', clientId).order('date', { ascending: false }),
        supabase.from('water_logs').select('*').eq('user_id', clientId).order('date', { ascending: false })
      ]);

      setClientHistoryWorkouts(workoutsRes.data || []);
      setClientHistoryDiets(dietsRes.data || []);
      setClientHistoryWater(waterRes.data || []);
    } catch (err) {
      console.error("Error fetching client history:", err);
      toast.error("Failed to load client history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenDietReceipt = async (dietLog: any) => {
    setSelectedReceiptDiet(dietLog);
    setSelectedReceiptDietMeals([]);
    setLoadingReceiptDietMeals(true);
    try {
      if (dietLog.id && dietLog.id.startsWith('fake_dl_')) {
        const mockData = getMockClientData(dietLog.user_id, dietLog.date);
        setSelectedReceiptDietMeals(mockData.meals || []);
        setLoadingReceiptDietMeals(false);
        return;
      }

      const { data: meals } = await supabase
        .from('diet_meals')
        .select('*')
        .eq('diet_log_id', dietLog.id)
        .order('created_at', { ascending: true });
      setSelectedReceiptDietMeals(meals || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to fetch meal details.');
    } finally {
      setLoadingReceiptDietMeals(false);
    }
  };

  const getUnifiedHistory = () => {
    const datesMap: Record<string, {
      date: string;
      workouts: any[];
      diet: any | null;
      waterMl: number;
    }> = {};

    clientHistoryWorkouts.forEach(w => {
      const date = w.date;
      if (!datesMap[date]) {
        datesMap[date] = { date, workouts: [], diet: null, waterMl: 0 };
      }
      datesMap[date].workouts.push(w);
    });

    clientHistoryDiets.forEach(d => {
      const date = d.date;
      if (!datesMap[date]) {
        datesMap[date] = { date, workouts: [], diet: null, waterMl: 0 };
      }
      datesMap[date].diet = d;
    });

    clientHistoryWater.forEach(wat => {
      const date = wat.date;
      if (!datesMap[date]) {
        datesMap[date] = { date, workouts: [], diet: null, waterMl: 0 };
      }
      datesMap[date].waterMl += (wat.amount_ml || 0);
    });

    return Object.values(datesMap).sort((a, b) => b.date.localeCompare(a.date));
  };

  const handleExportHistoryToCSV = () => {
    const data = getUnifiedHistory();
    if (data.length === 0) {
      toast.error("No history data to export.");
      return;
    }

    const headers = ["Date", "Workouts", "Diet Calories (kcal)", "Protein (g)", "Carbs (g)", "Fat (g)", "Water (L)"];
    const rows = data.map(row => {
      const workoutsStr = row.workouts.map(w => `${w.day_type || 'GYM'}: ${w.name || 'Workout'} (${w.status})`).join(" | ");
      
      let kcal = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      
      if (row.diet) {
        let dt = row.diet.daily_totals;
        if (typeof dt === 'string') {
          try {
            dt = JSON.parse(dt);
          } catch (e) {
            console.error("Failed to parse daily_totals string in export:", e);
          }
        }
        if (dt) {
          kcal = dt.kcal || 0;
          protein = dt.protein || 0;
          carbs = dt.carbs || 0;
          fat = dt.fat || 0;
        }
      }
      
      const waterL = (row.waterMl / 1000).toFixed(2);
      
      return [
        row.date,
        `"${workoutsStr.replace(/"/g, '""')}"`,
        kcal,
        protein,
        carbs,
        fat,
        waterL
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const clientNameClean = selectedClientProfile?.full_name?.toLowerCase().replace(/\s+/g, '_') || 'client';
    link.setAttribute("download", `${clientNameClean}_fitness_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (selectedClientId && clientActiveTab === 'history') {
      fetchClientHistory(selectedClientId);
    }
  }, [selectedClientId, clientActiveTab]);

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
      if (clientId && (clientId.startsWith('fake_client_') || clientId === 'fake_deployed_thor')) {
        const mockProfile: any = clientId === 'fake_deployed_thor' ? {
          id: 'fake_cp_thor',
          user_id: 'fake_deployed_thor',
          coach_id: 'tutorial_coach',
          age: 1500,
          height: 198,
          experience_level: 'advanced',
          workouts_per_week: 5,
          goals: 'Maintain lightning channel capacity, cardiorespiratory endurance, and high volume lifting.',
          injuries_notes: 'Missing right eye, reconstructed with prosthetic. Prone to lightning discharges.',
          has_active_plan: true,
          user: {
            id: 'fake_deployed_thor',
            display_name: 'Thor Odinson',
            username: 'thor_god_of_thunder',
            role: 'client',
            coach_id: 'tutorial_coach',
            targets: {
              client_code: '2011',
              kcal: 4000,
              protein: 250,
              carbs: 450,
              fat: 90,
              water_goal_ml: 5000,
              ai_quota_limit: 50,
              subscription_duration: '12 months',
              subscription_delay_days: '0',
              is_deactivated: false
            }
          }
        } : getMockClientProfile(clientId);

        setManagementClientProfile(mockProfile);
        setEditSubscriptionPeriod(mockProfile.user?.targets?.subscription_duration ?? '1 month');
        setEditSubscriptionDelay(String(mockProfile.user?.targets?.subscription_delay_days ?? '0'));
        setEditCustomSubscriptionEnd(getLocalDateTimeString());
        setEditClientDisplayName(mockProfile.user?.display_name || '');
        setEditClientContactEmail(mockProfile.user?.targets?.contact_email || '');
        setEditClientPhoneNumber(mockProfile.user?.targets?.phone_number || '');
        return;
      }

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
        setEditSubscriptionPeriod(clientProfile.user?.targets?.subscription_duration ?? '1 month');
        setEditSubscriptionDelay(String(clientProfile.user?.targets?.subscription_delay_days ?? '0'));
        if (clientProfile.user?.targets?.subscription_end_date) {
          setEditCustomSubscriptionEnd(getLocalDateTimeString(new Date(clientProfile.user.targets.subscription_end_date)));
        } else {
          setEditCustomSubscriptionEnd(getLocalDateTimeString());
        }
        setEditClientDisplayName(clientProfile.user?.display_name || '');
        setEditClientContactEmail(clientProfile.user?.targets?.contact_email || '');
        setEditClientPhoneNumber(clientProfile.user?.targets?.phone_number || '');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load client management file.');
    }
  };

  const handleToggleManagementSuspension = () => {
    if (!managementSelectedClientId || !managementClientProfile) return;
    const isSuspended = managementClientProfile.user?.targets?.is_deactivated === true;
    const title = isSuspended ? 'Reactivate Athlete' : 'Suspend Athlete';
    const msg = isSuspended 
      ? `Are you sure you want to reactivate access for athlete ${managementClientProfile.user?.display_name || 'Athlete'}?`
      : `Are you sure you want to suspend access for athlete ${managementClientProfile.user?.display_name || 'Athlete'} immediately?`;
    
    showConfirm(
      title,
      msg,
      isSuspended ? 'success' : 'danger',
      async () => {
        setManagementUpdatingSuspension(true);
        try {
          const currentTargets = managementClientProfile.user?.targets || {};
          const updatedTargets = { ...currentTargets, is_deactivated: !isSuspended };

          if (managementSelectedClientId.startsWith('fake_client_') || managementSelectedClientId === 'fake_deployed_thor') {
            toast.success(isSuspended ? 'Athlete reactivated!' : 'Athlete account suspended.');
            setManagementClientProfile((prev: any) => ({
              ...prev,
              user: { ...prev.user, targets: updatedTargets }
            }));
            setManagementUpdatingSuspension(false);
            return;
          }

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

          // Trigger WhatsApp notifications
          if (currentTargets.phone_number) {
            if (!isSuspended) {
              // Suspend
              triggerWhatsAppEvent('client_suspended', currentTargets.phone_number, {
                display_name: managementClientProfile.user?.display_name || 'Athlete',
                coach_name: myCoachProfile?.display_name || 'your coach',
                coach_phone: myCoachProfile?.targets?.phone_number || ''
              });
            } else {
              // Reactivate
              triggerWhatsAppEvent('client_reactivated', currentTargets.phone_number, {
                display_name: managementClientProfile.user?.display_name || 'Athlete'
              });
            }
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to update suspension status.');
        } finally {
          setManagementUpdatingSuspension(false);
        }
      }
    );
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
      const wasSuspended = currentTargets.is_deactivated === true || 
                           currentTargets.subscription_status === 'suspended' || 
                           currentTargets.subscription_status === 'expired' ||
                           !currentTargets.subscription_end_date ||
                           new Date(currentTargets.subscription_end_date) < new Date();
      
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

      const history = currentTargets.subscription_history || [];
      const newEntry = {
        timestamp: new Date().toISOString(),
        action: history.length === 0 ? 'initial_activation' : 'reactivation',
        duration: period,
        delay_days: delayDays,
        start_date: subscription_start_date,
        end_date: subscription_end_date
      };

      const updatedTargets = {
        ...currentTargets,
        subscription_duration: period,
        subscription_delay_days: delayDays,
        subscription_start_date,
        subscription_end_date,
        is_deactivated: isDeactivated,
        is_free_trial: false,
        subscription_status: 'active',
        subscription_history: [...history, newEntry]
      };

      if (managementSelectedClientId.startsWith('fake_client_') || managementSelectedClientId === 'fake_deployed_thor') {
        toast.success('Subscription updated successfully!');
        setManagementClientProfile((prev: any) => ({
          ...prev,
          user: { ...prev.user, targets: updatedTargets }
        }));
        setUpdatingSubscriptionState(false);
        return;
      }

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

      // Trigger WhatsApp reactivation/renewal if now active
      if (updatedTargets.phone_number && !isDeactivated) {
        if (wasSuspended) {
          triggerWhatsAppEvent('client_reactivated', updatedTargets.phone_number, {
            display_name: managementClientProfile.user?.display_name || 'Athlete'
          });
        } else {
          const planName = period === 'custom' ? 'Custom Plan' : period;
          const formattedEndDate = subscription_end_date 
            ? new Date(subscription_end_date).toLocaleDateString('en-GB') 
            : '';
          triggerWhatsAppEvent('client_renewed', updatedTargets.phone_number, {
            display_name: managementClientProfile.user?.display_name || 'Athlete',
            plan: planName,
            end_date: formattedEndDate
          });
        }
      }
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

      const history = currentTargets.subscription_history || [];
      const newEntry = {
        timestamp: new Date().toISOString(),
        action: history.length === 0 ? 'initial_activation' : 'reactivation',
        duration: period,
        delay_days: delayDays,
        start_date: subscription_start_date,
        end_date: subscription_end_date
      };

      const updatedTargets = {
        ...currentTargets,
        subscription_duration: period,
        subscription_delay_days: delayDays,
        subscription_start_date,
        subscription_end_date,
        is_deactivated: isDeactivated,
        is_free_trial: false,
        subscription_status: 'active',
        subscription_history: [...history, newEntry]
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

      // Trigger WhatsApp reactivation if now active
      if (updatedTargets.phone_number && !isDeactivated) {
        triggerWhatsAppEvent('client_reactivated', updatedTargets.phone_number, {
          display_name: reactivateClientName
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to reactivate subscription.');
    } finally {
      setReactivateSaving(false);
    }
  };

  const handleSaveCoachReactivation = async () => {
    if (!coachReactivateId) return;
    setCoachReactivateSaving(true);
    try {
      const coachProfile = profiles.find(p => p.id === coachReactivateId);
      const currentTargets = coachProfile?.targets || {};
      
      const delayDays = parseInt(coachReactivateDelay) || 0;
      const startDate = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);
      
      let endDate: Date | null = null;
      if (coachReactivatePeriod === 'none') {
        endDate = null;
      } else if (coachReactivatePeriod === 'custom') {
        endDate = coachReactivateCustomEnd ? new Date(coachReactivateCustomEnd) : null;
      } else {
        let durationMs = 30 * 24 * 60 * 60 * 1000;
        if (coachReactivatePeriod === '2 weeks') durationMs = 14 * 24 * 60 * 60 * 1000;
        else if (coachReactivatePeriod === '1 month') durationMs = 30 * 24 * 60 * 60 * 1000;
        else if (coachReactivatePeriod === '3 months') durationMs = 90 * 24 * 60 * 60 * 1000;
        else if (coachReactivatePeriod === '6 months') durationMs = 180 * 24 * 60 * 60 * 1000;
        else if (coachReactivatePeriod === '12 months') durationMs = 365 * 24 * 60 * 60 * 1000;
        else if (coachReactivatePeriod === '2 years') durationMs = 730 * 24 * 60 * 60 * 1000;
        
        endDate = new Date(startDate.getTime() + durationMs);
      }

      let isDeactivated = false;
      if (startDate && endDate) {
        const nowObj = new Date();
        if (nowObj < startDate || nowObj >= endDate) {
          isDeactivated = true;
        }
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'coach_reactivation',
        period: coachReactivatePeriod,
        delay_days: delayDays,
        is_free_trial: coachReactivateIsFreeTrial,
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null
      };

      const updatedHistory = Array.isArray(currentTargets.subscription_history)
        ? [...currentTargets.subscription_history, logEntry]
        : [logEntry];

      const updatedTargets = {
        ...currentTargets,
        is_deactivated: isDeactivated,
        is_free_trial: coachReactivateIsFreeTrial,
        subscription_status: coachReactivateIsFreeTrial ? 'trial' : 'active',
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate ? endDate.toISOString() : null,
        subscription_duration: coachReactivatePeriod,
        subscription_delay: coachReactivateDelay,
        subscription_history: updatedHistory
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', coachReactivateId);

      if (error) throw error;
      toast.success(`${coachReactivateName} reactivated successfully!`);
      setCoachReactivateModalOpen(false);
      setProfiles(prev => prev.map(p => p.id === coachReactivateId ? { ...p, targets: updatedTargets } : p));

      // Trigger WhatsApp coach reactivated receipt
      if (updatedTargets.phone_number && !isDeactivated) {
        triggerWhatsAppEvent('coach_reactivated', updatedTargets.phone_number, {
          display_name: coachReactivateName,
          plan: coachReactivatePeriod,
          start_date: startDate.toLocaleDateString(),
          end_date: endDate ? endDate.toLocaleDateString() : 'Lifetime'
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to reactivate coach.");
    } finally {
      setCoachReactivateSaving(false);
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
      if (managementSelectedClientId.startsWith('fake_client_') || managementSelectedClientId === 'fake_deployed_thor') {
        setTimeout(() => {
          toast.success('Passcode updated successfully!');
          setManagementNewPassword('');
          setManagementClientProfile((prev: any) => ({
            ...prev,
            generated_passcode: managementNewPassword.trim()
          }));
          setManagementUpdatingPassword(false);
        }, 500);
        return;
      }

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

  const handleUpdateOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownNewPassword || ownNewPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
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

      // Update in public profiles table targets
      const currentTargets = myCoachProfile?.targets || {};
      const updatedTargets = { ...currentTargets, generated_passcode: ownNewPassword.trim() };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', coachUserId);
        
      if (profileError) throw profileError;

      // Update local state immediately
      setMyCoachProfile((prev: any) => ({
        ...prev,
        targets: updatedTargets
      }));

      toast.success('Your account password has been updated successfully!');
      setOwnNewPassword('');
      setOwnConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update your password.');
    } finally {
      setUpdatingOwnPassword(false);
    }
  };

    const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setSubmittingFeedback(true);
    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          user_id: coachUserId,
          rating: feedbackCategory === 'bug' ? null : feedbackRating,
          message: feedbackMessage.trim(),
          name: myCoachProfile?.display_name || 'Coach',
          email: myCoachProfile?.email || '',
          phone: myCoachProfile?.targets?.phone_number || '',
          category: feedbackCategory
        });
      if (error) throw error;
      
      const now = Date.now();
      localStorage.setItem('coach_last_feedback_time', now.toString());
      setLastFeedbackTime(now);
      
      setFeedbackMessage('');
      setFeedbackRating(5);
      setFeedbackCategory('feedback');
      setFeedbackSuccessShow(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleRenewSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subOverlayTermsChecked || !subOverlayRefundChecked) {
      toast.error('You must accept the privacy policy and non-refundable terms.');
      return;
    }
    
    // Validate fields
    if (subOverlayMethod === 'telda') {
      if (!subOverlayTeldaUser.trim() || !subOverlayPhone.trim()) {
        toast.error('Please fill out both the Telda username and phone number.');
        return;
      }
    } else {
      if (!subOverlayPhone.trim()) {
        toast.error('Please enter the sender phone number.');
        return;
      }
      if (!subOverlayScreenshot) {
        toast.error('Please upload a transaction receipt screenshot.');
        return;
      }
    }

    setSubOverlaySubmitting(true);
    try {
      // 1. Use the sessionToken already stored in component state (avoids re-triggering auth listeners)
      const token = sessionToken;
      if (!token) {
        toast.error('No active session. Please log in again.');
        return;
      }

      // Prepare payload
      const sender_details = subOverlayMethod === 'telda'
        ? { telda_username: subOverlayTeldaUser.trim(), phone: subOverlayPhone.trim() }
        : { phone: subOverlayPhone.trim() };

      const response = await fetch('/api/submit-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          period: subOverlayPlan,
          method: subOverlayMethod,
          sender_details,
          screenshot: subOverlayScreenshot // Base64 screenshot
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit transaction.');
      }

      toast.success('Your subscription request has been submitted successfully for verification!');
      
      // Close overlay and reset fields
      setShowSubscriptionOverlay(false);
      setSubOverlayPhone('');
      setSubOverlayTeldaUser('');
      setSubOverlayScreenshot('');
      setSubOverlayTermsChecked(false);
      setSubOverlayRefundChecked(false);
      
      // Re-fetch profile data to show pending status
      fetchBaseData(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Payment submission failed.');
    } finally {
      setSubOverlaySubmitting(false);
    }
  };

  const handleScreenshotFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSubOverlayScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearPaymentResult = async () => {
    try {
      const currentTargets = myCoachProfile?.targets || {};
      const updatedTargets = { ...currentTargets };
      delete updatedTargets.last_payment_result;
      
      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', coachUserId);
        
      if (error) throw error;
      
      setMyCoachProfile((prev: any) => ({
        ...prev,
        targets: updatedTargets
      }));
      toast.success('Notification cleared.');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to clear notification.');
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

      if (managementSelectedClientId.startsWith('fake_client_') || managementSelectedClientId === 'fake_deployed_thor') {
        toast.success('Feature permissions updated.');
        setManagementClientProfile((prev: any) => ({
          ...prev,
          user: { ...prev.user, targets: updatedTargets }
        }));
        setManagementUpdatingFeatures(false);
        return;
      }

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

      // Trigger WhatsApp notifications
      if (currentTargets.phone_number) {
        if (!currentDeactivated) {
          // Suspend
          triggerWhatsAppEvent('coach_suspended', currentTargets.phone_number, {
            display_name: coachProfile?.display_name || 'Coach'
          });
        } else {
          // Reactivate
          triggerWhatsAppEvent('coach_reactivated', currentTargets.phone_number, {
            display_name: coachProfile?.display_name || 'Coach',
            plan: currentTargets.subscription_duration || 'Active',
            start_date: currentTargets.subscription_start_date ? new Date(currentTargets.subscription_start_date).toLocaleDateString() : 'N/A',
            end_date: currentTargets.subscription_end_date ? new Date(currentTargets.subscription_end_date).toLocaleDateString() : 'Lifetime'
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update coach suspension status.");
    } finally {
      setUpdatingCoachStatus(false);
    }
  };

  const handleUpdateCoachSubscription = async (coachId: string) => {
    if (coachId === OWNER_ID) {
      toast.error("Owner account does not have a subscription.");
      return;
    }
    setUpdatingCoachSub(true);
    try {
      const coachProfile = profiles.find(p => p.id === coachId);
      const currentTargets = coachProfile?.targets || {};
      
      const delayDays = parseInt(coachSubDelay) || 0;
      const startDate = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);
      
      let endDate: Date | null = null;
      if (coachSubPeriod === 'none') {
        // Lifetime / No Expiry
        endDate = null;
      } else if (coachSubPeriod === 'custom') {
        endDate = coachSubCustomEnd ? new Date(coachSubCustomEnd) : null;
      } else {
        let durationMs = 30 * 24 * 60 * 60 * 1000; // default 1 month
        if (coachSubPeriod === '2 weeks') durationMs = 14 * 24 * 60 * 60 * 1000;
        else if (coachSubPeriod === '1 month') durationMs = 30 * 24 * 60 * 60 * 1000;
        else if (coachSubPeriod === '3 months') durationMs = 90 * 24 * 60 * 60 * 1000;
        else if (coachSubPeriod === '6 months') durationMs = 180 * 24 * 60 * 60 * 1000;
        else if (coachSubPeriod === '12 months') durationMs = 365 * 24 * 60 * 60 * 1000;
        else if (coachSubPeriod === '2 years') durationMs = 730 * 24 * 60 * 60 * 1000;
        
        endDate = new Date(startDate.getTime() + durationMs);
      }

      // Prepare subscription history log entry
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'coach_subscription_update',
        period: coachSubPeriod,
        delay_days: delayDays,
        is_free_trial: coachSubIsFreeTrial,
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null
      };

      const updatedHistory = Array.isArray(currentTargets.subscription_history)
        ? [...currentTargets.subscription_history, logEntry]
        : [logEntry];

      const updatedTargets = {
        ...currentTargets,
        is_deactivated: false, // reactivate coach access automatically on renewal
        is_free_trial: coachSubIsFreeTrial,
        subscription_status: coachSubIsFreeTrial ? 'trial' : 'active',
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate ? endDate.toISOString() : null,
        subscription_duration: coachSubPeriod,
        subscription_delay: coachSubDelay,
        subscription_history: updatedHistory
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', coachId);

      if (error) throw error;
      toast.success("Coach subscription updated successfully!");
      setProfiles(prev => prev.map(p => p.id === coachId ? { ...p, targets: updatedTargets } : p));

      // Trigger WhatsApp coach reactivated receipt
      if (updatedTargets.phone_number) {
        triggerWhatsAppEvent('coach_reactivated', updatedTargets.phone_number, {
          display_name: coachProfile?.display_name || 'Coach',
          plan: coachSubPeriod,
          start_date: startDate.toLocaleDateString(),
          end_date: endDate ? endDate.toLocaleDateString() : 'Lifetime'
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update coach subscription.");
    } finally {
      setUpdatingCoachSub(false);
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
      const delayDays = parseInt(registerCoachSubDelay) || 0;
      const startDate = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);
      
      let endDate: Date | null = null;
      if (registerCoachSubPeriod === 'none') {
        // Lifetime / No Expiry
        endDate = null;
      } else if (registerCoachSubPeriod === 'custom') {
        endDate = registerCoachSubCustomEnd ? new Date(registerCoachSubCustomEnd) : null;
      } else {
        let durationMs = 30 * 24 * 60 * 60 * 1000; // default 1 month
        if (registerCoachSubPeriod === '2 weeks') durationMs = 14 * 24 * 60 * 60 * 1000;
        else if (registerCoachSubPeriod === '1 month') durationMs = 30 * 24 * 60 * 60 * 1000;
        else if (registerCoachSubPeriod === '3 months') durationMs = 90 * 24 * 60 * 60 * 1000;
        else if (registerCoachSubPeriod === '6 months') durationMs = 180 * 24 * 60 * 60 * 1000;
        else if (registerCoachSubPeriod === '12 months') durationMs = 365 * 24 * 60 * 60 * 1000;
        else if (registerCoachSubPeriod === '2 years') durationMs = 730 * 24 * 60 * 60 * 1000;
        
        endDate = new Date(startDate.getTime() + durationMs);
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'coach_subscription_initial',
        period: registerCoachSubPeriod,
        delay_days: delayDays,
        is_free_trial: registerCoachSubIsFreeTrial,
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null
      };

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
          role: 'coach',
          targets: {
            is_deactivated: false,
            is_free_trial: registerCoachSubIsFreeTrial,
            subscription_status: registerCoachSubIsFreeTrial ? 'trial' : 'active',
            subscription_start_date: startDate.toISOString(),
            subscription_end_date: endDate ? endDate.toISOString() : null,
            subscription_duration: registerCoachSubPeriod,
            subscription_delay: registerCoachSubDelay,
            phone_number: newCoachPhoneNumber || null,
            contact_email: newCoachContactEmail || null,
            subscription_history: [logEntry]
          }
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
      setNewCoachPhoneNumber('');
      setNewCoachContactEmail('');
      // Reset form subscription options to defaults
      setRegisterCoachSubPeriod('1 month');
      setRegisterCoachSubDelay('0');
      setRegisterCoachSubIsFreeTrial(false);
      setRegisterCoachSubCustomEnd(getLocalDateTimeString());
      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to register coach.');
    } finally {
      setIsCreatingNewCoach(false);
    }
  };

  const handleUpdateProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managementSelectedClientId || !managementClientProfile) return;
    setUpdatingProfileDetails(true);
    try {
      const currentTargets = managementClientProfile.user?.targets || {};
      const updatedTargets = {
        ...currentTargets,
        contact_email: editClientContactEmail.trim().toLowerCase(),
        phone_number: editClientPhoneNumber.trim()
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editClientDisplayName.trim(),
          targets: updatedTargets
        })
        .eq('id', managementSelectedClientId);

      if (error) throw error;
      toast.success('Profile details updated successfully! 💾');

      // Update locally
      setManagementClientProfile((prev: any) => ({
        ...prev,
        user: {
          ...prev.user,
          display_name: editClientDisplayName.trim(),
          targets: updatedTargets
        }
      }));

      // Update locally in profiles
      setProfiles(prev => prev.map(p => {
        if (p.id === managementSelectedClientId) {
          return {
            ...p,
            display_name: editClientDisplayName.trim(),
            targets: updatedTargets
          };
        }
        return p;
      }));

      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save updated profile details: ' + err.message);
    } finally {
      setUpdatingProfileDetails(false);
    }
  };

  const handleDeleteManagementClient = async () => {
    if (!managementSelectedClientId || !managementClientProfile) return;
    if (deletingClient) return;

    const name = managementClientProfile.user?.display_name || 'this client';
    showPrompt(
      'Confirm Client Deletion',
      `Type "${name}" to confirm complete account deletion (workouts, InBody, and auth logs will be wiped):`,
      '',
      'Type client name...',
      async (conf) => {
        if (conf !== name) {
          if (conf !== null) toast.error('Verification failed. Deletion cancelled.');
          return;
        }

        setDeletingClient(true);
        const toastId = toast.loading('Deleting athlete account...');
        if (managementSelectedClientId.startsWith('fake_client_') || managementSelectedClientId === 'fake_deployed_thor') {
          setTimeout(() => {
            toast.success('Athlete wiped successfully.', { id: toastId });
            if (managementSelectedClientId === 'fake_deployed_thor') {
              setSimulatedDeployedClient(null);
            }
            setManagementSelectedClientId('');
            setManagementClientProfile(null);
            setDeletingClient(false);
          }, 800);
          return;
        }

        try {
          // Delete user via secure API (handles archiving and database cleanup)
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
            throw new Error(errData.error || 'Failed to delete user');
          }

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
        } finally {
          setDeletingClient(false);
        }
      }
    );
  };

  // ─── DEPLOY ATHLETE 4-STEP ACTION ──────────────────────────
  const handleDeployAthlete = async () => {
    setAttemptedStep1Submit(true);
    if (!isStep1Valid()) {
      if (isUsernameTaken) {
        toast.error('Username is already taken. Please change it.');
      } else if (isClientCodeTaken) {
        toast.error('Client Code is already taken. Please change it.');
      } else if (deployGender === null) {
        toast.error('Please select a sex (Male or Female).');
      } else {
        toast.error('Please fill in all empty text boxes.');
      }
      return;
    }
    setDeployLoading(true);
    setDeploySuccessData(null);
    setDeployError(null);

    if (isTutorialModeActive) {
      setTimeout(() => {
        setDeploySuccessData({
          displayName: formData.displayName,
          clientCode: formData.clientCode || '2011',
          username: formData.username,
          password: formData.password
        });
        setDeployLoading(false);
        toast.success('Simulated athlete deployed successfully!');
        
        if (showTutorial && spotlightIndex === 3) {
          setActiveTab('management');
          setSpotlightIndex(4);
        }
      }, 1500);
      return;
    }

    try {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      const activeCoachId = activeSession?.user?.id || coachUserId;
      const activeToken = activeSession?.access_token || sessionToken;

      if (!activeCoachId) {
        throw new Error('Coach session not found. Please log in again.');
      }

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
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          email: emailAddress,
          password: formData.password,
          display_name: formData.displayName,
          gender: deployGender,
          role: 'client',
          targets: {
            contact_email: formData.contactEmail.trim().toLowerCase(),
            phone_number: formData.phoneNumber.trim()
          }
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
        contact_email: formData.contactEmail.trim().toLowerCase(),
        phone_number: formData.phoneNumber.trim(),
        subscription_duration: period,
        subscription_delay_days: delayDays,
        subscription_start_date,
        subscription_end_date,
        disable_workout_templates: true,
        disable_nutrition_targets: true,
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
        username: formData.username.trim().toLowerCase(),
        email: emailAddress,
        display_name: formData.displayName,
        role: 'client',
        coach_id: activeCoachId,
        targets
      });
      if (profileError) throw profileError;

      // 5. Client Profiles row
      const { error: clientProfileError } = await supabase.from('client_profiles').insert({
        user_id: clientUserId,
        coach_id: activeCoachId,
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
        clientCode: nextClientCode,
        contactEmail: formData.contactEmail.trim().toLowerCase()
      });

      toast.success('Athlete registered and splits deployed successfully!');
      
      // Reset form & states
      setFormData({
        displayName: '',
        username: '',
        password: '',
        clientCode: '',
        contactEmail: '',
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
      console.error('Deploy error:', err);
      const errMsg = err?.message || err?.error || String(err) || 'Unknown error during deployment.';
      setDeployError(errMsg);
      toast.error(errMsg, { duration: 8000 });
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
  const activeClientsList = isTutorialModeActive ? (simulatedDeployedClient ? [...FAKE_CLIENTS, simulatedDeployedClient] : FAKE_CLIENTS) : clientsList;

  const filteredClients = activeClientsList.filter(c => {
    const code = c.targets?.client_code ? String(c.targets.client_code) : '';
    const cleanQuery = clientSearchQuery.trim().toLowerCase().replace('#', '');
    const matchesSearch = c.display_name?.toLowerCase().includes(cleanQuery) ||
      c.username?.toLowerCase().includes(cleanQuery) ||
      code.includes(cleanQuery);
    if (coachUserId === OWNER_ID && directoryFilterMineOnly) {
      return matchesSearch && c.coach_id === OWNER_ID;
    }
    return matchesSearch;
  });

  const systemCoaches = profiles.filter(p => p.role === 'coach' || p.id === OWNER_ID);
  const filteredSystemCoaches = systemCoaches.filter(coach => {
    const q = coachSearchQuery.toLowerCase();
    return (
      coach.display_name?.toLowerCase().includes(q) ||
      coach.username?.toLowerCase().includes(q) ||
      (coach.email && coach.email.toLowerCase().includes(q))
    );
  });

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

  const scheduleDayTypes = clientActiveSchedule?.days ? Object.values(clientActiveSchedule.days) : [];
  const historyDayTypes = clientHistoryWorkouts ? clientHistoryWorkouts.map(w => w.day_type) : [];
  const activeDayTypesSet = new Set([
    'REST',
    ...clientWorkoutPlans.map(p => p.plan_type),
    ...scheduleDayTypes,
    ...historyDayTypes
  ]);

  const athleteDayTypes = Array.from(new Set([
    'REST', 
    'RUN', 
    'RUN + GYM', 
    ...clientWorkoutPlans.map(p => p.plan_type),
    ...Object.keys(dayNutrition)
  ])).filter(dt => dt && activeDayTypesSet.has(dt));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05050b] text-gray-200">
        <DumbbellLoader label="Initializing Desktop Coach Portal..." size={120} />
      </div>
    );
  }

  if (isDeletingCoach) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05050b] text-gray-200">
        <DumbbellLoader label="Deleting coach and all assigned clients. Please wait..." size={120} />
      </div>
    );
  }

  if (isNotCoach) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05050b] text-gray-200 text-center p-6 font-bold">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <ShieldAlert size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-black text-white uppercase tracking-wider">Access Denied</h1>
        <p className="text-gray-400 text-xs mt-3 max-w-[280px] leading-relaxed font-bold">
          Only authorized coaches and system administrators can access the Desktop Coach Portal.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/coach-portal';
          }}
          className="mt-6 flex items-center gap-2 py-2.5 px-5 rounded-xl border border-red-900/40 hover:border-red-700 bg-red-950/20 text-xs font-black uppercase text-red-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <LogOut size={13} /> Sign Out / Log Out
        </button>
      </div>
    );
  }

  const renderSubscriptionModals = () => {
    return (
      <>
        {/* COACH SUBSCRIPTION PAYMENT OVERLAY MODAL */}
        {showSubscriptionOverlay && (
          <div className="fixed inset-0 bg-[#05050b]/80 backdrop-blur-md z-50 overflow-y-auto flex justify-center items-start py-8 px-4 md:px-6">
            <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-5 md:p-6 max-w-3xl w-full space-y-4 shadow-2xl animate-fade-in my-0">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-855 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Renew Subscription
                    </h3>
                    <p className="text-[9px] text-gray-500">Extend your coaching portal license</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubscriptionOverlay(false);
                    setSubOverlayScreenshot('');
                  }}
                  className="w-7 h-7 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center border border-gray-800 transition-all cursor-pointer text-xs"
                >
                  <X size={12} />
                </button>
              </div>

              <form onSubmit={handleRenewSubscription} className="space-y-4 text-xs font-bold text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  {/* Left Column */}
                  <div className="space-y-4">
                    
                    {/* COMPELING SELLING POINTS */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 space-y-1.5">
                      <p className="font-extrabold text-emerald-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <span>💎 Premium License Guarantees:</span>
                      </p>
                      <ul className="space-y-1 text-[9px] text-gray-400 font-medium list-disc pl-4 font-sans leading-relaxed">
                        <li>Guarantees <span className="text-white font-bold">full administrative access</span> to all training plans, diet sheets, client records, and analytics.</li>
                        <li>Allows you to manage <span className="text-white font-bold">up to 50 active athletes</span> concurrently.</li>
                        <li>Unlocks advanced features: AI workout logs generator, InBody assessments parser, custom client progress tracking dashboard.</li>
                      </ul>
                    </div>
                
                    {/* Plan Choice Grid */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-gray-500">Select Plan Option</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: '2 weeks', label: '2 Weeks', price: planPrices['2 weeks'] || '2,000 EGP' },
                          { id: '1 month', label: '1 Month', price: planPrices['1 month'] || '3,500 EGP' },
                          { id: '3 months', label: '3 Months', price: planPrices['3 months'] || '8,500 EGP' },
                          { id: '6 months', label: '6 Months', price: planPrices['6 months'] || '14,000 EGP' }
                        ].map(plan => (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setSubOverlayPlan(plan.id)}
                            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                              subOverlayPlan === plan.id
                                ? 'bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-500/5'
                                : 'bg-[#121624]/60 border-gray-800 text-gray-400 hover:border-gray-700'
                            }`}
                          >
                            <span className="text-xs font-extrabold">{plan.label}</span>
                            <span className={`text-[10px] font-mono mt-0.5 ${subOverlayPlan === plan.id ? 'text-blue-400' : 'text-gray-500'}`}>{plan.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-gray-500">Choose Payment Method</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'wallet', label: 'Mobile Wallet', desc: 'Vodafone Cash, etc.' },
                          { id: 'telda', label: 'Telda App', desc: 'Transfer to Username' }
                        ].map(method => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => {
                              setSubOverlayMethod(method.id);
                              setSubOverlayScreenshot('');
                            }}
                            className={`p-2.5 rounded-xl border text-left flex flex-col transition-all duration-200 cursor-pointer ${
                              subOverlayMethod === method.id
                                ? 'bg-emerald-600/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/5'
                                : 'bg-[#121624]/60 border-gray-800 text-gray-400 hover:border-gray-700'
                            }`}
                          >
                            <span className="text-xs font-extrabold">{method.label}</span>
                            <span className="text-[8px] text-gray-500 mt-0.5 font-medium">{method.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Guide/Instruction Info Alert */}
                    <div className="p-3 rounded-xl bg-[#121624]/80 border border-gray-800 space-y-1 font-medium text-[10px] text-gray-400">
                      <p className="font-extrabold text-white text-[11px] uppercase tracking-wider">Payment Instructions:</p>
                      {subOverlayMethod === 'telda' ? (
                        <p>Send the transaction amount to Telda Username: <span className="text-yellow-500 font-mono font-bold select-all">@ckh</span></p>
                      ) : (
                        <p>Transfer the transaction amount to Mobile Wallet phone: <span className="text-yellow-500 font-mono font-bold select-all">01128828954</span></p>
                      )}
                      <p className="text-[9px] text-gray-500">Verify details and fill out the transfer credentials form below.</p>
                    </div>

                    {/* Total checkout amount display */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400">Total Transfer Value:</span>
                      <span className="text-sm font-black text-white font-mono">
                        {planPrices[subOverlayPlan] || '0 EGP'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Dynamic Inputs depending on Method */}
                    <div className="space-y-3">
                      {subOverlayMethod === 'telda' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Telda Username</label>
                            <input
                              type="text"
                              required
                              value={subOverlayTeldaUser}
                              onChange={e => setSubOverlayTeldaUser(e.target.value)}
                              placeholder="@username"
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono font-bold placeholder-gray-600 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Sender Phone Number</label>
                            <input
                              type="tel"
                              required
                              value={subOverlayPhone}
                              onChange={e => setSubOverlayPhone(e.target.value)}
                              placeholder="e.g. 01xxxxxxxxx"
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono font-bold placeholder-gray-600 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Sender Wallet Phone Number</label>
                            <input
                              type="tel"
                              required
                              value={subOverlayPhone}
                              onChange={e => setSubOverlayPhone(e.target.value)}
                              placeholder="e.g. 01xxxxxxxxx"
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono font-bold placeholder-gray-600 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                            />
                          </div>
                        </div>
                      )}

                      {/* Screenshot drag and drop area */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Transfer Screenshot / Receipt</label>
                        
                        {!subOverlayScreenshot ? (
                          <div 
                            className="border-2 border-dashed border-gray-800 hover:border-blue-500/40 bg-[#121624]/40 rounded-xl p-4 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer relative"
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                              e.preventDefault();
                              if (e.dataTransfer.files?.[0]) {
                                handleScreenshotFile(e.dataTransfer.files[0]);
                              }
                            }}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => {
                                if (e.target.files?.[0]) {
                                  handleScreenshotFile(e.target.files[0]);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-8 h-8 rounded-full bg-blue-500/5 group-hover:bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400 mb-1 transition-all">
                              <Plus size={14} />
                            </div>
                            <p className="text-[10px] text-gray-400 font-extrabold group-hover:text-blue-400 transition-colors">Drag & drop receipt, or click to upload</p>
                            <p className="text-[8px] text-gray-600 mt-0.5">Accepts PNG, JPG, or JPEG up to 2MB</p>
                          </div>
                        ) : (
                          <div className="relative border border-gray-800 rounded-xl overflow-hidden bg-[#121624] p-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <img 
                                src={subOverlayScreenshot} 
                                alt="Transaction Screenshot" 
                                className="w-10 h-10 object-cover rounded border border-gray-850"
                              />
                              <div>
                                <p className="text-white text-[10px] font-bold">Receipt Attached</p>
                                <p className="text-[8px] text-emerald-400 font-bold">Ready to upload</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSubOverlayScreenshot('')}
                              className="p-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                              title="Remove screenshot"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div> {/* Close Right Column */}
                </div> {/* Close Grid Row */}

                {/* Privacy Policy & Terms acceptance checklists */}
                <div className="space-y-2 pt-2 border-t border-gray-800/80">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={subOverlayTermsChecked}
                      onChange={e => setSubOverlayTermsChecked(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-800 bg-[#121624] text-blue-600 mt-0.5 outline-none focus:ring-0"
                    />
                    <div className="text-[9px] text-gray-400 font-medium leading-relaxed">
                      I accept the{' '}
                      <span 
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPrivacyModal(true);
                        }}
                        className="text-blue-400 hover:underline font-extrabold cursor-pointer"
                      >
                        Privacy Policy Summary (View Data Details)
                      </span>{' '}
                      and authorize my profile details and client records to be securely processed.
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={subOverlayRefundChecked}
                      onChange={e => setSubOverlayRefundChecked(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-800 bg-[#121624] text-blue-600 mt-0.5 outline-none focus:ring-0"
                    />
                    <span className="text-[9px] text-gray-400 font-medium leading-relaxed">
                      I acknowledge that this transaction is strictly <span className="font-bold text-white uppercase">non-refundable</span> and access depends on manual verification.
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubscriptionOverlay(false);
                      setSubOverlayScreenshot('');
                    }}
                    className="flex-1 bg-gray-900 hover:bg-gray-855 border border-gray-855 text-gray-300 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <X size={12} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={subOverlaySubmitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-transparent border border-emerald-500 text-white font-extrabold py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {subOverlaySubmitting ? 'Submitting...' : <><Save size={12} /> Submit Renewal</>}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* COACH PRIVACY POLICY MODAL */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-[#05050b]/90 backdrop-blur-md z-[60] overflow-y-auto flex flex-col justify-start items-center p-4">
            <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 md:space-y-6 shadow-2xl animate-fade-in my-auto">
              <div className="flex items-center justify-between border-b border-gray-850 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Privacy Policy</h3>
                    <p className="text-[10px] text-gray-500">How LIFE GYM processes and secures your data</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center border border-gray-800 transition-all cursor-pointer text-xs"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4 text-xs text-gray-300 font-bold leading-relaxed font-sans">
                <p>We process the following categories of data securely to manage your Coach Portal access and provide administrative services:</p>
                
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#121624]/60 border border-gray-800">
                    <h4 className="text-white text-[11px] uppercase tracking-wider font-extrabold mb-1">🔑 Account & Profile Information</h4>
                    <p className="text-gray-400 font-medium font-sans">Your email address, username, display name, and encrypted access credentials.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#121624]/60 border border-gray-800">
                    <h4 className="text-white text-[11px] uppercase tracking-wider font-extrabold mb-1">👥 Client & Athlete Rosters</h4>
                    <p className="text-gray-400 font-medium font-sans">Assigned client names, training stats, target logs, schedules, and active workout sheets.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#121624]/60 border border-gray-800">
                    <h4 className="text-white text-[11px] uppercase tracking-wider font-extrabold mb-1">🍏 Nutrition & Fitness Templates</h4>
                    <p className="text-gray-400 font-medium font-sans">Dietary calculations, target nutrition plans, customized exercises, and physical muscle maps.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#121624]/60 border border-gray-800">
                    <h4 className="text-white text-[11px] uppercase tracking-wider font-extrabold mb-1">📊 Composition & InBody Analytics</h4>
                    <p className="text-gray-400 font-medium font-sans">Calculations of body fat percentage, lean mass ratios, and uploaded InBody assessment charts.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#121624]/60 border border-gray-800">
                    <h4 className="text-white text-[11px] uppercase tracking-wider font-extrabold mb-1">💳 Billing & Transactions</h4>
                    <p className="text-gray-400 font-medium font-sans">Payment sender names, transfer telephone numbers, and uploaded transaction receipts. Receipt files are handled locally and are deleted immediately after verification.</p>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 font-medium font-sans">By accepting these terms, you consent to securely store and process this information under encrypted hosting. We do not sell or share your data with third parties.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Understand & Accept
              </button>
            </div>
          </div>
        )}

        {/* COACH SUBSCRIPTION HISTORY LEDGER MODAL */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-[#05050b]/80 backdrop-blur-md z-50 overflow-y-auto flex flex-col justify-start items-center p-4">
            <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 md:space-y-6 shadow-2xl animate-fade-in my-auto">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-855 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">
                    <History size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">SUBSCRIPTION LEDGER</h3>
                    <p className="text-[10px] text-gray-500 font-medium font-sans">Your historical billing receipts log</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center border border-gray-800 transition-all cursor-pointer text-xs"
                >
                  <X size={14} />
                </button>
              </div>

              {/* List / History Ledger container */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {!myCoachProfile?.targets?.subscription_history || myCoachProfile.targets.subscription_history.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 italic space-y-2">
                    <Activity className="w-8 h-8 text-gray-700 mx-auto animate-pulse" />
                    <p className="text-xs">No subscription payments logged for this account yet.</p>
                  </div>
                ) : (
                  myCoachProfile.targets.subscription_history
                    .slice()
                    .reverse()
                    .map((entry: any, index: number) => (
                      <div key={index} className="bg-[#121624]/60 border border-gray-800 p-4 rounded-2xl space-y-2.5 font-bold text-xs text-gray-300">
                        <div className="flex justify-between items-center border-b border-gray-855 pb-2">
                          <span className="text-[10px] font-mono text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                          <span className="text-[9px] bg-blue-500/15 border border-blue-500/20 text-blue-400 uppercase tracking-widest px-2 py-0.5 rounded font-black">
                            Approved
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Extended Plan</p>
                            <p className="text-white mt-0.5">{entry.period}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Amount Paid</p>
                            <p className="text-emerald-400 font-mono mt-0.5">{entry.amount || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-[#090b14]/50 border border-gray-850 rounded-xl text-[10px] font-mono text-gray-400">
                          <p className="flex justify-between">
                            <span>Starts:</span>
                            <span className="text-white">{entry.start_date ? new Date(entry.start_date).toLocaleDateString() : 'N/A'}</span>
                          </p>
                          <p className="flex justify-between mt-1">
                            <span>Expires:</span>
                            <span className="text-white">{entry.end_date ? new Date(entry.end_date).toLocaleDateString() : 'Lifetime'}</span>
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="w-full bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-300 font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X size={13} /> Close Ledger
                </button>
              </div>

            </div>
          </div>
        )}
      </>
    );
  };

  if (isCoachSuspended) {
    return (
      <div className="min-h-screen w-full bg-[#05050b] overflow-y-auto flex flex-col justify-start md:justify-center items-center py-10 px-4 md:px-6">
        <div className="flex flex-col items-center max-w-[400px] w-full text-center my-auto scale-[0.96] origin-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 animate-pulse">
            <ShieldAlert size={22} className="text-red-500" />
          </div>
          <h1 className="text-lg font-black text-white uppercase tracking-wider">Account Suspended</h1>
          <p className="text-gray-400 text-[11px] mt-2 max-w-[300px] leading-relaxed font-bold">
            {coachSuspensionReason}
          </p>

          {coachUserId !== OWNER_ID && (
            <div className="mt-6 bg-[#0b0c16] border border-gray-800 rounded-3xl p-5 w-full text-left font-bold relative overflow-hidden shadow-2xl">
              {/* Glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center gap-2.5 border-b border-gray-800/60 pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CreditCard size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">SUBSCRIPTION PLAN DETAILS</h3>
                  <p className="text-[9px] text-gray-500 leading-tight mt-0.5 font-medium font-sans">Details about your active coaching subscription plan.</p>
                </div>
              </div>

              {/* License & Status */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider">ACCOUNT LICENSE</p>
                  <p className="text-xs font-black text-emerald-400 uppercase mt-0.5 font-mono">PREMIUM LICENSE</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider">SUBSCRIPTION STATUS</p>
                  <p className="text-xs font-black text-red-500 uppercase mt-0.5 font-mono">EXPIRED</p>
                </div>
              </div>

              {/* Privileges */}
              <div className="mt-4 p-3 rounded-xl bg-[#090b14]/60 border border-gray-800/80 space-y-1 text-[10px] leading-relaxed text-gray-400 font-medium font-sans">
                <p className="font-extrabold text-white text-xs uppercase tracking-wider">🌟 PREMIUM COACH LICENSE PRIVILEGES:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Guarantees <span className="text-white font-bold">full administrative access</span> to all client feeds, workouts, diet plans, and body composition logs.</li>
                  <li>Allows hosting and managing <span className="text-white font-bold">up to 50 active athletes</span>.</li>
                  <li>Unlocks the AI Workout Generator, custom workout scheduling, and InBody assessment parsers.</li>
                </ul>
              </div>


              {/* Banners */}
              {myCoachProfile?.targets?.pending_payment && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold animate-pulse">
                  <p className="font-extrabold uppercase mb-0.5">⏳ Verification Pending</p>
                  <p className="text-gray-400 font-sans font-medium text-[10px] leading-relaxed">
                    Your payment for the {myCoachProfile.targets.pending_payment.duration} plan is currently being verified by the administrator.
                  </p>
                </div>
              )}

              {myCoachProfile?.targets?.last_payment_result?.status === 'rejected' && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                  <p className="font-extrabold uppercase mb-0.5">❌ Request Rejected</p>
                  <p className="text-gray-400 font-sans font-medium text-[10px] leading-relaxed">
                    Reason: {myCoachProfile.targets.last_payment_result.reason || 'Invalid verification / receipt details.'}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 mt-4 pt-4 border-t border-gray-800/40">
                <button
                  type="button"
                  disabled={!!myCoachProfile?.targets?.pending_payment}
                  onClick={() => setShowSubscriptionOverlay(true)}
                  className={`flex-1 text-[9px] font-black uppercase tracking-wider py-2 rounded-xl border transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 ${
                    myCoachProfile?.targets?.pending_payment
                      ? 'bg-gray-800/40 text-gray-500 border-transparent cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30 text-white shadow-lg shadow-emerald-500/10'
                  }`}
                >
                  <RefreshCw size={11} className={myCoachProfile?.targets?.pending_payment ? '' : 'animate-spin-slow'} />
                  {myCoachProfile?.targets?.pending_payment ? 'Verification Pending' : 'Renew Subscription'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="px-3 py-2 rounded-xl bg-[#090b14] hover:bg-gray-900 border border-gray-800 hover:text-white transition-all text-[9px] font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 animate-fade-in"
                >
                  <History size={11} />
                  Last Subscriptions
                </button>
              </div>

            </div>
          )}

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/coach-portal';
            }}
            className="mt-5 flex items-center gap-2 py-2 px-4 rounded-xl border border-red-900/40 hover:border-red-700 bg-red-950/20 text-[10px] font-black uppercase text-red-400 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <LogOut size={11} /> Sign Out / Log Out
          </button>
        </div>
        {renderSubscriptionModals()}
      </div>
    );
  }

  // --- Financial Dashboard Helpers ---
  const parseEgp = (amountStr: string): number => {
    if (!amountStr) return 0;
    const num = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const getAuditLogs = () => {
    const logs: any[] = [];
    systemCoaches.forEach(coach => {
      const tg = coach.targets || {};
      
      // 1. Approved history
      if (Array.isArray(tg.subscription_history)) {
        tg.subscription_history.forEach((entry: any, index: number) => {
          logs.push({
            id: `${coach.id}-approved-${index}-${entry.timestamp}`,
            coachId: coach.id,
            coachName: coach.display_name || coach.email || 'Unknown Coach',
            coachEmail: coach.email || 'N/A',
            timestamp: entry.timestamp,
            amount: entry.amount || '0 EGP',
            duration: entry.duration || 'N/A',
            status: 'approved',
            details: entry.details || `${entry.duration || 'Plan'} subscription approved`
          });
        });
      }
      
      // 2. Pending payment
      if (tg.pending_payment) {
        const p = tg.pending_payment;
        logs.push({
          id: `${coach.id}-pending`,
          coachId: coach.id,
          coachName: coach.display_name || coach.email || 'Unknown Coach',
          coachEmail: coach.email || 'N/A',
          timestamp: p.timestamp || new Date().toISOString(),
          amount: p.amount || '0 EGP',
          duration: p.duration || 'N/A',
          status: 'pending',
          details: `Awaiting Approval (${p.method || 'Wallet'}: ${p.phone || p.username || 'N/A'})`
        });
      }
      
      // 3. Rejected last payment
      if (tg.last_payment_result && tg.last_payment_result.status === 'rejected') {
        const r = tg.last_payment_result;
        logs.push({
          id: `${coach.id}-rejected-${r.timestamp}`,
          coachId: coach.id,
          coachName: coach.display_name || coach.email || 'Unknown Coach',
          coachEmail: coach.email || 'N/A',
          timestamp: r.timestamp || new Date().toISOString(),
          amount: r.amount || '0 EGP',
          duration: r.plan || 'N/A',
          status: 'rejected',
          details: `Rejected: ${r.reason || 'Invalid verification'}`
        });
      }
    });
    
    // Sort chronologically (latest first)
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const handleApprovePaymentDirect = async (coachId: string) => {
    setProcessingPaymentId(coachId);
    try {
      const coach = profiles.find(p => p.id === coachId);
      if (!coach) throw new Error("Coach profile not found");
      const tg = { ...(coach.targets || {}) };
      const pending = tg.pending_payment;
      if (!pending) throw new Error("No pending payment request found");
      
      const duration = pending.duration || '1 month';
      const amount = pending.amount || '3,500 EGP';
      
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
        duration,
        amount,
        status: 'approved',
        details: `Approved by Owner (${pending.method || 'Direct'}: ${pending.phone || pending.username || 'N/A'})`
      };
      
      const history = Array.isArray(tg.subscription_history) ? [...tg.subscription_history] : [];
      history.push(newHistoryEntry);
      
      const updatedTargets = {
        ...tg,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        subscription_duration: duration,
        subscription_history: history,
        last_payment_result: {
          status: 'approved',
          timestamp: now.toISOString(),
          plan: duration,
          amount
        }
      };
      delete updatedTargets.pending_payment;
      
      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', coachId);
        
      if (error) throw error;
      
      setProfiles(prev => prev.map(p => p.id === coachId ? { ...p, targets: updatedTargets } : p));
      toast.success(`Approved plan for ${coach.display_name || 'Coach'}`);

      // Trigger WhatsApp approved notification (non-blocking background fetch)
      if (updatedTargets.phone_number) {
        (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            await fetch(`/api/user-management?action=whatsapp-event`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                event: 'sub_approved',
                phone: updatedTargets.phone_number,
                variables: {
                  display_name: coach.display_name || 'Coach',
                  plan: duration,
                  amount: amount,
                  end_date: endDate.toLocaleDateString()
                }
              })
            });
          } catch (waErr) {
            console.error('Failed to trigger WhatsApp sub_approved event:', waErr);
          }
        })();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to approve payment");
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleRejectPaymentDirect = async (coachId: string, reason: string) => {
    setProcessingPaymentId(coachId);
    try {
      const coach = profiles.find(p => p.id === coachId);
      if (!coach) throw new Error("Coach profile not found");
      const tg = { ...(coach.targets || {}) };
      const pending = tg.pending_payment;
      if (!pending) throw new Error("No pending payment request found");
      
      const now = new Date();
      const updatedTargets = {
        ...tg,
        last_payment_result: {
          status: 'rejected',
          timestamp: now.toISOString(),
          reason,
          plan: pending.duration,
          amount: pending.amount
        }
      };
      delete updatedTargets.pending_payment;
      
      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', coachId);
        
      if (error) throw error;
      
      setProfiles(prev => prev.map(p => p.id === coachId ? { ...p, targets: updatedTargets } : p));
      toast.success(`Rejected plan for ${coach.display_name || 'Coach'}`);

      // Trigger WhatsApp rejected notification (non-blocking background fetch)
      if (tg.phone_number) {
        (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            await fetch(`/api/user-management?action=whatsapp-event`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                event: 'sub_rejected',
                phone: tg.phone_number,
                variables: {
                  display_name: coach.display_name || 'Coach',
                  plan: pending.duration,
                  amount: pending.amount,
                  reason: reason
                }
              })
            });
          } catch (waErr) {
            console.error('Failed to trigger WhatsApp sub_rejected event:', waErr);
          }
        })();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to reject payment");
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleSendWhatsAppReminder = async (phone: string, displayName: string, daysRemainingLabel: string) => {
    let daysStr = 'few';
    const match = daysRemainingLabel.match(/(\d+)\s+days?/i);
    if (match) {
      daysStr = match[1];
    } else if (daysRemainingLabel.includes('today')) {
      daysStr = '0';
    }
    
    const toastId = toast.loading(`Sending expiration alert to ${displayName}...`);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`/api/user-management?action=whatsapp-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event: 'sub_expiring',
          phone,
          variables: {
            display_name: displayName,
            days_remaining: daysStr
          }
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send WhatsApp reminder.');
      }
      
      toast.success(`Expiration reminder sent successfully to ${displayName}!`, { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send WhatsApp reminder.', { id: toastId });
    }
  };

  const triggerWhatsAppEvent = async (event: string, phone: string, variables: Record<string, string>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      await fetch(`/api/user-management?action=whatsapp-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ event, phone, variables })
      });
    } catch (err) {
      console.error(`Failed to trigger WhatsApp event ${event}:`, err);
    }
  };

  const handleSavePlanPricesDirect = async () => {
    setUpdatingPlanPrices(true);
    try {
      const prices = {
        '2 weeks': `${parseFloat(editPrices2Weeks.replace(/,/g, '')).toLocaleString()} EGP`,
        '1 month': `${parseFloat(editPrices1Month.replace(/,/g, '')).toLocaleString()} EGP`,
        '3 months': `${parseFloat(editPrices3Months.replace(/,/g, '')).toLocaleString()} EGP`,
        '6 months': `${parseFloat(editPrices6Months.replace(/,/g, '')).toLocaleString()} EGP`
      };
      
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('targets')
        .eq('id', OWNER_ID)
        .maybeSingle();
        
      const updatedTargets = {
        ...(ownerProfile?.targets || {}),
        plan_prices: prices
      };
      
      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', OWNER_ID);
        
      if (error) throw error;
      
      setPlanPrices(prices);
      // Sync local profiles list
      setProfiles(prev => prev.map(p => p.id === OWNER_ID ? { ...p, targets: updatedTargets } : p));
      toast.success("Pricing configuration updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update pricing settings.");
    } finally {
      setUpdatingPlanPrices(false);
    }
  };

  const handleExitTutorial = () => {
    setIsTutorialModeActive(false);
    setShowTutorial(false);
    setTutorialStep(1);
    setSpotlightIndex(0);
    setDeploySuccessData(null);
    setSimulatedDeployedClient(null);
    setDeployStep(1);
    setSelectedClientId(null);
    setSelectedClientProfile(null);
    setManagementSelectedClientId('');
    setManagementClientProfile(null);
    setActiveTab('overview');
    setFormData({
      displayName: '',
      username: '',
      password: '',
      clientCode: '',
      contactEmail: '',
      phoneNumber: '',
      age: '',
      height: '',
      experience_level: 'beginner',
      subscriptionPeriod: '1 month',
      subscriptionStartDelay: '0',
      customSubscriptionEnd: '',
      injuries_notes: '',
      goals: ''
    });
    fetchBaseData();
  };

  const renderGuidedTutorial = () => {
    // Step 1: Welcome Screen
    if (tutorialStep === 1) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#060713]/95 backdrop-blur-md">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#111326] border border-white/[0.06] rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 flex items-center justify-center border border-blue-500/20 mx-auto mb-6 shadow-lg shadow-blue-500/5">
              <img src="/icon.svg" alt="Life Gym Logo" className="w-10 h-10 object-contain" />
            </div>

            <h3 className="text-xl font-black text-white tracking-tight uppercase">
              Welcome, {myCoachProfile?.display_name || 'Coach'}!
            </h3>
            
            <p className="text-xs text-gray-400 mt-3 max-w-[280px] mx-auto leading-relaxed">
              Let's walk you through the portal features. We will inject simulated athletes and simulate operations so you can see how it works in real-time.
            </p>

            <button
              onClick={() => {
                setActiveTab('deploy');
                setDeployStep(1);
                setFormData({
                  displayName: 'Thor Odinson',
                  username: 'thor_god_of_thunder',
                  password: 'mjolnir_password',
                  clientCode: '2011',
                  contactEmail: 'thor@asgard.com',
                  phoneNumber: '+1-555-ASGARD',
                  age: '1500',
                  height: '198',
                  experience_level: 'advanced',
                  subscriptionPeriod: '12 months',
                  subscriptionStartDelay: '0',
                  customSubscriptionEnd: '',
                  injuries_notes: 'Missing right eye, reconstructed with prosthetic. Prone to lightning discharges.',
                  goals: 'Maintain lightning channel capacity, cardiorespiratory endurance, and high volume lifting.'
                });
                setTutorialStep(2);
                setSpotlightIndex(0);
              }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all cursor-pointer mt-8 flex items-center justify-center gap-2"
            >
              <span>Start Walkthrough</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      );
    }

    // Step 2: Interactive Spotlight Tour
    if (tutorialStep === 2) {
      const tourSteps = [
        {
          title: "Deploy Wizard — Identity",
          desc: "Step 1: Identity and Auth Credentials. Register a client profile by specifying their name, handle, age, height, phone number, and a custom secure passcode. We've prefilled Thor Odinson's profile to get started."
        },
        {
          title: "Deploy Wizard — Workouts Split",
          desc: "Step 2: Training Split & Weekly Schedule defaults. Look at the default Push, Pull, and Legs templates. The Push accordion automatically opens to display planned exercises."
        },
        {
          title: "Deploy Wizard — Nutrition",
          desc: "Step 3: Nutrition targets. Establish base work-day calories and macronutrient splits (Protein, Carbs, Fat) along with rest-day overrides."
        },
        {
          title: "Deploy Wizard — Biometrics & Setup",
          desc: "Step 4: Baseline Biometrics. Review final details, upload optional InBody scan files, and click Deploy to trigger the simulated deployment sequence."
        },
        {
          title: "Dossier: Overview Tab",
          desc: "The Overview tab displays the athlete's key biometrics: current body weight, height, age, active daily targets (Calories, Protein, Carbs, Fat, Water), and daily macro charts. It provides an immediate snapshot of their baseline physical profile."
        },
        {
          title: "Dossier: Diet Logs Tab",
          desc: "This tab monitors daily food entries logged by the athlete. Tap any logged entry to review a detailed receipt breakdown of meals, macronutrients, and logged times. Ideal for auditing diet adherence in real-time."
        },
        {
          title: "Dossier: Water Logs Tab",
          desc: "Track daily hydration benchmarks against the active target goal. Review historical daily timeline water logs, log instant intake volumes, or clear the day's records."
        },
        {
          title: "Dossier: Training Plans Tab",
          desc: "Review the client's current weekly training splits. Click on individual split day cards (e.g. Push, Pull, Legs) to preview exercise descriptions, target sets, reps, and rest periods, and configure work or rest day types."
        },
        {
          title: "Dossier: InBody Scans Tab",
          desc: "Analyze body composition scans. View progress metrics like Skeletal Muscle Mass (SMM), Percent Body Fat (PBF), and Segmental Lean distribution (analyzing muscle balance across both arms, legs, and trunk)."
        },
        {
          title: "Dossier: History Timeline",
          desc: "The chronological feed lists every single completion record for this athlete: workouts completed, diet logs saved, water logs updated, and weight scans recorded, providing a complete historical narrative."
        },
        {
          title: "Athlete Control Center",
          desc: "Manage athlete login credentials, suspend/restore access, set AI Coach query quotas, or completely delete client profiles."
        }
      ];

      const currentTour = tourSteps[spotlightIndex];

      return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {spotlightRect && (
            <div 
              className="fixed inset-0 bg-[#060713]/85 pointer-events-auto"
              style={{
                clipPath: `polygon(
                  0% 0%, 
                  0% 100%, 
                  ${spotlightRect.left}px 100%, 
                  ${spotlightRect.left}px ${spotlightRect.top}px, 
                  ${spotlightRect.left + spotlightRect.width}px ${spotlightRect.top}px, 
                  ${spotlightRect.left + spotlightRect.width}px ${spotlightRect.top + spotlightRect.height}px, 
                  ${spotlightRect.left}px ${spotlightRect.top + spotlightRect.height}px, 
                  ${spotlightRect.left}px 100%, 
                  100% 100%, 
                  100% 0%
                )`
              }}
            />
          )}

          {spotlightRect && (
            <motion.div 
              layoutId="spotlight-ring"
              className="fixed border-2 border-blue-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] z-[101]"
              style={{
                top: spotlightRect.top - 4,
                left: spotlightRect.left - 4,
                width: spotlightRect.width + 8,
                height: spotlightRect.height + 8,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            />
          )}

          {spotlightRect && (
            <motion.div
              layoutId="spotlight-card"
              className="fixed bg-[#111326]/95 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 shadow-2xl w-[280px] pointer-events-auto z-[101] flex flex-col tutorial-card"
              style={{
                left: (() => {
                  const cardWidth = 280;
                  
                  // Rule 1: If warning dialog modal or receipt modal is visible, place card to its left!
                  const modalEl = document.getElementById('tutorial-unsaved-modal') || document.getElementById('tutorial-receipt-modal');
                  if (modalEl) {
                    return Math.max(20, spotlightRect.left - cardWidth - 20);
                  }

                  // Rule 2: If spotlight is the sidebar itself, place card to the right of the sidebar
                  if (spotlightIndex === 0) {
                    return spotlightRect.left + spotlightRect.width + 20;
                  }

                  const spaceLeftOfSpotlight = spotlightRect.left - 260; // Space between sidebar (240px + 20px buffer) and spotlight
                  const spaceRight = window.innerWidth - (spotlightRect.left + spotlightRect.width);

                  // Rule 3: Prefer placing card to the left of the spotlight (but keeping it to the right of the sidebar)
                  if (spaceLeftOfSpotlight > cardWidth + 20) {
                    return spotlightRect.left - cardWidth - 20;
                  }
                  // Rule 4: Otherwise place it to the right of the spotlight
                  if (spaceRight > cardWidth + 20) {
                    return spotlightRect.left + spotlightRect.width + 20;
                  }
                  // Fallback: place it in the bottom-left sidebar area (leaves top sidebar menu active item visible)
                  return 20;
                })(),
                top: (() => {
                  const cardHeight = 250;
                  const cardWidth = 280;
                  // If warning dialog modal or receipt modal is visible, align card vertically with it
                  const modalEl = document.getElementById('tutorial-unsaved-modal') || document.getElementById('tutorial-receipt-modal');
                  if (modalEl) {
                    return Math.max(40, Math.min(window.innerHeight - cardHeight - 40, spotlightRect.top + 20));
                  }
                  // If fallback to sidebar area, place card at the bottom-left of the screen
                  const spaceLeftOfSpotlight = spotlightRect.left - 260;
                  const spaceRight = window.innerWidth - (spotlightRect.left + spotlightRect.width);
                  if (spotlightIndex !== 0 && spaceLeftOfSpotlight <= cardWidth + 20 && spaceRight <= cardWidth + 20) {
                    return window.innerHeight - cardHeight - 40;
                  }
                  // Otherwise keep card aligned with spotlight top
                  return Math.max(40, Math.min(window.innerHeight - cardHeight - 40, spotlightRect.top));
                })()
              }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                {currentTour.title}
              </h4>
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                {currentTour.desc}
              </p>

              <div className="flex items-center gap-1.5 mt-4">
                {tourSteps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${i === spotlightIndex ? 'w-4 bg-blue-500' : 'w-1.5 bg-white/10'}`} 
                  />
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-3 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => {
                    if (spotlightIndex === 4) {
                      setDeploySuccessData(null);
                      setSimulatedDeployedClient(null);
                      setSpotlightIndex(3);
                    } else if (spotlightIndex > 0) {
                      setSpotlightIndex(spotlightIndex - 1);
                    }
                  }}
                  className={`text-[9px] font-black uppercase tracking-wider cursor-pointer bg-transparent border-none py-1 transition-colors ${spotlightIndex > 0 ? 'text-gray-400 hover:text-white' : 'text-gray-600 pointer-events-none'}`}
                  disabled={isSimulatingDeployment}
                >
                  Back
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    if (spotlightIndex < 3) {
                      setSpotlightIndex(spotlightIndex + 1);
                    } else if (spotlightIndex === 3) {
                      setIsSimulatingDeployment(true);
                      setTimeout(() => {
                        setDeploySuccessData({
                          displayName: 'Thor Odinson',
                          clientCode: '2011',
                          username: 'thor_god_of_thunder',
                          password: 'mjolnir_password'
                        });
                        setSimulatedDeployedClient({
                          id: 'fake_deployed_thor',
                          display_name: 'Thor Odinson',
                          username: 'thor_god_of_thunder',
                          role: 'client',
                          coach_id: 'tutorial_coach',
                          targets: {
                            client_code: '2011',
                            kcal: 4000,
                            protein: 250,
                            carbs: 450,
                            fat: 90,
                            water_goal_ml: 5000,
                            ai_quota_limit: 50,
                            subscription_duration: '12 months',
                            subscription_delay_days: '0',
                            is_deactivated: false
                          }
                        });
                        setIsSimulatingDeployment(false);
                        fetchClientDetails('fake_deployed_thor', true);
                        setSpotlightIndex(4);
                      }, 2000);
                    } else if (spotlightIndex >= 4 && spotlightIndex < 10) {
                      setSpotlightIndex(spotlightIndex + 1);
                    } else if (spotlightIndex === 10) {
                      setTutorialStep(3);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  disabled={isSimulatingDeployment}
                >
                  {isSimulatingDeployment ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deploying...
                    </span>
                  ) : (
                    spotlightIndex === tourSteps.length - 1 ? 'Finish Tour' : (spotlightIndex === 3 ? 'Deploy Athlete' : 'Next')
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (coachUserId) {
                    localStorage.setItem(`lifegym_tutorial_completed_${coachUserId}`, 'true');
                  }
                  handleExitTutorial();
                }}
                className="text-right text-[8px] text-gray-500 hover:text-red-400 mt-2 font-black uppercase tracking-wider bg-transparent border-none cursor-pointer self-end"
              >
                Skip Tutorial
              </button>
            </motion.div>
          )}
        </div>
      );
    }

    // Step 3: First Action Prompt / Complete
    if (tutorialStep === 3) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#060713]/95 backdrop-blur-md">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#111326] border border-white/[0.06] rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>

            <h3 className="text-lg font-black text-white tracking-tight uppercase">
              Tutorial Completed!
            </h3>
            
            <p className="text-xs text-gray-400 mt-3 max-w-[280px] mx-auto leading-relaxed">
              Your portal dashboard has been restored to your live database roster. You are ready to start coaching!
            </p>

            <div className="space-y-2.5 mt-8">
              <button
                type="button"
                onClick={() => {
                  if (coachUserId) {
                    localStorage.setItem(`lifegym_tutorial_completed_${coachUserId}`, 'true');
                  }
                  handleExitTutorial();
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Finish & Close</span>
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className={`h-screen bg-[#05050b] text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden no-scrollbar ${showTutorial && tutorialStep === 2 ? 'tutorial-mode-active' : ''}`}>
      {/* Warning banner for trials / low remaining duration */}
      {showCoachWarningBanner && (
        <div className="w-full py-2.5 px-8 flex items-center justify-between text-xs font-medium select-none z-50 bg-[#080914]/90 border-b border-white/[0.05] backdrop-blur-md text-gray-300">
          <div className="flex items-center gap-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
            <span className="tracking-wide text-gray-400 font-sans text-xs">
              {isTrialActive 
                ? `Free Trial Active — Access expires in ` 
                : `Subscription Expiring Soon — Renew in `}
              <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/5 border border-amber-500/15 px-2.5 py-0.5 rounded-full ml-2 shadow-inner">
                {coachCountdownText}
              </span>
            </span>
          </div>
          <button 
            onClick={() => handleSidebarTabClick('profile', true)}
            className="group relative overflow-hidden text-[10px] font-bold tracking-wider bg-[#0d0e1a] hover:bg-[#121424] border border-amber-500/25 hover:border-amber-500/40 text-amber-400 hover:text-amber-300 px-3.5 py-1.5 rounded-lg transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-inner"
          >
            {/* Elegant light sweep shimmer */}
            <span className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            
            <Crown size={11} className="text-amber-500/80 group-hover:text-amber-400 transition-colors" />
            <span>{isTrialActive ? 'Upgrade License' : 'Manage Subscription'}</span>
          </button>
        </div>
      )}      {/* Main Top Header Navbar */}
      <header className="border-b border-gray-800 bg-[#070710]/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3.5">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 512 512" 
            className="w-10 h-10 object-contain select-none"
          >
            <g transform="translate(256 256) rotate(-45)">
              {/* Rod */}
              <rect x="-120" y="-16" width="240" height="32" rx="8" fill="#1f2937" />
              {/* Left weights */}
              <rect x="-110" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
              <rect x="-150" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
              <rect x="-170" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
              {/* Right weights */}
              <rect x="80" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
              <rect x="120" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
              <rect x="160" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
            </g>
          </svg>
          <div>
            <h1 className="text-base font-bold uppercase tracking-widest text-white">
              LIFE GYM
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">Desktop Coach Portal / Version 3.0</p>
          </div>
        </div>

        {/* System Health Check indicator */}
        <div className="flex items-center gap-6 text-xs">
          {coachUserId === OWNER_ID && (
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-xl px-3 py-1.5 font-medium">
              <Database size={13} className={dbHealthy ? 'text-emerald-400' : 'text-red-400'} />
              <span className="text-[10px] text-gray-400">Database:</span>
              <span className={dbHealthy ? 'text-emerald-400 font-black' : 'text-red-400 font-black'}>
                {dbHealthy ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          )}


          {updateStatus.available && (
            <button 
              onClick={handleStartUpdate}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-blue-500/30 hover:border-blue-400 bg-blue-950/40 hover:bg-blue-900/40 text-[10px] font-bold text-blue-400 hover:text-white transition-all active:scale-95 cursor-pointer animate-fade-in"
              title={`Download and install update v${updateStatus.version}`}
            >
              <ArrowUpCircle size={11} className="text-blue-400" /> Update Available (v{updateStatus.version})
            </button>
          )}

          {isRunningInElectron && (
            <button 
              onClick={async () => {
                const toastId = toast.loading("Checking for updates...");
                const electronAPI = (window as any).electronAPI;
                if (!electronAPI) {
                  toast.error("Electron API not found", { id: toastId });
                  return;
                }
                try {
                  const currentVersion = await electronAPI.getAppVersion();
                  const response = await fetch('/app-version.json?t=' + Date.now());
                  if (!response.ok) throw new Error('Failed to fetch version catalog');
                  const data = await response.json();
                  
                  if (data.version && data.version !== currentVersion) {
                    setUpdateStatus({
                      available: true,
                      checking: false,
                      downloading: false,
                      progress: 0,
                      version: data.version
                    });
                    toast.success(`New version v${data.version} is available!`, { id: toastId });
                  } else {
                    toast.success(`You are running the latest version (v${currentVersion})!`, { id: toastId });
                  }
                } catch (err: any) {
                  toast.error("Failed to check updates: " + err.message, { id: toastId });
                }
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-800 hover:border-gray-750 bg-gray-900/60 hover:bg-gray-800 text-[10px] font-bold text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Manually check if a new desktop update is available"
            >
              <RefreshCw size={11} className="text-gray-400" /> Check Updates
            </button>
          )}

          <button 
            onClick={() => {
              setIsTutorialModeActive(true);
              setShowTutorial(true);
              setTutorialStep(1);
              setSpotlightIndex(0);
              setActiveTab('deploy');
              setDeployStep(1);
              setSelectedClientId(null);
              setSelectedClientProfile(null);
              toast.success("Tutorial mode activated! Roster pre-filled with mock athletes.");
            }}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900/60 hover:bg-gray-800 text-[10px] font-bold text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Launch interactive simulated onboarding tutorial"
          >
            <Sparkles size={11} className="text-gray-400" /> Guided Tour
          </button>

          <button 
            onClick={async () => {
              const toastId = toast.loading("Syncing dashboard data...");
              try {
                await fetchBaseData();
                toast.success("Dashboard data synced!", { id: toastId });
              } catch (err) {
                toast.error("Failed to sync data", { id: toastId });
              }
            }}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-emerald-900/40 hover:border-emerald-600 bg-emerald-950/20 text-[10px] font-bold text-emerald-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Refresh database data only"
          >
            <RefreshCw size={11} className="text-emerald-400" /> Sync Data
          </button>

          <button 
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900/60 hover:bg-gray-800 text-[10px] font-bold text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={11} className="text-gray-400" /> : <Maximize size={11} className="text-gray-400" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>

          {!isRunningInElectron && (
            <button 
              onClick={handleHardReload}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-blue-900/40 hover:border-blue-700 bg-blue-950/20 text-[10px] font-bold text-blue-400 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Force browser update and clear cache"
            >
              <RefreshCw size={11} /> Force Update (Hard Reload)
            </button>
          )}

          <button 
            onClick={() => {
              showConfirm(
                'Sign Out',
                'Are you sure you want to sign out?',
                'warning',
                async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/coach-portal';
                }
              );
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
        <aside id="tutorial-sidebar" className="w-[240px] border-r border-gray-850 bg-[#070710]/40 flex flex-col p-4 space-y-1.5">
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 px-3.5 mb-2">Main Navigation</p>
          
          <button 
            id="tutorial-tab-overview"
            onClick={() => handleSidebarTabClick('overview')}
            className={`w-full relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'overview' 
                ? 'border-transparent text-white font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            {activeTab === 'overview' && (
              <motion.div 
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-blue-600 border border-blue-500 rounded-xl z-0 shadow-lg shadow-blue-500/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Activity size={15} className="relative z-10" />
            <span className="relative z-10">Operational Overview</span>
          </button>

          <button 
            id="tutorial-tab-clients"
            onClick={() => handleSidebarTabClick('clients')}
            className={`w-full relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'clients' 
                ? 'border-transparent text-white font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            {activeTab === 'clients' && (
              <motion.div 
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-blue-600 border border-blue-500 rounded-xl z-0 shadow-lg shadow-blue-500/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Users size={15} className="relative z-10" />
            <span className="relative z-10">Athlete Directory</span>
          </button>

          <button 
            id="tutorial-tab-deploy"
            onClick={() => handleSidebarTabClick('deploy')}
            className={`w-full relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'deploy' 
                ? 'border-transparent text-white font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            {activeTab === 'deploy' && (
              <motion.div 
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-blue-600 border border-blue-500 rounded-xl z-0 shadow-lg shadow-blue-500/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <UserPlus size={15} className="relative z-10" />
            <span className="relative z-10">Deploy New Athlete</span>
          </button>

          <button 
            id="tutorial-tab-management"
            onClick={() => handleSidebarTabClick('management')}
            className={`w-full relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'management' 
                ? 'border-transparent text-white font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            {activeTab === 'management' && (
              <motion.div 
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-blue-600 border border-blue-500 rounded-xl z-0 shadow-lg shadow-blue-500/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Settings size={15} className="relative z-10" />
            <span className="relative z-10">Athlete Control</span>
          </button>

          <button 
            onClick={() => handleSidebarTabClick('subscriptions')}
            className={`w-full relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'subscriptions' 
                ? 'border-transparent text-white font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-950/20'
            }`}
          >
            {activeTab === 'subscriptions' && (
              <motion.div 
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-blue-600 border border-blue-500 rounded-xl z-0 shadow-lg shadow-blue-500/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <CreditCard size={15} className="relative z-10" />
            <span className="relative z-10">Subscriptions</span>
          </button>

          <button 
            onClick={() => handleSidebarTabClick('profile')}
            className={`w-full relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'profile' 
                ? 'border-transparent text-white font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            {activeTab === 'profile' && (
              <motion.div 
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-blue-600 border border-blue-500 rounded-xl z-0 shadow-lg shadow-blue-500/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <User size={15} className="relative z-10" />
            <span className="relative z-10">Profile Settings</span>
          </button>

          {coachUserId === OWNER_ID && (
            <button 
              onClick={() => handleSidebarTabClick('system')}
              className={`w-full relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                activeTab === 'system' 
                  ? 'border-transparent text-white font-black' 
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
              }`}
            >
              {activeTab === 'system' && (
                <motion.div 
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-blue-600 border border-blue-500 rounded-xl z-0 shadow-lg shadow-blue-500/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Shield size={15} className="relative z-10" />
              <span className="relative z-10">System Console</span>
            </button>
          )}

          {coachUserId === OWNER_ID && (
            <button 
              onClick={() => handleSidebarTabClick('financials')}
              className={`w-full relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                activeTab === 'financials' 
                  ? 'border-transparent text-white font-black' 
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
              }`}
            >
              {activeTab === 'financials' && (
                <motion.div 
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-blue-600 border border-blue-500 rounded-xl z-0 shadow-lg shadow-blue-500/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <DollarSign size={15} className="relative z-10" />
              <span className="relative z-10">Financial Log</span>
            </button>
          )}
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-73px)]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-6xl animate-fade-in">
              {/* Premium Hero Stats Panel */}
              <div className={`grid grid-cols-1 ${coachUserId === OWNER_ID ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'} gap-6`}>
                {coachUserId === OWNER_ID && (
                  <>
                    {/* Card 1: Total System Accounts */}
                    <div className="rounded-2xl border border-slate-800 bg-[#121624] p-5 shadow-lg transition-all duration-200 hover:border-blue-500/40">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">System Accounts</p>
                          <h3 className="text-2xl font-bold mt-2 font-mono tracking-tight text-white">
                            {profiles.length}
                          </h3>
                        </div>
                        <Users size={18} className="text-blue-500" />
                      </div>
                      <div className="mt-4 text-[9px] text-slate-500 font-medium uppercase tracking-wider">
                        Synced
                      </div>
                    </div>

                    {/* Card 2: Active Coaches */}
                    <div className="rounded-2xl border border-slate-800 bg-[#121624] p-5 shadow-lg transition-all duration-200 hover:border-blue-500/40">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Active Staff</p>
                          <h3 className="text-2xl font-bold mt-2 font-mono tracking-tight text-white">
                            {profiles.filter(p => {
                              if (p.role !== 'coach') return false;
                              if (p.id === OWNER_ID) return true; // Owner is always active
                              const tg = p.targets || {};
                              const isDeact = tg.is_deactivated === true;
                              const isExpired = tg.subscription_end_date && new Date() >= new Date(tg.subscription_end_date);
                              const isPending = tg.subscription_start_date && new Date() < new Date(tg.subscription_start_date);
                              return !isDeact && !isExpired && !isPending;
                            }).length}
                          </h3>
                        </div>
                        <Shield size={18} className="text-blue-500" />
                      </div>
                      <div className="mt-4 text-[9px] text-slate-500 font-medium uppercase tracking-wider">
                        Coaches
                      </div>
                    </div>
                  </>
                )}

                {/* Card 3: Managed Athletes */}
                <div 
                  onClick={handleOpenAnalytics}
                  className="rounded-2xl border border-slate-800 bg-[#121624] p-5 shadow-lg transition-all duration-200 hover:border-blue-500/40 cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {feedFilterMineOnly ? 'My Athletes' : 'Total Athletes'}
                      </p>
                      <h3 className="text-2xl font-bold mt-2 font-mono tracking-tight text-white">
                        {feedFilterMineOnly 
                          ? activeClientsList.filter(c => c.coach_id === OWNER_ID).length 
                          : activeClientsList.length}
                      </h3>
                    </div>
                    <Activity size={18} className="text-blue-500" />
                  </div>
                  <div className="mt-4 text-[9px] text-slate-500 font-medium uppercase tracking-wider">
                    Athlete Analytics
                  </div>
                </div>

                {/* Card 4: System Status */}
                <div className="rounded-2xl border border-slate-800 bg-[#121624] p-5 shadow-lg transition-all duration-200 hover:border-blue-500/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">System Core</p>
                      <h3 className="text-2xl font-bold mt-2 font-sans tracking-tight text-emerald-400">
                        Active
                      </h3>
                    </div>
                    <ShieldCheck size={18} className="text-emerald-400" />
                  </div>
                  <div className="mt-4 text-[9px] text-slate-500 font-medium uppercase tracking-wider">
                    API Uptime: 100%
                  </div>
                </div>
              </div>

              {/* Feed Scope Selector */}
              {coachUserId === OWNER_ID && (
                <div className="rounded-2xl border border-slate-800 bg-[#121624] p-5 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Search size={13} className="text-blue-500" /> Feed Scope Selection
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">
                      Filter feed down to your assigned clients or view all system-wide updates
                    </p>
                  </div>
                  <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => setFeedFilterMineOnly(false)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        !feedFilterMineOnly
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Activity
                    </button>
                    <button
                      onClick={() => setFeedFilterMineOnly(true)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        feedFilterMineOnly
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      My Clients Only
                    </button>
                  </div>
                </div>
              )}

              {/* Feed & Systems Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Workouts Feed */}
                <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                      <Dumbbell size={15} /> Workout Activity Feed
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {refreshingFeed ? 'Syncing...' : 'Live'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                    {recentWorkouts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <Dumbbell size={24} className="mb-2.5 opacity-40" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">No recent completions recorded</p>
                      </div>
                    ) : (
                      recentWorkouts.map((w, idx) => {
                        const name = w.profiles?.display_name || 'Anonymous';
                        const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                        
                        const dayType = w.day_type || 'Rest';
                        let tagClass = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
                        if (dayType.toUpperCase() === 'PULL') tagClass = 'bg-purple-500/10 border-purple-500/20 text-purple-400';
                        if (dayType.toUpperCase() === 'LEGS') tagClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                        if (dayType.toUpperCase() === 'RUN') tagClass = 'bg-amber-500/10 border-amber-500/20 text-amber-400';

                        return (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedReceiptWorkout(w)}
                            className="bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 p-4 rounded-xl flex justify-between items-center text-xs transition-all duration-200 cursor-pointer hover:bg-slate-900 shadow-sm"
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Avatar Icon */}
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-bold shrink-0">
                                {initials}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-white text-xs tracking-tight">{name}</p>
                                  {w.profiles?.client_code && (
                                    <span className="text-[8px] bg-slate-950 border border-slate-800 text-slate-400 px-1 py-0.5 rounded font-bold">
                                      #{w.profiles.client_code}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${tagClass}`}>
                                    {dayType}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-medium">Completed training session</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-slate-200 text-xs font-mono tracking-tight">{formatDayTypeLabel(w.day_type, w.total_volume)}</p>
                              <p className="text-slate-500 font-mono text-[9px] mt-0.5">{w.date}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Diets Feed */}
                <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-455 flex items-center gap-2">
                      <Apple size={15} /> Nutritional Intake Feed
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Live</span>
                    </div>
                  </div>

                  <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                    {recentDiets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <Apple size={24} className="mb-2.5 opacity-40" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">No recent logs recorded</p>
                      </div>
                    ) : (
                      recentDiets.map((d, idx) => {
                        const name = d.profiles?.display_name || 'Anonymous';
                        const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                        const kcal = Math.round(d.daily_totals?.kcal || 0);
                        const protein = Math.round(d.daily_totals?.protein || 0);
                        
                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleOpenDietReceipt(d)}
                            className="bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl flex justify-between items-center text-xs transition-all duration-200 cursor-pointer hover:bg-slate-900 shadow-sm"
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Avatar Icon */}
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-bold shrink-0">
                                {initials}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-white text-xs tracking-tight">{name}</p>
                                  {d.profiles?.client_code && (
                                    <span className="text-[8px] bg-slate-950 border border-slate-800 text-slate-400 px-1 py-0.5 rounded font-bold">
                                      #{d.profiles.client_code}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-emerald-400">
                                    Nutrition
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-medium">Logged macro &amp; calorie values</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-emerald-400 text-xs font-mono tracking-tight">
                                {kcal} kcal <span className="text-slate-500 font-sans font-bold">/</span> {protein}g P
                              </p>
                              <p className="text-slate-550 font-mono text-[9px] mt-0.5">{d.date}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Athletes Analytics Report Modal */}
              {showAthletesAnalytics && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-[#0c0d18] border border-[#1e294b]/60 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-[#1e294b]/30 flex items-center justify-between bg-[#080912]/80">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-blue-400">
                          Athlete Analytics &amp; Subscriptions
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase mt-0.5">
                          Detailed profile insights, age &amp; gender demographics, plan distribution
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportAnalyticsCsv}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-500/30 text-[9px] text-white font-black uppercase tracking-widest cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-emerald-500/5"
                        >
                          Export CSV
                        </button>
                        <button
                          onClick={() => setShowAthletesAnalytics(false)}
                          className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto space-y-6 no-scrollbar">
                      {loadingAnalytics ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          <p className="text-xs text-slate-550 font-bold uppercase tracking-wider">Aggregating athlete metrics...</p>
                        </div>
                      ) : (() => {
                        const athletes = feedFilterMineOnly
                          ? clientsList.filter(c => c.coach_id === coachUserId)
                          : clientsList;
                        const totalCount = athletes.length;
                        
                        // Ages calculations
                        const ages = athletes.map(a => analyticsAges[a.id]).filter(age => typeof age === 'number' && age > 0);
                        const avgAge = ages.length > 0 ? (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1) : 'N/A';
                        
                        const maleAges = athletes
                          .filter(a => a.targets?.gender === 'male')
                          .map(a => analyticsAges[a.id])
                          .filter(age => typeof age === 'number' && age > 0);
                        const avgMaleAge = maleAges.length > 0 ? (maleAges.reduce((sum, age) => sum + age, 0) / maleAges.length).toFixed(1) : 'N/A';
                        
                        const femaleAges = athletes
                          .filter(a => a.targets?.gender === 'female')
                          .map(a => analyticsAges[a.id])
                          .filter(age => typeof age === 'number' && age > 0);
                        const avgFemaleAge = femaleAges.length > 0 ? (femaleAges.reduce((sum, age) => sum + age, 0) / femaleAges.length).toFixed(1) : 'N/A';
                        
                        // Genders
                        const totalMales = athletes.filter(a => a.targets?.gender === 'male').length;
                        const totalFemales = athletes.filter(a => a.targets?.gender === 'female').length;
                        
                        // Plan counts
                        const plans = ['2 weeks', '1 month', '3 months', '6 months', '12 months', '24 months'];
                        const planCounts: Record<string, number> = {};
                        plans.forEach(p => {
                          planCounts[p] = athletes.filter(a => (a.targets?.subscription_duration || '').toLowerCase().trim() === p).length;
                        });
                        const customCount = athletes.filter(a => {
                          const d = (a.targets?.subscription_duration || '').toLowerCase().trim();
                          return d && !plans.includes(d);
                        }).length;
                        const noPlanCount = athletes.filter(a => !a.targets?.subscription_duration).length;
                        
                        // Avg subscription duration
                        const durationMonths = athletes.map(a => {
                          const d = (a.targets?.subscription_duration || '').toLowerCase().trim();
                          if (d === '2 weeks') return 0.5;
                          if (d === '1 month') return 1.0;
                          if (d === '3 months') return 3.0;
                          if (d === '6 months') return 6.0;
                          if (d === '12 months') return 12.0;
                          if (d === '24 months') return 24.0;
                          return null;
                        }).filter(v => v !== null) as number[];
                        const avgSubDuration = durationMonths.length > 0 ? (durationMonths.reduce((sum, v) => sum + v, 0) / durationMonths.length).toFixed(1) : 'N/A';

                        return (
                          <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="p-4 bg-black/40 border border-[#1e294b]/30 rounded-2xl">
                                <p className="text-[9px] font-black uppercase text-slate-550 tracking-wider">Total Active Athletes</p>
                                <p className="text-2xl font-black text-white mt-1.5 font-mono">{totalCount}</p>
                              </div>
                              <div className="p-4 bg-black/40 border border-[#1e294b]/30 rounded-2xl">
                                <p className="text-[9px] font-black uppercase text-slate-550 tracking-wider">Average Age (Overall)</p>
                                <p className="text-2xl font-black text-blue-400 mt-1.5 font-mono">{avgAge} <span className="text-xs text-slate-550 font-bold">yrs</span></p>
                              </div>
                              <div className="p-4 bg-black/40 border border-[#1e294b]/30 rounded-2xl">
                                <p className="text-[9px] font-black uppercase text-slate-550 tracking-wider">Average Male Age</p>
                                <p className="text-2xl font-black text-indigo-400 mt-1.5 font-mono">{avgMaleAge} <span className="text-xs text-slate-550 font-bold">yrs</span></p>
                              </div>
                              <div className="p-4 bg-black/40 border border-[#1e294b]/30 rounded-2xl">
                                <p className="text-[9px] font-black uppercase text-slate-550 tracking-wider">Average Female Age</p>
                                <p className="text-2xl font-black text-pink-400 mt-1.5 font-mono">{avgFemaleAge} <span className="text-xs text-slate-550 font-bold">yrs</span></p>
                              </div>
                            </div>

                            {/* Gender and Subscriptions Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Gender Breakdown */}
                              <div className="p-5 bg-black/20 border border-[#1e294b]/30 rounded-2xl space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-[#1e294b]/20 pb-2">Gender Demographics</h4>
                                <div className="flex gap-4">
                                  <div className="flex-1 p-3 bg-blue-950/20 border border-blue-900/20 rounded-xl text-center">
                                    <span className="text-[9px] font-black uppercase text-blue-400">Males</span>
                                    <p className="text-xl font-black text-white mt-1 font-mono">{totalMales}</p>
                                  </div>
                                  <div className="flex-1 p-3 bg-pink-950/20 border border-pink-900/20 rounded-xl text-center">
                                    <span className="text-[9px] font-black uppercase text-pink-400">Females</span>
                                    <p className="text-xl font-black text-white mt-1 font-mono">{totalFemales}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Average Subscription Duration */}
                              <div className="p-5 bg-black/20 border border-[#1e294b]/30 rounded-2xl space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-[#1e294b]/20 pb-2">Subscription Lifespan</h4>
                                <div className="flex items-center justify-between p-3.5 bg-black border border-[#1e294b]/30 rounded-xl">
                                  <div>
                                    <span className="text-[9px] font-black uppercase text-slate-550">Average Sub Duration</span>
                                    <p className="text-xl font-black text-white mt-0.5 font-mono">{avgSubDuration} <span className="text-xs text-slate-500 font-bold">months</span></p>
                                  </div>
                                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-mono text-xs font-black">
                                    Active Base
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Subscription Plan Distribution */}
                            <div className="p-5 bg-black/20 border border-[#1e294b]/30 rounded-2xl space-y-4">
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-[#1e294b]/20 pb-2">Plan Distributions</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                                {[
                                  { label: '2 Weeks', val: planCounts['2 weeks'] },
                                  { label: '1 Month', val: planCounts['1 month'] },
                                  { label: '3 Months', val: planCounts['3 months'] },
                                  { label: '6 Months', val: planCounts['6 months'] },
                                  { label: '12 Months', val: planCounts['12 months'] },
                                  { label: '24 Months', val: planCounts['24 months'] },
                                  { label: 'Custom', val: customCount },
                                  { label: 'No Plan', val: noPlanCount }
                                ].map((plan, idx) => (
                                  <div key={idx} className="p-3 bg-black border border-[#1e294b]/30 rounded-xl text-center">
                                    <span className="text-[8px] font-black uppercase text-slate-550 block truncate">{plan.label}</span>
                                    <p className="text-lg font-black text-white mt-1 font-mono">{plan.val}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Athlete Directory Table */}
                            <div className="p-5 bg-black/20 border border-[#1e294b]/30 rounded-2xl space-y-4">
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-[#1e294b]/20 pb-2">Athlete Roster Breakdown</h4>
                              <div className="overflow-x-auto max-h-[300px] no-scrollbar">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b border-[#1e294b]/20 text-[9px] font-black uppercase text-slate-550">
                                      <th className="py-2.5 px-3">Code</th>
                                      <th className="py-2.5 px-3">Name</th>
                                      <th className="py-2.5 px-3">Gender</th>
                                      <th className="py-2.5 px-3">Age</th>
                                      <th className="py-2.5 px-3">Subscription</th>
                                      <th className="py-2.5 px-3">Expiration Date</th>
                                      <th className="py-2.5 px-3">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#1e294b]/10 text-slate-350 font-bold">
                                    {athletes.map((c, i) => {
                                      const age = analyticsAges[c.id] || 'Not Set';
                                      let duration = c.targets?.subscription_duration || 'custom';
                                      const expDate = c.targets?.subscription_end_date 
                                        ? formatDateTime(c.targets.subscription_end_date) 
                                        : 'No Expiry';
                                      if (expDate === 'No Expiry' && duration.toLowerCase() === 'none') {
                                        duration = 'unlimited';
                                      }
                                      
                                      const now = new Date();
                                      const isDeactivated = c.targets?.is_deactivated === true;
                                      const isExpired = c.targets?.subscription_end_date && now >= new Date(c.targets.subscription_end_date);
                                      const statusColor = isDeactivated ? 'bg-red-500/10 border-red-500/20 text-red-400' : isExpired ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                                      const statusLabel = isDeactivated ? 'Suspended' : isExpired ? 'Expired' : 'Active';

                                      return (
                                        <tr key={i} className="hover:bg-blue-500/[0.01] transition-colors">
                                          <td className="py-2 px-3 font-mono text-[9px]">#{c.targets?.client_code || 'N/A'}</td>
                                          <td className="py-2 px-3 font-black text-white">{c.display_name}</td>
                                          <td className="py-2 px-3 uppercase text-[10px]">{c.targets?.gender || 'Not Set'}</td>
                                          <td className="py-2 px-3 font-mono">{age}</td>
                                          <td className="py-2 px-3 uppercase text-[10px]">{duration}</td>
                                          <td className="py-2 px-3 font-mono text-[10px] text-slate-550">{expDate}</td>
                                          <td className="py-2 px-3">
                                            <span className={`px-2 py-0.5 border rounded-[6px] text-[8px] font-black uppercase tracking-wider ${statusColor}`}>
                                              {statusLabel}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLIENT DETAILS (Athlete Directory Split View) */}
          {activeTab === 'clients' && (
            <div className="flex gap-6 h-[calc(100vh-140px)] items-stretch">
              
              {/* Left Column: Search & List */}
              <div id="tutorial-client-list-container" className="w-[300px] flex flex-col gap-4 bg-[#111326]/50 border border-white/[0.04] rounded-[22px] p-4 shrink-0 shadow-lg backdrop-blur-md">
                <div className="flex flex-col gap-2.5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={clientSearchQuery}
                      onChange={e => setClientSearchQuery(e.target.value)}
                      placeholder="Search athletes..."
                      className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all"
                    />
                  </div>

                  {coachUserId === OWNER_ID && (
                    <button
                      onClick={() => setDirectoryFilterMineOnly(!directoryFilterMineOnly)}
                      className={`w-full py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                        directoryFilterMineOnly
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                          : 'bg-[#0a0b16]/60 border-white/[0.04] text-gray-400 hover:text-white hover:border-white/[0.15] font-bold'
                      }`}
                    >
                      <Filter size={11} />
                      <span>{directoryFilterMineOnly ? 'My Athletes Only' : 'All System Athletes'}</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
                  {filteredClients.map(client => {
                    const isSelected = selectedClientId === client.id;
                    return (
                      <button
                        key={client.id}
                        onClick={() => handleClientSelectClick(client.id)}
                        className={`w-full p-3.5 rounded-[18px] border text-left transition-all flex items-center gap-3 cursor-pointer relative ${
                          isSelected
                            ? 'border-transparent shadow-md shadow-blue-500/5'
                            : 'bg-[#0a0b16]/40 border-white/[0.03] hover:border-white/[0.08]'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeAthleteIndicator"
                            className="absolute inset-0 bg-blue-600/10 border border-blue-500/30 rounded-[18px] pointer-events-none"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <div className="z-10 flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black flex items-center justify-center text-xs uppercase shrink-0">
                            {client.display_name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              {client.display_name || 'Unnamed Client'}
                              {client.targets?.client_code && (
                                <span className="text-[9px] bg-blue-950/60 border border-blue-800/40 text-blue-400 px-1 py-0.5 rounded font-black tracking-normal">
                                  #{client.targets.client_code}
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">@{client.username}</p>
                          </div>
                          <ChevronRight size={13} className="text-gray-600 shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                  {filteredClients.length === 0 && (
                    <p className="text-xs text-gray-500 italic text-center py-12">No athletes found.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Detail Sheets */}
              <div className="flex-1 bg-[#111326]/30 border border-white/[0.04] rounded-[22px] p-6 overflow-y-auto no-scrollbar relative shadow-lg backdrop-blur-md">
                
                {loadingClientDetails ? (
                  <div className="absolute inset-0 bg-[#0b0c16]/80 flex flex-col items-center justify-center z-20 rounded-[22px]">
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
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedClientProfile.user?.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      id="tutorial-client-tabs-container"
                      className="space-y-6"
                    >
                    
                    {/* Detail Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.05] pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center font-black text-base uppercase shrink-0">
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
                        {(() => {
                          const activeDays = calculateActiveDays(selectedClientProfile.user?.targets);
                          return activeDays > 0 ? (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                              {activeDays} Active Days
                            </span>
                          ) : null;
                        })()}
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
                    <div className="flex border-b border-white/[0.05] gap-4 mt-4 font-sans no-scrollbar overflow-x-auto pb-[2px]">
                      {([
                        { id: 'overview', label: 'Overview', icon: <Activity size={13} /> },
                        { id: 'diet', label: 'Diet Logs', icon: <Apple size={13} /> },
                        { id: 'water', label: 'Water Logs', icon: <Droplets size={13} /> },
                        { id: 'workouts', label: 'Training Plans', icon: <Dumbbell size={13} /> },
                        { id: 'inbody', label: 'InBody Scans', icon: <Scale size={13} /> },
                        { id: 'history', label: 'History', icon: <History size={13} /> },
                      ] as const).map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => handleClientSubTabClick(tab.id)}
                          className={`relative pb-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                            clientActiveTab === tab.id
                              ? 'text-blue-400 font-extrabold'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {tab.icon}
                          {tab.label}
                          {clientActiveTab === tab.id && (
                            <motion.div 
                              layoutId="activeSubTabUnderline"
                              className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500"
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* CLIENT TAB: OVERVIEW */}
                    {clientActiveTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Biometrics row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-[#111326]/50 border border-white/[0.04] p-4 rounded-2xl text-center shadow-md">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1"><Scale size={11} className="text-gray-500" /> Weight</p>
                            <p className="text-sm font-black text-white mt-1.5">{latestWeight ? `${latestWeight} kg` : 'N/A'}</p>
                          </div>
                          <div className="bg-[#111326]/50 border border-white/[0.04] p-4 rounded-2xl text-center shadow-md">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1"><Ruler size={11} className="text-gray-500" /> Height</p>
                            <p className="text-sm font-black text-white mt-1.5">{selectedClientProfile.height ? `${selectedClientProfile.height} cm` : 'N/A'}</p>
                          </div>
                          <div className="bg-[#111326]/50 border border-white/[0.04] p-4 rounded-2xl text-center shadow-md">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1"><Calendar size={11} className="text-gray-500" /> Age</p>
                            <p className="text-sm font-black text-white mt-1.5">{selectedClientProfile.age ? `${selectedClientProfile.age} yrs` : 'N/A'}</p>
                          </div>
                          <div className="bg-[#111326]/50 border border-white/[0.04] p-4 rounded-2xl text-center shadow-md">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1"><Lock size={11} className="text-yellow-500/70" /> Passcode</p>
                            <p className="text-sm font-black text-yellow-500 font-mono mt-1.5">{selectedClientProfile.generated_passcode || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Nutrition targets editor */}
                        <div className="flex flex-col gap-6">
                          <div className="p-6 bg-[#111326]/50 border border-white/[0.04] rounded-[22px] space-y-5 shadow-lg">
                            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 border-b border-white/[0.05] pb-3 flex items-center gap-2">
                              <Activity size={14} /> Nutrition Target Benchmarks
                            </h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Daily Calories (kcal)</label>
                                <input 
                                  type="number" value={targetKcal} onChange={e => setTargetKcal(parseInt(e.target.value) || 0)}
                                  className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-2xl p-3 text-xs text-white outline-none focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all font-bold"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Protein (g)</label>
                                <input 
                                  type="number" value={targetProtein} onChange={e => setTargetProtein(parseInt(e.target.value) || 0)}
                                  className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-2xl p-3 text-xs text-white outline-none focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all font-bold"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Carbs (g)</label>
                                <input 
                                  type="number" value={targetCarbs} onChange={e => setTargetCarbs(parseInt(e.target.value) || 0)}
                                  className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-2xl p-3 text-xs text-white outline-none focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all font-bold"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Fat (g)</label>
                                <input 
                                  type="number" value={targetFat} onChange={e => setTargetFat(parseInt(e.target.value) || 0)}
                                  className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-2xl p-3 text-xs text-white outline-none focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all font-bold"
                                />
                              </div>
                              <div className="space-y-1.5 col-span-2">
                                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Water Goal (Liters)</label>
                                <input 
                                  type="number" step="0.1" value={targetWaterLiters} onChange={e => setTargetWaterLiters(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-2xl p-3 text-xs text-white outline-none focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all font-bold"
                                />
                              </div>
                            </div>

                            <button
                              onClick={handleSaveTargets}
                              disabled={savingTargets}
                              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {savingTargets ? 'Saving Targets...' : <><Save size={13} /> Save Nutrition Targets</>}
                            </button>
                          </div>

                          {/* Nutrition by day type */}
                          <div className="bg-[#111326]/50 border border-white/[0.04] rounded-[22px] p-6 space-y-5 shadow-lg">
                            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 border-b border-white/[0.05] pb-3 flex items-center gap-2">
                              <Activity size={14} /> Day-Type Custom Targets
                            </h3>
                            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                              {athleteDayTypes.map(dt => {
                                const dn = dayNutrition[dt];
                                const isEditing = editingDayType === dt;
                                return (
                                  <div key={dt} className="bg-[#0a0b16]/40 border border-white/[0.04] rounded-2xl overflow-hidden shadow-sm hover:border-white/[0.08] transition-all">
                                    <button
                                      onClick={() => isEditing ? setEditingDayType(null) : handleOpenDayEdit(dt)}
                                      className="w-full flex items-center justify-between py-4 px-5 hover:bg-white/[0.01] transition-colors"
                                    >
                                      <span className={`text-[10px] font-black px-2.5 py-1 rounded border uppercase tracking-wider ${dayColor(dt)}`}>{dt}</span>
                                      {dn ? (
                                        <span className="text-xs md:text-sm text-gray-300 font-bold font-mono">{dn.kcal} kcal · P{dn.protein}g · C{dn.carbs}g · F{dn.fat}g</span>
                                      ) : (
                                        <span className="text-xs text-gray-500 italic font-medium">Default Work Macros</span>
                                      )}
                                    </button>

                                    {isEditing && (
                                      <div className="border-t border-white/[0.05] p-6 space-y-5 bg-[#0a0b16]/60">
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
                                                className="w-full bg-[#111326]/60 border border-white/[0.05] rounded-xl p-3 text-xs text-white text-center font-extrabold shadow-inner focus:border-blue-500/50 outline-none focus:shadow-[0_0_12px_rgba(59,130,246,0.1)] transition-all"
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
                                  const isExpanded = expandedMealId === meal.id;
                                  return (
                                    <div key={meal.id} className="py-3 border-b border-gray-850/40 last:border-0">
                                      <div className="flex justify-between items-center gap-4">
                                        <div 
                                          onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                                          className="flex-1 cursor-pointer hover:opacity-85 transition-opacity"
                                        >
                                          <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-white hover:text-blue-400 transition-colors">{meal.name}</p>
                                            {meal.items && meal.items.length > 0 && (
                                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                                {meal.items.length} {meal.items.length === 1 ? 'food' : 'foods'}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-gray-500 mt-0.5">
                                            {Math.round(mm?.kcal || 0)} kcal · P{Math.round(mm?.protein || 0)}g · C{Math.round(mm?.carbs || 0)}g · F{Math.round(mm?.fat || 0)}g
                                          </p>
                                        </div>
                                        <button 
                                          onClick={() => handleDeleteMeal(meal.id)} 
                                          className="p-2 text-gray-500 hover:text-red-400 rounded-xl transition-colors shrink-0 active:scale-95"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>

                                      {isExpanded && meal.items && meal.items.length > 0 && (
                                        <div className="mt-2.5 pl-3 border-l border-blue-500/30 space-y-1.5">
                                          {meal.items.map((item: any, idx: number) => (
                                            <div key={item.id || idx} className="bg-white/[0.01] border border-white/[0.02] p-2 rounded-xl flex justify-between items-center text-[10px] text-gray-300">
                                              <div>
                                                <p className="font-bold text-gray-200">{item.name}</p>
                                                <p className="text-[9px] text-gray-500 mt-0.5">
                                                  {item.serving_type === 'per_item' 
                                                    ? (item.grams === 1 ? '1 serving' : `${item.grams} servings`) 
                                                    : `${item.grams}g`}
                                                </p>
                                              </div>
                                              <div className="text-right shrink-0 font-medium">
                                                <p className="font-black text-blue-400">{Math.round(item.macros?.kcal || 0)} kcal</p>
                                                <p className="text-[8px] text-gray-500 mt-0.5 font-mono">
                                                  P{Math.round(item.macros?.protein || 0)}g · C{Math.round(item.macros?.carbs || 0)}g · F{Math.round(item.macros?.fat || 0)}g
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
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
                        <div className="bg-[#121624] border border-gray-850 p-5 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">💧</span>
                            <div>
                              <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Water Consumed Progress</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-lg font-black text-white">{(waterTotalMl / 1000).toFixed(2)}L</span>
                                <span className="text-xs text-gray-500">/ {targetWaterLiters}L Goal</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Inline Edit Daily Goal */}
                          <div className="flex items-center gap-2 bg-[#090b11] border border-gray-850 rounded-xl px-3 py-1.5 w-full lg:w-auto justify-between lg:justify-start">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider whitespace-nowrap">Edit Goal:</span>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                step="0.1" 
                                min="0.1"
                                value={targetWaterLiters} 
                                onChange={e => setTargetWaterLiters(parseFloat(e.target.value) || 0)}
                                className="w-16 bg-[#121624] border border-gray-800 rounded-lg p-1 text-xs text-white text-center font-bold outline-none focus:border-sky-500"
                              />
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">L</span>
                            </div>
                            <button
                              onClick={handleSaveTargets}
                              disabled={savingTargets}
                              className="bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 text-white font-black text-[9px] uppercase px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer shadow-md"
                            >
                              {savingTargets ? 'Saving...' : 'Save Target'}
                            </button>
                          </div>

                          <div className="w-full lg:w-48">
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

                        {/* Weekly Schedule Planner */}
                        <div className="bg-[#121624]/30 border border-gray-850 rounded-2xl p-5 space-y-4 font-sans">
                          <h3 className="text-xs font-black uppercase text-blue-400 border-b border-gray-850 pb-2 flex items-center gap-1.5">
                            📅 Weekly Schedule Planner
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                            {getWeekDays(clientActiveDateStr).map(date => {
                              const dayType = clientActiveSchedule?.days?.[date] || 'REST';
                              const isSelectedDay = date === clientActiveDateStr;
                              return (
                                <div 
                                  key={date} 
                                  className={`p-3 rounded-2xl border flex flex-col gap-2 transition-all ${
                                    isSelectedDay 
                                      ? 'bg-blue-600/10 border-blue-500/40 shadow-md' 
                                      : 'bg-[#121624]/50 border-gray-850 hover:border-gray-800'
                                  }`}
                                >
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-200">
                                      {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                                    </span>
                                    <span className="text-[8px] text-gray-500 font-bold">
                                      {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                  <select
                                    value={dayType}
                                    onChange={(e) => handleUpdateClientDayType(date, e.target.value)}
                                    className={`w-full bg-[#0d1220] text-[10px] font-black p-1.5 rounded-lg border outline-none cursor-pointer uppercase ${dayColor(dayType)}`}
                                  >
                                    <option value="REST" className="bg-[#0d1220] text-gray-400">REST</option>
                                    <option value="RUN" className="bg-[#0d1220] text-amber-400">RUN</option>
                                    <option value="RUN + GYM" className="bg-[#0d1220] text-indigo-400">RUN + GYM</option>
                                    {clientWorkoutPlans.map(p => (
                                      <option key={p.id} value={p.plan_type} className="bg-[#0d1220] text-blue-400">
                                        {p.plan_type}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Splits template editor */}
                        <div className="bg-[#121624]/30 border border-gray-800 rounded-3xl p-5 space-y-4 font-sans">
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
                            {[
                              ...clientWorkoutPlans,
                              { id: 'system-run', plan_type: 'RUN', exercises: [], isSystem: true },
                              { id: 'system-run-gym', plan_type: 'RUN + GYM', exercises: [], isSystem: true }
                            ].map(plan => {
                              const dt = plan.plan_type;
                              const isExp = activeSplitEditKey === dt;
                              const isSys = !!plan.isSystem;
                              return (
                                <div key={plan.id} className="py-2.5">
                                  <div className="w-full flex items-center justify-between py-2">
                                    <div 
                                      className="flex items-center gap-2 cursor-pointer"
                                      onClick={() => setActiveSplitEditKey(isExp ? null : dt)}
                                    >
                                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded border uppercase ${dayColor(dt)}`}>{dt}</span>
                                      {isSys ? (
                                        <span className="text-[9px] text-gray-500 font-extrabold uppercase bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">System Template</span>
                                      ) : (
                                        <span className="text-[10px] text-gray-400 font-bold font-sans">({plan.exercises?.length || 0} exercises)</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {!isSys ? (
                                        <>
                                          <button onClick={() => handleRenameSplitDay(plan)} className="p-2 text-gray-500 hover:text-blue-400" title="Rename"><Edit3 size={13} /></button>
                                          <button onClick={() => handleDeleteSplitDay(plan.id)} className="p-2 text-gray-500 hover:text-red-400" title="Delete"><Trash2 size={13} /></button>
                                        </>
                                      ) : (
                                        <span className="p-2 text-gray-600" title="System locked"><Lock size={12} /></span>
                                      )}
                                      <button onClick={() => setActiveSplitEditKey(isExp ? null : dt)} className="p-2 text-gray-500 hover:text-white">{isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                                    </div>
                                  </div>

                                  {isExp && (
                                    <div className="mt-3 bg-[#0d1220] border border-gray-850 p-4 rounded-2xl space-y-4">
                                      {isSys ? (
                                        <div className="text-center py-4 px-2 space-y-2">
                                          <p className="text-xs text-gray-400 font-bold">
                                            {dt === 'RUN' 
                                              ? '🏃 Cardio running session tracked automatically via integration (e.g. Strava) or logged manually by the athlete.'
                                              : '🏃‍♂️ Hybrid Day: Running session + Gym split. The athlete can select their target gym template split when starting the workout.'
                                            }
                                          </p>
                                          <p className="text-[10px] text-gray-500 italic">
                                            This is a built-in system split. Exercises are tracked dynamically and cannot be customized directly here. Use the Weekly Schedule Planner above to schedule or remove this day for the athlete.
                                          </p>
                                        </div>
                                      ) : (
                                        <>
                                          {/* Exercises rows */}
                                          {!plan.exercises || plan.exercises.length === 0 ? (
                                            <p className="text-[10px] text-gray-500 italic py-2 text-center">No exercises added. Use search below.</p>
                                          ) : (
                                            <div className="space-y-1.5 font-sans">
                                              <AnimatePresence initial={false}>
                                                {plan.exercises.map((ex: any, idx: number) => (
                                                  <motion.div 
                                                    key={ex.id || idx}
                                                    initial={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, overflow: 'hidden' }}
                                                    transition={{ duration: 0.25 }}
                                                    className="flex justify-between items-center bg-[#121624] border border-gray-850 rounded-xl p-2.5 text-xs"
                                                  >
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
                                                  </motion.div>
                                                ))}
                                              </AnimatePresence>
                                            </div>
                                          )}

                                          {/* Search Exercises catalog to insert */}
                                          <div className="border-t border-gray-850 pt-3 space-y-2 relative">
                                            <div className="relative">
                                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                                              <input 
                                                type="text" value={searchExerciseQuery} onChange={e => setSearchExerciseQuery(e.target.value)}
                                                placeholder="Search catalog to add exercise..."
                                                className="w-full bg-[#121624] border border-gray-850 rounded-xl py-2 pl-9 pr-8 text-xs text-white outline-none focus:border-blue-500 font-sans"
                                              />
                                              {searchExerciseQuery && <button onClick={() => setSearchExerciseQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><X size={12} /></button>}
                                            </div>

                                            {searchExerciseQuery && (
                                              <div className="bg-[#121624] border border-gray-850 rounded-xl overflow-hidden shadow-2xl max-h-[160px] overflow-y-auto">
                                                {filteredCatalog.length === 0 ? (
                                                  <p className="text-[10px] text-gray-500 italic p-3 text-center">No exercises found.</p>
                                                ) : (
                                                  filteredCatalog.map(ex => (
                                                    <button 
                                                      key={ex.id} 
                                                      onClick={() => handleAddExerciseToSplit(dt, ex)}
                                                      className="w-full text-left px-3 py-2 text-xs hover:bg-blue-600/20 flex justify-between border-b border-gray-800/60 last:border-0 font-sans"
                                                    >
                                                      <span className="font-bold text-gray-200">{ex.name}</span>
                                                      <span className="text-[8px] bg-gray-800 border border-gray-700 text-gray-500 font-extrabold px-1.5 py-0.5 rounded uppercase">{ex.muscle_group}</span>
                                                    </button>
                                                  ))
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      )}
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
                        <div className="bg-[#111326]/50 border border-white/[0.04] p-6 rounded-[22px] flex flex-col sm:flex-row items-center justify-between relative overflow-hidden gap-4 shadow-lg backdrop-blur-md">
                          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] pointer-events-none" />
                          <div className="flex-1 text-center sm:text-left z-10">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                              <FileText size={15} className="text-blue-400" /> Bulk Import InBody CSV
                            </h3>
                            <p className="text-[10px] text-gray-400 mt-1">Upload the athlete's exported CSV to sync body composition trends immediately.</p>
                          </div>
                          <label className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition-all cursor-pointer shadow-md active:scale-95 shrink-0 z-10 text-center w-full sm:w-auto">
                            <input 
                              type="file" ref={fileInputRef} accept=".csv" className="hidden"
                              onChange={handleCSVUpload} disabled={isImporting}
                            />
                            {isImporting ? 'Importing...' : 'Upload CSV'}
                          </label>
                        </div>

                        {/* Log manual InBody scan */}
                        <div className="bg-[#111326]/50 border border-white/[0.04] rounded-[22px] overflow-hidden shadow-lg">
                          <div className="flex items-center justify-between p-5 border-b border-white/[0.05] bg-white/[0.01]">
                            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400">Log Manual Scan</h3>
                            <button onClick={() => setShowAddScanForm(!showAddScanForm)} className="text-xs font-black text-blue-400 hover:text-white cursor-pointer flex items-center gap-1 transition-colors">
                              <Plus size={13} /> {showAddScanForm ? 'Cancel' : 'New Scan'}
                            </button>
                          </div>

                          {showAddScanForm && (
                            <form onSubmit={handleAddInBodyScan} className="p-6 space-y-4 bg-[#0a0b16]/40">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="text-[8px] text-gray-500 block mb-1.5 font-bold uppercase tracking-wider">Scan Date</label>
                                  <input type="date" value={newScanDate} onChange={e => setNewScanDate(e.target.value)} required className="w-full bg-[#111326]/60 border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500/50 font-bold focus:shadow-[0_0_12px_rgba(59,130,246,0.1)] transition-all" />
                                </div>
                                <div>
                                  <label className="text-[8px] text-gray-500 block mb-1.5 font-bold uppercase tracking-wider">InBody Score</label>
                                  <input type="number" value={newScanScore} onChange={e => setNewScanScore(parseInt(e.target.value) || 0)} className="w-full bg-[#111326]/60 border border-white/[0.05] rounded-xl p-3 text-xs text-white text-center font-bold outline-none focus:border-blue-500/50 focus:shadow-[0_0_12px_rgba(59,130,246,0.1)] transition-all" />
                                </div>
                                <div>
                                  <label className="text-[8px] text-gray-500 block mb-1.5 font-bold uppercase tracking-wider">Weight (kg)</label>
                                  <input type="number" step="any" required placeholder="e.g. 78.5" value={newScanWeight} onChange={e => setNewScanWeight(e.target.value)} className="w-full bg-[#111326]/60 border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500/50 focus:shadow-[0_0_12px_rgba(59,130,246,0.1)] transition-all font-bold" />
                                </div>
                                <div>
                                  <label className="text-[8px] text-gray-500 block mb-1.5 font-bold uppercase tracking-wider">Body Fat %</label>
                                  <input type="number" step="any" placeholder="e.g. 14.8" value={newScanBfPercent} onChange={e => setNewScanBfPercent(e.target.value)} className="w-full bg-[#111326]/60 border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500/50 focus:shadow-[0_0_12px_rgba(59,130,246,0.1)] transition-all font-bold" />
                                </div>
                                <div className="col-span-2 md:col-span-4">
                                  <label className="text-[8px] text-gray-500 block mb-1.5 font-bold uppercase tracking-wider">Muscle Mass SMM (kg)</label>
                                  <input type="number" step="any" placeholder="e.g. 36.5" value={newScanSmm} onChange={e => setNewScanSmm(e.target.value)} className="w-full bg-[#111326]/60 border border-white/[0.05] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500/50 focus:shadow-[0_0_12px_rgba(59,130,246,0.1)] transition-all font-bold" />
                                </div>
                              </div>
                              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl transition-all shadow-md shadow-blue-600/10 active:scale-95">Save composition record</button>
                            </form>
                          )}
                        </div>

                        {/* Scans list */}
                        <div className="bg-[#111326]/30 border border-white/[0.04] rounded-[22px] p-6 shadow-lg">
                          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-white/[0.05] pb-3">Historical Scans timeline ({clientScans.length})</h3>
                          <div className="divide-y divide-white/[0.04] mt-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                            {clientScans.length === 0 ? (
                              <p className="text-xs text-gray-500 italic py-10 text-center">No InBody scans recorded.</p>
                            ) : (
                              clientScans.map((scan, idx) => {
                                const isExpanded = expandedScanId === scan.id;
                                const prev = idx + 1 < clientScans.length ? clientScans[idx + 1] : null;
                                const seg = scan.segmental || {};

                                return (
                                  <div key={scan.id} className="py-4 border-b border-white/[0.04] last:border-0">
                                    <div className="flex justify-between items-center">
                                      <div className="flex-1 cursor-pointer" onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}>
                                        <p className="text-sm font-black text-white flex items-center gap-1.5">
                                          {new Date(scan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                          {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-1">
                                          Score: <span className="text-emerald-400 font-black">{scan.score || 75}</span>
                                          {idx === 0 && <span className="ml-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black px-1.5 py-0.5 rounded-lg tracking-wider">LATEST</span>}
                                        </p>
                                      </div>
                                      <button onClick={() => handleDeleteScan(scan.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors active:scale-95"><Trash2 size={14} /></button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mt-3.5 cursor-pointer" onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}>
                                      <div className="bg-[#0a0b16]/60 border border-white/[0.04] rounded-2xl p-3.5 text-center shadow-sm hover:border-white/[0.08] transition-all">
                                        <p className="text-[8px] text-gray-500 uppercase font-black tracking-wider mb-1">Weight</p>
                                        <p className="text-xs font-black text-white">{scan.weight} kg{prev && calculateInBodyDelta(scan.weight, prev.weight, true)}</p>
                                      </div>
                                      <div className="bg-[#0a0b16]/60 border border-white/[0.04] rounded-2xl p-3.5 text-center shadow-sm hover:border-white/[0.08] transition-all">
                                        <p className="text-[8px] text-gray-500 uppercase font-black tracking-wider mb-1">Muscle SMM</p>
                                        <p className="text-xs font-black text-blue-400">{scan.smm} kg{prev && calculateInBodyDelta(scan.smm, prev.smm)}</p>
                                      </div>
                                      <div className="bg-[#0a0b16]/60 border border-white/[0.04] rounded-2xl p-3.5 text-center shadow-sm hover:border-white/[0.08] transition-all">
                                        <p className="text-[8px] text-gray-500 uppercase font-black tracking-wider mb-1">Body Fat</p>
                                        <p className="text-xs font-black text-red-400">{scan.bf_percent}%{prev && calculateInBodyDelta(scan.bf_percent, prev.bf_percent, true)}</p>
                                      </div>
                                    </div>

                                    {isExpanded && (
                                      <div className="border-t border-white/[0.05] mt-4 pt-4 space-y-4">
                                        <div className="space-y-4 bg-[#0a0b16]/40 border border-white/[0.04] p-5 rounded-2xl shadow-inner">
                                          <div>
                                            <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Activity size={10} /> Muscle-Fat balance</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="bg-[#111326]/60 border border-white/[0.04] p-2.5 rounded-xl text-xs flex justify-between items-center"><span className="text-gray-500">Skeletal Muscle Mass:</span> <span className="text-white font-black">{scan.smm} kg</span></div>
                                              <div className="bg-[#111326]/60 border border-white/[0.04] p-2.5 rounded-xl text-xs flex justify-between items-center"><span className="text-gray-500">Body Fat Mass:</span> <span className="text-white font-black">{scan.bfm} kg</span></div>
                                            </div>
                                          </div>

                                          <div>
                                            <h4 className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Droplet size={10} /> Body Composition</h4>
                                            <div className="grid grid-cols-3 gap-3">
                                              <div className="bg-[#111326]/60 border border-white/[0.04] p-2.5 rounded-xl text-center text-xs"><p className="text-gray-500 mb-0.5">Water</p><p className="text-white font-black">{seg.tbw || 0}L</p></div>
                                              <div className="bg-[#111326]/60 border border-white/[0.04] p-2.5 rounded-xl text-center text-xs"><p className="text-gray-500 mb-0.5">Protein</p><p className="text-white font-black">{seg.protein || 0}kg</p></div>
                                              <div className="bg-[#111326]/60 border border-white/[0.04] p-2.5 rounded-xl text-center text-xs"><p className="text-gray-500 mb-0.5">Minerals</p><p className="text-white font-black">{seg.minerals || 0}kg</p></div>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Flame size={10} /> Obesity Evaluator</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="bg-[#111326]/60 border border-white/[0.04] p-2.5 rounded-xl text-xs flex justify-between items-center"><span className="text-gray-500">Visceral Fat Level:</span> <span className="text-white font-black">{seg.visceralFat || 0}</span></div>
                                              <div className="bg-[#111326]/60 border border-white/[0.04] p-2.5 rounded-xl text-xs flex justify-between items-center"><span className="text-gray-500">BMR calories:</span> <span className="text-white font-black">{scan.bmr} kcal</span></div>
                                            </div>
                                          </div>

                                          <div className="border-t border-white/[0.05] pt-4">
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

                    {/* CLIENT TAB: HISTORY */}
                    {clientActiveTab === 'history' && (
                      <div className="space-y-6">
                        {/* Header & Export Button */}
                        <div className="flex justify-between items-center bg-[#111326]/50 border border-white/[0.04] rounded-[22px] p-6 shadow-lg backdrop-blur-md">
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400">Unified Logs History</h3>
                            <p className="text-[10px] text-gray-400 mt-1">Timeline of all workouts, running cards, daily diet macros, and water entries.</p>
                          </div>
                          <button
                            onClick={handleExportHistoryToCSV}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5 font-sans shadow-emerald-600/10"
                          >
                            <FileText size={14} /> Export to Excel
                          </button>
                        </div>

                        {/* History Table Card */}
                        <div className="bg-[#111326]/30 border border-white/[0.04] rounded-[22px] p-6 overflow-hidden shadow-lg">
                          {loadingHistory ? (
                            <div className="text-center py-12 text-xs text-gray-500 font-bold flex items-center justify-center gap-2">
                              <RefreshCw className="animate-spin text-blue-500" size={16} /> Loading athlete history logs...
                            </div>
                          ) : getUnifiedHistory().length === 0 ? (
                            <p className="text-xs text-gray-500 italic py-12 text-center">No logs recorded in the historical database.</p>
                          ) : (
                            <div className="overflow-x-auto no-scrollbar">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-white/[0.05] text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <th className="py-3 px-4 pb-4">Date</th>
                                    <th className="py-3 px-4 pb-4">Workouts / Runs</th>
                                    <th className="py-3 px-4 pb-4">Diet &amp; Macros</th>
                                    <th className="py-3 px-4 pb-4 text-center">Water Logs</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04] text-xs">
                                  {getUnifiedHistory().map(row => (
                                    <tr key={row.date} className="hover:bg-white/[0.01] transition-colors">
                                      {/* Date column */}
                                      <td className="py-4.5 px-4 font-black text-white whitespace-nowrap">
                                        {new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                      </td>

                                      {/* Workouts column */}
                                      <td className="py-4.5 px-4">
                                        {row.workouts.length === 0 ? (
                                          <span className="text-gray-600 font-semibold">-</span>
                                        ) : (
                                          <div className="flex flex-col gap-1.5 font-sans">
                                            {row.workouts.map(w => (
                                              <button
                                                key={w.id}
                                                onClick={() => w.status === 'completed' && setSelectedReceiptWorkout(w)}
                                                className={`text-left inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border max-w-fit text-[10px] font-black transition-all ${
                                                  w.status === 'completed'
                                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 cursor-pointer'
                                                    : 'bg-gray-850 text-gray-500 border-gray-800'
                                                }`}
                                              >
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${dayColor(w.day_type || '')}`}>
                                                  {w.day_type || 'GYM'}
                                                </span>
                                                <span>{w.name || 'Workout Session'}</span>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </td>

                                      {/* Diet column */}
                                      <td className="py-4.5 px-4 font-sans">
                                        {row.diet ? (
                                          <button
                                            onClick={() => handleOpenDietReceipt(row.diet)}
                                            className="text-left bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex flex-col gap-0.5"
                                          >
                                            <span className="text-[10px] font-black">{Math.round(row.diet.daily_totals?.kcal || 0)} kcal</span>
                                            <span className="text-[8px] text-gray-500 font-mono">
                                              P{Math.round(row.diet.daily_totals?.protein || 0)}g · C{Math.round(row.diet.daily_totals?.carbs || 0)}g · F{Math.round(row.diet.daily_totals?.fat || 0)}g
                                            </span>
                                          </button>
                                        ) : (
                                          <span className="text-gray-600 font-semibold">-</span>
                                        )}
                                      </td>

                                      {/* Water column */}
                                      <td className="py-4.5 px-4 text-center">
                                        {row.waterMl > 0 ? (
                                          <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-xl text-[10px] font-black font-sans">
                                            <Droplet size={10} className="text-blue-500" />
                                            <span>{(row.waterMl / 1000).toFixed(1)} L</span>
                                          </div>
                                        ) : (
                                          <span className="text-gray-600 font-semibold">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEPLOY NEW ATHLETE (Stepped Wizard Form) */}
          {activeTab === 'deploy' && (
            <div 
              id="tutorial-deploy-container" 
              className="max-w-4xl bg-[#0b0c16] border border-gray-800 rounded-3xl p-8 space-y-6 max-h-[calc(100vh-190px)] overflow-y-auto no-scrollbar"
            >
              
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
                  <div className="bg-gray-950/60 p-5 rounded-2xl space-y-3.5 text-xs font-mono text-gray-300 border border-gray-800/80">
                    <div className="flex items-center justify-between group">
                      <p><span className="text-gray-500">Name:</span> {deploySuccessData.displayName}</p>
                      <button
                        type="button"
                        onClick={() => handleCopyField(deploySuccessData.displayName, 'Name')}
                        className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Name"
                      >
                        {copiedField === 'Name' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      </button>
                    </div>
                    <div className="border-t border-gray-800/40" />
                    <div className="flex items-center justify-between group">
                      <p><span className="text-gray-500">Client Code:</span> #{deploySuccessData.clientCode}</p>
                      <button
                        type="button"
                        onClick={() => handleCopyField(`#${deploySuccessData.clientCode}`, 'Client Code')}
                        className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Client Code"
                      >
                        {copiedField === 'Client Code' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      </button>
                    </div>
                    <div className="border-t border-gray-800/40" />
                    <div className="flex items-center justify-between group">
                      <p><span className="text-gray-500">Username:</span> {deploySuccessData.username}</p>
                      <button
                        type="button"
                        onClick={() => handleCopyField(deploySuccessData.username, 'Username')}
                        className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Username"
                      >
                        {copiedField === 'Username' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      </button>
                    </div>
                    {(() => {
                      const actualEmail = deploySuccessData.contactEmail || deploySuccessData.email || `${deploySuccessData.username}@stride.fit`;
                      if (actualEmail && !actualEmail.endsWith('@stride.fit')) {
                        return (
                          <>
                            <div className="border-t border-gray-800/40" />
                            <div className="flex items-center justify-between group">
                              <p><span className="text-gray-500">Email:</span> {actualEmail}</p>
                              <button
                                type="button"
                                onClick={() => handleCopyField(actualEmail, 'Email')}
                                className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                title="Copy Email"
                              >
                                {copiedField === 'Email' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                              </button>
                            </div>
                          </>
                        );
                      }
                      return null;
                    })()}
                    <div className="border-t border-gray-800/40" />
                    <div className="flex items-center justify-between group">
                      <p><span className="text-gray-500">Passcode:</span> {deploySuccessData.password}</p>
                      <button
                        type="button"
                        onClick={() => handleCopyField(deploySuccessData.password, 'Passcode')}
                        className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Passcode"
                      >
                        {copiedField === 'Passcode' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const loginUrl = `${window.location.origin}/login`;
                      const actualEmail = deploySuccessData.contactEmail || deploySuccessData.email || `${deploySuccessData.username}@stride.fit`;
                      const emailLine = actualEmail.endsWith('@stride.fit') ? '' : `Email: ${actualEmail}\n`;
                      const text = `Athlete Deployed:\nName: ${deploySuccessData.displayName}\nClient Code: #${deploySuccessData.clientCode}\nUsername: ${deploySuccessData.username}\n${emailLine}Passcode: ${deploySuccessData.password}\n\nLogin URL: ${loginUrl}`;
                      navigator.clipboard.writeText(text);
                      toast.success('All credentials copied!');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Copy size={12} /> Copy All Info
                  </button>
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
                              if (showTutorial) return;
                              if (idx + 1 > 1) {
                                setAttemptedStep1Submit(true);
                                if (!isStep1Valid()) {
                                  if (isUsernameTaken) {
                                    toast.error('Username is already taken. Please change it.');
                                  } else if (isClientCodeTaken) {
                                    toast.error('Client Code is already taken. Please change it.');
                                  } else if (deployGender === null) {
                                    toast.error('Please select a sex (Male or Female).');
                                  } else {
                                    toast.error('Please fill in all empty text boxes.');
                                  }
                                  return;
                                }
                              }
                              setDeployStep(idx + 1);
                            }}
                            disabled={showTutorial}
                            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                              showTutorial ? 'cursor-default pointer-events-none' : 'active:scale-90 cursor-pointer'
                            } ${
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
                              className={`w-full h-12 bg-[#121624] border rounded-xl px-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                attemptedStep1Submit && !formData.displayName.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Username / Handle</label>
                            <input 
                              type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: cleanUsername(e.target.value) })}
                              placeholder="e.g. ahmedfit"
                              className={`w-full h-12 bg-[#121624] border rounded-xl px-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                (attemptedStep1Submit && !formData.username.trim()) || isUsernameTaken ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                              }`}
                            />
                            {isUsernameChecking && <p className="text-[8px] text-gray-500 mt-0.5 animate-pulse">Checking availability...</p>}
                            {isUsernameTaken && <p className="text-[8px] text-red-400 font-bold mt-0.5">Username is already taken.</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Access Passcode (min 6 chars)</label>
                            <input 
                              type="text" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                              placeholder="e.g. 123456"
                              className={`w-full h-12 bg-[#121624] border rounded-xl px-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                attemptedStep1Submit && !formData.password.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Client Code (Optional)</label>
                            <input 
                              type="text" value={formData.clientCode} onChange={e => setFormData({ ...formData, clientCode: e.target.value.replace(/\D/g, '') })}
                              placeholder="e.g. 101"
                              className={`w-full h-12 bg-[#121624] border rounded-xl px-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                isClientCodeTaken ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                              }`}
                            />
                            {isClientCodeChecking && <p className="text-[8px] text-gray-500 mt-0.5 animate-pulse">Checking availability...</p>}
                            {isClientCodeTaken && <p className="text-[8px] text-red-400 font-bold mt-0.5">Client Code is already taken.</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Phone Number</label>
                            <input 
                              type="text" required value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value.replace(/[^\d+]/g, '') })}
                              placeholder="e.g. +20 123 456789"
                              className={`w-full h-12 bg-[#121624] border rounded-xl px-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                attemptedStep1Submit && !formData.phoneNumber.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Email Address (Onboarding)</label>
                            <input 
                              type="email" required value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value.trim() })}
                              placeholder="e.g. athlete@gmail.com"
                              className={`w-full h-12 bg-[#121624] border rounded-xl px-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                attemptedStep1Submit && (!formData.contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Gender</label>
                            <div className={`grid grid-cols-2 p-1 bg-[#121624]/60 border rounded-xl relative transition-all h-12 items-center ${
                              attemptedStep1Submit && deployGender === null ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800'
                            }`}>
                              <button
                                type="button" onClick={() => setDeployGender('male')}
                                className={`h-full text-xs font-bold rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${
                                  deployGender === 'male' ? 'text-white' : 'text-gray-500'
                                }`}
                              >
                                Male
                                {deployGender === 'male' && (
                                  <motion.div
                                    layoutId="deploy-gender-pill"
                                    className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-lg z-[-1]"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                  />
                                )}
                              </button>
                              <button
                                type="button" onClick={() => setDeployGender('female')}
                                className={`h-full text-xs font-bold rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${
                                  deployGender === 'female' ? 'text-white' : 'text-gray-550'
                                }`}
                              >
                                Female
                                {deployGender === 'female' && (
                                  <motion.div
                                    layoutId="deploy-gender-pill"
                                    className="absolute inset-0 bg-purple-600/20 border border-purple-500/30 rounded-lg z-[-1]"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                  />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Age</label>
                            <input 
                              type="text" required value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value.replace(/\D/g, '') })} 
                              placeholder="Years" 
                              className={`w-full h-12 bg-[#121624] border rounded-xl px-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                attemptedStep1Submit && !formData.age.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                              }`} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Height (cm)</label>
                            <input 
                              type="text" required value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value.replace(/\D/g, '') })} 
                              placeholder="Centimeters" 
                              className={`w-full h-12 bg-[#121624] border rounded-xl px-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                attemptedStep1Submit && !formData.height.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                              }`} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500">Onboarding Experience Level</label>
                            <select value={formData.experience_level} onChange={e => setFormData({ ...formData, experience_level: e.target.value })} className="w-full h-12 bg-[#121624] border border-gray-800 rounded-xl px-3 text-xs text-white outline-none">
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
                              className="w-full h-12 bg-[#121624] border border-gray-800 rounded-xl px-3 text-xs text-white outline-none font-sans"
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
                              type="text" 
                              required
                              value={formData.subscriptionStartDelay === '0' ? 'Now' : formData.subscriptionStartDelay} 
                              onChange={e => {
                                const val = e.target.value;
                                if (val === '') {
                                  setFormData({ ...formData, subscriptionStartDelay: '' });
                                } else if (val === '0' || val.toLowerCase() === 'now') {
                                  setFormData({ ...formData, subscriptionStartDelay: '0' });
                                } else {
                                  setFormData({ ...formData, subscriptionStartDelay: val.replace(/\D/g, '') });
                                }
                              }} 
                              placeholder="e.g. 3 days" 
                              className={`w-full h-12 bg-[#121624] border rounded-xl px-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                attemptedStep1Submit && !formData.subscriptionStartDelay.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                              }`} 
                            />
                          </div>

                          {formData.subscriptionPeriod === 'custom' && (
                            <div className="space-y-1 col-span-2 mt-1 animate-fadeIn">
                              <label className="text-[9px] font-black uppercase text-indigo-400">Custom End Date &amp; Time (Includes Seconds)</label>
                              <input 
                                type="datetime-local" 
                                step="1"
                                required
                                value={formData.customSubscriptionEnd} 
                                onChange={e => setFormData({ ...formData, customSubscriptionEnd: e.target.value })} 
                                className={`w-full h-12 bg-[#121624] border rounded-xl px-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                  attemptedStep1Submit && !formData.customSubscriptionEnd.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-indigo-500/30 focus:border-indigo-500'
                                }`} 
                              />
                            </div>
                          )}
                          <div className="space-y-1 col-span-2">
                            <label className="text-[9px] font-black uppercase text-gray-500">Injuries &amp; Medical Notes (Optional)</label>
                            <textarea 
                              value={formData.injuries_notes} onChange={e => setFormData({ ...formData, injuries_notes: e.target.value })} 
                              placeholder="Enter details about any injuries, operations, or medical conditions..." 
                              className="w-full bg-[#121624] border border-gray-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all h-20"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: WORKOUTS TEMPLATE PROGRAM */}
                    {deployStep === 2 && (
                      <div className="space-y-4 relative">

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
                                        <AnimatePresence initial={false}>
                                          {split.exercises.map((ex: any, idx: number) => (
                                            <motion.div 
                                              key={ex.id || idx}
                                              initial={{ opacity: 1, height: 'auto' }}
                                              exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, overflow: 'hidden' }}
                                              transition={{ duration: 0.25 }}
                                              className="flex justify-between items-center bg-[#121624] border border-gray-800 p-2.5 rounded-xl text-xs"
                                            >
                                              <div>
                                                <p className="font-bold text-white">{ex.name}</p>
                                                <p className="text-[9px] text-gray-500 font-black uppercase mt-0.5">{ex.muscle_group}</p>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-purple-400 font-extrabold">{ex.sets} sets x {ex.rest}s rest</span>
                                                <button onClick={() => handleRemoveExerciseFromDeploySplit(split.key, ex.id)} className="p-1 text-gray-500 hover:text-red-400"><X size={14} /></button>
                                              </div>
                                            </motion.div>
                                          ))}
                                        </AnimatePresence>
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
                                <input
                                  type="number"
                                  value={deployRestKcal}
                                  onChange={e => {
                                    setDeployIsRestOverridden(true);
                                    setDeployRestKcal(parseInt(e.target.value) || 0);
                                  }}
                                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Protein (g)</label>
                                <input
                                  type="number"
                                  value={deployRestProtein}
                                  onChange={e => {
                                    setDeployIsRestOverridden(true);
                                    setDeployRestProtein(parseInt(e.target.value) || 0);
                                  }}
                                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Carbs (g)</label>
                                <input
                                  type="number"
                                  value={deployRestCarbs}
                                  onChange={e => {
                                    setDeployIsRestOverridden(true);
                                    setDeployRestCarbs(parseInt(e.target.value) || 0);
                                  }}
                                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black">Fat (g)</label>
                                <input
                                  type="number"
                                  value={deployRestFat}
                                  onChange={e => {
                                    setDeployIsRestOverridden(true);
                                    setDeployRestFat(parseInt(e.target.value) || 0);
                                  }}
                                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2 text-xs text-white"
                                />
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

                  {/* Error banner */}
                  {deployError && (
                    <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3">
                      <span className="text-red-400 text-lg">⚠</span>
                      <div className="flex-1">
                        <p className="text-red-400 font-bold text-xs uppercase">Deploy Failed</p>
                        <p className="text-red-300 text-xs mt-1 break-all">{deployError}</p>
                      </div>
                      <button onClick={() => setDeployError(null)} className="text-red-500 hover:text-red-300 text-xs">✕</button>
                    </div>
                  )}

                  {/* Deploy wizard action buttons */}
                  <div className="flex justify-between items-center gap-4 bg-gray-950/20 p-4 border border-gray-800 rounded-2xl">
                    <button 
                      onClick={() => { if (deployStep > 1) setDeployStep(prev => prev - 1); }} 
                      disabled={deployStep === 1 || showTutorial}
                      className="px-4 py-2.5 bg-gray-900 border border-gray-850 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded-xl text-xs uppercase font-black"
                    >
                      Back Step
                    </button>
                    {deployStep < 4 ? (
                      <button 
                        onClick={async () => {
                          if (deployStep === 1) {
                            setAttemptedStep1Submit(true);
                            if (!isStep1Valid()) {
                              if (isUsernameTaken) {
                                toast.error('Username is already taken. Please change it.');
                              } else if (isClientCodeTaken) {
                                toast.error('Client Code is already taken. Please change it.');
                              } else if (deployGender === null) {
                                toast.error('Please select a sex (Male or Female).');
                              } else {
                                toast.error('Please fill in all empty text boxes.');
                              }
                              return;
                            }

                            // Validate client email address (skip if virtual email)
                            const emailVal = formData.contactEmail.trim().toLowerCase();
                            if (!emailVal.endsWith('@stride.fit')) {
                              const toastId = toast.loading('Verifying client email address...');
                              try {
                                const valRes = await fetch('/api/validate-email', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ email: emailVal })
                                });
                                const validation = await valRes.json();
                                if (!valRes.ok || !validation.valid) {
                                  toast.error(validation.reason || 'Invalid email address.', { id: toastId });
                                  return;
                                }
                                toast.dismiss(toastId);
                              } catch (err) {
                                console.error(err);
                                toast.error('Failed to verify email address. Please try again.', { id: toastId });
                                return;
                              }
                            }
                          }
                          setDeployError(null);
                          setDeployStep(prev => prev + 1);
                        }}
                        disabled={showTutorial}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs uppercase font-black"
                      >
                        Next Step
                      </button>
                    ) : (
                      <button 
                        onClick={handleDeployAthlete} 
                        disabled={deployLoading || showTutorial}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs uppercase font-black shadow-lg shadow-blue-500/20"
                      >
                        {deployLoading ? '⏳ Deploying...' : '🚀 Deploy Athlete'}
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB: ATHLETE CONTROL */}
          {activeTab === 'management' && (
            <div id="tutorial-management-container" className="space-y-8 max-w-5xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Athlete Control Center</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage athlete access, security credentials, quotas, and feature permissions.</p>
                </div>
                
                {/* Select Client Dropdown with Search */}
                <div className="flex flex-wrap items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Search size={10} /> Search/Select Athlete:
                  </span>
                  
                  <input
                    type="text"
                    value={managementSearchQuery}
                    onChange={e => setManagementSearchQuery(e.target.value)}
                    placeholder="Search code, name..."
                    className="bg-transparent text-xs text-white outline-none border-b border-gray-850/60 focus:border-blue-500/60 w-32 pb-0.5"
                  />

                  <select
                    value={managementSelectedClientId}
                    onChange={e => setManagementSelectedClientId(e.target.value)}
                    className="bg-transparent text-xs font-black text-white outline-none cursor-pointer max-w-[320px]"
                  >
                    <option value="" disabled className="bg-[#0b0c16]">Select client...</option>
                    {activeClientsList
                      .filter(c => {
                        const code = c.targets?.client_code ? String(c.targets.client_code) : '';
                        const q = managementSearchQuery.trim().toLowerCase().replace('#', '');
                        return c.display_name?.toLowerCase().includes(q) ||
                               c.username?.toLowerCase().includes(q) ||
                               code.includes(q);
                      })
                      .map(c => (
                        <option key={c.id} value={c.id} className="bg-[#0b0c16]">
                          #{c.targets?.client_code || 'N/A'} - {c.display_name} (@{c.username})
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {!managementClientProfile ? (
                <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-12 text-center text-gray-500">
                  <p className="text-sm font-bold">No Client Selected or Loaded</p>
                  <p className="text-xs text-gray-400 mt-2">Please select an athlete from the dropdown above to load management controls.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selected Client Dossier Header Banner */}
                  <div className="bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border border-blue-900/30 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-900/40 text-blue-300 font-black flex items-center justify-center text-sm uppercase">
                        {managementClientProfile.user?.display_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          {managementClientProfile.user?.display_name || 'Unnamed Athlete'}
                          {managementClientProfile.user?.targets?.client_code && (
                            <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-black tracking-normal">
                              #{managementClientProfile.user.targets.client_code}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">Handle: @{managementClientProfile.user?.username || 'no-username'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const activeDays = calculateActiveDays(managementClientProfile.user?.targets);
                        return activeDays > 0 ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                            {activeDays} Active Days
                          </span>
                        ) : null;
                      })()}
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        managementClientProfile.user?.targets?.is_deactivated === true 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {managementClientProfile.user?.targets?.is_deactivated === true ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                  </div>

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
                        {(() => {
                          const targets = managementClientProfile.user?.targets || {};
                          const now = new Date();
                          const isManualDeactivated = targets.is_deactivated === true;
                          
                          let isExpired = false;
                          let isPending = false;
                          if (targets.subscription_start_date && targets.subscription_end_date) {
                            const start = new Date(targets.subscription_start_date);
                            const end = new Date(targets.subscription_end_date);
                            isPending = now < start;
                            isExpired = now >= end;
                          }

                          let statusText = '✓ ACTIVE ACCESS';
                          let statusColorClass = 'text-emerald-400';
                          if (isManualDeactivated) {
                            statusText = '🚨 SUSPENDED (MANUAL)';
                            statusColorClass = 'text-red-400';
                          } else if (isExpired) {
                            statusText = '🚨 SUSPENDED (EXPIRED)';
                            statusColorClass = 'text-red-400';
                          } else if (isPending) {
                            statusText = '⏳ PENDING (INACTIVE)';
                            statusColorClass = 'text-blue-400';
                          }

                          return (
                            <>
                              <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Account Access</p>
                                <p className={`text-xs font-black mt-1 ${statusColorClass}`}>
                                  {statusText}
                                </p>
                              </div>
                              {isExpired ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const element = document.getElementById('subscription-edit-card');
                                    if (element) {
                                      element.scrollIntoView({ behavior: 'smooth' });
                                      element.classList.add('ring-2', 'ring-blue-500');
                                      setTimeout(() => {
                                        element.classList.remove('ring-2', 'ring-blue-500');
                                      }, 3000);
                                    }
                                  }}
                                  disabled={deletingClient}
                                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border bg-blue-600 hover:bg-blue-500 border-blue-500/25 text-white transition-all active:scale-95 cursor-pointer disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-800"
                                >
                                  Reactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleToggleManagementSuspension}
                                  disabled={managementUpdatingSuspension || deletingClient}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 cursor-pointer ${
                                    isManualDeactivated
                                      ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/25 text-white'
                                      : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                  } disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-800 disabled:cursor-not-allowed`}
                                >
                                  {managementUpdatingSuspension ? 'Updating...' : (isManualDeactivated ? 'Reactivate' : 'Suspend')}
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {/* Password Reset */}
                      <form onSubmit={handleUpdateManagementPassword} className="bg-gray-900/40 p-3.5 border border-gray-850 rounded-2xl space-y-3">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Reset Access Passcode</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={managementNewPassword}
                            onChange={e => setManagementNewPassword(e.target.value)}
                            disabled={managementUpdatingPassword || deletingClient}
                            placeholder="New passcode (Min 6 chars)"
                            className="flex-1 bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 disabled:opacity-50"
                          />
                          <button
                            type="submit"
                            disabled={managementUpdatingPassword || deletingClient || !managementNewPassword.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase px-4 py-2 rounded-xl transition-all cursor-pointer disabled:bg-gray-850 disabled:text-gray-500 disabled:cursor-not-allowed"
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
                          disabled={deletingClient}
                          className="w-full bg-red-650 hover:bg-red-650 text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <Trash2 size={13} /> {deletingClient ? 'Deleting...' : 'Complete Cascade Wipe'}
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
                          {(() => {
                            const targets = managementClientProfile.user?.targets;
                            const duration = targets?.subscription_duration;
                            const hasNoExpiry = !targets?.subscription_end_date;
                            if (duration) {
                              if (hasNoExpiry && duration.toLowerCase() === 'none') {
                                return 'UNLIMITED';
                              }
                              return duration.toUpperCase();
                            }
                            return 'NO EXPIRY (UNLIMITED)';
                          })()}
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
                      <div id="subscription-edit-card" className="bg-[#121624]/40 p-4 border border-gray-850 rounded-2xl space-y-4">
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

                {/* Column 2: Feature Toggles & Profile Info */}
                <div className="space-y-6">
                  {/* Card: Profile Information */}
                  <Card className="p-6 space-y-6 bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                    <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <UserCheck size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase text-blue-400 font-sans">Profile Details</h3>
                        <p className="text-[10px] text-gray-550 font-sans">Update display name, contact email, and phone number.</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateProfileDetails} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-450 font-bold uppercase block">Display Name</label>
                        <input
                          type="text"
                          required
                          value={editClientDisplayName}
                          onChange={e => setEditClientDisplayName(e.target.value)}
                          className="w-full bg-[#121624] border border-gray-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white outline-none"
                          placeholder="Display Name"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-450 font-bold uppercase block">Contact Email (Real Email)</label>
                        <input
                          type="email"
                          value={editClientContactEmail}
                          onChange={e => setEditClientContactEmail(e.target.value.trim())}
                          className="w-full bg-[#121624] border border-gray-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white outline-none"
                          placeholder="Contact Email (Real)"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-455 font-bold uppercase block">Phone Number</label>
                        <input
                          type="text"
                          value={editClientPhoneNumber}
                          onChange={e => setEditClientPhoneNumber(e.target.value)}
                          className="w-full bg-[#121624] border border-gray-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white outline-none"
                          placeholder="Phone Number"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updatingProfileDetails}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                      >
                        {updatingProfileDetails ? 'Saving...' : 'Save Profile Details'}
                      </button>
                    </form>
                  </Card>

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
                        const ownerProfile = profiles.find(p => p.id === OWNER_ID);
                        const ownerTargets = ownerProfile?.targets || {};
                        const isHidden = managementClientProfile.user?.targets?.[key] !== undefined
                          ? !!managementClientProfile.user?.targets?.[key]
                          : !!ownerTargets[key];
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
                </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div id="tutorial-subscriptions-container" className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center bg-[#0c1020]/40 p-6 border border-gray-850 rounded-3xl">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="text-blue-500" /> Subscriptions Manager
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Track statuses, expiration countdowns, and manage reactivations for all athletes.
                  </p>
                  <p className="text-[10px] text-blue-400 mt-1.5 font-bold uppercase tracking-wider">
                    Need help? View our{' '}
                    <a 
                      href="/#faq-billing" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline hover:text-blue-300 transition-colors"
                    >
                      Subscriptions FAQ
                    </a>
                  </p>
                </div>
              </div>

              {/* Status Stats Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const now = new Date();
                  const total = activeClientsList.length;
                  let active = 0;
                  let suspendedOrExpired = 0;

                  activeClientsList.forEach((c: any) => {
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
                        <th className="pb-3.5">Active Days</th>
                        <th className="pb-3.5">Status</th>
                        <th className="pb-3.5 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850/60 text-xs">
                      {activeClientsList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-550">
                            No clients deployed under your account.
                          </td>
                        </tr>
                      ) : (
                        activeClientsList.map((c: any) => {
                          const targets = c.targets || {};
                          const now = new Date();
                          const isOwner = c.id === OWNER_ID;
                          const isDeactivated = !isOwner && targets.is_deactivated === true;
                          const isExpired = !isOwner && targets.subscription_end_date && now >= new Date(targets.subscription_end_date);
                          const isPending = !isOwner && targets.subscription_start_date && now < new Date(targets.subscription_start_date);
                          
                          let statusLabel = 'ACTIVE';
                          let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                          if (isOwner) {
                            statusLabel = 'ACTIVE';
                            statusColor = 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20';
                          } else if (isDeactivated) {
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
                            <tr 
                              key={c.id} 
                              onClick={() => setSelectedSubClient(c)}
                              className="hover:bg-gray-900/40 transition-colors cursor-pointer"
                            >
                              <td className="py-4 pl-2 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/25 flex items-center justify-center font-black text-xs text-blue-400 uppercase">
                                  {c.full_name?.substring(0, 2) || 'AT'}
                                </div>
                                <div>
                                  <p className="font-black text-white flex items-center gap-1.5">
                                    {c.full_name}
                                    {targets.client_code && (
                                      <span className="text-[9px] bg-blue-950/60 border border-blue-800/40 text-blue-400 px-1 py-0.5 rounded font-black tracking-normal">
                                        #{targets.client_code}
                                      </span>
                                    )}
                                  </p>
                                  {(() => {
                                    const email = c.email || '';
                                    const isVirtual = email.toLowerCase().endsWith('@stride.fit');
                                    const contactEmail = targets?.contact_email;
                                    if (isVirtual) {
                                      return contactEmail ? (
                                        <p className="text-[9px] text-gray-400 lowercase mt-0.5">{contactEmail}</p>
                                      ) : (
                                        <p className="text-[9px] text-red-400 font-semibold mt-0.5">No Contact Email (Virtual: {email})</p>
                                      );
                                    }
                                    return <p className="text-[9px] text-gray-400 lowercase mt-0.5">{email}</p>;
                                  })()}
                                </div>
                              </td>
                              <td className="py-4 font-bold text-gray-400">
                                {(!targets.subscription_end_date && (targets.subscription_duration || 'none').toLowerCase() === 'none') 
                                  ? 'unlimited' 
                                  : (targets.subscription_duration || 'No Expiry')}
                              </td>
                              <td className="py-4 text-gray-500">
                                {targets.subscription_start_date ? new Date(targets.subscription_start_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4 text-gray-500">
                                {targets.subscription_end_date ? new Date(targets.subscription_end_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4 font-black font-mono text-blue-400">
                                {calculateActiveDays(targets)}d
                              </td>
                              <td className="py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColor}`}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="py-4 text-right pr-2" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={async () => {
                                    if (isDeactivated || isExpired) {
                                      setReactivateClientId(c.id);
                                      setReactivateClientName(c.full_name || 'Client');
                                      setReactivatePeriod(targets.subscription_duration || '1 month');
                                      setReactivateDelay('0');
                                      setReactivateModalOpen(true);
                                    } else {
                                      showConfirm(
                                        'Suspend Athlete',
                                        `Suspend access for client ${c.full_name || 'Client'} immediately?`,
                                        'danger',
                                        async () => {
                                          try {
                                            const updatedTargets = { ...targets, is_deactivated: true };
                                            const { error } = await supabase
                                              .from('profiles')
                                              .update({ targets: updatedTargets })
                                              .eq('id', c.id);
                                            if (error) throw error;
                                            toast.success('Athlete suspended.');
                                            fetchBaseData(true);
                                          } catch (err) {
                                            console.error(err);
                                            toast.error('Failed to suspend athlete.');
                                          }
                                        }
                                      );
                                    }
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer mr-2 ${
                                    (isDeactivated || isExpired)
                                      ? 'bg-blue-600 hover:bg-blue-500 border-blue-500/25 text-white'
                                      : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                  }`}
                                >
                                  {(isDeactivated || isExpired) ? 'Re-activate' : 'Suspend'}
                                </button>
                                <button
                                  onClick={() => {
                                    setManagementSelectedClientId(c.id);
                                    fetchManagementClientDetails(c.id);
                                    setActiveTab('management');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-400 bg-gray-900/60 border border-gray-800 hover:text-white hover:border-gray-700 transition-all cursor-pointer"
                                >
                                  Manage
                                </button>
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
              {coachUserId === OWNER_ID && (
                <div className="space-y-6">
                  {/* Dashboard stats row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                      {
                        label: 'Total Registered Coaches',
                        value: systemCoaches.length,
                        icon: <Users className="text-blue-400" size={18} />,
                        colorClass: 'text-white',
                        glowClass: 'from-blue-500/10 to-transparent',
                        borderClass: 'border-blue-500/15',
                        iconBg: 'bg-blue-500/10'
                      },
                      {
                        label: 'Active Coaches',
                        value: systemCoaches.filter(c => {
                          if (c.id === OWNER_ID) return true; // Owner is always active
                          const tg = c.targets || {};
                          const isDeact = tg.is_deactivated === true;
                          const isExpired = tg.subscription_end_date && new Date() >= new Date(tg.subscription_end_date);
                          const isPending = tg.subscription_start_date && new Date() < new Date(tg.subscription_start_date);
                          return !isDeact && !isExpired && !isPending;
                        }).length,
                        icon: <UserCheck className="text-emerald-400" size={18} />,
                        colorClass: 'text-emerald-400',
                        glowClass: 'from-emerald-500/10 to-transparent',
                        borderClass: 'border-emerald-500/15',
                        iconBg: 'bg-emerald-500/10'
                      },
                      {
                        label: 'Suspended / Inactive',
                        value: systemCoaches.filter(c => {
                          if (c.id === OWNER_ID) return false; // Owner is never suspended
                          const tg = c.targets || {};
                          const isDeact = tg.is_deactivated === true;
                          const isExpired = tg.subscription_end_date && new Date() >= new Date(tg.subscription_end_date);
                          const isPending = tg.subscription_start_date && new Date() < new Date(tg.subscription_start_date);
                          return isDeact || isExpired || isPending;
                        }).length,
                        icon: <UserX className="text-rose-400" size={18} />,
                        colorClass: 'text-rose-400',
                        glowClass: 'from-rose-500/10 to-transparent',
                        borderClass: 'border-rose-500/15',
                        iconBg: 'bg-rose-500/10'
                      },
                      {
                        label: 'Managed Clients (Total)',
                        value: profiles.filter(p => p.role === 'client').length,
                        icon: <ShieldCheck className="text-indigo-400" size={18} />,
                        colorClass: 'text-indigo-400',
                        glowClass: 'from-indigo-500/10 to-transparent',
                        borderClass: 'border-indigo-500/15',
                        iconBg: 'bg-indigo-500/10'
                      }
                    ].map((stat, i) => (
                      <Card 
                        key={i} 
                        className={`p-5 flex items-center justify-between bg-gradient-to-br from-[#0c1020] to-[#0d1222] border ${stat.borderClass} rounded-3xl relative overflow-hidden shadow-lg shadow-[#05050b]/50 group hover:border-gray-700 transition-all duration-300`}
                      >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.glowClass} rounded-bl-full opacity-60 pointer-events-none group-hover:scale-110 transition-transform duration-500`} />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                          <p className={`text-3xl font-black ${stat.colorClass} mt-2 font-mono tracking-tight`}>{stat.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl ${stat.iconBg} border border-white/5 flex items-center justify-center relative z-10 shrink-0 shadow-inner`}>
                          {stat.icon}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Actions & Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gradient-to-r from-[#0c1020]/20 to-transparent p-4 rounded-3xl border border-gray-850/40">
                    <div className="relative w-full sm:w-[340px]">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                      <input 
                        type="text"
                        value={coachSearchQuery}
                        onChange={e => setCoachSearchQuery(e.target.value)}
                        placeholder="Search by coach name, email, or handle..."
                        className="w-full bg-[#080913] border border-gray-850 focus:border-blue-500/50 rounded-2xl py-3.5 pl-10 pr-4 text-xs text-white outline-none transition-all placeholder-gray-650 focus:shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsRegisteringNewCoach(true)}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase px-6 py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20"
                    >
                      <UserPlus size={14} /> Register Coach Account
                    </button>
                  </div>

                  {/* Coaches Full Table */}
                  <Card className="bg-gradient-to-br from-[#0b0c16] to-[#0c1020] border border-gray-850 rounded-3xl overflow-hidden shadow-2xl p-2 animate-fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-850/80 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <th className="py-4 px-5">Coach / Handle</th>
                            <th className="py-4 px-4">Start Date</th>
                            <th className="py-4 px-4">Last Resub Date</th>
                            <th className="py-4 px-4">Expiration Date</th>
                            <th className="py-4 px-4 text-center">Clients</th>
                            <th className="py-4 px-4">Subscription Status</th>
                            <th className="py-4 px-4">Contact Info</th>
                            <th className="py-4 px-5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-850/40">
                          {filteredSystemCoaches.map(coach => {
                            const tg = coach.targets || {};
                            const isDeact = tg.is_deactivated === true;
                            const isSelf = coach.id === OWNER_ID;
                            const coachClients = profiles.filter(p => p.role === 'client' && p.coach_id === coach.id);
                            
                            const now = new Date();
                            const isExpired = !isSelf && tg.subscription_end_date && now >= new Date(tg.subscription_end_date);
                            const isPending = !isSelf && tg.subscription_start_date && now < new Date(tg.subscription_start_date);
                            
                            let statusLabel = 'ACTIVE';
                            let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                            if (isSelf) {
                              statusLabel = 'ACTIVE';
                              statusColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
                            } else if (isDeact) {
                              statusLabel = 'SUSPENDED';
                              statusColor = 'text-red-400 bg-red-500/10 border-red-500/20';
                            } else if (isExpired) {
                              statusLabel = 'EXPIRED';
                              statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                            } else if (isPending) {
                              statusLabel = 'PENDING';
                              statusColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                            } else if (tg.is_free_trial === true || tg.subscription_status === 'trial') {
                              statusLabel = 'ACTIVE (FREE TRIAL)';
                            }

                            // Compute days remaining
                            let daysRemainingLabel = '';
                            if (isSelf) {
                              daysRemainingLabel = 'Lifetime / Owner';
                            } else if (tg.subscription_end_date) {
                              const expiryDate = new Date(tg.subscription_end_date);
                              const diffMs = expiryDate.getTime() - now.getTime();
                              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                              
                              if (diffDays < 0) {
                                daysRemainingLabel = `Expired (${Math.abs(diffDays)}d ago)`;
                              } else if (diffDays === 0) {
                                daysRemainingLabel = (tg.is_free_trial === true || tg.subscription_status === 'trial') ? 'Free Trial - Expires today' : 'Expires today';
                              } else {
                                daysRemainingLabel = (tg.is_free_trial === true || tg.subscription_status === 'trial') ? `Free Trial - ${diffDays} days remaining` : `${diffDays} days remaining`;
                              }
                            } else {
                              daysRemainingLabel = (tg.is_free_trial === true || tg.subscription_status === 'trial') ? 'Free Trial - No Active Plan' : 'No Active Plan';
                            }

                            // Format dates
                            const startDate = tg.subscription_start_date 
                              ? new Date(tg.subscription_start_date).toLocaleDateString()
                              : (isSelf ? 'N/A' : 'Immediate (Not set)');

                            let lastResubDate = 'N/A';
                            if (isSelf) {
                              lastResubDate = 'N/A';
                            } else if (tg.subscription_history && tg.subscription_history.length > 0) {
                              const sortedHistory = [...tg.subscription_history].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                              if (sortedHistory.length > 0) {
                                lastResubDate = new Date(sortedHistory[0].timestamp).toLocaleDateString();
                              }
                            } else if (tg.subscription_start_date) {
                              lastResubDate = new Date(tg.subscription_start_date).toLocaleDateString();
                            }
                            
                            const expirationDate = tg.subscription_end_date 
                              ? new Date(tg.subscription_end_date).toLocaleDateString()
                              : (isSelf ? 'Never (Lifetime)' : 'N/A');

                            return (
                              <tr 
                                key={coach.id}
                                onClick={() => {
                                  setSelectedSystemCoach(coach);
                                  // Pre-fill fields for update/billing
                                  setCoachSubPeriod(tg.subscription_duration || '1 month');
                                  setCoachSubDelay(tg.subscription_delay || '0');
                                  setCoachSubIsFreeTrial(tg.is_free_trial === true || tg.subscription_status === 'trial');
                                  setCoachSubCustomEnd(tg.subscription_end_date ? getLocalDateTimeString(new Date(tg.subscription_end_date)) : getLocalDateTimeString());
                                }}
                                className="group hover:bg-blue-500/[0.02] active:scale-[0.995] transition-all duration-200 cursor-pointer text-xs"
                              >
                                <td className="py-4 px-5 flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-xs uppercase shadow-inner border transition-all ${
                                    isSelf 
                                      ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-300 group-hover:border-indigo-500/50' 
                                      : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300 group-hover:border-blue-500/50'
                                  }`}>
                                    {coach.display_name?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                      {coach.display_name}
                                      {isSelf && (
                                        <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono tracking-wider uppercase font-black">
                                          Owner
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">@{coach.username || 'no-username'}</p>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-gray-300 font-mono font-bold">{startDate}</td>
                                <td className="py-4 px-4 text-gray-300 font-mono font-bold">{lastResubDate}</td>
                                <td className="py-4 px-4 text-gray-300 font-mono font-bold">{expirationDate}</td>
                                <td className="py-4 px-4 text-center">
                                  <span className="inline-flex items-center gap-1 bg-blue-950/30 border border-blue-800/20 rounded-lg px-2.5 py-1 text-blue-400 font-extrabold font-mono">
                                    <Users size={10} />
                                    {coachClients.length}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex flex-col items-start gap-1">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${statusColor}`}>
                                      {statusLabel}
                                    </span>
                                    <span className="text-gray-500 font-medium text-[9px] font-mono">({daysRemainingLabel})</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 space-y-1">
                                  <div className="flex items-center gap-1.5 text-gray-300 font-mono text-[11px]">
                                    <Mail size={10} className="text-gray-500 shrink-0" />
                                    <span className="truncate max-w-[150px]">{coach.email || tg.contact_email || 'Not added'}</span>
                                  </div>
                                  {tg.phone_number && (
                                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                                      <Phone size={10} className="text-gray-600 shrink-0" />
                                      <span>{tg.phone_number}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                                  {tg.phone_number && !isSelf && tg.subscription_end_date && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendWhatsAppReminder(tg.phone_number, coach.display_name, daysRemainingLabel);
                                      }}
                                      className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-400 text-[10px] font-black uppercase px-2.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                                    >
                                      <Bell size={10} /> Remind
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="bg-[#121624]/60 group-hover:bg-blue-600 border border-gray-800 group-hover:border-blue-500 text-gray-400 group-hover:text-white text-[10px] font-black uppercase px-3.5 py-2 rounded-xl transition-all shadow-inner active:scale-95 cursor-pointer"
                                  >
                                    Manage Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredSystemCoaches.length === 0 && (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-gray-500 italic">
                                No coaches found matching criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div id="tutorial-profile-container" className="space-y-8 max-w-4xl">
              <div className="border-b border-gray-800/80 pb-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-wider bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Coach Portal Profile Settings
                </h2>
                <p className="text-sm text-gray-400 mt-2">Review your administrative access credentials, manage your portal account password, and check subscription licenses.</p>
              </div>

              {/* Pending Payment Verification Banner */}
              {myCoachProfile?.targets?.pending_payment && (
                <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-500" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Subscription Pending Approval</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        You submitted a request for <span className="font-bold text-white">{myCoachProfile.targets.pending_payment.period}</span> ({myCoachProfile.targets.pending_payment.amount}) on {new Date(myCoachProfile.targets.pending_payment.submitted_at).toLocaleString()}. We are verifying the payment.
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">Pending Verification</span>
                </div>
              )}

              {/* Approval/Rejection Notice Banner */}
              {myCoachProfile?.targets?.last_payment_result && (
                <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-fade-in ${
                  myCoachProfile.targets.last_payment_result.status === 'approved'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5'
                    : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/5'
                }`}>
                  <div className="flex items-center gap-3">
                    {myCoachProfile.targets.last_payment_result.status === 'approved' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400" />
                    )}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        Subscription {myCoachProfile.targets.last_payment_result.status === 'approved' ? 'Approved' : 'Refused'}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {myCoachProfile.targets.last_payment_result.status === 'approved'
                          ? `Your subscription of ${myCoachProfile.targets.last_payment_result.period} has been approved. Thank you!`
                          : `Your subscription request was rejected. Reason: ${myCoachProfile.targets.last_payment_result.reason || 'Verification failed.'}`
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearPaymentResult}
                    className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-gray-900/60 hover:bg-gray-800 border border-gray-800 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Clear Notification
                  </button>
                </div>
              )}

              {/* Login Credentials & Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Visual Glassmorphic Credentials Card */}
                <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0c1024]/95 via-[#0d1228]/90 to-[#0b0c1b]/98 p-8 shadow-2xl backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-4 border-b border-gray-800/80 pb-5 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner flex-shrink-0">
                      <Key size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase text-blue-400 tracking-wider">Web Portal Login Credentials</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Your credentials to access the LIFE GYM system.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block">Login User Email</span>
                      <div className="flex items-center justify-between bg-[#080910] border border-gray-800/80 px-4 py-3 rounded-2xl transition-all duration-300 hover:border-blue-500/40">
                        <span className="text-sm font-mono font-bold text-white select-all break-all pr-3">
                          {myCoachProfile?.email || 'Loading email...'}
                        </span>
                        {myCoachProfile?.email && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(myCoachProfile.email);
                              setCopiedEmail(true);
                              setTimeout(() => setCopiedEmail(false), 2000);
                              toast.success('Email copied to clipboard');
                            }}
                            className="p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-all flex-shrink-0 cursor-pointer"
                            title="Copy email"
                          >
                            {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block">Access Passcode / Password</span>
                      <div className="flex items-center justify-between bg-[#080910] border border-gray-800/80 px-4 py-3 rounded-2xl transition-all duration-300 hover:border-blue-500/40">
                        <span className="text-sm font-mono font-extrabold text-yellow-500 tracking-wider select-all">
                          {showPasscode 
                            ? (myCoachProfile?.targets?.generated_passcode || '******')
                            : '••••••••'}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowPasscode(!showPasscode)}
                            className="p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer"
                            title={showPasscode ? "Hide Passcode" : "Show Passcode"}
                          >
                            {showPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          {myCoachProfile?.targets?.generated_passcode && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(myCoachProfile.targets.generated_passcode);
                                setCopiedPasscode(true);
                                setTimeout(() => setCopiedPasscode(false), 2000);
                                toast.success('Passcode copied to clipboard');
                              }}
                              className="p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer"
                              title="Copy passcode"
                            >
                              {copiedPasscode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Card */}
                <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-[#0d1222]/40 p-8 shadow-xl backdrop-blur-sm flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center gap-4 border-b border-gray-800/80 pb-5 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-inner flex-shrink-0">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase text-emerald-400 tracking-wider">Subscription Plan Details</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Details about your active coaching subscription plan.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Account License</p>
                        <p className="text-white font-extrabold text-base">
                          {coachUserId === OWNER_ID ? (
                            <span className="text-indigo-400 font-mono font-black uppercase tracking-wider">Lifetime Creator Admin</span>
                          ) : isTrialActive ? (
                            <span className="text-yellow-500 font-black uppercase tracking-wider">Free Trial Mode</span>
                          ) : myCoachProfile?.targets?.subscription_end_date ? (
                            <span className="text-emerald-400 font-black uppercase tracking-wider">Premium License</span>
                          ) : (
                            <span className="text-gray-500 font-black uppercase tracking-wider">No Active Plan</span>
                          )}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Remaining Duration</p>
                        <p className="text-white font-bold font-mono text-base">
                          {coachUserId === OWNER_ID ? (
                            <span className="text-indigo-400 font-extrabold">Never Expires</span>
                          ) : (
                            <span className="text-white font-extrabold">
                              {(() => {
                                if (!myCoachProfile?.targets?.subscription_end_date) return 'No Active Plan';
                                const expiry = new Date(myCoachProfile.targets.subscription_end_date);
                                const now = new Date();
                                const diffMs = expiry.getTime() - now.getTime();
                                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                if (diffDays < 0) return 'Expired';
                                if (diffDays === 0) return 'Expires today';
                                return `${diffDays} days left`;
                              })()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {coachUserId !== OWNER_ID && (
                      <div className="mt-6 p-4 rounded-2xl bg-[#090b14]/60 border border-gray-800/80 space-y-1.5 text-[11px] leading-relaxed text-gray-400 font-medium font-sans">
                        <p className="font-extrabold text-white text-xs uppercase tracking-wider">🌟 Premium Coach License Privileges:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Guarantees <span className="text-white font-bold">full administrative access</span> to all client feeds, workouts, diet plans, and body composition logs.</li>
                          <li>Allows hosting and managing <span className="text-white font-bold">up to 50 active athletes</span>.</li>
                          <li>Unlocks the AI Workout Generator, custom workout scheduling, and InBody assessment parsers.</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Nice visual bar for remaining time (Coach only, Owner doesn't need it) */}
                  {coachUserId !== OWNER_ID && myCoachProfile?.targets?.subscription_start_date && myCoachProfile?.targets?.subscription_end_date ? (
                    <div className="space-y-3 mt-8">
                      <div className="flex justify-between text-xs text-gray-400 font-mono">
                        <span>Start: {new Date(myCoachProfile.targets.subscription_start_date).toLocaleDateString()}</span>
                        <span>End: {new Date(myCoachProfile.targets.subscription_end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800/80 border border-gray-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                          style={{
                            width: `${(() => {
                              const start = new Date(myCoachProfile.targets.subscription_start_date).getTime();
                              const end = new Date(myCoachProfile.targets.subscription_end_date).getTime();
                              const now = new Date().getTime();
                              if (now >= end) return 0;
                              if (now <= start) return 100;
                              const total = end - start;
                              const remaining = end - now;
                              return Math.max(0, Math.min(100, (remaining / total) * 100));
                            })()}%`
                          }}
                        />
                      </div>
                    </div>
                  ) : coachUserId !== OWNER_ID ? (
                    <div className="text-xs text-amber-500/90 bg-amber-500/5 border border-amber-500/10 px-4 py-3 rounded-2xl mt-8 font-bold flex items-center justify-center gap-2">
                      No Active Subscription
                    </div>
                  ) : (
                    <div className="text-xs text-indigo-400/90 bg-indigo-500/5 border border-indigo-500/10 px-4 py-3 rounded-2xl mt-8 font-bold flex items-center justify-center gap-2">
                      👑 Unlimited Premium Admin Privileges
                    </div>
                  )}

                  {/* Renew/Upgrade and Ledger Buttons Section */}
                  {coachUserId !== OWNER_ID && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-gray-800/40">
                      <button
                        type="button"
                        disabled={!!myCoachProfile?.targets?.pending_payment}
                        onClick={() => setShowSubscriptionOverlay(true)}
                        className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl border transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 ${
                          myCoachProfile?.targets?.pending_payment
                            ? 'bg-gray-800/40 text-gray-500 border-transparent cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30 text-white shadow-lg shadow-emerald-500/10'
                        }`}
                      >
                        <RefreshCw size={12} className={myCoachProfile?.targets?.pending_payment ? '' : 'animate-spin-slow'} />
                        {(() => {
                          if (myCoachProfile?.targets?.pending_payment) return 'Verification Pending';
                          
                          const expiry = myCoachProfile?.targets?.subscription_end_date ? new Date(myCoachProfile.targets.subscription_end_date) : null;
                          const now = new Date();
                          const isExpired = expiry && now >= expiry;
                          
                          return isExpired ? 'Renew Subscription' : 'Upgrade Subscription';
                        })()}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowHistoryModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-[#090b14] hover:bg-gray-900 border border-gray-800 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <History size={12} />
                        Last Subscriptions
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Contact Settings Card */}
              <div className="rounded-3xl border border-gray-800/80 bg-gradient-to-br from-[#0c1020] to-[#0d1222] p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-800/60 pb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-emerald-500 tracking-wider">WhatsApp Contact Number</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Set the phone number that athletes will use to contact you via WhatsApp.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">WhatsApp Phone Number</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        value={ownWhatsAppNumber}
                        onChange={e => setOwnWhatsAppNumber(e.target.value)}
                        placeholder="e.g. 201234567890 (include country code without + or spaces)"
                        className="flex-1 bg-[#121624] border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 font-mono font-bold transition-all placeholder-gray-600 focus:shadow-[0_0_12px_rgba(59,130,246,0.12)]"
                      />
                      <button
                        type="button"
                        disabled={savingWhatsAppNumber}
                        onClick={handleSaveWhatsAppNumber}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800/80 disabled:text-gray-500 disabled:border-transparent border border-emerald-500 text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:shadow-emerald-500/10 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        {savingWhatsAppNumber ? 'Saving...' : <><Save size={14} /> Save Contact Number</>}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500">Note: Please enter the phone number with country code, without spaces, +, or symbols (e.g. 201234567890) so the WhatsApp redirect link works perfectly for your clients.</p>
                  </div>
                </div>
              </div>

              {/* Password Editing Form Card */}
              <div className="rounded-3xl border border-gray-800/80 bg-gradient-to-br from-[#0c1020] to-[#0d1222] p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-800/60 pb-5">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-inner flex-shrink-0">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-yellow-500 tracking-wider">Change Portal Access Password</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Update the administrative password used to log in to your coach account.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateOwnPassword} className="space-y-6 font-bold">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">New Access Password</label>
                      <input
                        type="password"
                        value={ownNewPassword}
                        onChange={e => setOwnNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full bg-[#121624] border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 font-mono font-bold transition-all placeholder-gray-650 focus:shadow-[0_0_12px_rgba(59,130,246,0.12)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Confirm Password</label>
                      <input
                        type="password"
                        value={ownConfirmPassword}
                        onChange={e => setOwnConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className="w-full bg-[#121624] border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 font-mono font-bold transition-all placeholder-gray-655 focus:shadow-[0_0_12px_rgba(59,130,246,0.12)]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingOwnPassword || !ownNewPassword || !ownConfirmPassword}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800/80 disabled:text-gray-500 disabled:border-transparent border border-blue-500 text-white font-extrabold py-4 rounded-2xl text-sm uppercase tracking-wider shadow-lg hover:shadow-blue-500/10 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {updatingOwnPassword ? 'Updating Password...' : <><Save size={15} /> Update Password</>}
                  </button>
                </form>
              </div>

                            {/* Send Feedback or Report Problem (Glassmorphism design) */}
              <div className="rounded-3xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {feedbackSuccessShow ? (
                    <motion.div
                      key="thanks"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <CheckCircle size={32} />
                      </div>
                      <h3 className="text-lg font-black uppercase text-emerald-400 tracking-wider">Thank You!</h3>
                      <p className="text-xs text-gray-300 max-w-sm">Your feedback helps us make the platform better. We have received your submission.</p>
                      <button
                        type="button"
                        onClick={() => setFeedbackSuccessShow(false)}
                        className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Close
                      </button>
                    </motion.div>
                  ) : lastFeedbackTime && (Date.now() - lastFeedbackTime < 60 * 60 * 1000) ? (
                    <motion.div
                      key="locked"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Clock size={30} />
                      </div>
                      <h3 className="text-lg font-black uppercase text-blue-400 tracking-wider">Form Locked</h3>
                      <p className="text-xs text-gray-300 max-w-sm">To prevent spam, you can submit feedback once per hour.</p>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-3 text-xs text-gray-400 font-mono mt-2">
                        Try again in: <span className="text-blue-400 font-bold">{lockMinutesLeft} minutes</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner flex-shrink-0">
                          <Mail size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase text-blue-500 tracking-wider">Send Feedback or Report Problem</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Let us know what went wrong, suggest improvements, or share your thoughts.</p>
                        </div>
                      </div>

                      <form onSubmit={handleSubmitFeedback} className="space-y-5">
                        {/* Submission Category */}
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Submission Type</label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setFeedbackCategory('feedback')}
                              className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                feedbackCategory === 'feedback'
                                  ? 'bg-blue-600/15 border-blue-500/30 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                                  : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:border-white/[0.1] hover:bg-white/[0.04]'
                              }`}
                            >
                              <Lightbulb size={13} className="shrink-0" />
                              <span>General Feedback</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFeedbackCategory('bug')}
                              className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                feedbackCategory === 'bug'
                                  ? 'bg-red-600/15 border-red-500/30 text-red-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                                  : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:border-white/[0.1] hover:bg-white/[0.04]'
                              }`}
                            >
                              <AlertTriangle size={13} className="shrink-0" />
                              <span>Report a Bug</span>
                            </button>
                          </div>
                        </div>

                        {feedbackCategory !== 'bug' && (
                          <div className="space-y-2">
                            <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Rating (Optional)</label>
                            <div className="flex gap-2.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFeedbackRating(star)}
                                  className="transition-transform hover:scale-120 duration-150 p-1 cursor-pointer focus:outline-none"
                                >
                                  <Star
                                    size={24}
                                    className={`transition-colors duration-150 ${
                                      star <= feedbackRating
                                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                        : 'text-zinc-655 hover:text-zinc-400'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Your Message</label>
                          <textarea
                            value={feedbackMessage}
                            onChange={e => setFeedbackMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows={5}
                            required
                            className="w-full bg-[#121624]/60 border border-white/[0.06] rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder-gray-650 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingFeedback || !feedbackMessage.trim()}
                          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800/80 disabled:text-gray-500 disabled:border-transparent border border-blue-500 text-white font-extrabold py-4 rounded-2xl text-sm uppercase tracking-wider shadow-lg hover:shadow-blue-500/10 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        >
                          {submittingFeedback ? 'Submitting...' : <><Save size={14} /> Submit Feedback</>}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* TAB: FINANCIALS & SUBSCRIPTIONS AUDIT LOG */}
          {activeTab === 'financials' && coachUserId === OWNER_ID && (() => {
            // Aggregate all logs
            const allLogs = getAuditLogs();
            
            // Stats calculations
            const totalRevenue = allLogs
              .filter(l => l.status === 'approved')
              .reduce((sum, l) => sum + parseEgp(l.amount), 0);
              
            const approvedCount = allLogs.filter(l => l.status === 'approved').length;
            const pendingCount = allLogs.filter(l => l.status === 'pending').length;
            const rejectedCount = allLogs.filter(l => l.status === 'rejected').length;

            // Filtering
            const filteredLogs = allLogs.filter(log => {
              const matchQuery = !financialsSearchQuery ||
                log.coachName.toLowerCase().includes(financialsSearchQuery.toLowerCase()) ||
                log.coachEmail.toLowerCase().includes(financialsSearchQuery.toLowerCase()) ||
                log.amount.toLowerCase().includes(financialsSearchQuery.toLowerCase()) ||
                log.duration.toLowerCase().includes(financialsSearchQuery.toLowerCase()) ||
                (log.details && log.details.toLowerCase().includes(financialsSearchQuery.toLowerCase()));
                
              const matchStatus = financialsStatusFilter === 'all' || log.status === financialsStatusFilter;
              return matchQuery && matchStatus;
            });
            
            const pendingReviewList = allLogs.filter(l => l.status === 'pending');

            return (
              <div className="space-y-8 animate-fade-in text-gray-300 font-sans text-xs">
                
                {/* 1. Sleek Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900/60 pb-6">
                  <div>
                    <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="text-blue-400" size={16} />
                      Financial Logs &amp; Subscriptions
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Audit trail, transaction verification, and rate settings</p>
                  </div>
                  <div className="bg-[#0c1020]/80 px-3 py-1.5 border border-slate-850 rounded-xl text-[9px] text-blue-400 font-black uppercase tracking-widest">
                    Portal Audit Mode
                  </div>
                </div>

                {/* 2. Sleek Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { label: 'Total Revenue', value: `${totalRevenue.toLocaleString()} EGP`, icon: <DollarSign size={14} className="text-blue-400" />, border: 'border-blue-900/20', bg: 'bg-[#0b0c16]/90' },
                    { label: 'Approved Renewals', value: approvedCount, icon: <TrendingUp size={14} className="text-emerald-450" />, border: 'border-slate-850', bg: 'bg-[#0c1020]/50' },
                    { label: 'Awaiting Review', value: pendingCount, icon: <Clock size={14} className="text-amber-450 animate-pulse" />, border: 'border-slate-850', bg: 'bg-[#0c1020]/50', highlight: pendingCount > 0 },
                    { label: 'Plan Rejections', value: rejectedCount, icon: <AlertTriangle size={14} className="text-red-450" />, border: 'border-slate-850', bg: 'bg-[#0c1020]/50' }
                  ].map((stat, idx) => (
                    <div key={idx} className={`p-6 ${stat.bg} border ${stat.border} rounded-2xl flex flex-col gap-1 shadow-md relative overflow-hidden`}>
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                        {stat.icon}
                      </div>
                      <span className={`text-2xl font-black mt-2 font-mono tracking-tight ${stat.highlight ? 'text-amber-450' : 'text-white'}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Left column - 2/3 width */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Pending Web Registrations Card */}
                    {pendingReviewList.length > 0 && (
                      <div className="rounded-[22px] border border-amber-500/20 bg-gradient-to-br from-[#100c08] via-[#090705] to-black p-6 shadow-xl backdrop-blur-md">
                        <div className="flex items-center gap-3.5 border-b border-zinc-900/80 pb-4 mb-4">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner flex-shrink-0 animate-pulse">
                            <Clock size={15} />
                          </div>
                          <div>
                            <h3 className="text-xs font-black uppercase text-amber-450 tracking-widest">Pending Web Registrations</h3>
                            <p className="text-[10px] text-zinc-550 font-bold uppercase mt-0.5">Please verify deposit transactions and approve or reject access.</p>
                          </div>
                        </div>

                        <div className="space-y-3.5">
                          {pendingReviewList.map(item => {
                            const coach = profiles.find(p => p.id === item.coachId);
                            const pendingPay = coach?.targets?.pending_payment || {};
                            const isProcessing = processingPaymentId === item.coachId;

                            return (
                              <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-black border border-zinc-900">
                                <div className="flex items-start gap-3.5">
                                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 font-bold text-xs uppercase shrink-0">
                                    {item.coachName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-black text-white text-xs tracking-tight">{item.coachName}</p>
                                    <p className="text-[9px] text-zinc-500 font-bold font-mono mt-0.5">@{coach?.username || 'no-username'} | {item.coachEmail}</p>
                                    
                                    <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[9px] font-bold">
                                      <span className="bg-[#0b0c16] text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {pendingPay.duration} Plan ({pendingPay.amount})
                                      </span>
                                      <span className="text-zinc-650 font-mono">
                                        Submitted: {new Date(item.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                    
                                    {pendingPay.receipt && (
                                      <div className="mt-3.5 flex items-center gap-2">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Screenshot:</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const win = window.open();
                                            if (win) {
                                              win.document.write(`<iframe src="${pendingPay.receipt}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                            }
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-805 text-[9px] text-zinc-350 cursor-pointer transition-colors uppercase font-bold tracking-wider"
                                        >
                                          View Receipt
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                  <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => {
                                      showPrompt(
                                        'Reject Payment Screenshot',
                                        `Enter rejection reason for ${item.coachName}'s screenshot renewal (e.g. Invalid Screenshot, Wrong Amount):`,
                                        'Invalid Screenshot',
                                        'Rejection reason...',
                                        async (reason) => {
                                          if (reason === null) return;
                                          const cleanReason = reason.trim() || 'Invalid Screenshot';
                                          handleRejectPaymentDirect(item.coachId, cleanReason);
                                        }
                                      );
                                    }}
                                    className="px-3.5 py-1.5 border border-zinc-800 hover:border-red-900 bg-red-950/20 hover:bg-red-900/20 disabled:opacity-50 text-red-450 hover:text-red-350 rounded-lg uppercase tracking-wider text-[9px] font-black cursor-pointer transition-all"
                                  >
                                    {isProcessing ? 'Processing...' : 'Reject'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => {
                                      showConfirm(
                                        'Approve Subscription',
                                        `Are you sure you want to approve the subscription renewal for coach ${item.coachName}?`,
                                        'success',
                                        () => {
                                          handleApprovePaymentDirect(item.coachId);
                                        }
                                      );
                                    }}
                                    className="px-3.5 py-1.5 border border-zinc-800 hover:border-emerald-900 bg-emerald-950/20 hover:bg-emerald-900/20 disabled:opacity-50 text-emerald-400 hover:text-emerald-305 rounded-lg uppercase tracking-wider text-[9px] font-black cursor-pointer transition-all"
                                  >
                                    {isProcessing ? 'Processing...' : 'Approve'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Transaction Audit Ledger Table */}
                    <div className="space-y-4">
                      {/* Search and Filters */}
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-[320px]">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                          <input 
                            type="text"
                            value={financialsSearchQuery}
                            onChange={e => setFinancialsSearchQuery(e.target.value)}
                            placeholder="Search logs…"
                            className="w-full bg-[#0c1020]/60 border border-slate-850 hover:border-slate-800 focus:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none transition-colors placeholder-slate-700 font-bold"
                          />
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest self-stretch sm:self-center justify-end">
                          <span>Filter:</span>
                          <select
                            value={financialsStatusFilter}
                            onChange={e => setFinancialsStatusFilter(e.target.value as any)}
                            className="bg-[#0c1020]/60 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-slate-750 font-bold cursor-pointer"
                          >
                            <option value="all">All Logs</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      {/* Dynamic Audit Ledger Table Card */}
                      <div className="bg-[#0b0c16]/50 border border-slate-900 rounded-2xl overflow-hidden p-1">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-900 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                <th className="py-4 px-5">Date</th>
                                <th className="py-4 px-5">Coach</th>
                                <th className="py-4 px-5">Plan</th>
                                <th className="py-4 px-5">Amount</th>
                                <th className="py-4 px-5">Status</th>
                                <th className="py-4 px-5">Details</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#090b14]">
                              {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-[#0c1020]/30 transition-colors text-xs font-semibold">
                                  <td className="py-4 px-5 text-slate-500 font-mono text-[9px]">
                                    {new Date(log.timestamp).toLocaleDateString()}
                                  </td>
                                  <td className="py-4 px-5">
                                    <p className="font-extrabold text-white">{log.coachName}</p>
                                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{log.coachEmail}</p>
                                  </td>
                                  <td className="py-4 px-5 font-mono text-[10px] text-slate-400">
                                    {log.duration}
                                  </td>
                                  <td className="py-4 px-5 font-mono text-xs text-blue-400 font-black">
                                    {log.amount}
                                  </td>
                                  <td className="py-4 px-5">
                                    <span className={`px-2 py-0.5 border rounded text-[7px] uppercase tracking-wider font-mono font-black ${
                                      log.status === 'approved'
                                        ? 'bg-[#0a0f0d] border-emerald-500/20 text-emerald-400'
                                        : log.status === 'pending'
                                        ? 'bg-[#0f0c0a] border-amber-500/20 text-amber-400'
                                        : 'bg-[#0f0a0a] border-red-500/20 text-red-400'
                                    }`}>
                                      {log.status}
                                    </span>
                                  </td>
                                  <td className="py-4 px-5 text-slate-500 font-mono text-[9px] max-w-[200px] truncate animate-fade-in" title={log.details}>
                                    {log.details}
                                  </td>
                                </tr>
                              ))}

                              {filteredLogs.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="py-16 text-center text-slate-650">
                                    <PieChart className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">No audit logs found</span>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column - 1/3 width Settings Card */}
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-900 bg-[#0b0c16]/50 p-6 shadow-sm">
                      <div className="flex items-center gap-3.5 border-b border-slate-900 pb-4 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-[#0c1020] border border-slate-850 flex items-center justify-center text-slate-400 shadow-inner shrink-0">
                          <Settings size={14} />
                        </div>
                        <div>
                          <h3 className="text-xs font-black uppercase text-white tracking-widest">Plan Prices</h3>
                          <p className="text-[9px] text-slate-550 font-bold uppercase mt-0.5">Change subscription rates</p>
                        </div>
                      </div>

                      <div className="space-y-4 font-bold text-xs text-slate-200">
                        {[
                          { label: '2 Weeks Price', val: editPrices2Weeks, setVal: setEditPrices2Weeks },
                          { label: '1 Month Price', val: editPrices1Month, setVal: setEditPrices1Month },
                          { label: '3 Months Price', val: editPrices3Months, setVal: setEditPrices3Months },
                          { label: '6 Months Price', val: editPrices6Months, setVal: setEditPrices6Months }
                        ].map((priceInput, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest text-slate-500 block">{priceInput.label}</label>
                            <div className="flex items-center bg-black border border-slate-900 rounded-xl px-4 py-3 focus-within:border-slate-800 transition-colors">
                              <input
                                type="text"
                                value={priceInput.val}
                                onChange={e => priceInput.setVal(e.target.value)}
                                placeholder="e.g. 2,000"
                                className="w-full bg-transparent text-xs text-white outline-none font-mono font-bold p-0"
                              />
                              <span className="text-[9px] text-slate-500 font-black ml-2 font-mono">EGP</span>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          disabled={updatingPlanPrices}
                          onClick={handleSavePlanPricesDirect}
                          className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-3.5 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-95 border border-blue-500/30"
                        >
                          {updatingPlanPrices ? 'Saving...' : 'Update Plan Prices'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

        </main>
      </div>

      {/* COMPLETED WORKOUT RECEIPT DIALOG MODAL */}
      {selectedReceiptWorkout && (
        <GymReceipt 
          stats={selectedReceiptWorkout}
          onClose={() => setSelectedReceiptWorkout(null)}
        />
      )}

      {/* DIET RECEIPT MODAL OVERLAY */}
      {selectedReceiptDiet && (
        <div className="fixed inset-0 bg-[#05050b]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 border-b border-gray-850 flex items-center justify-between bg-gray-900/20 font-sans">
              <div>
                <h3 className="text-xs font-black uppercase text-blue-400">
                  Diet Receipt {selectedReceiptDiet.profiles?.display_name && `- ${selectedReceiptDiet.profiles.display_name}`}
                  {selectedReceiptDiet.profiles?.client_code && (
                    <span className="text-[9px] bg-blue-950/60 border border-blue-800/40 text-blue-400 px-1 py-0.5 rounded font-black tracking-normal ml-1.5 align-middle">
                      #{selectedReceiptDiet.profiles.client_code}
                    </span>
                  )}
                </h3>
                <p className="text-sm font-black text-white mt-0.5">
                  {new Date(selectedReceiptDiet.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button 
                onClick={() => setSelectedReceiptDiet(null)} 
                className="w-8 h-8 rounded-xl bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-white flex items-center justify-center border border-gray-800 transition-all cursor-pointer animate-scale"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-5 flex-1 font-sans">
              {/* Daily totals cards */}
              <div className="grid grid-cols-4 gap-2 bg-[#121624]/60 border border-gray-850 p-4 rounded-2xl">
                <div className="text-center">
                  <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Calories</p>
                  <p className="text-xs font-black text-white">{Math.round(selectedReceiptDiet.daily_totals?.kcal || 0)} kcal</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Protein</p>
                  <p className="text-xs font-black text-blue-400">{Math.round(selectedReceiptDiet.daily_totals?.protein || 0)}g</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Carbs</p>
                  <p className="text-xs font-black text-purple-400">{Math.round(selectedReceiptDiet.daily_totals?.carbs || 0)}g</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Fat</p>
                  <p className="text-xs font-black text-emerald-400">{Math.round(selectedReceiptDiet.daily_totals?.fat || 0)}g</p>
                </div>
              </div>

              {/* Meals list */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Logged Meals</h4>
                {loadingReceiptDietMeals ? (
                  <div className="text-center py-6 text-xs text-gray-500 font-bold flex items-center justify-center gap-2">
                    <RefreshCw className="animate-spin text-blue-500" size={14} /> Loading meals...
                  </div>
                ) : selectedReceiptDietMeals.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-4 text-center">No meal entries logged.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedReceiptDietMeals.map(meal => {
                      const mm = meal.items?.reduce((t: any, i: any) => ({
                        kcal: t.kcal + (i.macros?.kcal || 0),
                        protein: t.protein + (i.macros?.protein || 0),
                        carbs: t.carbs + (i.macros?.carbs || 0),
                        fat: t.fat + (i.macros?.fat || 0),
                      }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
                      
                      return (
                        <div key={meal.id} className="bg-[#121624]/30 border border-gray-800 rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                            <span className="text-xs font-black text-white uppercase tracking-wider">{meal.name}</span>
                            <span className="text-[10px] font-black text-blue-400">{Math.round(mm?.kcal || 0)} kcal</span>
                          </div>
                          
                          <div className="space-y-2">
                            {meal.items?.map((item: any, idx: number) => (
                              <div key={item.id || idx} className="flex justify-between items-center bg-[#0d1220] border border-gray-850 p-2.5 rounded-xl text-xs">
                                <div>
                                  <p className="font-bold text-gray-200">{item.name}</p>
                                  <p className="text-[9px] text-gray-500 mt-0.5">
                                    {item.serving_type === 'per_item' 
                                      ? (item.grams === 1 ? '1 serving' : `${item.grams} servings`) 
                                      : `${item.grams}g`}
                                  </p>
                                </div>
                                <div className="text-right font-medium text-xs">
                              <p className="font-black text-blue-400">{Math.round(item.macros?.kcal || 0)} kcal</p>
                                  <p className="text-[8px] text-gray-500 font-mono mt-0.5">
                                    P{Math.round(item.macros?.protein || 0)}g · C{Math.round(item.macros?.carbs || 0)}g · F{Math.round(item.macros?.fat || 0)}g
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-850 bg-gray-900/10 flex justify-end font-sans">
              <button 
                onClick={() => setSelectedReceiptDiet(null)}
                className="bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-300 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM STYLED PROMPT DIALOG MODAL */}
      {customPromptOpen && (
        <div className="fixed inset-0 bg-[#05050b]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-sm bg-[#0d1220] border border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">{customPromptTitle}</h3>
            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">{customPromptMessage}</p>
            <input 
              type="text" 
              value={customPromptValue}
              onChange={e => setCustomPromptValue(e.target.value)}
              placeholder={customPromptPlaceholder}
              className="w-full bg-[#131b2e] border border-gray-800 rounded-2xl py-3.5 px-4 text-xs outline-none focus:border-purple-500 transition-colors text-white font-bold"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomPromptOpen(false);
                  if (customPromptCallback) customPromptCallback(null);
                }}
                className="flex-1 bg-gray-900 border border-gray-850 hover:bg-gray-800 text-gray-300 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomPromptOpen(false);
                  if (customPromptCallback) customPromptCallback(customPromptValue);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-2xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM GLASSMORPHIC CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={customConfirmOpen}
        title={customConfirmTitle}
        message={customConfirmMessage}
        variant={customConfirmVariant}
        onConfirm={() => {
          setCustomConfirmOpen(false);
          if (customConfirmCallback) customConfirmCallback();
        }}
        onCancel={() => {
          setCustomConfirmOpen(false);
        }}
      />

      {/* COACH SUBSCRIPTION PAYMENT OVERLAY MODAL */}
      {showSubscriptionOverlay && (
        <div className="fixed inset-0 bg-[#05050b]/80 backdrop-blur-md z-50 overflow-y-auto flex justify-center items-start py-8 px-4 md:px-6">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-5 md:p-6 max-w-3xl w-full space-y-4 shadow-2xl animate-fade-in my-0">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-855 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    {(() => {
                      const expiry = myCoachProfile?.targets?.subscription_end_date ? new Date(myCoachProfile.targets.subscription_end_date) : null;
                      const now = new Date();
                      const isExpired = expiry && now >= expiry;
                      return isExpired ? 'Renew Subscription' : 'Upgrade Subscription';
                    })()}
                  </h3>
                  <p className="text-[9px] text-gray-500">Extend your coaching portal license</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSubscriptionOverlay(false);
                  setSubOverlayScreenshot('');
                }}
                className="w-7 h-7 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center border border-gray-800 transition-all cursor-pointer text-xs"
              >
                <X size={12} />
              </button>
            </div>

            <form onSubmit={handleRenewSubscription} className="space-y-4 text-xs font-bold text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Left Column */}
                <div className="space-y-4">
                  
                  {/* COMPELING SELLING POINTS */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 space-y-1.5">
                    <p className="font-extrabold text-emerald-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <span>💎 Premium License Guarantees:</span>
                    </p>
                    <ul className="space-y-1 text-[9px] text-gray-400 font-medium list-disc pl-4 font-sans leading-relaxed">
                      <li>Guarantees <span className="text-white font-bold">full administrative access</span> to all training plans, diet sheets, client records, and analytics.</li>
                      <li>Allows you to manage <span className="text-white font-bold">up to 50 active athletes</span> concurrently.</li>
                      <li>Unlocks advanced features: AI workout logs generator, InBody assessments parser, custom client progress tracking dashboard.</li>
                    </ul>
                  </div>
              
                  {/* Plan Choice Grid */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500">Select Plan Option</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: '2 weeks', label: '2 Weeks', price: planPrices['2 weeks'] || '2,000 EGP' },
                        { id: '1 month', label: '1 Month', price: planPrices['1 month'] || '3,500 EGP' },
                        { id: '3 months', label: '3 Months', price: planPrices['3 months'] || '8,500 EGP' },
                        { id: '6 months', label: '6 Months', price: planPrices['6 months'] || '14,000 EGP' }
                      ].map(plan => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSubOverlayPlan(plan.id)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                            subOverlayPlan === plan.id
                              ? 'bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-500/5'
                              : 'bg-[#121624]/60 border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          <span className="text-xs font-extrabold">{plan.label}</span>
                          <span className={`text-[10px] font-mono mt-0.5 ${subOverlayPlan === plan.id ? 'text-blue-400' : 'text-gray-500'}`}>{plan.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500">Choose Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'wallet', label: 'Mobile Wallet', desc: 'Vodafone Cash, etc.' },
                        { id: 'telda', label: 'Telda App', desc: 'Transfer to Username' }
                      ].map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setSubOverlayMethod(method.id);
                            setSubOverlayScreenshot('');
                          }}
                          className={`p-2.5 rounded-xl border text-left flex flex-col transition-all duration-200 cursor-pointer ${
                            subOverlayMethod === method.id
                              ? 'bg-emerald-600/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/5'
                              : 'bg-[#121624]/60 border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          <span className="text-xs font-extrabold">{method.label}</span>
                          <span className="text-[8px] text-gray-500 mt-0.5 font-medium">{method.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guide/Instruction Info Alert */}
                  <div className="p-3 rounded-xl bg-[#121624]/80 border border-gray-800 space-y-1 font-medium text-[10px] text-gray-400">
                    <p className="font-extrabold text-white text-[11px] uppercase tracking-wider">Payment Instructions:</p>
                    {subOverlayMethod === 'telda' ? (
                      <p>Send the transaction amount to Telda Username: <span className="text-yellow-500 font-mono font-bold select-all">@ckh</span></p>
                    ) : (
                      <p>Transfer the transaction amount to Mobile Wallet phone: <span className="text-yellow-500 font-mono font-bold select-all">01128828954</span></p>
                    )}
                    <p className="text-[9px] text-gray-500">Verify details and fill out the transfer credentials form below.</p>
                  </div>

                  {/* Total checkout amount display */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">Total Transfer Value:</span>
                    <span className="text-sm font-black text-white font-mono">
                      {planPrices[subOverlayPlan] || '0 EGP'}
                    </span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Dynamic Inputs depending on Method */}
                  <div className="space-y-3">
                    {subOverlayMethod === 'telda' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Telda Username</label>
                          <input
                            type="text"
                            required
                            value={subOverlayTeldaUser}
                            onChange={e => setSubOverlayTeldaUser(e.target.value)}
                            placeholder="@username"
                            className="w-full bg-[#121624] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono font-bold placeholder-gray-600 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Sender Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={subOverlayPhone}
                            onChange={e => setSubOverlayPhone(e.target.value)}
                            placeholder="e.g. 01xxxxxxxxx"
                            className="w-full bg-[#121624] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono font-bold placeholder-gray-600 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Sender Wallet Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={subOverlayPhone}
                            onChange={e => setSubOverlayPhone(e.target.value)}
                            placeholder="e.g. 01xxxxxxxxx"
                            className="w-full bg-[#121624] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono font-bold placeholder-gray-600 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Screenshot drag and drop area */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Transfer Screenshot / Receipt</label>
                      
                      {!subOverlayScreenshot ? (
                        <div 
                          className="border-2 border-dashed border-gray-800 hover:border-blue-500/40 bg-[#121624]/40 rounded-xl p-4 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer relative"
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) {
                              handleScreenshotFile(e.dataTransfer.files[0]);
                            }
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              if (e.target.files?.[0]) {
                                handleScreenshotFile(e.target.files[0]);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="w-8 h-8 rounded-full bg-blue-500/5 group-hover:bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400 mb-1 transition-all">
                            <Plus size={14} />
                          </div>
                          <p className="text-[10px] text-gray-400 font-extrabold group-hover:text-blue-400 transition-colors">Drag & drop receipt, or click to upload</p>
                          <p className="text-[8px] text-gray-600 mt-0.5">Accepts PNG, JPG, or JPEG up to 2MB</p>
                        </div>
                      ) : (
                        <div className="relative border border-gray-800 rounded-xl overflow-hidden bg-[#121624] p-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <img 
                              src={subOverlayScreenshot} 
                              alt="Transaction Screenshot" 
                              className="w-10 h-10 object-cover rounded border border-gray-855"
                            />
                            <div>
                              <p className="text-white text-[10px] font-bold">Receipt Attached</p>
                              <p className="text-[8px] text-emerald-400 font-bold">Ready to upload</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSubOverlayScreenshot('')}
                            className="p-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                            title="Remove screenshot"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div> {/* Close Right Column */}
              </div> {/* Close Grid Row */}

              {/* Privacy Policy & Terms acceptance checklists */}
              <div className="space-y-2 pt-2 border-t border-gray-800/80">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={subOverlayTermsChecked}
                    onChange={e => setSubOverlayTermsChecked(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-800 bg-[#121624] text-blue-600 mt-0.5 outline-none focus:ring-0"
                  />
                  <div className="text-[9px] text-gray-400 font-medium leading-relaxed">
                    I accept the{' '}
                    <span 
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPrivacyModal(true);
                      }}
                      className="text-blue-400 hover:underline font-extrabold cursor-pointer"
                    >
                      Privacy Policy Summary (View Data Details)
                    </span>{' '}
                    and authorize my profile details to be securely processed.
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={subOverlayRefundChecked}
                    onChange={e => setSubOverlayRefundChecked(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-800 bg-[#121624] text-blue-600 mt-0.5 outline-none focus:ring-0"
                  />
                  <span className="text-[9px] text-gray-400 font-medium leading-relaxed">
                    I acknowledge that this transaction is strictly <span className="font-bold text-white uppercase">non-refundable</span> and access depends on manual verification.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubscriptionOverlay(false);
                    setSubOverlayScreenshot('');
                  }}
                  className="flex-1 bg-gray-900 hover:bg-gray-855 border border-gray-855 text-gray-300 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <X size={12} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={subOverlaySubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-transparent border border-emerald-500 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {subOverlaySubmitting ? 'Submitting...' : <><Save size={13} /> Submit Renewal</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* COACH PRIVACY POLICY MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-[#05050b]/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl animate-fade-in no-scrollbar max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Privacy Policy</h3>
                  <p className="text-[10px] text-gray-500">How LIFE GYM processes and secures your data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center border border-gray-800 transition-all cursor-pointer text-xs"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-300 font-bold leading-relaxed font-sans">
              <p>We process the following categories of data securely to manage your Coach Portal access and provide administrative services:</p>
              
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#121624]/60 border border-gray-800">
                  <h4 className="text-white text-[11px] uppercase tracking-wider font-extrabold mb-1">🔑 Account & Profile Information</h4>
                  <p className="text-gray-400 font-medium font-sans">Your email address, username, display name, and encrypted access credentials.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#121624]/60 border border-gray-800">
                  <h4 className="text-white text-[11px] uppercase tracking-wider font-extrabold mb-1">👥 Client & Athlete Rosters</h4>
                  <p className="text-gray-400 font-medium font-sans">Assigned client names, training stats, target logs, schedules, and active workout sheets.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#121624]/60 border border-gray-800">
                  <h4 className="text-white text-[11px] uppercase tracking-wider font-extrabold mb-1">🍏 Nutrition & Fitness Templates</h4>
                  <p className="text-gray-400 font-medium font-sans">Dietary calculations, target nutrition plans, customized exercises, and physical muscle maps.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#121624]/60 border border-gray-800">
                  <h4 className="text-white text-[11px] uppercase tracking-wider font-extrabold mb-1">📊 Composition & InBody Analytics</h4>
                  <p className="text-gray-400 font-medium font-sans">Calculations of body fat percentage, lean mass ratios, and uploaded InBody assessment charts.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#121624]/60 border border-gray-800">
                  <h4 className="text-white text-[11px] uppercase tracking-wider font-extrabold mb-1">💳 Billing & Transactions</h4>
                  <p className="text-gray-400 font-medium font-sans">Payment sender names, transfer telephone numbers, and uploaded transaction receipts. Receipt files are handled locally and are deleted immediately after verification.</p>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 font-medium font-sans">By accepting these terms, you consent to securely store and process this information under encrypted hosting. We do not sell or share your data with third parties.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Understand & Accept
            </button>
          </div>
        </div>
      )}

      {/* COACH SUBSCRIPTION HISTORY LEDGER MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-[#05050b]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl animate-fade-in my-8 no-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">
                  <History size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Subscription Ledger</h3>
                  <p className="text-[10px] text-gray-500">Your historical billing receipts log</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center border border-gray-800 transition-all cursor-pointer text-xs"
              >
                <X size={14} />
              </button>
            </div>

            {/* List / History Ledger container */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
              {!myCoachProfile?.targets?.subscription_history || myCoachProfile.targets.subscription_history.length === 0 ? (
                <div className="py-12 text-center text-gray-500 italic space-y-2">
                  <Activity className="w-8 h-8 text-gray-700 mx-auto animate-pulse" />
                  <p className="text-xs">No subscription payments logged for this account yet.</p>
                </div>
              ) : (
                myCoachProfile.targets.subscription_history
                  .slice()
                  .reverse()
                  .map((entry: any, index: number) => (
                    <div key={index} className="bg-[#121624]/60 border border-gray-800 p-4 rounded-2xl space-y-2.5 font-bold text-xs text-gray-300">
                      <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                        <span className="text-[10px] font-mono text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                        <span className="text-[9px] bg-blue-500/15 border border-blue-500/20 text-blue-400 uppercase tracking-widest px-2 py-0.5 rounded font-black">
                          Approved
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Extended Plan</p>
                          <p className="text-white mt-0.5">{entry.period}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Amount Paid</p>
                          <p className="text-emerald-400 font-mono mt-0.5">{entry.amount || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-[#090b14]/50 border border-gray-850 rounded-xl text-[10px] font-mono text-gray-400">
                        <p className="flex justify-between">
                          <span>Starts:</span>
                          <span className="text-white">{entry.start_date ? new Date(entry.start_date).toLocaleDateString() : 'N/A'}</span>
                        </p>
                        <p className="flex justify-between mt-1">
                          <span>Expires:</span>
                          <span className="text-white">{entry.end_date ? new Date(entry.end_date).toLocaleDateString() : 'Lifetime'}</span>
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-full bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-300 font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X size={13} /> Close Ledger
              </button>
            </div>

          </div>
        </div>
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

      {/* REACTIVATE COACH SUBSCRIPTION DIALOG MODAL */}
      {coachReactivateModalOpen && (
        <div className="fixed inset-0 bg-[#05050b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1220] border border-gray-800 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-fade-in font-bold">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <CreditCard size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {(() => {
                    const targetCoach = profiles.find(p => p.id === coachReactivateId);
                    const tg = targetCoach?.targets || {};
                    const isCurrentlySuspended = tg.is_deactivated === true || 
                      (tg.subscription_end_date && new Date() >= new Date(tg.subscription_end_date)) ||
                      (tg.subscription_start_date && new Date() < new Date(tg.subscription_start_date));
                    return isCurrentlySuspended ? 'Reactivate Coach Access' : 'Update Coach Subscription';
                  })()}
                </h3>
                <p className="text-[10px] text-gray-500 font-bold">For {coachReactivateName}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Duration selection */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase block">Subscription Plan / Period</label>
                <select 
                  value={coachReactivatePeriod} 
                  onChange={e => setCoachReactivatePeriod(e.target.value)} 
                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer font-bold"
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

              {coachReactivatePeriod === 'custom' && (
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-black uppercase block">Custom Expiration Date &amp; Time</label>
                  <input 
                    type="datetime-local" 
                    value={coachReactivateCustomEnd} 
                    onChange={e => setCoachReactivateCustomEnd(e.target.value)} 
                    className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer font-bold" 
                  />
                </div>
              )}

              {/* Start Date Delay Selection */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase block">Start Date Delay</label>
                <select 
                  value={coachReactivateDelay} 
                  onChange={e => setCoachReactivateDelay(e.target.value)} 
                  className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer font-bold"
                >
                  <option value="0">Immediately (Today)</option>
                  <option value="1">1 Day Delay</option>
                  <option value="3">3 Days Delay</option>
                  <option value="7">7 Days Delay</option>
                  <option value="14">14 Days Delay</option>
                  <option value="30">30 Days Delay</option>
                </select>
              </div>

              {/* Free Trial selection */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Free Trial Plan</label>
                <button
                  type="button"
                  onClick={() => setCoachReactivateIsFreeTrial(!coachReactivateIsFreeTrial)}
                  className={`w-full flex items-center justify-between border px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    coachReactivateIsFreeTrial 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-extrabold' 
                      : 'bg-[#121624] border-gray-800 text-gray-400 font-bold hover:border-gray-700'
                  }`}
                >
                  <span>Free Trial</span>
                  <span className="text-[9px] font-black uppercase font-mono bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">{coachReactivateIsFreeTrial ? "ON" : "OFF"}</span>
                </button>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-3.5 space-y-2">
                <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-wider">Calculated Access Schedule</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-bold">
                  <div>
                    <span className="text-gray-500">Starts:</span>{' '}
                    {(() => {
                      const delayDays = parseInt(coachReactivateDelay) || 0;
                      const start = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);
                      return start.toLocaleDateString();
                    })()}
                  </div>
                  <div>
                    <span className="text-gray-500">Expires:</span>{' '}
                    {(() => {
                      if (coachReactivatePeriod === 'none') return 'Never (Lifetime)';
                      const delayDays = parseInt(coachReactivateDelay) || 0;
                      const start = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);
                      if (coachReactivatePeriod === 'custom') {
                        return coachReactivateCustomEnd ? new Date(coachReactivateCustomEnd).toLocaleDateString() : 'N/A';
                      }
                      let durationMs = 0;
                      if (coachReactivatePeriod === '2 weeks') durationMs = 14 * 24 * 60 * 60 * 1000;
                      else if (coachReactivatePeriod === '1 month') durationMs = 30 * 24 * 60 * 60 * 1000;
                      else if (coachReactivatePeriod === '3 months') durationMs = 90 * 24 * 60 * 60 * 1000;
                      else if (coachReactivatePeriod === '6 months') durationMs = 180 * 24 * 60 * 60 * 1000;
                      else if (coachReactivatePeriod === '12 months') durationMs = 365 * 24 * 60 * 60 * 1000;
                      else if (coachReactivatePeriod === '2 years') durationMs = 730 * 24 * 60 * 60 * 1000;
                      return new Date(start.getTime() + durationMs).toLocaleDateString();
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setCoachReactivateModalOpen(false)}
                className="flex-1 bg-gray-900 border border-gray-850 hover:border-gray-800 text-gray-300 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCoachReactivation}
                disabled={coachReactivateSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                {(() => {
                  if (coachReactivateSaving) return 'Saving...';
                  const targetCoach = profiles.find(p => p.id === coachReactivateId);
                  const tg = targetCoach?.targets || {};
                  const isCurrentlySuspended = tg.is_deactivated === true || 
                    (tg.subscription_end_date && new Date() >= new Date(tg.subscription_end_date)) ||
                    (tg.subscription_start_date && new Date() < new Date(tg.subscription_start_date));
                  return isCurrentlySuspended ? 'Confirm Reactivation' : 'Update Subscription';
                })()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNSAVED CHANGES WARNING DIALOG MODAL */}
      {unsavedChangesPendingAction && (
        <div className="fixed inset-0 bg-[#05050b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="tutorial-unsaved-modal" className="bg-[#0d1220] border border-gray-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl">
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

      {/* SLIDING SUBSCRIPTION DETAILS HISTORY DRAWER */}
      {selectedSubClient && (
        <div 
          className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSelectedSubClient(null)}
        />
      )}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#0d111d] border-l border-gray-850 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          selectedSubClient ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedSubClient && (() => {
          const targets = selectedSubClient.targets || {};
          const now = new Date();
          const isOwner = selectedSubClient.id === OWNER_ID;
          const isDeactivated = !isOwner && targets.is_deactivated === true;
          const isExpired = !isOwner && targets.subscription_end_date && now >= new Date(targets.subscription_end_date);
          const isPending = !isOwner && targets.subscription_start_date && now < new Date(targets.subscription_start_date);

          let statusLabel = 'ACTIVE';
          let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          if (isOwner) {
            statusLabel = 'ACTIVE';
            statusColor = 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20';
          } else if (isDeactivated) {
            statusLabel = 'SUSPENDED';
            statusColor = 'text-red-400 bg-red-500/10 border-red-500/20';
          } else if (isExpired) {
            statusLabel = 'EXPIRED';
            statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
          } else if (isPending) {
            statusLabel = 'PENDING';
            statusColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
          }

          // Build History
          const history = [...(targets.subscription_history || [])];
          if (history.length === 0 && targets.subscription_start_date && targets.subscription_end_date) {
            history.push({
              timestamp: targets.subscription_start_date,
              action: 'initial_activation',
              duration: targets.subscription_duration || 'custom',
              delay_days: targets.subscription_delay_days || 0,
              start_date: targets.subscription_start_date,
              end_date: targets.subscription_end_date
            });
          }
          history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          // Analytics
          const firstAct = history.length > 0 ? history[history.length - 1] : null;
          const lastAct = history.length > 1 ? history[0] : null;

          let cumulativeDays = 0;
          history.forEach((h: any) => {
            if (h.start_date && h.end_date) {
              const start = new Date(h.start_date);
              const end = new Date(h.end_date);
              const diffMs = end.getTime() - start.getTime();
              if (diffMs > 0) {
                cumulativeDays += Math.round(diffMs / (24 * 60 * 60 * 1000));
              }
            }
          });

          return (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-850 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/25 flex items-center justify-center font-black text-sm text-blue-400 uppercase">
                    {selectedSubClient.full_name?.substring(0, 2) || 'AT'}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                      {selectedSubClient.full_name}
                      {targets.client_code && (
                        <span className="text-[9px] bg-blue-950/60 border border-blue-800/40 text-blue-400 px-1 py-0.5 rounded font-black tracking-normal">
                          #{targets.client_code}
                        </span>
                      )}
                    </h3>
                    {(() => {
                      const email = selectedSubClient.email || '';
                      const isVirtual = email.toLowerCase().endsWith('@stride.fit');
                      const contactEmail = targets?.contact_email;
                      if (isVirtual) {
                        return contactEmail ? (
                          <p className="text-[10px] text-gray-400 lowercase mt-0.5">Resolved Email: {contactEmail} (Virtual: {email})</p>
                        ) : (
                          <p className="text-[10px] text-red-400 font-semibold mt-0.5">No Contact Email (Virtual: {email})</p>
                        );
                      }
                      return <p className="text-[10px] text-gray-500 lowercase mt-0.5">{email}</p>;
                    })()}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSubClient(null)}
                  className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 hover:border-gray-700 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Drawer Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {/* Status card */}
                <div className="bg-gray-900/40 p-4 border border-gray-850 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Access Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border mt-1.5 ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Remaining Days</p>
                    <p className="text-xs font-black text-white mt-1">
                      {(() => {
                        if (!targets.subscription_end_date) return 'Unlimited';
                        const diff = new Date(targets.subscription_end_date).getTime() - Date.now();
                        if (diff <= 0) return '0 Days';
                        return `${Math.ceil(diff / (24 * 60 * 60 * 1000))} Days`;
                      })()}
                    </p>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900/30 p-3.5 border border-gray-850/50 rounded-xl space-y-1">
                    <p className="text-[9px] text-gray-500 font-bold uppercase">First Activation</p>
                    <p className="text-xs font-black text-white">
                      {firstAct ? new Date(firstAct.timestamp).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-[8px] text-gray-500">
                      Tier: {firstAct?.duration || 'None'}
                    </p>
                  </div>
                  <div className="bg-gray-900/30 p-3.5 border border-gray-850/50 rounded-xl space-y-1">
                    <p className="text-[9px] text-gray-500 font-bold uppercase">Last Reactivated</p>
                    <p className="text-xs font-black text-white">
                      {lastAct ? new Date(lastAct.timestamp).toLocaleDateString() : 'Never'}
                    </p>
                    <p className="text-[8px] text-gray-500">
                      Tier: {lastAct?.duration || 'None'}
                    </p>
                  </div>
                  <div className="bg-gray-900/30 p-3.5 border border-gray-850/50 rounded-xl col-span-2 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Cumulative Days Active</p>
                      <p className="text-xs font-black text-indigo-400 mt-0.5">{cumulativeDays} Days total</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Calendar size={14} />
                    </div>
                  </div>
                </div>

                {/* Timeline section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <History size={12} className="text-blue-400" /> Subscription History Timeline
                  </h4>

                  {history.length === 0 ? (
                    <div className="bg-[#121624]/20 border border-gray-850/40 rounded-2xl p-6 text-center text-gray-500 text-xs">
                      No subscription log entries recorded yet.
                    </div>
                  ) : (
                    <div className="relative border-l border-gray-850 ml-2.5 pl-6 space-y-6 py-1">
                      {history.map((h: any, idx: number) => {
                        const hStart = h.start_date ? new Date(h.start_date) : null;
                        const hEnd = h.end_date ? new Date(h.end_date) : null;
                        const hNow = new Date();
                        const isHistActive = hStart && hEnd && hNow >= hStart && hNow < hEnd;

                        return (
                          <div key={idx} className="relative group">
                            {/* Point on timeline */}
                            <span className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                              isHistActive
                                ? 'bg-emerald-400 border-emerald-950 ring-4 ring-emerald-500/15'
                                : 'bg-gray-800 border-gray-900'
                            }`} />
                            
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-white uppercase tracking-wider">
                                  {h.action === 'initial_activation' ? '🚀 INITIAL ACTIVATION' : '⚡ PLAN REACTIVATION'}
                                </span>
                                <span className="text-[8px] text-gray-500">
                                  {new Date(h.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-gray-400">
                                Duration: {h.duration || 'custom'} ({h.delay_days > 0 ? `${h.delay_days}d delay` : 'No delay'})
                              </p>
                              <p className="text-[9px] text-gray-500">
                                Range: {hStart ? hStart.toLocaleDateString() : 'N/A'} - {hEnd ? hEnd.toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer action buttons */}
              <div className="p-6 border-t border-gray-850 bg-gray-900/10 flex gap-3">
                <button
                  onClick={() => {
                    setReactivateClientId(selectedSubClient.id);
                    setReactivateClientName(selectedSubClient.full_name || 'Client');
                    setReactivatePeriod(targets.subscription_duration || '1 month');
                    setReactivateDelay('0');
                    setSelectedSubClient(null);
                    setReactivateModalOpen(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Extend / Reactivate
                </button>
                <button
                  onClick={() => {
                    setManagementSelectedClientId(selectedSubClient.id);
                    fetchManagementClientDetails(selectedSubClient.id);
                    setSelectedSubClient(null);
                    setActiveTab('management');
                  }}
                  className="flex-1 bg-gray-900 border border-gray-850 hover:border-gray-800 text-gray-300 font-black py-3 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Manage Profile
                </button>
              </div>
            </>
          );
        })()}
      </div>

      {/* SLIDING COACH CREATION DRAWER */}
      {isRegisteringNewCoach && (
        <div 
          className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-45 transition-opacity duration-300"
          onClick={() => setIsRegisteringNewCoach(false)}
        />
      )}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-[#0d111d] border-l border-gray-850 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          isRegisteringNewCoach ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar space-y-6 flex flex-col justify-start h-full">
          <div className="flex justify-between items-center border-b border-gray-850 pb-4 shrink-0">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="text-blue-500" size={16} /> Register Coach Account
              </h2>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">Create a login and set initial subscription plan</p>
            </div>
            <button 
              onClick={() => setIsRegisteringNewCoach(false)}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-1">
            {createdNewCoachCredentials ? (
              <div className="bg-emerald-950/20 border border-emerald-500/25 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={18} />
                  <span className="text-xs font-black uppercase tracking-wider">Coach Registered Successfully!</span>
                </div>
                <p className="text-xs text-gray-400">Please provide the new coach with their login details:</p>
                <div className="bg-gray-900/60 p-4 rounded-2xl space-y-3 text-xs font-mono border border-gray-800">
                  <div className="flex items-center justify-between group">
                    <p className="text-gray-400 font-bold">Name: <span className="text-white font-black">{createdNewCoachCredentials.name}</span></p>
                    <button
                      type="button"
                      onClick={() => handleCopyField(createdNewCoachCredentials.name, 'Name')}
                      className="p-1 rounded bg-gray-950 border border-gray-850 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Name"
                    >
                      {copiedField === 'Name' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    </button>
                  </div>
                  <div className="border-t border-gray-800/40" />
                  <div className="flex items-center justify-between group">
                    <p className="text-gray-400 font-bold">Username/Email: <span className="text-white font-black">{createdNewCoachCredentials.email}</span></p>
                    <button
                      type="button"
                      onClick={() => handleCopyField(createdNewCoachCredentials.email, 'Email')}
                      className="p-1 rounded bg-gray-950 border border-gray-850 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedField === 'Email' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    </button>
                  </div>
                  <div className="border-t border-gray-800/40" />
                  <div className="flex items-center justify-between group">
                    <p className="text-gray-400 font-bold">Password: <span className="text-white font-black">{createdNewCoachCredentials.password}</span></p>
                    <button
                      type="button"
                      onClick={() => handleCopyField(createdNewCoachCredentials.password, 'Password')}
                      className="p-1 rounded bg-gray-950 border border-gray-850 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Password"
                    >
                      {copiedField === 'Password' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Coach Registered:\nName: ${createdNewCoachCredentials.name}\nUsername/Email: ${createdNewCoachCredentials.email}\nPassword: ${createdNewCoachCredentials.password}`;
                      navigator.clipboard.writeText(text);
                      toast.success('All coach credentials copied!');
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Copy size={12} /> Copy Info
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedNewCoachCredentials(null);
                      setIsRegisteringNewCoach(false);
                    }}
                    className="flex-1 bg-gray-900 border border-gray-850 hover:bg-gray-800 text-gray-300 font-black text-xs uppercase py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
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
                    className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Login Username / Email</label>
                    <input
                      type="email"
                      value={newCoachEmail}
                      onChange={e => setNewCoachEmail(e.target.value)}
                      placeholder="e.g. coach@lifegym.com"
                      className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors font-bold font-mono"
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
                      className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors font-bold font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Contact Email (Reference Only)</label>
                    <input
                      type="email"
                      value={newCoachContactEmail}
                      onChange={e => setNewCoachContactEmail(e.target.value)}
                      placeholder="e.g. personal-email@gmail.com"
                      className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors font-bold font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Coach Number (Phone / ID)</label>
                    <input
                      type="text"
                      value={newCoachPhoneNumber}
                      onChange={e => setNewCoachPhoneNumber(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors font-bold"
                    />
                  </div>
                </div>

                {/* Initial Subscription Setup */}
                <div className="border border-gray-850 bg-gray-950/20 p-5 rounded-3xl space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">Initial Subscription Plan</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Plan Duration Preset</label>
                      <select
                        value={registerCoachSubPeriod}
                        onChange={e => setRegisterCoachSubPeriod(e.target.value)}
                        className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors cursor-pointer font-bold"
                      >
                        <option value="2 weeks">2 Weeks Trial</option>
                        <option value="1 month">1 Month Plan</option>
                        <option value="3 months">3 Months Plan</option>
                        <option value="6 months">6 Months Plan</option>
                        <option value="12 months">1 Year Plan</option>
                        <option value="2 years">2 Years Plan</option>
                        <option value="none">No Expiry (Lifetime)</option>
                        <option value="custom">Custom End Date & Time</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Delay Start Date</label>
                      <select
                        value={registerCoachSubDelay}
                        onChange={e => setRegisterCoachSubDelay(e.target.value)}
                        className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors cursor-pointer font-bold"
                      >
                        <option value="0">Start Immediately</option>
                        <option value="1">Delay 1 Day</option>
                        <option value="3">Delay 3 Days</option>
                        <option value="7">Delay 1 Week</option>
                        <option value="14">Delay 2 Weeks</option>
                        <option value="30">Delay 30 Days</option>
                      </select>
                    </div>
                  </div>

                  {registerCoachSubPeriod === 'custom' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Custom Subscription End Date</label>
                      <input
                        type="datetime-local"
                        value={registerCoachSubCustomEnd}
                        onChange={e => setRegisterCoachSubCustomEnd(e.target.value)}
                        className="w-full bg-[#121624] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors cursor-pointer font-bold"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={registerCoachSubIsFreeTrial}
                      onChange={e => setRegisterCoachSubIsFreeTrial(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-800 text-blue-600 bg-gray-900 focus:ring-0 focus:ring-offset-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Enable Free Trial Mode</span>
                      <span className="text-[9px] text-gray-500 font-medium">Marks this initial period as a trial subscription</span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisteringNewCoach(false)}
                    className="flex-1 bg-gray-900 border border-gray-850 hover:border-gray-800 text-gray-300 font-black uppercase py-3 rounded-2xl text-xs tracking-wider transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingNewCoach}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white text-xs font-black uppercase py-3 rounded-2xl transition-all cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    {isCreatingNewCoach ? 'Registering...' : 'Register Coach'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* SLIDING COACH DETAILS DRAWER */}
      {selectedSystemCoach && (
        <div 
          className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSelectedSystemCoach(null)}
        />
      )}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[520px] bg-[#0d111d] border-l border-gray-850 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          selectedSystemCoach ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedSystemCoach && (() => {
          const currentCoach = profiles.find(p => p.id === selectedSystemCoach.id) || selectedSystemCoach;
          const coachClients = profiles.filter(p => p.role === 'client' && p.coach_id === currentCoach.id);
          const isSelf = currentCoach.id === OWNER_ID;
          const tg = currentCoach.targets || {};
          
          return (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-850 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-sm uppercase ${
                    isSelf ? 'bg-indigo-900/40 text-indigo-300' : 'bg-blue-900/40 text-blue-300'
                  }`}>
                    {currentCoach.display_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      {currentCoach.display_name}
                      {isSelf && <span className="text-[7px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-1 rounded uppercase tracking-wider font-mono">Owner</span>}
                    </h2>
                    <p className="text-[10px] text-gray-500 lowercase mt-0.5">@{currentCoach.username} | Login: {currentCoach.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSystemCoach(null)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar font-bold">
                
                {/* Contact Information */}
                <div className="bg-[#121624]/40 border border-gray-850 p-5 rounded-2xl space-y-3.5">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <User size={12} /> Contact & Reference Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider mb-0.5">Contact Email</p>
                      <p className="text-white font-mono">{tg.contact_email || currentCoach.email || 'Not added'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider mb-0.5">Phone Number / ID</p>
                      <p className="text-white font-bold">{tg.phone_number || 'Not added'}</p>
                    </div>
                  </div>
                </div>

                {/* Subscription Settings */}
                {!isSelf && (
                  <div className="bg-[#121624]/40 border border-gray-850 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <CreditCard size={12} /> Subscription Settings
                      </h3>
                      {(() => {
                        const isSuspended = tg.is_deactivated === true;
                        const now = new Date();
                        const end = tg.subscription_end_date ? new Date(tg.subscription_end_date) : null;
                        const start = tg.subscription_start_date ? new Date(tg.subscription_start_date) : null;
                        let statusText = 'Active';
                        let statusClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                        
                        if (isSuspended) {
                          statusText = 'Suspended';
                          statusClass = 'text-red-400 bg-red-500/10 border-red-500/20';
                        } else if (end && now >= end) {
                          statusText = 'Expired';
                          statusClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                        } else if (start && now < start) {
                          statusText = 'Scheduled';
                          statusClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                        } else if (tg.is_free_trial === true || tg.subscription_status === 'trial') {
                          statusText = 'Active (Free Trial)';
                          statusClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                        }
                        
                        return (
                          <span className={`text-[7px] uppercase tracking-wider font-mono border px-1.5 py-0.5 rounded font-black ${statusClass}`}>
                            {statusText}
                          </span>
                        );
                      })()}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider mb-0.5">Start Date</p>
                        <p className="text-white font-mono">
                          {tg.subscription_start_date 
                            ? new Date(tg.subscription_start_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) 
                            : 'Immediate'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider mb-0.5">End Date</p>
                        <p className="text-white font-mono">
                          {tg.subscription_end_date 
                            ? new Date(tg.subscription_end_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) 
                            : 'Lifetime'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setCoachReactivateId(currentCoach.id);
                        setCoachReactivateName(currentCoach.display_name);
                        setCoachReactivatePeriod(tg.subscription_duration || '1 month');
                        setCoachReactivateDelay(tg.subscription_delay || '0');
                        setCoachReactivateIsFreeTrial(tg.is_free_trial === true || tg.subscription_status === 'trial');
                        if (tg.subscription_end_date) {
                          setCoachReactivateCustomEnd(new Date(tg.subscription_end_date).toISOString().substring(0, 16));
                        } else {
                          setCoachReactivateCustomEnd(getLocalDateTimeString());
                        }
                        setCoachReactivateModalOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all active:scale-95 cursor-pointer text-center font-bold"
                    >
                      Update Subscription Dates
                    </button>
                  </div>
                )}

                {/* Suspension status */}
                {!isSelf && (
                  <div className="bg-red-500/[0.02] border border-red-900/20 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Deactivate / Suspend Access</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Temporarily block this coach from logging in.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (tg.is_deactivated === true) {
                          // Reactivate -> Open Duration Dialog/Modal
                          setCoachReactivateId(currentCoach.id);
                          setCoachReactivateName(currentCoach.display_name);
                          setCoachReactivatePeriod('1 month');
                          setCoachReactivateDelay('0');
                          setCoachReactivateIsFreeTrial(false);
                          setCoachReactivateCustomEnd(getLocalDateTimeString());
                          setCoachReactivateModalOpen(true);
                        } else {
                          // Suspend -> Prompt confirmation
                          showConfirm(
                            'Suspend Coach',
                            `Are you sure you want to suspend coach ${currentCoach.display_name}? This will block their login access immediately.`,
                            'danger',
                            () => {
                              handleToggleCoachSuspension(currentCoach.id, false);
                            }
                          );
                        }
                      }}
                      disabled={updatingCoachStatus || isDeletingCoach}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 cursor-pointer ${
                        tg.is_deactivated === true 
                          ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/25 text-white' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {updatingCoachStatus ? 'Updating...' : (tg.is_deactivated === true ? 'Reactivate Coach' : 'Suspend Coach')}
                    </button>
                  </div>
                )}

                {/* Dangerous Actions - Delete Coach */}
                {!isSelf && (
                  <div className="bg-red-950/5 border border-red-950/20 p-5 rounded-2xl space-y-3">
                    <h3 className="text-xs font-black uppercase text-red-400">Dangerous Actions</h3>
                    <p className="text-[10px] text-red-400/60 leading-relaxed font-bold">
                      Permanently delete this coach's login and administrative access. Active clients will be reassigned to the main administrator.
                    </p>
                    <button
                      type="button"
                      disabled={isDeletingCoach}
                      onClick={() => {
                        const name = currentCoach.display_name || 'this coach';
                        showPrompt(
                          'Confirm Coach Deletion',
                          `Type "${name}" to confirm complete coach account deletion (all of this coach's clients will be deleted too):`,
                          '',
                          'Type coach name...',
                          async (conf) => {
                            if (conf !== name) {
                              if (conf !== null) toast.error('Verification failed. Deletion cancelled.');
                              return;
                            }

                            setIsDeletingCoach(true);
                            const toastId = toast.loading('Deleting coach and all clients...');
                            try {
                              // Delete coach via secure API (handles cascading deletes for clients and archives everything)
                              const res = await fetch('/api/delete-user', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${sessionToken}`
                                    },
                                    body: JSON.stringify({ uid: currentCoach.id })
                              });

                              if (!res.ok) {
                                const errData = await res.json().catch(() => ({}));
                                throw new Error(errData.error || 'Failed to delete coach');
                              }

                              toast.success('Coach and all assigned clients deleted successfully.', { id: toastId });
                              setSelectedSystemCoach(null);
                              fetchBaseData();
                            } catch (err: any) {
                              console.error(err);
                              toast.error('Deletion failed: ' + err.message, { id: toastId });
                            } finally {
                              setIsDeletingCoach(false);
                            }
                          }
                        );
                      }}
                      className="w-full bg-red-650 hover:bg-red-600 text-white font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-lg shadow-red-500/5 disabled:opacity-50"
                    >
                      <Trash2 size={13} /> {isDeletingCoach ? 'Deleting...' : 'Delete Coach Account'}
                    </button>
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#121624]/60 border border-gray-800 p-4 rounded-xl text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Clients</p>
                    <p className="text-xl font-black text-white mt-1">{coachClients.length}</p>
                  </div>
                  <div className="bg-[#121624]/60 border border-gray-800 p-4 rounded-xl text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Active</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">{coachClients.filter(c => c.targets?.is_deactivated !== true).length}</p>
                  </div>
                  <div className="bg-[#121624]/60 border border-gray-800 p-4 rounded-xl text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Suspended</p>
                    <p className="text-xl font-black text-red-400 mt-1">{coachClients.filter(c => c.targets?.is_deactivated === true).length}</p>
                  </div>
                </div>

                {/* Plan Setup */}
                {!isSelf && (
                  <div className="bg-[#121624]/30 border border-gray-800 rounded-2xl p-5 space-y-4">
                    <div className="border-b border-gray-850 pb-2 flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-wide text-blue-400 flex items-center gap-1.5">
                        <CreditCard size={14} /> Plan &amp; Billing Control
                      </h3>
                      {(() => {
                        const now = new Date();
                        const isExpired = tg.subscription_end_date && now >= new Date(tg.subscription_end_date);
                        const isPending = tg.subscription_start_date && now < new Date(tg.subscription_start_date);
                        const isDeact = tg.is_deactivated === true;
                        
                        let statusLabel = "ACTIVE";
                        let statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                        if (isDeact) {
                          statusLabel = "SUSPENDED";
                          statusColor = "bg-red-500/10 text-red-400 border-red-500/20";
                        } else if (isExpired) {
                          statusLabel = "EXPIRED";
                          statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                        } else if (isPending) {
                          statusLabel = "PENDING";
                          statusColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                        } else if (tg.is_free_trial === true || tg.subscription_status === 'trial') {
                          statusLabel = "ACTIVE (FREE TRIAL)";
                          statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                        }
                        return (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {statusLabel}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-[#121624]/60 p-3.5 rounded-xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Start Date</p>
                        <p className="text-white font-extrabold">
                          {tg.subscription_start_date 
                            ? new Date(tg.subscription_start_date).toLocaleDateString()
                            : 'Immediate (Not set)'
                          }
                        </p>
                      </div>
                      <div className="bg-[#121624]/60 p-3.5 rounded-xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Expiration Date</p>
                        <p className="text-white font-extrabold">
                          {tg.subscription_end_date 
                            ? new Date(tg.subscription_end_date).toLocaleDateString()
                            : 'Never (Lifetime)'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Plan Preset</label>
                        <select
                          value={coachSubPeriod}
                          onChange={e => setCoachSubPeriod(e.target.value)}
                          className="w-full bg-[#131b2e] border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold cursor-pointer"
                        >
                          <option value="2 weeks">2 Weeks</option>
                          <option value="1 month">1 Month</option>
                          <option value="3 months">3 Months</option>
                          <option value="6 months">6 Months</option>
                          <option value="12 months">12 Months</option>
                          <option value="2 years">2 Years</option>
                          <option value="none">No Expiry (Lifetime)</option>
                          <option value="custom">Custom Date</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Start Delay (Days)</label>
                        <select
                          value={coachSubDelay}
                          onChange={e => setCoachSubDelay(e.target.value)}
                          className="w-full bg-[#131b2e] border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold cursor-pointer"
                        >
                          <option value="0">Immediate (0 days)</option>
                          <option value="1">1 Day delay</option>
                          <option value="3">3 Days delay</option>
                          <option value="7">7 Days delay</option>
                          <option value="14">14 Days delay</option>
                          <option value="30">30 Days delay</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 flex flex-col justify-end">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Free Trial Plan</label>
                        <div className="flex items-center h-full">
                          <button
                            type="button"
                            onClick={() => setCoachSubIsFreeTrial(!coachSubIsFreeTrial)}
                            className={`w-full flex items-center justify-between border px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                              coachSubIsFreeTrial 
                                ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-extrabold' 
                                : 'bg-[#131b2e] border-gray-750 text-gray-400 font-bold hover:border-gray-600'
                            }`}
                          >
                            <span>Free Trial</span>
                            <span className="text-[9px] font-black uppercase font-mono bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">{coachSubIsFreeTrial ? "ON" : "OFF"}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {coachSubPeriod === 'custom' && (
                      <div className="space-y-1.5 text-xs">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Custom Expiration Date &amp; Time</label>
                        <input
                          type="datetime-local"
                          value={coachSubCustomEnd}
                          onChange={e => setCoachSubCustomEnd(e.target.value)}
                          className="w-full bg-[#131b2e] border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold cursor-pointer"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        await handleUpdateCoachSubscription(currentCoach.id);
                        // Refresh the local drawer copy so stats update
                        const updatedCoach = systemCoaches.find(c => c.id === currentCoach.id);
                        if (updatedCoach) {
                          setSelectedSystemCoach(updatedCoach);
                        }
                      }}
                      disabled={updatingCoachSub}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white text-xs font-black uppercase py-3 rounded-2xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5"
                    >
                      <CreditCard size={14} />
                      {updatingCoachSub ? 'Saving Plan...' : 'Save Plan / Billing Changes'}
                    </button>
                  </div>
                )}

                {/* Interactive Client re-assignment list */}
                <div className="bg-[#121624]/30 border border-gray-800 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-gray-850 pb-2 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-wide text-blue-400">Assigned Clients &amp; Re-assignment</h3>
                    <span className="text-[10px] text-gray-500 font-bold">{coachClients.length} users</span>
                  </div>

                  <div className="divide-y divide-gray-850 max-h-[300px] overflow-y-auto pr-1 no-scrollbar text-xs">
                    {coachClients.length === 0 ? (
                      <p className="text-xs text-gray-500 italic py-12 text-center">No athletes assigned to this coach.</p>
                    ) : (
                      coachClients.map(client => {
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
                                <option value="" disabled>Select destination...</option>
                                {systemCoaches
                                  .filter(c => c.id !== currentCoach.id)
                                  .map(c => (
                                    <option key={c.id} value={c.id}>Move to {c.display_name}</option>
                                  ))
                                }
                              </select>
                              <button
                                onClick={async () => {
                                  await handleReassignClient(client.id, selectedDestCoachId);
                                  // Re-fetch to sync
                                  const updatedCoach = systemCoaches.find(c => c.id === currentCoach.id);
                                  if (updatedCoach) {
                                    setSelectedSystemCoach(updatedCoach);
                                  }
                                }}
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

                {/* Sub History Logs List */}
                {!isSelf && tg.subscription_history && tg.subscription_history.length > 0 && (
                  <div className="bg-[#121624]/30 border border-gray-800 rounded-2xl p-5 space-y-4">
                    <div className="border-b border-gray-850 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wide text-blue-400">Subscription History Logs</h3>
                    </div>
                    <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                      {tg.subscription_history
                        .slice()
                        .reverse()
                        .map((entry: any, index: number) => (
                          <div key={index} className="text-[11px] bg-[#121624]/60 p-3 rounded-xl border border-gray-850 space-y-1">
                            <div className="flex justify-between items-center text-gray-500 font-mono">
                              <span>{new Date(entry.timestamp).toLocaleString()}</span>
                              <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] bg-gray-800 px-1.5 py-0.5 rounded">
                                {entry.action?.replace('coach_subscription_', '') || 'Action'}
                              </span>
                            </div>
                            <div className="text-gray-300 font-medium">
                              {entry.action === 'coach_subscription_initial' ? (
                                <p>Registered coach account with a <span className="text-blue-400 font-bold">{entry.period} preset</span> duration (Delay: {entry.delay_days} days).</p>
                              ) : (
                                <p>Updated billing profile. Extended plan preset to <span className="text-blue-400 font-bold">{entry.period}</span> (Delay: {entry.delay_days} days).</p>
                              )}
                              <p className="text-[10px] text-gray-500 mt-1">
                                Effective: <span className="text-gray-400">{entry.start_date ? new Date(entry.start_date).toLocaleDateString() : 'N/A'}</span> to <span className="text-gray-400">{entry.end_date ? new Date(entry.end_date).toLocaleDateString() : 'Never'}</span>
                              </p>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })()}
      </div>
    </div>

    {/* Blocking Forced App Update Overlay */}
    {isRunningInElectron && updateStatus.available && (
      <div className="fixed inset-0 bg-[#07080e] z-[999] flex items-center justify-center p-6 select-none font-sans">
        <div className="bg-[#111322] border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative flex flex-col items-center">
          {/* Download Icon */}
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
            <ArrowUpCircle size={32} className="text-blue-500 animate-bounce" />
          </div>

          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">Update Required</h2>
          <p className="text-gray-400 text-xs leading-relaxed max-w-[320px] mb-8">
            A new version of the Life Gym Coach Portal is available. You must update the application to version <span className="font-mono font-bold text-blue-400">v{updateStatus.version}</span> to continue using the platform.
          </p>

          {updateStatus.downloading ? (
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-400 px-1">
                <span>Downloading Setup...</span>
                <span className="font-mono text-blue-400 font-bold">{updateStatus.progress}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/50">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${updateStatus.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 leading-normal">
                Downloading setup installer package. The app will automatically close, install the update, and restart.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <button
                onClick={handleStartUpdate}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowUpCircle size={15} />
                <span>Download & Install Update Now</span>
              </button>
              {updateStatus.error && (
                <div className="text-red-400 text-xs font-semibold mt-2 leading-relaxed bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-xl">
                  Error: {updateStatus.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )}
    {/* Instant Offline Reconnect Overlay */}
    {!isOnline && (
      <div className="fixed inset-0 bg-[#07080e] z-[1000] flex items-center justify-center p-6 select-none font-sans">
        <div className="bg-[#111322] border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative flex flex-col items-center">
          {/* Pulsing WiFi Off Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
            <WifiOff size={32} className="text-red-500" />
          </div>

          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">Connection Lost</h2>
          <p className="text-gray-400 text-xs leading-relaxed max-w-[320px] mb-8">
            It looks like you are offline. Please check your WiFi or ethernet connection. The portal will automatically reconnect once your internet is restored.
          </p>

          {/* Reconnect Spinner */}
          <div className="flex items-center gap-2 justify-center text-xs font-semibold text-gray-500">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Waiting for connection...</span>
          </div>
        </div>
      </div>
    )}

    {showTutorial && renderGuidedTutorial()}
  </>
);
}
