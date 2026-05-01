import React, { useState } from 'react';
import { motion } from 'motion/react';
import { authService } from '../services/authService';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('로그인 창이 닫혔어요. 다시 시도해 주세요 🙂');
      } else {
        setError('로그인 중 오류가 발생했어요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-warm-cream flex flex-col items-center justify-center p-6 max-w-md mx-auto overflow-hidden">

      {/* 배경 장식 요소 */}
      <div className="absolute top-12 left-6 text-5xl opacity-[0.08] animate-float select-none pointer-events-none">🍎</div>
      <div className="absolute top-24 right-8 text-3xl opacity-[0.08] animate-bounce-gentle select-none pointer-events-none" style={{ animationDelay: '0.8s' }}>🍏</div>
      <div className="absolute bottom-24 left-8 text-4xl opacity-[0.08] animate-float select-none pointer-events-none" style={{ animationDelay: '1.2s' }}>🌳</div>
      <div className="absolute bottom-36 right-6 text-3xl opacity-[0.08] animate-bounce-gentle select-none pointer-events-none" style={{ animationDelay: '0.4s' }}>🌱</div>
      <div className="absolute top-1/2 left-2 text-2xl opacity-[0.06] animate-float-slow select-none pointer-events-none">🍂</div>
      <div className="absolute top-1/3 right-2 text-2xl opacity-[0.06] animate-float-slow select-none pointer-events-none" style={{ animationDelay: '2s' }}>🌸</div>

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full text-center relative z-10"
      >
        {/* 메인 로고 */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-28 h-28 bg-linear-to-br from-red-400 to-apple-dark rounded-[2.5rem] flex items-center justify-center text-6xl mx-auto mb-5 shadow-[0_10px_40px_rgba(255,107,107,0.35)] border-4 border-white"
        >
          🍎
        </motion.div>

        <h1 className="text-[28px] font-black mb-2 text-stone-800 tracking-tight">사과밭영주는 나</h1>
        <p className="text-stone-400 font-bold mb-7 text-sm leading-relaxed">
          나만의 사과나무를 키우고<br />영주를 특별하게 여행해요 🌿
        </p>

        {/* 특징 태그 */}
        <div className="flex gap-2 justify-center flex-wrap mb-7">
          {[
            { emoji: '🌱', text: '나무 키우기' },
            { emoji: '🗺️', text: '영주 여행'  },
            { emoji: '🎁', text: '실물 수확'  },
          ].map((f, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 * i + 0.3, type: 'spring', stiffness: 300 }}
              className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-xs font-black text-stone-700 border-2 border-stone-100 shadow-sm"
            >
              {f.emoji} {f.text}
            </motion.span>
          ))}
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white border-2 border-stone-100 rounded-[2rem] p-6 mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
          <p className="text-stone-600 font-bold mb-5 text-sm leading-relaxed">
            나만의 사과나무를 키우고<br />
            <span className="text-apple-red font-black">영주 여행의 특별한 혜택</span>을 누리세요!
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white text-stone-700 rounded-2xl font-black text-sm
                       shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]
                       active:scale-95 transition-all flex items-center justify-center gap-3
                       border-2 border-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-stone-200 border-t-apple-red rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 시작하기
              </>
            )}
          </button>

          {error && (
            <p className="mt-3 text-xs font-bold text-red-500 bg-red-50 px-4 py-2.5 rounded-xl text-center">
              {error}
            </p>
          )}
        </div>

        {/* 신규 혜택 배지 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center gap-2.5"
        >
          <div className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-yellow-400 to-orange-400 rounded-full shadow-[0_4px_14px_rgba(255,160,0,0.3)]">
            <span className="text-base">🎁</span>
            <span className="text-white text-sm font-black">신규 회원 5,000P 즉시 지급!</span>
          </div>
          <p className="text-[10px] font-bold text-stone-300">
            로그인 시 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
