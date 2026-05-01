import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Sun, Shield, Pill, Calendar, ShoppingBag, Send, Trash2 } from 'lucide-react';
import { TreeState, WeatherEvent, PestType } from '../types';
import { GROWTH_STAGES_NEW } from '../constants';
import { getTreeMessage } from '../services/geminiService';
import { cn } from '../lib/utils';
import { calculateDailyGrowth, calculateHarvestAmount, getPestEvent, getWeatherEvent, getDailyStatusMessage } from '../services/growthService';

interface TreeManagementProps {
  tree: TreeState;
  onAction: (action: 'water' | 'nutrient' | 'medicine' | 'shield') => void;
  onAdvanceDay?: () => void;
  onDeleteTree?: () => void;
  inventory: { id: string; count: number }[];
  onGoToStore: () => void;
}

export const TreeManagement: React.FC<TreeManagementProps> = ({
  tree, onAction, onAdvanceDay, onDeleteTree, inventory, onGoToStore,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [weather] = useState({ message: '영주는 오늘 맑음!', type: 'sunny' });

  const dailyStatus = getDailyStatusMessage(tree.currentDay);

  const fetchMessage = async (userInput?: string) => {
    if (userInput) setChatLoading(true);
    else setLoading(true);
    const msg = await getTreeMessage(tree.nickname, tree.personality, tree.growthStage, weather.message, userInput);
    setMessage(msg);
    setLoading(false);
    setChatLoading(false);
    if (userInput) setChatInput('');
  };

  useEffect(() => { fetchMessage(); }, [tree.growthStage, tree.currentDay]);

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
      ...GROWTH_STAGES_NEW.WINTER.stages,
    ].sort((a, b) => b.day - a.day);
    return allStages.find(s => tree.currentDay >= s.day)?.icon || '🌰';
  };

  const getPestInfo = (type: PestType) => {
    switch (type) {
      case 'aphids':      return { label: '진딧물 발생!', icon: '🐛', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
      case 'leaf_blight': return { label: '잎마름병 발생!', icon: '🍂', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' };
      case 'bug_invasion':return { label: '벌레 침입!',   icon: '🐞', color: 'text-red-600',    bg: 'bg-red-50 border-red-200'       };
      default: return null;
    }
  };

  const pestInfo = getPestInfo(tree.pestStatus);
  const getItemCount = (id: string) => inventory.find(i => i.id === id)?.count ?? 0;
  const progress = Math.round((tree.currentDay / 30) * 100);

  return (
    <div className="py-2 space-y-5">

      {/* ── 상단 DAY 카운터 ── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-black text-warm-gray uppercase tracking-widest mb-0.5">성장 타임라인</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-stone-800">DAY {tree.currentDay}</span>
            <span className="text-xs font-black text-stone-300">/ 30</span>
          </div>
          <p className="text-[11px] font-bold text-apple-green mt-0.5">✨ {dailyStatus}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDeleteTree}
            className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 active:scale-90 transition-all border-2 border-red-100"
            title="나무 제거"
          >
            <Trash2 size={17} />
          </button>
          <button
            onClick={onGoToStore}
            className="w-10 h-10 bg-yellow-50 rounded-2xl flex items-center justify-center text-yeoju-gold active:scale-90 transition-all border-2 border-yellow-100"
          >
            <ShoppingBag size={17} strokeWidth={2.5} />
          </button>
          <div className="px-3 py-1.5 bg-apple-red/10 rounded-2xl border border-apple-red/20">
            <p className="text-[9px] font-black text-warm-gray uppercase tracking-wide mb-0.5 text-right">계절</p>
            <p className="text-xs font-black text-apple-red">{tree.growthStage}</p>
          </div>
        </div>
      </div>

      {/* ── 프로그레스 바 ── */}
      <div className="px-1">
        <div className="progress-track h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="progress-red h-full"
          />
        </div>
        <div className="flex justify-between mt-1 px-0.5">
          <span className="text-[9px] font-bold text-stone-300">발아기</span>
          <span className="text-[9px] font-black text-apple-red">{progress}%</span>
          <span className="text-[9px] font-bold text-stone-300">수확기</span>
        </div>
      </div>

      {/* ── 나무 메인 영역 ── */}
      <div className="relative flex flex-col items-center py-10 bg-white/60 rounded-[2.5rem] border-2 border-white shadow-[0_4px_24px_rgba(255,107,107,0.06)]">

        {/* 나무 성격 + 병해충 알림 */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-white px-3 py-1.5 rounded-2xl shadow-sm border-2 border-stone-50">
            <p className="text-[9px] font-black text-stone-300 uppercase tracking-wider mb-0.5">성격</p>
            <p className="text-xs font-black text-apple-green">{tree.personality}</p>
          </div>
          {pestInfo && (
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={cn('px-3 py-1.5 rounded-2xl border-2 flex items-center gap-1.5', pestInfo.bg)}
            >
              <span className="text-sm">{pestInfo.icon}</span>
              <p className={cn('text-[11px] font-black', pestInfo.color)}>{pestInfo.label}</p>
            </motion.div>
          )}
        </div>

        {/* 말풍선 */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="speech-bubble mb-10 max-w-[84%] text-center"
        >
          {loading ? (
            <div className="flex gap-1.5 py-3 px-6 justify-center">
              {[0, 0.2, 0.4].map((d) => (
                <div key={d} className="w-2 h-2 bg-stone-200 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="leading-relaxed text-sm font-medium text-stone-600">{message}</p>
              <form onSubmit={handleChatSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`${tree.nickname}에게 말 걸기...`}
                  className="w-full bg-stone-50 border-2 border-stone-100 rounded-full px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-apple-green/40 focus:border-apple-green outline-none transition-all pr-10 placeholder:text-stone-300"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="absolute right-1 w-7 h-7 bg-apple-green text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-all active:scale-90"
                >
                  {chatLoading
                    ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send size={13} />
                  }
                </button>
              </form>
            </div>
          )}
        </motion.div>

        {/* 나무 이모지 */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          <div className="absolute bottom-0 w-36 h-8 bg-stone-900/5 rounded-[100%] blur-xl" />
          <motion.div
            animate={{ scale: [1, 1.04, 1], rotate: [-1, 1, -1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="text-[9rem] sm:text-[10rem] relative z-10 select-none cursor-pointer drop-shadow-2xl"
            onClick={() => fetchMessage()}
          >
            {getStageIcon()}
          </motion.div>
        </div>

        {/* 수분도 / 성장률 카드 */}
        <div className="w-full px-5 grid grid-cols-2 gap-3 mt-8">
          <StatusCard
            icon="💧"
            label="수분도"
            value={tree.water}
            fillClass="progress-blue"
          />
          <StatusCard
            icon="☀️"
            label="성장률"
            value={tree.growthRate}
            fillClass="progress-gold"
          />
        </div>
      </div>

      {/* ── 케어 버튼 2×2 그리드 ── */}
      <div>
        <p className="text-xs font-black text-warm-gray mb-3 px-1">오늘의 나무 케어 🌿</p>
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            onClick={() => onAction('water')}
            emoji="💧"
            label="물주기"
            sublabel="1일 1회"
            color="sky"
          />
          <ActionCard
            onClick={() => onAction('nutrient')}
            emoji="🌿"
            label="영양제"
            sublabel={`시즌 2회 • ${getItemCount('nutrient')}개 보유`}
            color="green"
            count={getItemCount('nutrient')}
          />
          <ActionCard
            onClick={() => onAction('medicine')}
            emoji="💊"
            label="치료약"
            sublabel={`${getItemCount('medicine')}개 보유`}
            color="red"
            count={getItemCount('medicine')}
          />
          <ActionCard
            onClick={() => onAction('shield')}
            emoji="🛡️"
            label="방풍막"
            sublabel={`${getItemCount('shield')}개 보유`}
            color="stone"
            count={getItemCount('shield')}
          />
        </div>
      </div>

      {/* ── 시뮬레이션 버튼 ── */}
      {onAdvanceDay && (
        <button
          onClick={onAdvanceDay}
          className="w-full py-3.5 bg-stone-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_0_#1c1c1c] active:shadow-none active:translate-y-1 transition-all"
        >
          <Calendar size={16} />
          내일로 가기 (시뮬레이션)
        </button>
      )}
    </div>
  );
};

/* ── 상태 카드 ── */
const StatusCard = ({
  icon, label, value, fillClass,
}: { icon: string; label: string; value: number; fillClass: string }) => (
  <div className="cute-card p-4">
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-1.5">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-black text-stone-700">{label}</span>
      </div>
      <span className="text-xs font-black text-stone-400">{value}%</span>
    </div>
    <div className="progress-track h-3">
      <motion.div
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(fillClass, 'h-full')}
      />
    </div>
  </div>
);

/* ── 액션 카드 ── */
const COLOR_MAP: Record<string, string> = {
  sky:   'bg-sky-50 border-sky-100 hover:border-sky-300',
  green: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300',
  red:   'bg-red-50 border-red-100 hover:border-red-300',
  stone: 'bg-stone-50 border-stone-100 hover:border-stone-300',
};

const ActionCard = ({
  onClick, emoji, label, sublabel, color, count,
}: {
  onClick: () => void;
  emoji: string;
  label: string;
  sublabel: string;
  color: string;
  count?: number;
}) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={cn(
      'relative flex flex-col items-center gap-2 p-4 rounded-[1.5rem] border-2 transition-all active:opacity-80',
      COLOR_MAP[color] ?? COLOR_MAP.stone,
    )}
  >
    {count !== undefined && count > 0 && (
      <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-apple-red text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white leading-none">
        {count}
      </span>
    )}
    <span className="text-3xl">{emoji}</span>
    <div className="text-center">
      <p className="text-xs font-black text-stone-800">{label}</p>
      <p className="text-[9px] font-bold text-stone-400 mt-0.5">{sublabel}</p>
    </div>
  </motion.button>
);
