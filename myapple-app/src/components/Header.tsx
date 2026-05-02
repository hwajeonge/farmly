import React from 'react';
import { Bell, Heart, Sparkles } from 'lucide-react';
import { FARMLY_LOGO_ALT, FARMLY_LOGO_SRC, SERVICE_NAME } from '../brand';

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
  onOpenNotifications,
}) => {
  return (
    <header className="sticky top-0 z-40 mx-auto flex w-full max-w-md items-center justify-between border-b-2 border-red-50 bg-white/92 px-4 py-3 shadow-[0_2px_16px_rgba(255,107,107,0.07)] backdrop-blur-lg">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-[#fff7e8] p-1 shadow-[0_4px_10px_rgba(255,107,107,0.20)]">
          <img src={FARMLY_LOGO_SRC} alt={FARMLY_LOGO_ALT} className="h-full w-full object-contain object-center" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-black leading-tight tracking-tight text-stone-800">
            {SERVICE_NAME}
          </h1>
          <p className="truncate text-[10px] font-bold text-warm-gray">
            {userName}님의 영주 사과나무 모험
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2.5 py-1.5">
          <Heart size={13} className="fill-red-400 text-red-400" />
          <span className="text-xs font-black leading-none text-red-500">{lives}</span>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-yellow-100 bg-yellow-50 px-2.5 py-1.5">
          <Sparkles size={13} className="text-yellow-600" />
          <span className="text-xs font-black leading-none text-yellow-700">{points.toLocaleString()}</span>
        </div>

        <button
          onClick={onOpenNotifications}
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 transition-all hover:bg-stone-200 active:scale-90"
          aria-label="알림 보기"
        >
          <Bell size={16} className="text-stone-500" />
          {unreadNotifications > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-apple-red text-[9px] font-black leading-none text-white">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
