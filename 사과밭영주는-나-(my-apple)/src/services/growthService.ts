import { TreeState, PestType, AppleVariety } from '../types';
import { GROWTH_STAGES_NEW } from '../constants';

export const calculateDailyGrowth = (
  tree: TreeState,
  isWateredToday: boolean,
  weatherEvent?: { type: string; effectModifier: number }
): Partial<TreeState> => {
  let dailyGrowth = 3; // 기본 +3%
  
  if (isWateredToday) {
    dailyGrowth += 5; // 물주기 +5%
  }

  // 병충해 패널티: 진딧물(-5%), 잎마름병(착색속도 감소는 별도 처리나 성장률에 반영)
  if (tree.pestStatus === 'aphids') {
    dailyGrowth -= 5;
  } else if (tree.pestStatus === 'leaf_blight') {
    dailyGrowth -= 5; // 착색 속도 감소를 성장률에 반영
  }

  if (weatherEvent) {
    // 폭염 패널티 반영 (-5% 등)
    dailyGrowth += weatherEvent.effectModifier;
  }

  // 하루 최대 성장률 제한 (요구사항: 10~13%)
  let maxDaily = 13;
  if (weatherEvent?.type === 'spring_rain') maxDaily = 12;
  if (weatherEvent?.type === 'warm_weather') maxDaily = 13;
  if (weatherEvent?.type === 'monsoon') maxDaily = 10;
  if (weatherEvent?.type === 'heatwave') maxDaily = 8;
  if (weatherEvent?.type === 'strong_sunlight') maxDaily = 12;
  if (weatherEvent?.type === 'cold_wave') maxDaily = 0;

  dailyGrowth = Math.max(-10, Math.min(maxDaily, dailyGrowth));

  const newGrowthRate = Math.min(100, Math.max(0, tree.growthRate + dailyGrowth));
  
  // 계절 전환 여부 판단 (연장 로직은 App.tsx에서 처리하기 위해 현재 상태만 반환)
  return {
    growthRate: newGrowthRate,
  };
};

/**
 * 계절 전환 가능 여부 체크 (GROW01_COND)
 */
export const canTransitionToNextSeason = (tree: TreeState): boolean => {
  if (tree.pestStatus !== 'none') return false;

  if (tree.growthStage === '발아기') return tree.currentDay >= 7 && tree.growthRate >= 30;
  if (tree.growthStage === '개화기') return tree.currentDay >= 14 && tree.growthRate >= 60;
  if (tree.growthStage === '착과기') return tree.currentDay >= 15 && tree.growthRate >= 70; // 요구사항 표 기준
  if (tree.growthStage === '착색기') return tree.currentDay >= 21 && tree.growthRate >= 90;
  
  return true;
};

export const getGrowthStageLabel = (day: number): TreeState['growthStage'] => {
  if (day <= 7) return '발아기';
  if (day <= 14) return '개화기';
  if (day <= 15) return '착과기';
  if (day <= 21) return '착색기';
  if (day <= 30) return '수확기';
  return '시즌종료';
};

/**
 * Day 1~30 일별 세부 세부 상태 메시지 (GROW02)
 */
export const getDailyStatusMessage = (day: number): string => {
  const statusMap: Record<number, string> = {
    1: "씨앗을 심었어요", 2: "첫 성장 시작! 새싹 등장🌱", 3: "잎이 하나 생겼어요",
    4: "잎이 두 개가 되었네요", 5: "줄기가 길어지고 있어요", 6: "작은 나무 형태 완성🌿",
    7: "꽃봉오리가 맺혔어요", 8: "나무가 꽃을 피웠어요🌸", 9: "꽃이 아주 풍성해요",
    10: "꽃이 만개한 상태예요", 11: "꽃이 지고 작은 열매가!🍏", 12: "열매가 점점 늘어나요",
    13: "초록 사과가 커지는 중", 14: "사과가 주렁주렁 매달렸어요", 15: "착색 시작! 노란빛이 돌아요",
    16: "노란 사과가 많아졌어요", 17: "수확 준비를 시작해요", 18: "사과가 빨개지기 시작🍎",
    19: "대부분 빨갛게 익었어요", 20: "완성된 사과 형태예요", 21: "수확 직전! 아주 탐스러워요",
    22: "붉은 사과가 가득해요", 23: "완전 성숙한 사과나무예요", 24: "수확 시작! 사과를 따요",
    25: "수확이 한창 진행 중이에요", 26: "수확 완료! 나무가 비었어요", 27: "사과 정리 및 선별 중",
    28: "사과 포장 및 출하 준비📦", 29: "나무가 휴식을 취해요🪵", 30: "땅 정리 및 다음 시즌 준비🧹"
  };
  return statusMap[day] || "나무가 자라고 있습니다";
};

export const calculateHarvestAmount = (growthRate: number, pestStatus: PestType): number => {
  let baseAmount = 5;
  if (growthRate >= 100) baseAmount = 10;
  else if (growthRate >= 95) baseAmount = 8;
  else if (growthRate >= 80) baseAmount = 7;
  else if (growthRate >= 70) baseAmount = 6;
  
  // 벌레 침입(bug_invasion) 시 수확량 -10% (REWARD01_HARVEST04)
  if (pestStatus === 'bug_invasion') {
    baseAmount = Math.max(1, Math.floor(baseAmount * 0.9));
  }
  
  return baseAmount;
};

export const getPestEvent = (day: number, lastWateredDays: number, hasUsedNutrient: boolean): PestType => {
  // 진딧물(aphids): Day 11, 2일 이상 물주기 없음(CARE01 방치 시)
  if (day === 11 && lastWateredDays >= 2) return 'aphids';
  
  // 잎마름병(leaf_blight): Day 15~18, 관리 부족
  if (day >= 15 && day <= 18 && lastWateredDays >= 3) return 'leaf_blight';
  
  // 벌레 침입(bug_invasion): Day 19~21, 영양제 미사용 상태 유지
  if (day >= 19 && day <= 21 && !hasUsedNutrient && Math.random() < 0.2) return 'bug_invasion';

  return 'none';
};

export const getWeatherEvent = (day: number): { type: string; effectModifier: number; message: string } | null => {
  if (day >= 2 && day <= 6) { 
    return { type: 'spring_rain', effectModifier: 3, message: '어제 영주에 비가 내려 나무가 촉촉해졌어요!' };
  }
  if (day >= 4 && day <= 7) { 
    return { type: 'warm_weather', effectModifier: 5, message: '따뜻한 날씨 덕분에 새싹이 빨리 자라고 있어요!' };
  }
  if (day >= 9 && day <= 12) { 
    return { type: 'monsoon', effectModifier: 2, message: '장마철이에요! 습도가 높아 병충해를 조심하세요!' };
  }
  if (day >= 10 && day <= 13) { 
    return { type: 'heatwave', effectModifier: -5, message: '폭염이 찾아왔어요! 물을 더 자주 주세요!' };
  }
  if (day >= 16 && day <= 20) { 
    return { type: 'strong_sunlight', effectModifier: 4, message: '햇빛이 좋아 사과 색이 빨리 변하고 있어요!' };
  }
  if (day >= 24 && day <= 27) { 
    return { type: 'cold_wave', effectModifier: -10, message: '날씨가 추워 나무가 잠시 쉬고 있어요.' };
  }
  return null;
};
