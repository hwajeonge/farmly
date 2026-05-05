import React, { useRef, useState } from 'react';
import { showAlert } from '../lib/alertEmitter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Info, X, Trophy, Star, MapPin, Camera, 
  ChevronRight, CheckCircle2, Clock, CloudSun, 
  Navigation, MessageSquare, Heart, ShieldAlert,
  Search, Gamepad2, Gift, Sparkles, Plus, Upload, Trash2
} from 'lucide-react';
import { CatchAppleGame } from './CatchAppleGame';
import { FindGinsengGame } from './FindGinsengGame';
import { BugDefenseGame } from './BugDefenseGame';
import { VISIT_MISSIONS, PLACES } from '../constants';
import { Course, CourseItem, MissionReview, Place, VisitMission, MissionStatus } from '../types';

interface MissionsViewProps {
  onAddPoints: (points: number) => void;
  lives: number;
  onDeductLife: () => void;
  onRestoreLife: (amount?: number) => void;
  missionProgress: Record<string, MissionStatus>;
  onUpdateProgress: (missionId: string, status: MissionStatus) => void;
  missionReviews?: MissionReview[];
  onSaveMissionReview?: (review: MissionReview) => void;
  weather?: string;
  activeCourse?: Course | null;
  favoritePlaceIds?: string[];
  onAIAction?: (name: string, args: any) => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}

type RecommendationReason = 'lunch' | 'dinner' | 'cafe' | 'nearby';

interface SmartRecommendation {
  place: Place;
  arrivalMinutes: number;
  distanceKm: number;
  reason: RecommendationReason;
  note: string;
}

const LUNCH_START = 11 * 60 + 20;
const LUNCH_END = 13 * 60 + 30;
const DINNER_START = 17 * 60 + 30;
const DINNER_END = 19 * 60 + 30;

