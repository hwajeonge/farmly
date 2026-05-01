import React, { useState } from 'react';
import { showAlert } from '../lib/alertEmitter';
import { motion, AnimatePresence } from 'motion/react';
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
import { VisitMission, MissionStatus } from '../types';

interface MissionsViewProps {
  onAddPoints: (points: number) => void;
  lives: number;
  onDeductLife: () => void;
  onRestoreLife: (amount?: number) => void;
  missionProgress: Record<string, MissionStatus>;
  onUpdateProgress: (missionId: string, status: MissionStatus) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({ 
  onAddPoints, 
  lives, 
  onDeductLife, 
  onRestoreLife,
  missionProgress,
  onUpdateProgress
}) => {
  const [showCatchGame, setShowCatchGame] = useState(false);
  const [showGinsengGame, setShowGinsengGame] = useState(false);
  const [showBugGame, setShowBugGame] = useState(false);
  const [showInstructionsFor, setShowInstructionsFor] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<VisitMission | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleGameFinish = (points: number, isGameOver: boolean) => {
    if (points > 0) onAddPoints(points);
    if (isGameOver) onDeductLife();
    setShowCatchGame(false);
    setShowGinsengGame(false);
    setShowBugGame(false);
  };

  const handleMissionAction = (mission: VisitMission) => {
    const currentStatus = missionProgress[mission.id] || 'none';
    
    if (currentStatus === 'none') {
      const stage = mission.stages.find(s => s.id === 'prepare');
      if (stage) {
        onUpdateProgress(mission.id, 'prepare');
        onAddPoints(stage.reward);
      }
    } else if (currentStatus === 'prepare') {
      const stage = mission.stages.find(s => s.id === 'arrival');
      if (stage) {
        onUpdateProgress(mission.id, 'arrival');
        onAddPoints(stage.reward);
      }
    } else if (currentStatus === 'arrival') {
      setSelectedMission(mission);
      setShowPhotoPopup(true);
    }
  };

  const handlePhotoSubmit = () => {
    if (selectedMission && uploadedPhoto) {
      onUpdateProgress(selectedMission.id, 'action');
      setShowPhotoPopup(false);
      setUploadedPhoto(null);
      // Automatically open review popup after photo
      setShowReviewPopup(true);
    }
  };

  const handleReviewSubmit = () => {
    if (selectedMission) {
      const stage = selectedMission.stages.find(s => s.id === 'review');
      onUpdateProgress(selectedMission.id, 'completed');
      if (stage) onAddPoints(stage.reward);
      setShowReviewPopup(false);
      setReview('');
      setRating(0);
      setSelectedMission(null);
    }
  };

  const games = [
    { id: 'catch', title: '사과 받기', icon: '🍎', reward: '최대 200P', desc: '떨어지는 사과를 바구니에 담으세요!' },
    { id: 'ginseng', title: '인삼 찾기', icon: '✨', reward: '최대 300P', desc: '돌을 피해 인삼을 모두 찾으세요!' },
    { id: 'bug', title: '벌레 퇴치', icon: '🐛', reward: '최대 250P', desc: '사과나무를 갉아먹는 벌레를 막으세요!' },
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
            <span className="text-[10px] font-black text-apple-red">{lives} / 10</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {games.map((game) => (
            <div 
              key={game.id} 
              onClick={() => {
                if (lives <= 0) {
                  showAlert('하트가 부족해요!\n광고를 보거나 내일 다시 도전해보세요.', '❤️', 'warning');
                  return;
                }
                if (game.id === 'catch') setShowCatchGame(true);
                if (game.id === 'ginseng') setShowGinsengGame(true);
                if (game.id === 'bug') setShowBugGame(true);
              }}
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
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <MapPin size={14} className="text-apple-green" />
          영주 방문 미션
        </h3>
        <div className="space-y-4">
          {VISIT_MISSIONS.map((mission) => {
            const status = missionProgress[mission.id] || 'none';
            const place = PLACES.find(p => p.id === mission.placeId);

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
                      className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                        status === 'none' ? 'bg-white border-4 border-stone-100 text-stone-600' :
                        status === 'prepare' ? 'bg-blue-500 text-white shadow-[0_4px_0_0_#2b6cb0]' :
                        status === 'arrival' ? 'bg-yeoju-gold text-white shadow-[0_4px_0_0_#d4a017]' :
                        'bg-apple-red text-white shadow-[0_4px_0_0_#d32f2f]'
                      }`}
                    >
                      {status === 'none' && <><Info size={18} /> 여행 정보 및 정책 확인</>}
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
                          <span className="text-[10px] font-black text-blue-400 bg-blue-50 px-2 py-0.5 rounded-md">맑음</span>
                          <span className="text-[10px] font-black text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">오후 6시</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {PLACES
                          .filter(p => p.id !== place.id && p.category !== '숙소')
                          .slice(0, 2)
                          .map((rec, idx) => {
                            // Simple distance simulation (in real app, use Haversine formula)
                            const dist = (Math.random() * 5 + 1).toFixed(1);
                            return (
                              <div key={rec.id} className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-3 group cursor-pointer hover:border-apple-red/20 transition-all">
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                                  <img src={rec.image} className="w-full h-full object-cover" alt={rec.name} referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[9px] font-black text-apple-red px-1.5 py-0.5 bg-apple-red/5 rounded-md">
                                      {rec.category === '맛집' ? '맛집' : rec.category === '카페' ? '카페' : '명소'}
                                    </span>
                                    <h5 className="text-xs font-black truncate">{rec.name}</h5>
                                  </div>
                                  <p className="text-[10px] text-stone-400 font-bold mb-1 flex items-center gap-1">
                                    <MapPin size={10} /> {dist}km • {rec.relatedSpecialty}
                                  </p>
                                  <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                                    <Sparkles size={8} /> 추천 코스 이동 시 500P 추가 보너스!
                                  </div>
                                </div>
                                <ChevronRight size={16} className="text-stone-300 group-hover:text-apple-red transition-colors" />
                              </div>
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
            onClose={() => setShowCatchGame(false)} 
            onFinish={handleGameFinish} 
          />
        )}
        {showGinsengGame && (
          <FindGinsengGame 
            onClose={() => setShowGinsengGame(false)} 
            onFinish={handleGameFinish} 
          />
        )}
        {showBugGame && (
          <BugDefenseGame 
            onClose={() => setShowBugGame(false)} 
            onFinish={handleGameFinish} 
          />
        )}

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
