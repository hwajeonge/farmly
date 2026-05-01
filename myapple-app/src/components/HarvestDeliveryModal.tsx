import React, { useState } from 'react';
import { showAlert } from '../lib/alertEmitter';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Check, Mail, Truck, Info, Apple } from 'lucide-react';
import { cn } from '../lib/utils';

interface HarvestDeliveryModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  accumulatedApples: number;
}

export const HarvestDeliveryModal: React.FC<HarvestDeliveryModalProps> = ({ onClose, onSubmit, accumulatedApples }) => {
  const [step, setStep] = useState<'options' | 'address' | 'thanks'>('options');
  const [selectedOption, setSelectedOption] = useState<string>('free');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    memo: ''
  });

  const options = [
    { id: 'free', title: '무료 수확 1kg', price: '0원', desc: '기본 수확 (배송비 포함)', icon: '🍎' },
    { id: 'extra1', title: '무료 수확 1kg + 추가 1kg', extra: '(총 2kg)', price: '3,500원', desc: '이벤트 혜택가', icon: '🍎🍎' },
    { id: 'extra2', title: '무료 수확 1kg + 추가 2kg', extra: '(총 3kg)', price: '5,500원', desc: '이벤트 혜택가', icon: '🍎🍎🍎' },
  ];

  const handleNext = () => {
    if (step === 'options') setStep('address');
    else if (step === 'address') {
      if (!formData.name || !formData.phone || !formData.address) {
        showAlert('이름, 연락처, 주소를\n모두 입력해주세요!', '📦', 'warning');
        return;
      }
      setStep('thanks');
    } else {
      onSubmit({ ...formData, selectedOptionId: selectedOption });
    }
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
        className="relative w-full max-w-sm bg-white rounded-[3rem] overflow-hidden shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 active:scale-90 transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-10">
          <AnimatePresence mode="wait">
            {step === 'options' && (
              <motion.div 
                key="options"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-apple-red/10 text-apple-red rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift size={32} />
                  </div>
                  <h3 className="text-xl font-black text-stone-800">수확 옵션 선택</h3>
                  <p className="text-xs font-bold text-stone-400 mt-1">열심히 키운 사과를 집에서 맛보세요!</p>
                </div>

                <div className="space-y-3">
                  {options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden",
                        selectedOption === opt.id 
                          ? "border-apple-red bg-apple-red/5 ring-4 ring-apple-red/10" 
                          : "border-stone-100 bg-white"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">옵션</p>
                          <h4 className="font-black text-stone-800 text-sm">
                            {opt.title} <span className="text-apple-red">{opt.extra}</span>
                          </h4>
                          <p className="text-[10px] font-bold text-stone-500 mt-0.5">{opt.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-apple-red">{opt.price}</p>
                        </div>
                      </div>
                      {selectedOption === opt.id && (
                        <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 grayscale-0">
                          {opt.icon}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div className="flex gap-2 text-stone-500">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium leading-relaxed italic">
                      * 교환권 사용 시 배송비는 0원입니다. <br />
                      * 추가 구매 옵션 결제 시 1~2일 내 발송됩니다.
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
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck size={32} />
                  </div>
                  <h3 className="text-xl font-black text-stone-800">배송 정보 입력</h3>
                  <p className="text-xs font-bold text-stone-400 mt-1">영주 농부님이 정성껏 보내드립니다.</p>
                </div>

                <div className="space-y-3">
                  <Input label="받는 분 성함" placeholder="홍길동" value={formData.name} onChange={v => setFormData(prev => ({ ...prev, name: v }))} />
                  <Input label="연락처" placeholder="010-0000-0000" value={formData.phone} onChange={v => setFormData(prev => ({ ...prev, phone: v }))} />
                  <Input label="주소" placeholder="배송지를 입력해주세요" value={formData.address} onChange={v => setFormData(prev => ({ ...prev, address: v }))} isTextArea />
                  <Input label="배송 메모 (선택)" placeholder="경비실에 맡겨주세요" value={formData.memo} onChange={v => setFormData(prev => ({ ...prev, memo: v }))} />
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
                <div className="w-32 h-32 bg-stone-50 rounded-[2.5rem] border-4 border-white shadow-xl mx-auto flex items-center justify-center text-6xl transform -rotate-3 overflow-hidden relative group">
                  🍎
                  <div className="absolute inset-0 bg-yeoju-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-stone-800 mb-2">수확을 축하합니다!</h3>
                  <div className="bg-stone-50 p-6 rounded-4xl border-2 border-stone-100 relative text-left">
                    <Mail size={24} className="absolute -top-3 -right-3 text-yeoju-gold transform rotate-12" />
                    <p className="text-xs font-bold text-stone-600 leading-relaxed italic">
                      "저의 사과나무 소수( nickname )가 영주의 맑은 바람과 높은 햇살 아래 무럭무럭 자라 드디어 저희 집 식탁까지 오게 되었네요. 
                      30일 동안 정성스레 보살펴준 덕분에 이렇게 맛있는 사과를 수확할 수 있었습니다. 
                      영주의 자연과 저의 정성이 담긴 이 사과를 가족들과 맛있게 나누어 먹겠습니다!"
                    </p>
                    <p className="text-right text-[10px] font-black text-stone-400 mt-4">— 영주 대농장주 홍길동 올림</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-apple-green font-black text-sm">
                   <CheckCircle2 size={18} />
                   감사 편지가 사과 상자에 동봉됩니다.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleNext}
            className="w-full py-5 bg-stone-800 text-white rounded-3xl font-black text-lg shadow-xl shadow-stone-200 active:scale-95 transition-all mt-10"
          >
            {step === 'options' ? '다음 단계로' : step === 'address' ? '신청 완료하기' : '닫기'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Input = ({ label, placeholder, value, onChange, isTextArea }: { label: string, placeholder: string, value: string, onChange: (v: string) => void, isTextArea?: boolean }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-2">{label}</label>
    {isTextArea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-apple-green focus:border-transparent outline-none transition-all min-h-20"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-apple-green focus:border-transparent outline-none transition-all"
      />
    )}
  </div>
);

const CheckCircle2 = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
