import { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import HRDashboard from './pages/HRDashboard';
import TodayView from './pages/TodayView';
import WorkoutHome from './pages/WorkoutHome';
import WorkoutBuilder from './pages/WorkoutBuilder';
import WorkoutTracker from './pages/WorkoutTracker';
import WorkoutDetail from './pages/WorkoutDetail';
import BottomNav from './components/BottomNav';
import { OpeningAnimation } from './components/OpeningAnimation';
import { DumbbellLoader } from './components/DumbbellLoader';
import { SplashOverlay } from './components/SplashOverlay';
import { GymSplashOverlay } from './components/GymSplashOverlay';

import DietHome from './pages/DietHome';
import DietMealBuilder from './pages/DietMealBuilder';
import DietSearch from './pages/DietSearch';
import FoodCreator from './pages/FoodCreator';
import FoodInventory from './pages/FoodInventory';

import InBodyView from './pages/InBodyView';
import StravaAnalyzer from './pages/StravaAnalyzer';
import ProfileView from './pages/ProfileView';

// Coach Pages
import DashboardPage from './pages/coach/DashboardPage';
import ClientsListPage from './pages/coach/ClientsListPage';
import AddClientPage from './pages/coach/AddClientPage';
import ClientManagementPage from './pages/coach/ClientManagementPage';
import OwnerDashboardPage from './pages/coach/OwnerDashboardPage';
import SystemConsolePage from './pages/coach/SystemConsolePage';
import DesktopCoachPortal from './pages/coach/DesktopCoachPortal';
import OnboardingFlow from './components/OnboardingFlow';
import CookieConsent from './components/CookieConsent';
import CoachLandingPage from './pages/coach/CoachLandingPage';

const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

const StravaGuard = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
      setChecking(false);
    });
  }, []);

  if (checking) return null;
  if (userId !== OWNER_ID) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const TAB_ORDER = ['/', '/workout', '/diet', '/strava', '/inbody', '/profile'];

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

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="w-full h-full absolute top-0 left-0 overflow-y-auto pb-8 no-scrollbar bg-background"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {children}
    </motion.div>
  );
};



const AppContent = () => {
  const [showIntro, setShowIntro] = useState(true);
  const location = useLocation();

  const navigate = useNavigate();
  const prevIndex = useRef(getTabIndex(location.pathname));
  const currentIndex = getTabIndex(location.pathname);



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

  const isCoachPortal = location.pathname.startsWith('/coach-portal');

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
              <Route path="/strava" element={
                <PageTransition direction={direction}>
                  <StravaGuard>
                    <StravaAnalyzer />
                  </StravaGuard>
                </PageTransition>
              } />

              <Route path="/profile" element={<PageTransition direction={direction}><ProfileView /></PageTransition>} />


              {/* Coach Routes */}
              <Route path="/coach/dashboard" element={<PageTransition direction={direction}><DashboardPage /></PageTransition>} />
              <Route path="/coach/clients" element={<PageTransition direction={direction}><ClientsListPage /></PageTransition>} />
              <Route path="/coach/clients/new" element={<PageTransition direction={direction}><AddClientPage /></PageTransition>} />
              <Route path="/coach/clients/:clientId" element={<PageTransition direction={direction}><ClientManagementPage /></PageTransition>} />
              <Route path="/coach/owner" element={<PageTransition direction={direction}><OwnerDashboardPage /></PageTransition>} />
              <Route path="/coach/system" element={<PageTransition direction={direction}><SystemConsolePage /></PageTransition>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </div>

        {/* Portal for sheet overlays to sit above the page transition stacking context & BottomNav */}
        <div id="modal-portal" className="absolute inset-0 pointer-events-none z-[90]" />

        {/* Bottom nav — hidden while any full-screen overlay is active */}
        {!anyOverlayActive && <BottomNav />}
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
  const [session, setSession] = useState<any>(undefined);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | undefined>(undefined);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [suspensionReason, setSuspensionReason] = useState<string | null>(null);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [coachProfile, setCoachProfile] = useState<any>(null);

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

        if (profile.targets?.show_welcome_animation === true) {
          setWelcomeName(profile.display_name || '');
          setShowWelcomeSplash(true);

          const cleanTargets = { ...profile.targets };
          delete cleanTargets.show_welcome_animation;

          await supabase
            .from('profiles')
            .update({ targets: cleanTargets })
            .eq('id', session.user.id);
        }

        if (profile.targets?.onboarding_completed === true || !isNewSignup) {
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
  }, [session]);

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
      alert('Your coach has not set up their contact phone number yet.');
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

  if (session === undefined || (session !== null && needsOnboarding === undefined)) {
    return <DumbbellLoader fullScreen size={140} />;
  }

  return (
    <Router>
      {showWelcomeSplash && (
        <SplashOverlay
          show={showWelcomeSplash}
          welcomeName={welcomeName}
          role={userRole}
          onComplete={() => setShowWelcomeSplash(false)}
        />
      )}
      <Routes>
        {/* ── Standalone HR dashboard — no auth required ── */}
        <Route path="/hr" element={<HRDashboard />} />

        {/* Guest Routes (when NOT logged in) */}
        {!session ? (
          <>
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
              <>
                <CookieConsent />
                <OnboardingFlow 
                  initialStep={1} 
                  onSessionConfigured={setSession} 
                />
              </>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          /* Authenticated Routes */
          <>
            {isSuspended ? (
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
            ) : needsOnboarding ? (
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
            ) : (
              <Route path="*" element={
                <>
                  <CookieConsent />
                  {showWelcomeSplash ? (
                    <div className="w-full h-screen bg-[#060713]" />
                  ) : (
                    <AppContent />
                  )}
                </>
              } />
            )}
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
