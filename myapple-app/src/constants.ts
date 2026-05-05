import { Farm, Place, VisitMission } from './types';

export const FARMS: Farm[] = [
  {
    id: 'f1',
    name: '영주소백팜',
    location: '경상북도 영주시 의상로116번길 43',
    description: '사과 따기, 사과 음식, 피자 만들기 등 농촌체험이 가능한 영주 농촌관광 기반 농장입니다.',
    varieties: ['홍로', '부사', '아리수'],
    image: 'https://picsum.photos/seed/yeongju-sobaek-farm/800/600',
    rating: 4.9,
    ownerName: '소백팜 농부',
    coords: { x: 55, y: 45 },
    isUnlocked: true
  },
  {
    id: 'f2',
    name: '풍기 사과인삼 농장',
    location: '경상북도 영주시 풍기읍',
    description: '풍기인삼 권역의 사과 농장 콘셉트입니다. 인삼시장 관광 미션과 연계하기 좋습니다.',
    varieties: ['아오리', '홍로', '부사', '감홍'],
    image: 'https://picsum.photos/seed/yeongju-punggi-apple/800/600',
    rating: 4.8,
    ownerName: '풍기 농부',
    coords: { x: 28, y: 34 }
  },
  {
    id: 'f3',
    name: '부석 소백산 사과농장',
    location: '경상북도 영주시 부석면',
    description: '부석사와 소백산 자락 관광 동선에 맞춘 고랭지 사과 농장입니다.',
    varieties: ['시나노골드', '부사', '감홍'],
    image: 'https://picsum.photos/seed/yeongju-buseok-apple/800/600',
    rating: 5.0,
    ownerName: '부석 농부',
    coords: { x: 34, y: 18 }
  },
  {
    id: 'f4',
    name: '문수 무섬 사과농장',
    location: '경상북도 영주시 문수면',
    description: '무섬마을 방문 미션과 이어지는 문수면 사과 농장입니다.',
    varieties: ['홍옥', '홍로', '부사'],
    image: 'https://picsum.photos/seed/yeongju-museom-apple/800/600',
    rating: 4.7,
    ownerName: '문수 농부',
    coords: { x: 47, y: 74 }
  },
  {
    id: 'f5',
    name: '순흥 선비촌 사과농장',
    location: '경상북도 영주시 순흥면',
    description: '소수서원과 선비촌 관광 흐름에 연결되는 체험형 사과 농장입니다.',
    varieties: ['양광', '시나노스위트', '부사'],
    image: 'https://picsum.photos/seed/yeongju-sunheung-apple/800/600',
    rating: 4.9,
    ownerName: '순흥 농부',
    coords: { x: 38, y: 28 }
  },
  {
    id: 'f6',
    name: '봉현 친환경 사과농장',
    location: '경상북도 영주시 봉현면',
    description: '영주시 과수 생산 기반을 반영한 친환경 사과 농장 파일럿 데이터입니다.',
    varieties: ['감홍', '홍로', '부사'],
    image: 'https://picsum.photos/seed/yeongju-bonghyeon-apple/800/600',
    rating: 4.6,
    ownerName: '봉현 농부',
    coords: { x: 33, y: 48 }
  },
  {
    id: 'f7',
    name: '단산 고랭지 사과농장',
    location: '경상북도 영주시 단산면',
    description: '소백산 고랭지 기후를 반영한 착색·당도 중심 사과 농장입니다.',
    varieties: ['시나노골드', '감홍', '부사'],
    image: 'https://picsum.photos/seed/yeongju-dansan-apple/800/600',
    rating: 4.8,
    ownerName: '단산 농부',
    coords: { x: 48, y: 20 }
  }
];

