import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Gift, ArrowRight, Store, Sparkles, ExternalLink } from 'lucide-react';
import { SHOP_ITEMS } from '../constants';
import { cn } from '../lib/utils';

interface StoreProps {
  points: number;
  apples: number;
  onBuyItem: (itemId: string, price: number) => void;
  onBuyWithApples: (itemId: string, applePrice: number) => void;
  onBack?: () => void;
}

export const StoreView: React.FC<StoreProps> = ({ points, apples = 0, onBuyItem, onBuyWithApples, onBack }) => {
  return (
    <div className="py-4">
      <div className="flex justify-between items-end mb-8">
        <div className="flex flex-col gap-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-500 active:scale-90 transition-all mb-2"
            >
              <ArrowRight className="rotate-180" size={20} />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-black mb-2">농장 상점 🏪</h2>
            <p className="text-stone-500 text-sm font-medium">나무를 더 건강하게 키워보세요.</p>
          </div>
        </div>
        <div className="bg-apple-red/5 px-4 py-2 rounded-2xl border border-apple-red/10 flex items-center gap-2">
          <span className="text-xl">🍎</span>
          <div className="text-right">
            <p className="text-[8px] font-black text-apple-red uppercase tracking-widest">내 사과</p>
            <p className="text-sm font-black text-stone-800">{apples}개</p>
          </div>
        </div>
      </div>

      {/* Growth Items */}
      <section className="mb-10">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={14} className="text-yeoju-gold" />
          성장 아이템
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {SHOP_ITEMS.map((item) => {
            // Apple mapping: 5 apples for items, seeds stay points for now or a lot of apples
            const applePrice = item.type === 'item' ? 5 : item.price / 500; 
            
            return (
              <motion.div 
                key={item.id}
                whileTap={{ scale: 0.98 }}
                className="farm-card p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm">{item.name}</h4>
                  <p className="text-stone-400 text-[10px] font-bold">{item.desc}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => onBuyItem(item.id, item.price)}
                    disabled={points < item.price}
                    className="px-3 py-1.5 bg-yeoju-gold text-white rounded-xl font-black text-[10px] shadow-[0_3px_0_0_#e6a100] active:shadow-none active:translate-y-1 transition-all disabled:bg-stone-200 disabled:shadow-none"
                  >
                    {item.price} P
                  </button>
                  <button 
                    onClick={() => onBuyWithApples?.(item.id, applePrice)}
                    disabled={apples < applePrice}
                    className="px-3 py-1.5 bg- apple-red text-white rounded-xl font-black text-[10px] shadow-[0_3px_0_0_#b91c1c] active:shadow-none active:translate-y-1 transition-all disabled:bg-stone-200 disabled:shadow-none"
                  >
                    🍎 {applePrice}개
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Yeongju Jangnal Link */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <Store size={14} className="text-apple-red" />
            영주 특산물을 만나보세요
          </h3>
        </div>
        
        <motion.a 
          href="https://yjmarket.cyso.co.kr/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="relative block w-full aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl group border-4 border-white"
        >
          <img 
            src="https://picsum.photos/seed/yeongjumarket/1200/600" 
            alt="영주장날" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
            <div className="flex justify-between items-end">
              <div>
                <img 
                  src="https://www.yjmarket.com/design/yjmarket/img/common/logo.png" 
                  alt="영주장날 로고" 
                  className="h-8 mb-2 invert brightness-200 opacity-0"
                  referrerPolicy="no-referrer"
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).classList.remove('opacity-0');
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <h4 className="text-white text-xl font-black mb-1">영주장날 공식몰 🛍️</h4>
                <p className="text-white/70 text-[10px] font-bold">영주시가 엄선한 최고의 특산물을 직거래로!</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl group-hover:bg-white/30 transition-colors">
                <ExternalLink size={20} className="text-white" />
              </div>
            </div>
          </div>
        </motion.a>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { label: '산지직송 🚚', icon: 'bg-emerald-50 text-emerald-600' },
            { label: '품질보증 📝', icon: 'bg-blue-50 text-blue-600' },
            { label: '할인혜택 🏷️', icon: 'bg-orange-50 text-orange-600' },
            { label: '영주시운영 🏛️', icon: 'bg-purple-50 text-purple-600' }
          ].map((feature, i) => (
            <div key={i} className={cn("p-2.5 rounded-xl flex items-center justify-center text-[10px] font-black border border-stone-100 shadow-sm", feature.icon)}>
              {feature.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
