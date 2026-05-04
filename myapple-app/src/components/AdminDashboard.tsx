import React from 'react';
import { UserRole } from '../types';
import { FarmAdminDashboard } from './FarmAdminDashboard';
import { GovAdminDashboard } from './GovAdminDashboard';

interface AdminDashboardProps {
  role: UserRole;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ role }) => {
  if (role === 'farm_owner') {
    return (
      <div className="py-4">
        <div className="mb-6">
          <h2 className="mb-1 text-2xl font-black text-stone-800">농가 관리자</h2>
          <p className="text-xs font-bold leading-relaxed text-stone-400">
            사과나무 상품, 농가 정보, 주문, 리뷰, AI 분석을 관리합니다.
          </p>
        </div>
        <FarmAdminDashboard role={role} />
      </div>
    );
  }

  if (role === 'gov_admin') {
    return (
      <div className="py-4">
        <div className="mb-6">
          <h2 className="mb-1 text-2xl font-black text-stone-800">지자체 관리자</h2>
          <p className="text-xs font-bold leading-relaxed text-stone-400">
            관광 유입, 농가 성과, 소비 전환, 정책 운영 데이터를 관리합니다.
          </p>
        </div>
        <GovAdminDashboard />
      </div>
    );
  }

  return null;
};
