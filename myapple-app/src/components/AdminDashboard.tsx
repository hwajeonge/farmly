import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Package, TrendingUp, ShieldAlert } from 'lucide-react';
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
          <h2 className="text-2xl font-black mb-1">농가 관리자 모드 👨‍🌾</h2>
          <p className="text-stone-400 text-xs font-bold leading-relaxed">
            나의 농가 운영 현황 및 방문객을 관리하고<br />
            AI Insight를 통해 판매 전략을 세워보세요.
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
          <h2 className="text-2xl font-black mb-1">지자체 관리 시스템 🏛️</h2>
          <p className="text-stone-400 text-xs font-bold leading-relaxed">
            영주시의 관광 유입 분석 및 농업 경제 성과를<br />
            통합 데이터 시각화를 통해 확인하세요.
          </p>
        </div>
        <GovAdminDashboard />
      </div>
    );
  }

  return null;
};
