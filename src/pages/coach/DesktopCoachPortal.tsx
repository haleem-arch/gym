import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  Users, UserPlus, Database, ShieldAlert, Activity, Search, 
  Trash2, Shield, Key, ChevronRight, Scale, Ruler, Calendar, 
  Dumbbell, Save, UserCheck, UserX, Apple, CheckCircle, RefreshCw
} from 'lucide-react';
import { Card } from '../../components/Card';
import { DumbbellLoader } from '../../components/DumbbellLoader';

const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

export default function DesktopCoachPortal() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'deploy' | 'system'>('overview');
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
  const [workoutDays, setWorkoutDays] = useState<any[]>([]);
  const [activeSplitDayIdx, setActiveSplitDayIdx] = useState(0);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [loadingClientDetails, setLoadingClientDetails] = useState(false);

  // Client target updates (Clients Tab)
  const [targetKcal, setTargetKcal] = useState(2400);
  const [targetProtein, setTargetProtein] = useState(160);
  const [targetCarbs, setTargetCarbs] = useState(240);
  const [targetFat, setTargetFat] = useState(70);
  const [targetWaterLiters, setTargetWaterLiters] = useState(3.5);
  const [savingTargets, setSavingTargets] = useState(false);

  // Quota & Suspension states (Clients Tab)
  const [aiQuotaInput, setAiQuotaInput] = useState<number>(20);
  const [updatingQuota, setUpdatingQuota] = useState(false);
  const [updatingSuspension, setUpdatingSuspension] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Search queries
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [systemSearchQuery, setSystemSearchQuery] = useState('');

  // Deploy Athlete form
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
    injuries_notes: ''
  });
  const [deployGender, setDeployGender] = useState<'male' | 'female'>('male');
  const [deploySplits] = useState<any[]>([
    { key: 'PUSH', label: 'Push', color: '#ef4444', exercises: [
      { name: 'Incline DB Bench Press (45°)', muscle_group: 'Chest', sets: 3, rest: 120 },
      { name: 'DB Shoulder Press (seated neutral)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
      { name: 'Overhead Cable Extension (rope)', muscle_group: 'Triceps', sets: 3, rest: 120 }
    ]},
    { key: 'PULL', label: 'Pull', color: '#3b82f6', exercises: [
      { name: 'Lat Pulldown (wide grip)', muscle_group: 'Back', sets: 3, rest: 120 },
      { name: 'Chest-Supported DB Row', muscle_group: 'Back', sets: 3, rest: 120 },
      { name: 'Incline DB Curl - Bayesian', muscle_group: 'Biceps', sets: 3, rest: 120 }
    ]},
    { key: 'LEGS', label: 'Legs', color: '#eab308', exercises: [
      { name: 'Leg Press (feet high for glutes)', muscle_group: 'Legs', sets: 3, rest: 120 },
      { name: 'DB Romanian Deadlift', muscle_group: 'Legs', sets: 3, rest: 120 },
      { name: 'Standing Calf Raise', muscle_group: 'Calves', sets: 3, rest: 120 }
    ]}
  ]);

  // System Tab: Coach creation form
  const [coachName, setCoachName] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [coachPassword, setCoachPassword] = useState('');
  const [isCreatingCoach, setIsCreatingCoach] = useState(false);
  const [createdCoachCredentials, setCreatedCoachCredentials] = useState<any | null>(null);

  // System Tab: Selected User for detail popup / controls
  const [systemSelectedUser, setSystemSelectedUser] = useState<any | null>(null);
  const [systemSelectedUserPassword, setSystemSelectedUserPassword] = useState('');
  const [systemUpdatingPassword, setSystemUpdatingPassword] = useState(false);
  const [systemDeletingUser, setSystemDeletingUser] = useState(false);

  // ─── INITIAL BOOTSTRAP ─────────────────────────────────────
  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setCoachUserId(session.user.id);
      setSessionToken(session.access_token);

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (myProfile?.role !== 'coach' && session.user.id !== OWNER_ID) {
        setIsNotCoach(true);
        setLoading(false);
        return;
      }

      const isOwner = session.user.id === OWNER_ID;

      // 1. Fetch profiles
      let profilesQuery = supabase.from('profiles').select('*').order('display_name');
      if (!isOwner) {
        profilesQuery = profilesQuery.eq('coach_id', session.user.id);
      }
      const { data: userProfiles } = await profilesQuery;
      if (userProfiles) {
        setProfiles(userProfiles);
        setClientsList(userProfiles.filter(p => p.role === 'client'));
      }

      // 2. Fetch feed data
      await fetchFeedData();

      setDbHealthy(true);
    } catch (err) {
      console.error(err);
      setDbHealthy(false);
    } finally {
      setLoading(false);
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

  // ─── FETCH CLIENT DETAILS ──────────────────────────────────
  const fetchClientDetails = async (clientId: string) => {
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
      setAiQuotaInput(clientProfile.user?.targets?.ai_quota_limit ?? 20);

      // Set initial macro states
      const targets = clientProfile.user?.targets || {};
      setTargetKcal(targets.kcal || 2400);
      setTargetProtein(targets.protein || 160);
      setTargetCarbs(targets.carbs || 240);
      setTargetFat(targets.fat || 70);
      setTargetWaterLiters((targets.water_goal_ml || 3500) / 1000);

      // Weight & Scans
      const { data: scans } = await supabase
        .from('inbody_scans')
        .select('*')
        .eq('user_id', clientId)
        .order('date', { ascending: false });
      
      if (scans && scans.length > 0) {
        setLatestWeight(scans[0].weight);
      } else {
        setLatestWeight(null);
      }

      // Workout Plans
      const { data: plans } = await supabase
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: true });

      const normalisedDays = (plans || []).map((p: any, idx: number) => ({
        id: p.id,
        day_number: idx + 1,
        day_name: p.plan_type + ' Day',
        exercises: (p.exercises || []).map((ex: any) => ({
          ...ex,
          reps_min: ex.reps_min ?? 8,
          reps_max: ex.reps_max ?? 12,
        })),
        nutrition: p.nutrition || null,
      }));

      setWorkoutDays(normalisedDays);
      setActiveSplitDayIdx(0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load client profile details.');
    } finally {
      setLoadingClientDetails(false);
    }
  };

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
      
      // Update state ref
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

  // ─── CLIENT OPERATIONS ─────────────────────────────────────
  const handleSaveQuota = async () => {
    if (!selectedClientId || !selectedClientProfile) return;
    setUpdatingQuota(true);
    try {
      const currentTargets = selectedClientProfile.user?.targets || {};
      const updatedTargets = { ...currentTargets, ai_quota_limit: aiQuotaInput };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', selectedClientId);

      if (error) throw error;
      toast.success('AI Coach quota updated!');
      setSelectedClientProfile((prev: any) => ({
        ...prev,
        user: { ...prev.user, targets: updatedTargets }
      }));
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update quota.');
    } finally {
      setUpdatingQuota(false);
    }
  };

  const handleToggleSuspension = async () => {
    if (!selectedClientId || !selectedClientProfile) return;
    const isSuspended = selectedClientProfile.user?.targets?.is_deactivated === true;
    const msg = isSuspended ? 'Reactivate athlete access?' : 'Suspend athlete access immediately?';
    if (!window.confirm(msg)) return;

    setUpdatingSuspension(true);
    try {
      const currentTargets = selectedClientProfile.user?.targets || {};
      const updatedTargets = { ...currentTargets, is_deactivated: !isSuspended };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', selectedClientId);

      if (error) throw error;
      toast.success(isSuspended ? 'Athlete reactivated!' : 'Athlete account suspended.');
      setSelectedClientProfile((prev: any) => ({
        ...prev,
        user: { ...prev.user, targets: updatedTargets }
      }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update suspension status.');
    } finally {
      setUpdatingSuspension(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || newPassword.trim().length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setUpdatingPassword(true);
    try {
      const res = await fetch('/api/update-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ uid: selectedClientId, password: newPassword.trim() })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update passcode in auth server');
      }

      await supabase
        .from('client_profiles')
        .update({ generated_passcode: newPassword.trim() })
        .eq('user_id', selectedClientId);

      toast.success('Athlete access passcode reset successfully!');
      setNewPassword('');
      fetchClientDetails(selectedClientId);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClientId || !selectedClientProfile) return;
    const name = selectedClientProfile.user?.display_name || 'this client';
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
        body: JSON.stringify({ uid: selectedClientId })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn('Auth deletion warning:', errData.error);
      }

      // Clear local database rows
      await supabase.from('inbody_scans').delete().eq('user_id', selectedClientId);
      await supabase.from('client_workout_days').delete().eq('user_id', selectedClientId);
      await supabase.from('user_workout_plans').delete().eq('user_id', selectedClientId);
      await supabase.from('progress_notes').delete().eq('user_id', selectedClientId);
      await supabase.from('water_logs').delete().eq('user_id', selectedClientId);
      await supabase.from('client_profiles').delete().eq('user_id', selectedClientId);
      await supabase.from('profiles').delete().eq('id', selectedClientId);

      toast.success('Athlete wiped successfully.', { id: toastId });
      setSelectedClientId(null);
      setSelectedClientProfile(null);
      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Wipe failed: ' + err.message, { id: toastId });
    }
  };

  // ─── DEPLOY ATHLETE ACTION ─────────────────────────────────
  const handleDeployAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // 3. Public Profiles setup
      const targets = {
        onboarding_completed: true,
        show_welcome_animation: true,
        water_goal_ml: 3500,
        day_nutrition: {},
        gender: deployGender,
        kcal: 2500,
        protein: 160,
        carbs: 240,
        fat: 70,
        client_code: nextClientCode,
        phone_number: formData.phoneNumber.trim()
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

      // 4. Client Profiles row
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

      // 5. InBody
      const weightVal = parseFloat(formData.age); // using age/weight mockup
      await supabase.from('inbody_scans').insert({
        user_id: clientUserId,
        date: new Date().toISOString().split('T')[0],
        weight: weightVal || 75,
        smm: 34,
        bfm: 12,
        bf_percent: 16,
        bmr: 1700,
        score: 75,
        segmental: { visceralFat: 6 }
      });

      // 6. Workout plans & days
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
      
      // Reset form
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
        injuries_notes: ''
      });

      // Refresh list
      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Deployment encountered an error.');
    } finally {
      setDeployLoading(false);
    }
  };

  // ─── SYSTEM TAB: COACH GENERATION ─────────────────────────
  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachName || !coachEmail || !coachPassword) {
      toast.error('Coach Name, Email and Password are required.');
      return;
    }
    setIsCreatingCoach(true);
    setCreatedCoachCredentials(null);

    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          email: coachEmail,
          password: coachPassword,
          display_name: coachName,
          gender: 'male',
          role: 'coach'
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create coach account');
      }

      setCreatedCoachCredentials({
        name: coachName,
        email: coachEmail,
        password: coachPassword
      });

      toast.success('Coach registered successfully!');
      setCoachName('');
      setCoachEmail('');
      setCoachPassword('');
      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to register coach.');
    } finally {
      setIsCreatingCoach(false);
    }
  };

  // ─── SYSTEM TAB: USER/COACH DETAIL & MANAGEMENT ───────────
  const handleUpdateSystemUserStatus = async (uid: string, fields: { role?: string; is_deactivated?: boolean }) => {
    try {
      const response = await fetch('/api/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ uid, ...fields })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to update user');
      }

      toast.success('User details updated!');
      
      // Update local view
      setProfiles((prev: any[]) => prev.map(p => {
        if (p.id === uid) {
          const updatedTargets = { ...(p.targets || {}) };
          if (fields.is_deactivated !== undefined) {
            updatedTargets.is_deactivated = fields.is_deactivated;
          }
          return {
            ...p,
            role: fields.role !== undefined ? fields.role : p.role,
            targets: updatedTargets
          };
        }
        return p;
      }));

      if (systemSelectedUser && systemSelectedUser.id === uid) {
        setSystemSelectedUser((prev: any) => {
          const updatedTargets = { ...(prev.targets || {}) };
          if (fields.is_deactivated !== undefined) {
            updatedTargets.is_deactivated = fields.is_deactivated;
          }
          return {
            ...prev,
            role: fields.role !== undefined ? fields.role : prev.role,
            targets: updatedTargets
          };
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const handleChangeSystemUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemSelectedUser || !systemSelectedUserPassword) return;
    setSystemUpdatingPassword(true);
    try {
      const response = await fetch('/api/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ uid: systemSelectedUser.id, password: systemSelectedUserPassword })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Password update failed');
      }

      toast.success('User password changed successfully!');
      setSystemSelectedUserPassword('');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to change password: ' + err.message);
    } finally {
      setSystemUpdatingPassword(false);
    }
  };

  const handleDeleteSystemUser = async (uid: string) => {
    if (!systemSelectedUser) return;
    const name = systemSelectedUser.display_name || systemSelectedUser.email.split('@')[0];
    const confirmName = window.prompt(`WARNING: This action is permanent and will completely delete the user/coach account "${name}" from the system. \n\nType the user's name to confirm:`);
    
    if (confirmName !== name) {
      if (confirmName !== null) toast.error('Verification failed. Deletion cancelled.');
      return;
    }

    setSystemDeletingUser(true);
    const toastId = toast.loading('Deleting account...');
    try {
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ uid })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'API deletion failed.');
      }

      await supabase.from('inbody_scans').delete().eq('user_id', uid);
      await supabase.from('client_workout_days').delete().eq('user_id', uid);
      await supabase.from('user_workout_plans').delete().eq('user_id', uid);
      await supabase.from('progress_notes').delete().eq('user_id', uid);
      await supabase.from('water_logs').delete().eq('user_id', uid);
      await supabase.from('client_profiles').delete().eq('user_id', uid);
      await supabase.from('profiles').delete().eq('id', uid);

      toast.success('Account wiped successfully.', { id: toastId });
      setSystemSelectedUser(null);
      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete account.', { id: toastId });
    } finally {
      setSystemDeletingUser(false);
    }
  };

  // Filters
  const filteredClients = clientsList.filter(c => 
    c.display_name?.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.username?.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const filteredSystemUsers = profiles.filter(p => 
    p.display_name?.toLowerCase().includes(systemSearchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(systemSearchQuery.toLowerCase())
  );

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
            onClick={fetchBaseData}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900/40 text-[10px] font-bold text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </header>

      {/* Main Grid Sidebar + Panel */}
      <div className="flex-1 flex items-stretch">
        
        {/* Sidebar Nav */}
        <aside className="w-[240px] border-r border-gray-850 bg-[#070710]/40 flex flex-col p-4 space-y-1.5">
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 px-3.5 mb-2">Main Navigation</p>
          
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'overview' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            <Activity size={15} /> Operational Overview
          </button>

          <button 
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'clients' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            <Users size={15} /> Athlete Directory
          </button>

          <button 
            onClick={() => setActiveTab('deploy')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'deploy' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            <UserPlus size={15} /> Deploy New Athlete
          </button>

          <button 
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
              activeTab === 'system' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black' 
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
            }`}
          >
            <Shield size={15} /> System Console
          </button>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-6xl">
              
              {/* Demographics Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 flex flex-col gap-1 relative overflow-hidden bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                  <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total System Accounts</p>
                  <p className="text-3xl font-black text-white mt-2">{profiles.length}</p>
                </Card>
                <Card className="p-6 flex flex-col gap-1 relative overflow-hidden bg-gradient-to-br from-[#0c1020] to-[#0d1222]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Coaches Active</p>
                  <p className="text-3xl font-black text-blue-400 mt-2">{profiles.filter(p => p.role === 'coach').length}</p>
                </Card>
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
                      onClick={() => fetchClientDetails(client.id)}
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
                  <div className="absolute inset-0 bg-[#0b0c16]/80 flex flex-col items-center justify-center z-10 rounded-3xl">
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
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

                    {/* Layout Split: Macro updates vs Training Split */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                      
                      {/* Macro / Goals updates */}
                      <Card className="p-5 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 border-b border-gray-800 pb-2 flex items-center gap-2">
                          <Apple size={14} /> Macro &amp; Hydration Targets
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Calories (kcal)</label>
                            <input 
                              type="number" value={targetKcal} onChange={e => setTargetKcal(parseInt(e.target.value) || 0)}
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Protein (g)</label>
                            <input 
                              type="number" value={targetProtein} onChange={e => setTargetProtein(parseInt(e.target.value) || 0)}
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Carbs (g)</label>
                            <input 
                              type="number" value={targetCarbs} onChange={e => setTargetCarbs(parseInt(e.target.value) || 0)}
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Fat (g)</label>
                            <input 
                              type="number" value={targetFat} onChange={e => setTargetFat(parseInt(e.target.value) || 0)}
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Water Goal (Liters)</label>
                            <input 
                              type="number" step="0.1" value={targetWaterLiters} onChange={e => setTargetWaterLiters(parseFloat(e.target.value) || 0)}
                              className="w-full bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleSaveTargets}
                          disabled={savingTargets}
                          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {savingTargets ? 'Saving Targets...' : <><Save size={13} /> Save Nutrition Targets</>}
                        </button>
                      </Card>

                      {/* Training splits */}
                      <Card className="p-5 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 border-b border-gray-800 pb-2 flex items-center gap-2">
                            <Dumbbell size={14} /> Active Workout Plans
                          </h3>

                          {workoutDays.length === 0 ? (
                            <p className="text-xs text-gray-500 italic text-center py-12">No active splits assigned.</p>
                          ) : (
                            <div className="space-y-4 mt-4">
                              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {workoutDays.map((day, idx) => (
                                  <button
                                    key={day.id}
                                    onClick={() => setActiveSplitDayIdx(idx)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                                      activeSplitDayIdx === idx
                                        ? 'bg-purple-600 border-purple-500 text-white'
                                        : 'bg-gray-900/60 border-gray-800 text-gray-400'
                                    }`}
                                  >
                                    {day.day_name.replace(' Day', '')}
                                  </button>
                                ))}
                              </div>

                              {workoutDays[activeSplitDayIdx] && (
                                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                                  {workoutDays[activeSplitDayIdx].exercises.map((ex: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-[#121624] border border-gray-850 p-2.5 rounded-xl text-[11px]">
                                      <div>
                                        <p className="font-extrabold text-white">{ex.name}</p>
                                        <p className="text-[9px] text-gray-500 uppercase mt-0.5 font-bold">{ex.muscle_group}</p>
                                      </div>
                                      <p className="text-purple-400 font-extrabold">{ex.sets} sets × {ex.reps_min}-{ex.reps_max} reps</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>

                    </div>

                    {/* Danger Zone / Admin Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-850 pt-6">
                      
                      {/* Admin parameters / passcode resets */}
                      <Card className="p-5 space-y-4 border-gray-850 bg-[#0d0f1a]/40">
                        <h3 className="text-xs font-black uppercase tracking-wider text-yellow-500 border-b border-gray-800 pb-2">
                          Administrative Parameters
                        </h3>

                        {/* Reset passcode */}
                        <form onSubmit={handleUpdatePassword} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Reset Access Passcode</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                placeholder="Enter at least 6 chars"
                                className="flex-1 bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                              />
                              <button
                                type="submit" disabled={updatingPassword}
                                className="bg-yellow-600 hover:bg-yellow-500 text-white font-extrabold px-3 py-2 rounded-xl text-xs uppercase transition-all cursor-pointer flex items-center justify-center"
                              >
                                {updatingPassword ? 'Resetting...' : <Key size={13} />}
                              </button>
                            </div>
                          </div>
                        </form>

                        {/* AI limit */}
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Daily AI Message Quota</label>
                            <div className="flex gap-2">
                              <input 
                                type="number" value={aiQuotaInput} onChange={e => setAiQuotaInput(parseInt(e.target.value) || 0)}
                                className="flex-1 bg-[#121624] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                              />
                              <button
                                onClick={handleSaveQuota} disabled={updatingQuota}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs uppercase transition-all cursor-pointer"
                              >
                                {updatingQuota ? 'Saving...' : 'Update'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Deactivation / Deletion */}
                      <Card className="p-5 space-y-4 border-red-950/20 bg-red-950/5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-red-400 border-b border-red-950 pb-2">
                          Danger Zone
                        </h3>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={handleToggleSuspension} disabled={updatingSuspension}
                            className={`flex-1 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all active:scale-[0.98] cursor-pointer ${
                              selectedClientProfile.user?.targets?.is_deactivated === true
                                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/20 text-white'
                                : 'bg-red-950/20 hover:bg-red-900 border-red-900/30 text-red-400'
                            }`}
                          >
                            {updatingSuspension ? 'Updating...' : (selectedClientProfile.user?.targets?.is_deactivated === true ? 'Reactivate Access' : 'Suspend Account')}
                          </button>

                          <button
                            onClick={handleDeleteClient}
                            className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                          >
                            <Trash2 size={13} /> Delete Athlete
                          </button>
                        </div>
                        <p className="text-[10px] text-red-400/60 leading-relaxed">
                          ⚠️ Suspending immediately restricts app logins. Wiping/deleting the athlete completely deletes their training logs, InBody history, and water database files permanently.
                        </p>
                      </Card>

                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEPLOY NEW ATHLETE */}
          {activeTab === 'deploy' && (
            <div className="max-w-3xl bg-[#0b0c16] border border-gray-800 rounded-3xl p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Deploy New Athlete</h2>
                <p className="text-xs text-gray-500 mt-1">Register a client account, initialize dynamic macro quotas, and deploy customized split libraries.</p>
              </div>

              {deploySuccessData && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle size={16} /> Athlete Deployed Successfully!
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">Provide these details to the athlete to access the dashboard:</p>
                  <div className="bg-gray-950/50 p-4 rounded-xl space-y-1.5 text-xs font-mono text-gray-300">
                    <p><span className="text-gray-500">Name:</span> {deploySuccessData.displayName}</p>
                    <p><span className="text-gray-500">Client Number:</span> #{deploySuccessData.clientCode}</p>
                    <p><span className="text-gray-500">Username:</span> {deploySuccessData.username}</p>
                    <p><span className="text-gray-500">Access Passcode:</span> {deploySuccessData.password}</p>
                  </div>
                  <button 
                    onClick={() => setDeploySuccessData(null)}
                    className="text-xs font-extrabold text-blue-400 hover:text-white underline cursor-pointer mt-2 block"
                  >
                    Deploy another client
                  </button>
                </div>
              )}

              {!deploySuccessData && (
                <form onSubmit={handleDeployAthlete} className="space-y-6">
                  
                  {/* Identity Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Full Name</label>
                      <input 
                        type="text" required value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="e.g. Captain Ahmed"
                        className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Username / Handle</label>
                      <input 
                        type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                        placeholder="e.g. ahmedfit"
                        className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Access Passcode (min 6 chars)</label>
                      <input 
                        type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Client Code (Auto or Custom)</label>
                      <input 
                        type="text" value={formData.clientCode} onChange={e => setFormData({ ...formData, clientCode: e.target.value })}
                        placeholder="Leave blank to auto-increment"
                        className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Phone Number</label>
                      <input 
                        type="text" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="e.g. +20 123 456789"
                        className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Biological Sex</label>
                      <div className="flex gap-2 mt-1">
                        <button
                          type="button" onClick={() => setDeployGender('male')}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            deployGender === 'male' 
                              ? 'bg-blue-600 border-blue-500 text-white' 
                              : 'bg-gray-900 border-gray-800 text-gray-400'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button" onClick={() => setDeployGender('female')}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            deployGender === 'female' 
                              ? 'bg-blue-600 border-blue-500 text-white' 
                              : 'bg-gray-900 border-gray-800 text-gray-400'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={deployLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer border border-white/5"
                  >
                    {deployLoading ? 'Deploying...' : 'Deploy Athlete Account'}
                  </button>

                </form>
              )}
            </div>
          )}

          {/* TAB 4: SYSTEM CONSOLE */}
          {activeTab === 'system' && (
            <div className="space-y-8 max-w-6xl">
              
              {/* Copy Portal Link Banner */}
              <div className="bg-[#0b0c16] border border-gray-805 rounded-3xl p-5 flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-blue-950/10 to-indigo-950/5">
                <div className="absolute top-[-30%] left-[-10%] w-36 h-36 bg-blue-500/5 rounded-full blur-2xl" />
                <div className="space-y-1 relative z-10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Desktop Coach Portal URL</h3>
                  <p className="text-xs text-gray-400">Provide this link to coaches to access the desktop hub directly:</p>
                  <p className="text-xs text-white font-mono select-all bg-gray-950/40 px-3 py-1.5 rounded-xl border border-gray-800 inline-block mt-2">
                    {window.location.origin}/coach-portal
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/coach-portal`);
                    toast.success('Desktop Coach Portal link copied!');
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-extrabold px-3 py-2.5 rounded-xl uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copy Link
                </button>
              </div>
              
              {/* Top Warning block (If not owner) */}
              {coachUserId && coachUserId !== OWNER_ID && (
                <div className="bg-red-950/20 border border-red-900/30 p-5 rounded-3xl flex items-start gap-4">
                  <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={24} />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Access Restricted</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      You are logged in as a standard coach account. Only the system owner has access to create/delete other coach accounts and toggle global feature options.
                    </p>
                  </div>
                </div>
              )}

              {/* Grid: Create Coach (Owner Only) vs User Directory */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                
                {/* Create Coach Account (Owner Only) */}
                <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 space-y-5">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">👑 Register Coach Profile</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">Register administrative access accounts (Owner credentials required).</p>
                  </div>

                  <form onSubmit={handleCreateCoach} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Coach Display Name</label>
                      <input 
                        type="text" required value={coachName} onChange={e => setCoachName(e.target.value)}
                        placeholder="e.g. Coach Captain"
                        disabled={coachUserId !== OWNER_ID}
                        className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Email / Account Username</label>
                      <input 
                        type="email" required value={coachEmail} onChange={e => setCoachEmail(e.target.value)}
                        placeholder="e.g. coach@stride.fit"
                        disabled={coachUserId !== OWNER_ID}
                        className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Default Password</label>
                      <input 
                        type="password" required value={coachPassword} onChange={e => setCoachPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={coachUserId !== OWNER_ID}
                        className="w-full bg-[#121624] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingCoach || coachUserId !== OWNER_ID}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-800 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-blue-500/10"
                    >
                      {isCreatingCoach ? 'Creating Coach...' : 'Register Coach Account'}
                    </button>
                  </form>

                  {createdCoachCredentials && (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl space-y-2 mt-4">
                      <h4 className="text-xs font-bold text-emerald-400">Account Deployed successfully!</h4>
                      <div className="bg-gray-950/60 p-3 rounded-xl font-mono text-[10px] space-y-1 text-gray-300">
                        <p><span className="text-gray-500">Name:</span> {createdCoachCredentials.name}</p>
                        <p><span className="text-gray-500">Email:</span> {createdCoachCredentials.email}</p>
                        <p><span className="text-gray-500">Password:</span> {createdCoachCredentials.password}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Directory List & Detail Controls */}
                <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 flex flex-col justify-between gap-5">
                  <div className="space-y-4 flex-1 flex flex-col justify-start">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">👥 User Directory &amp; Toggles</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">Toggle active statuses, change passwords, and promote roles.</p>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                      <input 
                        type="text"
                        value={systemSearchQuery}
                        onChange={e => setSystemSearchQuery(e.target.value)}
                        placeholder="Search profiles..."
                        className="w-full bg-[#121624] border border-gray-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar flex-1">
                      {filteredSystemUsers.map(u => {
                        const isSuspended = u.targets?.is_deactivated === true;
                        return (
                          <div 
                            key={u.id}
                            onClick={() => setSystemSelectedUser(systemSelectedUser?.id === u.id ? null : u)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              systemSelectedUser?.id === u.id 
                                ? 'bg-blue-600/10 border-blue-500/50' 
                                : 'bg-[#121624]/40 border-gray-850/80 hover:border-gray-800'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-extrabold text-white flex items-center gap-2">
                                {u.display_name}
                                {u.role === 'coach' && (
                                  <span className="text-[8px] bg-blue-950 text-blue-400 font-extrabold px-1.5 py-0.5 rounded border border-blue-900/50 uppercase">
                                    Coach
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{u.email}</p>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isSuspended ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detail Panel overlay */}
                  {systemSelectedUser && (
                    <div className="bg-[#121624] border border-gray-800 rounded-2xl p-4 space-y-4">
                      <div className="flex justify-between items-start border-b border-gray-800 pb-2">
                        <div>
                          <h4 className="text-xs font-black text-white uppercase">{systemSelectedUser.display_name}</h4>
                          <p className="text-[10px] text-gray-500">{systemSelectedUser.email}</p>
                        </div>
                        <button onClick={() => setSystemSelectedUser(null)} className="text-gray-500 hover:text-white text-xs font-bold">
                          Close
                        </button>
                      </div>

                      {/* Deactivation / Deletion actions */}
                      <div className="grid grid-cols-2 gap-2.5">
                        
                        {/* Suspend Toggle */}
                        {systemSelectedUser.targets?.is_deactivated === true ? (
                          <button
                            onClick={() => handleUpdateSystemUserStatus(systemSelectedUser.id, { is_deactivated: false })}
                            className="flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold py-2.5 rounded-xl text-[10px] uppercase transition-all cursor-pointer"
                          >
                            <UserCheck size={11} /> Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateSystemUserStatus(systemSelectedUser.id, { is_deactivated: true })}
                            className="flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-2.5 rounded-xl text-[10px] uppercase transition-all cursor-pointer"
                          >
                            <UserX size={11} /> Suspend
                          </button>
                        )}

                        {/* Delete Account Completely */}
                        <button
                          onClick={() => handleDeleteSystemUser(systemSelectedUser.id)}
                          disabled={systemDeletingUser}
                          className="flex items-center justify-center gap-1.5 bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-650 hover:text-white font-bold py-2.5 rounded-xl text-[10px] uppercase transition-all cursor-pointer"
                        >
                          <Trash2 size={11} /> Delete User
                        </button>
                      </div>

                      {/* Change Password */}
                      <form onSubmit={handleChangeSystemUserPassword} className="flex gap-2">
                        <input 
                          type="password" required value={systemSelectedUserPassword} onChange={e => setSystemSelectedUserPassword(e.target.value)}
                          placeholder="New password"
                          className="flex-1 bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                        />
                        <button
                          type="submit" disabled={systemUpdatingPassword}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 rounded-xl font-bold text-xs"
                        >
                          Reset
                        </button>
                      </form>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
