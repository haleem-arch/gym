import { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import TodayView from './pages/TodayView';
import WorkoutHome from './pages/WorkoutHome';
import WorkoutTracker from './pages/WorkoutTracker';
import WorkoutDetail from './pages/WorkoutDetail';
import BottomNav from './components/BottomNav';

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
  const location = useLocation();
  const prevIndex = useRef(getTabIndex(location.pathname));
  const currentIndex = getTabIndex(location.pathname);
  
  let direction = 1;
  if (currentIndex > prevIndex.current) direction = 1;
  else if (currentIndex < prevIndex.current) direction = -1;
  else direction = 1;

  useEffect(() => {
    prevIndex.current = currentIndex;
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-gray-100 font-sans w-full sm:max-w-[390px] mx-auto relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-800">
      <div className="flex-1 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition direction={direction}><TodayView /></PageTransition>} />
            <Route path="/workout" element={<PageTransition direction={direction}><WorkoutHome /></PageTransition>} />
            <Route path="/workout/active" element={<PageTransition direction={direction}><WorkoutTracker /></PageTransition>} />
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
      <BottomNav />
    </div>
  );
};

function App() {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        setSession(null);
        return;
      }
      if (!session) {
        supabase.auth.signInWithPassword({
          email: 'haleem@example.com',
          password: 'athletepassword123'
        }).then(({ data, error }) => {
           if (error) console.error('Auth error:', error);
           setSession(data?.session || null);
        });
      } else {
        setSession(session);
      }
    }).catch(err => {
      console.error('Unhandled auth error:', err);
      setSession(null);
    });
  }, []);

  if (session === undefined) {
    return (
      <div className="bg-background h-[100dvh] flex items-center justify-center text-primary font-bold animate-pulse">
        LOADING ATHLETE PROFILE...
      </div>
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
