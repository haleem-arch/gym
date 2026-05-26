import { motion } from 'framer-motion';
import { X, Shield, FileText, Cookie, Scale, HeartPulse, Cpu } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'cookies';
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield className="text-blue-400 w-6 h-6" />,
          sections: [
            {
              title: '1. Data We Collect',
              icon: <FileText size={16} className="text-blue-400" />,
              content: 'We collect information you provide directly to us to run your training programs. This includes your name, email, fitness/dietary targets (calories, protein, carbs, fat, water goals), custom workout splits, exercise logs, weights, reps, and InBody body composition scan data (weight, skeletal muscle mass, body fat percentage, body fat mass, and segmental lean analysis). We also store Strava access tokens and training activity logs if connected.',
            },
            {
              title: '2. Supabase Storage',
              icon: <Shield size={16} className="text-blue-400" />,
              content: 'Your account credentials, profile details, workout logs, nutrition tracking, and health metrics are securely stored using Supabase database infrastructure. Data is protected with industry-standard encryption in transit and at rest.',
            },
            {
              title: '3. Gemini AI Integration',
              icon: <Cpu size={16} className="text-blue-400" />,
              content: 'Our AI Coach feature uses the Gemini AI API to provide personalized feedback, analyze training patterns, and generate customized workouts/meal tips. When you query the AI Coach, your workout metrics, daily targets, and chat history are sent to Gemini to generate contextually relevant responses. No personally identifying information like your email or password is sent to Gemini.',
            },
            {
              title: '4. Vercel Hosting',
              icon: <Cookie size={16} className="text-blue-400" />,
              content: 'This application is hosted and served using Vercel infrastructure. Vercel automatically stores routing requests, caches client assets for fast page load performance, and registers secure SSL handshakes.',
            },
            {
              title: '5. User Rights & Data Deletion',
              icon: <Scale size={16} className="text-blue-400" />,
              content: 'You retain full ownership of your data. You have the right to request a full download of your training logs and composition scans. You can request complete deletion of your account and all associated records in our system at any time by contacting support or your primary coach.',
            },
          ],
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: <FileText className="text-purple-400 w-6 h-6" />,
          sections: [
            {
              title: '1. App Usage Rules',
              icon: <Scale size={16} className="text-purple-400" />,
              content: 'By accessing Life Gym, you agree to comply with these terms. You must maintain the security of your account and passcode. You are responsible for all activities that occur under your account code.',
            },
            {
              title: '2. Coach & Athlete Relationship',
              icon: <FileText size={16} className="text-purple-400" />,
              content: 'Life Gym provides a dashboard linking athletes to their primary coaches. While the app facilitates workout assignments, diet logging, and direct messaging, all coaching programs, schedules, and specific adjustments are managed directly between you and your designated coach.',
            },
            {
              title: '3. Professional Disclaimer',
              icon: <HeartPulse size={16} className="text-purple-400" />,
              content: 'The content provided by this app (including templates, targets, and automated AI Coach feedback) is for informational and motivational purposes only. It does NOT constitute medical or professional healthcare advice.',
            },
            {
              title: '4. No Liability for Fitness Advice',
              icon: <Shield size={16} className="text-purple-400" />,
              content: 'Physical training and dietary modifications carry inherent risks of injury or health complications. Consult a licensed medical practitioner before beginning any workout split or nutrition target. Under no circumstances shall Life Gym, its developers, or coaches be held liable for injuries, medical emergencies, health issues, or damages resulting from the use or misuse of instructions provided in this application.',
            },
          ],
        };
      case 'cookies':
        return {
          title: 'Cookie & Storage Policy',
          icon: <Cookie className="text-amber-400 w-6 h-6" />,
          sections: [
            {
              title: '1. LocalStorage & Authentication Cookies',
              icon: <Cookie size={16} className="text-amber-400" />,
              content: 'We use localStorage to securely persist your Supabase user session token. This prevents you from being logged out every time you close the tab or browser, ensuring a seamless experience.',
            },
            {
              title: '2. PWA Caching & Performance',
              icon: <Cpu size={16} className="text-amber-400" />,
              content: 'As a Progressive Web App (PWA), we cache app assets (CSS, JS, icons) and offline targets locally. This allows the application to load instantly, work under poor network conditions, and preserve battery life.',
            },
            {
              title: '3. Zero Third-Party Tracking',
              icon: <Shield size={16} className="text-amber-400" />,
              content: 'We respect your privacy. We do not use third-party cookies, advertising tracking pixels, or data collection scripts that follow you across the web. All stored local data is strictly functional and necessary for app operations.',
            },
          ],
        };
    }
  };

  const details = getContent();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-[360px] max-h-[80vh] bg-[#0c0e15] border border-gray-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-800 bg-[#121620]/80 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            {details.icon}
            <h3 className="font-extrabold text-white text-md tracking-tight uppercase">
              {details.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar select-text text-sm">
          {details.sections.map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              <h4 className="font-bold text-gray-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                {sec.icon}
                {sec.title}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed pl-5">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#0d0f17] flex justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
