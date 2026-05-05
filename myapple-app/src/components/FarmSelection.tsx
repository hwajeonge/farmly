import React, { useEffect, useState } from 'react';
import { showAlert } from '../lib/alertEmitter';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  Coffee,
  House,
  Landmark,
  List,
  Lock,
  Map as MapIcon,
  ShoppingBag,
  Sprout,
  Star,
  Store as StoreIcon,
  TrainFront,
  Trees,
  Utensils,
} from 'lucide-react';
import { AppleVariety, Farm, Place, TreeState } from '../types';
import { FARMS, PLACES } from '../constants';
import { cn } from '../lib/utils';

interface FarmSelectionProps {
  onAdopt: (farm: Farm, variety: AppleVariety, nickname: string, personality: string) => void;
  adoptedFarmIds: string[];
  storedFarmIds: string[];
  slotCooldowns: Record<string, { farmId: string; lockedUntil: string }>;
  onStoreFarm: (farmId: string) => void;
  onUnstoreFarm: (farmId: string) => void;
  trees: TreeState[];
  ownedItems: { id: string; count: number }[];
  onGoToStore: (farmId?: string) => void;
  requestedFarmId?: string | null;
  onRequestedFarmHandled?: () => void;
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

type PlaceMarkerKind = 'station' | 'temple' | 'heritage' | 'market' | 'village' | 'food' | 'cafe';

const PLACE_MARKERS: Record<string, { x: number; y: number; kind: PlaceMarkerKind }> = {
  p0: { x: 61, y: 57, kind: 'station' },
  p1: { x: 69, y: 23, kind: 'temple' },
  p2: { x: 39, y: 31, kind: 'heritage' },
  p3: { x: 27, y: 32, kind: 'market' },
  p4: { x: 41, y: 77, kind: 'village' },
  p5: { x: 24, y: 38, kind: 'food' },
  p6: { x: 58, y: 55, kind: 'food' },
  p9: { x: 72, y: 29, kind: 'cafe' },
  p12: { x: 44, y: 27, kind: 'heritage' },
};

const PLACE_MARKER_IDS = Object.keys(PLACE_MARKERS);
const MAP_PLACES = PLACES.filter(place => PLACE_MARKER_IDS.includes(place.id));

const getPlaceMarkerIcon = (kind: PlaceMarkerKind) => {
  switch (kind) {
    case 'station':
      return <TrainFront size={13} />;
    case 'temple':
    case 'heritage':
      return <Landmark size={13} />;
    case 'market':
      return <StoreIcon size={13} />;
    case 'village':
      return <House size={13} />;
    case 'food':
      return <Utensils size={13} />;
    case 'cafe':
      return <Coffee size={13} />;
    default:
      return <Sprout size={13} />;
  }
};

const getPlaceMarkerTone = (place: Place) => {
  if (place.category === '맛집') return 'border-orange-100 bg-orange-50 text-orange-600';
  if (place.category === '카페') return 'border-amber-100 bg-amber-50 text-amber-700';
  return 'border-sky-100 bg-sky-50 text-sky-600';
};

const getShortPlaceDescription = (place: Place) => {
  if (place.description.length <= 42) return place.description;
  return `${place.description.slice(0, 42)}...`;
};

const getMapTooltipPlacement = (x: number) =>
  x > 50
    ? 'right-full top-1/2 mr-2 translate-x-1 -translate-y-1/2 group-hover:translate-x-0 group-focus-visible:translate-x-0'
    : 'left-full top-1/2 ml-2 -translate-x-1 -translate-y-1/2 group-hover:translate-x-0 group-focus-visible:translate-x-0';

export const FarmSelection: React.FC<FarmSelectionProps> = ({
  onAdopt,
  adoptedFarmIds,
  storedFarmIds,
  slotCooldowns,
  onStoreFarm,
  onUnstoreFarm,
  trees,
  ownedItems,
  onGoToStore,
  requestedFarmId,
  onRequestedFarmHandled,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [step, setStep] = useState<'view' | 'survey' | 'personality' | 'confirm'>('view');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [surveyResult, setSurveyResult] = useState<AppleVariety | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  const activeFarmCount = (adoptedFarmIds || []).filter(id => !(storedFarmIds || []).includes(id)).length;
  const nextFarmProgress = FARMS
    .filter(farm => (adoptedFarmIds || []).includes(farm.id) && !(storedFarmIds || []).includes(farm.id))
    .map(farm => trees.filter(tree => tree.farmId === farm.id).length)
    .reduce((max, count) => Math.max(max, Math.min(count, 3)), 0);

  const handleFarmSelect = (farm: Farm) => {
    if (!(adoptedFarmIds || []).includes(farm.id)) return;
    if ((storedFarmIds || []).includes(farm.id)) return;
    const hasFarmSeed = ownedItems.some(item => item.id === `seed_${farm.id}` && item.count > 0);

    if (!hasFarmSeed) {
      showAlert(
        `${farm.name} 씨앗이 먼저 필요해요.\n상점에서 이 농가 씨앗을 구매하면 바로 심기 단계로 돌아올게요.`,
        '🌱',
        'info',
      );
      onGoToStore(farm.id);
      return;
    }

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

  const getVarietyInfo = (v: AppleVariety) => VARIETY_COPY[String(v)] ?? { desc: `${String(v)} 품종으로 영주 사과나무를 키워요.`, season: '', emoji: '🍎' };
  const hasSeed = selectedFarm ? ownedItems.some(i => i.id === `seed_${selectedFarm.id}` && i.count > 0) : false;
  const canProceedWithTreeName = nickname.trim().length > 0;
  const selectedFarmTrees = selectedFarm ? trees.filter(tree => tree.farmId === selectedFarm.id) : [];
  const nextSlotIndex = selectedFarmTrees.length;
  const activeSlotCooldown = selectedFarm ? slotCooldowns[`${selectedFarm.id}_${nextSlotIndex}`] : undefined;
  const activeSlotCooldownUntil = activeSlotCooldown ? new Date(activeSlotCooldown.lockedUntil) : null;
  const isSlotCooldownActive = Boolean(activeSlotCooldownUntil && activeSlotCooldownUntil > new Date());
  const slotCooldownDaysLeft = activeSlotCooldownUntil
    ? Math.max(1, Math.ceil((activeSlotCooldownUntil.getTime() - Date.now()) / 86400000))
    : 0;

  const showNicknameRequired = () => {
    showAlert('나무 이름을 먼저 입력해주세요.\n이름을 지어야 씨앗 심기 단계로 넘어갈 수 있어요.', '🌳', 'warning');
  };

  useEffect(() => {
    if (!requestedFarmId) return;

    const farm = FARMS.find(item => item.id === requestedFarmId);
    if (!farm) {
      onRequestedFarmHandled?.();
      return;
    }

    const isUnlocked = (adoptedFarmIds || []).includes(farm.id);
    const isStored = (storedFarmIds || []).includes(farm.id);
    const hasFarmSeed = ownedItems.some(item => item.id === `seed_${farm.id}` && item.count > 0);

    setViewMode('map');
    if (isUnlocked && !isStored) {
      if (!hasFarmSeed) {
        setStep('view');
        showAlert(
          `${farm.name} 씨앗이 아직 없어요.\n상점에서 씨앗을 구매한 뒤 다시 이어갈 수 있어요.`,
          '🌱',
          'warning',
        );
        onRequestedFarmHandled?.();
        return;
      }
      setSelectedFarm(farm);
      setSurveyResult(null);
      setSelectedPersonality(null);
      setNickname('');
      setStep('survey');
      showAlert(`${farm.name} 씨앗을 준비했어요.\n이제 바로 심기 단계로 이어갈게요.`, '🌱', 'success');
    } else {
      setStep('view');
      showAlert(
        isStored
          ? `${farm.name}은 보관 중인 농가예요.\n다시 활성화한 뒤 씨앗을 심을 수 있어요.`
          : `${farm.name}은 아직 잠긴 농가예요.\n현재 열린 농가의 씨앗을 먼저 심어주세요.`,
        '🔒',
        'warning',
      );
    }

    onRequestedFarmHandled?.();
  }, [requestedFarmId, adoptedFarmIds, storedFarmIds, ownedItems, onRequestedFarmHandled]);

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
              <MiniStat label="다음 농가" value={`${nextFarmProgress}/3그루`} />
            </div>

            <GameGuide />

            {viewMode === 'map' ? (
              <div className="relative">
                <div className="map-container mb-4 overflow-hidden rounded-[2.25rem] border-4 border-white bg-white shadow-[0_14px_34px_rgba(90,62,43,0.12)]">
                  <div className="map-surface relative aspect-square bg-gradient-to-br from-sky-50 via-apple-light-green/50 to-yellow-50">
                    <div className="pointer-events-none absolute left-4 top-4 z-10 flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-apple-red/60 shadow-sm" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yeoju-gold/70 shadow-sm" />
                      <span className="h-2.5 w-2.5 rounded-full bg-apple-green/60 shadow-sm" />
                    </div>
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

                      <g opacity="0.9">
                        <path d="M13 22 L24 10 L34 22 Z" fill="#72B95E" />
                        <path d="M22 22 L31 13 L40 22 Z" fill="#8FD47D" />
                        <path d="M24 10 L28 16 L20 16 Z" fill="#EAF8FF" opacity="0.85" />
                        <path d="M31 13 L34 17 L28 17 Z" fill="#EAF8FF" opacity="0.75" />
                      </g>

                      <g opacity="0.95">
                        <rect x="51" y="47" width="19" height="13" rx="4" fill="#FFFFFF" opacity="0.86" />
                        <rect x="56" y="42" width="9" height="18" rx="2" fill="#E9B96E" />
                        <rect x="53" y="50" width="4" height="10" rx="1" fill="#FFD88C" />
                        <rect x="65" y="50" width="3.5" height="10" rx="1" fill="#FFD88C" />
                        <circle cx="60.5" cy="50" r="1.4" fill="#8C6A43" opacity="0.7" />
                      </g>
                      <g opacity="0.95">
                        <path d="M23 26 H39 L36 21 H26 Z" fill="#FFFFFF" opacity="0.86" />
                        <rect x="24" y="26" width="14" height="8" rx="2" fill="#E9B96E" />
                        <path d="M24 26 H38" stroke="#7DBB62" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="28" cy="33" r="1" fill="#C0653C" />
                        <circle cx="33" cy="33" r="1" fill="#C0653C" />
                      </g>
                      <g opacity="0.95">
                        <path d="M59 24 H76 L67.5 17 Z" fill="#FFFFFF" opacity="0.86" />
                        <path d="M62 24 H73 L67.5 19 Z" fill="#6FB95A" />
                        <rect x="62" y="24" width="11" height="5" rx="1.5" fill="#8C6A43" opacity="0.65" />
                      </g>
                      <g opacity="0.95">
                        <path d="M29 77 C34 72 42 72 47 77" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.86" />
                        <path d="M31 76 L39 70 L47 76 Z" fill="#E9B96E" />
                        <rect x="33" y="76" width="12" height="6" rx="2" fill="#8C6A43" opacity="0.62" />
                      </g>

                      <path d="M10 84 C14 80 18 88 22 84 C26 80 30 88 34 84" fill="none" stroke="#2583AD" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
                      <circle cx="78" cy="84" r="1.4" fill="#FFFFFF" opacity="0.72" />
                      <circle cx="84" cy="88" r="1" fill="#FFFFFF" opacity="0.52" />
                      <circle cx="88" cy="82" r="0.9" fill="#FFFFFF" opacity="0.5" />
                    </svg>

                    {MAP_PLACES.map((place) => {
                      const marker = PLACE_MARKERS[place.id];
                      const tooltipPlacement = getMapTooltipPlacement(marker.x);
                      return (
                        <button
                          key={place.id}
                          type="button"
                          onClick={() => showAlert(`${place.name}\n${place.description}`, '📍', 'info')}
                          className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                          aria-label={`${place.name}: ${place.description}`}
                        >
                          <span
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.14)] ring-2 ring-white/60 transition-all group-hover:-translate-y-0.5 group-hover:scale-110 group-focus-visible:-translate-y-0.5 group-focus-visible:scale-110',
                              getPlaceMarkerTone(place),
                            )}
                          >
                            {getPlaceMarkerIcon(marker.kind)}
                          </span>
                          <span className={cn('pointer-events-none absolute z-40 w-40 rounded-[1.15rem] border-2 border-white bg-white/95 px-3 py-2 text-left opacity-0 shadow-[0_10px_22px_rgba(90,62,43,0.18)] backdrop-blur transition-all group-hover:opacity-100 group-focus-visible:opacity-100', tooltipPlacement)}>
                            <span className="block text-[11px] font-black text-stone-800">{place.name}</span>
                            <span className="mt-1 block text-[10px] font-bold leading-relaxed text-stone-500">
                              {getShortPlaceDescription(place)}
                            </span>
                          </span>
                        </button>
                      );
                    })}

                    {FARMS.map((farm) => {
                      const isUnlocked = (adoptedFarmIds || []).includes(farm.id);
                      const isStored = (storedFarmIds || []).includes(farm.id);
                      const tooltipPlacement = getMapTooltipPlacement(farm.coords.x);
                      return (
                        <motion.button
                          key={farm.id}
                          whileHover={{ scale: 1.06, y: -3 }}
                          onClick={() => handleFarmSelect(farm)}
                          className={cn('group absolute z-30 -translate-x-1/2 -translate-y-full', (!isUnlocked || isStored) && 'grayscale')}
                          style={{ left: `${farm.coords.x}%`, top: `${farm.coords.y}%` }}
                          aria-label={`${farm.name} 선택`}
                        >
                          <div className="relative flex flex-col items-center">
                            <span
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white shadow-[0_5px_12px_rgba(0,0,0,0.2)] ring-2 ring-white/45 transition-all group-hover:-translate-y-0.5 group-focus-visible:ring-4 group-focus-visible:ring-apple-red/25',
                                isUnlocked && !isStored && 'bg-apple-red text-white',
                                isStored && 'bg-stone-700 text-white',
                                !isUnlocked && 'bg-stone-500 text-white opacity-75',
                              )}
                            >
                              {isUnlocked ? (
                                isStored ? <ShoppingBag size={15} /> : <Trees size={17} />
                              ) : (
                                <Lock size={15} />
                              )}
                            </span>
                            <span className={cn('pointer-events-none absolute z-40 w-max rounded-[1.1rem] border-2 border-white bg-white/95 px-3 py-1.5 text-[11px] font-black text-stone-800 opacity-0 shadow-[0_10px_22px_rgba(90,62,43,0.18)] backdrop-blur transition-all group-hover:opacity-100 group-focus-visible:opacity-100', tooltipPlacement)}>
                              {farm.name}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <MapLegend />
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

              {isSlotCooldownActive && (
                <div className="mb-5 rounded-2xl border-2 border-red-100 bg-red-50 p-3.5 text-left">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg">⏳</span>
                    <div>
                      <p className="text-xs font-black text-red-500">
                        이 자리는 {slotCooldownDaysLeft}일 뒤에 다시 심을 수 있어요.
                      </p>
                      <p className="mt-1 text-[11px] font-bold leading-relaxed text-red-400">
                        씨앗 구매 제한이 아니라, 나무를 제거한 슬롯의 3일 휴지기예요. 무한 재시도를 막기 위해 같은 자리는 휴지기 종료 후 다시 사용할 수 있어요.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

              {isSlotCooldownActive ? (
                <button
                  disabled
                  className="w-full rounded-2xl bg-stone-100 py-4 text-center text-sm font-black text-stone-400"
                >
                  휴지기 종료 후 씨앗 심기 가능
                </button>
              ) : hasSeed ? (
                <button
                  onClick={() => {
                    if (!canProceedWithTreeName) {
                      showNicknameRequired();
                      return;
                    }
                    onAdopt(selectedFarm, surveyResult, nickname.trim(), selectedPersonality!);
                  }}
                  aria-disabled={!canProceedWithTreeName}
                  disabled={!canProceedWithTreeName}
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
                    onGoToStore(selectedFarm.id);
                  }}
                  aria-disabled={!canProceedWithTreeName}
                  disabled={!canProceedWithTreeName}
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

const GameGuide = () => {
  const steps = [
    { title: '농가 선택', desc: '처음에는 랜덤으로 열린 내 농가 1곳에서 시작해요.', value: '1곳' },
    { title: '나무 3그루', desc: '한 농가에 나무 3그루를 심으면 다음 농가가 열려요.', value: '3그루' },
    { title: '최대 관리', desc: '농가당 나무 5그루, 동시에 활성 농가 3곳까지 관리해요.', value: '5/3' },
    { title: '수확 배송', desc: '각 나무는 30일 성장 후 수확과 배송 신청으로 이어져요.', value: '30일' },
  ];

  return (
    <section className="mb-4 rounded-[1.75rem] border-2 border-apple-green/20 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-apple-green">Game Flow</p>
          <h3 className="mt-0.5 text-sm font-black text-stone-800">농가와 나무는 이렇게 확장돼요</h3>
        </div>
        <span className="rounded-full bg-apple-light-green px-3 py-1 text-[10px] font-black text-apple-green-dark">
          농가 오픈 규칙
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {steps.map((step) => (
          <div key={step.title} className="rounded-2xl bg-stone-50 p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-[10px] font-black text-stone-700">{step.title}</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-apple-red shadow-sm">
                {step.value}
              </span>
            </div>
            <p className="text-[10px] font-bold leading-relaxed text-warm-gray">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const MapLegend = () => (
  <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] border-2 border-stone-100 bg-white p-3 shadow-sm">
    <LegendItem color="bg-apple-red" label="내 농가" />
    <LegendItem color="bg-stone-500" label="잠긴 농가" />
    <LegendItem color="bg-stone-700" label="보관 농가" />
    <LegendItem color="bg-sky-500" label="관광·방문지" />
  </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-stone-50 px-2 py-2">
    <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
    <span className="text-[10px] font-black text-stone-600">{label}</span>
  </div>
);
