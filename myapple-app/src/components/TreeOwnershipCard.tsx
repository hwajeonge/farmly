import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, Info, Calendar, MapPin, Star, Apple, Droplets, TrendingUp, Sparkles, X, Users } from 'lucide-react';
import { TreeState, AppleVariety } from '../types';
import { cn } from '../lib/utils';

interface TreeOwnershipCardProps {
  tree: TreeState;
  ownerName: string;
  onClose?: () => void;
}

export const TreeOwnershipCard: React.FC<TreeOwnershipCardProps> = ({ tree, ownerName, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = tree.cardConfig?.theme || 'classic';

  const themeStyles = {
    classic: 'bg-white border-stone-200 text-stone-800 shadow-xl shadow-stone-200/50',
    neon: 'bg-gradient-to-br from-stone-900 to-blue-900 border-blue-500 text-white shadow-blue-500/20',
    nature: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 text-green-900 shadow-lg shadow-green-200/50',
  };

  const varietyIcons: Record<string, string> = {
    '부사': '🍎',
    '홍로': '🍎',
    '시나노골드': '🍏',
    '감홍': '🍏',
    '아오리': '🍏',
    '홍옥': '🍎'
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert('소유권 카드가 클립보드에 복사되었습니다!');
  };

  return (
    <div className="perspective-1000 w-full max-w-[320px] aspect-[2/3] relative mx-auto group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d"
      >
        {/* Front Side */}
        <div className={cn(
          "absolute w-full h-full backface-hidden rounded-[2.5rem] border-[6px] shadow-2xl p-6 flex flex-col items-center justify-between transition-colors",
          themeStyles[theme as keyof typeof themeStyles] || themeStyles.classic
        )}>
          <div className="absolute inset-2 border border-current opacity-10 rounded-[2rem] pointer-events-none" />
          
          <div className="w-full flex justify-between items-start z-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Apple Farmer Card</span>
              <h3 className="text-lg font-black leading-tight">{tree.nickname}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-xl">
              {varietyIcons[tree.variety] || '🍎'}
            </div>
          </div>

          <div className="relative w-full aspect-square bg-stone-50 rounded-2xl overflow-hidden border-2 border-stone-200/50 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
             <div className="absolute inset-0 flex items-center justify-center text-7xl select-none">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                  {tree.growthStage === '시즌종료' ? '🍎' : '🌳'}
                </motion.div>
             </div>
             <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-stone-100 flex items-center gap-1.5 shadow-sm text-stone-800">
               <TrendingUp size={12} className="text-apple-red" />
               <span className="text-[10px] font-black">{tree.growthStage}</span>
             </div>
             <div className="absolute top-3 left-3 bg-stone-800 text-white px-2 py-0.5 rounded flex items-center gap-1">
               <span className="text-[8px] font-black italic">DAY</span>
               <span className="text-xs font-black">{tree.currentDay}</span>
             </div>
          </div>

          <div className="w-full space-y-4 z-10">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/30 backdrop-blur-sm p-3 rounded-2xl border border-white/50">
                <p className="text-[8px] font-black opacity-60 uppercase mb-1">Variety</p>
                <p className="text-xs font-black truncate">{tree.variety}</p>
              </div>
              <div className="bg-white/30 backdrop-blur-sm p-3 rounded-2xl border border-white/50">
                <p className="text-[8px] font-black opacity-60 uppercase mb-1">ID</p>
                <p className="text-xs font-black italic">#{tree.id.slice(-4).toUpperCase()}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-apple-green" />
                <span>성장 {tree.growthRate}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets size={12} className="text-blue-500" />
                <span>수분 {tree.water}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className={cn(
          "absolute w-full h-full backface-hidden rounded-[2.5rem] border-[6px] shadow-2xl p-6 flex flex-col justify-between rotate-y-180 transition-colors",
          themeStyles[theme as keyof typeof themeStyles] || themeStyles.classic
        )}>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest">Ownership Details</h3>
              <Sparkles size={16} className="text-yeoju-gold" />
            </div>
            <div className="space-y-4">
              <DetailRow icon={Users} label="Owner" value={ownerName} />
              <DetailRow icon={MapPin} label="Location" value="영주시 농가마을" />
              <DetailRow icon={Calendar} label="Harvested" value={tree.harvestedApples ? `${tree.harvestedApples}개` : '-'} />
              <DetailRow icon={Apple} label="Status" value={tree.growthStage} />
            </div>
          </div>
          <div className="text-center pt-4 border-t border-current opacity-20">
             <p className="text-[8px] font-bold uppercase tracking-widest">Digital Certificate of Ownership</p>
          </div>
        </div>
      </motion.div>
      {onClose && (
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-stone-100 z-50"
        >
          <X size={20} className="text-stone-400" />
        </button>
      )}
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center">
      <Icon size={14} className="opacity-60" />
    </div>
    <div className="min-w-0">
      <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-black truncate">{value}</p>
    </div>
  </div>
);
