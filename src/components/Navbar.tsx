import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/coach/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/coach/clients', label: 'Athletes', icon: Users },
    { path: '/coach/clients/new', label: 'Deploy', icon: UserPlus },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-surface/30 backdrop-blur-lg border border-white/5 px-4 py-3 rounded-2xl pointer-events-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Brand/Logo */}
        <Link to="/coach/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center font-outfit font-black text-white text-base shadow-lg shadow-secondary/20 group-hover:scale-105 transition-all">
            SR
          </div>
          <span className="font-outfit font-black text-sm uppercase tracking-[3px] bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:text-accent transition-colors">
            Stride <span className="text-accent">Rite</span>
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1.5 bg-background/40 border border-border/40 p-1 rounded-xl relative">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path === '/coach/clients' && currentPath.startsWith('/coach/clients') && currentPath !== '/coach/clients/new');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive 
                    ? 'text-white bg-accent/20 border border-accent/30 shadow-[0_0_15px_rgba(255,107,53,0.15)]' 
                    : 'text-gray-400 hover:text-white hover:bg-surface/50 border border-transparent'
                }`}
              >
                <Icon size={12} className={isActive ? 'text-accent' : 'text-gray-400'} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tactical status indicator */}
        <div className="hidden md:flex items-center gap-2 bg-success/10 border border-success/20 px-3 py-1.5 rounded-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="font-mono text-[8px] text-success uppercase tracking-widest font-black">SECURE CONNECT</span>
        </div>
      </div>
    </header>
  );
}
