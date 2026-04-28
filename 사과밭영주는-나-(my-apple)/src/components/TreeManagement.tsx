import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Sun, AlertTriangle, CloudRain, ThermometerSun, Zap, Shield, Pill, Calendar, Apple, ShoppingBag, Send, Trash2 } from 'lucide-react';
import { TreeState, WeatherEvent, PestType } from '../types';
import { GROWTH_STAGES_NEW } from '../constants';
import { getTreeMessage } from '../services/geminiService';
import { cn } from '../lib/utils';

import { calculateDailyGrowth, calculateHarvestAmount, getPestEvent, getWeatherEvent, getDailyStatusMessage } from '../services/growthService';

interface TreeManagementProps {
  tree: TreeState;
  onAction: (action: 'water' | 'nutrient' | 'medicine'| 'shield') => void;
  onAdvanceDay?: () => void;
  onDeleteTree?: () => void;
  inventory: { id: string; count: number }[];
  onGoToStore: () => void;
}

export const TreeManagement: React.FC<TreeManagementProps> = ({ tree, onAction, onAdvanceDay, onDeleteTree, inventory, onGoToStore }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [weather] = useState<{message: string, type: string}>({ message: '영주는 오늘 맑음!', type: 'sunny' });

  const dailyStatus = getDailyStatusMessage(tree.currentDay);

  const fetchMessage = async (userInput?: string) => {
    if (userInput) setChatLoading(true);
    else setLoading(true);
    
    // Pass user input to get a direct reply if provided
    const msg = await getTreeMessage(tree.nickname, tree.personality, tree.growthStage, weather.message, userInput);
    setMessage(msg);
    
    setLoading(false);
    setChatLoading(false);
    if (userInput) setChatInput("");
  };

  useEffect(() => {
    fetchMessage();
  }, [tree.growthStage, tree.currentDay]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    fetchMessage(chatInput);
  };

  const getStageIcon = () => {
    if (tree.isGolden) return '🌟';
    
    const allStages = [
      ...GROWTH_STAGES_NEW.SPRING.stages,
      ...GROWTH_STAGES_NEW.SUMMER.stages,
      ...GROWTH_STAGES_NEW.AUTUMN.stages,
      ...GROWTH_STAGES_NEW.WINTER.stages
    ].sort((a, b) => b.day - a.day);

    const activeStage = allStages.find(s => tree.currentDay >= s.day);
    return activeStage?.icon || '🌰';
  };

  const getPestInfo = (type: PestType) => {
    switch(type) {
      case 'aphids': return { label: '진딧물', icon: '🐛', color: 'text-orange-500' };
      case 'leaf_blight': return { label: '잎마름병', icon: '🍂', color: 'text-yellow-700' };
      case 'bug_invasion': return { label: '벌레 침입', icon: '🐞', color: 'text-red-500' };
      default: return null;
    }
  };

  const pestInfo = getPestInfo(tree.pestStatus);
  const getItemCount = (id: string) => inventory.find(i => i.id === id)?.count || 0;

  return (
    <div className="py-2 space-y-6">
      <div className="flex justify-between items-end px-2">
        <div>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">성장 타임라인</p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black text-stone-800">DAY {tree.currentDay}</h2>
            <span className="text-xs font-black px-2 py-1 bg-stone-100 rounded-lg text-stone-500">/ 30</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <button 
            onClick={onDeleteTree}
            className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-400 active:scale-90 transition-all border-2 border-red-100"
            title="나무 제거"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={onGoToStore}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-stone-100 text-yeoju-gold active:scale-95 transition-all"
          >
            <ShoppingBag size={18} strokeWidth={3} />
          </button>
          <div className="ml-2">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">현재 계절</p>
            <p className="text-sm font-black text-apple-red">{tree.growthStage}</p>
          </div>
        </div>
      </div>

      <div className="px-2">
        <p className="text-xs font-black text-apple-green mb-2 ml-1">✨ {dailyStatus}</p>
        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(tree.currentDay / 30) * 100}%` }}
            className="h-full bg-apple-red"
          />
        </div>
      </div>

      <div className="relative flex flex-col items-center py-12 bg-white/40 rounded-[3rem] border-4 border-white shadow-inner">
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border-2 border-stone-50">
            <p className="text-[10px] font-black text-stone-300 uppercase tracking-tighter mb-1">나무 성격</p>
            <p className="text-xs font-black text-apple-green">{tree.personality}</p>
          </div>
          {pestInfo && (
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bg-red-50 px-4 py-2 rounded-2xl shadow-sm border-2 border-red-100 flex items-center gap-2"
            >
              <span className="text-sm">{pestInfo.icon}</span>
              <p className={cn("text-xs font-black", pestInfo.color)}>{pestInfo.label} 발생!</p>
            </motion.div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="speech-bubble mb-12 max-w-[85%] text-center"
        >
          {loading ? (
            <div className="flex gap-1 py-4 px-6">
              <div className="w-2 h-2 bg-stone-200 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-stone-200 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-stone-200 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="leading-relaxed font-medium">{message}</p>
              <form onSubmit={handleChatSubmit} className="relative flex items-center mt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`${tree.nickname}에게 말을 걸어보세요...`}
                  className="w-full bg-stone-50 border-2 border-stone-100 rounded-full px-4 py-2 text-xs focus:ring-2 focus:ring-apple-green focus:border-transparent outline-none transition-all pr-10"
                />
                <button 
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="absolute right-1 w-8 h-8 bg-apple-green text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all"
                >
                  {chatLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>

        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          <div className="absolute bottom-0 w-40 sm:w-48 h-10 sm:h-12 bg-stone-900/5 rounded-[100%] blur-xl" />
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [-1, 1, -1]
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="text-[10rem] sm:text-[12rem] relative z-10 select-none cursor-pointer drop-shadow-2xl"
            onClick={() => fetchMessage()}
          >
            {getStageIcon()}
          </motion.div>
        </div>

        <div className="w-full px-6 grid grid-cols-2 gap-4 mt-8 sm:mt-12">
          <div className="bg-white p-5 rounded-[2rem] border-2 border-stone-50 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-blue-500">
                <Droplets size={18} strokeWidth={3} />
                <span className="text-xs font-black">수분도</span>
              </div>
              <span className="text-xs font-black text-stone-300">{tree.water}%</span>
            </div>
            <div className="w-full bg-stone-50 h-4 rounded-full overflow-hidden p-1">
              <motion.div 
                animate={{ width: `${tree.water}%` }}
                className="h-full bg-blue-400 rounded-full"
              />
            </div>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border-2 border-stone-50 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-yeoju-gold">
                <Sun size={18} strokeWidth={3} />
                <span className="text-xs font-black">성장률</span>
              </div>
              <span className="text-xs font-black text-stone-300">{tree.growthRate}%</span>
            </div>
            <div className="w-full bg-stone-50 h-4 rounded-full overflow-hidden p-1">
              <motion.div 
                animate={{ width: `${tree.growthRate}%` }}
                className="h-full bg-yeoju-gold rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6 mt-12 overflow-x-auto pb-4 px-6 max-w-full no-scrollbar">
          <ActionButton 
            onClick={() => onAction('water')} 
            icon={<Droplets />} 
            label="물주기" 
            color="bg-blue-400" 
            badge="1일 1회"
          />
          <ActionButton 
            onClick={() => onAction('nutrient')} 
            icon={<Sun />} 
            label="영양제" 
            color="bg-yeoju-gold" 
            count={getItemCount('nutrient')}
            badge="시즌 2회"
          />
          <ActionButton 
            onClick={() => onAction('medicine')} 
            icon={<Pill />} 
            label="치료약" 
            color="bg-red-400" 
            count={getItemCount('medicine')}
          />
          <ActionButton 
            onClick={() => onAction('shield')} 
            icon={<Shield />} 
            label="방풍막" 
            color="bg-stone-500" 
            count={getItemCount('shield')}
          />
        </div>
      </div>

      {onAdvanceDay && (
        <button 
          onClick={onAdvanceDay}
          className="w-full py-4 bg-stone-800 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl active:translate-y-1 transition-all"
        >
          <Calendar size={18} />
          내일로 가기 (시뮬레이션)
        </button>
      )}
    </div>
  );
};

const ActionButton = ({ onClick, icon, label, color, count, badge }: { onClick: () => void, icon: React.ReactElement, label: string, color: string, count?: number, badge?: string }) => (
  <div className="flex flex-col items-center gap-2 min-w-[70px]">
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={cn(
          "w-16 h-16 rounded-3xl text-white flex items-center justify-center shadow-lg transition-all",
          color
        )}
      >
        {React.cloneElement(icon, { size: 28, strokeWidth: 3 } as any)}
      </motion.button>
      {count !== undefined && count > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
          {count}
        </div>
      )}
    </div>
    <div className="text-center">
      <p className="text-[10px] font-black text-stone-800 tracking-tight">{label}</p>
      {badge && <span className="text-[8px] font-bold text-stone-400">{badge}</span>}
    </div>
  </div>
);
