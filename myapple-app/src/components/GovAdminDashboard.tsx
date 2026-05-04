import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Apple,
  Bell,
  Briefcase,
  DollarSign,
  Home,
  LayoutDashboard,
  Loader2,
  Map,
  MapPin,
  PieChart,
  Route,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
// @ts-ignore — collection/getDocs exist at runtime; TS can't resolve due to @firebase/firestore package exports config
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { FARMS } from '../constants';
import { cn } from '../lib/utils';
import { getGovAdminInsight } from '../services/geminiService';

type SubTab = 'overview' | 'farms' | 'consumers' | 'tourism' | 'policy' | 'ops';

type MetricCardProps = {
  label: string;
  value: string;
  unit?: string;
  helper: string;
  icon: React.ElementType;
  tone?: 'blue' | 'red' | 'green' | 'gold' | 'stone';
};

interface GovStats {
  totalUsers: number;
  activeUsers: number;
  farmOwners: number;
  totalTrees: number;
  totalApples: number;
  totalMissions: number;
  deliveryRequests: number;
  honoraryCitizens: number;
  courseCount: number;
  topFarms: { name: string; count: number }[];
}

const toneClass = {
  blue: 'text-blue-500 bg-blue-50 border-blue-100',
  red: 'text-apple-red bg-red-50 border-red-100',
  green: 'text-apple-green bg-emerald-50 border-emerald-100',
  gold: 'text-yeoju-gold bg-yellow-50 border-yellow-100',
  stone: 'text-stone-600 bg-stone-50 border-stone-100',
};

const menuItems: Array<{ id: SubTab; label: string; icon: React.ElementType }> = [
  { id: 'overview',  label: '대시보드',  icon: LayoutDashboard },
  { id: 'farms',     label: '농가 분석', icon: Home },
  { id: 'consumers', label: '소비 분석', icon: DollarSign },
  { id: 'tourism',   label: '관광 분석', icon: Map },
  { id: 'policy',    label: '정책 효과', icon: Briefcase },
  { id: 'ops',       label: '알림/운영', icon: Bell },
];

export const GovAdminDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    getDocs(collection(db, 'users'))
      .then(snap => {
        setUsers(snap.docs.map(d => d.data() as UserProfile));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo<GovStats>(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.onboardingSeen).length;
    const farmOwners = users.filter(u => u.role === 'farm_owner').length;
    const totalTrees = users.reduce((s, u) => s + (u.trees?.length ?? 0), 0);
    const totalApples = users.reduce((s, u) => s + (u.accumulatedApples ?? 0), 0);
    const totalMissions = users.reduce((s, u) =>
      s + Object.values(u.visitMissionProgress ?? {}).filter(v => v === 'completed').length, 0);
    const deliveryRequests = users.reduce((s, u) => s + (u.deliveryRequests?.length ?? 0), 0);
    const honoraryCitizens = users.filter(u => u.isHonoraryCitizen).length;
    const courseCount = users.reduce((s, u) => s + (u.courses?.length ?? 0), 0);
    const farmAdoptionCounts: Record<string, number> = {};
    users.forEach(u => (u.adoptedFarmIds ?? []).forEach(fId => {
      farmAdoptionCounts[fId] = (farmAdoptionCounts[fId] ?? 0) + 1;
    }));
    const topFarms = Object.entries(farmAdoptionCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([fId, count]) => ({ name: FARMS.find(f => f.id === fId)?.name ?? fId, count }));
    return { totalUsers, activeUsers, farmOwners, totalTrees, totalApples, totalMissions, deliveryRequests, honoraryCitizens, courseCount, topFarms };
  }, [users]);

  const handleInsight = async () => {
    setInsightLoading(true);
    try {
      const text = await getGovAdminInsight(stats as unknown as Record<string, any>);
      setInsight(text);
    } finally {
      setInsightLoading(false);
    }
  };

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
          {activeSubTab === 'overview'  && (
            <OverviewSection
              loading={loading}
              stats={stats}
              insight={insight}
              insightLoading={insightLoading}
              onInsight={handleInsight}
            />
          )}
          {activeSubTab === 'farms'     && <FarmsSection loading={loading} stats={stats} />}
          {activeSubTab === 'consumers' && <ConsumersSection loading={loading} stats={stats} />}
          {activeSubTab === 'tourism'   && <TourismSection loading={loading} stats={stats} />}
          {activeSubTab === 'policy'    && <PolicySection loading={loading} stats={stats} />}
          {activeSubTab === 'ops'       && <OpsSection />}
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

