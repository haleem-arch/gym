// Rollback v0.0.9 - standard gym version
import { useEffect, useState, useRef, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { Toaster, toast } from 'react-hot-toast';
import BottomNav from './components/BottomNav';
import { OpeningAnimation } from './components/OpeningAnimation';
import { DumbbellLoader } from './components/DumbbellLoader';
import { SplashOverlay } from './components/SplashOverlay';
import { GymSplashOverlay } from './components/GymSplashOverlay';
import OnboardingFlow from './components/OnboardingFlow';
import CookieConsent from './components/CookieConsent';
import LaunchLockScreen from './pages/LaunchLockScreen';

const HRDashboard = lazy(() => import('./pages/HRDashboard'));
const TodayView = lazy(() => import('./pages/TodayView'));
const WorkoutHome = lazy(() => import('./pages/WorkoutHome'));
const WorkoutBuilder = lazy(() => import('./pages/WorkoutBuilder'));
const WorkoutTracker = lazy(() => import('./pages/WorkoutTracker'));
const WorkoutDetail = lazy(() => import('./pages/WorkoutDetail'));

const DietHome = lazy(() => import('./pages/DietHome'));
const DietMealBuilder = lazy(() => import('./pages/DietMealBuilder'));
const DietSearch = lazy(() => import('./pages/DietSearch'));
const FoodCreator = lazy(() => import('./pages/FoodCreator'));
const FoodInventory = lazy(() => import('./pages/FoodInventory'));

const InBodyView = lazy(() => import('./pages/InBodyView'));
const ProfileView = lazy(() => import('./pages/ProfileView'));

// Coach Pages
const DashboardPage = lazy(() => import('./pages/coach/DashboardPage'));
const ClientsListPage = lazy(() => import('./pages/coach/ClientsListPage'));
const AddClientPage = lazy(() => import('./pages/coach/AddClientPage'));
const ClientManagementPage = lazy(() => import('./pages/coach/ClientManagementPage'));
const OwnerDashboardPage = lazy(() => import('./pages/coach/OwnerDashboardPage'));
const SystemConsolePage = lazy(() => import('./pages/coach/SystemConsolePage'));
const WhatsAppManagerPage = lazy(() => import('./pages/coach/WhatsAppManagerPage'));
const DesktopCoachPortal = lazy(() => import('./pages/coach/DesktopCoachPortal'));

const CoachLandingPage = lazy(() => import('./pages/coach/CoachLandingPage'));
const DownloadBlueprintPage = lazy(() => import('./pages/coach/DownloadBlueprintPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const WaPilotTestConsole = lazy(() => import('./pages/WaPilotTestConsole'));

const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

const isElectron = typeof window !== 'undefined' && navigator.userAgent.includes('Electron');

const TAB_ORDER = ['/', '/workout', '/diet', '/inbody', '/profile'];

const getTabIndex = (pathname: string) => {
  if (pathname === '/') return 0;
  const base = '/' + pathname.split('/')[1];
  const idx = TAB_ORDER.indexOf(base);
  return idx === -1 ? 99 : idx; // sub-pages or unknown routes push forward
};

const PageTransition = ({ children, direction }: { children: React.ReactNode, direction: number }) => {
  const variants = {
    initial: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0
    })
  };

  const location = useLocation();
  const path = location.pathname;
  const hasStickyHeader = 
    path.startsWith('/workout/active') ||
    path.startsWith('/diet/meal/') ||
    path.startsWith('/diet/search') ||
    path.startsWith('/diet/food/new') ||
    path.startsWith('/diet/inventory') ||
    (/^\/workout\/[^/]+$/.test(path) && !path.endsWith('/builder') && !path.startsWith('/workout/active'));

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="w-full h-full absolute top-0 left-0 overflow-y-auto pb-0 no-scrollbar bg-background"
      style={hasStickyHeader ? {} : { paddingTop: 'env(safe-area-inset-top)' }}
    >
      {children}
    </motion.div>
  );
};



