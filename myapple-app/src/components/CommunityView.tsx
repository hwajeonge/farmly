import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Trophy, Target, Gift, Search, 
  UserPlus, MessageSquare, TrendingUp, 
  MapPin, Apple, ArrowRightLeft, Gift as GiftIcon,
  CheckCircle2, Clock, Shield
} from 'lucide-react';
import { UserProfile, RankingEntry, CooperativeQuest, TradeRequest } from '../types';
import { cn } from '../lib/utils';

interface CommunityViewProps {
  user: UserProfile;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'neighborhood' | 'quests' | 'ranking'>('neighborhood');

  return (
    <div className="space-y-6 pb-20">
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
        <TabButton 
          active={activeTab === 'neighborhood'} 
          onClick={() => setActiveTab('neighborhood')}
          icon={<Users size={16} />}
          label="우리 동네 이웃"
        />
        <TabButton 
          active={activeTab === 'quests'} 
          onClick={() => setActiveTab('quests')}
          icon={<Target size={16} />}
          label="협동 퀘스트"
        />
        <TabButton 
          active={activeTab === 'ranking'} 
          onClick={() => setActiveTab('ranking')}
          icon={<Trophy size={16} />}
          label="명예의 전당"
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'neighborhood' && <NeighborhoodTab key="neighborhood" user={user} />}
        {activeTab === 'quests' && <QuestsTab key="quests" />}
        {activeTab === 'ranking' && <RankingTab key="ranking" />}
      </AnimatePresence>
    </div>
  );
};

