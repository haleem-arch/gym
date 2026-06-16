import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Monitor, Smartphone, MessageSquare, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function CoachMobileInfo() {
  const navigate = useNavigate();

  const handleSupportWhatsApp = () => {
    const textMsg = "Hello Life Gym Team, I am a coach and I need help setting up my desktop console.";
    const encodedText = encodeURIComponent(textMsg);
    window.open(`https://wa.me/201128828954?text=${encodedText}`, '_blank');
  };

  return (
    <div className="min-h-screen w-full bg-[#060713] text-gray-100 flex flex-col justify-start p-6 relative overflow-y-auto font-sans pb-12">
      
      {/* Background decorations */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-8 z-10">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition-colors flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 flex items-center justify-center border border-blue-500/20">
            <img src="/icon.svg" alt="Life Gym Logo" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-widest text-white uppercase">Life Gym</h4>
          </div>
        </div>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md mx-auto bg-[#111326]/40 border border-white/[0.06] rounded-[28px] p-6 shadow-2xl backdrop-blur-md relative overflow-hidden z-10"
      >
        <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-blue-500/5 rounded-full blur-[50px] pointer-events-none" />
        
        {/* Device Alert Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl max-w-fit mb-5 text-yellow-400">
          <ShieldAlert size={14} className="shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-wider">Coach Console Notice</span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-black text-white uppercase tracking-wider leading-tight">
          Desktop Console Required
        </h2>
        <p className="text-[11px] text-gray-400 mt-2 leading-relaxed font-medium">
          The Life Gym Coach Portal features high-performance programming boards, live spreadsheet tracking, and client analytics designed exclusively for large screens. It is not accessible from mobile web browsers.
        </p>

        {/* Action Options */}
        <div className="mt-6 space-y-4">
          
          {/* Option 1: Open on PC */}
          <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-2">
            <div className="flex items-center gap-2.5 text-blue-400">
              <Monitor size={16} />
              <h3 className="text-[11px] font-black uppercase tracking-wider">Option 1: Log in on Desktop</h3>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Open your computer's browser, navigate to <span className="text-white font-bold font-mono">gym-kappa-three.vercel.app</span> and sign in directly.
            </p>
          </div>

          {/* Option 2: Download Desktop App */}
          <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <Download size={16} />
              <h3 className="text-[11px] font-black uppercase tracking-wider">Option 2: Download App</h3>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Install the standalone Life Gym Coach desktop app for a faster, dedicated portal environment.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <a
                href="/downloads/Life-Gym-Setup.exe"
                download
                className="py-2.5 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 hover:border-blue-500/40 text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Monitor size={12} />
                <span>Windows (.exe)</span>
              </a>
              <a
                href="/downloads/Life-Gym.dmg"
                download
                className="py-2.5 bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 hover:border-purple-500/40 text-purple-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Smartphone size={12} />
                <span>macOS (.dmg)</span>
              </a>
            </div>
          </div>

          {/* Option 3: Athlete Access */}
          <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-2">
            <div className="flex items-center gap-2.5 text-yellow-500">
              <Smartphone size={16} />
              <h3 className="text-[11px] font-black uppercase tracking-wider">Are you an Athlete?</h3>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Athletes track their workouts and meals directly from their phones.
            </p>
            <button
              onClick={() => navigate('/client-login')}
              className="mt-1 w-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-98 cursor-pointer"
            >
              Go to Athlete Login
            </button>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06] my-6" />

        {/* Help & Support Button */}
        <button
          onClick={handleSupportWhatsApp}
          className="w-full bg-[#10b981]/10 border border-[#10b981]/25 hover:bg-[#10b981]/20 hover:border-[#10b981]/45 text-[#10b981] py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          <MessageSquare size={13} />
          <span>Need Help? Chat with Support</span>
        </button>

      </motion.div>
    </div>
  );
}
