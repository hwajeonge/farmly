import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, Sparkles, Store } from 'lucide-react';
import { SHOP_ITEMS } from '../constants';
import { cn } from '../lib/utils';

interface StoreProps {
  points: number;
  apples: number;
  onBuyItem: (itemId: string, price: number) => void;
  onBuyWithApples: (itemId: string, applePrice: number) => void;
  onBack?: () => void;
}

const ITEM_BG: Record<string, string> = {
  'nutrient': 'bg-emerald-50 border-emerald-100',
  'medicine': 'bg-red-50 border-red-100',
  'shield':   'bg-sky-50 border-sky-100',
  'default':  'bg-stone-50 border-stone-100',
};

export const StoreView: React.FC<StoreProps> = ({ points, apples = 0, onBuyItem, onBuyWithApples, onBack }) => {
  return (
    <div className="py-4">

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-7">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-stone-400 font-bold text-sm mb-3 active:opacity-60 transition-all"
            >
              <ArrowLeft size={17} /> 돌아가기
            </button>
          )}
          <h2 className="text-2xl font-black text-stone-800">농장 상점 🏪</h2>
          <p className="text-xs font-bold text-warm-gray mt-1">나무를 더 건강하게 키워요</p>
        </div>

        {/* 보유 사과 */}
        <div className="bg-red-50 border-2 border-red-100 px-4 py-2.5 rounded-2xl flex items-center gap-2">
          <span className="text-xl">🍎</span>
          <div className="text-right">
            <p className="text-[9px] font-black text-apple-red uppercase tracking-widest">내 사과</p>
            <p className="text-sm font-black text-stone-800">{apples}개</p>
          </div>
        </div>
      </div>

      {/* 보유 포인트 배너 */}
      <div className="gold-card p-4 flex items-center gap-3 mb-7">
        <div className="text-2xl">🪙</div>
        <div>
          <p className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">보유 포인트</p>
          <p className="text-lg font-black text-stone-800">{points.toLocaleString()} P</p>
        </div>
        <div className="ml-auto text-xs font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
          미션으로 적립
        </div>
      </div>

      {/* 성장 아이템 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={15} className="text-yeoju-gold" />
          <h3 className="section-title">성장 아이템</h3>
        </div>

        <div className="space-y-3">
          {SHOP_ITEMS.map((item) => {
            const applePrice = item.type === 'item' ? 5 : Math.round(item.price / 500);
            const bgClass = ITEM_BG[item.id] ?? ITEM_BG.default;
            const canBuyWithPoints = points >= item.price;
            const canBuyWithApples = apples >= applePrice;

            return (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.98 }}
                className="cute-card p-4 flex items-center gap-4"
              >
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2', bgClass)}>
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm text-stone-800">{item.name}</h4>
                  <p className="text-[11px] font-bold text-warm-gray mt-0.5 leading-snug">{item.desc}</p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => onBuyItem(item.id, item.price)}
                    disabled={!canBuyWithPoints}
                    className={cn(
                      'px-3 py-1.5 rounded-xl font-black text-[11px] transition-all',
                      canBuyWithPoints
                        ? 'bg-yeoju-gold text-white shadow-[0_3px_0_0_#b07a00] active:shadow-none active:translate-y-0.5'
                        : 'bg-stone-100 text-stone-300 cursor-not-allowed',
                    )}
                  >
                    🪙 {item.price}P
                  </button>
                  <button
                    onClick={() => onBuyWithApples(item.id, applePrice)}
                    disabled={!canBuyWithApples}
                    className={cn(
                      'px-3 py-1.5 rounded-xl font-black text-[11px] transition-all',
                      canBuyWithApples
                        ? 'bg-apple-red text-white shadow-[0_3px_0_0_#cc2828] active:shadow-none active:translate-y-0.5'
                        : 'bg-stone-100 text-stone-300 cursor-not-allowed',
                    )}
                  >
                    🍎 {applePrice}개
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 영주장날 링크 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Store size={15} className="text-apple-red" />
          <h3 className="section-title">영주 특산물 만나보기</h3>
        </div>

        <motion.a
          href="https://yjmarket.cyso.co.kr/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="relative block w-full aspect-21/9 rounded-4xl overflow-hidden shadow-xl border-4 border-white"
        >
          <img
            src="https://picsum.photos/seed/yeongjumarket/1200/600"
            alt="영주장날"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-white text-lg font-black mb-0.5">영주장날 공식몰 🛍️</h4>
                <p className="text-white/70 text-[11px] font-bold">영주시가 엄선한 특산물을 직거래로!</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-2xl">
                <ExternalLink size={18} className="text-white" />
              </div>
            </div>
          </div>
        </motion.a>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            { label: '산지직송 🚚', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { label: '품질보증 📝', cls: 'bg-sky-50 text-sky-700 border-sky-100'             },
            { label: '할인혜택 🏷️', cls: 'bg-orange-50 text-orange-700 border-orange-100'     },
            { label: '영주시운영 🏛️',cls: 'bg-purple-50 text-purple-700 border-purple-100'    },
          ].map((f, i) => (
            <div key={i} className={cn('p-2.5 rounded-xl flex items-center justify-center text-[11px] font-black border-2 shadow-sm', f.cls)}>
              {f.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
