import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudSun, Gift, Map, Sparkles, Sprout } from 'lucide-react';
import { authService } from '../services/authService';
import { AlertModal } from './AlertModal';
import { AlertType } from '../lib/alertEmitter';
import { FARMLY_LOGO_ALT, FARMLY_LOGO_SRC, SERVICE_NAME, SERVICE_TAGLINE } from '../brand';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

const FEATURE_CHIPS = [
  { icon: Sprout, label: '나무 키우기', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { icon: Map, label: '영주 탐험', color: 'text-sky-600 bg-sky-50 border-sky-100' },
  { icon: Gift, label: '실물 보상', color: 'text-rose-600 bg-rose-50 border-rose-100' },
];

export const LoginView: React.FC<LoginViewProps> = () => {
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState<{ message: string; emoji: string; type: AlertType } | null>(null);

  const showLocalAlert = (message: string, emoji: string, type: AlertType) => {
    setAlertState({ message, emoji, type });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      // Redirect login navigates away, which avoids popup window.closed COOP warnings.
    } catch {
      setLoading(false);
      showLocalAlert('로그인 중 오류가 발생했어요.\n잠시 후 다시 시도해주세요.', '⚠️', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[500] mx-auto max-w-md overflow-hidden bg-[#fff1d6]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,107,107,0.30),transparent_30%),radial-gradient(circle_at_82%_72%,rgba(82,196,138,0.24),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.75)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.75)_1px,transparent_1px)] bg-[length:26px_26px] opacity-[0.35]" />

      <motion.div animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-7 top-16 text-4xl opacity-20">
        🍎
      </motion.div>
      <motion.div animate={{ y: [0, 10, 0], rotate: [5, -4, 5] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-8 top-28 text-3xl opacity-20">
        🌱
      </motion.div>
      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-28 left-9 text-3xl opacity-20">
        🧺
      </motion.div>

      <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45 }} className="text-center">
          <div className="relative mx-auto mb-4 h-44 w-44">
            <motion.div
              animate={{ rotate: [0, 2, -2, 0], y: [0, -5, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-[2.5rem] border-4 border-white bg-white/72 p-1.5 shadow-[0_18px_40px_rgba(255,107,107,0.24)] backdrop-blur-sm"
            >
              <img src={FARMLY_LOGO_SRC} alt={FARMLY_LOGO_ALT} className="h-full w-full object-contain object-center drop-shadow-sm" />
            </motion.div>
            <div className="absolute -right-4 top-3 rounded-2xl border-4 border-white bg-yeoju-gold px-3 py-1 text-xs font-black text-white shadow-lg">
              영주가 간다
            </div>
          </div>

          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white px-3 py-1 text-[11px] font-black text-apple-green shadow-sm">
            <Sparkles size={13} />
            영주 사과 모험 시작
          </div>

          <h1 className="mb-1 text-[34px] font-black leading-tight tracking-tight text-stone-900">
            {SERVICE_NAME}
          </h1>
          <p className="mx-auto mb-3 max-w-[17rem] text-xs font-black uppercase tracking-[0.16em] text-apple-red">
            Grow. Travel. Harvest.
          </p>
          <p className="mx-auto mb-4 max-w-[18rem] text-sm font-bold leading-relaxed text-stone-600">
            {SERVICE_TAGLINE}
          </p>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {FEATURE_CHIPS.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                className={`rounded-2xl border-2 px-2 py-3 ${feature.color}`}
              >
                <feature.icon className="mx-auto mb-1.5 h-5 w-5" />
                <p className="text-[10px] font-black">{feature.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_18px_36px_rgba(90,62,43,0.16)]">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-apple-light" />
            <div className="relative mb-4 flex items-center gap-3 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-apple-light text-apple-red">
                <CloudSun size={24} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-stone-300">Today Quest</p>
                <p className="text-sm font-black text-stone-700">첫 농가를 고르고 씨앗 심기</p>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-stone-200 bg-white py-4 text-sm font-black text-stone-800 shadow-[0_5px_0_0_#d9cbb7] transition-all active:translate-y-[5px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-apple-red" />
              ) : (
                <>
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google로 시작하기
                </>
              )}
            </button>
          </div>

          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-5 py-2.5 text-sm font-black text-white shadow-[0_8px_18px_rgba(249,199,79,0.40)]">
            <Gift size={16} />
            신규 회원 5,000P 지급
          </div>
          <p className="mt-3 text-[10px] font-bold text-stone-300">
            로그인 시 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </motion.div>
      </div>

      <AlertModal
        open={!!alertState}
        message={alertState?.message ?? ''}
        emoji={alertState?.emoji ?? '🍎'}
        type={alertState?.type ?? 'info'}
        onClose={() => setAlertState(null)}
      />
    </div>
  );
};
