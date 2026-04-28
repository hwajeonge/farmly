import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Heart, Gift, MessageSquare } from 'lucide-react';

export const CommunityView: React.FC = () => {
  const rankings = [
    { name: '사과왕김영주', score: 12500, tree: '🍎' },
    { name: '부석사농부', score: 10200, tree: '🌟' },
    { name: '사과파이조아', score: 9800, tree: '🍏' },
  ];

  return (
    <div className="py-4">
      <div className="mb-8">
        <h2 className="text-2xl font-black mb-2">이웃 농장 🤝</h2>
        <p className="text-stone-500 text-sm font-medium">영주 디지털 농부들과 소통해보세요.</p>
      </div>

      {/* Ranking */}
      <section className="mb-10">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Trophy size={14} className="text-yeoju-gold" />
          이번 주 사과왕
        </h3>
        <div className="bg-white rounded-3xl border-4 border-stone-100 overflow-hidden shadow-sm">
          {rankings.map((rank, i) => (
            <div key={i} className={`p-4 flex items-center gap-4 ${i !== rankings.length - 1 ? 'border-b-2 border-stone-50' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                i === 0 ? 'bg-yeoju-gold text-white' : 'bg-stone-100 text-stone-400'
              }`}>
                {i + 1}
              </div>
              <div className="text-2xl">{rank.tree}</div>
              <div className="flex-1">
                <p className="font-black text-sm">{rank.name}</p>
                <p className="text-[10px] font-bold text-stone-400">{rank.score.toLocaleString()} 점</p>
              </div>
              <button className="p-2 text-apple-red hover:bg-apple-red/10 rounded-xl transition-colors">
                <Heart size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Cooperative Mission */}
      <section className="mb-10">
        <div className="apple-gradient p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-black mb-1">협동 퀘스트 🤝</h3>
            <p className="text-xs opacity-80 mb-4">이웃과 함께 물 1,000번 주기!</p>
            <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden mb-4 border border-white/30">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full bg-white rounded-full"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest">650 / 1,000</span>
              <button className="px-4 py-2 bg-white text-apple-red rounded-xl font-black text-xs">참여하기</button>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 text-8xl opacity-10">🍎</div>
        </div>
      </section>

      {/* Neighbors */}
      <section>
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Users size={14} className="text-apple-green" />
          추천 이웃
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="farm-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-xl">👩‍🌾</div>
              <div className="flex-1">
                <p className="font-black text-sm">농부 {i}호</p>
                <p className="text-[10px] font-bold text-stone-400">부석사 소수농원 이웃</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-stone-50 text-stone-400 rounded-xl hover:text-apple-red transition-colors">
                  <Gift size={18} />
                </button>
                <button className="p-2 bg-stone-50 text-stone-400 rounded-xl hover:text-apple-green transition-colors">
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
