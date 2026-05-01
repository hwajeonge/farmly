import React, { useState } from 'react';
import { showAlert } from '../lib/alertEmitter';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, ChevronLeft, CheckCircle2, Map as MapIcon, List, Hammer, ShoppingBag, Lock } from 'lucide-react';
import { Farm, AppleVariety, Decoration, TreeState } from '../types';
import { FARMS } from '../constants';
import { cn } from '../lib/utils';

interface FarmSelectionProps {
  onAdopt: (farm: Farm, variety: AppleVariety, nickname: string) => void;
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

export const FarmSelection: React.FC<FarmSelectionProps> = ({
  onAdopt, adoptedFarmIds, storedFarmIds, slotCooldowns,
  onStoreFarm, onUnstoreFarm, trees, decorations, onAddDecoration,
  ownedItems, onGoToStore,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [step, setStep] = useState<'view' | 'survey' | 'confirm'>('view');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [surveyResult, setSurveyResult] = useState<AppleVariety | null>(null);
  const [nickname, setNickname] = useState('');
  const [isDecorating, setIsDecorating] = useState(false);

  const handleFarmSelect = (farm: Farm) => {
    if (!(adoptedFarmIds || []).includes(farm.id)) return;
    setSelectedFarm(farm);
    setStep('survey');
  };

  const handleSurvey = (variety: AppleVariety) => {
    setSurveyResult(variety);
    setStep('confirm');
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDecorating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const types: Decoration['type'][] = ['tree', 'bench', 'flower', 'statue'];
    onAddDecoration({
      id: Math.random().toString(36).substr(2, 9),
      type: types[Math.floor(Math.random() * types.length)],
      x, y,
    });
  };

  const getVarietyDesc = (v: string) => {
    if (v === '부사')        return '아삭하고 달콤한 정석 사과';
    if (v === '홍로')        return '과즙 팡팡! 시원한 햇사과';
    if (v === '시나노골드')  return '새콤달콤 황금빛 사과';
    if (v === '감홍')        return '진한 향과 맛의 명품 사과';
    if (v === '아오리')      return '여름의 상큼함을 담은 풋사과';
    if (v === '홍옥')        return '톡 쏘는 산미가 매력적인 사과';
    return `영주 특산 ${v}`;
  };

  const getVarietyEmoji = (v: string) => {
    if (v === '시나노골드' || v === '아오리') return '🍏';
    return '🍎';
  };

  return (
    <div className="py-4">
      <AnimatePresence mode="wait">

        {/* ── 메인 뷰 ── */}
        {step === 'view' && (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* 헤더 */}
            <div className="mb-5 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-stone-800">영주 사과마을 🍎</h2>
                <p className="text-xs font-bold text-warm-gray mt-1">농장을 선택하고 나무를 분양받으세요</p>
              </div>
              <div className="flex gap-1.5 bg-white p-1 rounded-2xl shadow-sm border-2 border-stone-50">
                <button
                  onClick={() => setViewMode('map')}
                  className={cn('p-2 rounded-xl transition-all', viewMode === 'map' ? 'bg-apple-red text-white shadow-sm' : 'text-stone-400')}
                >
                  <MapIcon size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-2 rounded-xl transition-all', viewMode === 'list' ? 'bg-apple-red text-white shadow-sm' : 'text-stone-400')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* 지도 뷰 */}
            {viewMode === 'map' ? (
              <div className="relative">
                <div className="map-container mb-4 overflow-hidden rounded-[2.5rem] border-4 border-white shadow-xl">
                  <div
                    className="map-surface relative aspect-square cursor-crosshair bg-stone-100/50"
                    onClick={handleMapClick}
                  >
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                      <defs>
                        <pattern id="grass-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                          <rect width="10" height="10" fill="#a7c957" />
                          <circle cx="2" cy="2" r="0.5" fill="#92b34e" />
                        </pattern>
                      </defs>
                      <path
                        d="M 35,10 C 50,5 70,2 85,15 C 95,25 98,45 90,65 C 85,80 70,95 50,98 C 30,95 10,85 5,65 C 2,45 10,25 35,10 Z"
                        fill="url(#grass-pattern)"
                        stroke="#f1faee"
                        strokeWidth="2"
                      />
                    </svg>

                    {FARMS.map(farm => {
                      const isUnlocked = (adoptedFarmIds || []).includes(farm.id);
                      const isStored = (storedFarmIds || []).includes(farm.id);
                      return (
                        <motion.button
                          key={farm.id}
                          whileHover={{ scale: 1.25, y: -5 }}
                          onClick={() => handleFarmSelect(farm)}
                          className={cn('absolute -translate-x-1/2 -translate-y-full group z-10', (!isUnlocked || isStored) && 'opacity-50 grayscale')}
                          style={{ left: `${farm.coords.x}%`, top: `${farm.coords.y}%` }}
                        >
                          <div className="relative">
                            {isUnlocked ? (
                              isStored ? (
                                <div className="bg-stone-700 p-1.5 rounded-full border-2 border-white text-white shadow-lg">
                                  <ShoppingBag size={14} />
                                </div>
                              ) : (
                                <MapPin size={30} fill="#ff6b6b" className="text-white drop-shadow-md" />
                              )
                            ) : (
                              <div className="bg-stone-500 p-1.5 rounded-full border-2 border-white text-white">
                                <Lock size={14} />
                              </div>
                            )}
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-white px-2.5 py-1 rounded-full shadow-lg border-2 border-stone-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                              <span className="text-[10px] font-black">
                                {isUnlocked ? (isStored ? `${farm.name} (보관됨)` : farm.name) : '잠겨있음 🔒'}
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}

                    {decorations.map(deco => (
                      <div
                        key={deco.id}
                        className="absolute text-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ left: `${deco.x}%`, top: `${deco.y}%` }}
                      >
                        {deco.type === 'tree' ? '🌳' : deco.type === 'bench' ? '🪑' : deco.type === 'flower' ? '🌻' : '🗿'}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setIsDecorating(!isDecorating)}
                  className={cn(
                    'w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all',
                    isDecorating
                      ? 'bg-stone-800 text-white shadow-[0_4px_0_0_#111] active:shadow-none active:translate-y-1'
                      : 'bg-yeoju-gold text-white shadow-[0_4px_0_0_#b07a00] active:shadow-none active:translate-y-1',
                  )}
                >
                  <Hammer size={18} />
                  {isDecorating ? '꾸미기 완료 ✓' : '마을 꾸미기 🏡'}
                </button>
              </div>
            ) : (
              /* 리스트 뷰 */
              <div className="space-y-3">
                {FARMS.map((farm) => {
                  const isUnlocked = (adoptedFarmIds || []).includes(farm.id);
                  const isStored = (storedFarmIds || []).includes(farm.id);
                  const treesInFarm = trees.filter(t => t.farmId === farm.id);

                  return (
                    <motion.div
                      key={farm.id}
                      whileTap={isUnlocked && !isStored ? { scale: 0.98 } : {}}
                      className={cn(
                        'farm-card overflow-hidden',
                        isUnlocked ? 'cursor-pointer' : 'opacity-60 grayscale cursor-not-allowed',
                      )}
                    >
                      <div className="relative h-28" onClick={() => isUnlocked && !isStored && handleFarmSelect(farm)}>
                        <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-white/90 px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 text-stone-600">
                              <Lock size={15} /> 나무 3개 키우면 해금!
                            </div>
                          </div>
                        )}
                        {isStored && (
                          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-white/90 px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 text-stone-700">
                              <ShoppingBag size={15} /> 보관 중인 농가
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex justify-between items-center bg-white">
                        <div onClick={() => isUnlocked && !isStored && handleFarmSelect(farm)}>
                          <h3 className="font-black text-base text-stone-800">{farm.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-stone-400 text-xs font-bold">{farm.location}</p>
                            <span className="w-1 h-1 bg-stone-200 rounded-full" />
                            <p className="text-apple-green text-[10px] font-black">{treesInFarm.length}/5 나무</p>
                          </div>
                        </div>
                        {isUnlocked && (
                          isStored ? (
                            <button
                              onClick={() => onUnstoreFarm(farm.id)}
                              className="px-3.5 py-2 bg-stone-800 text-white rounded-xl font-black text-xs shadow-[0_3px_0_0_#111] active:shadow-none active:translate-y-0.5 transition-all"
                            >
                              활성화
                            </button>
                          ) : (
                            treesInFarm.length >= 5 && (
                              <button
                                onClick={() => onStoreFarm(farm.id)}
                                className="px-3.5 py-2 bg-stone-100 text-stone-500 rounded-xl font-black text-xs active:bg-stone-200 active:scale-95 transition-all"
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

        {/* ── 취향 설문 ── */}
        {step === 'survey' && selectedFarm && (
          <motion.div key="survey" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setStep('view')} className="flex items-center gap-1.5 text-stone-400 font-bold text-sm mb-6 active:opacity-60 transition-all">
              <ChevronLeft size={18} /> 돌아가기
            </button>

            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🍎</div>
              <h2 className="text-2xl font-black text-stone-800 mb-1">어떤 사과가 좋으세요?</h2>
              <p className="text-xs font-bold text-warm-gray">취향에 맞는 품종을 선택해요</p>
            </div>

            <div className="space-y-3">
              {selectedFarm.varieties.map((v) => (
                <motion.button
                  key={v}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSurvey(v)}
                  className="w-full p-4 bg-white rounded-2xl border-2 border-stone-100 font-black hover:border-apple-red hover:shadow-[0_4px_16px_rgba(255,107,107,0.12)] transition-all flex items-center gap-4"
                >
                  <span className="text-3xl">{getVarietyEmoji(v)}</span>
                  <div className="text-left">
                    <p className="text-sm font-black text-stone-800">{v}</p>
                    <p className="text-[11px] text-warm-gray font-bold">{getVarietyDesc(v)}</p>
                  </div>
                  <ChevronLeft size={16} className="ml-auto rotate-180 text-stone-300" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── 분양 확인 ── */}
        {step === 'confirm' && selectedFarm && surveyResult && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <button onClick={() => setStep('survey')} className="flex items-center gap-1.5 text-stone-400 font-bold text-sm mb-6 active:opacity-60 transition-all">
              <ChevronLeft size={18} /> 돌아가기
            </button>

            <div className="cute-card p-6 text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h2 className="text-xl font-black text-stone-800 mb-1">분양 준비 완료!</h2>
              <p className="text-xs font-bold text-warm-gray mb-6">
                {selectedFarm.name}에서 <span className="text-apple-red font-black">{surveyResult}</span> 나무를 키울 거예요
              </p>

              {/* 쿨다운 경고 */}
              {(() => {
                const cooldown = slotCooldowns[`${selectedFarm.id}_0`];
                if (cooldown && new Date(cooldown.lockedUntil) > new Date()) {
                  const daysLeft = Math.ceil((new Date(cooldown.lockedUntil).getTime() - Date.now()) / 86400000);
                  return (
                    <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs font-bold text-red-500 mb-5 text-left">
                      <span className="text-lg">⏳</span>
                      <span>해당 슬롯은 {daysLeft}일 후에 다시 심을 수 있어요.</span>
                    </div>
                  );
                }
                return null;
              })()}

              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="나무 별명을 지어주세요 🌳"
                className="cute-input text-center mb-5"
                maxLength={20}
              />

              {ownedItems.some(i => i.id === `seed_${selectedFarm.id}`) ? (
                <button
                  onClick={() => {
                    if (!nickname.trim()) {
                      showAlert('나무 이름을 입력해주세요!\n소중한 나무에게 이름을 지어주세요 🌳', '🌳', 'warning');
                      return;
                    }
                    onAdopt(selectedFarm, surveyResult, nickname.trim());
                  }}
                  className={`btn-primary w-full justify-center text-center transition-opacity ${!nickname.trim() ? 'opacity-50' : ''}`}
                >
                  🌱 씨앗 사용하여 분양받기
                </button>
              ) : (
                <button
                  onClick={onGoToStore}
                  className="btn-gold w-full flex items-center justify-center gap-2"
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
