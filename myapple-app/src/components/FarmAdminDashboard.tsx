import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, Package, TrendingUp, ShieldAlert, 
  Store, MapPin, MessageCircle, Plus, Info, 
  Settings, ShoppingBag, Bell, PieChart, Apple, 
  ChevronRight, Filter, Download, MoreHorizontal,
  Truck, Calendar, Tag, Search, Edit3, Image as ImageIcon, X
} from 'lucide-react';
import { UserRole, FarmProduct, FarmOrder, FarmReview, AppleVariety } from '../types';
import { cn } from '../lib/utils';

type SubTab = 'dashboard' | 'products' | 'farm' | 'orders' | 'marketing' | 'ai';

interface FarmAdminDashboardProps {
  role: UserRole;
}

export const FarmAdminDashboard: React.FC<FarmAdminDashboardProps> = ({ role }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dashboard');

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'products', label: '상품 관리', icon: Apple },
    { id: 'farm', label: '농가 정보', icon: Store },
    { id: 'orders', label: '주문/배송', icon: Truck },
    { id: 'marketing', label: '리뷰/이벤트', icon: MessageCircle },
    { id: 'ai', label: 'AI 분석', icon: PieChart },
  ];

  return (
    <div className="pb-10">
      {/* Horizontal Sub-nav */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id as SubTab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all shrink-0",
              activeSubTab === item.id 
                ? "bg-apple-red text-white shadow-lg shadow-apple-red/20" 
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'dashboard' && <DashboardSection />}
          {activeSubTab === 'products' && <ProductsSection />}
          {activeSubTab === 'farm' && <FarmInfoSection />}
          {activeSubTab === 'orders' && <OrdersSection />}
          {activeSubTab === 'marketing' && <MarketingSection />}
          {activeSubTab === 'ai' && <AISection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- Sub Sections ---

const DashboardSection = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-3xl border-4 border-stone-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-apple-red mb-2">
            <Users size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">오늘 방문객</span>
          </div>
          <p className="text-3xl font-black">42명</p>
          <div className="flex items-center gap-1 mt-2 text-apple-green text-[10px] font-black">
            <TrendingUp size={12} />
            +12% (주간)
          </div>
        </div>
      </div>
      <div className="bg-white p-5 rounded-3xl border-4 border-stone-100 shadow-sm">
        <div className="flex items-center gap-2 text-yeoju-gold mb-2">
          <ShoppingBag size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">오늘 매출</span>
        </div>
        <p className="text-3xl font-black">1.2M</p>
        <div className="flex items-center gap-1 mt-2 text-apple-green text-[10px] font-black">
          <TrendingUp size={12} />
          +5.4% (주간)
        </div>
      </div>
    </div>

    <section className="bg-stone-800 p-6 rounded-[2.5rem] text-white shadow-xl shadow-stone-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-sm uppercase tracking-widest opacity-80">최근 주문 알림</h3>
        <span className="p-1 px-2 bg-white/10 rounded-lg text-[9px] font-black">LIVE</span>
      </div>
      <div className="space-y-4">
        {[
          { user: '김사과', item: '부사 (10kg)', time: '5분 전', status: 'new' },
          { user: '이햇살', item: '사과나무 분양', time: '12분 전', status: 'new' },
        ].map((order, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
            <div>
              <p className="text-xs font-black">{order.user}님 주문</p>
              <p className="text-[10px] font-bold opacity-60">{order.item}</p>
            </div>
            <span className="text-[9px] font-black text-yeoju-gold bg-yeoju-gold/20 px-2 py-0.5 rounded-full">승인 대기</span>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100 shadow-sm">
      <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <PieChart size={14} className="text-stone-600" />
        품종별 판매 비중
      </h3>
      <div className="space-y-4">
        {[
          { label: '부사', value: 65, color: 'bg-apple-red' },
          { label: '감홍', value: 25, color: 'bg-stone-800' },
          { label: '시나노골드', value: 10, color: 'bg-yeoju-gold' },
        ].map(item => (
          <div key={item.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black">{item.label}</span>
              <span className="text-[10px] font-bold text-stone-400">{item.value}%</span>
            </div>
            <div className="w-full h-3 bg-stone-50 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const ProductsSection = () => {
  const [showAdd, setShowAdd] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
          <input 
            placeholder="상품명 검색..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl border-2 border-stone-100 text-xs font-bold focus:border-apple-red outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 bg-apple-red text-white rounded-2xl flex items-center justify-center shadow-lg shadow-apple-red/30 shrink-0"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {[
          { name: '부사 사과나무 (A구획)', type: '분양형', price: '120,000원', stock: 12, status: '판매중' },
          { name: '홍로 묘목 (나무단위)', type: '일반판매', price: '35,000원', stock: 45, status: '품절임박' },
          { name: '명품 감홍 사과 (5kg)', type: '직거래', price: '48,000원', stock: 8, status: '품절' },
        ].map((product, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] border-4 border-stone-100 shadow-sm group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-[8px] font-black px-1.5 py-0.5 rounded-lg",
                    product.type === '분양형' ? "bg-blue-50 text-blue-500" : "bg-stone-100 text-stone-500"
                  )}>{product.type}</span>
                  <h4 className="font-black text-sm text-stone-800">{product.name}</h4>
                </div>
                <p className="text-[10px] font-bold text-stone-400">{product.price}</p>
              </div>
              <button className="text-stone-300 hover:text-stone-600">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-stone-50">
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className="text-stone-400">재고:</span>
                <span className={cn(product.stock < 10 ? "text-apple-red" : "text-stone-800")}>{product.stock}개</span>
              </div>
              <span className={cn(
                "text-[10px] font-black",
                product.status === '판매중' ? "text-apple-green" : 
                product.status === '품절임박' ? "text-yeoju-gold" : "text-apple-red"
              )}>{product.status}</span>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="w-full max-w-md bg-white rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black">새 상품 등록 🍎</h3>
              <button onClick={() => setShowAdd(false)} className="text-stone-300"><X size={20} /></button>
            </div>
            
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">상품 유형</label>
                <div className="flex gap-2">
                  {['나무 단위', '구획 단위', '분양형'].map(t => (
                    <button key={t} type="button" className="flex-1 py-3 bg-stone-50 rounded-2xl text-[10px] font-black focus:bg-apple-red focus:text-white transition-all">{t}</button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">상품명</label>
                <input className="w-full p-4 bg-stone-50 rounded-2xl border-2 border-transparent focus:border-stone-100 outline-none font-bold text-sm" placeholder="예: 소백산 부사 사과나무 분양" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">가격 (원)</label>
                  <input className="w-full p-4 bg-stone-50 rounded-2xl outline-none font-bold text-sm" placeholder="120,000" type="number" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">재고</label>
                  <input className="w-full p-4 bg-stone-50 rounded-2xl outline-none font-bold text-sm" placeholder="20" type="number" />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <button type="button" className="w-full py-4 bg-apple-red text-white rounded-[2rem] font-black shadow-lg shadow-apple-red/20 active:scale-[0.98] transition-all">
                  등록 완료
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const FarmInfoSection = () => (
  <div className="space-y-6">
    <section className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100 shadow-sm relative pt-12">
      <div className="absolute -top-4 -left-4 w-14 h-14 bg-apple-green rounded-2xl flex items-center justify-center text-white shadow-lg">
        <Store size={28} />
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">농가 소개</label>
          <div className="bg-stone-50 p-4 rounded-2xl">
            <p className="text-sm font-bold text-stone-700 leading-relaxed italic">
              "3대째 이어져 온 정직한 고집, 소백산의 바람과 영주의 햇살이 빚어낸 꿀사과를 만납니다."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative group overflow-hidden rounded-2xl aspect-square">
            <img src="https://picsum.photos/seed/farm1/400/400" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Edit3 size={20} className="text-white" />
            </div>
          </div>
          <button className="border-4 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-300 hover:text-stone-400 hover:border-stone-200 transition-all">
            <Plus size={24} />
            <span className="text-[10px] font-black">사진 추가</span>
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
            <MapPin size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-stone-800">농장 위치 등록됨</p>
            <p className="text-[10px] font-bold text-blue-400">영주시 풍기읍 소백로 123-4</p>
          </div>
          <button className="text-[10px] font-black text-blue-500 px-3 py-1 bg-white rounded-lg border border-blue-100">지도 보기</button>
        </div>
      </div>
    </section>

    <button className="w-full py-4 bg-stone-800 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-2">
      <Edit3 size={16} /> 정보 일괄 수정
    </button>
  </div>
);

const OrdersSection = () => (
  <div className="space-y-6">
    <div className="flex bg-stone-100 p-1.5 rounded-2xl">
      {['전체', '대기', '배송중', '완료'].map((s, i) => (
        <button key={s} className={cn(
          "flex-1 py-2 rounded-xl text-[10px] font-black transition-all",
          i === 0 ? "bg-white text-stone-800 shadow-sm" : "text-stone-400"
        )}>{s}</button>
      ))}
    </div>

    <div className="space-y-4">
      {[
        { id: '#ORD-2024-001', user: '홍길동', item: '부사 사과 10kg', status: 'new', time: '1시간 전' },
        { id: '#ORD-2024-002', user: '성춘향', item: '사과나무 분양 1주', status: 'shipping', time: '3시간 전' },
        { id: '#ORD-2024-003', user: '이몽룡', item: '홍로 체험 2인', status: 'done', time: '어제' },
      ].map((order, i) => (
        <div key={i} className="bg-white p-4 rounded-[1.5rem] border-2 border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[8px] font-black text-stone-300 mb-1">{order.id}</p>
              <h4 className="font-black text-xs text-stone-800">{order.user}님</h4>
              <p className="text-[10px] font-bold text-stone-500">{order.item}</p>
            </div>
            <div className={cn(
              "text-[9px] font-black px-2 py-0.5 rounded-full",
              order.status === 'new' ? "bg-apple-red/10 text-apple-red" : 
              order.status === 'shipping' ? "bg-blue-50 text-blue-500" : "bg-stone-50 text-stone-400"
            )}>
              {order.status === 'new' ? '주문확인 대기' : order.status === 'shipping' ? '배송중' : '완료'}
            </div>
          </div>
          <div className="flex gap-2 pt-3 border-t border-stone-50">
            {order.status === 'new' ? (
              <button className="flex-1 py-1.5 bg-apple-red text-white rounded-lg text-[9px] font-black">발송 처리</button>
            ) : (
              <button className="flex-1 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-[9px] font-black">배송 추적</button>
            )}
            <button className="flex-1 py-1.5 bg-stone-50 text-stone-400 rounded-lg text-[9px] font-black">상세보기</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MarketingSection = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <button className="bg-apple-red/5 border-2 border-apple-red/10 p-5 rounded-3xl text-left group hover:bg-apple-red transition-all">
        <Bell size={20} className="text-apple-red group-hover:text-white mb-2" />
        <p className="text-[10px] font-black text-stone-400 group-hover:text-white/60 uppercase tracking-widest">Push</p>
        <p className="text-xs font-black text-apple-red group-hover:text-white">알림 발송</p>
      </button>
      <button className="bg-yeoju-gold/5 border-2 border-yeoju-gold/10 p-5 rounded-3xl text-left group hover:bg-yeoju-gold transition-all">
        <Tag size={20} className="text-yeoju-gold group-hover:text-white mb-2" />
        <p className="text-[10px] font-black text-stone-400 group-hover:text-white/60 uppercase tracking-widest">Promo</p>
        <p className="text-xs font-black text-yeoju-gold group-hover:text-white">쿠폰/혜택</p>
      </button>
    </div>

    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
          <MessageCircle size={14} className="text-stone-600" />
          방문객 후기
        </h3>
        <button className="text-[10px] font-black text-blue-500">전체보기</button>
      </div>
      <div className="space-y-4">
        {[
          { name: '김지은', rating: 5, date: '1일 전', text: '사과나무 분양했는데 너무 신기해요! 아이가 매일 물 주는거 기다려요.', photo: true },
          { name: '박민준', rating: 4, date: '3일 전', text: '배송이 하루 늦었지만 사과는 정말 맛있네요. 포장도 꼼꼼합니다.', photo: false },
        ].map((rev, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl border-2 border-stone-50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs">{rev.name}</span>
                <div className="flex text-yeoju-gold">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-[10px]">{j < rev.rating ? '★' : '☆'}</span>)}
                </div>
              </div>
              <span className="text-[8px] font-bold text-stone-400">{rev.date}</span>
            </div>
            <p className="text-[10px] font-bold text-stone-600 leading-relaxed mb-3">"{rev.text}"</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-stone-50 text-stone-500 rounded-xl text-[9px] font-black hover:bg-apple-red hover:text-white transition-all">답변하기</button>
              <button className="px-3 py-2 bg-stone-50 text-stone-400 rounded-xl">
                <ShieldAlert size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const AISection = () => (
  <div className="space-y-6">
    <div className="apple-gradient p-8 rounded-[3rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 opacity-80">
          <ShieldAlert size={20} />
          <span className="text-xs font-black uppercase tracking-widest">AI Prediction</span>
        </div>
        <h3 className="text-2xl font-black mb-2">올해 예상 수확량</h3>
        <p className="text-3xl font-black mb-6">약 2.4 톤</p>
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30">
          <p className="text-[10px] font-bold leading-relaxed">
            최근 기상 데이터(풍기읍) 분석 결과,<br />
            냉해 피해가 적어 작년 대비 15.4% 증가할 것으로 예측됩니다.
          </p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
    </div>

    <section className="bg-white p-6 rounded-[2.5rem] border-4 border-stone-100 shadow-sm">
      <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <TrendingUp size={14} className="text-stone-600" />
        구매 전환율 분석
      </h3>
      <div className="space-y-4">
        {[
          { label: '코스 탐색 유저', value: 85, color: 'bg-stone-100' },
          { label: '상품 상세 조회', value: 45, color: 'bg-blue-100' },
          { label: '실제 구매/분양', value: 12, color: 'bg-apple-red' },
        ].map(item => (
          <div key={item.label} className="relative group">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black">{item.label}</span>
              <span className="text-[10px] font-bold text-stone-400">{item.value}%</span>
            </div>
            <div className="w-full h-8 bg-stone-50 rounded-xl overflow-hidden relative border border-stone-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                className={cn("h-full transition-all duration-1000", item.color)}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[9px] font-bold text-stone-400 text-center uppercase tracking-widest">
        * 코스 설계에서 장소 방문 인증 시 구매 전환율이 3.2배 높습니다.
      </p>
    </section>
  </div>
);

