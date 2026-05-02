import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Leaf, PackageOpen, ShoppingBag, Sparkles, Store } from 'lucide-react';
import { SHOP_ITEMS } from '../constants';
import { cn } from '../lib/utils';

interface StoreProps {
  points: number;
  apples: number;
  onBuyItem: (itemId: string, price: number) => void;
  onBuyWithApples: (itemId: string, applePrice: number) => void;
  onBack?: () => void;
  onNavigateToMissions?: () => void;
  ownedItems?: { id: string; count: number }[];
  onPlantSeed?: () => void;
}

const ITEM_COPY: Record<string, { name: string; desc: string; icon: string; tag: string; bg: string }> = {
  seed_f1: {
    name: '문수 과수원 씨앗',
    desc: '첫 사과나무를 심고 30일 성장 퀘스트를 시작해요.',
    icon: '🌱',
    tag: '씨앗',
    bg: 'bg-lime-50 border-lime-100',
  },
  seed_f2: {
    name: '풍기 사과농장 씨앗',
    desc: '풍기 여행 미션과 함께 키우기 좋은 농가 씨앗이에요.',
    icon: '🌱',
    tag: '씨앗',
    bg: 'bg-lime-50 border-lime-100',
  },
  seed_f3: {
    name: '금계 과수원 씨앗',
    desc: '새로운 농가 슬롯을 채우고 수확 보상을 노려보세요.',
    icon: '🌱',
    tag: '씨앗',
    bg: 'bg-lime-50 border-lime-100',
  },
  nutrient: {
    name: '고급 영양제',
    desc: '성장률을 10% 올려요. 한 시즌에 2번까지 사용할 수 있어요.',
    icon: '🧪',
    tag: '성장',
    bg: 'bg-emerald-50 border-emerald-100',
  },
  medicine: {
    name: '병충해 치료약',
    desc: '진딧물, 잎마름, 벌레 침입 상태를 바로 치료해요.',
    icon: '💊',
    tag: '치료',
    bg: 'bg-red-50 border-red-100',
  },
  shield: {
    name: '폭염 방풍막',
    desc: '폭염 이벤트의 성장 패널티를 막아주는 보호 아이템이에요.',
    icon: '🛡️',
    tag: '보호',
    bg: 'bg-sky-50 border-sky-100',
  },
  fertilizer: {
    name: '영주 한우비료',
    desc: '다음 시즌 초반 성장을 든든하게 밀어주는 프리미엄 아이템이에요.',
    icon: '🌾',
    tag: '보너스',
    bg: 'bg-yellow-50 border-yellow-100',
  },
};

const getCopy = (id: string) => ITEM_COPY[id] ?? {
  name: '사과나무 아이템',
  desc: '나무 성장과 농가 관리에 사용할 수 있어요.',
  icon: '🍎',
  tag: '아이템',
  bg: 'bg-stone-50 border-stone-100',
};

