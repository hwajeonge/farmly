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
  { id: 'overview',  label: '대시보드',  icon: LayoutDashboard },
  { id: 'farms',     label: '농가 분석', icon: Home },
  { id: 'consumers', label: '소비 분석', icon: DollarSign },
  { id: 'tourism',   label: '관광 분석', icon: Map },
  { id: 'policy',    label: '정책 효과', icon: Briefcase },
  { id: 'ops',       label: '알림/운영', icon: Bell },
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
          {activeSubTab === 'overview'  && <OverviewSection />}
          {activeSubTab === 'farms'     && <FarmsSection />}
          {activeSubTab === 'consumers' && <ConsumersSection />}
          {activeSubTab === 'tourism'   && <TourismSection />}
          {activeSubTab === 'policy'    && <PolicySection />}
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

// ── 대시보드 (Overview) ────────────────────────────────────────────────────────
const OverviewSection = () => (
  <div className="space-y-5">
    <div className="rounded-[2.5rem] bg-stone-800 p-6 text-white shadow-xl shadow-stone-200">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-widest text-white/50 uppercase">Data Status</p>
          <h3 className="mt-1 text-xl font-black">2026년 5월 기준 운영 현황</h3>
        </div>
        <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[10px] font-black text-emerald-300">● 라이브</span>
      </div>
      <p className="text-[11px] font-bold leading-relaxed text-white/60">
        영주 사과 관광 플랫폼 누적 사용자 <strong className="text-white">1,247명</strong> 돌파 · 이번 달 관광 방문자 전월 대비 <strong className="text-emerald-300">+18%</strong> 증가
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="전체 사용자"  value="1,247" unit="명" helper="전월 대비 +18% 증가"   icon={Users}     tone="blue"  />
      <MetricCard label="활성 사용자"  value="382"   unit="명" helper="최근 7일 기준"          icon={Activity}  tone="red"   />
      <MetricCard label="관광 방문자"  value="891"   unit="명" helper="GPS·미션 인증 기반"     icon={MapPin}    tone="green" />
      <MetricCard label="외부 유입"    value="634"   unit="명" helper="타 지역 방문객 비율 71%" icon={Route}     tone="gold"  />
      <MetricCard label="미션 수행"    value="2,341" unit="회" helper="누적 미션 완료 건수"     icon={PieChart}  tone="stone" />
      <MetricCard label="평균 체류"    value="187"   unit="분" helper="1인 평균 체류 시간"      icon={TrendingUp} tone="blue" />
      <MetricCard label="사과 판매량"  value="4,820" unit="개" helper="직거래·배송 합산"        icon={Apple}     tone="red"   />
      <MetricCard label="매출 규모"    value="3,856" unit="만원" helper="농가 직거래 기준"      icon={DollarSign} tone="green" />
    </div>

    <SectionCard icon={TrendingUp} title="주간 핵심 지표" description="지난 7일간 주요 수치 변화입니다.">
      <DataRow title="신규 가입자"    detail="이번 주 신규 회원"        value="+64명"      accent />
      <DataRow title="미션 완료율"    detail="시작 대비 완료 비율"      value="73%"        accent />
      <DataRow title="사과나무 분양"  detail="이번 주 씨앗 심기 건수"   value="128건"      accent />
      <DataRow title="앱 평균 체류"   detail="세션당 평균 이용 시간"    value="22분"             />
      <DataRow title="재방문율"       detail="7일 내 재접속 비율"       value="48%"              />
    </SectionCard>
  </div>
);

// ── 농가 분석 ─────────────────────────────────────────────────────────────────
const FarmsSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="농가 매출"  value="2,430" unit="만원" helper="참여 농가 7곳 합산"    icon={DollarSign} tone="green" />
      <MetricCard label="분양 수"    value="847"   unit="건"   helper="씨앗 구매 누적"         icon={Store}      tone="red"   />
      <MetricCard label="인기 농가"  value="3"     unit="위"   helper="영주소백팜 1위"          icon={Home}       tone="gold"  />
      <MetricCard label="품종 분석"  value="6"     unit="종"   helper="부사·홍로·시나노 상위"  icon={Apple}      tone="blue"  />
    </div>

    <SectionCard icon={Home} title="농가별 매출 순위" description="씨앗 구매 및 직거래 기반 매출 순위입니다.">
      <DataRow title="영주소백팜"          detail="부사·홍로 주력 / 분양 231건"   value="820만원"  accent />
      <DataRow title="풍기 사과인삼 농장"  detail="아오리·감홍 / 분양 198건"      value="710만원"  accent />
      <DataRow title="부석 소백산 사과농장" detail="시나노골드 / 분양 174건"       value="670만원"  accent />
      <DataRow title="순흥 선비촌 사과농장" detail="시나노스위트 / 분양 143건"     value="540만원"        />
      <DataRow title="문수 무섬 사과농장"   detail="홍옥·홍로 / 분양 101건"        value="390만원"        />
    </SectionCard>

    <SectionCard icon={Apple} title="품종별 선호도" description="사용자가 선택한 품종 분포입니다.">
      <DataRow title="부사"         detail="달콤·단단, 선물용 1위"     value="31%"  accent />
      <DataRow title="홍로"         detail="초가을 대표 품종"           value="24%"  accent />
      <DataRow title="시나노스위트" detail="과즙 풍부, 여성 선호 높음" value="18%"        />
      <DataRow title="감홍"         detail="당도 최상위 품종"           value="14%"        />
      <DataRow title="기타"         detail="아오리·홍옥·양광 등"       value="13%"        />
    </SectionCard>
  </div>
);

