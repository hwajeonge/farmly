import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award, ShoppingBag, ChevronRight,
  MapPin, Heart, LogOut, Camera,
  Trash2, Edit3, Share2, Apple, Gift, LayoutGrid, List
} from 'lucide-react';
import { UserProfile, VisitedPlace, UserBadge, TreeState } from '../types';
import { authService } from '../services/authService';
import { cn } from '../lib/utils';
import { TreeOwnershipCard } from './TreeOwnershipCard';

interface MyPageProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  handleLogout: () => void;
  onOpenHarvestModal: () => void;
  onGoToStore: () => void;
}

type MenuTab = 'profile' | 'travel' | 'reviews' | 'cards';

const MENU_TABS = [
  { id: 'profile', emoji: '🏅', label: '활동정보' },
  { id: 'travel',  emoji: '🗺️', label: '여행기록' },
  { id: 'reviews', emoji: '💬', label: '후기관리' },
  { id: 'cards',   emoji: '🃏', label: '소유권카드' },
] as const;

export const MyPage: React.FC<MyPageProps> = ({ user, handleLogout, onOpenHarvestModal, onGoToStore }) => {
  const [activeTab, setActiveTab] = useState<MenuTab>('profile');
  const [selectedTree, setSelectedTree] = useState<TreeState | null>(null);

  return (
    <div className="py-2 pb-24">

      {/* 상단 액션 버튼 */}
      <div className="flex justify-between px-1 mb-5">
        <button
          onClick={onGoToStore}
          className="w-10 h-10 bg-yellow-50 border-2 border-yellow-100 rounded-2xl flex items-center justify-center text-yeoju-gold active:scale-90 transition-all"
        >
          <ShoppingBag size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={handleLogout}
          className="w-10 h-10 bg-stone-50 border-2 border-stone-100 rounded-2xl flex items-center justify-center text-stone-400 active:scale-90 transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* 프로필 헤더 */}
      <div className="flex flex-col items-center mb-7">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-stone-100 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-4xl font-black text-apple-red">{user.name[0]}</span>
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 p-2 bg-stone-800 text-white rounded-xl border-4 border-white shadow-lg active:scale-90 transition-transform">
            <Camera size={14} />
          </button>
        </div>

        <h2 className="text-2xl font-black text-stone-800 mb-1">{user.nickname || user.name}</h2>
        <div className="flex flex-col items-center gap-1.5">
          <span className="px-3 py-1 bg-apple-red/10 text-apple-red text-[10px] font-black rounded-full">
            🌱 Digital Farmer
          </span>
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
            <Apple size={12} className="text-apple-red" />
            <span className="text-xs font-black text-stone-700">
              누적 수확량: <span className="text-apple-red">{user.accumulatedApples}개</span>
            </span>
          </div>
        </div>
      </div>

      {/* 서브 탭 */}
      <div className="flex gap-1 mb-7 bg-stone-100 p-1.5 rounded-2xl">
        {MENU_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MenuTab)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all relative overflow-hidden',
              activeTab === tab.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400',
            )}
          >
            <span className={cn('text-base transition-all', activeTab === tab.id ? 'scale-110' : 'opacity-60')}>{tab.emoji}</span>
            <span className="text-[9px] font-black leading-tight">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div layoutId="mypage-tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-red" />
            )}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'profile'  && <ProfileView user={user} handleLogout={handleLogout} onOpenHarvestModal={onOpenHarvestModal} />}
          {activeTab === 'travel'   && <TravelView history={user.visitedHistory} />}
          {activeTab === 'reviews'  && <ReviewsView />}
          {activeTab === 'cards'    && <CardsView trees={user.trees} user={user} onSelect={setSelectedTree} />}
        </motion.div>
      </AnimatePresence>

      {/* 소유권 카드 모달 */}
      <AnimatePresence>
        {selectedTree && (
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            onClick={() => setSelectedTree(null)}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <TreeOwnershipCard tree={selectedTree} ownerName={user.nickname || user.name} onClose={() => setSelectedTree(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════
   프로필 뷰
══════════════════════════════════════════ */
const ProfileView = ({ user, handleLogout, onOpenHarvestModal }: {
  user: UserProfile; handleLogout: () => void; onOpenHarvestModal: () => void;
}) => (
  <div className="space-y-5">

    {/* 영주시 디지털 주민 카드 */}
    <div className="apple-gradient p-6 rounded-[2rem] text-white shadow-[0_8px_32px_rgba(82,196,138,0.3)] relative overflow-hidden border-4 border-white/20">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-7">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <Award size={22} strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 text-right leading-relaxed">
            Republic of Korea<br />Yeongju City Card
          </p>
        </div>
        <p className="text-[10px] font-black opacity-70 mb-1 uppercase tracking-widest">Digital Resident</p>
        <h3 className="text-2xl font-black mb-5 tracking-tight">{user.name}</h3>
        <div className="flex justify-between items-end">
          <p className="text-[11px] font-bold opacity-80">제휴 카페 할인 · 선비촌 무료 입장</p>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-black border border-white/30">
            Active ✓
          </div>
        </div>
      </div>
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
    </div>

    {/* 수확 마일스톤 */}
    <section className="cute-card p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-stone-700">🎯 수확 보상 마일스톤</h3>
        <span className="text-[10px] font-black text-apple-red">{user.accumulatedApples ?? 0} / 220개</span>
      </div>
      <div className="progress-track h-3 mb-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, ((user.accumulatedApples ?? 0) / 220) * 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="progress-gold h-full"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[
          { m: 30,  label: '영양제' },
          { m: 60,  label: '약/방풍' },
          { m: 100, label: '1kg권' },
          { m: 220, label: 'VIP권' },
        ].map((item) => (
          <div key={item.m} className="text-center">
            <div className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black mb-1 mx-auto border-2',
              (user.accumulatedApples ?? 0) >= item.m
                ? 'bg-yeoju-gold text-white border-yellow-300 shadow-[0_3px_0_0_#b07a00]'
                : 'bg-stone-50 text-stone-300 border-stone-100',
            )}>
              {(user.accumulatedApples ?? 0) >= item.m ? '✓' : item.m}
            </div>
            <p className="text-[9px] font-black text-stone-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* 뱃지 컬렉션 */}
    <section className="cute-card p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-stone-700">🏅 사과나무 뱃지</h3>
        <button className="text-[10px] font-black text-apple-red">전체보기</button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: '1', title: '4월의 농부', icon: '🌱' },
          { id: '2', title: '첫 수확',    icon: '🍎' },
          { id: '3', title: '성실한 탐험가',icon: '🎒' },
          { id: '4', title: '선비의 길',  icon: '🕯️' },
        ].concat((user.badges || []).map(b => ({ id: b.id, title: b.title, icon: b.icon }))).slice(0, 5).map((badge, i) => (
          <div key={`${badge.id}-${i}`} className="flex flex-col items-center shrink-0 w-14">
            <div className="w-12 h-12 bg-red-50 rounded-2xl border-2 border-red-100 flex items-center justify-center text-2xl relative mb-1.5">
              {badge.icon}
              <div className="absolute -bottom-1 -right-1 bg-apple-green text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white">
                ✓
              </div>
            </div>
            <span className="text-[9px] font-black text-stone-700 text-center leading-tight">{badge.title}</span>
          </div>
        ))}
      </div>
    </section>

    {/* 실물 사과 수확 */}
    <section className="bg-stone-800 p-5 rounded-[2rem] text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-yeoju-gold rounded-2xl flex items-center justify-center shadow-lg">
            <Gift size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-base">실물 사과 수확 🍎</h3>
            <p className="text-[10px] font-bold opacity-50">100개 이상 모으면 신청 가능</p>
          </div>
        </div>
        <button
          onClick={onOpenHarvestModal}
          disabled={(user.accumulatedApples ?? 0) < 10 && !(user.claimedMilestones || []).includes(10)}
          className="w-full py-3.5 bg-white text-stone-800 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl shadow-black/20 disabled:bg-stone-700 disabled:text-stone-500"
        >
          {(user.accumulatedApples ?? 0) >= 10 ? '수확 및 배송 신청하기 →' : `사과 10개 수확 시 오픈 (${user.accumulatedApples ?? 0}/10)`}
        </button>
      </div>
      <Apple className="absolute -right-5 -bottom-5 w-28 h-28 opacity-[0.07] -rotate-12" />
    </section>

    {/* 대농장주 혜택 */}
    <button className="w-full cute-card p-5 flex justify-between items-center bg-stone-800 text-white border-0 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-lg">🏆</div>
        <div className="text-left">
          <p className="text-sm font-black">대농장주 전용 혜택</p>
          <p className="text-[10px] font-bold opacity-50">사과축제 부스 운영권 신청</p>
        </div>
      </div>
      <ChevronRight size={16} className="opacity-40" />
    </button>
  </div>
);

