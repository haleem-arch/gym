import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import TodayView from './pages/TodayView';
import WorkoutHome from './pages/WorkoutHome';
import WorkoutTracker from './pages/WorkoutTracker';
import WorkoutDetail from './pages/WorkoutDetail';
import ManagePlans from './pages/ManagePlans';
import BottomNav from './components/BottomNav';
import AuthGate from './pages/AuthGate';

import DietHome from './pages/DietHome';
import DietMealBuilder from './pages/DietMealBuilder';
import DietSearch from './pages/DietSearch';
import FoodCreator from './pages/FoodCreator';
import FoodInventory from './pages/FoodInventory';

import AiCoach from './pages/AiCoach';
import InBodyView from './pages/InBodyView';

// Coach Pages
import DashboardPage from './pages/coach/DashboardPage';
import ClientsListPage from './pages/coach/ClientsListPage';
import AddClientPage from './pages/coach/AddClientPage';
import ClientManagementPage from './pages/coach/ClientManagementPage';

function App() {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    // 1. Load initial session state
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('Session error:', error);
      setSession(session);
    }).catch(err => {
      console.error('Unhandled auth error:', err);
      setSession(null);
    });

    // 2. Subscribe to reactive login/logout auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return (
      <div className="bg-background h-[100dvh] flex items-center justify-center text-primary font-bold animate-pulse">
        LOADING ATHLETE PROFILE...
      </div>
    );
  }

  if (!session) {
    return <AuthGate />;
  }

  return (
    <Router>
      <div className="flex flex-col h-[100dvh] bg-background text-gray-100 font-sans w-full sm:max-w-[390px] mx-auto relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-800">
        <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
          <Routes>
            <Route path="/" element={<TodayView />} />
            <Route path="/workout" element={<WorkoutHome />} />
            <Route path="/workout/plans" element={<ManagePlans />} />
            <Route path="/workout/active" element={<WorkoutTracker />} />
            <Route path="/workout/:id" element={<WorkoutDetail />} />
            <Route path="/diet" element={<DietHome />} />
            <Route path="/diet/meal/:id" element={<DietMealBuilder />} />
            <Route path="/diet/search" element={<DietSearch />} />
            <Route path="/diet/food/new" element={<FoodCreator />} />
            <Route path="/diet/inventory" element={<FoodInventory />} />
            <Route path="/inbody" element={<InBodyView />} />
            <Route path="/ai" element={<AiCoach />} />

            {/* Coach Routes */}
            <Route path="/coach/dashboard" element={<DashboardPage />} />
            <Route path="/coach/clients" element={<ClientsListPage />} />
            <Route path="/coach/clients/new" element={<AddClientPage />} />
            <Route path="/coach/clients/:clientId" element={<ClientManagementPage />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
