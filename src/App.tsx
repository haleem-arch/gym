import { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import TodayView from './pages/TodayView';
import WorkoutHome from './pages/WorkoutHome';
import WorkoutBuilder from './pages/WorkoutBuilder';
import WorkoutTracker from './pages/WorkoutTracker';
import WorkoutDetail from './pages/WorkoutDetail';
import BottomNav from './components/BottomNav';
import { OpeningAnimation } from './components/OpeningAnimation';
import { DumbbellLoader } from './components/DumbbellLoader';
import { SplashOverlay } from './components/SplashOverlay';
import { RunReceipt } from './components/RunReceipt';
import { GymSplashOverlay } from './components/GymSplashOverlay';
import { GymReceipt } from './components/GymReceipt';

import DietHome from './pages/DietHome';
import DietMealBuilder from './pages/DietMealBuilder';
import DietSearch from './pages/DietSearch';
import FoodCreator from './pages/FoodCreator';
import FoodInventory from './pages/FoodInventory';

import AiCoach from './pages/AiCoach';
import InBodyView from './pages/InBodyView';
import StravaAnalyzer from './pages/StravaAnalyzer';

// Coach Pages
import DashboardPage from './pages/coach/DashboardPage';
import ClientsListPage from './pages/coach/ClientsListPage';
import AddClientPage from './pages/coach/AddClientPage';
import ClientManagementPage from './pages/coach/ClientManagementPage';
import OnboardingFlow from './components/OnboardingFlow';

const TAB_ORDER = ['/', '/workout', '/diet', '/strava', '/inbody', '/ai'];

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
      className="w-full h-full absolute top-0 left-0 overflow-y-auto pb-28 no-scrollbar bg-background"
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
  const [rewardStats, setRewardStats] = useState<any>(null);
  const [pendingRewardStats, setPendingRewardStats] = useState<any>(null);

  const [showGymSplash, setShowGymSplash] = useState(false);
  const [gymRewardStats, setGymRewardStats] = useState<any>(null);
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
  const anyOverlayActive = showSplash || !!rewardStats || showGymSplash || !!gymRewardStats;

  return (
    <>
      {/* ── App shell (constrained width, clipped) ── */}
      <div className="flex flex-col h-[100dvh] bg-background text-gray-100 font-sans w-full sm:max-w-[390px] mx-auto relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-800">
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
              <Route path="/strava" element={<PageTransition direction={direction}><StravaAnalyzer /></PageTransition>} />
              <Route path="/ai" element={<PageTransition direction={direction}><AiCoach /></PageTransition>} />

              {/* Coach Routes */}
              <Route path="/coach/dashboard" element={<PageTransition direction={direction}><DashboardPage /></PageTransition>} />
              <Route path="/coach/clients" element={<PageTransition direction={direction}><ClientsListPage /></PageTransition>} />
              <Route path="/coach/clients/new" element={<PageTransition direction={direction}><AddClientPage /></PageTransition>} />
              <Route path="/coach/clients/:clientId" element={<PageTransition direction={direction}><ClientManagementPage /></PageTransition>} />

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
            setRewardStats(pendingRewardStats);
            setPendingRewardStats(null);
          }
        }}
      />

      {rewardStats && (
        <RunReceipt
          stats={rewardStats}
          onClose={() => setRewardStats(null)}
        />
      )}

      <GymSplashOverlay
        show={showGymSplash}
        workoutName={pendingGymStats?.workoutName || ''}
        onComplete={() => {
          setShowGymSplash(false);
          if (pendingGymStats) {
            setGymRewardStats(pendingGymStats);
            setPendingGymStats(null);
          }
        }}
      />

      {gymRewardStats && (
        <GymReceipt
          stats={gymRewardStats}
          onClose={() => {
            const id = gymRewardStats.workoutId;
            setGymRewardStats(null);
            navigate(`/workout/${id}`, { replace: true });
          }}
        />
      )}
    </>
  );
};

function App() {
  const [session, setSession] = useState<any>(undefined);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | undefined>(undefined);

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
      return;
    }

    const checkOnboarding = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('targets')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.targets?.onboarding_completed === true) {
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

  if (session === undefined || (session !== null && needsOnboarding === undefined)) {
    return <DumbbellLoader fullScreen size={140} />;
  }

  if (!session) {
    return (
      <OnboardingFlow 
        initialStep={1} 
        onSessionConfigured={setSession} 
      />
    );
  }

  if (needsOnboarding) {
    return (
      <OnboardingFlow 
        initialStep={2} 
        onSessionConfigured={setSession} 
        onComplete={() => setNeedsOnboarding(false)} 
      />
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