export const StoreView: React.FC<StoreProps> = ({
  points,
  apples = 0,
  onBuyItem,
  onBuyWithApples,
  onBack,
  onNavigateToMissions,
  ownedItems = [],
  onPlantSeed,
}) => {
  return (
    <div className="space-y-6 py-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="mb-3 flex items-center gap-1.5 text-sm font-black text-stone-400 transition-all active:opacity-60"
            >
              <ArrowLeft size={17} /> 돌아가기
            </button>
          )}
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-apple-red">Growth Shop</p>
          <h2 className="mt-1 text-2xl font-black text-stone-900">나무 돌봄 상점</h2>
          <p className="mt-1 text-xs font-bold leading-relaxed text-warm-gray">
            포인트와 수확 사과로 씨앗, 치료약, 성장 아이템을 준비해요.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-red-100 bg-red-50 px-4 py-3 text-right">
          <p className="text-[9px] font-black uppercase tracking-widest text-apple-red">보유 사과</p>
          <p className="text-base font-black text-stone-900">{apples}개</p>
        </div>
      </header>

      <section className="rounded-[1.75rem] border-2 border-yellow-100 bg-yellow-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
            🪙
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-700">보유 포인트</p>
            <p className="text-xl font-black text-stone-900">{points.toLocaleString()} P</p>
          </div>
          <button
            onClick={onNavigateToMissions}
            className="ml-auto rounded-full bg-white px-3 py-2 text-[11px] font-black text-yellow-700 shadow-sm transition-all active:scale-95"
          >
            미션으로 모으기
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-yeoju-gold" />
            <h3 className="section-title">성장 아이템</h3>
          </div>
          <span className="text-[10px] font-black text-stone-400">포인트 또는 사과 결제</span>
        </div>

        <div className="space-y-3">
          {SHOP_ITEMS.map((item) => {
            const copy = getCopy(item.id);
            const applePrice = item.type === 'item' ? 5 : Math.max(1, Math.round(item.price / 500));
            const canBuyWithPoints = points >= item.price;
            const canBuyWithApples = apples >= applePrice;
            const isSeed = item.id.startsWith('seed_');
            const ownedCount = ownedItems.find(i => i.id === item.id)?.count ?? 0;

            return (
              <motion.div key={item.id} whileTap={{ scale: 0.98 }} className="cute-card p-4">
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 text-3xl', copy.bg)}>
                    {copy.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-black text-stone-500">
                        {copy.tag}
                      </span>
                      {ownedCount > 0 && (
                        <span className="rounded-full bg-apple-green/10 px-2 py-0.5 text-[9px] font-black text-apple-green">
                          {ownedCount}개 보유
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-stone-900">{copy.name}</h4>
                    <p className="mt-0.5 text-[11px] font-bold leading-snug text-warm-gray">{copy.desc}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onBuyItem(item.id, item.price)}
                    disabled={!canBuyWithPoints}
                    className={cn(
                      'rounded-xl px-3 py-2 text-[11px] font-black transition-all',
                      canBuyWithPoints
                        ? 'bg-yeoju-gold text-white shadow-[0_3px_0_0_#b07a00] active:translate-y-0.5 active:shadow-none'
                        : 'cursor-not-allowed bg-stone-100 text-stone-300',
                    )}
                  >
                    {item.price.toLocaleString()} P
                  </button>
                  <button
                    onClick={() => onBuyWithApples(item.id, applePrice)}
                    disabled={!canBuyWithApples}
                    className={cn(
                      'rounded-xl px-3 py-2 text-[11px] font-black transition-all',
                      canBuyWithApples
                        ? 'bg-apple-red text-white shadow-[0_3px_0_0_#cc2828] active:translate-y-0.5 active:shadow-none'
                        : 'cursor-not-allowed bg-stone-100 text-stone-300',
                    )}
                  >
                    사과 {applePrice}개
                  </button>
                </div>

                {isSeed && ownedCount > 0 && onPlantSeed && (
                  <button
                    onClick={onPlantSeed}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-apple-green py-2.5 text-xs font-black text-white shadow-[0_3px_0_0_#2d7a2d] transition-all active:translate-y-0.5 active:shadow-none"
                  >
                    <Leaf size={15} /> 지도에서 바로 심기
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2 px-1">
          <Store size={15} className="text-apple-red" />
          <h3 className="section-title">수확 후 실제 구매</h3>
        </div>

        <motion.a
          href="https://yjmarket.cyso.co.kr/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="relative block aspect-21/9 w-full overflow-hidden rounded-[2rem] border-4 border-white shadow-xl"
        >
          <img
            src="https://picsum.photos/seed/yeongjumarket/1200/600"
            alt="영주장날 공식몰"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-black/20 to-transparent p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h4 className="mb-0.5 text-lg font-black text-white">영주장날 공식몰</h4>
                <p className="text-[11px] font-bold text-white/75">게임에서 만난 사과를 실제 소비로 이어가요.</p>
              </div>
              <div className="rounded-2xl bg-white/20 p-2.5 backdrop-blur-md">
                <ExternalLink size={18} className="text-white" />
              </div>
            </div>
          </div>
        </motion.a>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            { icon: <PackageOpen size={14} />, label: '산지 직송', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { icon: <ShoppingBag size={14} />, label: '수확 보상 연계', cls: 'bg-sky-50 text-sky-700 border-sky-100' },
          ].map((feature) => (
            <div key={feature.label} className={cn('flex items-center justify-center gap-1.5 rounded-xl border-2 p-2.5 text-[11px] font-black shadow-sm', feature.cls)}>
              {feature.icon}
              {feature.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