const AppContent = ({ userRole, session, onCheckLaunch }: { userRole: string | null, session: any, onCheckLaunch: () => void }) => {
  const [showIntro, setShowIntro] = useState(true);
  const location = useLocation();

  const navigate = useNavigate();
  const prevIndex = useRef(getTabIndex(location.pathname));
  const currentIndex = getTabIndex(location.pathname);

  // Trigger launch status check immediately when entering any page
  useEffect(() => {
    onCheckLaunch();
  }, [location.pathname, onCheckLaunch]);

  // Redirect logged-in coach/owner to coach dashboard if they are on a non-coach path
  const isCoachOrOwner = session?.user?.id === OWNER_ID || userRole === 'coach';
  const isCoachPortal = location.pathname.startsWith('/coach-portal');
  const isMobile = window.innerWidth < 1024;
  
  useEffect(() => {
    if (isCoachOrOwner && !location.pathname.startsWith('/coach') && !isCoachPortal) {
      if (isElectron) {
        navigate('/coach-portal', { replace: true });
      } else if (isMobile) {
        navigate('/coach/dashboard', { replace: true });
      } else {
        navigate('/coach-portal', { replace: true });
      }
    }
  }, [isCoachOrOwner, location.pathname, isCoachPortal, isMobile]);

  let direction = 1;
  if (currentIndex > prevIndex.current) direction = 1;
  else if (currentIndex < prevIndex.current) direction = -1;
  else direction = 1;

  const [showSplash, setShowSplash] = useState(false);
  const [pendingRewardStats, setPendingRewardStats] = useState<any>(null);

  const [showGymSplash, setShowGymSplash] = useState(false);
  const [pendingGymStats, setPendingGymStats] = useState<any>(null);

  useEffect(() => {
    const handleRunSaved = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPendingRewardStats(customEvent.detail);
      setShowSplash(true);
    };

    const handleGymSaved = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPendingGymStats(customEvent.detail);
      setShowGymSplash(true);
    };

    window.addEventListener('trigger-run-saved', handleRunSaved);
    window.addEventListener('trigger-gym-saved', handleGymSaved);

    return () => {
      window.removeEventListener('trigger-run-saved', handleRunSaved);
      window.removeEventListener('trigger-gym-saved', handleGymSaved);
    };
  }, []);

  useEffect(() => {
    prevIndex.current = currentIndex;
  }, [location.pathname]);

  // Any active overlay = hide the bottom nav so it can't bleed through
  const anyOverlayActive = showSplash || showGymSplash;

  if (isElectron && !location.pathname.startsWith('/coach') && !isCoachPortal) {
    return <Navigate to="/coach-portal" replace />;
  }

  if (isCoachPortal && isMobile) {
    return <Navigate to="/coach/dashboard" replace />;
  }

  if (isCoachPortal) {
    return (
      <div className="w-full h-screen bg-background text-gray-100 font-sans overflow-hidden no-scrollbar">
        <Routes location={location} key={location.pathname}>
          <Route path="/coach-portal" element={<DesktopCoachPortal />} />
        </Routes>
      </div>
    );
  }

  return (
    <>
      {/* ── App shell (constrained width, clipped) ── */}
      <div 
        className="flex flex-col bg-background text-gray-100 font-sans w-full fixed inset-0 sm:relative sm:inset-auto sm:h-full sm:max-w-[390px] mx-auto overflow-hidden shadow-2xl sm:border-x sm:border-gray-800"
      >
        {showIntro && <OpeningAnimation onComplete={() => setShowIntro(false)} />}

        <div className="flex-1 relative">
          <AnimatePresence mode="wait" custom={direction}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition direction={direction}><TodayView /></PageTransition>} />
              <Route path="/workout" element={<PageTransition direction={direction}><WorkoutHome /></PageTransition>} />
              <Route path="/workout/active" element={<PageTransition direction={direction}><WorkoutTracker /></PageTransition>} />
              <Route path="/workout/builder" element={<PageTransition direction={direction}><WorkoutBuilder /></PageTransition>} />
              <Route path="/workout/:id" element={<PageTransition direction={direction}><WorkoutDetail /></PageTransition>} />
              <Route path="/diet" element={<PageTransition direction={direction}><DietHome /></PageTransition>} />
              <Route path="/diet/meal/:id" element={<PageTransition direction={direction}><DietMealBuilder /></PageTransition>} />
              <Route path="/diet/search" element={<PageTransition direction={direction}><DietSearch /></PageTransition>} />
              <Route path="/diet/food/new" element={<PageTransition direction={direction}><FoodCreator /></PageTransition>} />
              <Route path="/diet/inventory" element={<PageTransition direction={direction}><FoodInventory /></PageTransition>} />
              <Route path="/inbody" element={<PageTransition direction={direction}><InBodyView /></PageTransition>} />

              <Route path="/profile" element={<PageTransition direction={direction}><ProfileView /></PageTransition>} />

              {/* Coach Routes */}
              <Route path="/coach/dashboard" element={<PageTransition direction={direction}><DashboardPage /></PageTransition>} />
              <Route path="/coach/clients" element={<PageTransition direction={direction}><ClientsListPage /></PageTransition>} />
              <Route path="/coach/clients/new" element={<PageTransition direction={direction}><AddClientPage /></PageTransition>} />
              <Route path="/coach/clients/:clientId" element={<PageTransition direction={direction}><ClientManagementPage /></PageTransition>} />
              <Route path="/coach/owner" element={<PageTransition direction={direction}><OwnerDashboardPage /></PageTransition>} />
              <Route path="/coach/system" element={<PageTransition direction={direction}><SystemConsolePage /></PageTransition>} />
              <Route path="/coach/whatsapp-manager" element={<PageTransition direction={direction}><WhatsAppManagerPage /></PageTransition>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </div>

        {/* Portal for sheet overlays to sit above the page transition stacking context & BottomNav */}
        <div id="modal-portal" className="absolute inset-0 pointer-events-none z-[90]" />

        {/* Bottom nav — hidden while any full-screen overlay is active */}
        {!anyOverlayActive && !isCoachOrOwner && <BottomNav />}
      </div>

      {/* ── Full-screen overlays rendered OUTSIDE the clipped shell ── */}
      <SplashOverlay
        show={showSplash}
        onComplete={() => {
          setShowSplash(false);
          if (pendingRewardStats) {
            const id = pendingRewardStats.workoutId;
            setPendingRewardStats(null);
            if (id) {
              navigate(`/workout/${id}`, { replace: true });
            }
          }
        }}
      />

      <GymSplashOverlay
        show={showGymSplash}
        workoutName={pendingGymStats?.workoutName || ''}
        onComplete={() => {
          setShowGymSplash(false);
          if (pendingGymStats) {
            const id = pendingGymStats.workoutId;
            setPendingGymStats(null);
            if (id) {
              navigate(`/workout/${id}`, { replace: true });
            }
          }
        }}
      />
    </>
  );
};

