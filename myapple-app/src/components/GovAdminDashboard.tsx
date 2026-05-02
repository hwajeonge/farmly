import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, TrendingUp, MapPin, 
  ShoppingBag, PieChart, Info, Bell, 
  ChevronRight, Filter, Download, MoreHorizontal,
  Calendar, Search, Home, Activity, Briefcase, 
  LayoutDashboard, Map, Heart, DollarSign
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { cn } from '../lib/utils';

type SubTab = 'overview' | 'farms' | 'consumers' | 'tourism' | 'policy' | 'ops';

export const GovAdminDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');

  const menuItems = [
    { id: 'overview', label: '종합현황', icon: LayoutDashboard },
    { id: 'farms', label: '농가분석', icon: Home },
    { id: 'consumers', label: '소비분석', icon: DollarSign },
    { id: 'tourism', label: '관광분석', icon: Map },
    { id: 'policy', label: '정책성과', icon: Briefcase },
    { id: 'ops', label: '운영관리', icon: Bell },
  ];

  return (
    <div className="pb-10">
      {/* Horizontal Sub-nav */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sticky top-[72px] bg-stone-50 z-30 pt-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id as SubTab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all shrink-0",
              activeSubTab === item.id 
                ? "bg-stone-800 text-white shadow-lg shadow-stone-800/20" 
                : "bg-white text-stone-400 border-2 border-stone-100"
            )}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
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

// --- Sub Sections ---

