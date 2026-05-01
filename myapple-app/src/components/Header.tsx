import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  userName: string;
  points: number;
  lives: number;
  unreadNotifications: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  points,
  lives,
  unreadNotifications,
  onOpenNotifications,
}) => {
  return (
    <header className="px-4 py-3 flex justify-between items-center bg-white/90 backdrop-blur-lg sticky top-0 z-40 border-b-2 border-red-50 max-w-md mx-auto w-full shadow-[0_2px_16px_rgba(255,107,107,0.07)]">
      {/* 로고 */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-9 h-9 bg-linear-to-br from-red-400 to-apple-red rounded-[14px] flex items-center justify-center text-lg shadow-[0_3px_8px_rgba(255,107,107,0.35)] shrink-0">
          🍎
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] font-black tracking-tight text-stone-800 leading-tight truncate">
            사과밭영주는 나
          </h1>
          <p className="text-[9px] text-warm-gray font-bold truncate">나만의 사과나무를 키워요 🌱</p>
        </div>
      </div>

      {/* 상태 표시 */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 하트 */}
        <div className="flex items-center gap-1 bg-red-50 px-2.5 py-1.5 rounded-full border border-red-100">
          <span className="text-xs leading-none">❤️</span>
          <span className="text-xs font-black text-red-500 leading-none">{lives}</span>
        </div>

        {/* 포인트 */}
        <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1.5 rounded-full border border-yellow-100">
          <span className="text-xs leading-none">🪙</span>
          <span className="text-xs font-black text-yellow-600 leading-none">{points.toLocaleString()}</span>
        </div>

        {/* 알림 */}
        <button
          onClick={onOpenNotifications}
          className="relative w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-stone-200"
        >
          <Bell size={15} className="text-stone-500" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-apple-red text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white leading-none">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
