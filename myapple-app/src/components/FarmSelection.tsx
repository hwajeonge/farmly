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

const MAP_BACKGROUND_SRC = '/images/yeongju-map-bg.png';

const PLACE_MARKERS: Record<string, { x: number; y: number; kind: PlaceMarkerKind }> = {
  // 관광지/식당 이름은 지도 위에 표시하지 않고, 클릭 영역만 올립니다.
  p1: { x: 82, y: 15, kind: 'temple' },
  p4: { x: 18, y: 78, kind: 'village' },
  p5: { x: 10, y: 58, kind: 'food' },
  p9: { x: 90, y: 33, kind: 'cafe' },
  p12: { x: 39, y: 93, kind: 'heritage' },
};

const FARM_SLOT_POSITIONS = [
  // 새 배경 이미지 기준 위치입니다.
  // 0번은 이미지에 이미 그려진 열린 '내 농장' 위치입니다.
  { x: 50, y: 44 },
  { x: 38, y: 28 },
  { x: 49, y: 67 },
  { x: 76, y: 68 },
  { x: 17, y: 43 },
];

const getFarmMapPosition = (farm: Farm, index: number) => {
  const slot = FARM_SLOT_POSITIONS[index % FARM_SLOT_POSITIONS.length];
  return slot ?? farm.coords;
};


const PLACE_MARKER_IDS = Object.keys(PLACE_MARKERS);
const MAP_PLACES = PLACES.filter(place => PLACE_MARKER_IDS.includes(place.id));

const getPlaceMarkerIcon = (kind: PlaceMarkerKind) => {
  switch (kind) {
    case 'station':
      return <TrainFront size={12} />;
    case 'temple':
    case 'heritage':
      return <Landmark size={12} />;
    case 'market':
      return <StoreIcon size={12} />;
    case 'village':
      return <House size={12} />;
    case 'food':
      return <Utensils size={12} />;
    case 'cafe':
      return <Coffee size={12} />;
    default:
      return <Sprout size={12} />;
  }
};

const getPlaceMarkerTone = (place: Place) => {
  if (place.category === '맛집') return 'border-orange-100 bg-orange-50 text-orange-600';
  if (place.category === '카페') return 'border-amber-100 bg-amber-50 text-amber-700';
  return 'border-sky-100 bg-sky-50 text-sky-600';
};