const OverviewSection = () => {
  const visitorData = [
    { name: '월', value: 400 },
    { name: '화', value: 300 },
    { name: '수', value: 600 },
    { name: '목', value: 800 },
    { name: '금', value: 500 },
    { name: '토', value: 1200 },
    { name: '일', value: 1500 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border-4 border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 text-stone-400 mb-2">
            <Users size={16} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">전체 사용자</span>
          </div>
          <p className="text-3xl font-black">24.5K</p>
          <p className="text-[10px] text-apple-green font-bold mt-1">+8% vs 전월</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border-4 border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 text-stone-400 mb-2">
            <Activity size={16} className="text-apple-red" />
            <span className="text-[10px] font-black uppercase tracking-widest">활성 사용자</span>
          </div>
          <p className="text-3xl font-black">12.2K</p>
          <p className="text-[10px] text-apple-green font-bold mt-1">+15.4% (매칭률 49%)</p>
        </div>
      </div>

      <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-1 text-blue-100">Tourism Influx</h3>
              <p className="text-2xl font-black">지역 유입 분석</p>
            </div>
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <MapPin size={24} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/20">
              <p className="text-[9px] font-black text-blue-100 uppercase mb-1">관광 방문객</p>
              <p className="text-xl font-black">8,420</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/20">
              <p className="text-[9px] font-black text-blue-100 uppercase mb-1">외부 유입비</p>
              <p className="text-xl font-black">72%</p>
            </div>
          </div>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#fff" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border-4 border-stone-100 shadow-sm">
          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">총 사과 판매</h4>
          <p className="text-2xl font-black">45.2톤</p>
          <p className="text-[10px] text-yeoju-gold font-bold">12.5억 원 상당</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border-4 border-stone-100 shadow-sm">
          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">평균 체류 시간</h4>
          <p className="text-2xl font-black">4.2시간</p>
          <p className="text-[10px] text-blue-400 font-bold">전주 대비 +20분</p>
        </div>
      </div>
    </div>
  );
};

const FarmsSection = () => {
  const varietyData = [
    { name: '부사', value: 45 },
    { name: '홍로', value: 25 },
    { name: '시나노골드', value: 15 },
    { name: '감홍', value: 15 },
  ];
  const COLORS = ['#ef4444', '#22c55e', '#eab308', '#27272a'];

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100 shadow-sm">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Home size={14} className="text-stone-600" />
          인기 농가 Top 5 (방문+구매)
        </h3>
        <div className="space-y-4">
          {[
            { name: '소백산 아래 사과농장', value: 92, tags: ['부사', '홍로'] },
            { name: '희방사 입구 농원', value: 85, tags: ['감홍'] },
            { name: '순흥 선비 사과원', value: 78, tags: ['시나노골드'] },
          ].map((farm, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <span className="w-6 h-6 bg-stone-100 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">
                {i+1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-stone-800 truncate">{farm.name}</p>
                <div className="flex gap-1 mt-1">
                  {farm.tags.map(t => <span key={t} className="text-[8px] font-bold text-stone-400 px-1.5 py-0.5 bg-stone-50 rounded">{t}</span>)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-apple-red">{farm.value}점</p>
                <div className="w-16 h-1.5 bg-stone-50 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-apple-red transition-all" style={{ width: `${farm.value}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100 shadow-sm flex flex-col items-center">
          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 w-full">품종별 인기</h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={varietyData} innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value">
                  {varietyData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[8px] grid grid-cols-2 gap-x-3 gap-y-1">
             {varietyData.map((v, i) => (
               <div key={v.name} className="flex items-center gap-1">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                 <span className="font-bold text-stone-600">{v.name} {v.value}%</span>
               </div>
             ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100 shadow-sm">
          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">지역별 농가 분포</h4>
          <div className="space-y-4">
             {['풍기읍', '순흥면', '봉현면', '이산면'].map((loc, i) => (
                <div key={loc} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black">{loc}</span>
                    <span className="text-[10px] font-bold text-stone-400">{32 - i*5}곳</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-50 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-800" style={{ width: `${100 - i*15}%` }} />
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConsumersSection = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100 shadow-sm transition-all hover:border-stone-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
          <PieChart size={14} className="text-stone-600" />
          관광 → 구매 전환 흐름
        </h3>
        <Info size={14} className="text-stone-300" />
      </div>
      
      <div className="space-y-8 relative">
        {/* Waterfall or Funnel Chart Mockup */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-full h-10 bg-blue-50 rounded-xl flex items-center justify-center border-2 border-blue-100">
            <span className="text-[10px] font-black text-blue-500">관광객 유입 (100%)</span>
          </div>
          <div className="w-1 h-4 bg-stone-100" />
          <div className="w-3/4 h-10 bg-yeoju-gold/5 rounded-xl flex items-center justify-center border-2 border-yeoju-gold/20">
            <span className="text-[10px] font-black text-yeoju-gold">농가 장소 조회 (62%)</span>
          </div>
          <div className="w-1 h-4 bg-stone-100" />
          <div className="w-1/2 h-10 bg-apple-red/5 rounded-xl flex items-center justify-center border-2 border-apple-red/20">
            <span className="text-[10px] font-black text-apple-red">실제 구매/체험 (18%)</span>
          </div>
        </div>
        <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-100">
          <p className="text-[10px] font-bold text-stone-500 leading-relaxed text-center">
            "체험 코스 완료 유저는 미완료 유저보다<br />
            <span className="text-apple-red font-black">구매 확산 확률이 4.2배 높습니다.</span>"
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-3xl border-4 border-stone-100 shadow-sm">
        <p className="text-[9px] font-black text-stone-400 uppercase mb-1">인당 평균 구매액</p>
        <p className="text-xl font-black">52,000원</p>
        <p className="text-[10px] text-apple-green font-bold">+12% 전월대비</p>
      </div>
      <div className="bg-white p-5 rounded-3xl border-4 border-stone-100 shadow-sm">
        <p className="text-[9px] font-black text-stone-400 uppercase mb-1">재구매율 (Retention)</p>
        <p className="text-xl font-black">24.5%</p>
        <p className="text-[10px] text-blue-400 font-bold">사과나무 분양 효과</p>
      </div>
    </div>
  </div>
);

const TourismSection = () => (
  <div className="space-y-6">
    <section className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
          <Map size={14} className="text-stone-600" />
          인기 관광 동선 TOP 3
        </h3>
        <Filter size={14} className="text-stone-300" />
      </div>
      <div className="space-y-6">
        {[
          { name: '부석사 역사 탐방 코스', paths: ['부석사', '소수서원', '농가A'], stats: '평균 4.5시간 체류' },
          { name: '소백산 힐링 둘레길', paths: ['소백산', '풍기온천', '카페B'], stats: '재방문율 35%' },
          { name: '가족 체험 패키지', paths: ['체험관', '농가B', '무섬마을'], stats: '구매 전환 22%' },
        ].map((course, i) => (
          <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-stone-100 before:rounded-full">
            <h4 className="text-xs font-black text-stone-800 mb-2">{course.name}</h4>
            <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar">
              {course.paths.map((p, idx) => (
                <React.Fragment key={p}>
                  <span className="text-[9px] font-bold text-stone-500 bg-stone-50 px-2 py-1 rounded-lg shrink-0">{p}</span>
                  {idx < course.paths.length - 1 && <ChevronRight size={10} className="text-stone-300 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{course.stats}</p>
          </div>
        ))}
      </div>
    </section>

    <div className="bg-apple-red/5 border-4 border-apple-red/10 p-6 rounded-[2.5rem]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-apple-red/10 rounded-2xl flex items-center justify-center text-apple-red">
          <Info size={20} />
        </div>
        <h3 className="text-sm font-black text-apple-red">이탈 지점 분석 (Churn Point)</h3>
      </div>
      <p className="text-[11px] font-bold text-stone-600 leading-relaxed mb-4">
        평균적으로 <span className="font-black text-stone-800">두 번째 미션 완료 후 이탈율</span>이 가장 높습니다. <br />
        세 번째 장소에서 <span className="font-black text-stone-800">사용 가능한 혜택 쿠폰</span>을 발송하면 체류 시간을 45분 연장할 수 있습니다.
      </p>
      <button className="w-full py-3 bg-white text-apple-red border-2 border-apple-red/20 rounded-2xl text-[10px] font-black shadow-sm">AI 추천 정책 설정하기</button>
    </div>
  </div>
);

const PolicySection = () => (
  <div className="space-y-6">
    <div className="bg-stone-800 p-8 rounded-[3rem] text-white shadow-xl shadow-stone-200">
      <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">지역 경제 기여도</h3>
      <div className="flex items-baseline gap-2 mb-6">
        <p className="text-4xl font-black italic">68%</p>
        <span className="text-xs font-bold text-apple-green">+5.2% vs 전분기</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-apple-green" style={{ width: '68%' }} />
      </div>
      <p className="text-[10px] font-bold text-white/60 leading-relaxed">
        "관광객의 앱 내 미션 활동이 실제 농가 소비로 이어진 비율입니다. <br />
        전통시장 온누리상품권 연동 이후 가파르게 상승 중입니다."
      </p>
    </div>

    <section>
      <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">정책별 성과 분석</h3>
      <div className="space-y-3">
        {[
          { name: '디지털 명예시민증', rate: 75, impact: 'High' },
          { name: '사과나무 분양 지원금', rate: 42, impact: 'Medium' },
          { name: '전통시장 스탬프 투어', rate: 88, impact: 'Critical' },
        ].map(p => (
           <div key={p.name} className="bg-white p-4 rounded-3xl border-2 border-stone-100 flex items-center justify-between">
             <div>
               <p className="text-[10px] font-black text-stone-800 mb-1">{p.name}</p>
               <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-stone-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${p.rate}%` }} />
                  </div>
                  <span className="text-[8px] font-bold text-stone-400">이용률 {p.rate}%</span>
               </div>
             </div>
             <span className={cn(
               "text-[8px] font-black px-2 py-1 rounded-lg",
               p.impact === 'Critical' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
             )}>{p.impact}</span>
           </div>
        ))}
      </div>
    </section>
  </div>
);

const OpsSection = () => (
  <div className="space-y-6">
    <div className="flex gap-4">
      <button className="flex-1 bg-white border-4 border-stone-100 p-6 rounded-[2rem] flex flex-col items-center gap-3 group hover:border-apple-red transition-all shadow-sm">
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-apple-red">
          <Bell size={24} />
        </div>
        <p className="font-black text-sm text-stone-800 group-hover:text-apple-red">공지 관리</p>
      </button>
      <button className="flex-1 bg-white border-4 border-stone-100 p-6 rounded-[2rem] flex flex-col items-center gap-3 group hover:border-blue-500 transition-all shadow-sm">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
          <Briefcase size={24} />
        </div>
        <p className="font-black text-sm text-stone-800 group-hover:text-blue-500">정책 등록</p>
      </button>
    </div>

    <section className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100 shadow-sm">
      <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6">최근 시스템 로그</h3>
      <div className="space-y-4">
        {[
          { type: 'Info', text: '여름 시즌 영주시 관광 정책 업데이트 완료', time: '12:45' },
          { type: 'Success', text: '푸시 알림 12,450건 발송 성공', time: '11:20' },
          { type: 'Alert', text: '특정 지역 대기 유입 증가로 정체 발생 감지', time: '10:05' },
        ].map((log, i) => (
          <div key={i} className="flex gap-4 items-start pb-4 border-b border-stone-50 last:border-0 last:pb-0">
             <span className={cn(
               "text-[8px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 mt-0.5",
               log.type === 'Alert' ? "bg-red-50 text-red-500" : "bg-stone-50 text-stone-500"
             )}>{log.type}</span>
             <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-stone-800 truncate">{log.text}</p>
             </div>
             <span className="text-[9px] font-bold text-stone-300 shrink-0">{log.time}</span>
          </div>
        ))}
      </div>
    </section>
  </div>
);
