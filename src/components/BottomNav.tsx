import { Home, Dumbbell, Apple, Activity, MessageSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  const navItems = [
    { to: '/', icon: <Home size={24} />, label: 'Today' },
    { to: '/workout', icon: <Dumbbell size={24} />, label: 'Workout' },
    { to: '/diet', icon: <Apple size={24} />, label: 'Diet' },
    { to: '/inbody', icon: <Activity size={24} />, label: 'InBody' },
    { to: '/ai', icon: <MessageSquare size={24} />, label: 'Coach' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-surface border-t border-gray-800 px-6 py-3 pb-6 flex justify-between items-center z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
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