/* ══════════════════════════════════════════
   여행 기록 뷰
══════════════════════════════════════════ */
const TravelView = ({ history }: { history?: VisitedPlace[] }) => {
  const mockHistory: VisitedPlace[] = [
    { placeId: '1', name: '부석사',          category: '관광지', date: '2024.04.18' },
    { placeId: '2', name: '소수서원',         category: '관광지', date: '2024.04.15' },
    { placeId: '3', name: '풍기 인삼 시장',  category: '맛집',   date: '2024.04.12' },
  ];
  const records = history && history.length > 0 ? history : mockHistory;

  return (
    <div className="space-y-5">
      <div className="bg-stone-800 p-6 rounded-[2rem] text-white overflow-hidden relative">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-5">나의 여행 타임라인</h3>
        <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
          {records.map((item, i) => (
            <div key={i} className="flex gap-5 relative">
              <div className="w-6 h-6 bg-apple-red rounded-full flex items-center justify-center z-10 shrink-0 border-4 border-stone-800">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div>
                <p className="text-[10px] font-black text-stone-400 mb-0.5">{item.date}</p>
                <p className="text-sm font-black">{item.name}</p>
                <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg mt-1 inline-block">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-apple-red/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <button className="w-full py-3.5 bg-white border-2 border-stone-100 rounded-2xl text-xs font-black flex items-center justify-center gap-2 text-stone-600 active:bg-stone-50 transition-all">
        <Share2 size={13} /> 전체 여행 기록 공유하기
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════
   후기 관리 뷰
══════════════════════════════════════════ */
const ReviewsView = () => (
  <div className="space-y-3">
    <div className="flex justify-between items-center mb-1 px-1">
      <h3 className="text-xs font-black text-warm-gray">내가 작성한 후기</h3>
      <span className="text-[10px] font-bold text-stone-400">총 12건</span>
    </div>
    {[
      { farm: '소백산 아래 사과농장', rating: 5, date: '2024.04.10', content: '사과가 정말 달고 신선해요! 체험 프로그램도 아이들이 너무 좋아했습니다.' },
      { farm: '희방사 입구 농원',     rating: 4, date: '2024.03.28', content: '분양받은 나무 소식이 사진이랑 같이 와서 좋아요. 수확이 기다려지네요!' },
    ].map((review, i) => (
      <div key={i} className="cute-card p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm font-black text-stone-800 mb-1">{review.farm}</p>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, idx) => (
                <span key={idx} className="text-xs">{idx < review.rating ? '⭐' : '☆'}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-1.5">
            <button className="p-2 bg-stone-50 text-stone-400 rounded-xl active:bg-stone-100 transition-all"><Edit3 size={13} /></button>
            <button className="p-2 bg-red-50 text-red-400 rounded-xl active:bg-red-100 transition-all"><Trash2 size={13} /></button>
          </div>
        </div>
        <p className="text-[11px] font-bold text-stone-500 leading-relaxed mb-2">"{review.content}"</p>
        <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{review.date}</p>
      </div>
    ))}
  </div>
);

/* ══════════════════════════════════════════
   소유권 카드 뷰
══════════════════════════════════════════ */
const CardsView = ({ trees, user, onSelect }: { trees: TreeState[]; user: UserProfile; onSelect: (t: TreeState) => void }) => {
  if (trees.length === 0) {
    return (
      <div className="py-14 flex flex-col items-center justify-center text-center px-8 border-2 border-dashed border-stone-200 rounded-[2rem]">
        <div className="text-5xl mb-4">🌱</div>
        <p className="text-sm font-black text-stone-700 mb-2">소유권 카드가 없어요</p>
        <p className="text-[11px] font-bold text-warm-gray leading-relaxed">
          사과나무를 분양받으면<br />나만의 디지털 소유권 카드가 생겨요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-black text-warm-gray">나무 소유권 카드</h3>
        <div className="flex gap-1.5">
          <button className="p-1.5 bg-stone-800 text-white rounded-xl"><LayoutGrid size={13} /></button>
          <button className="p-1.5 bg-white border border-stone-200 text-stone-400 rounded-xl"><List size={13} /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {trees.map((tree) => (
          <motion.div
            key={tree.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(tree)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[2/3] bg-stone-100 rounded-[1.5rem] border-2 border-stone-200 overflow-hidden shadow-sm group-hover:shadow-lg transition-all">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl mb-2">{tree.growthStage === '시즌종료' ? '🍎' : '🌳'}</span>
                <p className="text-[10px] font-black text-stone-800">{tree.nickname}</p>
                <span className="text-[8px] font-bold text-stone-400">#{tree.id.slice(-4).toUpperCase()}</span>
              </div>
              <div className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-[10px] font-black text-stone-700">
                {tree.currentDay}d
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-linear-to-t from-stone-900/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-apple-green" style={{ width: `${tree.growthRate}%` }} />
                </div>
                <p className="text-[7px] font-black uppercase opacity-60">Growth: {tree.growthRate}%</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="gold-card p-4 text-center">
        <p className="text-[11px] font-bold text-stone-600 mb-2 leading-relaxed">
          카드를 수집하면 영주 사과 축제에서<br />
          <span className="text-yeoju-gold font-black">실물 굿즈로 교환</span>할 수 있어요!
        </p>
        <button className="text-[10px] font-black text-yeoju-gold underline underline-offset-4">참여 방법 보기</button>
      </div>
    </div>
  );
};
