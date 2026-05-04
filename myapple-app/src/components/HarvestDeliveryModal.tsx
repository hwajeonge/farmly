import React, { useState } from 'react';
import { showAlert } from '../lib/alertEmitter';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Gift, Info, Mail, Truck, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { DeliveryInfo } from '../types';

interface HarvestDeliveryModalProps {
  onClose: () => void;
  onSubmit: (data: DeliveryInfo) => void;
  accumulatedApples: number;
}

const DELIVERY_OPTIONS = [
  {
    id: 'free_1kg',
    title: '실물 사과 1kg 배송',
    extra: '기본 보상',
    price: '무료',
    desc: '누적 수확 사과 10개 이상 달성 시 신청할 수 있어요.',
    icon: '🍎',
  },
];

export const HarvestDeliveryModal: React.FC<HarvestDeliveryModalProps> = ({ onClose, onSubmit, accumulatedApples }) => {
  const [step, setStep] = useState<'options' | 'address' | 'thanks'>('options');
  const [selectedOption, setSelectedOption] = useState<string>('free_1kg');
  const [formData, setFormData] = useState({
    recipientName: '',
    phoneNumber: '',
    address: '',
    memo: '',
  });

  const selectedOptionLabel = DELIVERY_OPTIONS.find(option => option.id === selectedOption)?.title ?? '실물 사과 배송';

  const handleNext = () => {
    if (step === 'options') {
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
                    누적 수확 {accumulatedApples}개를 달성했어요.
                  </p>
                </div>

                <div className="space-y-3">
                  {DELIVERY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option.id)}
                      className={cn(
                        'relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all',
                        selectedOption === option.id
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
                          <p className="mt-0.5 text-[10px] font-bold leading-relaxed text-stone-500">{option.desc}</p>
                        </div>
                        <p className="shrink-0 text-sm font-black text-apple-red">{option.price}</p>
                      </div>
                      {selectedOption === option.id && (
                        <div className="absolute -bottom-2 -right-2 text-4xl opacity-10">
                          {option.icon}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                  <div className="flex gap-2 text-stone-500">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <p className="text-[10px] font-medium leading-relaxed">
                      배송 정보는 신청 내역에 저장됩니다. 신청 후 마이페이지에서 배송 기록을 확인할 수 있어요.
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
                  <p className="mt-1 text-xs font-bold text-stone-400">{selectedOptionLabel}을 받을 정보를 입력해주세요.</p>
                </div>

                <div className="space-y-3">
                  <Input label="받는 분" placeholder="이름을 입력해주세요" value={formData.recipientName} onChange={v => setFormData(prev => ({ ...prev, recipientName: v }))} />
                  <Input label="연락처" placeholder="010-0000-0000" value={formData.phoneNumber} onChange={v => setFormData(prev => ({ ...prev, phoneNumber: v }))} />
                  <Input label="주소" placeholder="배송지를 입력해주세요" value={formData.address} onChange={v => setFormData(prev => ({ ...prev, address: v }))} isTextArea />
                  <Input label="배송 메모" placeholder="경비실에 맡겨주세요" value={formData.memo} onChange={v => setFormData(prev => ({ ...prev, memo: v }))} />
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
                  🍎
                </div>

                <div>
                  <h3 className="mb-2 text-2xl font-black text-stone-900">배송 신청 준비 완료</h3>
                  <div className="relative rounded-[2rem] border-2 border-stone-100 bg-stone-50 p-5 text-left">
                    <Mail size={24} className="absolute -right-3 -top-3 rotate-12 text-yeoju-gold" />
                    <p className="text-xs font-bold leading-relaxed text-stone-600">
                      30일 동안 키운 사과나무의 수확 보상이 배송 신청 내역으로 저장됩니다. 신청을 완료하면 마이페이지에서 배송 기록을 확인할 수 있어요.
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
            {step === 'options' ? '다음 단계로' : step === 'address' ? '신청 내용 확인' : '신청 완료'}
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