const DataRow = ({ title, detail, value, accent = false }: { title: string; detail: string; value: string; accent?: boolean }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3">
    <div className="min-w-0">
      <p className="text-xs font-black text-stone-700">{title}</p>
      <p className="mt-0.5 text-[10px] font-bold text-stone-400">{detail}</p>
    </div>
    <span className={cn(
      'shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black',
      accent ? 'bg-apple-red/10 text-apple-red' : 'bg-white text-stone-600 border border-stone-100'
    )}>
      {value}
    </span>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 rounded-3xl bg-stone-100" />
      ))}
    </div>
    <div className="h-40 rounded-[2rem] bg-stone-100" />
  </div>
);

// ── 대시보드 (Overview) ────────────────────────────────────────────────────────
const OverviewSection = ({
  loading, stats, insight, insightLoading, onInsight
}: {
  loading: boolean;
  stats: GovStats;
  insight: string;
  insightLoading: boolean;
  onInsight: () => void;
}) => {
  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-5">
      <div className="rounded-[2.5rem] bg-stone-800 p-6 text-white shadow-xl shadow-stone-200">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black tracking-widest text-white/50 uppercase">Live Data</p>
            <h3 className="mt-1 text-xl font-black">실시간 플랫폼 현황</h3>
          </div>
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[10px] font-black text-emerald-300">● 라이브</span>
        </div>
        <p className="text-[11px] font-bold leading-relaxed text-white/60">
          영주 사과 관광 플랫폼 전체 가입자 <strong className="text-white">{stats.totalUsers}명</strong> ·
          활성 사용자 <strong className="text-emerald-300">{stats.activeUsers}명</strong> · 나무 분양 {stats.totalTrees}그루
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="전체 사용자"  value={stats.totalUsers.toLocaleString()}  unit="명"  helper={`활성 ${stats.activeUsers}명`}               icon={Users}     tone="blue"  />
        <MetricCard label="나무 분양"    value={stats.totalTrees.toLocaleString()}   unit="그루" helper="누적 씨앗 심기 수"                           icon={Apple}     tone="red"   />
        <MetricCard label="미션 완료"    value={stats.totalMissions.toLocaleString()} unit="회"  helper="방문 미션 누적 완료"                          icon={PieChart}  tone="green" />
        <MetricCard label="사과 수확"    value={stats.totalApples.toLocaleString()}  unit="개"  helper="누적 수확 사과 수"                             icon={Activity}  tone="gold"  />
        <MetricCard label="배송 신청"    value={stats.deliveryRequests.toLocaleString()} unit="건" helper="농산물 배송 요청"                           icon={TrendingUp} tone="stone" />
        <MetricCard label="명예시민"     value={stats.honoraryCitizens.toLocaleString()} unit="명" helper="사과 100개 달성"                           icon={Users}     tone="blue"  />
        <MetricCard label="여행 코스"    value={stats.courseCount.toLocaleString()}  unit="개"  helper="사용자 생성 코스 수"                           icon={Route}     tone="red"   />
        <MetricCard label="농가 관리자"  value={stats.farmOwners.toLocaleString()}   unit="명"  helper="farm_owner 계정"                              icon={Home}      tone="green" />
      </div>

      {stats.topFarms.length > 0 && (
        <SectionCard icon={Home} title="농가별 분양 현황" description="사용자가 선택한 농가 분포입니다.">
          {stats.topFarms.map((f, i) => (
            <DataRow key={f.name} title={f.name} detail={`분양 사용자 ${f.count}명`} value={`${f.count}명`} accent={i < 2} />
          ))}
        </SectionCard>
      )}

      <div className="rounded-[2rem] border-4 border-stone-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-800 text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-stone-800">AI 인사이트</h3>
            <p className="mt-1 text-[11px] font-bold leading-relaxed text-stone-400">
              실시간 데이터 기반 AI 운영 제안을 받아보세요.
            </p>
          </div>
        </div>
        {insight ? (
          <p className="rounded-2xl bg-stone-50 p-4 text-[11px] font-bold leading-relaxed text-stone-700 whitespace-pre-wrap">{insight}</p>
        ) : (
          <button
            onClick={onInsight}
            disabled={insightLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-800 py-3 text-xs font-black text-white disabled:opacity-60"
          >
            {insightLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {insightLoading ? 'AI 분석 중...' : 'AI 인사이트 생성'}
          </button>
        )}
      </div>
    </div>
  );
};

// ── 농가 분석 ─────────────────────────────────────────────────────────────────
const FarmsSection = ({ loading, stats }: { loading: boolean; stats: GovStats }) => {
  if (loading) return <LoadingSkeleton />;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="참여 농가"  value={FARMS.length.toString()} unit="곳"   helper="플랫폼 연계 농가 수"        icon={Store}   tone="green" />
        <MetricCard label="총 분양"    value={stats.totalTrees.toLocaleString()}   unit="그루" helper="씨앗 구매 누적"  icon={Apple}   tone="red"   />
        <MetricCard label="분양 사용자" value={stats.activeUsers.toString()}        unit="명"  helper="활성 분양 사용자"  icon={Users}   tone="blue"  />
        <MetricCard label="수확 완료"  value={stats.totalApples.toLocaleString()}  unit="개"  helper="누적 사과 수확"    icon={Activity} tone="gold" />
      </div>

      {stats.topFarms.length > 0 ? (
        <SectionCard icon={Home} title="농가별 분양 순위" description="사용자 분양 선택 기준 순위입니다.">
          {stats.topFarms.map((f, i) => (
            <DataRow key={f.name} title={f.name} detail="분양 사용자 수 기준" value={`${f.count}명`} accent={i < 2} />
          ))}
        </SectionCard>
      ) : (
        <div className="rounded-[2rem] border-4 border-dashed border-stone-100 bg-white/70 p-7 text-center">
          <p className="text-sm font-black text-stone-400">농가 분양 데이터가 없습니다</p>
          <p className="mt-1 text-[11px] font-bold text-stone-300">사용자가 농가를 선택하면 여기에 표시됩니다.</p>
        </div>
      )}

      <SectionCard icon={Apple} title="플랫폼 연계 농가" description="영주 사과 관광 플랫폼에 등록된 농가입니다.">
        {FARMS.map((f) => (
          <DataRow key={f.id} title={f.name} detail={f.location} value={f.varieties.slice(0, 2).join('·')} />
        ))}
      </SectionCard>
    </div>
  );
};

