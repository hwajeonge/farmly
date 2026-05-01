import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

const BASE_TABS = [
  { id: 'tree',    emoji: '🌳', label: '나의나무' },
  { id: 'map',     emoji: '🗺️', label: '영주지도' },
  { id: 'activity',emoji: '🎮', label: '활동'     },
  { id: 'profile', emoji: '👤', label: '마이'     },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isAdmin }) => {
  const tabs = isAdmin
    ? [...BASE_TABS, { id: 'admin', emoji: '🛡️', label: '관리자' }]
    : BASE_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-stone-100 px-3 pb-safe-area-inset-bottom z-50 max-w-md mx-auto w-full shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center pt-2 pb-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 flex-1 relative py-1 min-w-0"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-apple-red rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <motion.span
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="text-xl leading-none block"
                style={{ filter: isActive ? 'none' : 'grayscale(60%) opacity(0.65)' }}
              >
                {tab.emoji}
              </motion.span>
              <span className={cn(
                'text-[9px] font-black transition-colors leading-tight',
                isActive ? 'text-apple-red' : 'text-stone-400'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
