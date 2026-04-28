import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, ShoppingBag, Settings, ChevronRight, 
  MapPin, Heart, LogOut, Camera, Calendar, 
  Trash2, Edit3, Share2, Info, LayoutGrid, List,
  Apple, Gift
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

export const MyPage: React.FC<MyPageProps> = ({ user, handleLogout, onOpenHarvestModal, onGoToStore }) => {
  const [activeTab, setActiveTab] = useState<MenuTab>('profile');
  const [selectedTree, setSelectedTree] = useState<TreeState | null>(null);

  const menuButtons = [
    { id: 'profile', label: '활동정보', icon: Award },
    { id: 'travel', label: '여행기록', icon: MapPin },
    { id: 'reviews', label: '후기관리', icon: Heart },
    { id: 'cards', label: '소유권카드', icon: ShoppingBag },
  ];

  return (
    <div className="py-2 pb-20">
      {/* Header: Basic Info */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex justify-between w-full px-4 mb-4">
           <button onClick={onGoToStore} className="p-3 bg-white rounded-2xl border-2 border-stone-50 shadow-sm text-yeoju-gold active:scale-95 transition-all">
             <ShoppingBag size={20} strokeWidth={3} />
           </button>
           <button onClick={handleLogout} className="p-3 bg-white rounded-2xl border-2 border-stone-50 shadow-sm text-stone-400 active:scale-95 transition-all">
             <LogOut size={20} />
           </button>
        </div>
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-stone-100 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-stone-300">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-4xl font-black text-apple-red">{user.name[0]}</span>
            )}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-stone-800 text-white rounded-2xl border-4 border-stone-50 shadow-lg active:scale-90 transition-transform">
            <Camera size={16} />
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black mb-1">{user.nickname || user.name}</h2>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-apple-red/10 text-apple-red text-[10px] font-black rounded-lg uppercase tracking-widest">Digital Farmer</span>
              <span className="text-stone-400 text-[10px] font-bold">Yeongju Resident since 2024</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 bg-apple-red/5 px-3 py-1 rounded-full border border-apple-red/10">
              <Apple size={12} className="text-apple-red" />
              <span className="text-xs font-black text-stone-700">누적 수확량: <span className="text-apple-red">{user.accumulatedApples}개</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-2 mb-8 bg-stone-100 p-1.5 rounded-[2rem]">
        {menuButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveTab(btn.id as MenuTab)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[1.5rem] transition-all relative overflow-hidden",
              activeTab === btn.id ? "bg-white text-stone-800 shadow-sm" : "text-stone-400"
            )}
          >
            <btn.icon size={18} strokeWidth={activeTab === btn.id ? 3 : 2} />
            <span className="text-[10px] font-black">{btn.label}</span>
            {activeTab === btn.id && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-apple-red" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && <ProfileView user={user} handleLogout={handleLogout} onOpenHarvestModal={onOpenHarvestModal} />}
          {activeTab === 'travel' && <TravelView history={user.visitedHistory} />}
          {activeTab === 'reviews' && <ReviewsView />}
          {activeTab === 'cards' && <CardsView trees={user.trees} user={user} onSelect={setSelectedTree} />}
        </motion.div>
      </AnimatePresence>

      {/* Card Modal Overlay */}
      <AnimatePresence>
        {selectedTree && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={() => setSelectedTree(null)}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
            >
              <TreeOwnershipCard 
                tree={selectedTree} 
                ownerName={user.nickname || user.name} 
                onClose={() => setSelectedTree(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- View Components ---

const ProfileView = ({ user, handleLogout, onOpenHarvestModal }: { user: UserProfile, handleLogout: () => void, onOpenHarvestModal: () => void }) => (
  <div className="space-y-6">
    {/* Honorary Citizen ID */}
    <div className="apple-gradient p-6 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-500/30 relative overflow-hidden group border-4 border-white/20">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <Award size={24} strokeWidth={3} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 text-right">
            Republic of Korea<br />Yeongju City Card
          </p>
        </div>
        <p className="text-[10px] font-black opacity-80 mb-1 uppercase tracking-widest">Digital Resident Certificate</p>
        <h3 className="text-3xl font-black mb-6 tracking-tight">{user.name}</h3>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[8px] font-black opacity-60 uppercase mb-1">Privileges</p>
            <p className="text-[10px] font-bold">제휴 카페 할인 • 선비촌 무료 입장</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-[10px] font-black border border-white/30">
            Active Member
          </div>
        </div>
      </div>
      {/* Decorative blurs */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-3xl" />
    </div>

    {/* Milestone Rewards */}
    <section>
      <div className="flex justify-between items-end mb-4 px-2">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">수확 보상 마일스톤</h3>
        <span className="text-[10px] font-black text-apple-red">총 {user.accumulatedApples} / 220</span>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100">
        <div className="relative h-4 bg-stone-50 rounded-full mb-6 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (user.accumulatedApples / 220) * 100)}%` }}
            className="h-full bg-yeoju-gold"
          />
          <div className="absolute inset-0 flex justify-between px-2">
            {[30, 60, 100, 220].map((m) => (
              <div 
                key={m} 
                className={cn(
                  "w-1 h-full", 
                  user.accumulatedApples >= m ? "bg-white" : "bg-stone-200"
                )} 
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          {[
            { m: 30, label: '영양제' },
            { m: 60, label: '약/방품' },
            { m: 100, label: '1kg권' },
            { m: 220, label: 'VIP권' }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-xs mb-1 mx-auto",
                user.accumulatedApples >= item.m ? "bg-yeoju-gold text-white" : "bg-stone-50 text-stone-300"
              )}>
                {user.accumulatedApples >= item.m ? '✓' : item.m}
              </div>
              <p className="text-[8px] font-black text-stone-400 uppercase">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Badges Section */}
    <section>
      <div className="flex justify-between items-end mb-4 px-2">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">영주 사과나무 뱃지</h3>
        <button className="text-[10px] font-black text-apple-red">View Collection</button>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100 flex gap-4 overflow-x-auto no-scrollbar">
        {[
          { id: '1', title: '4월의 농부', icon: '🌱' },
          { id: '2', title: '첫 수확', icon: '🍎' },
          { id: '3', title: '성실한 탐험가', icon: '🎒' },
          { id: '4', title: '선비의 길', icon: '🕯️' },
        ].concat((user.badges || []).map(b => ({ id: b.id, title: b.title, icon: b.icon }))).slice(0, 5).map((badge, i) => (
          <div key={`${badge.id}-${i}`} className="flex flex-col items-center shrink-0">
            <div className="w-14 h-14 bg-stone-50 rounded-full border-2 border-stone-100 flex items-center justify-center text-2xl relative mb-2 shadow-sm">
              {badge.icon}
              <div className="absolute -bottom-1 -right-1 bg-apple-red text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                ✓
              </div>
            </div>
            <span className="text-[9px] font-black text-stone-800 text-center">{badge.title}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Apple Gifting */}
    <section className="bg-stone-800 p-6 rounded-[2.5rem] text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-yeoju-gold rounded-xl flex items-center justify-center shadow-lg">
            <Gift size={20} strokeWidth={3} />
          </div>
          <h3 className="font-black text-lg">실물 사과 수확</h3>
        </div>
        <p className="text-xs font-medium opacity-60 mb-6 leading-relaxed">
          100개 이상의 사과를 모으면 실제 영주 사과를 집으로 받아볼 수 있습니다!<br />
          지금 바로 수확 옵션을 확인해보세요.
        </p>
        <button 
          onClick={onOpenHarvestModal}
          disabled={user.accumulatedApples < 10 && !(user.claimedMilestones || []).includes(10)}
          className="w-full py-4 bg-white text-stone-800 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl shadow-black/20 disabled:bg-stone-600 disabled:text-stone-400"
        >
          {user.accumulatedApples >= 10 ? '수확 및 배송 신청하기' : '사과 10개 수확 시 오픈'}
        </button>
      </div>
      <Apple className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 -rotate-12" />
    </section>

    {/* Actions */}
    <div className="space-y-3">
      <button className="w-full farm-card p-5 flex justify-between items-center group bg-stone-800 text-white border-0 shadow-lg shadow-stone-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Info size={18} />
          </div>
          <div className="text-left">
            <p className="text-sm font-black">대농장주 전용 혜택</p>
            <p className="text-[10px] font-bold opacity-60">사과축제 부스 운영권 신청</p>
          </div>
        </div>
        <ChevronRight size={18} className="opacity-40" />
      </button>

      <button onClick={handleLogout} className="w-full bg-white p-5 rounded-[2rem] border-4 border-stone-100 flex items-center gap-4 group hover:border-red-100 transition-all">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
          <LogOut size={18} />
        </div>
        <span className="text-sm font-black text-stone-800">로그아웃</span>
      </button>
    </div>
  </div>
);

const TravelView = ({ history }: { history?: VisitedPlace[] }) => {
  const mockHistory: VisitedPlace[] = [
    { placeId: '1', name: '부석사', category: '관광지', date: '2024.04.18' },
    { placeId: '2', name: '소수서원', category: '관광지', date: '2024.04.15' },
    { placeId: '3', name: '풍기 인삼 시장', category: '맛집', date: '2024.04.12' },
  ];

  const travelRecords = history && history.length > 0 ? history : mockHistory;

  return (
    <div className="space-y-6">
      <section className="bg-stone-800 p-8 rounded-[3rem] text-white overflow-hidden relative shadow-xl shadow-stone-200">
        <div className="relative z-10">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-6">나의 여행 타임라인</h3>
          <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            {travelRecords.map((item, i) => (
              <div key={i} className="flex gap-6 relative">
                <div className="w-6 h-6 bg-apple-red rounded-full flex items-center justify-center z-10 shrink-0 border-4 border-stone-800">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-400 mb-1">{item.date}</p>
                  <p className="text-sm font-black">{item.name}</p>
                  <span className="text-[9px] font-bold bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 mt-1 inline-block">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-apple-red/20 rounded-full blur-3xl animate-pulse" />
      </section>

      <button className="w-full py-4 bg-white border-4 border-stone-100 rounded-[2rem] text-xs font-black flex items-center justify-center gap-2 text-stone-600 hover:bg-stone-50">
        <Share2 size={14} />
        전체 여행 기록 공유하기
      </button>
    </div>
  );
};

const ReviewsView = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-2 px-2">
      <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">내가 작성한 후기</h3>
      <span className="text-[10px] font-bold text-stone-400">총 12건</span>
    </div>
    {[
      { farm: '소백산 아래 사과농장', rating: 5, date: '2024.04.10', content: '사과가 정말 달고 신선해요! 체험 프로그램도 아이들이 너무 좋아했습니다.' },
      { farm: '희방사 입구 농원', rating: 4, date: '2024.03.28', content: '분양받은 나무 소식이 사진이랑 같이 와서 좋아요. 수확이 기다려지네요!' },
    ].map((review, i) => (
      <div key={i} className="bg-white p-5 rounded-[2rem] border-4 border-stone-100 shadow-sm group">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm font-black text-stone-800 mb-1">{review.farm}</p>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className={cn("w-2 h-2 rounded-full", idx < review.rating ? "bg-yeoju-gold" : "bg-stone-100")} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-stone-50 text-stone-400 rounded-xl hover:text-stone-800 active:scale-95"><Edit3 size={14} /></button>
            <button className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 active:scale-95"><Trash2 size={14} /></button>
          </div>
        </div>
        <p className="text-[11px] font-bold text-stone-500 leading-relaxed mb-3">"{review.content}"</p>
        <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{review.date}</p>
      </div>
    ))}
  </div>
);

const CardsView = ({ trees, user, onSelect }: { trees: TreeState[], user: UserProfile, onSelect: (t: TreeState) => void }) => {
  if (trees.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center px-8 border-4 border-dashed border-stone-100 rounded-[3rem]">
        <div className="w-16 h-16 bg-stone-50 rounded-3xl flex items-center justify-center text-stone-300 mb-4">
          <ShoppingBag size={32} />
        </div>
        <p className="text-sm font-black text-stone-800 mb-2">소유권 카드가 없습니다</p>
        <p className="text-[11px] font-bold text-stone-400 leading-relaxed">
          농가 장소에서 사과나무를 분양받으면<br />
          나만의 디지털 소유권 카드가 생성됩니다!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4 px-2">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">나무 소유권 카드</h3>
        <div className="flex gap-2">
          <button className="p-1.5 bg-stone-800 text-white rounded-lg"><LayoutGrid size={14} /></button>
          <button className="p-1.5 bg-white border border-stone-200 text-stone-400 rounded-lg"><List size={14} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {trees.map((tree) => (
          <motion.div
            key={tree.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(tree)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[2/3] bg-stone-100 rounded-3xl border-4 border-stone-200 overflow-hidden shadow-sm group-hover:shadow-xl transition-all">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl mb-2">{tree.growthStage === '시즌종료' ? '🍎' : '🌳'}</span>
                 <p className="text-[10px] font-black text-stone-800 tracking-tight">{tree.nickname}</p>
                 <span className="text-[8px] font-bold text-stone-400 italic">#{tree.id.slice(-4).toUpperCase()}</span>
              </div>
              <div className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-[10px] font-black">
                 {tree.currentDay}d
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-stone-900/60 to-transparent pointer-events-none" />
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

      <div className="bg-yeoju-gold/5 border-2 border-yeoju-gold/20 p-5 rounded-[2rem] text-center">
         <p className="text-[10px] font-bold text-stone-600 mb-2">
           "카드를 수집하여 영주 사과 축제에서<br />
           <span className="text-yeoju-gold font-black">실물 굿즈로 교환하세요!</span>"
         </p>
         <button className="text-[10px] font-black text-yeoju-gold underline underline-offset-4">참여 방법 확인하기</button>
      </div>
    </div>
  );
};
