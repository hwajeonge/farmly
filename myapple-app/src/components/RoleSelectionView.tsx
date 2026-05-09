import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, LogOut, ShieldCheck, Store, User } from 'lucide-react';
import { UserRole } from '../types';
import { authService } from '../services/authService';

interface RoleSelectionViewProps {
  onSelect: (role: UserRole) => void;
  userName: string;
  isGuest?: boolean;
  onExit?: () => void;
}

const roles = [
  {
    id: 'general' as const,
    title: '일반 회원',
    description: '영주 여행 미션을 즐기고 나만의 사과나무를 키워보는 체험 계정',
    icon: User,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    border: 'hover:border-blue-200',
  },
  {
    id: 'farm_owner' as const,
    title: '농가 회원',
    description: '사과나무 상품, 농가 정보, 주문과 리뷰를 관리하는 농가 관리자 체험 계정',
    icon: Store,
    bg: 'bg-emerald-50',
    iconColor: 'text-apple-green',
    border: 'hover:border-apple-green/30',
  },
  {
    id: 'gov_admin' as const,
    title: '지자체 회원',
    description: '사용자, 농가, 관광 미션과 정책 효과를 확인하는 지자체 관리자 체험 계정',
    icon: ShieldCheck,
    bg: 'bg-red-50',
    iconColor: 'text-apple-red',
    border: 'hover:border-apple-red/30',
  },
];

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({
  onSelect,
  userName,
  isGuest = false,
  onExit,
}) => {
  const handleExit = () => {
    if (onExit) {
      onExit();
      return;
    }

    authService.logout();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] border-4 border-white bg-apple-light text-3xl shadow-sm">
            {isGuest ? '🌱' : '🍎'}
          </div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-apple-red">
            {isGuest ? 'Guest Mode' : 'Welcome'}
          </p>
          <h1 className="mb-2 text-2xl font-black text-stone-800">
            {userName}님, 어떤 모드로 시작할까요?
          </h1>
          <p className="text-sm font-bold leading-relaxed text-stone-400">
            {isGuest
              ? '아이디 없이도 역할별 체험 데이터를 바로 확인할 수 있어요.'
              : '이용 목적에 맞는 회원 유형을 선택해주세요.'}
          </p>
        </div>

        <div className="space-y-4">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => onSelect(role.id)}
                className={`group flex w-full items-center gap-4 rounded-3xl border-4 border-transparent bg-white p-5 text-left shadow-sm transition-all ${role.border}`}
              >
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${role.bg}`}>
                  <Icon className={`h-8 w-8 ${role.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 flex items-center justify-between font-black text-stone-800">
                    {role.title}
                    <ArrowRight
                      size={16}
                      className="text-stone-300 transition-all group-hover:translate-x-1 group-hover:text-stone-500"
                    />
                  </h3>
                  <p className="text-[11px] font-bold leading-relaxed text-stone-400">
                    {role.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {isGuest && (
          <div className="mt-5 rounded-3xl border-2 border-amber-100 bg-amber-50 px-4 py-3 text-center">
            <p className="text-[11px] font-bold leading-relaxed text-amber-700">
              게스트 데이터는 체험용 더미 데이터예요. 로그아웃하면 저장되지 않고,
              실물 사과 배송 신청은 Google 로그인 후 사용할 수 있어요.
            </p>
          </div>
        )}

        <button
          onClick={handleExit}
          className="mx-auto mt-6 flex items-center gap-2 text-xs font-black text-stone-400 transition-colors hover:text-apple-red"
        >
          {isGuest ? <ArrowLeft size={14} /> : <LogOut size={14} />}
          {isGuest ? '로그인 화면으로 돌아가기' : '다른 계정으로 로그인하기'}
        </button>
      </motion.div>
    </div>
  );
};
