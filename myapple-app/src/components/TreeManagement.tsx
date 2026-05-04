import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, Droplets, Leaf, PackageOpen, Pill, Send, Shield, ShoppingBag, Sprout, Trash2 } from 'lucide-react';
import { PestType, TreeState } from '../types';
import { getTreeMessage } from '../services/geminiService';
import { cn } from '../lib/utils';
import { getDailyStatusMessage, getGrowthWeatherSummary, getWeatherEvent } from '../services/growthService';

interface TreeManagementProps {
  tree: TreeState;
  onAction: (action: 'water' | 'nutrient' | 'medicine' | 'shield') => void;
  onAdvanceDay?: () => void;
  onDeleteTree?: () => void;
  inventory: { id: string; count: number }[];
  onGoToStore: () => void;
  onOpenHarvestModal: () => void;
  onPlantNextTree: () => void;
  onViewTreeCards: () => void;
}

const STAGE_VISUALS = [
  { maxDay: 1, icon: '🌰', label: '씨앗' },
  { maxDay: 4, icon: '🌱', label: '새싹' },
  { maxDay: 7, icon: '🌿', label: '발아기' },
  { maxDay: 10, icon: '🌸', label: '개화기' },
  { maxDay: 14, icon: '🍏', label: '착과기' },
  { maxDay: 23, icon: '🍎', label: '착색기' },
  { maxDay: 30, icon: '🧺', label: '수확기' },
];

