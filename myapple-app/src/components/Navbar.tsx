import React from 'react';
import { motion } from 'framer-motion';
import { Apple, MapPinned, ShieldCheck, Sprout, UserRound } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

const BASE_TABS = [
  { id: 'tree', icon: Sprout, label: '나무' },
  { id: 'map', icon: MapPinned, label: '영주지도' },
  { id: 'activity', icon: Apple, label: '미션' },
  { id: 'profile', icon: UserRound, label: '마이' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isAdmin }) => {
  const tabs = isAdmin
    ? [...BASE_TABS, { id: 'admin', icon: ShieldCheck, label: '관리' }]
    : BASE_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-md border-t-2 border-stone-100 bg-white/95 px-3 pb-safe-area-inset-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-lg">
      <div className="flex items-center justify-around pb-3 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex min-w-0 flex-1 flex-col items-center gap-1 py-1"
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-apple-red"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <motion.div
                animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-2xl border-2 transition-colors',
                  isActive
                    ? 'border-red-100 bg-red-50 text-apple-red'
                    : 'border-transparent bg-transparent text-stone-400',
                )}
              >
                <Icon size={19} strokeWidth={2.5} />
              </motion.div>
              <span className={cn(
                'text-[9px] font-black leading-tight transition-colors',
                isActive ? 'text-apple-red' : 'text-stone-400',
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