function App() {
  if (typeof window !== 'undefined' && window.location.pathname === '/secret-wapilot-test-8f3a9d') {
    return <WaPilotTestConsole />;
  }

  const [session, setSession] = useState<any>(undefined);
  const [signupInProgress, setSignupInProgress] = useState(() => localStorage.getItem('signup_in_progress') === 'true');
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | undefined>(undefined);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [suspensionReason, setSuspensionReason] = useState<string | null>(null);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [coachProfile, setCoachProfile] = useState<any>(null);

  const [launchStatus, setLaunchStatus] = useState<'live' | 'coming_soon' | 'maintenance'>('live');
  const [launchTime, setLaunchTime] = useState<string | null>(null);
  const [bypassActive, setBypassActive] = useState(false);
  const [checkingLaunch, setCheckingLaunch] = useState(true);
  const [lockCoaches, setLockCoaches] = useState(false);

  const checkLaunchStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('launch_settings')
        .select('status, launch_time, lock_coaches')
        .eq('id', 'main')
        .maybeSingle();

      if (!error && data) {
        setLaunchStatus(data.status);
        setLaunchTime(data.launch_time);
        setLockCoaches(!!data.lock_coaches);
        
        // Auto-launch check
        if (data.status !== 'live' && data.launch_time) {
          const difference = +new Date(data.launch_time) - +new Date();
          if (difference <= 0) {
            setLaunchStatus('live');
            await supabase
              .from('launch_settings')
              .update({ status: 'live' })
              .eq('id', 'main');
          }
        }
      }
    } catch (err) {
      console.error('Launch settings error:', err);
    } finally {
      setCheckingLaunch(false);
    }
  }, []);

  useEffect(() => {
    const verifySavedBypass = async () => {
      const token = localStorage.getItem('bypass_launch_control');
      if (token) {
        try {
          const { data: isValid } = await supabase
            .rpc('verify_bypass_hash', { entered_hash: token });
          if (isValid) {
            setBypassActive(true);
          } else {
            localStorage.removeItem('bypass_launch_control');
            setBypassActive(false);
          }
        } catch (e) {
          console.error('Bypass verification error:', e);
        }
      }
    };

    verifySavedBypass();
    checkLaunchStatus();
    const interval = setInterval(checkLaunchStatus, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, [checkLaunchStatus]);

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        setSession(null);
        return;
      }
      setSession(session || null);
    }).catch(err => {
      console.error('Unhandled initial auth check error:', err);
      setSession(null);
    });

    // 2. Listen to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleSignupStatusChange = () => {
      setSignupInProgress(localStorage.getItem('signup_in_progress') === 'true');
    };
    window.addEventListener('signup_status_changed', handleSignupStatusChange);
    return () => {
      window.removeEventListener('signup_status_changed', handleSignupStatusChange);
    };
  }, []);

  // Check onboarding status when session changes
  useEffect(() => {
    if (session === undefined) return;
    if (session === null) {
      setNeedsOnboarding(undefined);
      setIsSuspended(false);
      setUserRole(null);
      return;
    }

    const checkOnboarding = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, targets, role')
          .eq('id', session.user.id)
          .maybeSingle();

        // If no profile exists for this auth user, check if we are in the middle of onboarding/signup
        if (!profile) {
          const signupInProgress = localStorage.getItem('signup_in_progress') === 'true';
          if (signupInProgress) {
            console.log('Signup in progress, waiting for profile insert...');
            return;
          }
          console.warn('Authenticated user has no profile — account deleted. Signing out.');
          await supabase.auth.signOut();
          setSession(null);
          setNeedsOnboarding(undefined);
          setIsSuspended(false);
          setUserRole(null);
          return;
        }

        if (profile.role === 'client' && isElectron) {
          toast.error('Access Denied: The Desktop App is only for coaches. Please use your mobile phone browser to access your athlete portal.', { duration: 6000 });
          await supabase.auth.signOut();
          setSession(null);
          setNeedsOnboarding(undefined);
          setIsSuspended(false);
          setUserRole(null);
          return;
        }

        setUserRole(profile.role || null);
        setClientProfile(profile);

        try {
          const { data: ownerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', OWNER_ID)
            .maybeSingle();

          let coachData = null;
          const { data: clientProfileRecord } = await supabase
            .from('client_profiles')
            .select('coach_id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (clientProfileRecord?.coach_id) {
            const { data: cData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', clientProfileRecord.coach_id)
              .maybeSingle();
            coachData = cData;
          }

          if (coachData && coachData.targets?.phone_number) {
            setCoachProfile(coachData);
          } else if (ownerData) {
            setCoachProfile(ownerData);
          }
        } catch (err) {
          console.error('Error pre-fetching coach details:', err);
        }

        // Check if account is suspended/deactivated via JSON targets or auto-suspend date
        const now = new Date();
        const targets = profile.targets || {};
        let isDeactivated = targets.is_deactivated === true;
        let reason = 'Your account is suspended because your subscription has expired or was not renewed. Please contact your coach to reactivate your access.';

        if (session.user.id === OWNER_ID || profile.role === 'coach') {
          isDeactivated = false;
        } else if (targets.subscription_start_date && targets.subscription_end_date) {
          const startDate = new Date(targets.subscription_start_date);
          const endDate = new Date(targets.subscription_end_date);
          if (now < startDate) {
            isDeactivated = true;
            const diffMs = startDate.getTime() - now.getTime();
            const daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
            reason = `Your subscription starts in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}. Your access will activate automatically once your plan begins.`;
          } else if (now >= endDate) {
            isDeactivated = true;
            reason = 'Your subscription has expired. Please contact your coach to renew your plan and reactivate access.';
          }
        } else if (targets.auto_suspend_date) {
          const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
          if (todayStr >= targets.auto_suspend_date) {
            isDeactivated = true;
            reason = 'Your account has reached its scheduled auto-suspension date. Please contact your coach to reactivate access.';
          }
        }

        if (isDeactivated) {
          setIsSuspended(true);
          setSuspensionReason(reason);
          setNeedsOnboarding(false); // Bypass loader check to render suspended page immediately
          return;
        } else {
          setIsSuspended(false);
          setSuspensionReason(null);
        }

        const isNewSignup = localStorage.getItem('is_new_signup') === 'true';

        if (profile?.targets?.show_welcome_animation === true) {
          setWelcomeName(profile.display_name || '');
          setShowWelcomeSplash(true);

          const cleanTargets = { ...profile.targets };
          delete cleanTargets.show_welcome_animation;

          await supabase
            .from('profiles')
            .update({ targets: cleanTargets })
            .eq('id', session.user.id);
        }

        if (profile?.targets?.onboarding_completed === true || !isNewSignup) {
          setNeedsOnboarding(false);
        } else {
          setNeedsOnboarding(true);
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        setNeedsOnboarding(false); // fallback to bypass on error
      }
    };

    checkOnboarding();
  }, [session, signupInProgress]);

  // Listen to real-time updates to the profile (specifically for deactivation toggling)
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel(`self-profile-sync-${session.user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${session.user.id}`
      }, (payload: any) => {
        if (payload.new) {
          setClientProfile(payload.new);
        }
        if (payload.new?.role === 'client' && isElectron) {
          toast.error('Access Denied: The Desktop App is only for coaches. Please use your mobile phone browser to access your athlete portal.', { duration: 6000 });
          supabase.auth.signOut();
          setSession(null);
          return;
        }
        if (session.user.id === OWNER_ID || userRole === 'coach' || payload.new?.role === 'coach') {
          setIsSuspended(false);
          setSuspensionReason(null);
          return;
        }
        const now = new Date();
        const targets = payload.new?.targets || {};
        let isDeactivated = targets.is_deactivated === true;
        let reason = 'Your account is suspended because your subscription has expired or was not renewed. Please contact your coach to reactivate your access.';

        if (targets.subscription_start_date && targets.subscription_end_date) {
          const startDate = new Date(targets.subscription_start_date);
          const endDate = new Date(targets.subscription_end_date);
          if (now < startDate) {
            isDeactivated = true;
            const diffMs = startDate.getTime() - now.getTime();
            const daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
            reason = `Your subscription starts in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}. Your access will activate automatically once your plan begins.`;
          } else if (now >= endDate) {
            isDeactivated = true;
            reason = 'Your subscription has expired. Please contact your coach to renew your plan and reactivate access.';
          }
        } else if (targets.auto_suspend_date) {
          const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
          if (todayStr >= targets.auto_suspend_date) {
            isDeactivated = true;
            reason = 'Your account has reached its scheduled auto-suspension date. Please contact your coach to reactivate access.';
          }
        }

        if (isDeactivated) {
          setIsSuspended(true);
          setSuspensionReason(reason);
        } else {
          setIsSuspended(false);
          setSuspensionReason(null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, userRole]);

  const handleRenewSubscription = () => {
    const rawPhone = coachProfile?.targets?.phone_number;
    if (!rawPhone) {
      toast.error('Your coach has not set up their contact phone number yet.');
      return;
    }
    let cleanPhone = rawPhone.replace(/\D/g, '');
    
    // Normalize Egyptian mobile number format
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '2' + cleanPhone;
    } else if (cleanPhone.startsWith('1') && cleanPhone.length === 10) {
      cleanPhone = '20' + cleanPhone;
    }
    
    const clientName = clientProfile?.display_name || '';
    const clientId = clientProfile?.targets?.client_code || '';
    const textMsg = `hey coach im ${clientName} , my id is ${clientId} + i want to renew my subscription`;
    const encodedText = encodeURIComponent(textMsg);
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  const effectiveSession = signupInProgress ? null : session;

  if (checkingLaunch) {
    return <DumbbellLoader fullScreen size={140} />;
  }

  const isCoachOrOwner = session?.user?.id === OWNER_ID || userRole === 'coach';
  let shouldShowLockScreen = false;
  if (launchStatus !== 'live' && !isElectron) {
    if (lockCoaches) {
      shouldShowLockScreen = !bypassActive;
    } else {
      const isClient = userRole === 'client';
      if (isCoachOrOwner) {
        shouldShowLockScreen = false;
      } else {
        shouldShowLockScreen = isClient || !bypassActive;
      }
    }
  }

  if (shouldShowLockScreen) {
    return (
      <Router>
        <Suspense fallback={<DumbbellLoader fullScreen size={100} />}>
          <Toaster 
            position="top-center" 
            reverseOrder={false} 
            toastOptions={{
              style: {
                background: '#0a0d1e',
                color: '#fff',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '14px',
                fontSize: '11px',
                fontWeight: '700',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
                padding: '10px 16px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#0a0d1e',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#0a0d1e',
                },
              },
              loading: {
                style: {
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                },
                iconTheme: {
                  primary: '#f59e0b',
                  secondary: '#0a0d1e',
                }
              }
            }}
          />
          <LaunchLockScreen 
            status={launchStatus as 'coming_soon' | 'maintenance'} 
            launchTime={launchTime} 
            onBypassSuccess={() => setBypassActive(true)} 
          />
        </Suspense>
      </Router>
    );
  }

  return (
    <Router>
      <Suspense fallback={<DumbbellLoader fullScreen size={100} />}>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            background: '#0a0d1e',
            color: '#fff',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            borderRadius: '14px',
            fontSize: '11px',
            fontWeight: '700',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
            padding: '10px 16px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#0a0d1e',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0a0d1e',
            },
          },
          loading: {
            style: {
              border: '1px solid rgba(245, 158, 11, 0.2)',
            },
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#0a0d1e',
            }
          }
        }}
      />
      {showWelcomeSplash && (
        <SplashOverlay
          show={showWelcomeSplash}
          welcomeName={welcomeName}
          role={userRole}
          onComplete={() => setShowWelcomeSplash(false)}
        />
      )}
      {effectiveSession === undefined || (effectiveSession !== null && needsOnboarding === undefined) ? (
        <DumbbellLoader fullScreen size={140} />
      ) : isSuspended ? (
        <Routes>
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/download-blueprint" element={<DownloadBlueprintPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center p-6 min-h-[100dvh] bg-background text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="15"/><line x1="15" x2="9" y1="9" y2="15"/></svg>
              </div>
              <h1 className="text-xl font-black text-white">Account Suspended</h1>
              <p className="text-gray-400 text-xs mt-3 max-w-[280px] leading-relaxed">
                {suspensionReason || 'Your account is suspended because your subscription has expired or was not renewed. Please contact your coach to reactivate your access.'}
              </p>
              
              {coachProfile && (
                <button
                  onClick={handleRenewSubscription}
                  className="mt-8 w-full max-w-[280px] py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Renew Subscription</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                </button>
              )}

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setSession(null);
                  setIsSuspended(false);
                }}
                className="mt-4 bg-transparent hover:text-white text-gray-400 font-bold px-6 py-2 text-xs transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          } />
        </Routes>
      ) : !effectiveSession ? (
        <Routes>
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/download-blueprint" element={<DownloadBlueprintPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<CoachLandingPage />} />
          <Route path="/login" element={
            <>
              <CookieConsent />
              <OnboardingFlow 
                initialStep={1} 
                onSessionConfigured={setSession} 
              />
            </>
          } />
          <Route path="/client-login" element={
            isElectron ? (
              <Navigate to="/" replace />
            ) : (
              <>
                <CookieConsent />
                <OnboardingFlow 
                  initialStep={1} 
                  onSessionConfigured={setSession} 
                />
              </>
            )
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : needsOnboarding ? (
        <Routes>
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/download-blueprint" element={<DownloadBlueprintPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={
            <>
              <CookieConsent />
              <OnboardingFlow 
                initialStep={2} 
                onSessionConfigured={setSession} 
                onComplete={() => setNeedsOnboarding(false)} 
              />
            </>
          } />
        </Routes>
      ) : (
        <Routes>
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/download-blueprint" element={<DownloadBlueprintPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={
            <>
              <CookieConsent />
              {showWelcomeSplash ? (
                <div className="w-full h-screen bg-[#060713]" />
              ) : (
                <AppContent userRole={userRole} session={session} onCheckLaunch={checkLaunchStatus} />
              )}
            </>
          } />
        </Routes>
      )}
      </Suspense>
    </Router>
  );
}

export default App;