// ── 소비 분석 ─────────────────────────────────────────────────────────────────
const ConsumersSection = ({ loading, stats }: { loading: boolean; stats: GovStats }) => {
  if (loading) return <LoadingSkeleton />;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="배송 신청"  value={stats.deliveryRequests.toLocaleString()} unit="건" helper="농산물 배송 요청 누적"  icon={TrendingUp} tone="red"   />
        <MetricCard label="수확 사과"  value={stats.totalApples.toLocaleString()} unit="개"  helper="플랫폼 누적 수확량"         icon={Apple}      tone="green" />
        <MetricCard label="명예시민"   value={stats.honoraryCitizens.toLocaleString()} unit="명" helper="사과 100개 달성 사용자" icon={Users}      tone="blue"  />
        <MetricCard label="매출 연동"  value="—"    unit=""    helper="결제 데이터 연동 예정"                                    icon={DollarSign} tone="stone" />
      </div>

      <SectionCard icon={TrendingUp} title="분양·수확 현황" description="앱 내 실제 활동 기반 데이터입니다.">
        <DataRow title="총 나무 분양 수"     detail="씨앗 심기 누적"             value={`${stats.totalTrees}그루`}           accent />
        <DataRow title="누적 사과 수확량"    detail="수확 미션 완료 기준"         value={`${stats.totalApples}개`}           accent />
        <DataRow title="배송 신청 건수"      detail="수확 후 배송 요청"           value={`${stats.deliveryRequests}건`}      />
        <DataRow title="명예시민 달성"       detail="누적 사과 100개 기준"        value={`${stats.honoraryCitizens}명`}      />
      </SectionCard>

      <SectionCard icon={DollarSign} title="결제·매출 연동 예정" description="실결제 데이터가 연결되면 자동으로 집계됩니다.">
        <DataRow title="직거래 매출"    detail="농가 직거래 결제 데이터"   value="연동 예정" />
        <DataRow title="구매 전환율"    detail="관광→구매 전환 분석"       value="연동 예정" />
        <DataRow title="평균 결제 금액" detail="1인 평균 구매 금액"        value="연동 예정" />
      </SectionCard>
    </div>
  );
};