export const GROWTH_STAGES_NEW = {
  SPRING: {
    days: [1, 7],
    label: '봄 (발아기)',
    stages: [
      { day: 1, label: '씨앗', icon: '🌰' },
      { day: 2, label: '새싹 시작', icon: '🌱' },
      { day: 5, label: '어린 나무', icon: '🌿' }
    ]
  },
  SUMMER: {
    days: [8, 14],
    label: '여름 (개화/착과기)',
    stages: [
      { day: 8, label: '꽃 피기', icon: '🌸' },
      { day: 11, label: '작은 열매', icon: '🍏' },
      { day: 13, label: '초록 사과', icon: '🍏' }
    ]
  },
  AUTUMN: {
    days: [15, 23],
    label: '가을 (착색기)',
    stages: [
      { day: 15, label: '착색 시작', icon: '🍏' },
      { day: 18, label: '붉은 사과', icon: '🍎' },
      { day: 21, label: '완성 사과', icon: '🍎' }
    ]
  },
  WINTER: {
    days: [24, 30],
    label: '겨울 (수확/정리)',
    stages: [
      { day: 24, label: '수확기', icon: '📦' },
      { day: 29, label: '나무 휴식', icon: '🪵' },
      { day: 30, label: '땅 정리', icon: '🧹' }
    ]
  }
};

export const SHOP_ITEMS = [
  { id: 'seed_f1', name: '영주소백팜 씨앗', price: 3000, icon: '🌰', desc: '분양: 영주소백팜 사과나무 씨앗', type: 'seed', farmId: 'f1' },
  { id: 'seed_f2', name: '풍기 사과인삼 농장 씨앗', price: 3500, icon: '🌰', desc: '분양: 풍기 권역 사과나무 씨앗', type: 'seed', farmId: 'f2' },
  { id: 'seed_f3', name: '부석 소백산 사과농장 씨앗', price: 3200, icon: '🌰', desc: '분양: 부석 권역 사과나무 씨앗', type: 'seed', farmId: 'f3' },
  { id: 'seed_f4', name: '문수 무섬 사과농장 씨앗', price: 3200, icon: '🌰', desc: '분양: 문수 권역 사과나무 씨앗', type: 'seed', farmId: 'f4' },
  { id: 'seed_f5', name: '순흥 선비촌 사과농장 씨앗', price: 3300, icon: '🌰', desc: '분양: 순흥 권역 사과나무 씨앗', type: 'seed', farmId: 'f5' },
  { id: 'seed_f6', name: '봉현 친환경 사과농장 씨앗', price: 3400, icon: '🌰', desc: '분양: 봉현 권역 사과나무 씨앗', type: 'seed', farmId: 'f6' },
  { id: 'seed_f7', name: '단산 고랭지 사과농장 씨앗', price: 3600, icon: '🌰', desc: '분양: 단산 권역 사과나무 씨앗', type: 'seed', farmId: 'f7' },
  { id: 'nutrient', name: '고급 영양제', price: 1500, icon: '✨', desc: '성장률 +10% (시즌 2회 제한)', type: 'item' },
  { id: 'medicine', name: '병충해 치료제', price: 800, icon: '💊', desc: '병충해 상태 즉시 제거', type: 'item' },
  { id: 'shield', name: '폭염 방풍막', price: 2000, icon: '🛡️', desc: '폭염 패널티 100% 방어', type: 'item' },
  { id: 'fertilizer', name: '영주 한우 비료', price: 5000, icon: '💩', desc: '다음 시즌 초기 성장 보너스', type: 'item' }
];

