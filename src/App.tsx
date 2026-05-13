import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import TodayView from './pages/TodayView';
import WorkoutHome from './pages/WorkoutHome';
import WorkoutTracker from './pages/WorkoutTracker';
import WorkoutDetail from './pages/WorkoutDetail';
import BottomNav from './components/BottomNav';

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
      <div className="flex flex-col h-[100dvh] bg-background text-gray-100 font-sans w-full max-w-[390px] mx-auto relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-800">
        <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
          <Routes>
            <Route path="/" element={<TodayView />} />
            <Route path="/workout" element={<WorkoutHome />} />
            <Route path="/workout/active" element={<WorkoutTracker />} />
            <Route path="/workout/:id" element={<WorkoutDetail />} />
            <Route path="/diet" element={<div className="p-4">Diet Tracker (Coming Soon)</div>} />
            <Route path="/inbody" element={<div className="p-4">InBody (Coming Soon)</div>} />
            <Route path="/ai" element={<div className="p-4">AI Coach (Coming Soon)</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
