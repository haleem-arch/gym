import { Home, Dumbbell, Apple, Activity, MessageSquare, MapPin } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const BottomNav = () => {
  const location = useLocation();
  const [isCoachOrOwner, setIsCoachOrOwner] = useState(false);
  const [disableNutritionTargets, setDisableNutritionTargets] = useState(false);

  useEffect(() => {
    const fetchRoleAndToggles = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || null;

      if (uid) {
        let hasAccess = uid === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
        if (!hasAccess && session?.user?.email?.toLowerCase().startsWith('haleem')) {
          hasAccess = true;
        }
        if (!hasAccess) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', uid).maybeSingle();
          if (profile?.role === 'coach') {
            hasAccess = true;
          }
        }
        setIsCoachOrOwner(hasAccess);
      }

      // Fetch owner toggles
      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      if (ownerProfile?.targets) {
        setDisableNutritionTargets(!!ownerProfile.targets.disable_nutrition_targets);
      }
    };

    fetchRoleAndToggles();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRoleAndToggles();
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

  const navItems = allNavItems.filter(item => {
    if (item.restrict && !isCoachOrOwner) return false;
    if (item.to === '/diet' && disableNutritionTargets && !isCoachOrOwner) return false;
    return true;
  });

  return (
    <nav 
      className="absolute bottom-0 left-0 right-0 bg-surface border-t border-gray-800 px-4 pt-3 flex justify-between items-center z-50 overflow-x-auto no-scrollbar"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
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