export const PLACES: Place[] = [
  {
    id: 'p0',
    name: '영주역',
    category: '관광지',
    location: '영주시 휴천동',
    description: '영주 여행과 농촌관광 미션의 출발점입니다.',
    benefits: ['첫 방문 미션 포인트', '관광 코스 시작점'],
    lat: 36.811,
    lng: 128.625,
    operatingHours: '상시 이용',
    isIndoor: true,
    relatedSpecialty: '여행 출발',
    estimatedStayTime: 20,
    image: 'https://loremflickr.com/900/650/train,station?lock=1101',
    address: '경상북도 영주시 선비로 64',
    parking: '역 주변 주차장 이용'
  },
  {
    id: 'p1',
    name: '부석사',
    category: '관광지',
    location: '영주시 부석면',
    description: '우리나라에서 가장 아름다운 목조 건물인 무량수전이 있는 사찰입니다.',
    benefits: ['입장료 10% 할인', '사과즙 증정'],
    lat: 36.998,
    lng: 128.687,
    operatingHours: '09:00 - 18:00',
    isIndoor: false,
    relatedSpecialty: '사과',
    estimatedStayTime: 120,
    image: 'https://loremflickr.com/900/650/korea,temple?lock=1102',
    address: '경상북도 영주시 부석면 부석사로 435',
    parking: '전용 주차장 완비 (대형 가능)'
  },
  {
    id: 'p2',
    name: '소수서원',
    category: '관광지',
    location: '영주시 순흥면',
    description: '우리나라 최초의 사액서원입니다.',
    benefits: ['통합 관람권 할인'],
    lat: 36.925,
    lng: 128.578,
    operatingHours: '09:00 - 18:00',
    isIndoor: false,
    relatedSpecialty: '선비문화',
    estimatedStayTime: 90,
    image: 'https://loremflickr.com/900/650/korea,heritage?lock=1103',
    address: '경상북도 영주시 순흥면 내죽리 151',
    parking: '공용 주차장 이용 가능'
  },
  {
    id: 'p3',
    name: '풍기인삼시장',
    category: '관광지',
    location: '영주시 풍기읍',
    description: '전국 최고의 품질을 자랑하는 풍기인삼을 만날 수 있는 곳입니다.',
    benefits: ['인삼 제품 5% 할인'],
    lat: 36.874,
    lng: 128.523,
    operatingHours: '08:00 - 20:00',
    isIndoor: true,
    relatedSpecialty: '인삼',
    estimatedStayTime: 60,
    image: 'https://loremflickr.com/900/650/korea,market?lock=1104',
    address: '경상북도 영주시 풍기읍 인삼로 8',
    parking: '시장 전용 주차장 및 인근 공영 주차장'
  },
  {
    id: 'p4',
    name: '무섬마을',
    category: '관광지',
    location: '영주시 문수면',
    description: '강물이 마을을 휘감아 도는 아름다운 물돌이 마을입니다.',
    benefits: ['자전거 대여 무료'],
    lat: 36.756,
    lng: 128.612,
    operatingHours: '24시간',
    isIndoor: false,
    relatedSpecialty: '한옥체험',
    estimatedStayTime: 120,
    image: 'https://loremflickr.com/900/650/korea,village?lock=1105',
    address: '경상북도 영주시 문수면 무섬로 238-2',
    parking: '마을 입구 관광객 전용 주차장'
  },
  {
    id: 'p5',
    name: '정도너츠 본점',
    category: '맛집',
    location: '영주시 풍기읍',
    description: '생강 도너츠로 유명한 영주의 대표 디저트 맛집입니다.',
    benefits: ['도너츠 1개 추가 증정'],
    lat: 36.872,
    lng: 128.525,
    operatingHours: '09:00 - 21:00',
    isIndoor: true,
    relatedSpecialty: '생강',
    estimatedStayTime: 30,
    image: 'https://loremflickr.com/900/650/donut,cafe?lock=1106',
    address: '경상북도 영주시 풍기읍 동양대로 6-1',
    parking: '매장 앞 및 인근 도로변 주차 가능'
  },
  {
    id: 'p6',
    name: '나드리분식',
    category: '맛집',
    location: '영주시 중앙로',
    description: '영주 시내의 전설적인 쫄면 맛집입니다. 매콤하고 굵은 면발이 특징입니다.',
    benefits: ['음료수 1병 서비스'],
    lat: 36.821,
    lng: 128.625,
    operatingHours: '11:00 - 20:30',
    isIndoor: true,
    relatedSpecialty: '쫄면',
    estimatedStayTime: 40,
    image: 'https://loremflickr.com/900/650/korean,food?lock=1107',
    address: '경상북도 영주시 중앙로 89',
    parking: '영주 시내 공영 주차장 이용'
  },
  {
    id: 'p7',
    name: '영주축협 한우프라자',
    category: '맛집',
    location: '영주시 가흥동',
    description: '최고급 영주 한우를 합리적인 가격에 즐길 수 있는 곳입니다.',
    benefits: ['식사 후 사과 푸딩 증정'],
    lat: 36.815,
    lng: 128.618,
    operatingHours: '11:30 - 21:30',
    isIndoor: true,
    relatedSpecialty: '영주한우',
    estimatedStayTime: 90,
    image: 'https://loremflickr.com/900/650/korean,beef?lock=1108',
    address: '경상북도 영주시 가흥로 2',
    parking: '자체 대형 주차장 완비'
  },
  {
    id: 'p8',
    name: '선비촌 종가집',
    category: '맛집',
    location: '영주시 순흥면',
    description: '선비촌 내 위치한 전통 한정식 맛집으로 영주 비빔밥이 일품입니다.',
    benefits: ['전통차 1잔 무료'],
    lat: 36.926,
    lng: 128.579,
    operatingHours: '10:00 - 19:00',
    isIndoor: true,
    relatedSpecialty: '비빔밥',
    estimatedStayTime: 60,
    image: 'https://loremflickr.com/900/650/korean,meal?lock=1109',
    address: '경상북도 영주시 순흥면 소백로 2796',
    parking: '선비촌 공용 주차장 이용'
  },
  {
    id: 'p9',
    name: '카페 사과나무',
    category: '카페',
    location: '영주시 부석면',
    description: '부석사 근처의 전망 좋은 카페로 직접 짠 사과 주스가 인기입니다.',
    benefits: ['사과 칩 샘플 증정'],
    lat: 36.995,
    lng: 128.685,
    operatingHours: '10:00 - 20:00',
    isIndoor: true,
    relatedSpecialty: '사과주스',
    estimatedStayTime: 50,
    image: 'https://loremflickr.com/900/650/apple,cafe?lock=1110',
    address: '경상북도 영주시 부석면 부석사로 312',
    parking: '카페 앞 전용 주차 공간'
  },
  {
    id: 'p10',
    name: '중앙분식',
    category: '맛집',
    location: '영주시 중앙로',
    description: '나드리분식과 함께 영주 쫄면의 양대 산맥입니다. 두툼한 면발과 중독성 있는 소스가 특징입니다.',
    benefits: ['단무지 곱빼기 무료', '쫄면 주문 시 국물 무한 리필'],
    lat: 36.822,
    lng: 128.624,
    operatingHours: '11:10 - 19:50 (화요일 휴무)',
    isIndoor: true,
    relatedSpecialty: '쫄면',
    estimatedStayTime: 40,
    image: 'https://loremflickr.com/900/650/noodles,korean?lock=1111',
    address: '경상북도 영주시 중앙로 123-1',
    parking: '영주 시내 공영 주차장 이용'
  },
  {
    id: 'p11',
    name: '영주소백팜',
    category: '농가',
    location: '영주시 상망동',
    description: '사과 따기, 사과 음식, 피자 만들기 등 영주 농촌체험을 제공하는 농장입니다.',
    benefits: ['사과나무 씨앗 미션', '농촌체험 보너스'],
    lat: 36.835,
    lng: 128.650,
    operatingHours: '예약제 운영',
    isIndoor: false,
    relatedSpecialty: '사과',
    estimatedStayTime: 120,
    image: 'https://loremflickr.com/900/650/apple,orchard?lock=1112',
    address: '경상북도 영주시 의상로116번길 43',
    parking: '농장 주차 가능'
  },
  {
    id: 'p12',
    name: '선비촌',
    category: '관광지',
    location: '영주시 순흥면',
    description: '소수서원과 함께 둘러보기 좋은 영주의 선비문화 체험 관광지입니다.',
    benefits: ['선비문화 미션', '코스 설계 추천지'],
    lat: 36.927,
    lng: 128.579,
    operatingHours: '09:00 - 18:00',
    isIndoor: false,
    relatedSpecialty: '선비문화',
    estimatedStayTime: 90,
    image: 'https://loremflickr.com/900/650/korea,traditional?lock=1113',
    address: '경상북도 영주시 순흥면 소백로 2796',
    parking: '선비촌 공용 주차장 이용'
  }
];

