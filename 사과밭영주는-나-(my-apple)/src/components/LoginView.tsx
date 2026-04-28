import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, LogIn, UserPlus, CheckCircle2, ChevronRight } from 'lucide-react';
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
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('로그인 팝업이 닫혔습니다. 다시 시도해주세요.');
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-white flex flex-col items-center justify-center p-6 sm:p-10 max-w-md mx-auto">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full text-center"
      >
        <div className="w-24 h-24 bg-apple-red/10 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
          🍎
        </div>
        <h1 className="text-4xl font-black mb-3 tracking-tighter text-stone-800">영주 사과 농장</h1>
        <p className="text-stone-400 font-bold mb-12 text-lg">지속가능한 순환 농업의 시작</p>

        <div className="bg-stone-50 border-4 border-stone-100 rounded-[2.5rem] p-8 mb-10">
          <p className="text-stone-600 font-black mb-6 leading-relaxed">
            나만의 사과나무를 키우고<br />
            영주 여행의 특별한 혜택을 누리세요!
          </p>
          
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-5 bg-white text-stone-700 rounded-3xl font-black text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-stone-100 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-stone-200 border-t-apple-red rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google 계정으로 시작하기
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 text-sm font-bold text-red-500">{error}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 items-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-yeoju-gold/10 rounded-full">
            <span className="text-yeoju-gold text-sm font-black">🎁 신규 회원 5,000P 즉시 지급</span>
          </div>
          <p className="text-xs font-bold text-stone-300">
            로그인 시 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
