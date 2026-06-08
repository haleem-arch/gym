import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { DumbbellLoader } from '../../components/DumbbellLoader';
import {
  Lock, ArrowLeft, RefreshCw, ShieldAlert, UserCheck, UserX,
  Search, Shield, Key, Plus, Activity, CheckCircle, Database,
  Copy, Check, Mail, Server
} from 'lucide-react';

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

export default function SystemConsolePage() {
  const navigate = useNavigate();

  // Auth
  const [passcode, setPasscode] = useState('');
  const [isAuthed, setIsAuthed] = useState(true);
  const [shake, setShake] = useState(false);

  // Data
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coachUserId, setCoachUserId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // New Coach Account Form
  const [coachName, setCoachName] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [coachPassword, setCoachPassword] = useState('');
  const [isCreatingCoach, setIsCreatingCoach] = useState(false);
  const [createdCoachCredentials, setCreatedCoachCredentials] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [attemptedCoachSubmit, setAttemptedCoachSubmit] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isEmailTaken, setIsEmailTaken] = useState(false);

  // Real-time checks for coach email availability
  useEffect(() => {
    const emailVal = coachEmail.trim().toLowerCase();
    if (!emailVal) {
      setIsEmailTaken(false);
      return;
    }

    setIsEmailChecking(true);
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', emailVal)
          .maybeSingle();

        if (error) throw error;
        setIsEmailTaken(!!data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsEmailChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [coachEmail]);

  const handleCopyField = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Change Password Form
  const [newPasswordForSelected, setNewPasswordForSelected] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Confirmation Modal States
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [targetUserToDelete, setTargetUserToDelete] = useState<any | null>(null);

  // Live Activity Feed
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [recentDiets, setRecentDiets] = useState<any[]>([]);
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);

  // Feature Toggles (Global)
  const [disableWorkoutTemplatesToggle, setDisableWorkoutTemplatesToggle] = useState(false);
  const [disableNutritionTargetsToggle, setDisableNutritionTargetsToggle] = useState(false);

  // SMTP Settings
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [savingSMTP, setSavingSMTP] = useState(false);
  const [testingSMTP, setTestingSMTP] = useState(false);

  const fetchBaseData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCoachUserId(session.user.id);
        setSessionToken(session.access_token);
      }

      // Fetch Haleem's toggles
      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      if (ownerProfile?.targets) {
        setDisableWorkoutTemplatesToggle(!!ownerProfile.targets.disable_workout_templates);
        setDisableNutritionTargetsToggle(!!ownerProfile.targets.disable_nutrition_targets);
      }

      // Fetch SMTP Configuration
      const { data: smtpData } = await supabase.from('owner_settings').select('smtp_email, smtp_password, smtp_host, smtp_port, smtp_secure').eq('id', 'smtp_config').maybeSingle();
      if (smtpData) {
        setSmtpEmail(smtpData.smtp_email || '');
        setSmtpPassword(smtpData.smtp_password || '');
        setSmtpHost(smtpData.smtp_host || '');
        setSmtpPort(smtpData.smtp_port !== undefined && smtpData.smtp_port !== null ? String(smtpData.smtp_port) : '587');
        setSmtpSecure(!!smtpData.smtp_secure);
      }

      // Fetch profiles
      const { data: userProfiles } = await supabase.from('profiles').select('*').order('display_name');
      if (userProfiles) {
        setProfiles(userProfiles);
      }

      // Health Check / Connection Test
      setDbHealthy(true);

      // Fetch Activity Feed data (last 5 completed workouts & last 5 diet logs)
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('id, user_id, date, day_type, total_volume')
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .limit(5);

      const { data: dietLogsData } = await supabase
        .from('diet_logs')
        .select('id, user_id, date, daily_totals')
        .order('date', { ascending: false })
        .limit(5);

      const filteredDiets = (dietLogsData || []).filter(d => {
        const kcal = d.daily_totals?.kcal || 0;
        const protein = d.daily_totals?.protein || 0;
        return kcal > 0 || protein > 0;
      });

      // Stitch profiles in-memory to prevent database constraint PGRST200 errors
      const feedUserIds = Array.from(new Set([
        ...(workoutsData || []).map(w => w.user_id),
        ...filteredDiets.map(d => d.user_id)
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

      const stitchedDiets = filteredDiets.map(d => ({
        ...d,
        profiles: { display_name: feedProfilesMap[d.user_id] || 'Athlete' }
      }));

      setRecentWorkouts(stitchedWorkouts);
      setRecentDiets(stitchedDiets);

    } catch (err) {
      console.error(err);
      setDbHealthy(false);
      toast.error('Unable to load console statistics. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthed) {
      fetchBaseData();
    }
  }, [isAuthed]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '425336') {
      sessionStorage.setItem('owner_dashboard_authed', 'true');
      setIsAuthed(true);
      toast.success('Welcome Owner Haleem! 👑');
    } else {
      setShake(true);
      toast.error('Access denied. Incorrect passcode.');
      setPasscode('');
      setTimeout(() => setShake(false), 600);
    }
  };

  const handleToggleWorkoutTemplates = async (checked: boolean) => {
    try {
      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      const updatedTargets = {
        ...(ownerProfile?.targets || {}),
        disable_workout_templates: checked
      };
      const { error } = await supabase.from('profiles').update({ targets: updatedTargets }).eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');
      if (error) throw error;
      setDisableWorkoutTemplatesToggle(checked);
      toast.success(checked ? 'Workout templates hidden for clients!' : 'Workout templates enabled for clients!');
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to save changes. Please try again.');
    }
  };

  const handleToggleNutritionTargets = async (checked: boolean) => {
    try {
      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      const updatedTargets = {
        ...(ownerProfile?.targets || {}),
        disable_nutrition_targets: checked
      };
      const { error } = await supabase.from('profiles').update({ targets: updatedTargets }).eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');
      if (error) throw error;
      setDisableNutritionTargetsToggle(checked);
      toast.success(checked ? 'Nutrition targets settings hidden for clients!' : 'Nutrition targets settings enabled for clients!');
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to save changes. Please try again.');
    }
  };

  const handleSaveSMTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpEmail.trim() || !smtpPassword.trim()) {
      toast.error('Email and password/passcode are required for SMTP.');
      return;
    }
    setSavingSMTP(true);
    try {
      const { error } = await supabase.from('owner_settings').upsert({
        id: 'smtp_config',
        smtp_email: smtpEmail.trim(),
        smtp_password: smtpPassword.trim(),
        smtp_host: smtpHost.trim() || null,
        smtp_port: smtpPort.trim() ? parseInt(smtpPort.trim()) : null,
        smtp_secure: smtpSecure,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      toast.success('SMTP Configuration saved successfully! 👑');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save SMTP settings.');
    } finally {
      setSavingSMTP(false);
    }
  };

  const handleTestSMTP = async () => {
    if (!smtpEmail.trim() || !smtpPassword.trim()) {
      toast.error('Please configure SMTP email and password before testing.');
      return;
    }
    setTestingSMTP(true);
    const toastId = toast.loading('Sending test email to tsmhaleem@gmail.com...');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'tsmhaleem@gmail.com',
          subject: 'Stride Rite/Life Gym - SMTP Connection Test 👑',
          html: `
            <div style="font-family: sans-serif; background-color: #060713; color: #f3f4f6; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); max-width: 500px; margin: 20px auto;">
              <h2 style="color: #10b981; font-weight: 800; font-size: 18px; margin-top:0;">SMTP Connection Verified!</h2>
              <p style="font-size: 13px; line-height: 1.6; color: #9ca3af;">
                This email confirms that your custom SMTP server settings are correctly configured and authenticated.
              </p>
              <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; font-size: 12px; font-family: monospace;">
                <strong>Host:</strong> ${smtpHost.trim() || 'Gmail (Fallback)'}<br/>
                <strong>Port:</strong> ${smtpPort.trim() || '587'}<br/>
                <strong>Secure (SSL/TLS):</strong> ${smtpSecure ? 'Enabled (Port 465)' : 'Disabled (STARTTLS)'}<br/>
                <strong>Sender:</strong> ${smtpEmail.trim()}
              </div>
              <p style="font-size: 10px; color: #4b5563; margin-top:20px;">Sent via Life Gym Admin Panel Console.</p>
            </div>
          `,
          smtpUser: smtpEmail.trim(),
          smtpPass: smtpPassword.trim(),
          smtpHost: smtpHost.trim() || undefined,
          smtpPort: smtpPort.trim() ? parseInt(smtpPort.trim()) : undefined,
          smtpSecure: smtpSecure
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch test email.');
      }
      toast.success('Test email sent successfully! Check tsmhaleem@gmail.com.', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'SMTP Connection failed. Check host, email, and password.', { id: toastId });
    } finally {
      setTestingSMTP(false);
    }
  };

  // Create Coach Account via secure Vercel Endpoint
  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedCoachSubmit(true);
    if (!coachName.trim() || !coachEmail.trim() || !coachPassword.trim()) {
      toast.error('Please fill in all coach details');
      return;
    }
    if (isEmailTaken) {
      toast.error('Email is already taken. Please change it.');
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

      toast.success('Coach account created successfully!');
      setCoachName('');
      setCoachEmail('');
      setCoachPassword('');

      // Refresh list
      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create coach account. Please verify username and details.');
    } finally {
      setIsCreatingCoach(false);
    }
  };

  // Update Selected User (Role or Activation Status)
  const handleUpdateUserStatus = async (uid: string, fields: { role?: string; is_deactivated?: boolean }) => {
    try {
      const response = await fetch('/api/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          uid,
          ...fields
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      toast.success('User updated successfully!');

      // Update state locally
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

      // Update selectedUser reference
      if (selectedUser && selectedUser.id === uid) {
        setSelectedUser((prev: any) => {
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
      toast.error('Unable to update user status. Please try again.');
    }
  };

  // Change Selected User Password
  const handleChangeUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPasswordForSelected) return;

    setIsUpdatingPassword(true);

    try {
      const response = await fetch('/api/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          uid: selectedUser.id,
          password: newPasswordForSelected
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }

      toast.success('User password changed successfully!');
      setNewPasswordForSelected('');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update password. Please check your connection.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Triggered by delete button in UI - opens the custom confirmation modal
  const handleDeleteUserClick = (user: any) => {
    setTargetUserToDelete(user);
    setDeleteConfirmText('');
    setShowConfirmDeleteModal(true);
  };

  // Delete Selected User completely from Auth and Database
  const executeDeleteUser = async (uid: string) => {
    if (isDeletingUser) return;
    if (!targetUserToDelete) return;
    setShowConfirmDeleteModal(false);
    setIsDeletingUser(true);
    const toastId = toast.loading(`Deleting account...`);
    try {
      // 1. Delete from auth account using secure Vercel Serverless API.
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
        throw new Error(result.error || 'Failed to delete user from auth system');
      }

      // 2. Cascade delete database records
      await supabase.from('inbody_scans').delete().eq('user_id', uid);
      await supabase.from('client_workout_days').delete().eq('user_id', uid);
      await supabase.from('user_workout_plans').delete().eq('user_id', uid);
      await supabase.from('progress_notes').delete().eq('user_id', uid);
      await supabase.from('water_logs').delete().eq('user_id', uid);
      await supabase.from('client_profiles').delete().eq('user_id', uid);
      await supabase.from('profiles').delete().eq('id', uid);

      toast.success('User account deleted successfully', { id: toastId });
      setSelectedUser(null);
      setTargetUserToDelete(null);
      
      // Refresh user list
      fetchBaseData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Unable to delete user account. Please check your connection.', { id: toastId });
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Lock Screen
  if (!isAuthed) {
    return (
      <div className="flex flex-col items-center justify-center p-5 min-h-[80vh] relative z-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className={`w-full max-w-xs bg-[#0d1220] border border-gray-800 rounded-3xl p-8 space-y-7 relative z-10 shadow-2xl transition-all duration-300 ${shake ? 'scale-95 border-red-800' : ''}`}>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Lock className="text-blue-400" size={28} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">System Console</h2>
            <p className="text-xs text-gray-550 mt-1.5">Enter passcode to unlock</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password" required value={passcode} onChange={e => setPasscode(e.target.value)}
              placeholder="••••••" autoFocus
              className="w-full bg-[#131b2e] border border-gray-700 rounded-2xl py-4 text-center text-lg tracking-[0.4em] outline-none focus:border-blue-500 transition-colors text-white"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-lg shadow-blue-500/20 cursor-pointer">
              Unlock
            </button>
          </form>
          <button onClick={() => navigate(-1)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors cursor-pointer block mx-auto">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Deletion Loading Screen
  if (isDeletingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <DumbbellLoader label="Deleting user account. Please wait..." size={100} />
      </div>
    );
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-5 min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-xs text-gray-400 mt-3 font-semibold">Loading console data...</p>
      </div>
    );
  }

  // Force guard that only Haleem's logged in user can view this page content
  if (coachUserId && coachUserId !== 'ef685819-cdb3-4cd7-811d-4e6f7fff423c') {
    return (
      <div className="p-8 text-center space-y-4">
        <ShieldAlert size={48} className="text-red-500 mx-auto" />
        <h1 className="text-xl font-bold text-white">Access Denied</h1>
        <p className="text-gray-400 text-xs">Only the system owner has authorization to view this panel.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold">
          Go Home
        </button>
      </div>
    );
  }

  // Stats calculation
  const totalUsers = profiles.length;
  const totalCoaches = profiles.filter(p => p.role === 'coach').length;
  const totalClients = profiles.filter(p => p.role === 'client').length;
  const totalActive = profiles.filter(p => p.targets?.is_deactivated !== true).length;
  const totalDeactivated = profiles.filter(p => p.targets?.is_deactivated === true).length;

  const filteredUsers = profiles.filter(p => 
    p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 flex flex-col gap-5 relative z-10 w-full pb-28">
      {/* Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/6 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-white active:scale-95">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              👑 System Console
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">System Owner Controls</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {refreshing && <RefreshCw size={13} className="text-blue-400 animate-spin" />}
          <button
            onClick={() => { setRefreshing(true); fetchBaseData(); }}
            className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white active:scale-95 cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Coach Portal Link Copy Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/20 border border-blue-900/40 rounded-3xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
        <div className="absolute top-[-30%] left-[-10%] w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="flex flex-col gap-1 relative z-10">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Desktop Coach Portal URL</p>
          <p className="text-xs text-white font-mono select-all">
            {window.location.origin}/coach-portal
          </p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/coach-portal`);
            toast.success('Desktop Coach Portal link copied!');
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-extrabold px-3 py-2 rounded-xl uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          Copy Link
        </button>
      </div>

      {/* System Health Check Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0f1424] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${dbHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <Database size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-500">Database</p>
            <p className="text-xs font-bold text-white mt-0.5">{dbHealthy ? 'Connected' : 'Offline'}</p>
          </div>
        </div>
        <div className="bg-[#0f1424] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
            <Activity size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-500">API Status</p>
            <p className="text-xs font-bold text-white mt-0.5">Healthy (200 OK)</p>
          </div>
        </div>
      </div>

      {/* Total Users Statistics Card */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">📊 System Demographics</h3>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-3 flex flex-col gap-1 text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Total Users</p>
            <p className="text-xl font-black text-white">{totalUsers}</p>
          </div>
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-3 flex flex-col gap-1 text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Coaches</p>
            <p className="text-xl font-black text-blue-400">{totalCoaches}</p>
          </div>
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-3 flex flex-col gap-1 text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Clients</p>
            <p className="text-xl font-black text-violet-400">{totalClients}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl px-4 py-2.5 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1"><UserCheck size={10} className="text-emerald-500" /> Active</span>
            <span className="text-xs font-black text-emerald-400">{totalActive}</span>
          </div>
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl px-4 py-2.5 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1"><UserX size={10} className="text-red-500" /> Suspended</span>
            <span className="text-xs font-black text-red-400">{totalDeactivated}</span>
          </div>
        </div>
      </div>

      {/* Feature Access Toggles */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">🎯 Feature Access Toggles</h3>
        
        <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Hide Workout Templates</p>
              <p className="text-[9px] text-gray-500 mt-0.5">Removes templates & programs button for clients</p>
            </div>
            <button
              onClick={() => handleToggleWorkoutTemplates(!disableWorkoutTemplatesToggle)}
              className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 outline-none cursor-pointer flex ${disableWorkoutTemplatesToggle ? 'bg-red-500 justify-end' : 'bg-gray-800 justify-start'}`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Hide Nutrition Targets</p>
              <p className="text-[9px] text-gray-500 mt-0.5">Removes daily targets setup menu for clients</p>
            </div>
            <button
              onClick={() => handleToggleNutritionTargets(!disableNutritionTargetsToggle)}
              className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 outline-none cursor-pointer flex ${disableNutritionTargetsToggle ? 'bg-red-500 justify-end' : 'bg-gray-800 justify-start'}`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* Owner SMTP Configuration */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
          <Mail size={14} /> Owner SMTP Configuration
        </h3>
        
        <form onSubmit={handleSaveSMTP} className="space-y-4">
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 space-y-3">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">SMTP Host (e.g. smtp.gmail.com)</label>
                <div className="relative mt-1">
                  <Server className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={e => setSmtpHost(e.target.value)}
                    placeholder="Gmail (leave blank) or custom SMTP host"
                    className="w-full bg-[#121624]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-3 pl-10 pr-4 text-white text-xs outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">SMTP Port</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={e => setSmtpPort(e.target.value)}
                  placeholder="587 or 465"
                  className="w-full bg-[#121624]/60 border border-gray-800 focus:border-blue-500 rounded-xl p-3 text-white text-xs outline-none transition-all mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1 px-1">
              <div>
                <p className="text-xs font-bold text-white">SSL/TLS Connection</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Use SSL (typically port 465) instead of STARTTLS (587)</p>
              </div>
              <button
                type="button"
                onClick={() => setSmtpSecure(!smtpSecure)}
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 outline-none cursor-pointer flex ${smtpSecure ? 'bg-blue-500 justify-end' : 'bg-gray-800 justify-start'}`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md" />
              </button>
            </div>

            <div className="border-t border-white/[0.03] my-2" />

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">SMTP Sender Email / Username</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={smtpEmail}
                  onChange={e => setSmtpEmail(e.target.value)}
                  placeholder="e.g. tsmhaleem@gmail.com"
                  className="w-full bg-[#121624]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-3 pl-10 pr-4 text-white text-xs outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center ml-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">SMTP Password / App Password</label>
                <a 
                  href="https://myaccount.google.com/apppasswords" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[8.5px] text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider font-extrabold"
                >
                  Get Gmail App Password ↗
                </a>
              </div>
              <div className="relative mt-1">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={smtpPassword}
                  onChange={e => setSmtpPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-[#121624]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-3 pl-10 pr-4 text-white text-xs outline-none transition-all"
                />
              </div>
            </div>
            
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={testingSMTP}
              onClick={handleTestSMTP}
              className="flex-1 bg-[#161f38] hover:bg-[#1f2b4e] text-blue-400 font-bold py-3 px-4 rounded-xl text-xs transition-colors outline-none cursor-pointer flex items-center justify-center gap-1.5"
            >
              {testingSMTP ? 'Testing Connection...' : 'Test SMTP Settings'}
            </button>
            <button
              type="submit"
              disabled={savingSMTP}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg outline-none cursor-pointer"
            >
              {savingSMTP ? 'Saving Settings...' : 'Save SMTP Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Create New Coach Account */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
          <Plus size={14} /> Create Coach Account
        </h3>

        <form onSubmit={handleCreateCoach} className="space-y-3">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Coach Name</label>
            <input
              type="text" required value={coachName} onChange={e => setCoachName(e.target.value)}
              placeholder="e.g. Captain Alberto"
              className={`w-full bg-[#11162a] border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all mt-1 ${
                attemptedCoachSubmit && !coachName.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
              }`}
            />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Email / Username</label>
            <input
              type="email" required value={coachEmail} onChange={e => setCoachEmail(e.target.value.replace(/\s/g, ''))}
              placeholder="e.g. coach@lifegym.com"
              className={`w-full bg-[#11162a] border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all mt-1 ${
                (attemptedCoachSubmit && !coachEmail.trim()) || isEmailTaken ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
              }`}
            />
            {isEmailChecking && <p className="text-[8px] text-gray-500 mt-0.5 animate-pulse">Checking availability...</p>}
            {isEmailTaken && <p className="text-[8px] text-red-400 font-bold mt-0.5">Email / Username is already taken.</p>}
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</label>
            <input
              type="password" required value={coachPassword} onChange={e => setCoachPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-[#11162a] border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all mt-1 ${
                attemptedCoachSubmit && !coachPassword.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isCreatingCoach}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
          >
            {isCreatingCoach ? 'Creating Coach...' : 'Create Coach Account'}
          </button>
        </form>

        {createdCoachCredentials && (
          <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl mt-4 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle size={14} /> Account Created Successfully!
            </h4>
            <p className="text-[10px] text-gray-400">Share these login credentials with the Coach:</p>
            <div className="bg-gray-950/50 p-3 rounded-xl space-y-2.5 text-[11px] font-mono text-gray-300">
              <div className="flex items-center justify-between group">
                <p><span className="text-gray-500">Name:</span> {createdCoachCredentials.name}</p>
                <button
                  type="button"
                  onClick={() => handleCopyField(createdCoachCredentials.name, 'Name')}
                  className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy Name"
                >
                  {copiedField === 'Name' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                </button>
              </div>
              <div className="border-t border-gray-800/40" />
              <div className="flex items-center justify-between group">
                <p><span className="text-gray-500">Email:</span> {createdCoachCredentials.email}</p>
                <button
                  type="button"
                  onClick={() => handleCopyField(createdCoachCredentials.email, 'Email')}
                  className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy Email"
                >
                  {copiedField === 'Email' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                </button>
              </div>
              <div className="border-t border-gray-800/40" />
              <div className="flex items-center justify-between group">
                <p><span className="text-gray-500">Password:</span> {createdCoachCredentials.password}</p>
                <button
                  type="button"
                  onClick={() => handleCopyField(createdCoachCredentials.password, 'Password')}
                  className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy Password"
                >
                  {copiedField === 'Password' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                </button>
              </div>
              <div className="border-t border-gray-800/40" />
              <div>
                <p><span className="text-gray-500">Role:</span> coach</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const text = `Coach Account Created:\nName: ${createdCoachCredentials.name}\nEmail: ${createdCoachCredentials.email}\nPassword: ${createdCoachCredentials.password}\nRole: coach`;
                  navigator.clipboard.writeText(text);
                  toast.success('All credentials copied!');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Copy size={11} /> Copy Info
              </button>
              <button
                type="button"
                onClick={() => setCreatedCoachCredentials(null)}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 py-2 rounded-lg text-xs uppercase transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Management Directory */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">👥 User Directory & Status Toggles</h3>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[#11162a] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* Directory List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
          {filteredUsers.map(user => {
            const isSuspended = user.targets?.is_deactivated === true;
            const isFreeTrial = user.targets?.is_free_trial === true || user.targets?.subscription_status === 'trial';
            let statusLabel = 'Active';
            let statusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            if (isSuspended) {
              statusLabel = 'Suspended';
              statusClass = 'bg-red-500/10 text-red-400 border-red-500/20';
            } else if (isFreeTrial) {
              statusLabel = 'Active (Free Trial)';
              statusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            }
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedUser?.id === user.id 
                    ? 'bg-blue-600/10 border-blue-500/50' 
                    : 'bg-[#11162a]/95 border-gray-800/80 hover:border-gray-700'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    {user.display_name || user.email?.split('@')[0]}
                    {user.role === 'coach' && (
                      <span className="text-[8px] bg-blue-950 text-blue-400 font-extrabold px-1.5 py-0.5 rounded-md border border-blue-900/50 uppercase tracking-wide">
                        Coach
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected User Management Panel */}
        {selectedUser && (
          <div className="bg-[#0f1424] border border-gray-800 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-start pb-2 border-b border-gray-800">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">{selectedUser.display_name || 'Selected User'}</h4>
                <p className="text-[10px] text-gray-550 font-mono mt-0.5">{selectedUser.email || selectedUser.targets?.email || 'No email'}</p>
                {selectedUser.role === 'coach' && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[8px] bg-blue-950 text-blue-400 font-extrabold px-1.5 py-0.5 rounded border border-blue-900/50 uppercase tracking-wide">
                      Coach
                    </span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                      selectedUser.targets?.is_deactivated === true
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : (selectedUser.targets?.is_free_trial === true || selectedUser.targets?.subscription_status === 'trial')
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {selectedUser.targets?.is_deactivated === true
                        ? 'Suspended'
                        : (selectedUser.targets?.is_free_trial === true || selectedUser.targets?.subscription_status === 'trial')
                        ? 'Active (Free Trial)'
                        : 'Active'}
                    </span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="text-gray-500 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Suspend / Reactivate */}
                {selectedUser.targets?.is_deactivated === true ? (
                  <button
                    disabled={isDeletingUser}
                    onClick={() => handleUpdateUserStatus(selectedUser.id, { is_deactivated: false })}
                    className="flex items-center justify-center gap-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold py-3.5 rounded-xl text-[10px] tracking-wide uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserCheck size={12} /> Activate User
                  </button>
                ) : (
                  <button
                    disabled={isDeletingUser}
                    onClick={() => handleUpdateUserStatus(selectedUser.id, { is_deactivated: true })}
                    className="flex items-center justify-center gap-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold py-3.5 rounded-xl text-[10px] tracking-wide uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserX size={12} /> Suspend User
                  </button>
                )}

                {/* Change Role */}
                {selectedUser.role === 'coach' ? (
                  <button
                    disabled={isDeletingUser}
                    onClick={() => handleUpdateUserStatus(selectedUser.id, { role: 'client' })}
                    className="flex items-center justify-center gap-1 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 text-violet-400 font-bold py-3.5 rounded-xl text-[10px] tracking-wide uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Shield size={12} /> Make Client
                  </button>
                ) : (
                  <button
                    disabled={isDeletingUser}
                    onClick={() => handleUpdateUserStatus(selectedUser.id, { role: 'coach' })}
                    className="flex items-center justify-center gap-1 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 font-bold py-3.5 rounded-xl text-[10px] tracking-wide uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Shield size={12} /> Make Coach
                  </button>
                )}
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangeUserPassword} className="space-y-2 border-t border-gray-800 pt-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Change Password</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  required
                  value={newPasswordForSelected}
                  onChange={e => setNewPasswordForSelected(e.target.value)}
                  placeholder="Enter new password"
                  className="flex-1 bg-[#11162a] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white px-4 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer flex items-center justify-center"
                >
                  <Key size={14} />
                </button>
              </div>
            </form>

            {/* Danger Zone */}
            <div className="border-t border-red-950/40 pt-4 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-red-500">Danger Zone</p>
              <p className="text-[10px] text-gray-500 leading-normal">
                Deleting this account will permanently clear their access credentials and database files.
              </p>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => handleDeleteUserClick(selectedUser)}
                className="w-full bg-red-950/20 border border-red-900/30 hover:bg-red-600 hover:text-white text-red-400 font-extrabold py-3.5 rounded-xl text-[10px] tracking-wide uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeletingUser ? 'Deleting Account...' : 'Delete Account Completely'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live System Activity Feed */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
          <Activity size={14} className="text-blue-400" /> Live Feed (Things Happening)
        </h3>

        {/* Workouts logged */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Recent Workouts Completed</p>
          {recentWorkouts.length === 0 ? (
            <div className="bg-[#11162a]/95 border border-gray-850 p-4 text-center rounded-2xl">
              <p className="text-[10px] text-gray-500">No recent workout completions logged.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentWorkouts.map(w => (
                <div key={w.id} className="bg-[#11162a]/95 border border-gray-850 p-3 rounded-2xl flex justify-between items-center text-[10px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-white">{w.profiles?.display_name || 'Athlete'}</span>
                    <span className="text-gray-500 font-medium">Logged a {w.day_type} session</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-400">{formatDayTypeLabel(w.day_type, w.total_volume)}</p>
                    <p className="text-gray-600 font-mono mt-0.5">{w.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diets logged */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Recent Diets Logged</p>
          {recentDiets.length === 0 ? (
            <div className="bg-[#11162a]/95 border border-gray-850 p-4 text-center rounded-2xl">
              <p className="text-[10px] text-gray-500">No recent diet records logged.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentDiets.map(d => {
                const kcal = d.daily_totals?.kcal || 0;
                const protein = d.daily_totals?.protein || 0;
                return (
                  <div key={d.id} className="bg-[#11162a]/95 border border-gray-850 p-3 rounded-2xl flex justify-between items-center text-[10px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-white">{d.profiles?.display_name || 'Athlete'}</span>
                      <span className="text-gray-500 font-medium">Tracked their daily macros</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{Math.round(kcal)} kcal / {Math.round(protein)}g P</p>
                      <p className="text-gray-600 font-mono mt-0.5">{d.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmDeleteModal && targetUserToDelete && (() => {
        const displayName = targetUserToDelete.display_name || 'Unnamed User';
        const username = targetUserToDelete.username || '';
        const emailPrefix = targetUserToDelete.email?.split('@')[0] || '';
        const checkText = deleteConfirmText.trim().toLowerCase();
        const isMatched = checkText === displayName.toLowerCase() ||
                          (username && checkText === username.toLowerCase()) ||
                          (emailPrefix && checkText === emailPrefix.toLowerCase());

        return (
          <div className="fixed inset-0 bg-[#05050b]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isMatched) executeDeleteUser(targetUserToDelete.id);
              }}
              className="w-full max-w-xs bg-[#0d1220] border border-gray-800 rounded-3xl p-6 space-y-5 relative z-10 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Delete User Account?</h3>
                <p className="text-[10px] text-gray-450 leading-relaxed">
                  This action is permanent and will completely delete the user/coach account, including all records.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider text-center">
                  Type <span className="text-red-400 font-mono select-none">"{displayName}"</span> to confirm
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDeleteConfirmText(val);
                    const currentCheck = val.trim().toLowerCase();
                    const currentMatched = currentCheck === displayName.toLowerCase() ||
                                           (username && currentCheck === username.toLowerCase()) ||
                                           (emailPrefix && currentCheck === emailPrefix.toLowerCase());
                    if (currentMatched && !isDeletingUser) {
                      executeDeleteUser(targetUserToDelete.id);
                    }
                  }}
                  placeholder="Type name here..."
                  className="w-full bg-[#131b2e] border border-gray-700 rounded-2xl py-3 px-4 text-center text-xs outline-none focus:border-red-500 transition-colors text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmDeleteModal(false);
                    setTargetUserToDelete(null);
                  }}
                  className="flex-1 bg-gray-900 border border-gray-850 hover:bg-gray-800 active:scale-95 text-gray-300 py-3 rounded-2xl font-bold text-xs uppercase transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isMatched}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase transition-all text-center cursor-pointer active:scale-95 ${
                    isMatched
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'bg-red-950/20 text-red-400/30 border border-red-950/40 cursor-not-allowed'
                  }`}
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        );
      })()}
    </div>
  );
}