// ── 소비 분석 ─────────────────────────────────────────────────────────────────
const ConsumersSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="시즌 판매량" value="4,820" unit="개"  helper="직거래·배송 합산"      icon={Apple}      tone="red"   />
      <MetricCard label="구매 전환"   value="34"    unit="%"   helper="관광→구매 전환율"       icon={TrendingUp} tone="green" />
      <MetricCard label="재구매율"    value="28"    unit="%"   helper="30일 내 재구매 기준"    icon={Activity}   tone="blue"  />
      <MetricCard label="평균 구매"   value="4.5"   unit="만원" helper="1인 평균 결제 금액"    icon={DollarSign} tone="gold"  />
    </div>

    <SectionCard icon={DollarSign} title="구매 패턴 분석" description="관광 동선과 구매 연결 흐름입니다.">
      <DataRow title="미션 완료 후 구매"  detail="미션 → 직거래 연결 비율"     value="41%"  accent />
      <DataRow title="코스 방문 후 구매"  detail="코스 완료 → 앱 내 구매"      value="29%"  accent />
      <DataRow title="앱 단독 구매"       detail="방문 없이 앱에서만 구매"      value="18%"        />
      <DataRow title="배송 신청 비율"     detail="구매자 중 배송 선택 비율"     value="63%"        />
      <DataRow title="방문 수령 비율"     detail="농장 직접 방문 수령"          value="37%"        />
    </SectionCard>

    <SectionCard icon={TrendingUp} title="월별 판매 추이" description="2026년 시즌 월별 판매량 변화입니다.">
      <DataRow title="2월"  detail="시즌 초반, 씨앗 구매 집중"   value="180개"       />
      <DataRow title="3월"  detail="성장기 진입, 관심 증가"       value="640개"       />
      <DataRow title="4월"  detail="관광 시즌 시작, 급증"        value="1,340개" accent />
      <DataRow title="5월"  detail="현재 집계 중 (월 기준)"       value="2,660개" accent />
    </SectionCard>
  </div>
);

// ── 관광 분석 ─────────────────────────────────────────────────────────────────
const TourismSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="인기 코스"  value="12"  unit="개" helper="사용자 생성 코스 수"     icon={Route}    tone="blue"  />
      <MetricCard label="동선 기록"  value="2,341" unit="건" helper="미션 기반 이동 추적"  icon={Map}      tone="green" />
      <MetricCard label="평균 체류"  value="187" unit="분" helper="장소당 평균 체류 시간"  icon={Activity} tone="gold"  />
      <MetricCard label="이탈 지점"  value="3"   unit="곳" helper="미션 중단 집중 구역"    icon={MapPin}   tone="red"   />
    </div>

    <SectionCard icon={Route} title="인기 관광 코스 TOP 5" description="사용자가 가장 많이 선택한 코스입니다.">
      <DataRow title="부석사·소백산 힐링 코스"  detail="평균 체류 240분 · 완료율 82%"  value="341회"  accent />
      <DataRow title="풍기인삼·사과농장 코스"   detail="평균 체류 195분 · 완료율 76%"  value="298회"  accent />
      <DataRow title="무섬마을 감성 코스"        detail="평균 체류 170분 · 완료율 71%"  value="241회"  accent />
      <DataRow title="선비촌·소수서원 코스"      detail="평균 체류 185분 · 완료율 68%"  value="187회"        />
      <DataRow title="영주시내 사과 맛집 코스"   detail="평균 체류 130분 · 완료율 61%"  value="154회"        />
    </SectionCard>

    <SectionCard icon={MapPin} title="장소별 체류 시간" description="방문자 체류 시간이 긴 장소 순위입니다.">
      <DataRow title="부석사"      detail="세계유산 탐방, 평균 체류"   value="94분"  accent />
      <DataRow title="소백산 국립공원" detail="트레킹 포함 평균 체류" value="187분" accent />
      <DataRow title="무섬마을"    detail="전통마을 체험 포함"         value="76분"        />
      <DataRow title="선비촌"      detail="체험 프로그램 포함"         value="68분"        />
      <DataRow title="영주역"      detail="출발·도착 거점, 단기 체류"  value="18분"        />
    </SectionCard>
  </div>
);

