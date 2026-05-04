import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Apple,
  BarChart3,
  Bell,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Package,
  PieChart,
  Plus,
  Settings,
  Store,
  Tag,
  Truck,
} from 'lucide-react';
import { UserRole } from '../types';
import { cn } from '../lib/utils';

type SubTab = 'products' | 'farm' | 'orders' | 'reviews' | 'ai';

interface FarmAdminDashboardProps {
  role: UserRole;
}

type MetricCardProps = {
  label: string;
  value: string;
  unit?: string;
  helper: string;
  icon: React.ElementType;
  tone?: 'red' | 'green' | 'gold' | 'blue' | 'stone';
};

const toneClass = {
  red: 'text-apple-red bg-red-50 border-red-100',
  green: 'text-apple-green bg-emerald-50 border-emerald-100',
  gold: 'text-yeoju-gold bg-yellow-50 border-yellow-100',
  blue: 'text-blue-500 bg-blue-50 border-blue-100',
  stone: 'text-stone-600 bg-stone-50 border-stone-100',
};

const menuItems: Array<{ id: SubTab; label: string; icon: React.ElementType }> = [
  { id: 'products', label: '상품 관리', icon: Apple },
  { id: 'farm', label: '농가 정보', icon: Store },
  { id: 'orders', label: '판매/주문', icon: Truck },
  { id: 'reviews', label: '리뷰/사용자', icon: MessageCircle },
  { id: 'ai', label: '데이터/AI', icon: PieChart },
];

export const FarmAdminDashboard: React.FC<FarmAdminDashboardProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('products');

  return (
    <div className="pb-10">
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
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
                  ? 'bg-apple-red text-white shadow-lg shadow-apple-red/20'
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'products' && <ProductsSection />}
          {activeSubTab === 'farm' && <FarmInfoSection />}
          {activeSubTab === 'orders' && <OrdersSection />}
          {activeSubTab === 'reviews' && <ReviewsSection />}
          {activeSubTab === 'ai' && <AISection />}
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

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-[2rem] border-4 border-dashed border-stone-100 bg-white/70 p-7 text-center">
    <p className="text-3xl font-black text-stone-300">0</p>
    <h3 className="mt-2 text-sm font-black text-stone-700">{title}</h3>
    <p className="mt-2 text-[11px] font-bold leading-relaxed text-stone-400">{description}</p>
  </div>
);

const ProductsSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="등록 상품" value="0" unit="개" helper="사과나무 상품 없음" icon={Apple} tone="red" />
      <MetricCard label="분양 상품" value="0" unit="개" helper="내 나무 상품 없음" icon={Package} tone="gold" />
      <MetricCard label="재고" value="0" unit="개" helper="판매 가능 수량 없음" icon={Store} tone="green" />
      <MetricCard label="배송 설정" value="0" unit="건" helper="배송 정책 미등록" icon={Truck} tone="blue" />
    </div>

    <SectionCard
      icon={Plus}
      title="사과나무 상품 등록"
      description="나무 단위, 구획 단위, 분양형 상품을 실제 농가 데이터와 연결합니다."
    >
      <ReadyRow title="나무 단위 등록" detail="개별 사과나무를 상품으로 등록" />
      <ReadyRow title="구획 단위 등록" detail="농가 내 관리 구역 단위로 등록" />
      <ReadyRow title="분양형 상품 생성" detail="사용자의 내 나무 성장 시스템과 연결" />
    </SectionCard>

    <SectionCard icon={Tag} title="품종 정보 입력" description="부사, 홍로 등 품종별 특징을 상품 정보에 반영합니다.">
      <ReadyRow title="품종명" detail="부사, 홍로, 감홍, 시나노골드 등" />
      <ReadyRow title="특징" detail="당도, 산미, 식감, 보관성" />
      <ReadyRow title="수확 시기" detail="품종별 수확 가능 기간" />
    </SectionCard>

    <SectionCard icon={Settings} title="가격 및 배송 설정" description="직거래 가격, 배송 포함 여부, 재고를 관리합니다.">
      <ReadyRow title="직거래 스토어 가격" detail="kg/박스/나무 단위 가격" />
      <ReadyRow title="수확 후 배송 포함 여부" detail="배송비 포함, 별도 결제, 방문 수령" />
      <ReadyRow title="재고 관리" detail="분양 가능 수량과 실물 사과 수량" />
    </SectionCard>
  </div>
);

const FarmInfoSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="소개" value="0" unit="건" helper="농가 소개 미등록" icon={Store} tone="green" />
      <MetricCard label="이미지" value="0" unit="장" helper="콘텐츠 미등록" icon={ImageIcon} tone="blue" />
      <MetricCard label="위치" value="0" unit="건" helper="지도 위치 미등록" icon={MapPin} tone="red" />
      <MetricCard label="공개 상태" value="0" unit="건" helper="활성 농가 없음" icon={CheckCircle2} tone="stone" />
    </div>

    <SectionCard icon={Store} title="농가 소개" description="사용자가 농가를 선택하기 전에 확인하는 핵심 정보입니다.">
      <ReadyRow title="농가명 및 운영자 정보" detail="농가 프로필 기본 정보" />
      <ReadyRow title="소개 문구" detail="재배 철학, 품종, 체험 포인트" />
      <ReadyRow title="대표 품종" detail="주력 품종과 수확 일정" />
    </SectionCard>

    <SectionCard icon={ImageIcon} title="이미지 및 콘텐츠 등록" description="농장 이미지, 사과나무 사진, 체험 콘텐츠를 관리합니다.">
      <ReadyRow title="대표 이미지" detail="농가 카드와 지도 화면에 표시" />
      <ReadyRow title="상세 이미지" detail="농장, 사과나무, 수확 장면" />
      <ReadyRow title="콘텐츠 설명" detail="체험 프로그램 및 방문 안내" />
    </SectionCard>

    <SectionCard icon={MapPin} title="농장 위치 등록" description="지도와 관광 코스 추천에 사용할 위치 정보를 연결합니다.">
      <ReadyRow title="주소" detail="영주시 내 농장 주소" />
      <ReadyRow title="좌표" detail="지도 핀과 동선 분석에 사용" />
      <ReadyRow title="방문 가능 여부" detail="체험형 농가 공개 상태" />
    </SectionCard>
  </div>
);

const OrdersSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="신규 주문" value="0" unit="건" helper="확인 대기 없음" icon={Truck} tone="red" />
      <MetricCard label="배송 대기" value="0" unit="건" helper="배송 요청 없음" icon={Package} tone="blue" />
      <MetricCard label="판매량" value="0" unit="개" helper="수확/판매 내역 없음" icon={Apple} tone="gold" />
      <MetricCard label="매출" value="0" unit="원" helper="실거래 데이터 없음" icon={BarChart3} tone="green" />
    </div>

    <EmptyState
      title="주문 데이터가 아직 없습니다"
      description="실제 결제, 분양, 수확 배송 데이터가 연결되면 주문 확인과 배송 관리 목록이 표시됩니다."
    />

    <SectionCard icon={Truck} title="판매 및 주문 관리" description="주문 확인, 배송 처리, 판매 통계를 한 곳에서 관리합니다.">
      <ReadyRow title="주문 확인" detail="사과 직거래 및 사과나무 분양 주문" />
      <ReadyRow title="배송 관리" detail="수확 후 배송 신청과 송장 상태" />
      <ReadyRow title="판매 통계" detail="기간별 판매량, 매출, 품종별 판매 비중" />
    </SectionCard>
  </div>
);

const ReviewsSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="리뷰" value="0" unit="건" helper="작성 리뷰 없음" icon={MessageCircle} tone="blue" />
      <MetricCard label="응답 대기" value="0" unit="건" helper="답변 대기 없음" icon={Bell} tone="red" />
      <MetricCard label="쿠폰" value="0" unit="개" helper="활성 혜택 없음" icon={Tag} tone="gold" />
      <MetricCard label="알림" value="0" unit="건" helper="발송 내역 없음" icon={Bell} tone="green" />
    </div>

    <SectionCard icon={MessageCircle} title="리뷰 및 사용자 관리" description="고객 피드백, 혜택, 알림을 관리합니다.">
      <ReadyRow title="사용자 리뷰 확인" detail="농가, 상품, 배송 리뷰" />
      <ReadyRow title="리뷰 응답 기능" detail="농가 관리자 답변" />
      <ReadyRow title="고객 피드백 분석" detail="반복 불편 사항과 만족 포인트 분류" />
      <ReadyRow title="이벤트 설정" detail="방문형 미션, 수확 이벤트, 시즌 이벤트" />
      <ReadyRow title="쿠폰/혜택 관리" detail="직거래 할인, 배송 혜택, 재방문 혜택" />
      <ReadyRow title="사용자 알림 발송" detail="수확 안내, 배송 안내, 이벤트 공지" />
    </SectionCard>
  </div>
);

const AISection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <MetricCard label="품종 분석" value="0" unit="건" helper="판매 데이터 대기" icon={PieChart} tone="red" />
      <MetricCard label="전환 분석" value="0" unit="%" helper="구매 전환 데이터 없음" icon={BarChart3} tone="blue" />
      <MetricCard label="예측 데이터" value="0" unit="건" helper="수확량 예측 미연동" icon={Apple} tone="green" />
      <MetricCard label="AI 리포트" value="0" unit="건" helper="생성된 리포트 없음" icon={CheckCircle2} tone="gold" />
    </div>

    <SectionCard icon={PieChart} title="데이터 및 AI 활용" description="운영 데이터가 쌓인 뒤 분석과 예측 기능을 활성화합니다.">
      <ReadyRow title="인기 품종 분석" detail="품종별 조회, 분양, 구매 데이터를 분석" />
      <ReadyRow title="구매 전환 분석" detail="관광 미션, 코스 방문, 상품 구매 흐름 연결" />
      <ReadyRow title="수확량 예측 서비스 연결" detail="기상 데이터와 생육 상태 기반 고도화 영역" />
    </SectionCard>
  </div>
);