export const VISIT_MISSIONS: VisitMission[] = [
  {
    id: 'm1',
    title: '영주역 도착 인증',
    placeId: 'p0',
    type: '탐험형',
    description: '영주 여행의 시작! 영주역에 도착했음을 알려주세요.',
    img: 'https://loremflickr.com/900/650/train,station?lock=2101',
    stages: [
      { id: 'prepare', label: '여행 전', task: '관광 정책 확인 및 안내소 위치 파악', reward: 100, icon: '📋' },
      { id: 'arrival', label: '여행 시작', task: '영주역 도착 (GPS 체크인)', reward: 400, icon: '📍' },
      { id: 'action', label: '여행 중', task: '역 광장 조형물 앞에서 인증샷 촬영', reward: 300, icon: '📸' },
      { id: 'review', label: '방문 완료', task: '이용 후기 작성 및 팁 공유하기', reward: 200, icon: '✍️' }
    ]
  },
  {
    id: 'm2',
    title: '부석사 무량수전 배흘림기둥에 기대어',
    placeId: 'p1',
    type: '체험형',
    description: '무량수전의 아름다운 배흘림기둥을 직접 확인해보세요.',
    img: 'https://loremflickr.com/900/650/korea,temple?lock=2102',
    stages: [
      { id: 'prepare', label: '여행 전', task: '부석사 문화재 해설 시간표 확인하기', reward: 200, icon: '📜' },
      { id: 'arrival', label: '여행 시작', task: '부석사 매표소 GPS 도착 인증', reward: 500, icon: '📍' },
      { id: 'action', label: '여행 중', task: '무량수전 배흘림기둥 사진 찍기', reward: 800, icon: '📸' },
      { id: 'review', label: '방문 완료', task: '아름다운 부석사 방문 후기 작성', reward: 300, icon: '✍️' }
    ]
  },
  {
    id: 'm3',
    title: '풍기 인삼 시장 탐방',
    placeId: 'p3',
    type: '소비형',
    description: '건강한 풍기 인삼의 향기를 느껴보세요.',
    img: 'https://loremflickr.com/900/650/ginseng,market?lock=2103',
    stages: [
      { id: 'prepare', label: '여행 전', task: '풍기 인삼 효능 및 시장 종류 파악', reward: 100, icon: '🔍' },
      { id: 'arrival', label: '여행 시작', task: '인삼 시장 입구 GPS 도착 인증', reward: 300, icon: '📍' },
      { id: 'action', label: '여행 중', task: '인삼 제품 구매 영수증 인증샷', reward: 700, icon: '🧾' },
      { id: 'review', label: '방문 완료', task: '시장 맛집 정보 및 구매 후기 남기기', reward: 300, icon: '✍️' }
    ]
  },
  {
    id: 'm4',
    title: '무섬마을 외나무다리 건너기',
    placeId: 'p4',
    type: '체험형',
    description: '아슬아슬 재미있는 외나무다리를 건너보세요.',
    img: 'https://loremflickr.com/900/650/korea,bridge,village?lock=2104',
    stages: [
      { id: 'prepare', label: '여행 전', task: '무섬마을 자전거 대여 정책 확인', reward: 200, icon: '🚲' },
      { id: 'arrival', label: '여행 시작', task: '무섬마을 주차장 GPS 도착 인증', reward: 400, icon: '📍' },
      { id: 'action', label: '여행 중', task: '외나무다리 위에서 균형잡기 인증샷', reward: 1000, icon: '📸' },
      { id: 'review', label: '방문 완료', task: '무섬마을 방문 팁 및 후기 작성', reward: 500, icon: '✍️' }
    ]
  },
  {
    id: 'm5',
    title: '영주소백팜 사과 체험',
    placeId: 'p11',
    type: '체험형',
    description: '영주 농촌체험 농장에서 사과나무와 지역 농산물 체험을 연결해보세요.',
    img: 'https://loremflickr.com/900/650/apple,orchard,farm?lock=2105',
    stages: [
      { id: 'prepare', label: '여행 전', task: '농장 체험 예약 가능 여부 확인', reward: 200, icon: '📋' },
      { id: 'arrival', label: '여행 시작', task: '영주소백팜 GPS 도착 인증', reward: 500, icon: '📍' },
      { id: 'action', label: '여행 중', task: '사과 체험 또는 농장 체험 인증샷 촬영', reward: 900, icon: '🍎' },
      { id: 'review', label: '방문 완료', task: '농촌체험 후기 작성', reward: 300, icon: '✍️' }
    ]
  }
];
