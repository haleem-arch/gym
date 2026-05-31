import { Home, Dumbbell, Apple, Activity, MessageSquare, MapPin } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const BottomNav = () => {
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);
  
  // Hide bottom nav on the active workout tracker (and its reward screen overlay)
  if (location.pathname === '/workout/active') {
    return null;
  }

  const allNavItems = [
    { to: '/', icon: <Home size={24} />, label: 'Today' },
    { to: '/workout', icon: <Dumbbell size={24} />, label: 'Workout' },
    { to: '/diet', icon: <Apple size={24} />, label: 'Diet' },
    { to: '/strava', icon: <MapPin size={24} />, label: 'Strava', restrict: true },
    { to: '/inbody', icon: <Activity size={24} />, label: 'InBody' },
    { to: '/ai', icon: <MessageSquare size={24} />, label: 'Coach' },
  ];

  const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
  const navItems = allNavItems.filter(item => !item.restrict || userId === OWNER_ID);

  return (
    <nav 
      className="absolute bottom-0 left-0 right-0 bg-surface border-t border-gray-800 px-4 pt-3 flex justify-between items-center z-50 overflow-x-auto no-scrollbar"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors flex-1 min-w-[50px] ${
              isActive || (item.to === '/workout' && location.pathname.startsWith('/workout')) ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
            }`
          }
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
