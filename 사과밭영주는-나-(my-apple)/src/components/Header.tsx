import React from 'react';

import { Heart, Bell } from 'lucide-react';

interface HeaderProps {
  userName: string;
  points: number;
  lives: number;
  unreadNotifications: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  userName, 
  points, 
  lives, 
  unreadNotifications, 
  onOpenNotifications 
}) => {
  return (
    <header className="px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b-4 border-stone-100 max-w-md mx-auto w-full">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg sm:text-xl font-black tracking-tighter text-apple-red flex items-center gap-1 truncate">
          🍎 사과밭영주는 나
        </h1>
        <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase tracking-widest truncate">My Apple in Yeongju</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
        <button 
          onClick={onOpenNotifications}
          className="relative p-2 bg-stone-100 rounded-xl hover:bg-stone-200 transition-all active:scale-95"
        >
          <Bell size={18} className="text-stone-500" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-apple-red text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {unreadNotifications}
            </span>
          )}
        </button>
        <div className="flex items-center gap-1 sm:gap-1.5 bg-apple-red/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl border-2 border-apple-red/20">
          <Heart size={12} fill="#ef4444" className="text-apple-red sm:w-[14px] sm:h-[14px]" />
          <span className="text-xs sm:text-sm font-black text-apple-red">{lives}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-yeoju-gold/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl border-2 border-yeoju-gold/20">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yeoju-gold rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white">P</div>
          <span className="text-xs sm:text-sm font-black text-yeoju-gold">{points.toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
};