const parseTimeToMinutes = (time?: string) => {
  const match = time?.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const formatMinutes = (minutes: number) => {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, Math.round(minutes)));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const formatKoreanTime = (minutes: number) => {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, Math.round(minutes)));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours < 12 ? '오전' : '오후';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${displayHour}:${String(mins).padStart(2, '0')}`;
};

const roundToNextTen = (minutes: number) => Math.ceil(minutes / 10) * 10;

const getDistanceKm = (a: Place, b: Place) => {
  const earthRadiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const estimateTravelMinutes = (from?: Place, to?: Place) => {
  if (!from || !to) return 20;
  const distance = getDistanceKm(from, to);
  return Math.max(12, Math.min(55, Math.round(distance * 4 + 10)));
};

const getOperatingWindow = (place: Place) => {
  if (place.operatingHours.includes('24시간') || place.operatingHours.includes('상시')) return null;
  const matches = [...place.operatingHours.matchAll(/(\d{1,2}):(\d{2})/g)];
  if (matches.length < 2) return null;
  const start = Number(matches[0][1]) * 60 + Number(matches[0][2]);
  const end = Number(matches[1][1]) * 60 + Number(matches[1][2]);
  return { start, end };
};

const adjustForOperatingHours = (place: Place, minutes: number) => {
  const window = getOperatingWindow(place);
  if (!window) return roundToNextTen(minutes);
  const minArrival = window.start + 10;
  const latestArrival = window.end - Math.min(place.estimatedStayTime, 60);
  if (minutes < minArrival) return roundToNextTen(minArrival);
  if (minutes > latestArrival) return null;
  return roundToNextTen(minutes);
};

const getPreferredReason = (minutes: number): RecommendationReason => {
  if (minutes >= LUNCH_START && minutes <= LUNCH_END) return 'lunch';
  if (minutes >= DINNER_START && minutes <= DINNER_END) return 'dinner';
  if (minutes >= 13 * 60 + 30 && minutes <= 17 * 60 + 20) return 'cafe';
  return 'nearby';
};

const getReasonLabel = (reason: RecommendationReason) => {
  if (reason === 'lunch') return '점심 식사';
  if (reason === 'dinner') return '저녁 식사';
  if (reason === 'cafe') return '카페 휴식';
  return '가까운 동선';
};

const getReasonNote = (reason: RecommendationReason, place: Place, arrivalMinutes: number) => {
  const time = formatKoreanTime(arrivalMinutes);
  if (reason === 'lunch') return `${time} 도착 기준 점심 식사 장소로 좋아요.`;
  if (reason === 'dinner') return `${time} 도착 기준 저녁 식사 장소로 좋아요.`;
  if (reason === 'cafe') return `${time}쯤 쉬어가기 좋은 카페 동선이에요.`;
  return `${time} 운영시간 안에 들르기 좋은 가까운 장소예요.`;
};

const getCategoryScore = (place: Place, reason: RecommendationReason) => {
  if ((reason === 'lunch' || reason === 'dinner') && place.category === '맛집') return 80;
  if (reason === 'cafe' && place.category === '카페') return 80;
  if (reason === 'nearby' && place.category === '관광지') return 35;
  if (reason === 'nearby' && place.category === '카페') return 25;
  return 0;
};

const getAnchorMinutes = (currentPlace: Place, activeCourse?: Course | null) => {
  const courseItem = activeCourse?.items.find(item => item.placeId === currentPlace.id);
  const courseTime = parseTimeToMinutes(courseItem?.estimatedArrival);
  if (courseTime != null) return courseTime + currentPlace.estimatedStayTime;

  const timedItems = activeCourse?.items
    .map(item => {
      const place = PLACES.find(candidate => candidate.id === item.placeId);
      const minutes = parseTimeToMinutes(item.estimatedArrival);
      return place && minutes != null ? minutes + place.estimatedStayTime : null;
    })
    .filter((value): value is number => value != null);

  if (timedItems && timedItems.length > 0) return Math.max(...timedItems);

  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const buildSmartRecommendations = (
  currentPlace: Place,
  activeCourse?: Course | null,
  favoritePlaceIds: string[] = [],
): SmartRecommendation[] => {
  const coursePlaceIds = new Set(activeCourse?.items.map(item => item.placeId) ?? []);
  const favoriteSet = new Set(favoritePlaceIds);
  const anchorMinutes = getAnchorMinutes(currentPlace, activeCourse);
  const reason = getPreferredReason(anchorMinutes);

  const candidates = PLACES
    .filter(place => place.id !== currentPlace.id)
    .filter(place => place.category !== '숙소' && place.category !== '농가')
    .filter(place => !coursePlaceIds.has(place.id))
    .map(place => {
      const distanceKm = getDistanceKm(currentPlace, place);
      const rawArrival = anchorMinutes + estimateTravelMinutes(currentPlace, place);
      const arrivalMinutes = adjustForOperatingHours(place, rawArrival);
      if (arrivalMinutes == null) return null;

      const score =
        getCategoryScore(place, reason) +
        (favoriteSet.has(place.id) ? 16 : 0) +
        Math.max(0, 30 - distanceKm * 2) +
        (place.category === '카페' && reason !== 'nearby' ? 8 : 0);

      return {
        place,
        arrivalMinutes,
        distanceKm,
        reason,
        note: getReasonNote(reason, place, arrivalMinutes),
        score,
      };
    })
    .filter((item): item is SmartRecommendation & { score: number } => item != null)
    .sort((a, b) => b.score - a.score);

  return candidates.slice(0, 2);
};

const scheduleCourseItems = (items: CourseItem[]) => {
  const ordered = [...items].sort((a, b) => a.order - b.order);
  const firstTime = parseTimeToMinutes(ordered[0]?.estimatedArrival) ?? 10 * 60;
  let cursor = firstTime;

  return ordered.map((item, index) => {
    const place = PLACES.find(candidate => candidate.id === item.placeId);
    const previous = index > 0 ? PLACES.find(candidate => candidate.id === ordered[index - 1].placeId) : null;

    if (index === 0) {
      const adjusted = place ? adjustForOperatingHours(place, cursor) ?? cursor : cursor;
      cursor = adjusted;
      return { ...item, order: index, estimatedArrival: formatMinutes(adjusted) };
    }

    const previousPlace = previous ?? undefined;
    const currentPlace = place ?? undefined;
    cursor += (previous?.estimatedStayTime ?? 45) + estimateTravelMinutes(previousPlace, currentPlace);
    const adjusted = place ? adjustForOperatingHours(place, cursor) ?? cursor : cursor;
    cursor = adjusted;
    return { ...item, order: index, estimatedArrival: formatMinutes(adjusted) };
  });
};

export const MissionsView: React.FC<MissionsViewProps> = ({ 
  onAddPoints, 
  lives, 
  onDeductLife, 
  onRestoreLife,
  missionProgress,
  onUpdateProgress,
  missionReviews = [],
  onSaveMissionReview,
  weather = '맑음',
  activeCourse,
  favoritePlaceIds = [],
  onAIAction,
  onNavigate,
}) => {
  const [showCatchGame, setShowCatchGame] = useState(false);
  const [showGinsengGame, setShowGinsengGame] = useState(false);
  const [showBugGame, setShowBugGame] = useState(false);
  const [showInstructionsFor, setShowInstructionsFor] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<VisitMission | null>(null);
  const [selectedPrepareMission, setSelectedPrepareMission] = useState<VisitMission | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [localProgress, setLocalProgress] = useState<Record<string, MissionStatus>>({});
  const stageRewardLocks = useRef<Set<string>>(new Set());
  const livesRef = useRef(lives);
  const gameStartLockedRef = useRef(false);
  livesRef.current = lives;

  const getEffectiveStatus = (missionId: string) => localProgress[missionId] || missionProgress[missionId] || 'none';

  const claimStageReward = (
    mission: VisitMission,
    stageId: 'prepare' | 'arrival' | 'action' | 'review',
    nextStatus: MissionStatus,
    expectedStatus: MissionStatus,
  ) => {
    const lockKey = `${mission.id}:${stageId}`;
    if (stageRewardLocks.current.has(lockKey)) return false;
    if (getEffectiveStatus(mission.id) !== expectedStatus) return false;

    const stage = mission.stages.find(s => s.id === stageId);
    stageRewardLocks.current.add(lockKey);
    setLocalProgress(prev => ({ ...prev, [mission.id]: nextStatus }));
    onUpdateProgress(mission.id, nextStatus);
    if (stage?.reward) onAddPoints(stage.reward);
    return true;
  };

  const consumeLifeForMiniGame = () => {
    if (livesRef.current <= 0) {
      showAlert('하트가 부족해요!\n하트는 24시간마다 자동으로 채워집니다.', '❤️', 'warning');
      return false;
    }
    livesRef.current -= 1;
    onDeductLife();
    return true;
  };

  const handleStartMiniGame = (gameId: string) => {
    if (gameStartLockedRef.current) return;
    if (!consumeLifeForMiniGame()) return;

    gameStartLockedRef.current = true;
    if (gameId === 'catch') setShowCatchGame(true);
    if (gameId === 'ginseng') setShowGinsengGame(true);
    if (gameId === 'bug') setShowBugGame(true);
  };

  const handleCloseMiniGame = () => {
    gameStartLockedRef.current = false;
    setShowCatchGame(false);
    setShowGinsengGame(false);
    setShowBugGame(false);
  };

  const handleGameFinish = (points: number, _isGameOver: boolean) => {
    if (points > 0) onAddPoints(points);
    handleCloseMiniGame();
  };

  const handleMissionAction = (mission: VisitMission) => {
    const currentStatus = getEffectiveStatus(mission.id);
    
    if (currentStatus === 'none') {
      setSelectedPrepareMission(mission);
    } else if (currentStatus === 'prepare') {
      claimStageReward(mission, 'arrival', 'arrival', 'prepare');
    } else if (currentStatus === 'arrival') {
      setSelectedMission(mission);
      setShowPhotoPopup(true);
    } else if (currentStatus === 'action') {
      const savedReview = missionReviews.find(item => item.missionId === mission.id);
      setReview(savedReview?.content ?? '');
      setRating(savedReview?.rating ?? 0);
      setSelectedMission(mission);
      setShowReviewPopup(true);
    }
  };

  const handlePrepareConfirm = () => {
    if (!selectedPrepareMission) return;
    const didClaim = claimStageReward(selectedPrepareMission, 'prepare', 'prepare', 'none');
    if (didClaim) {
      setSelectedPrepareMission(null);
    }
  };

  const handlePhotoSubmit = () => {
    if (selectedMission && uploadedPhoto) {
      const didClaim = claimStageReward(selectedMission, 'action', 'action', 'arrival');
      if (!didClaim) return;
      setShowPhotoPopup(false);
      setUploadedPhoto(null);
      setReview('');
      setRating(0);
      // Automatically open review popup after photo
      setShowReviewPopup(true);
    }
  };

  const handleReviewSubmit = () => {
    if (selectedMission) {
      if (rating === 0 && !review.trim()) {
        showAlert('별점이나 후기 내용을 입력해주세요.\n작성한 후기는 마이페이지에서 다시 볼 수 있어요.', '📝', 'warning');
        return;
      }
      const didClaim = claimStageReward(selectedMission, 'review', 'completed', 'action');
      if (!didClaim) return;
      const place = PLACES.find(item => item.id === selectedMission.placeId);
      const savedReview = missionReviews.find(item => item.missionId === selectedMission.id);
      const now = new Date().toISOString();

      onSaveMissionReview?.({
        id: savedReview?.id ?? `${selectedMission.id}_${Date.now()}`,
        missionId: selectedMission.id,
        placeId: selectedMission.placeId,
        missionTitle: selectedMission.title,
        placeName: place?.name ?? selectedMission.title,
        rating,
        content: review.trim(),
        createdAt: savedReview?.createdAt ?? now,
        updatedAt: now,
      });
      setShowReviewPopup(false);
      setReview('');
      setRating(0);
      setSelectedMission(null);
    }
  };

  const handleAddRecommendedPlace = (
    currentPlace: Place,
    recommendation: SmartRecommendation,
  ) => {
    const recommendationItem: CourseItem = {
      placeId: recommendation.place.id,
      order: activeCourse?.items.length ?? 1,
      estimatedArrival: formatMinutes(recommendation.arrivalMinutes),
      status: 'none',
      memo: `${getReasonLabel(recommendation.reason)} 추천 · ${recommendation.distanceKm.toFixed(1)}km · ${recommendation.note}`,
    };

    if (activeCourse) {
      const currentIndex = activeCourse.items.findIndex(item => item.placeId === currentPlace.id);
      const insertIndex = currentIndex === -1 ? activeCourse.items.length : currentIndex + 1;
      const withoutDuplicate = activeCourse.items.filter(item => item.placeId !== recommendation.place.id);
      const nextItems = [
        ...withoutDuplicate.slice(0, insertIndex),
        recommendationItem,
        ...withoutDuplicate.slice(insertIndex),
      ].map((item, index) => ({ ...item, order: index }));

      onAIAction?.('manage_travel_course', {
        action: 'update',
        items: scheduleCourseItems(nextItems),
      });
    } else {
      onAIAction?.('manage_travel_course', {
        action: 'create',
        courseName: '영주 추천 방문 코스',
        items: scheduleCourseItems([
          {
            placeId: currentPlace.id,
            order: 0,
            estimatedArrival: formatMinutes(Math.max(10 * 60, recommendation.arrivalMinutes - currentPlace.estimatedStayTime - estimateTravelMinutes(currentPlace, recommendation.place))),
            status: 'completed',
            memo: '완료한 방문 미션 장소',
          },
          recommendationItem,
        ]),
      });
    }

    showAlert(
      `${recommendation.place.name}을 코스에 추가했어요.\n${recommendation.note}\n동선에 맞춰 방문 시간도 다시 정리했어요.`,
      '🗺️',
      'success',
    );
    onNavigate?.('activity', 'course');
  };

  const games = [
    { id: 'catch', title: '사과 받기', icon: '🍎', reward: '최대 200P', desc: '떨어지는 사과를 바구니에 담으세요!' },
    { id: 'ginseng', title: '인삼 찾기', icon: '✨', reward: '최대 250P', desc: '돌을 피해 인삼을 모두 찾으세요!' },
    { id: 'bug', title: '벌레 퇴치', icon: '🐛', reward: '최대 300P', desc: '사과나무를 갉아먹는 벌레를 막으세요!' },
  ];

  return (
    <div className="py-4 space-y-8">
      {/* Mini Games Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <Gamepad2 size={14} className="text-apple-red" />
            미니 게임
          </h3>
          <div className="flex items-center gap-1.5 bg-apple-red/10 px-3 py-1 rounded-full">
            <Heart size={10} fill="#ef4444" className="text-apple-red" />
            <span className="text-[10px] font-black text-apple-red">{lives} / 5</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {games.map((game) => (
            <div 
              key={game.id} 
              onClick={() => handleStartMiniGame(game.id)}
              className="farm-card p-4 sm:p-5 flex items-center gap-3 sm:gap-5 group cursor-pointer hover:border-apple-red/30 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-stone-50 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-2xl sm:text-4xl group-hover:scale-110 transition-transform shrink-0">
                {game.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                  <h4 className="font-black text-base sm:text-lg truncate">{game.title}</h4>
                  <span className="px-1.5 sm:px-2 py-0.5 bg-yeoju-gold/10 text-yeoju-gold text-[8px] sm:text-[10px] font-black rounded-lg whitespace-nowrap">
                    {game.reward}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-400 font-medium truncate">{game.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInstructionsFor(game.id);
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-stone-100 text-stone-400 hover:bg-stone-200 transition-all"
                >
                  <Info size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <div 
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                    lives > 0 
                      ? 'bg-apple-red text-white shadow-[0_3px_0_0_#d32f2f] sm:shadow-[0_4px_0_0_#d32f2f]' 
                      : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  <Play size={18} className="sm:w-[20px] sm:h-[20px]" fill="currentColor" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visit Missions Section */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-apple-green/10 text-apple-green">
            <MapPin size={19} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-apple-green">Visit Mission</p>
            <h3 className="text-2xl font-black leading-tight text-stone-900">영주 방문 미션</h3>
          </div>
        </div>
        <div className="space-y-4">
          {VISIT_MISSIONS.map((mission) => {
            const status = getEffectiveStatus(mission.id);
            const place = PLACES.find(p => p.id === mission.placeId);
            const prepareLocked = stageRewardLocks.current.has(`${mission.id}:prepare`);

            return (
              <div key={mission.id} className="farm-card overflow-hidden">
                <div className="relative h-40">
                  <img src={mission.img} alt={mission.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black shadow-sm">
                    {mission.type}
                  </div>
                  {status === 'completed' && (
                    <div className="absolute inset-0 bg-apple-green/40 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="bg-white text-apple-green px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl">
                        <CheckCircle2 size={24} />
                        미션 완료
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg">{mission.title}</h4>
                    <div className="flex items-center gap-1 text-yeoju-gold font-black">
                      <Gift size={14} />
                      <span className="text-sm">
                        {mission.stages.reduce((sum, s) => sum + s.reward, 0)}P
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 font-bold mb-4">{mission.description}</p>
                  
                  {/* Journey Steps */}
                  <div className="space-y-3 mb-6">
                    {mission.stages.map((stage) => {
                      const isCompleted = 
                        (status === 'completed') ||
                        (stage.id === 'prepare' && ['prepare', 'arrival', 'action'].includes(status)) ||
                        (stage.id === 'arrival' && ['arrival', 'action'].includes(status)) ||
                        (stage.id === 'action' && ['action'].includes(status)) ||
                        (stage.id === 'review' && ['completed'].includes(status));
                      
                      const isCurrent = 
                        (status === 'none' && stage.id === 'prepare') ||
                        (status === 'prepare' && stage.id === 'arrival') ||
                        (status === 'arrival' && stage.id === 'action') ||
                        (status === 'action' && stage.id === 'review');

                      return (
                        <div key={stage.id} className={`flex items-start gap-3 p-3 rounded-2xl transition-all ${isCurrent ? 'bg-apple-red/5 border-2 border-apple-red/10' : 'bg-stone-50'}`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 ${isCompleted ? 'bg-apple-green text-white' : isCurrent ? 'bg-apple-red text-white' : 'bg-stone-200 text-stone-400'}`}>
                            {isCompleted ? <CheckCircle2 size={16} /> : stage.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className={`text-[10px] font-black ${isCurrent ? 'text-apple-red' : 'text-stone-400'}`}>
                                {stage.label}
                              </span>
                              <span className="text-[10px] font-black text-yeoju-gold">+{stage.reward}P</span>
                            </div>
                            <p className={`text-xs font-bold truncate ${isCurrent ? 'text-stone-700' : 'text-stone-400'}`}>
                              {stage.task}
                            </p>
                            {isCurrent && stage.id === 'prepare' && (
                              <div className="mt-2 text-[9px] font-bold text-stone-400 bg-white/50 p-1.5 rounded-lg border border-stone-100">
                                💡 Tip: 관광 정책 및 이동수단 자동 확인됨
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {status !== 'completed' && (
                    <button 
                      onClick={() => handleMissionAction(mission)}
                      disabled={prepareLocked && status === 'none'}
                      className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                        status === 'none' ? 'bg-white border-4 border-stone-100 text-stone-600' :
                        status === 'prepare' ? 'bg-blue-500 text-white shadow-[0_4px_0_0_#2b6cb0]' :
                        status === 'arrival' ? 'bg-yeoju-gold text-white shadow-[0_4px_0_0_#d4a017]' :
                        'bg-apple-red text-white shadow-[0_4px_0_0_#d32f2f]'
                      }`}
                    >
                      {status === 'none' && <><Info size={18} /> 여행 전 정보 및 정책 확인</>}
                      {status === 'prepare' && <><Navigation size={18} /> 목적지 도착 (체크인)</>}
                      {status === 'arrival' && <><Camera size={18} /> 미션 수행 (행동 인증)</>}
                      {status === 'action' && <><MessageSquare size={18} /> 방문 후기 등록</>}
                    </button>
                  )}

                  {/* Recommendations after completion */}
                  {status === 'completed' && place && (
                    <div className="mt-4 p-5 bg-stone-50 rounded-[2rem] border-2 border-stone-100">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] font-black text-stone-400 uppercase flex items-center gap-1.5">
                          <Sparkles size={12} className="text-yeoju-gold" /> 이런 곳은 어때요?
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-blue-400 bg-blue-50 px-2 py-0.5 rounded-md">{weather}</span>
                          <span className="text-[10px] font-black text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">동선 최적화</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {buildSmartRecommendations(place, activeCourse, favoritePlaceIds)
                          .map((recommendation) => {
                            const rec = recommendation.place;
                            return (
                              <button
                                key={rec.id}
                                type="button"
                                onClick={() => handleAddRecommendedPlace(place, recommendation)}
                                className="w-full bg-white p-3 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-3 group cursor-pointer hover:border-apple-red/20 transition-all text-left active:scale-[0.99]"
                              >
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                                  <img src={rec.image} className="w-full h-full object-cover" alt={rec.name} referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[9px] font-black text-apple-red px-1.5 py-0.5 bg-apple-red/5 rounded-md">
                                      {getReasonLabel(recommendation.reason)}
                                    </span>
                                    <h5 className="text-xs font-black truncate">{rec.name}</h5>
                                  </div>
                                  <p className="text-[10px] text-stone-400 font-bold mb-1 flex items-center gap-1">
                                    <MapPin size={10} /> {recommendation.distanceKm.toFixed(1)}km • {formatKoreanTime(recommendation.arrivalMinutes)} 도착
                                  </p>
                                  <p className="mb-1 line-clamp-2 text-[9px] font-bold leading-relaxed text-stone-400">
                                    {recommendation.note} 운영 {rec.operatingHours}
                                  </p>
                                  <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                                    <Plus size={8} /> 누르면 코스에 추가하고 시간 재정렬
                                  </div>
                                </div>
                                <ChevronRight size={16} className="text-stone-300 group-hover:text-apple-red transition-colors" />
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Game Modals */}
      <AnimatePresence>
        {showCatchGame && (
          <CatchAppleGame 
            onClose={handleCloseMiniGame}
            onFinish={handleGameFinish} 
            onRestart={consumeLifeForMiniGame}
          />
        )}
        {showGinsengGame && (
          <FindGinsengGame 
            onClose={handleCloseMiniGame}
            onFinish={handleGameFinish} 
            onRestart={consumeLifeForMiniGame}
          />
        )}
        {showBugGame && (
          <BugDefenseGame 
            onClose={handleCloseMiniGame}
            onFinish={handleGameFinish} 
            onRestart={consumeLifeForMiniGame}
          />
        )}

        {/* Pre-visit Info Modal */}
        {selectedPrepareMission && (() => {
          const place = PLACES.find(p => p.id === selectedPrepareMission.placeId);
          const prepareStage = selectedPrepareMission.stages.find(s => s.id === 'prepare');
          const isLocked = stageRewardLocks.current.has(`${selectedPrepareMission.id}:prepare`);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-5 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 16 }}
                className="max-h-[88vh] w-full max-w-sm overflow-hidden rounded-[2.25rem] bg-white shadow-2xl"
              >
                <div className="max-h-[88vh] overflow-y-auto p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-apple-green">Before Visit</p>
                      <h3 className="mt-1 text-xl font-black leading-tight text-stone-900">여행 전 정보 및 정책</h3>
                      <p className="mt-1 text-xs font-bold leading-relaxed text-stone-500">{selectedPrepareMission.title}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPrepareMission(null)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 transition-all active:scale-90"
                      aria-label="여행 전 정보 닫기"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {place && (
                    <div className="mb-4 overflow-hidden rounded-[1.75rem] border-2 border-stone-100 bg-stone-50">
                      <img src={place.image} alt={place.name} className="h-28 w-full object-cover" referrerPolicy="no-referrer" />
                      <div className="p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h4 className="text-base font-black text-stone-800">{place.name}</h4>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-apple-red shadow-sm">{place.category}</span>
                        </div>
                        <p className="text-[11px] font-bold leading-relaxed text-stone-500">{place.description}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <InfoRow icon={Clock} label="운영 정보" value={place?.operatingHours || '방문 전 운영 여부 확인'} />
                    <InfoRow icon={MapPin} label="주소" value={place?.address || place?.location || '영주시 일대'} />
                    <InfoRow icon={Navigation} label="주차/이동" value={place?.parking || '대중교통 및 현장 주차 가능 여부 확인'} />
                    <InfoRow icon={Gift} label="방문 혜택" value={place?.benefits?.join(', ') || '현장 혜택 확인'} />
                  </div>

                  <div className="mt-4 rounded-[1.5rem] border-2 border-apple-green/20 bg-apple-light-green/60 p-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-apple-green-dark">Mission Policy</p>
                    <ul className="space-y-2 text-[11px] font-bold leading-relaxed text-stone-600">
                      <li>방문 전 단계는 장소 정보와 정책을 확인하면 1회만 보상됩니다.</li>
                      <li>도착 체크인은 실제 장소 근처에서 진행하는 단계로 분리됩니다.</li>
                      <li>사진 인증과 후기는 현장 방문 후 순서대로 완료할 수 있어요.</li>
                      {prepareStage && <li>이번 준비 미션: {prepareStage.task}</li>}
                    </ul>
                  </div>

                  <button
                    onClick={handlePrepareConfirm}
                    disabled={isLocked || getEffectiveStatus(selectedPrepareMission.id) !== 'none'}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-apple-red py-4 text-sm font-black text-white shadow-[0_5px_0_0_#d32f2f] transition-all active:translate-y-1 active:shadow-none disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
                  >
                    <CheckCircle2 size={18} />
                    {isLocked ? '이미 확인 완료' : `정보 확인 완료하고 ${prepareStage ? `+${prepareStage.reward}P 받기` : '완료하기'}`}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}

        {/* Instructions Modal */}
        {showInstructionsFor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center relative"
            >
              <button 
                onClick={() => setShowInstructionsFor(null)}
                className="absolute top-6 right-6 p-2 text-stone-300 hover:text-stone-500 transition-colors"
              >
                <X size={24} />
              </button>
              <div className="w-16 h-16 bg-apple-red/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">📖</div>
              <h3 className="text-2xl font-black mb-4">
                {showInstructionsFor === 'catch' && '사과 받기 게임 방법'}
                {showInstructionsFor === 'ginseng' && '풍기 인삼 찾기 방법'}
                {showInstructionsFor === 'bug' && '벌레 퇴치 게임 방법'}
              </h3>
              <div className="text-left space-y-3 mb-8">
                {showInstructionsFor === 'catch' && (
                  <>
                    <p className="text-sm font-bold text-stone-600 flex gap-2"><span>🍎</span> 떨어지는 사과를 바구니로 받으세요.</p>
                    <p className="text-sm font-bold text-stone-600 flex gap-2"><span>💣</span> 폭탄을 받으면 하트가 깎여요!</p>
                    <p className="text-sm font-bold text-stone-600 flex gap-2"><span>✨</span> 황금 사과는 높은 점수를 줍니다.</p>
                  </>
                )}
                {showInstructionsFor === 'ginseng' && (
                  <>
                    <p className="text-sm font-bold text-stone-600 flex gap-2"><span>✨</span> 모든 인삼을 찾아 클릭하세요.</p>
                    <p className="text-sm font-bold text-stone-600 flex gap-2"><span>🪨</span> 돌을 클릭하면 게임이 종료됩니다.</p>
                    <p className="text-sm font-bold text-stone-600 flex gap-2"><span>🚩</span> 우클릭으로 돌이 의심되는 곳을 표시하세요.</p>
                  </>
                )}
                {showInstructionsFor === 'bug' && (
                  <>
                    <p className="text-sm font-bold text-stone-600 flex gap-2"><span>🐛</span> 나무로 다가오는 벌레를 클릭해 잡으세요.</p>
                    <p className="text-sm font-bold text-stone-600 flex gap-2"><span>🛡️</span> 벌레가 나무에 닿으면 체력이 깎여요.</p>
                    <p className="text-sm font-bold text-stone-600 flex gap-2"><span>⚡</span> 연속으로 잡으면 콤보 점수가 올라갑니다!</p>
                  </>
                )}
              </div>
              <button 
                onClick={() => setShowInstructionsFor(null)}
                className="w-full py-4 bg-apple-red text-white rounded-2xl font-black shadow-[0_6px_0_0_#d32f2f] active:shadow-none active:translate-y-1 transition-all"
              >
                확인했습니다
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Photo Upload Popup */}
        {showPhotoPopup && selectedMission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="text-center mb-6 relative">
                <button 
                  onClick={() => {
                    setShowPhotoPopup(false);
                    setUploadedPhoto(null);
                    setSelectedMission(null);
                  }}
                  className="absolute -top-4 -right-4 p-2 text-stone-300 hover:text-stone-500 transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📸</div>
                <h3 className="text-xl font-black mb-2">인증샷 업로드</h3>
                <p className="text-xs text-stone-500 font-bold">{selectedMission.title} 미션 수행을 인증해주세요!</p>
              </div>

              <div className="mb-8">
                {uploadedPhoto ? (
                  <div className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-stone-100 shadow-inner group">
                    <img src={uploadedPhoto} className="w-full h-full object-cover" alt="Uploaded mission" />
                    <button 
                      onClick={() => setUploadedPhoto(null)}
                      className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-2xl shadow-xl transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square rounded-[2rem] border-4 border-dashed border-stone-100 bg-stone-50/50 cursor-pointer hover:border-apple-red/30 transition-all group">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-stone-300 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <p className="font-black text-stone-400 text-sm">사진을 선택하거나 끌어다 놓으세요</p>
                    <p className="text-[10px] font-bold text-stone-300 mt-1">파일 제한: 5MB 이하</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploading(true);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setUploadedPhoto(reader.result as string);
                            setIsUploading(false);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <button 
                onClick={handlePhotoSubmit}
                disabled={!uploadedPhoto || isUploading}
                className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                  uploadedPhoto && !isUploading 
                    ? 'bg-apple-red text-white shadow-[0_6px_0_0_#d32f2f] active:shadow-none active:translate-y-1' 
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <>업로드 중...</>
                ) : (
                  <><CheckCircle2 size={18} /> 인증 완료하기</>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Review Popup */}
        {showReviewPopup && selectedMission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="text-center mb-6 relative">
                <button 
                  onClick={() => setShowReviewPopup(false)}
                  className="absolute -top-4 -right-4 p-2 text-stone-300 hover:text-stone-500 transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="w-16 h-16 bg-apple-red/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📝</div>
                <h3 className="text-xl font-black mb-2">방문 후기 작성</h3>
                <p className="text-xs text-stone-500 font-bold">{selectedMission.title}에서의 경험은 어떠셨나요?</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}>
                    <Star size={32} fill={s <= rating ? "#e9c46a" : "none"} className={s <= rating ? "text-yeoju-gold" : "text-stone-200"} />
                  </button>
                ))}
              </div>

              <textarea 
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="후기를 작성해주세요 (선택사항)"
                className="w-full p-4 bg-stone-50 rounded-2xl border-4 border-stone-100 font-bold text-sm h-32 focus:outline-none focus:border-apple-red transition-all mb-6"
              />

              <button 
                onClick={handleReviewSubmit}
                className="w-full py-4 bg-apple-red text-white rounded-2xl font-black shadow-[0_6px_0_0_#d32f2f] active:shadow-none active:translate-y-1 transition-all"
              >
                후기 등록하고 300P 받기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex gap-3 rounded-[1.35rem] border border-stone-100 bg-white p-3 shadow-sm">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-apple-green">
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">{label}</p>
      <p className="mt-0.5 text-[11px] font-bold leading-relaxed text-stone-700">{value}</p>
    </div>
  </div>
);
