import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertType } from '../lib/alertEmitter';
import { confirmEmitter, ConfirmOptions } from '../lib/confirmEmitter';

const TYPE_CONFIG: Record<AlertType, { bg: string; confirmBtn: string }> = {
  info:    { bg: 'bg-sky-50 border-sky-100',         confirmBtn: 'bg-sky-500 shadow-[0_4px_0_0_#0369a1]'     },
  success: { bg: 'bg-emerald-50 border-emerald-100', confirmBtn: 'bg-emerald-500 shadow-[0_4px_0_0_#059669]' },
  error:   { bg: 'bg-red-50 border-red-100',         confirmBtn: 'bg-apple-red shadow-[0_4px_0_0_#dc2626]'   },
  warning: { bg: 'bg-yellow-50 border-yellow-100',   confirmBtn: 'bg-yeoju-gold shadow-[0_4px_0_0_#b07a00]'  },
};

interface PendingConfirm {
  open: boolean;
  options: ConfirmOptions;
  resolve: ((value: boolean) => void) | null;
}

export const ConfirmModal: React.FC = () => {
  const [pending, setPending] = useState<PendingConfirm>({
    open: false,
    options: { message: '' },
    resolve: null,
  });

  useEffect(() => {
    confirmEmitter.on((options, resolve) => {
      setPending({ open: true, options, resolve });
    });
    return () => confirmEmitter.off();
  }, []);

  const handleClose = (value: boolean) => {
    pending.resolve?.(value);
    setPending(prev => ({ ...prev, open: false, resolve: null }));
  };

  const type = pending.options.type ?? 'warning';
  const cfg = TYPE_CONFIG[type];

  return (
    <AnimatePresence>
      {pending.open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]"
            onClick={() => handleClose(false)}
          />

          <div className="fixed inset-0 z-[61] flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className={`pointer-events-auto w-72 rounded-[2rem] p-7 text-center shadow-2xl border-2 ${cfg.bg}`}
            >
              <motion.p
                initial={{ scale: 0.3, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 500, damping: 18 }}
                className="text-5xl mb-4 select-none"
              >
                {pending.options.emoji ?? '⚠️'}
              </motion.p>

              <p className="text-sm font-bold text-stone-700 leading-relaxed mb-6 whitespace-pre-line">
                {pending.options.message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 py-3 rounded-2xl font-black text-sm text-stone-500 bg-white border-2 border-stone-200 shadow-[0_4px_0_0_#d6d3d1] active:shadow-none active:translate-y-1 transition-all"
                >
                  {pending.options.cancelText ?? '취소'}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`flex-1 py-3 text-white rounded-2xl font-black text-sm active:shadow-none active:translate-y-1 transition-all ${cfg.confirmBtn}`}
                >
                  {pending.options.confirmText ?? '확인'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