const NeighborhoodTab = ({ user }: { user: UserProfile }) => {
  const [search, setSearch] = useState("");
  
  // Mock data for demo
  const neighbors = [
    { id: 'u2', name: '영주지키미', treeCount: 5, healthScore: 98, image: 'https://i.pravatar.cc/150?u=u2' },
    { id: 'u3', name: '사과전문가', treeCount: 12, healthScore: 92, image: 'https://i.pravatar.cc/150?u=u3' },
    { id: 'u1', name: '소백산정기', treeCount: 2, healthScore: 85, image: 'https://i.pravatar.cc/150?u=u1' },
  ];

  const handleTrade = (neighborName: string) => {
    const confirmed = window.confirm(`${neighborName}님과 '사과 1개 ↔ 비료 5개' 물물교환을 제안하시겠습니까?`);
    if (confirmed) {
      alert('교환 요청이 전송되었습니다! 상대방이 수락하면 아이템이 지급됩니다.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="농장 이름이나 닉네임으로 검색..."
          className="w-full bg-white border-2 border-stone-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-apple-green focus:border-transparent outline-none transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest px-2">나의 이웃 ({neighbors.length})</h3>
        {neighbors.map((neighbor) => (
          <div key={neighbor.id} className="bg-white p-4 rounded-[2rem] border-2 border-stone-50 shadow-sm flex items-center justify-between group hover:border-apple-green/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-stone-100">
                <img src={neighbor.image} alt={neighbor.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-black text-stone-800">{neighbor.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-apple-red/10 text-apple-red rounded-md">🌳 나무 {neighbor.treeCount}그루</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-yeoju-gold/10 text-yeoju-gold rounded-md">📈 생육 {neighbor.healthScore}점</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleTrade(neighbor.name)}
                className="w-10 h-10 bg-stone-50 text-stone-400 rounded-xl flex items-center justify-center hover:bg-apple-green hover:text-white transition-all shadow-sm active:scale-95"
              >
                <ArrowRightLeft size={18} />
              </button>
              <button 
                onClick={() => alert(`${neighbor.name}님에게 사과 선물을 보내시겠습니까?`)}
                className="w-10 h-10 bg-apple-green/10 text-apple-green rounded-xl flex items-center justify-center hover:bg-apple-green hover:text-white transition-all shadow-sm active:scale-95"
              >
                <GiftIcon size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-yeoju-gold/20 to-apple-green/20 p-6 rounded-[2.5rem] border-2 border-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-yeoju-gold shadow-sm">
            <TrendingUp size={20} strokeWidth={3} />
          </div>
          <div>
            <h4 className="font-black text-stone-800">이웃을 더 찾아볼까요?</h4>
            <p className="text-[10px] font-bold text-stone-500">주변 농장에 놀러가고 친구를 맺어보세요.</p>
          </div>
        </div>
        <button className="w-full py-3 bg-white text-stone-800 rounded-xl font-black text-sm shadow-sm active:scale-95 transition-all">
          농장 자랑하기 탭에서 찾아보기
        </button>
      </div>
    </motion.div>
  );
};

const QuestsTab = () => {
  // Mock Quests
  const quests: CooperativeQuest[] = [
    {
      id: 'q1',
      title: '가뭄 극복! 단체 물주기',
      description: '영주시의 이번 주 기온이 높아요. 이웃들과 함께 물 100번을 주어 나무들을 지켜내세요!',
      targetCount: 100,
      currentCount: 64,
      reward: { type: 'item', value: 'nutrient' },
      expiryDate: '2024-04-28',
      participants: ['u1', 'u2', 'u3']
    },
    {
       id: 'q2',
       title: '영주 사과 홍보 대사',
       description: '친구들에게 내 농장을 10번 공유하세요. 영주 사과를 알리는 이웃에게 비료를 드립니다!',
       targetCount: 10,
       currentCount: 3,
       reward: { type: 'item', value: 'fertilizer' },
       expiryDate: '2024-05-01',
       participants: ['u1']
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-4"
    >
      <div className="bg-stone-800 text-white p-6 rounded-[2.5rem] relative overflow-hidden mb-6">
        <div className="relative z-10">
          <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-2 text-yeoju-gold">Active Event</p>
          <h3 className="text-xl font-black mb-2 leading-tight">영주 사과 마을<br />공동 미션</h3>
          <p className="text-xs font-medium opacity-60">함께하면 영주 사과가 더 달콤하게 자라요!</p>
        </div>
        <Apple className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" />
      </div>

      {quests.map(quest => (
        <div key={quest.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-stone-50 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-black text-stone-800 text-lg mb-1">{quest.title}</h4>
              <p className="text-xs font-medium text-stone-500 leading-relaxed">{quest.description}</p>
            </div>
            <div className="w-12 h-12 bg-yeoju-gold/10 rounded-2xl flex items-center justify-center text-yeoju-gold font-black italic">
              {Math.round((quest.currentCount / quest.targetCount) * 100)}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black text-stone-400">
              <span>진행도 ({quest.currentCount} / {quest.targetCount})</span>
              <span>보상: {quest.reward.value === 'nutrient' ? '고급 영양제' : '영주 한우 비료'}</span>
            </div>
            <div className="w-full bg-stone-50 h-3 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(quest.currentCount / quest.targetCount) * 100}%` }}
                 className="h-full bg-apple-green"
               />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-stone-100 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-stone-800 flex items-center justify-center text-[10px] text-white font-bold">
                +{quest.participants.length}
              </div>
            </div>
            <button className="px-6 py-2 bg-stone-800 text-white rounded-xl text-xs font-black active:scale-95 transition-all">
              참여하기
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const RankingTab = () => {
  const rankings: RankingEntry[] = [
    { userId: 'u2', userName: '영주지키미', profileImage: 'https://i.pravatar.cc/150?u=u2', treeHealthScore: 985, rank: 1 },
    { userId: 'u3', userName: '사과전문가', profileImage: 'https://i.pravatar.cc/150?u=u3', treeHealthScore: 942, rank: 2 },
    { userId: 'u5', userName: '부석사농부', profileImage: 'https://i.pravatar.cc/150?u=u5', treeHealthScore: 890, rank: 3 },
    { userId: 'u1', userName: '소백산정기', treeHealthScore: 820, rank: 4 },
    { userId: 'u4', userName: '나들이길', treeHealthScore: 750, rank: 5 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="bg-white p-6 rounded-[2.5rem] border-2 border-stone-50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yeoju-gold text-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Trophy size={20} strokeWidth={3} />
          </div>
          <div>
            <h3 className="font-black text-stone-800">이번 시즌 생육 랭킹</h3>
            <p className="text-[10px] font-bold text-stone-400">AI 생육 점수를 기반으로 산정됩니다.</p>
          </div>
        </div>

        <div className="space-y-3">
          {rankings.map(entry => (
            <div 
              key={entry.userId} 
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl transition-all",
                entry.rank === 1 ? "bg-yeoju-gold/5 border-2 border-yeoju-gold/10" : "bg-stone-50 border-2 border-transparent"
              )}
            >
              <div className="flex items-center gap-4">
                <span className={cn(
                  "w-6 text-center font-black",
                  entry.rank <= 3 ? "text-yeoju-gold italic text-lg" : "text-stone-300"
                )}>
                  {entry.rank}
                </span>
                <div className="w-10 h-10 rounded-full bg-white border-2 border-stone-100 flex items-center justify-center overflow-hidden">
                  {entry.profileImage ? (
                    <img src={entry.profileImage} alt={entry.userName} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={16} className="text-stone-300" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-stone-800">{entry.userName}</p>
                  <p className="text-[10px] font-bold text-stone-400">생육 점수 {entry.treeHealthScore}</p>
                </div>
              </div>
              {entry.rank <= 3 && (
                <div className="flex items-center gap-1 text-yeoju-gold">
                   <Apple size={14} />
                   <span className="text-[10px] font-black">할인권 확정</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-stone-50 p-6 rounded-[2.5rem] border-2 border-dashed border-stone-200 text-center">
        <p className="text-xs font-bold text-stone-400 mb-2">상위 10%에게는 특별한 혜택이!</p>
        <p className="text-[10px] font-medium text-stone-400 leading-relaxed">
          다음 시즌 나무 분양권 20% 할인 혜택과<br />영주 사과 박스 추가 추첨 기회를 드립니다.
        </p>
      </div>
    </motion.div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black whitespace-nowrap transition-all active:scale-95",
      active 
        ? "bg-stone-800 text-white shadow-lg shadow-stone-200" 
        : "bg-white text-stone-400 border-2 border-stone-50"
    )}
  >
    {icon}
    {label}
  </button>
);
