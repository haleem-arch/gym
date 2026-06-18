import { Home, Dumbbell, Apple, Activity, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const BottomNav = () => {
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [targets, setTargets] = useState<any>(null);

  useEffect(() => {
    const fetchTargets = async (uid: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('targets, coach_id')
        .eq('id', uid)
        .maybeSingle();
      if (data) {
        setTargets({ ...data.targets, coach_id: data.coach_id });
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) fetchTargets(uid);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) {
        fetchTargets(uid);
      } else {
        setTargets(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Hide bottom nav on the active workout tracker (and its reward screen overlay)
  if (location.pathname === '/workout/active') {
    return null;
  }

  interface NavItem {
    to: string;
    icon: React.ReactNode;
    label: string;
    lockKey?: string;
    restrict?: boolean;
  }

  const allNavItems: NavItem[] = [
    { to: '/', icon: <Home size={24} />, label: 'Today' },
    { to: '/workout', icon: <Dumbbell size={24} />, label: 'Workout', lockKey: 'disable_workout' },
    { to: '/diet', icon: <Apple size={24} />, label: 'Diet', lockKey: 'disable_diet' },
    { to: '/inbody', icon: <Activity size={24} />, label: 'InBody', lockKey: 'disable_inbody' },
    { to: '/profile', icon: <User size={24} />, label: 'Profile' }
  ];

  const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
  
  const navItems = allNavItems.filter(item => {
    if (item.restrict && userId !== OWNER_ID) return false;
    if (targets?.coach_id === null) return true; // Self-guided athlete has no locks
    if (item.lockKey && targets?.[item.lockKey] === true) return false;
    return true;
  });

  return (
    <nav 
      className="flex-shrink-0 w-full bg-[#0c1020]/65 backdrop-blur-md border-t border-blue-900/20 px-4 pt-3 pb-[env(safe-area-inset-bottom)] flex justify-between items-center z-50 overflow-x-auto no-scrollbar"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors flex-1 min-w-[50px] ${
              isActive || (item.to === '/workout' && location.pathname.startsWith('/workout')) ? 'text-primary' : 'text-zinc-500 hover:text-zinc-350'
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
