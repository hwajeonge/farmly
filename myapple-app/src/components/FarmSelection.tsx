import React, { useState } from 'react';
import { showAlert } from '../lib/alertEmitter';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Hammer, List, Lock, Map as MapIcon, MapPin, ShoppingBag, Star } from 'lucide-react';
import { AppleVariety, Decoration, Farm, TreeState } from '../types';
import { FARMS } from '../constants';
import { cn } from '../lib/utils';

interface FarmSelectionProps {
  onAdopt: (farm: Farm, variety: AppleVariety, nickname: string, personality: string) => void;
  adoptedFarmIds: string[];
  storedFarmIds: string[];
  slotCooldowns: Record<string, { farmId: string; lockedUntil: string }>;
  onStoreFarm: (farmId: string) => void;
  onUnstoreFarm: (farmId: string) => void;
  trees: TreeState[];
  decorations: Decoration[];
  onAddDecoration: (decoration: Decoration) => void;
  ownedItems: { id: string; count: number }[];
  onGoToStore: () => void;
}

const APPLE_VARIETIES: AppleVariety[] = ['썸머킹', '아오리', '홍로', '시나노스위트', '아이카향', '부사'];

const VARIETY_COPY: Record<string, { desc: string; season: string; emoji: string }> = {
  썸머킹: { desc: '새콤달콤한 맛으로 여름을 물들이는 조생종', season: '7월 수확', emoji: '🍏' },
  아오리:  { desc: '여름에 먼저 만나는 풋풋한 향의 초록 사과', season: '8월 수확', emoji: '🍏' },
  홍로:    { desc: '산뜻한 향과 붉은 빛이 매력적인 초가을 사과', season: '9월 수확', emoji: '🍎' },
  시나노스위트: { desc: '달콤함이 진하고 과즙이 풍부한 가을 품종', season: '10월 수확', emoji: '🍎' },
  아이카향: { desc: '강한 향기와 독특한 풍미를 가진 희귀 품종', season: '10월 수확', emoji: '🍎' },
  부사:    { desc: '단단하고 달콤해서 선물용으로 인기 있는 품종', season: '11월 수확', emoji: '🍎' },
};

const PERSONALITIES: { value: string; emoji: string; desc: string }[] = [
  { value: '수줍은',      emoji: '🌸', desc: '조용히 자라며 정성스러운 돌봄을 좋아해요' },
  { value: '씩씩한',      emoji: '💪', desc: '어떤 날씨에도 굳건히 자라는 강인한 나무' },
  { value: '다정한',      emoji: '🥰', desc: '물을 줄 때마다 따뜻한 반응이 돌아와요' },
  { value: '장난기 많은', emoji: '😜', desc: '예상치 못한 성장 이벤트가 자주 생겨요' },
  { value: '까칠한',      emoji: '😤', desc: '까다롭지만 잘 키우면 최고 수확량을 자랑해요' },
];

const decorationIcon = (type: Decoration['type']) => {
  if (type === 'tree') return '🌳';
  if (type === 'bench') return '🪑';
  if (type === 'flower') return '🌷';
  return '🏆';
};