// ── 정책 효과 ─────────────────────────────────────────────────────────────────
const PolicySection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="정책 이용률" value="42"    unit="%" helper="전체 사용자 중 참여율"   icon={Briefcase}  tone="stone" />
      <MetricCard label="성과 분석"   value="8"     unit="건" helper="이번 분기 리포트"       icon={PieChart}   tone="blue"  />
      <MetricCard label="경제 기여"   value="1,240" unit="만원" helper="관광→소비 연결 금액" icon={DollarSign} tone="green" />
      <MetricCard label="소비 연결"   value="34"    unit="%" helper="관광→직거래 전환율"      icon={TrendingUp} tone="red"   />
    </div>

    <SectionCard icon={Briefcase} title="정책별 성과 분석" description="진행 중인 정책·프로그램 효과입니다.">
      <DataRow title="사과나무 분양 지원 사업"  detail="씨앗 구매 보조금 · 참여 847명"   value="참여율 68%"  accent />
      <DataRow title="관광 미션 완료 보상"       detail="포인트 지급 · 완료 2,341건"       value="완료율 73%"  accent />
      <DataRow title="농가 직거래 연계 할인"     detail="앱 내 쿠폰 발행 · 사용 312건"    value="사용율 41%"        />
      <DataRow title="영주 명예시민 인증"        detail="누적 사과 100개 달성 보상"        value="발급 89건"         />
      <DataRow title="시즌 방문 스탬프 이벤트"   detail="5개 장소 인증 시 혜택 제공"       value="참여 201명"        />
    </SectionCard>

    <SectionCard icon={TrendingUp} title="지역 경제 기여도" description="관광 플랫폼이 지역 소비에 미친 영향입니다.">
      <DataRow title="농가 직거래 매출"    detail="앱 통한 직거래 총액"        value="2,430만원"  accent />
      <DataRow title="관광 소비 유발"      detail="방문 연계 외식·숙박 등"     value="4,820만원"  accent />
      <DataRow title="앱 내 포인트 소비"   detail="스토어 아이템 포인트 사용"  value="386만P"           />
      <DataRow title="재방문 유발 효과"    detail="앱 사용자 재방문 추정 금액" value="1,240만원"        />
    </SectionCard>
  </div>
);

// ── 알림/운영 ─────────────────────────────────────────────────────────────────
const OpsSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="공지"      value="5"     unit="건" helper="활성 공지 5건"            icon={Bell}     tone="blue"  />
      <MetricCard label="이벤트"    value="3"     unit="건" helper="진행 중 이벤트 3건"        icon={Activity} tone="red"   />
      <MetricCard label="정책 안내" value="7"     unit="건" helper="이번 분기 안내 발송"       icon={Briefcase} tone="gold" />
      <MetricCard label="발송 알림" value="1,247" unit="건" helper="전체 사용자 대상 발송"     icon={Users}    tone="green" />
    </div>

    <SectionCard icon={Bell} title="활성 공지 목록" description="현재 앱 내 노출 중인 공지사항입니다.">
      <DataRow title="2026 사과 수확 시즌 안내"      detail="9월~11월 수확 일정 및 배송 신청 안내"  value="노출 중"  accent />
      <DataRow title="영주 관광 주간 이벤트"         detail="5/10~5/17 미션 완료 보너스 포인트"     value="노출 중"  accent />
      <DataRow title="농가 직거래 할인 쿠폰 배포"    detail="앱 내 5,000P 쿠폰 선착순 300명"        value="노출 중"  accent />
      <DataRow title="앱 업데이트 안내 v2.1"         detail="지도 개선 및 코스 추천 기능 업데이트"  value="노출 중"        />
      <DataRow title="개인정보 처리방침 개정 안내"   detail="2026-04-01 개정, 동의 요청"            value="노출 중"        />
    </SectionCard>

    <SectionCard icon={Activity} title="진행 중 이벤트" description="현재 운영 중인 캠페인입니다.">
      <DataRow title="5월 영주 사과 탐험 챌린지"  detail="미션 3개 완료 시 씨앗 1개 증정"       value="D-13"  accent />
      <DataRow title="사과나무 100그루 달성 기념" detail="누적 분양 100그루 돌파 기념 이벤트"   value="D-3"   accent />
      <DataRow title="신규 가입 5,000P 지급"      detail="가입 즉시 포인트 지급 상시 운영 중"   value="상시"        />
    </SectionCard>
  </div>
);
