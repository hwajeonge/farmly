import React from 'react';
import { MapPin, TreeDeciduous, User, ShieldCheck, Gamepad2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isAdmin }) => {
  const tabs = [
    { id: 'tree', icon: TreeDeciduous, label: '나의나무' },
    { id: 'map', icon: MapPin, label: '영주지도' },
    { id: 'activity', icon: Gamepad2, label: '활동' },
    { id: 'profile', icon: User, label: '마이' },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', icon: ShieldCheck, label: '관리자' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-stone-100 px-2 sm:px-4 py-2 sm:py-3 z-50 max-w-md mx-auto w-full">
      <div className="flex justify-between items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 sm:gap-1 transition-all flex-1 min-w-0",
              activeTab === tab.id ? "text-apple-red scale-105 sm:scale-110" : "text-stone-400 hover:text-stone-600"
            )}
          >
            <tab.icon size={18} className="sm:w-[22px] sm:h-[22px]" strokeWidth={activeTab === tab.id ? 3 : 2} />
            <span className="text-[8px] sm:text-[9px] font-black truncate w-full text-center px-0.5">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};
