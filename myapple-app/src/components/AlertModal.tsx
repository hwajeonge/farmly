import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertType } from '../lib/alertEmitter';

interface AlertModalProps {
  open: boolean;
  message: string;
  emoji: string;
  type: AlertType;
  onClose: () => void;
}

const TYPE_CONFIG: Record<AlertType, { bg: string; btn: string }> = {
  info:    { bg: 'bg-sky-50 border-sky-100',         btn: 'bg-sky-500 shadow-[0_4px_0_0_#0369a1]'        },
  success: { bg: 'bg-emerald-50 border-emerald-100', btn: 'bg-emerald-500 shadow-[0_4px_0_0_#059669]'    },
  error:   { bg: 'bg-red-50 border-red-100',         btn: 'bg-apple-red shadow-[0_4px_0_0_#dc2626]'      },
  warning: { bg: 'bg-yellow-50 border-yellow-100',   btn: 'bg-yeoju-gold shadow-[0_4px_0_0_#b07a00]'     },
};

export const AlertModal: React.FC<AlertModalProps> = ({ open, message, emoji, type, onClose }) => {
  const cfg = TYPE_CONFIG[type];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 배경 dimmer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]"
            onClick={onClose}
          />

          {/* 모달 카드 */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className={`pointer-events-auto w-72 rounded-[2rem] p-7 text-center shadow-2xl border-2 ${cfg.bg}`}
            >
              {/* 이모지 */}
              <motion.p
                initial={{ scale: 0.3, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 500, damping: 18 }}
                className="text-5xl mb-4 select-none"
              >
                {emoji}
              </motion.p>

              {/* 메시지 */}
              <p className="text-sm font-bold text-stone-700 leading-relaxed mb-6 whitespace-pre-line">
                {message}
              </p>

              {/* 확인 버튼 */}
              <button
                onClick={onClose}
                className={`w-full py-3 text-white rounded-2xl font-black text-sm active:shadow-none active:translate-y-1 transition-all ${cfg.btn}`}
              >
                확인
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