const getPestInfo = (type: PestType) => {
  switch (type) {
    case 'aphids':
      return { label: '진딧물 발생', icon: '⚠️', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
    case 'leaf_blight':
      return { label: '잎마름병 주의', icon: '🍂', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' };
    case 'bug_invasion':
      return { label: '벌레 침입', icon: '🪲', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
    default:
      return null;
  }
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const TreeManagement: React.FC<TreeManagementProps> = ({
  tree,
  onAction,
  onAdvanceDay,
  onDeleteTree,
  inventory,
  onGoToStore,
  onOpenHarvestModal,
  onPlantNextTree,
  onViewTreeCards,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const isSeasonEnded = tree.growthStage === '시즌종료';
  const weatherEvent = isSeasonEnded ? null : getWeatherEvent(tree.currentDay);
  const weatherSummary = isSeasonEnded ? '30일 성장 주기를 마친 나무예요.' : getGrowthWeatherSummary(tree.currentDay);
  const dailyStatus = isSeasonEnded ? '수확 완료! 땅 정리와 다음 시즌 준비 단계예요.' : getDailyStatusMessage(tree.currentDay);
  const stageVisual = isSeasonEnded
    ? { icon: '📦', label: '수확완료' }
    : STAGE_VISUALS.find((stage) => tree.currentDay <= stage.maxDay) ?? STAGE_VISUALS[STAGE_VISUALS.length - 1];
  const pestInfo = getPestInfo(tree.pestStatus);
  const dayProgress = clampPercent((tree.currentDay / 30) * 100);
  const growthProgress = clampPercent(tree.growthRate);
  const seedCount = inventory
    .filter((item) => item.id.startsWith('seed_'))
    .reduce((total, item) => total + item.count, 0);

  const nextGoal = useMemo(() => {
    if (isSeasonEnded) return seedCount > 0 ? '나무 카드를 보관하고 새 씨앗을 심어 다음 30일을 시작하기' : '나무 카드를 보관하고 상점에서 다음 씨앗 준비하기';
    if (tree.currentDay < 7) return 'Day 7까지 성장률 30%와 병충해 없음 달성하기';
    if (tree.currentDay < 14) return 'Day 14까지 성장률 60%와 병충해 없음 달성하기';
    if (tree.currentDay < 21) return 'Day 21까지 성장률 90%를 만들어 수확기로 전환하기';
    if (tree.currentDay < 30) return '수확, 배송, 휴식, 땅 정리 단계를 마무리하기';
    return '수확 결과를 확인하고 실물 보상으로 연결하기';
  }, [isSeasonEnded, seedCount, tree.currentDay]);

  const fetchMessage = async (userInput?: string) => {
    if (isSeasonEnded && !userInput) {
      setMessage(`${tree.nickname}의 30일 시즌이 끝났어요. 나무 카드는 보관함에 저장됐고, 이제 수확 보상 신청이나 새 씨앗 심기를 이어갈 수 있어요.`);
      return;
    }

    if (userInput) setChatLoading(true);
    else setLoading(true);

    const weatherMessage = weatherEvent?.message ?? weatherSummary;
    const msg = await getTreeMessage(tree.nickname, tree.personality, tree.growthStage, weatherMessage, userInput);

    setMessage(msg || `${tree.nickname}이(가) 오늘도 자라고 있어요. 물주기와 관광 미션 보상으로 성장을 도와주세요.`);
    setLoading(false);
    setChatLoading(false);
    if (userInput) setChatInput('');
  };

  useEffect(() => {
    fetchMessage();
  }, [tree.growthStage, tree.currentDay]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    fetchMessage(chatInput);
  };

  const getItemCount = (id: string) => inventory.find(i => i.id === id)?.count ?? 0;

  return (
    <div className="space-y-5 py-3">
      <section className="overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-apple-light via-white to-yeoju-light p-4 shadow-[0_10px_30px_rgba(255,107,107,0.10)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-apple-red">Apple Tree Quest</p>
            <div className="mt-1 flex items-baseline gap-2">
              <h2 className="text-3xl font-black text-stone-900">Day {tree.currentDay}</h2>
              <span className="text-xs font-black text-stone-400">/ 30</span>
            </div>
            <p className="mt-1 text-xs font-bold text-apple-green">{dailyStatus}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onGoToStore}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-yellow-100 bg-yellow-50 text-yeoju-gold transition-all active:scale-90"
              aria-label="상점으로 이동"
            >
              <ShoppingBag size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={onDeleteTree}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-red-100 bg-red-50 text-red-400 transition-all active:scale-90"
              aria-label="나무 제거"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border-2 border-white bg-white/70 p-3">
          <div className="mb-2 flex justify-between text-[10px] font-black text-stone-400">
            <span>시즌 진행</span>
            <span>{dayProgress}%</span>
          </div>
          <div className="progress-track h-3">
            <motion.div className="progress-red h-full" animate={{ width: `${dayProgress}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[9px] font-bold text-stone-400">
            <span>씨앗</span>
            <span>꽃</span>
            <span>수확</span>
            <span>정리</span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.25rem] border-4 border-white bg-white p-5 shadow-[0_8px_28px_rgba(90,62,43,0.08)]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <div className="rounded-2xl border-2 border-stone-50 bg-stone-50 px-3 py-1.5">
              <p className="text-[9px] font-black uppercase tracking-wide text-stone-300">성격</p>
              <p className="text-xs font-black text-apple-green">{tree.personality}</p>
            </div>
            {pestInfo && !isSeasonEnded && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={cn('flex items-center gap-1.5 rounded-2xl border-2 px-3 py-1.5', pestInfo.bg)}
              >
                <span className="text-sm">{pestInfo.icon}</span>
                <p className={cn('text-[11px] font-black', pestInfo.color)}>{pestInfo.label}</p>
              </motion.div>
            )}
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-1.5 text-right shrink-0">
            <p className="text-[9px] font-black uppercase tracking-wide text-stone-400">단계</p>
            <p className="text-xs font-black text-apple-red">{stageVisual.label}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="speech-bubble mx-auto mb-4 w-full text-center"
        >
          {loading ? (
            <div className="flex justify-center gap-1.5 px-6 py-3">
              {[0, 0.2, 0.4].map((delay) => (
                <div key={delay} className="h-2 w-2 animate-bounce rounded-full bg-stone-200" style={{ animationDelay: `${delay}s` }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium leading-relaxed text-stone-600">{message}</p>
              {!isSeasonEnded && (
                <form onSubmit={handleChatSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`${tree.nickname}에게 말 걸기`}
                    className="w-full rounded-full border-2 border-stone-100 bg-stone-50 px-4 py-2 pr-10 text-xs font-bold outline-none transition-all placeholder:text-stone-300 focus:border-apple-green focus:bg-white focus:ring-2 focus:ring-apple-green/20"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="absolute right-1 flex h-7 w-7 items-center justify-center rounded-full bg-apple-green text-white transition-all active:scale-90 disabled:opacity-40"
                    aria-label="나무에게 메시지 보내기"
                  >
                    {chatLoading ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Send size={13} />}
                  </button>
                </form>
              )}
            </div>
          )}
        </motion.div>

        <div className="relative flex h-56 items-center justify-center">
          <div className="absolute bottom-4 h-9 w-40 rounded-[100%] bg-stone-900/5 blur-xl" />
          <motion.button
            type="button"
            animate={{ scale: [1, 1.04, 1], rotate: [-1, 1, -1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="relative z-10 text-[8.5rem] drop-shadow-2xl"
            onClick={() => fetchMessage()}
            aria-label="나무와 대화하기"
          >
            {stageVisual.icon}
          </motion.button>
          {tree.isGolden && (
            <div className="absolute right-3 top-2 z-20 rounded-full bg-yellow-400 px-2 py-1 text-[10px] font-black text-white shadow-lg">
              황금나무
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatusCard icon={<Droplets size={17} />} label="수분" value={clampPercent(tree.water)} fillClass="progress-blue" />
          <StatusCard icon={<Leaf size={17} />} label="성장률" value={growthProgress} fillClass="progress-gold" />
        </div>
      </section>

      <section className="rounded-[2rem] border-2 border-apple-green/10 bg-white p-4 shadow-[0_8px_24px_rgba(90,62,43,0.06)]">
        <div className="mb-3 flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-apple-green/10 text-apple-green">
            <Calendar size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-apple-green">Tree Status</p>
            <h3 className="text-sm font-black text-stone-800">오늘의 나무 상태</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoCard title="다음 목표" value={nextGoal} tone="green" />
          <InfoCard title={isSeasonEnded ? '수확 결과' : '영주 날씨'} value={isSeasonEnded ? `${tree.harvestedApples ?? 0}개의 사과를 수확했어요.` : weatherEvent?.message ?? weatherSummary} tone="blue" />
        </div>
      </section>

      {isSeasonEnded ? (
        <SeasonEndPanel
          harvestedApples={tree.harvestedApples ?? 0}
          seedCount={seedCount}
          onOpenHarvestModal={onOpenHarvestModal}
          onGoToStore={onGoToStore}
          onPlantNextTree={onPlantNextTree}
          onViewTreeCards={onViewTreeCards}
        />
      ) : (
        <>
          <section className="rounded-[2rem] border-2 border-stone-100 bg-white p-4 shadow-[0_8px_24px_rgba(90,62,43,0.06)]">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-apple-red">Care Action</p>
                <h3 className="text-sm font-black text-stone-800">오늘의 돌봄 액션</h3>
              </div>
              <button
                onClick={onGoToStore}
                className="flex items-center gap-1.5 rounded-full bg-apple-red px-3 py-1.5 text-[11px] font-black text-white shadow-[0_3px_0_0_#d32f2f] transition-all active:translate-y-0.5 active:shadow-none"
                aria-label="상점에서 돌봄 아이템 사러가기"
              >
                <ShoppingBag size={13} /> 아이템 사러가기
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ActionCard onClick={() => onAction('water')} icon={<Droplets size={24} />} label="물주기" sublabel="하루 1회 성장 +5%" color="sky" />
              <ActionCard onClick={() => onAction('nutrient')} icon={<Leaf size={24} />} label="영양제" sublabel={`시즌 2회 · ${getItemCount('nutrient')}개 보유`} color="green" count={getItemCount('nutrient')} />
              <ActionCard onClick={() => onAction('medicine')} icon={<Pill size={24} />} label="치료약" sublabel={`병충해 치료 · ${getItemCount('medicine')}개`} color="red" count={getItemCount('medicine')} />
              <ActionCard onClick={() => onAction('shield')} icon={<Shield size={24} />} label="방풍막" sublabel={`폭염 방어 · ${getItemCount('shield')}개`} color="stone" count={getItemCount('shield')} />
            </div>
          </section>

          {onAdvanceDay && (
            <button
              onClick={onAdvanceDay}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-800 py-3.5 text-sm font-black text-white shadow-[0_4px_0_0_#1c1c1c] transition-all active:translate-y-1 active:shadow-none"
            >
              <Calendar size={16} />
              다음 날로 진행
            </button>
          )}
        </>
      )}
    </div>
  );
};

const SeasonEndPanel = ({
  harvestedApples,
  seedCount,
  onOpenHarvestModal,
  onGoToStore,
  onPlantNextTree,
  onViewTreeCards,
}: {
  harvestedApples: number;
  seedCount: number;
  onOpenHarvestModal: () => void;
  onGoToStore: () => void;
  onPlantNextTree: () => void;
  onViewTreeCards: () => void;
}) => (
  <section className="rounded-[2rem] border-4 border-white bg-stone-800 p-5 text-white shadow-xl">
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yeoju-gold text-2xl shadow-lg">
        🍎
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">Season Complete</p>
        <h3 className="text-lg font-black">수확이 완료됐어요</h3>
        <p className="mt-1 text-[11px] font-bold leading-relaxed text-white/65">
          30일을 마친 나무는 나무 카드로 보관됩니다. 이제 보상을 신청하거나 새 씨앗으로 다음 성장 루프를 시작해보세요.
        </p>
      </div>
    </div>

    <div className="mb-4 grid grid-cols-3 gap-2">
      <div className="rounded-2xl bg-white/10 p-3">
        <p className="text-[10px] font-black text-white/45">이번 수확</p>
        <p className="text-xl font-black">{harvestedApples}개</p>
      </div>
      <div className="rounded-2xl bg-white/10 p-3">
        <p className="text-[10px] font-black text-white/45">보유 씨앗</p>
        <p className="text-xl font-black">{seedCount}개</p>
      </div>
      <div className="rounded-2xl bg-white/10 p-3">
        <p className="text-[10px] font-black text-white/45">나무 카드</p>
        <p className="text-xl font-black">저장</p>
      </div>
    </div>

    <div className="space-y-2.5">
      <button
        onClick={seedCount > 0 ? onPlantNextTree : onGoToStore}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-apple-green py-3.5 text-sm font-black text-white shadow-[0_4px_0_0_#2d7a2d] transition-all active:translate-y-0.5 active:shadow-none"
      >
        {seedCount > 0 ? <Sprout size={16} /> : <ShoppingBag size={16} />}
        {seedCount > 0 ? '새 씨앗 심으러 가기' : '씨앗 구매하러 가기'}
      </button>
      <button
        onClick={onOpenHarvestModal}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-stone-900 transition-all active:scale-95"
      >
        <PackageOpen size={16} />
        수확 보상 배송 신청
      </button>
      <button
        onClick={onViewTreeCards}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-3.5 text-sm font-black text-white transition-all active:scale-95"
      >
        <CreditCard size={16} />
        나무 카드 보기
      </button>
    </div>
  </section>
);

const StatusCard = ({
  icon,
  label,
  value,
  fillClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  fillClass: string;
}) => (
  <div className="cute-card p-4">
    <div className="mb-2.5 flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-stone-700">
        {icon}
        <span className="text-xs font-black">{label}</span>
      </div>
      <span className="text-xs font-black text-stone-400">{value}%</span>
    </div>
    <div className="progress-track h-3">
      <motion.div animate={{ width: `${value}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} className={cn(fillClass, 'h-full')} />
    </div>
  </div>
);

const InfoCard = ({ title, value, tone }: { title: string; value: string; tone: 'green' | 'blue' }) => (
  <div className={cn(
    'min-h-[112px] rounded-2xl border-2 p-3 shadow-sm',
    tone === 'green' ? 'border-emerald-100 bg-emerald-50' : 'border-sky-100 bg-sky-50',
  )}>
    <p className={cn('mb-1 text-[10px] font-black uppercase tracking-wide', tone === 'green' ? 'text-emerald-600' : 'text-sky-600')}>
      {title}
    </p>
    <p className="text-[11px] font-bold leading-relaxed text-stone-600">{value}</p>
  </div>
);

const COLOR_MAP: Record<string, string> = {
  sky: 'bg-sky-50 border-sky-100 text-sky-600',
  green: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  red: 'bg-red-50 border-red-100 text-red-500',
  stone: 'bg-stone-50 border-stone-100 text-stone-500',
};

const ActionCard = ({
  onClick,
  icon,
  label,
  sublabel,
  color,
  count,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  count?: number;
}) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={cn('relative flex flex-col items-center gap-2 rounded-[1.5rem] border-2 p-4 transition-all active:opacity-80', COLOR_MAP[color] ?? COLOR_MAP.stone)}
  >
    {count !== undefined && count > 0 && (
      <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-apple-red text-[9px] font-black leading-none text-white">
        {count}
      </span>
    )}
    {icon}
    <div className="text-center">
      <p className="text-xs font-black text-stone-800">{label}</p>
      <p className="mt-0.5 text-[9px] font-bold text-stone-400">{sublabel}</p>
    </div>
  </motion.button>
);