export const FarmSelection: React.FC<FarmSelectionProps> = ({
  onAdopt,
  adoptedFarmIds,
  storedFarmIds,
  slotCooldowns,
  onStoreFarm,
  onUnstoreFarm,
  trees,
  decorations,
  onAddDecoration,
  ownedItems,
  onGoToStore,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [step, setStep] = useState<'view' | 'survey' | 'personality' | 'confirm'>('view');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [surveyResult, setSurveyResult] = useState<AppleVariety | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [isDecorating, setIsDecorating] = useState(false);

  const activeFarmCount = (adoptedFarmIds || []).filter(id => !(storedFarmIds || []).includes(id)).length;

  const handleFarmSelect = (farm: Farm) => {
    if (!(adoptedFarmIds || []).includes(farm.id)) return;
    if ((storedFarmIds || []).includes(farm.id)) return;
    setSelectedFarm(farm);
    setStep('survey');
  };

  const handleSurvey = (variety: AppleVariety) => {
    setSurveyResult(variety);
    setStep('personality');
  };

  const handlePersonality = (personality: string) => {
    setSelectedPersonality(personality);
    setStep('confirm');
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDecorating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const types: Decoration['type'][] = ['tree', 'bench', 'flower', 'statue'];
    onAddDecoration({
      id: Math.random().toString(36).slice(2, 11),
      type: types[Math.floor(Math.random() * types.length)],
      x,
      y,
    });
  };

  const getVarietyInfo = (v: AppleVariety) => VARIETY_COPY[String(v)] ?? { desc: `${String(v)} 품종으로 영주 사과나무를 키워요.`, season: '', emoji: '🍎' };
  const hasSeed = selectedFarm ? ownedItems.some(i => i.id === `seed_${selectedFarm.id}` && i.count > 0) : false;
  const canProceedWithTreeName = nickname.trim().length > 0;

  const showNicknameRequired = () => {
    showAlert('나무 이름을 먼저 입력해주세요.\n이름을 지어야 씨앗 심기 단계로 넘어갈 수 있어요.', '🌳', 'warning');
  };

  return (
    <div className="py-4">
      <AnimatePresence mode="wait">
        {step === 'view' && (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-apple-red">Yeongju Orchard Map</p>
                <h2 className="mt-1 text-2xl font-black text-stone-900">영주 사과 농가 지도</h2>
                <p className="mt-1 text-xs font-bold leading-relaxed text-warm-gray">
                  농가를 선택하고 씨앗을 심어 실제 수확 보상까지 이어가요.
                </p>
              </div>
              <div className="flex gap-1.5 rounded-2xl border-2 border-stone-50 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('map')}
                  className={cn('rounded-xl p-2 transition-all', viewMode === 'map' ? 'bg-apple-red text-white shadow-sm' : 'text-stone-400')}
                  aria-label="지도 보기"
                >
                  <MapIcon size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('rounded-xl p-2 transition-all', viewMode === 'list' ? 'bg-apple-red text-white shadow-sm' : 'text-stone-400')}
                  aria-label="목록 보기"
                >
                  <List size={18} />
                </button>
              </div>
            </header>

            <div className="mb-4 grid grid-cols-3 gap-2">
              <MiniStat label="활성 농가" value={`${activeFarmCount}/3`} />
              <MiniStat label="보유 나무" value={`${trees.length}그루`} />
              <MiniStat label="마을 꾸미기" value={isDecorating ? '켜짐' : '꺼짐'} />
            </div>

            {viewMode === 'map' ? (
              <div className="relative">
                <div className="map-container mb-4 overflow-hidden rounded-[2.5rem] border-4 border-white shadow-xl">
                  <div
                    className={cn('map-surface relative aspect-square bg-stone-100/50', isDecorating ? 'cursor-crosshair' : 'cursor-default')}
                    onClick={handleMapClick}
                  >
                    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                      <defs>
                        <linearGradient id="yeongju-map-fill" x1="15" y1="10" x2="86" y2="94" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#DDF7C8" />
                          <stop offset="0.55" stopColor="#BDEB9A" />
                          <stop offset="1" stopColor="#8FD47D" />
                        </linearGradient>
                        <filter id="map-shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="#6FA15B" floodOpacity="0.25" />
                        </filter>
                        <pattern id="orchard-dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="0.65" fill="#5EB86B" opacity="0.35" />
                          <circle cx="6" cy="5" r="0.5" fill="#FF8A8A" opacity="0.28" />
                        </pattern>
                      </defs>

                      <rect width="100" height="100" rx="14" fill="#EAF8FF" />
                      <path d="M8 78 C24 70 31 77 44 68 C58 58 70 61 92 46" fill="none" stroke="#78CFF3" strokeWidth="8" strokeLinecap="round" opacity="0.55" />
                      <path d="M8 78 C24 70 31 77 44 68 C58 58 70 61 92 46" fill="none" stroke="#F7FFFF" strokeWidth="2" strokeLinecap="round" opacity="0.75" />

                      <path
                        d="M32 5 C47 4 57 12 69 10 C83 8 94 20 92 35 C90 47 98 56 88 68 C79 78 82 91 66 95 C53 98 45 89 33 91 C18 93 7 82 9 68 C11 55 2 47 9 34 C16 20 16 8 32 5 Z"
                        fill="url(#yeongju-map-fill)"
                        stroke="#FFFFFF"
                        strokeWidth="3"
                        filter="url(#map-shadow)"
                      />
                      <path
                        d="M32 5 C47 4 57 12 69 10 C83 8 94 20 92 35 C90 47 98 56 88 68 C79 78 82 91 66 95 C53 98 45 89 33 91 C18 93 7 82 9 68 C11 55 2 47 9 34 C16 20 16 8 32 5 Z"
                        fill="url(#orchard-dots)"
                        opacity="0.7"
                      />

                      <path d="M16 21 C25 27 31 32 39 36 C51 42 63 43 78 51" fill="none" stroke="#FFF4C2" strokeWidth="5" strokeLinecap="round" />
                      <path d="M16 21 C25 27 31 32 39 36 C51 42 63 43 78 51" fill="none" stroke="#D9A441" strokeWidth="1.2" strokeDasharray="3 3" strokeLinecap="round" opacity="0.8" />
                      <path d="M28 88 C34 75 40 67 49 59 C57 51 61 39 65 17" fill="none" stroke="#FFF4C2" strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M28 88 C34 75 40 67 49 59 C57 51 61 39 65 17" fill="none" stroke="#D9A441" strokeWidth="1.1" strokeDasharray="3 3" strokeLinecap="round" opacity="0.8" />

                      <path d="M16 18 C22 10 30 9 38 12 C31 18 24 21 16 18 Z" fill="#8BCB69" opacity="0.85" />
                      <path d="M12 25 C18 18 28 17 36 22 C27 27 19 29 12 25 Z" fill="#6FB95A" opacity="0.75" />
                      <text x="18" y="16" fontSize="4" fontWeight="900" fill="#487A43">소백산</text>

                      <g opacity="0.95">
                        <rect x="50" y="48" width="20" height="11" rx="4" fill="#FFFFFF" opacity="0.86" />
                        <text x="54" y="55" fontSize="4.2" fontWeight="900" fill="#5A3E2B">영주시내</text>
                        <circle cx="50" cy="53" r="2.3" fill="#FF6B6B" />
                      </g>
                      <g opacity="0.95">
                        <rect x="22" y="25" width="17" height="9" rx="3.5" fill="#FFFFFF" opacity="0.84" />
                        <text x="26" y="31" fontSize="3.8" fontWeight="900" fill="#5A3E2B">풍기읍</text>
                      </g>
                      <g opacity="0.95">
                        <rect x="58" y="18" width="17" height="9" rx="3.5" fill="#FFFFFF" opacity="0.84" />
                        <text x="62" y="24" fontSize="3.8" fontWeight="900" fill="#5A3E2B">부석면</text>
                      </g>
                      <g opacity="0.95">
                        <rect x="28" y="72" width="21" height="9" rx="3.5" fill="#FFFFFF" opacity="0.84" />
                        <text x="31" y="78" fontSize="3.8" fontWeight="900" fill="#5A3E2B">무섬마을</text>
                      </g>

                      <text x="11" y="82" fontSize="3.6" fontWeight="900" fill="#2583AD" opacity="0.85">서천</text>
                      <text x="74" y="86" fontSize="4" fontWeight="900" fill="#FFFFFF" opacity="0.8">Y E O N G J U</text>
                    </svg>

                    {FARMS.map((farm) => {
                      const isUnlocked = (adoptedFarmIds || []).includes(farm.id);
                      const isStored = (storedFarmIds || []).includes(farm.id);
                      return (
                        <motion.button
                          key={farm.id}
                          whileHover={{ scale: 1.18, y: -4 }}
                          onClick={() => handleFarmSelect(farm)}
                          className={cn('group absolute z-10 -translate-x-1/2 -translate-y-full', (!isUnlocked || isStored) && 'opacity-50 grayscale')}
                          style={{ left: `${farm.coords.x}%`, top: `${farm.coords.y}%` }}
                          aria-label={`${farm.name} 선택`}
                        >
                          {isUnlocked ? (
                            isStored ? (
                              <div className="rounded-full border-2 border-white bg-stone-700 p-1.5 text-white shadow-lg">
                                <ShoppingBag size={14} />
                              </div>
                            ) : (
                              <MapPin size={30} fill="#ff6b6b" className="text-white drop-shadow-md" />
                            )
                          ) : (
                            <div className="rounded-full border-2 border-white bg-stone-500 p-1.5 text-white">
                              <Lock size={14} />
                            </div>
                          )}
                          <div className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-stone-50 bg-white px-2.5 py-1 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            <span className="text-[10px] font-black">
                              {isUnlocked ? (isStored ? `${farm.name} 보관 중` : farm.name) : '잠김'}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}

                    {decorations.map((deco) => (
                      <div
                        key={deco.id}
                        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-2xl"
                        style={{ left: `${deco.x}%`, top: `${deco.y}%` }}
                      >
                        {decorationIcon(deco.type)}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsDecorating(!isDecorating)}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white transition-all active:translate-y-1 active:shadow-none',
                    isDecorating
                      ? 'bg-stone-800 shadow-[0_4px_0_0_#111]'
                      : 'bg-yeoju-gold shadow-[0_4px_0_0_#b07a00]',
                  )}
                >
                  <Hammer size={18} />
                  {isDecorating ? '꾸미기 완료' : '마을 꾸미기'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {FARMS.map((farm) => {
                  const isUnlocked = (adoptedFarmIds || []).includes(farm.id);
                  const isStored = (storedFarmIds || []).includes(farm.id);
                  const treesInFarm = trees.filter(t => t.farmId === farm.id);

                  return (
                    <motion.div
                      key={farm.id}
                      whileTap={isUnlocked && !isStored ? { scale: 0.98 } : {}}
                      className={cn('farm-card overflow-hidden', isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60 grayscale')}
                    >
                      <div className="relative h-28" onClick={() => isUnlocked && !isStored && handleFarmSelect(farm)}>
                        <img src={farm.image} alt={farm.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
                            <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-xs font-black text-stone-600">
                              <Lock size={15} /> 나무 3그루를 키우면 열려요
                            </div>
                          </div>
                        )}
                        {isStored && (
                          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm">
                            <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-xs font-black text-stone-700">
                              <ShoppingBag size={15} /> 보관 중인 농가
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3 bg-white p-4">
                        <div onClick={() => isUnlocked && !isStored && handleFarmSelect(farm)}>
                          <h3 className="text-base font-black text-stone-800">{farm.name}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <p className="text-xs font-bold text-stone-400">{farm.location}</p>
                            <span className="h-1 w-1 rounded-full bg-stone-200" />
                            <p className="text-[10px] font-black text-apple-green">{treesInFarm.length}/5 나무</p>
                            <span className="flex items-center gap-1 text-[10px] font-black text-yellow-600">
                              <Star size={11} fill="currentColor" /> {farm.rating}
                            </span>
                          </div>
                        </div>
                        {isUnlocked && (
                          isStored ? (
                            <button
                              onClick={() => onUnstoreFarm(farm.id)}
                              className="rounded-xl bg-stone-800 px-3.5 py-2 text-xs font-black text-white shadow-[0_3px_0_0_#111] transition-all active:translate-y-0.5 active:shadow-none"
                            >
                              다시 활성화
                            </button>
                          ) : (
                            treesInFarm.length >= 5 && (
                              <button
                                onClick={() => onStoreFarm(farm.id)}
                                className="rounded-xl bg-stone-100 px-3.5 py-2 text-xs font-black text-stone-500 transition-all active:scale-95 active:bg-stone-200"
                              >
                                보관하기
                              </button>
                            )
                          )
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {step === 'survey' && selectedFarm && (
          <motion.div key="survey" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setStep('view')} className="mb-6 flex items-center gap-1.5 text-sm font-bold text-stone-400 transition-all active:opacity-60">
              <ChevronLeft size={18} /> 돌아가기
            </button>

            <div className="mb-6 text-center">
              <div className="mb-3 text-4xl">🍎</div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-apple-red">{selectedFarm.name}</p>
              <h2 className="mt-1 text-2xl font-black text-stone-900">어떤 사과로 키울까요?</h2>
              <p className="mt-1 text-xs font-bold text-warm-gray">품종을 고르면 나무 성격 선택으로 넘어가요.</p>
            </div>

            <div className="space-y-2.5">
              {APPLE_VARIETIES.map((v) => {
                const info = getVarietyInfo(v);
                return (
                  <motion.button
                    key={String(v)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSurvey(v)}
                    className="flex w-full items-center gap-4 rounded-2xl border-2 border-stone-100 bg-white p-4 font-black transition-all hover:border-apple-red hover:shadow-[0_4px_16px_rgba(255,107,107,0.12)]"
                  >
                    <span className="text-3xl">{info.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-stone-800">{String(v)}</p>
                        <span className="rounded-full bg-apple-light px-2 py-0.5 text-[9px] font-black text-apple-red">{info.season}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] font-bold text-warm-gray">{info.desc}</p>
                    </div>
                    <ChevronLeft size={16} className="shrink-0 rotate-180 text-stone-300" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 'personality' && selectedFarm && surveyResult && (
          <motion.div key="personality" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setStep('survey')} className="mb-6 flex items-center gap-1.5 text-sm font-bold text-stone-400 transition-all active:opacity-60">
              <ChevronLeft size={18} /> 돌아가기
            </button>

            <div className="mb-6 text-center">
              <div className="mb-3 text-4xl">{getVarietyInfo(surveyResult).emoji}</div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-apple-red">{String(surveyResult)}</p>
              <h2 className="mt-1 text-2xl font-black text-stone-900">나무의 성격을 골라요</h2>
              <p className="mt-1 text-xs font-bold text-warm-gray">성격에 따라 나무가 다르게 반응해요.</p>
            </div>

            <div className="space-y-2.5">
              {PERSONALITIES.map((p) => (
                <motion.button
                  key={p.value}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handlePersonality(p.value)}
                  className="flex w-full items-center gap-4 rounded-2xl border-2 border-stone-100 bg-white p-4 font-black transition-all hover:border-apple-red hover:shadow-[0_4px_16px_rgba(255,107,107,0.12)]"
                >
                  <span className="text-3xl">{p.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-black text-stone-800">{p.value}</p>
                    <p className="mt-0.5 text-[11px] font-bold text-warm-gray">{p.desc}</p>
                  </div>
                  <ChevronLeft size={16} className="shrink-0 rotate-180 text-stone-300" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'confirm' && selectedFarm && surveyResult && selectedPersonality && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <button onClick={() => setStep('personality')} className="mb-6 flex items-center gap-1.5 text-sm font-bold text-stone-400 transition-all active:opacity-60">
              <ChevronLeft size={18} /> 돌아가기
            </button>

            <div className="cute-card p-6 text-center">
              <div className="mb-4 text-5xl">🌱</div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-apple-red">Ready To Plant</p>
              <h2 className="mt-1 text-xl font-black text-stone-900">씨앗 심기 준비 완료!</h2>
              <div className="mb-6 mt-2 flex items-center justify-center gap-2 text-xs font-bold leading-relaxed text-warm-gray flex-wrap">
                <span>{selectedFarm.name}</span>
                <span className="text-stone-300">·</span>
                <span className="font-black text-apple-red">{String(surveyResult)}</span>
                <span className="text-stone-300">·</span>
                <span className="font-black text-stone-600">
                  {PERSONALITIES.find(p => p.value === selectedPersonality)?.emoji} {selectedPersonality}
                </span>
              </div>

              {(() => {
                const cooldown = slotCooldowns[`${selectedFarm.id}_0`];
                if (cooldown && new Date(cooldown.lockedUntil) > new Date()) {
                  const daysLeft = Math.ceil((new Date(cooldown.lockedUntil).getTime() - Date.now()) / 86400000);
                  return (
                    <div className="mb-5 flex items-center gap-2.5 rounded-2xl border-2 border-red-100 bg-red-50 p-3.5 text-left text-xs font-bold text-red-500">
                      <span className="text-lg">⏳</span>
                      <span>이 슬롯은 {daysLeft}일 뒤에 다시 심을 수 있어요.</span>
                    </div>
                  );
                }
                return null;
              })()}

              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="나무 별명을 지어주세요"
                className={cn('cute-input text-center', !canProceedWithTreeName && 'border-red-100 bg-red-50/40')}
                maxLength={20}
              />
              {!canProceedWithTreeName && (
                <p className="mb-5 mt-2 text-[11px] font-bold text-red-400">
                  나무 이름은 필수예요. 예: 소백이, 홍주, 첫사과
                </p>
              )}

              {hasSeed ? (
                <button
                  onClick={() => {
                    if (!canProceedWithTreeName) {
                      showNicknameRequired();
                      return;
                    }
                    onAdopt(selectedFarm, surveyResult, nickname.trim(), selectedPersonality!);
                  }}
                  aria-disabled={!canProceedWithTreeName}
                  className={cn('btn-primary w-full justify-center text-center transition-opacity', !canProceedWithTreeName && 'opacity-50')}
                >
                  씨앗 사용해서 분양받기
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!canProceedWithTreeName) {
                      showNicknameRequired();
                      return;
                    }
                    onGoToStore();
                  }}
                  aria-disabled={!canProceedWithTreeName}
                  className={cn('btn-gold flex w-full items-center justify-center gap-2 transition-opacity', !canProceedWithTreeName && 'opacity-50')}
                >
                  <ShoppingBag size={16} /> 상점에서 씨앗 구매하기
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border-2 border-stone-100 bg-white p-3 text-center shadow-sm">
    <p className="text-[9px] font-black uppercase tracking-wide text-stone-400">{label}</p>
    <p className="mt-0.5 text-sm font-black text-stone-800">{value}</p>
  </div>
);
