import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-400" />,
          accentColor: 'border-red-500/20 bg-red-500/10',
          btnColor: 'bg-red-600 hover:bg-red-500 shadow-red-600/10'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          accentColor: 'border-amber-500/20 bg-amber-500/10',
          btnColor: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/10'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          accentColor: 'border-emerald-500/20 bg-emerald-500/10',
          btnColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-400" />,
          accentColor: 'border-blue-500/20 bg-blue-500/10',
          btnColor: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/10'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-sm bg-[#0d1220] border border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl relative"
      >
        {/* Header Icon + Title */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${styles.accentColor}`}>
            {styles.icon}
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">{title}</h3>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider mt-0.5">Confirmation Required</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-[11px] text-gray-400 leading-relaxed font-medium pt-1">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-900 border border-gray-850 hover:bg-gray-800 text-gray-300 py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-98 cursor-pointer text-center"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all shadow-lg active:scale-98 cursor-pointer text-center ${styles.btnColor}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
