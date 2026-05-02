import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CloudSun, Gift, MapPinned, Sprout, X } from 'lucide-react';
import { FARMLY_LOGO_ALT, FARMLY_LOGO_SRC, SERVICE_NAME } from '../brand';

interface GameIntroModalProps {
  onClose: () => void;
}

const STEPS = [
  {
    icon: Sprout,
    title: '1. 농가를 고르고 씨앗 심기',
    text: '영주 농가 지도에서 원하는 농가를 선택하고 사과나무 씨앗을 분양받아요.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    icon: CloudSun,
    title: '2. 30일 동안 돌보기',
    text: '물주기, 영양제, 기상 이벤트, 병충해 관리를 통해 나무를 성장시켜요.',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
  },
  {
    icon: MapPinned,
    title: '3. 영주 여행 미션',
    text: '관광지 미션과 코스를 완료하면 포인트와 성장 보너스를 받을 수 있어요.',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    icon: Gift,
    title: '4. 수확하고 보상 받기',
    text: '수확한 사과는 아이템 교환과 실물 사과 배송 신청으로 이어져요.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
];

export const GameIntroModal: React.FC<GameIntroModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[450] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/45 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 18 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border-4 border-white bg-[#fffaf1] shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-stone-400 shadow-sm transition-all active:scale-90"
          aria-label="게임 설명 닫기"
        >
          <X size={18} />
        </button>

        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-apple-light" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-apple-light-green" />

        <div className="relative p-6 pt-8">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-[2rem] border-4 border-white bg-white/75 p-1 shadow-lg">
              <img src={FARMLY_LOGO_SRC} alt={FARMLY_LOGO_ALT} className="h-full w-full object-contain object-center" />
            </div>
            <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-apple-green">Welcome Quest</p>
            <h2 className="text-2xl font-black tracking-tight text-stone-800">{SERVICE_NAME} 시작하기</h2>
            <p className="mt-2 text-xs font-bold leading-relaxed text-stone-500">
              사과나무 성장과 영주 여행이 함께 진행되는 농장 모험이에요.
            </p>
          </div>

          <div className="space-y-2.5">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * index }}
                className="flex gap-3 rounded-2xl border-2 border-white bg-white/85 p-3 shadow-sm"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 ${step.color}`}>
                  <step.icon size={21} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-800">{step.title}</h3>
                  <p className="mt-0.5 text-[11px] font-bold leading-relaxed text-stone-500">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-800 py-4 text-sm font-black text-white shadow-[0_5px_0_0_#171717] transition-all active:translate-y-[5px] active:shadow-none"
          >
            <CheckCircle2 size={17} />
            시작할게요
          </button>
        </div>
      </motion.div>
    </div>
  );
};
