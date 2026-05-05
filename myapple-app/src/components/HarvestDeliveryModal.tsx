import React, { useEffect, useMemo, useState } from 'react';
import { showAlert } from '../lib/alertEmitter';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Gift, Info, Mail, Truck, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { DeliveryInfo } from '../types';
import {
  getEligibleHarvestDeliveryRewards,
  getNextHarvestDeliveryReward,
  HARVEST_DELIVERY_REWARDS,
} from '../rewardRules';

interface HarvestDeliveryModalProps {
  onClose: () => void;
  onSubmit: (data: DeliveryInfo) => void;
  accumulatedApples: number;
}

export const HarvestDeliveryModal: React.FC<HarvestDeliveryModalProps> = ({
  onClose,
  onSubmit,
  accumulatedApples,
}) => {
  const eligibleOptions = useMemo(
    () => getEligibleHarvestDeliveryRewards(accumulatedApples),
    [accumulatedApples],
  );
  const nextReward = useMemo(
    () => getNextHarvestDeliveryReward(accumulatedApples),
    [accumulatedApples],
  );
  const [step, setStep] = useState<'options' | 'address' | 'thanks'>('options');
  const [selectedOption, setSelectedOption] = useState<string>(
    eligibleOptions[eligibleOptions.length - 1]?.id ?? '',
  );
  const [formData, setFormData] = useState({
    recipientName: '',
    phoneNumber: '',
    address: '',
    memo: '',
  });

  useEffect(() => {
    if (eligibleOptions.length === 0) {
      setSelectedOption('');
      return;
    }
    if (!eligibleOptions.some((option) => option.id === selectedOption)) {
      setSelectedOption(eligibleOptions[eligibleOptions.length - 1]?.id ?? '');
    }
  }, [eligibleOptions, selectedOption]);

  const selectedOptionLabel =
    HARVEST_DELIVERY_REWARDS.find((option) => option.id === selectedOption)?.title ?? '실물 사과 배송';

  const handleNext = () => {
    if (eligibleOptions.length === 0) {
      showAlert(
        nextReward
          ? `누적 사과 ${nextReward.applesNeeded}개가 되어야 ${nextReward.title}을 신청할 수 있어요.`
          : '신청 가능한 배송 보상이 아직 없어요.',
        '🍎',
        'warning',
      );
      return;
    }

    if (step === 'options') {
      const selectedReward = HARVEST_DELIVERY_REWARDS.find((option) => option.id === selectedOption);
      if (!selectedReward || accumulatedApples < selectedReward.applesNeeded) {
        showAlert('아직 조건을 달성하지 않은 배송 보상이에요.', '🍎', 'warning');
        return;
      }
      setStep('address');
      return;
    }

    if (step === 'address') {
      if (!formData.recipientName.trim() || !formData.phoneNumber.trim() || !formData.address.trim()) {
        showAlert('받는 분, 연락처, 주소를 모두 입력해주세요.', '📦', 'warning');
        return;
      }
      setStep('thanks');
      return;
    }

    onSubmit({
      ...formData,
      selectedOptionId: selectedOption,
      requestDate: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative max-h-[88vh] w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition-all active:scale-90"
          aria-label="배송 신청 닫기"
        >
          <X size={20} />
        </button>

        <div className="max-h-[88vh] overflow-y-auto p-7 pt-9">
          <AnimatePresence mode="wait">
            {step === 'options' && (
              <motion.div
                key="options"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-apple-red/10 text-apple-red">
                    <Gift size={32} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-apple-red">Harvest Reward</p>
                  <h3 className="mt-1 text-xl font-black text-stone-900">수확 보상 배송 신청</h3>
                  <p className="mt-1 text-xs font-bold text-stone-400">
                    현재 누적 사과 {accumulatedApples.toLocaleString()}개
                  </p>
                </div>

                {eligibleOptions.length === 0 && nextReward && (
                  <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 p-4 text-center">
                    <p className="text-sm font-black text-stone-700">
                      배송 신청까지 {Math.max(0, nextReward.applesNeeded - accumulatedApples).toLocaleString()}개 남았어요
                    </p>
                    <p className="mt-1 text-[11px] font-bold leading-relaxed text-stone-400">
                      누적 사과 {nextReward.applesNeeded}개를 달성하면 {nextReward.title}을 신청할 수 있어요.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {HARVEST_DELIVERY_REWARDS.map((option) => {
                    const isEligible = accumulatedApples >= option.applesNeeded;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!isEligible}
                        onClick={() => isEligible && setSelectedOption(option.id)}
                        className={cn(
                          'relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all',
                          !isEligible && 'cursor-not-allowed opacity-60',
                          selectedOption === option.id && isEligible
                            ? 'border-apple-red bg-apple-red/5 ring-4 ring-apple-red/10'
                            : 'border-stone-100 bg-white',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-stone-300">
                              {option.extra}
                            </p>
                            <h4 className="text-sm font-black text-stone-800">{option.title}</h4>
                            <p className="mt-0.5 text-[10px] font-bold leading-relaxed text-stone-500">
                              {isEligible
                                ? option.desc
                                : `누적 사과 ${option.applesNeeded}개부터 신청 가능해요.`}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-black text-apple-red">
                            {isEligible ? option.price : '잠김'}
                          </p>
                        </div>
                        {selectedOption === option.id && isEligible && (
                          <div className="absolute -bottom-2 -right-2 text-4xl opacity-10">
                            {option.icon}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                  <div className="flex gap-2 text-stone-500">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <p className="text-[10px] font-medium leading-relaxed">
                      배송 보상은 누적 사과 기준으로 열려요. 100개 달성 시 1kg, 200개 달성 시 2kg 배송을 신청할 수 있어요.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'address' && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                    <Truck size={32} />
                  </div>
                  <h3 className="text-xl font-black text-stone-900">배송 정보 입력</h3>
                  <p className="mt-1 text-xs font-bold text-stone-400">
                    {selectedOptionLabel}을 받을 정보를 입력해주세요.
                  </p>
                </div>

                <div className="space-y-3">
                  <Input label="받는 분" placeholder="이름을 입력해주세요" value={formData.recipientName} onChange={v => setFormData(prev => ({ ...prev, recipientName: v }))} />
                  <Input label="연락처" placeholder="010-0000-0000" value={formData.phoneNumber} onChange={v => setFormData(prev => ({ ...prev, phoneNumber: v }))} />
                  <Input label="주소" placeholder="배송지를 입력해주세요" value={formData.address} onChange={v => setFormData(prev => ({ ...prev, address: v }))} isTextArea />
                  <Input label="배송 메모" placeholder="배송 기사님께 전달할 내용을 적어주세요" value={formData.memo} onChange={v => setFormData(prev => ({ ...prev, memo: v }))} />
                </div>
              </motion.div>
            )}

            {step === 'thanks' && (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto flex h-28 w-28 -rotate-3 items-center justify-center rounded-[2rem] border-4 border-white bg-stone-50 text-6xl shadow-xl">
                  📦
                </div>

                <div>
                  <h3 className="mb-2 text-2xl font-black text-stone-900">배송 신청 준비 완료</h3>
                  <div className="relative rounded-[2rem] border-2 border-stone-100 bg-stone-50 p-5 text-left">
                    <Mail size={24} className="absolute -right-3 -top-3 rotate-12 text-yeoju-gold" />
                    <p className="text-xs font-bold leading-relaxed text-stone-600">
                      신청 내용이 배송 기록으로 저장돼요. 마이페이지에서 신청 내역을 확인할 수 있어요.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm font-black text-apple-green">
                  <Check size={18} />
                  신청 내용을 저장할 준비가 되었어요
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleNext}
            className="mt-8 w-full rounded-3xl bg-stone-800 py-4 text-base font-black text-white shadow-xl shadow-stone-200 transition-all active:scale-95"
          >
            {eligibleOptions.length === 0
              ? '확인'
              : step === 'options'
                ? '다음 단계로'
                : step === 'address'
                  ? '신청 내용 확인'
                  : '신청 완료'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  isTextArea,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  isTextArea?: boolean;
}) => (
  <div className="space-y-1">
    <label className="pl-2 text-[10px] font-black uppercase tracking-widest text-stone-400">{label}</label>
    {isTextArea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-20 w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-apple-green"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-apple-green"
      />
    )}
  </div>
);
