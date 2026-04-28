import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, ChevronRight, CheckCircle2, Map as MapIcon, List, Hammer, Plus, ShoppingBag, Lock } from 'lucide-react';
import { Farm, AppleVariety, Decoration, TreeState } from '../types';
import { FARMS } from '../constants';
import { cn } from '../lib/utils';

interface FarmSelectionProps {
  onAdopt: (farm: Farm, variety: AppleVariety, nickname: string) => void;
  adoptedFarmIds: string[]; // These are the unlocked ones
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
  onGoToStore
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
      x, y
    });
  };

  const getVarietyDesc = (v: string) => {
    if (v === '부사') return '아삭하고 달콤한 정석 사과';
    if (v === '홍로') return '과즙 팡팡! 시원한 햇사과';
    if (v === '시나노골드') return '새콤달콤 황금빛 사과';
    if (v === '감홍') return '진한 향과 맛의 명품 사과';
    if (v === '아오리') return '여름의 상큼함을 담은 풋사과';
    if (v === '홍옥') return '톡 쏘는 산미가 매력적인 사과';
    return `영주 특산 ${v}`;
  };

  return (
    <div className="py-4">
      <AnimatePresence mode="wait">
        {step === 'view' && (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black mb-2">영주 사과 마을 🍎</h2>
                <p className="text-stone-500 text-sm font-medium">농장을 선택하고 나무를 분양받으세요.</p>
              </div>
              <div className="flex gap-2 bg-white p-1 rounded-2xl shadow-sm border-2 border-stone-50">
                <button 
                  onClick={() => setViewMode('map')}
                  className={cn("p-2 rounded-xl transition-all", viewMode === 'map' ? 'bg-apple-red text-white' : 'text-stone-400')}
                >
                  <MapIcon size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? 'bg-apple-red text-white' : 'text-stone-400')}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {viewMode === 'map' ? (
              <div className="relative">
                <div className="map-container mb-6 overflow-hidden rounded-[3rem] border-4 border-white shadow-xl">
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
                          whileHover={{ scale: 1.2, y: -5 }}
                          onClick={() => handleFarmSelect(farm)}
                          className={cn(
                            "absolute -translate-x-1/2 -translate-y-full group z-10",
                            (!isUnlocked || isStored) && "opacity-50 grayscale"
                          )}
                          style={{ left: `${farm.coords.x}%`, top: `${farm.coords.y}%` }}
                        >
                          <div className="relative">
                            {isUnlocked ? (
                              isStored ? (
                                <div className="bg-stone-800 p-1.5 rounded-full border-2 border-white text-white shadow-lg">
                                  <ShoppingBag size={16} />
                                </div>
                              ) : (
                                <MapPin size={32} fill="#e63946" className="text-white drop-shadow-md" />
                              )
                            ) : (
                              <div className="bg-stone-500 p-1.5 rounded-full border-2 border-white text-white">
                                <Lock size={16} />
                              </div>
                            )}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border-2 border-stone-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                              <span className="text-[10px] font-black">
                                {isUnlocked ? (isStored ? `${farm.name} (보관됨)` : farm.name) : "잠겨있음"}
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
                    "w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all",
                    isDecorating ? 'bg-soft-brown text-white' : 'bg-yeoju-gold text-white shadow-xl'
                  )}
                >
                  <Hammer size={20} />
                  {isDecorating ? '꾸미기 완료' : '마을 꾸미기'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {FARMS.map((farm) => {
                  const isUnlocked = (adoptedFarmIds || []).includes(farm.id);
                  const isStored = (storedFarmIds || []).includes(farm.id);
                  const treesInFarm = trees.filter(t => t.farmId === farm.id);
                  
                  return (
                    <motion.div
                      key={farm.id}
                      whileTap={isUnlocked && !isStored ? { scale: 0.98 } : {}}
                      className={cn(
                        "farm-card overflow-hidden transition-all",
                        isUnlocked ? "cursor-pointer group" : "opacity-60 grayscale cursor-not-allowed"
                      )}
                    >
                      <div className="relative h-32" onClick={() => isUnlocked && !isStored && handleFarmSelect(farm)}>
                        <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-white/90 px-4 py-2 rounded-2xl font-black flex items-center gap-2 text-stone-600">
                              <Lock size={18} />
                              이전 농가에서 나무 3개를 키워보세요
                            </div>
                          </div>
                        )}
                        {isStored && (
                          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-white/90 px-4 py-2 rounded-2xl font-black flex items-center gap-2 text-stone-800">
                              <ShoppingBag size={18} />
                              보관 중인 농가입니다
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex justify-between items-center bg-white">
                        <div onClick={() => isUnlocked && !isStored && handleFarmSelect(farm)}>
                          <h3 className="font-black text-lg">{farm.name}</h3>
                          <div className="flex items-center gap-2">
                             <p className="text-stone-400 text-xs font-bold">{farm.location}</p>
                             <span className="w-1 h-1 bg-stone-200 rounded-full" />
                             <p className="text-apple-green text-[10px] font-black">{treesInFarm.length}/5 나무</p>
                          </div>
                        </div>
                        {isUnlocked && (
                          isStored ? (
                            <button 
                              onClick={() => onUnstoreFarm(farm.id)}
                              className="px-4 py-2 bg-stone-800 text-white rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all"
                            >
                              활성화
                            </button>
                          ) : (
                            treesInFarm.length >= 5 && (
                              <button 
                                onClick={() => onStoreFarm(farm.id)}
                                className="px-4 py-2 bg-stone-100 text-stone-500 rounded-xl font-black text-xs hover:bg-stone-200 active:scale-95 transition-all"
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
          <motion.div key="survey" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
            <button onClick={() => setStep('view')} className="absolute top-0 left-0 p-2 text-stone-400"><ChevronRight className="rotate-180" /></button>
            <h2 className="text-2xl font-black mb-8">당신이 좋아하는<br />사과 취향은?</h2>
            <div className="space-y-3">
              {selectedFarm.varieties.map((v) => (
                <button
                  key={v}
                  onClick={() => handleSurvey(v)}
                  className="w-full p-4 bg-white rounded-2xl border-4 border-stone-100 font-black hover:border-apple-red transition-all text-left flex items-center gap-4"
                >
                  <span className="text-2xl">🍎</span>
                  <div>
                    <p className="text-sm">{v}</p>
                    <p className="text-[10px] text-stone-400">{getVarietyDesc(v)}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'confirm' && selectedFarm && surveyResult && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="farm-card p-8 text-center relative">
            <button onClick={() => setStep('survey')} className="absolute top-4 left-4 p-2 text-stone-400"><ChevronRight className="rotate-180" /></button>
            <div className="text-5xl mb-6">🌳</div>
            <h2 className="text-2xl font-black mb-2">분양 준비 완료!</h2>
            <p className="text-sm font-medium text-stone-500 mb-8">{selectedFarm.name}에서 {surveyResult} 나무를 키웁니다.</p>
            
            {/* Cooldown Check Message */}
            {(() => {
              const cooldownKey = `${selectedFarm.id}_0`; // Simplification for demo, ideally we need to know WHICH slot we are filling
              const cooldown = slotCooldowns[cooldownKey];
              if (cooldown && new Date(cooldown.lockedUntil) > new Date()) {
                const daysLeft = Math.ceil((new Date(cooldown.lockedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100 flex items-center gap-3 text-red-500 mb-6 font-black text-xs">
                    <Lock size={18} />
                    <span>해당 슬롯은 현재 비활성화 상태입니다. {daysLeft}일 후에 다시 심을 수 있습니다.</span>
                  </div>
                );
              }
              return null;
            })()}

            <input 
              type="text" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)}
              placeholder="나무의 별명을 지어주세요"
              className="w-full p-4 bg-stone-50 rounded-2xl border-4 border-stone-100 text-center font-black focus:border-apple-red mb-6"
            />
            {ownedItems.some(i => i.id === `seed_${selectedFarm.id}`) ? (
              <button
                onClick={() => onAdopt(selectedFarm, surveyResult, nickname || `${selectedFarm.name}의 나무`)}
                className="w-full py-4 bg-apple-red text-white rounded-2xl font-black shadow-xl"
              >
                씨앗 사용하여 분양받기
              </button>
            ) : (
              <button onClick={onGoToStore} className="w-full py-4 bg-yeoju-gold text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl">
                <ShoppingBag size={20} /> 상점에서 씨앗 구매하기
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
