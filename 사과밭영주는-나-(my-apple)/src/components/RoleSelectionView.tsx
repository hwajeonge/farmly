import React from 'react';
import { motion } from 'motion/react';
import { User, Store, ShieldCheck, ArrowRight, LogOut } from 'lucide-react';
import { UserRole } from '../types';
import { authService } from '../services/authService';

interface RoleSelectionViewProps {
  onSelect: (role: UserRole) => void;
  userName: string;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({ onSelect, userName }) => {
  const handleLogout = () => authService.logout();
  const roles = [
    {
      id: 'general' as const,
      title: '일반 회원',
      description: '영주의 명소를 탐험하고 나만의 사과나무를 키워보세요.',
      icon: <User className="w-8 h-8 text-blue-500" />,
      bg: 'bg-blue-50',
      border: 'hover:border-blue-200'
    },
    {
      id: 'farm_owner' as const,
      title: '농가 회원 (관리자)',
      description: '농가를 운영하고 체험 코스를 관리하여 방문객과 소통하세요.',
      icon: <Store className="w-8 h-8 text-apple-green" />,
      bg: 'bg-green-50',
      border: 'hover:border-apple-green/30'
    },
    {
      id: 'gov_admin' as const,
      title: '지자체 관리자',
      description: '영주시의 관광 정책과 지역 이벤트를 관리하고 분석합니다.',
      icon: <ShieldCheck className="w-8 h-8 text-apple-red" />,
      bg: 'bg-red-50',
      border: 'hover:border-apple-red/30'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-stone-800 mb-2">반가워요, {userName}님!</h1>
          <p className="text-stone-400 font-bold text-sm leading-relaxed">
            영주 톡톡을 어떻게 이용하고 싶으신가요?<br />
            이용 목적에 맞는 회원 유형을 선택해 주세요.
          </p>
        </div>

        <div className="space-y-4">
          {roles.map((role, idx) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelect(role.id)}
              className={`w-full flex items-center gap-4 p-5 bg-white rounded-3xl border-4 border-transparent ${role.border} shadow-sm group transition-all text-left`}
            >
              <div className={`w-16 h-16 ${role.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                {role.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-stone-800 flex items-center justify-between mb-1">
                  {role.title}
                  <ArrowRight size={16} className="text-stone-300 group-hover:text-stone-500 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-[11px] font-bold text-stone-400 leading-tight">
                  {role.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="mt-10 text-center text-[10px] font-bold text-stone-300 uppercase tracking-widest leading-relaxed">
          한 번 선택한 유형은 나중에 변경이 어려울 수 있습니다.<br />
          정확한 정보를 선택해 주시기 바랍니다.
        </p>

        <center>
          <button 
            onClick={handleLogout}
            className="mt-6 flex items-center gap-2 text-stone-400 font-black text-xs hover:text-red-400 transition-colors"
          >
            <LogOut size={14} /> 다른 계정으로 로그인하기
          </button>
        </center>
      </motion.div>
    </div>
  );
};