export const FarmSelection: React.FC<FarmSelectionProps> = ({
  onAdopt,
  adoptedFarmIds,
  storedFarmIds,
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
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const activeFarmCount = (adoptedFarmIds || []).filter(id => !(storedFarmIds || []).includes(id)).length;
  const nextFarmProgress = FARMS
    .filter(farm => (adoptedFarmIds || []).includes(farm.id) && !(storedFarmIds || []).includes(farm.id))
    .map(farm => trees.filter(tree => tree.farmId === farm.id).length)
    .reduce((max, count) => Math.max(max, Math.min(count, 3)), 0);
  const selectableFarms = FARMS.filter(farm => (adoptedFarmIds || []).includes(farm.id) && !(storedFarmIds || []).includes(farm.id));

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
                <div className="map-container mb-4 overflow-hidden rounded-[2.25rem] border-4 border-white bg-white shadow-[0_18px_40px_rgba(90,62,43,0.14)]">
                  <div className="map-surface relative h-[520px] overflow-hidden bg-[#EAF8F0]">
                    <div className="pointer-events-none absolute left-3 top-3 z-[80] flex items-center gap-1.5 rounded-full border border-red-100 bg-white/90 px-3 py-1.5 text-[10px] font-black text-apple-red shadow-sm backdrop-blur">
                      <Trees size={12} />
                      🍎 표시 = 내 농가
                    </div>

                    <div className="pointer-events-none absolute right-3 top-3 z-[80] rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-black text-stone-600 shadow-sm backdrop-blur">
                      🌤 영주 22℃
                    </div>

                    <motion.div
                      drag
                      dragMomentum={false}
                      dragElastic={0.08}
                      dragConstraints={{ left: -310, right: 0, top: -40, bottom: 0 }}
                      className="absolute left-0 top-0 h-[560px] w-[760px] cursor-grab active:cursor-grabbing"
                    >
                      <img
                        src={MAP_BACKGROUND_SRC}
                        alt="영주 사과밭 지도"
                        className="absolute inset-0 h-full w-full select-none object-cover"
                        draggable={false}
                      />

                      {MAP_PLACES.map((place) => {
                        const marker = PLACE_MARKERS[place.id];
                        if (!marker) return null;
                        const isFood = place.category === '맛집' || place.category === '카페';

                        return (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => setSelectedPlace(place)}
                            className="absolute z-30 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/0 transition-all hover:bg-white/15 active:scale-95"
                            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                            aria-label={`${place.name} 정보 보기`}
                          >
                             <span
                              className={cn(
                                'flex items-center gap-1 rounded-2xl border-2 border-white bg-white/95 px-2.5 py-1.5 text-[10px] font-black shadow-[0_8px_18px_rgba(90,62,43,0.14)] backdrop-blur',
                                isFood ? 'text-orange-600' : 'text-sky-600',
                              )}
                            >
                              <span className={cn('flex h-5 w-5 items-center justify-center rounded-full', getPlaceMarkerTone(place))}>
                                {getPlaceMarkerIcon(marker.kind)}
                              </span>
                              <span className="max-w-[76px] truncate">{place.name}</span>
                            </span>
                          </button>
                        );
                      })}

                      {FARMS.map((farm, index) => {
                        const isUnlocked = (adoptedFarmIds || []).includes(farm.id);
                        const isStored = (storedFarmIds || []).includes(farm.id);
                        const canEnterFarm = isUnlocked && !isStored;
                        const treesInFarm = trees.filter(tree => tree.farmId === farm.id).length;
                        const position = getFarmMapPosition(farm, index);

                        return (
                          <motion.button
                            key={farm.id}
                            whileHover={{ scale: canEnterFarm ? 1.04 : 1.02, y: canEnterFarm ? -2 : -1 }}
                            onClick={() => handleFarmSelect(farm)}
                            className={cn(
                              'absolute z-50 -translate-x-1/2 -translate-y-1/2 focus:outline-none',
                              (!isUnlocked || isStored) && 'opacity-85',
                            )}
                            style={{ left: `${position.x}%`, top: `${position.y}%` }}
                            aria-label={`${farm.name} 선택`}
                          >
                            {canEnterFarm ? (
                              <div className="relative flex flex-col items-center">
                                <span className="pointer-events-none absolute -inset-4 rounded-full bg-apple-red/25 blur-md" />
                                <span className="relative flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-apple-red text-lg text-white shadow-[0_8px_18px_rgba(229,57,53,0.35)]">
                                  🍎
                                </span>
                                <span className="mt-1 rounded-full border border-red-100 bg-white/95 px-2.5 py-1 text-[10px] font-black text-apple-red shadow-sm backdrop-blur">
                                  내 농가
                                </span>
                                <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-black text-apple-green shadow-sm">
                                  {treesInFarm}/5 나무
                                </span>
                              </div>
                            ) : (
                              <div className="relative flex flex-col items-center">
                                <span
                                  className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-[0_5px_12px_rgba(90,62,43,0.2)] ring-2 ring-white/60',
                                    isStored ? 'bg-stone-700 text-white' : 'bg-stone-500/90 text-white',
                                  )}
                                >
                                  {isStored ? <ShoppingBag size={13} /> : <Lock size={13} />}
                                </span>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>

                    <AnimatePresence>
                      {selectedPlace && (
                        <motion.div
                          key={selectedPlace.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="absolute bottom-3 left-3 right-3 z-[120] rounded-[1.5rem] border-2 border-white bg-white/96 p-4 shadow-[0_14px_30px_rgba(90,62,43,0.2)] backdrop-blur"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="mb-1 flex items-center gap-2">
                                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border', getPlaceMarkerTone(selectedPlace))}>
                                  {getPlaceMarkerIcon(PLACE_MARKERS[selectedPlace.id]?.kind ?? 'heritage')}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-black text-stone-900">{selectedPlace.name}</p>
                                  <p className="text-[10px] font-black text-stone-400">{selectedPlace.category}</p>
                                </div>
                              </div>
                              <p className="text-xs font-bold leading-relaxed text-stone-500 [word-break:keep-all]">
                                {selectedPlace.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedPlace(null)}
                              className="shrink-0 rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-black text-stone-500 active:scale-95"
                            >
                              닫기
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pointer-events-none absolute bottom-3 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-white/85 px-3 py-1 text-[10px] font-black text-stone-400 shadow-sm backdrop-blur">
                      지도를 드래그해서 이동해보세요
                    </div>
                  </div>
                </div>

                <MapLegend />

                <section className="mt-3 rounded-[1.5rem] border-2 border-red-100 bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-apple-red">Farm Shortcut</p>
                      <h3 className="text-sm font-black text-stone-800">지금 선택 가능한 농가</h3>
                    </div>
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-apple-red">
                      {selectableFarms.length}곳
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectableFarms.map((farm) => {
                      const treesInFarm = trees.filter(tree => tree.farmId === farm.id).length;
                      const hasFarmSeed = ownedItems.some(item => item.id === `seed_${farm.id}` && item.count > 0);
                      const farmShortcutNumber = selectableFarms.findIndex(item => item.id === farm.id) + 1;
                      return (
                        <button
                          key={farm.id}
                          type="button"
                          onClick={() => handleFarmSelect(farm)}
                          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2.5 text-left transition-all active:scale-[0.99]"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-apple-red shadow-sm">
                              <span className="text-xs font-black">{farmShortcutNumber}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-black text-stone-800">{farm.name}</p>
                              <p className="mt-0.5 text-[10px] font-bold text-stone-400">
                                {treesInFarm}/5 나무 · {hasFarmSeed ? '바로 심기 가능' : '씨앗 먼저 구매'}
                              </p>
                            </div>
                          </div>
                          <span className={cn(
                            'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black',
                            hasFarmSeed ? 'bg-apple-green/10 text-apple-green' : 'bg-yellow-50 text-yellow-700',
                          )}>
                            {hasFarmSeed ? '심기' : '상점'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
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
    { title: '농가 선택', desc: '처음에는 랜덤으로 열린\n내 농가 1곳에서 시작해요.', value: '1곳' },
    { title: '나무 3그루', desc: '한 농가에 나무 3그루를 심으면\n다음 농가가 열려요.', value: '3그루' },
    { title: '최대 관리', desc: '농가당 나무 5그루,\n활성 농가 3곳까지 관리해요.', value: '5/3' },
    { title: '수확 배송', desc: '각 나무는 30일 성장 후\n수확과 배송 신청으로 이어져요.', value: '30일' },
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
            <p className="whitespace-pre-line text-[10px] font-bold leading-relaxed text-warm-gray [word-break:keep-all]">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const MapLegend = () => (
  <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] border-2 border-stone-100 bg-white p-3 shadow-sm">
    <LegendItem color="bg-apple-red ring-2 ring-apple-red/20" label="심기 가능 농가" />
    <LegendItem color="bg-stone-500" label="잠긴 농가" />
    <LegendItem color="bg-stone-700" label="보관 농가" />
    <LegendItem color="bg-sky-400" label="관광·맛집" />
  </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-stone-50 px-2 py-2">
    <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
    <span className="text-[10px] font-black text-stone-600">{label}</span>
  </div>
);