// ── 관광 분석 ─────────────────────────────────────────────────────────────────
const TourismSection = ({ loading, stats }: { loading: boolean; stats: GovStats }) => {
  if (loading) return <LoadingSkeleton />;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="생성 코스"   value={stats.courseCount.toLocaleString()}   unit="개" helper="사용자 여행 코스 수"   icon={Route}    tone="blue"  />
        <MetricCard label="미션 완료"   value={stats.totalMissions.toLocaleString()} unit="회" helper="방문 미션 누적 완료"   icon={MapPin}   tone="green" />
        <MetricCard label="활성 사용자" value={stats.activeUsers.toLocaleString()}   unit="명" helper="온보딩 완료 기준"      icon={Activity} tone="gold"  />
        <MetricCard label="GPS 동선"    value="—"    unit=""    helper="위치 서비스 연동 예정"                                icon={Map}      tone="stone" />
      </div>

      <SectionCard icon={Route} title="여행 코스 현황" description="사용자가 생성한 여행 코스 통계입니다.">
        <DataRow title="전체 코스 수"    detail="사용자 생성 여행 코스"     value={`${stats.courseCount}개`}         accent />
        <DataRow title="방문 미션 완료"  detail="누적 완료 건수"            value={`${stats.totalMissions}회`}       accent />
        <DataRow title="활성 사용자"     detail="최소 1개 온보딩 완료"      value={`${stats.activeUsers}명`}         />
      </SectionCard>

      <SectionCard icon={MapPin} title="GPS 기반 분석 예정" description="위치 인증 데이터가 쌓이면 동선 분석이 시작됩니다.">
        <DataRow title="인기 관광 코스" detail="완료율 기반 순위"        value="집계 예정" />
        <DataRow title="장소별 체류 시간" detail="GPS 체류 시간 분석"   value="집계 예정" />
        <DataRow title="이탈 지점 분석" detail="미션 중단 발생 구역"    value="집계 예정" />
      </SectionCard>
    </div>
  );
};

// ── 정책 효과 ─────────────────────────────────────────────────────────────────
const PolicySection = ({ loading, stats }: { loading: boolean; stats: GovStats }) => {
  if (loading) return <LoadingSkeleton />;
  const onboardingRate = stats.totalUsers > 0
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="온보딩 완료율" value={`${onboardingRate}`} unit="%" helper="전체 가입자 대비"                icon={Briefcase}  tone="stone" />
        <MetricCard label="미션 완료"     value={stats.totalMissions.toLocaleString()} unit="회" helper="관광 미션 누적" icon={PieChart}   tone="blue"  />
        <MetricCard label="명예시민"      value={stats.honoraryCitizens.toLocaleString()} unit="명" helper="사과 100개 달성" icon={Users}  tone="green" />
        <MetricCard label="배송 신청"     value={stats.deliveryRequests.toLocaleString()} unit="건" helper="농산물 배송 연결" icon={TrendingUp} tone="red" />
      </div>

      <SectionCard icon={Briefcase} title="정책 참여 현황" description="플랫폼 내 정책 연계 활동 실적입니다.">
        <DataRow title="사과나무 분양 참여"   detail={`씨앗 심기 사용자`}       value={`${stats.totalTrees}그루`}         accent />
        <DataRow title="관광 미션 완료"       detail="방문 인증 완료 건수"       value={`${stats.totalMissions}회`}        accent />
        <DataRow title="명예시민 인증 달성"   detail="사과 100개 누적 보상"      value={`${stats.honoraryCitizens}명`}     />
        <DataRow title="배송 신청 연결"       detail="앱→농가 배송 요청 건수"   value={`${stats.deliveryRequests}건`}      />
        <DataRow title="여행 코스 생성"       detail="AI 기반 코스 설계"         value={`${stats.courseCount}개`}          />
      </SectionCard>

      <SectionCard icon={TrendingUp} title="경제 기여 연동 예정" description="결제 데이터 연결 시 자동 집계됩니다.">
        <DataRow title="농가 직거래 매출"   detail="결제 데이터 연동 필요"   value="연동 예정" />
        <DataRow title="관광 소비 유발"     detail="방문 연계 외식·숙박 등"  value="연동 예정" />
        <DataRow title="재방문 유발 효과"   detail="재접속·재구매 분석"      value="연동 예정" />
      </SectionCard>
    </div>
  );
};

// ── 알림/운영 ─────────────────────────────────────────────────────────────────
const OpsSection = () => (
  <div className="space-y-5">
    <div className="rounded-[2rem] border-4 border-dashed border-stone-100 bg-white/70 p-7 text-center">
      <Bell size={28} className="mx-auto mb-3 text-stone-300" />
      <h3 className="text-sm font-black text-stone-700">알림·운영 관리</h3>
      <p className="mt-2 text-[11px] font-bold leading-relaxed text-stone-400">
        공지사항 등록, 이벤트 생성, 사용자 알림 발송 기능이 준비 중입니다.
      </p>
    </div>

    <SectionCard icon={Bell} title="운영 기능 로드맵" description="순차적으로 연결될 운영 관리 기능입니다.">
      <DataRow title="공지사항 관리"     detail="앱 내 공지 등록·수정·삭제"    value="준비 중" />
      <DataRow title="이벤트 설정"       detail="미션 보너스, 시즌 이벤트"       value="준비 중" />
      <DataRow title="사용자 알림 발송"  detail="전체·세그먼트별 푸시 발송"      value="준비 중" />
      <DataRow title="정책 안내"         detail="분기별 정책 공지"               value="준비 중" />
    </SectionCard>
  </div>
);
