import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Apple,
  Bell,
  Briefcase,
  DollarSign,
  Home,
  LayoutDashboard,
  Map,
  MapPin,
  PieChart,
  Route,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '../lib/utils';

type SubTab = 'overview' | 'farms' | 'consumers' | 'tourism' | 'policy' | 'ops';

type MetricCardProps = {
  label: string;
  value: string;
  unit?: string;
  helper: string;
  icon: React.ElementType;
  tone?: 'blue' | 'red' | 'green' | 'gold' | 'stone';
};

const toneClass = {
  blue: 'text-blue-500 bg-blue-50 border-blue-100',
  red: 'text-apple-red bg-red-50 border-red-100',
  green: 'text-apple-green bg-emerald-50 border-emerald-100',
  gold: 'text-yeoju-gold bg-yellow-50 border-yellow-100',
  stone: 'text-stone-600 bg-stone-50 border-stone-100',
};

const menuItems: Array<{ id: SubTab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: '대시보드', icon: LayoutDashboard },
  { id: 'farms', label: '농가 분석', icon: Home },
  { id: 'consumers', label: '소비 분석', icon: DollarSign },
  { id: 'tourism', label: '관광 분석', icon: Map },
  { id: 'policy', label: '정책 효과', icon: Briefcase },
  { id: 'ops', label: '알림/운영', icon: Bell },
];

export const GovAdminDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');

  return (
    <div className="pb-10">
      <div className="sticky top-[72px] z-30 -mx-4 flex gap-2 overflow-x-auto bg-stone-50 px-4 pt-2 pb-4 no-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black whitespace-nowrap transition-all',
                isActive
                  ? 'bg-stone-800 text-white shadow-lg shadow-stone-800/20'
                  : 'border-2 border-stone-100 bg-white text-stone-400',
              )}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          {activeSubTab === 'overview' && <OverviewSection />}
          {activeSubTab === 'farms' && <FarmsSection />}
          {activeSubTab === 'consumers' && <ConsumersSection />}
          {activeSubTab === 'tourism' && <TourismSection />}
          {activeSubTab === 'policy' && <PolicySection />}
          {activeSubTab === 'ops' && <OpsSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const MetricCard = ({ label, value, unit, helper, icon: Icon, tone = 'stone' }: MetricCardProps) => (
  <div className="rounded-3xl border-4 border-stone-100 bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-2">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-2xl border', toneClass[tone])}>
        <Icon size={15} />
      </div>
      <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <p className="text-3xl font-black text-stone-800">{value}</p>
      {unit && <span className="text-xs font-black text-stone-400">{unit}</span>}
    </div>
    <p className="mt-2 text-[10px] font-bold text-stone-400">{helper}</p>
  </div>
);

const SectionCard = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-[2rem] border-4 border-stone-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-stone-500">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-sm font-black text-stone-800">{title}</h3>
        <p className="mt-1 text-[11px] font-bold leading-relaxed text-stone-400">{description}</p>
      </div>
    </div>
    <div className="space-y-2">{children}</div>
  </section>
);

const ReadyRow = ({ title, detail }: { title: string; detail: string }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3">
    <div className="min-w-0">
      <p className="text-xs font-black text-stone-700">{title}</p>
      <p className="mt-0.5 text-[10px] font-bold text-stone-400">{detail}</p>
    </div>
    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-stone-400">
      대기
    </span>
  </div>
);

const ZeroPanel = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-[2rem] border-4 border-dashed border-stone-100 bg-white/70 p-7 text-center">
    <p className="text-3xl font-black text-stone-300">0</p>
    <h3 className="mt-2 text-sm font-black text-stone-700">{title}</h3>
    <p className="mt-2 text-[11px] font-bold leading-relaxed text-stone-400">{description}</p>
  </div>
);

const OverviewSection = () => (
  <div className="space-y-5">
    <div className="rounded-[2.5rem] bg-stone-800 p-6 text-white shadow-xl shadow-stone-200">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-widest text-white/50 uppercase">Data Status</p>
          <h3 className="mt-1 text-xl font-black">운영 데이터 연동 대기</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black">0 데이터</span>
      </div>
      <p className="text-[11px] font-bold leading-relaxed text-white/60">
        실제 사용자, GPS/미션, 주문, 농가 매출 데이터가 연결되면 지자체 대시보드 수치가 자동 반영됩니다.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="전체 사용자" value="0" unit="명" helper="가입 사용자 없음" icon={Users} tone="blue" />
      <MetricCard label="활성 사용자" value="0" unit="명" helper="실제 이용자 없음" icon={Activity} tone="red" />
      <MetricCard label="관광 방문자" value="0" unit="명" helper="GPS/미션 데이터 없음" icon={MapPin} tone="green" />
      <MetricCard label="외부 유입" value="0" unit="명" helper="지역 유입 데이터 없음" icon={Route} tone="gold" />
      <MetricCard label="미션 수행" value="0" unit="회" helper="완료 미션 없음" icon={PieChart} tone="stone" />
      <MetricCard label="평균 체류" value="0" unit="분" helper="체류 데이터 없음" icon={TrendingUp} tone="blue" />
      <MetricCard label="사과 판매량" value="0" unit="개" helper="판매 내역 없음" icon={Apple} tone="red" />
      <MetricCard label="매출 규모" value="0" unit="원" helper="결제 데이터 없음" icon={DollarSign} tone="green" />
    </div>
  </div>
);

const FarmsSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="농가 매출" value="0" unit="원" helper="농가별 매출 없음" icon={DollarSign} tone="green" />
      <MetricCard label="분양 수" value="0" unit="건" helper="사용자 선택 없음" icon={Store} tone="red" />
      <MetricCard label="인기 농가" value="0" unit="곳" helper="순위 산정 전" icon={Home} tone="gold" />
      <MetricCard label="품종 분석" value="0" unit="건" helper="품종 데이터 없음" icon={Apple} tone="blue" />
    </div>

    <SectionCard icon={Home} title="농가 분석" description="농가 선택, 방문, 구매 데이터를 기반으로 농가 성과를 분석합니다.">
      <ReadyRow title="농가별 매출" detail="농가별 판매 금액 및 직거래 매출" />
      <ReadyRow title="농가 선택 수" detail="사용자 선택, 분양, 씨앗 구매 수" />
      <ReadyRow title="인기 농가" detail="방문 + 구매 기반 순위" />
      <ReadyRow title="품종별 인기" detail="부사, 홍로 등 품종별 선호도" />
      <ReadyRow title="지역별 농가 분포" detail="특정 읍면동 쏠림 여부" />
    </SectionCard>

    <ZeroPanel
      title="농가 분석 데이터가 아직 없습니다"
      description="참여 농가와 실제 거래 데이터가 연결되면 매출, 분양 수, 품종별 인기 지표가 표시됩니다."
    />
  </div>
);

const ConsumersSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="시즌 판매량" value="0" unit="개" helper="시즌 판매 없음" icon={Apple} tone="red" />
      <MetricCard label="구매 전환" value="0" unit="%" helper="관광→구매 없음" icon={TrendingUp} tone="green" />
      <MetricCard label="재구매율" value="0" unit="%" helper="재구매 없음" icon={Activity} tone="blue" />
      <MetricCard label="평균 구매" value="0" unit="원" helper="구매 금액 없음" icon={DollarSign} tone="gold" />
    </div>

    <SectionCard icon={DollarSign} title="소비 분석" description="판매량, 구매 패턴, 관광 후 구매 흐름을 분석합니다.">
      <ReadyRow title="시즌별 판매량" detail="월별, 계절별 사과 판매량" />
      <ReadyRow title="1회 구매/체험 후 구매" detail="구매 유형 분류" />
      <ReadyRow title="관광 → 구매 전환 흐름" detail="미션, 코스, 상품 구매 연결" />
      <ReadyRow title="재구매율" detail="동일 사용자 반복 구매" />
      <ReadyRow title="1인 평균 구매 금액" detail="사용자별 평균 결제 금액" />
    </SectionCard>
  </div>
);

const TourismSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="인기 코스" value="0" unit="개" helper="완료 코스 없음" icon={Route} tone="blue" />
      <MetricCard label="동선" value="0" unit="건" helper="GPS 동선 없음" icon={Map} tone="green" />
      <MetricCard label="체류 시간" value="0" unit="분" helper="체류 기록 없음" icon={Activity} tone="gold" />
      <MetricCard label="이탈 지점" value="0" unit="곳" helper="분석 대상 없음" icon={MapPin} tone="red" />
    </div>

    <SectionCard icon={Map} title="관광 행동 분석" description="영주 방문자의 코스, 동선, 체류, 이탈 흐름을 분석합니다.">
      <ReadyRow title="인기 관광 코스" detail="사용자가 많이 선택한 관광 코스" />
      <ReadyRow title="관광 동선 분석" detail="GPS/미션 기반 이동 흐름" />
      <ReadyRow title="체류 시간 분석" detail="장소별 평균 체류 시간" />
      <ReadyRow title="이탈 지점 분석" detail="미션 중단, 코스 이탈 위치" />
    </SectionCard>
  </div>
);

const PolicySection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="정책 이용률" value="0" unit="%" helper="정책 이용 없음" icon={Briefcase} tone="stone" />
      <MetricCard label="성과 분석" value="0" unit="건" helper="분석 리포트 없음" icon={PieChart} tone="blue" />
      <MetricCard label="경제 기여" value="0" unit="원" helper="소비 연결 없음" icon={DollarSign} tone="green" />
      <MetricCard label="소비 연결" value="0" unit="%" helper="관광→소비 없음" icon={TrendingUp} tone="red" />
    </div>

    <SectionCard icon={Briefcase} title="정책 효과 분석" description="관광 정책과 지역 농가 소비 연결 성과를 확인합니다.">
      <ReadyRow title="관광 정책 이용률" detail="정책/쿠폰/프로그램 참여율" />
      <ReadyRow title="정책별 성과 분석" detail="정책별 방문, 구매, 재방문 성과" />
      <ReadyRow title="지역 경제 기여도" detail="관광 → 소비 연결 비율과 금액" />
    </SectionCard>
  </div>
);

const OpsSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="공지" value="0" unit="건" helper="등록 공지 없음" icon={Bell} tone="blue" />
      <MetricCard label="이벤트" value="0" unit="건" helper="운영 이벤트 없음" icon={Activity} tone="red" />
      <MetricCard label="정책 안내" value="0" unit="건" helper="안내 발송 없음" icon={Briefcase} tone="gold" />
      <MetricCard label="발송 알림" value="0" unit="건" helper="발송 이력 없음" icon={Users} tone="green" />
    </div>

    <SectionCard icon={Bell} title="알림 및 정책 운영" description="지자체 공지, 이벤트, 정책 안내를 운영합니다.">
      <ReadyRow title="공지 관리" detail="서비스 내 공지 등록과 공개 상태 관리" />
      <ReadyRow title="이벤트 관리" detail="관광 미션, 농가 방문, 시즌 캠페인" />
      <ReadyRow title="정책 안내" detail="지원 정책, 관광 정책, 지역 소비 혜택 안내" />
    </SectionCard>
  </div>
);
