import { TreeState, PestType } from '../types';
import { getSeasonLabel, getYeongjuGrowthWeatherDay } from '../data/yeongjuPublicData';

export type GrowthStage = TreeState['growthStage'];

export type WeatherEventType =
  | 'spring_rain'
  | 'warm_weather'
  | 'monsoon'
  | 'heatwave'
  | 'strong_sunlight'
  | 'cold_wave';

export interface GrowthWeatherEvent {
  type: WeatherEventType;
  effectModifier: number;
  maxDailyGrowth: number;
  message: string;
  userMessage: string;
  seasonLabel: string;
  monthBasis: number;
  climate: {
    avgTempC: number;
    precipitationMm: number;
    humidityPct: number;
    sunlightHours: number;
  };
}

const DAY = 1000 * 60 * 60 * 24;

const STAGE_BY_DAY: Array<{ maxDay: number; stage: GrowthStage }> = [
  { maxDay: 7, stage: '발아기' },
  { maxDay: 14, stage: '개화기' },
  { maxDay: 21, stage: '착과기' },
  { maxDay: 23, stage: '착색기' },
  { maxDay: 30, stage: '수확기' },
];

export const daysSince = (isoDate?: string): number => {
  if (!isoDate) return Number.POSITIVE_INFINITY;
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((Date.now() - time) / DAY));
};

export const calculateDailyGrowth = (
  tree: TreeState,
  isWateredToday: boolean,
  weatherEvent?: GrowthWeatherEvent | { type: string; effectModifier: number; maxDailyGrowth?: number }
): Partial<TreeState> => {
  let dailyGrowth = 3;

  if (isWateredToday) dailyGrowth += 5;

  if (tree.pestStatus === 'aphids') dailyGrowth -= 5;
  if (tree.pestStatus === 'leaf_blight') dailyGrowth -= 5;

  if (weatherEvent) {
    const isHeatwaveBlocked = weatherEvent.type === 'heatwave' && tree.shieldActive;
    dailyGrowth += isHeatwaveBlocked ? 0 : weatherEvent.effectModifier;
  }

  const maxDaily = weatherEvent?.maxDailyGrowth ?? getMaxDailyGrowth(weatherEvent?.type);
  dailyGrowth = Math.max(-10, Math.min(maxDaily, dailyGrowth));

  return {
    growthRate: Math.min(100, Math.max(0, tree.growthRate + dailyGrowth)),
    water: Math.max(0, Math.min(100, tree.water - (isWateredToday ? 0 : 10))),
    shieldActive: weatherEvent?.type === 'heatwave' ? false : tree.shieldActive,
  };
};

export const canTransitionToNextSeason = (tree: TreeState): boolean => {
  if (tree.growthStage === '발아기') {
    return tree.currentDay >= 7 && tree.growthRate >= 30 && tree.pestStatus === 'none';
  }
  if (tree.growthStage === '개화기') {
    return tree.currentDay >= 14 && tree.growthRate >= 60 && tree.pestStatus === 'none';
  }
  if (tree.growthStage === '착과기' || tree.growthStage === '착색기') {
    return tree.currentDay >= 23 && tree.growthRate >= 90;
  }
  return true;
};

export const getGrowthStageLabel = (day: number): GrowthStage => {
  const clampedDay = Math.max(1, Math.min(30, day));
  return STAGE_BY_DAY.find(({ maxDay }) => clampedDay <= maxDay)?.stage ?? '시즌종료';
};

export const getDailyStatusMessage = (day: number): string => {
  const statusMap: Record<number, string> = {
    1: '씨앗을 심었어요',
    2: '첫 성장이 시작됐어요',
    3: '작은 잎이 돋았어요',
    4: '잎이 두 장으로 늘었어요',
    5: '어린 줄기가 단단해졌어요',
    6: '작은 나무 모양이 보이기 시작해요',
    7: '꽃봉오리가 맺혔어요',
    8: '꽃이 피기 시작했어요',
    9: '꽃이 풍성해졌어요',
    10: '꽃이 가득한 상태예요',
    11: '작은 열매가 보이기 시작해요',
    12: '초록 열매가 늘고 있어요',
    13: '열매가 커지는 중이에요',
    14: '초록 사과가 여러 개 열렸어요',
    15: '착색 준비가 시작됐어요',
    16: '노란빛이 살짝 돌기 시작해요',
    17: '수확 준비 분위기가 나요',
    18: '붉은색이 올라오고 있어요',
    19: '대부분 빨갛게 익어가요',
    20: '완성된 사과 모양이 됐어요',
    21: '수확 직전이에요',
    22: '붉은 사과가 가득 열렸어요',
    23: '완전히 성숙한 사과나무예요',
    24: '수확이 시작됐어요',
    25: '수확이 진행 중이에요',
    26: '수확을 마무리하고 있어요',
    27: '사과를 정리하는 중이에요',
    28: '포장 상자가 준비됐어요',
    29: '나무가 쉬어가고 있어요',
    30: '땅을 정리하고 다음 시즌을 준비해요',
  };
  return statusMap[Math.max(1, Math.min(30, day))] ?? '나무가 자라고 있어요';
};

export const getGrowthWeatherSummary = (day: number): string => {
  const weather = getYeongjuGrowthWeatherDay(day);
  return `${getSeasonLabel(weather.season)} 기준 · ${weather.monthBasis}월 평년 환산 · 평균 ${weather.avgTempC}℃ · 강수 ${weather.precipitationMm}mm`;
};

export const calculateHarvestAmount = (growthRate: number, pestStatus: PestType): number => {
  let baseAmount = 5;
  if (growthRate >= 100) baseAmount = 10;
  else if (growthRate >= 95) baseAmount = 8;
  else if (growthRate >= 80) baseAmount = 7;
  else if (growthRate >= 70) baseAmount = 6;

  if (pestStatus === 'bug_invasion') {
    baseAmount = Math.max(1, Math.floor(baseAmount * 0.9));
  }

  return baseAmount;
};

export const getPestEvent = (day: number, lastWateredDays: number, hasUsedNutrient: boolean): PestType => {
  if (day === 11 && lastWateredDays >= 2) return 'aphids';
  if (day >= 15 && day <= 18 && lastWateredDays >= 3) return 'leaf_blight';
  if (day >= 19 && day <= 21 && !hasUsedNutrient) return 'bug_invasion';
  return 'none';
};

export const getWeatherEvent = (day: number): GrowthWeatherEvent | null => {
  const weather = getYeongjuGrowthWeatherDay(day);
  const seasonLabel = getSeasonLabel(weather.season);
  const climate = {
    avgTempC: weather.avgTempC,
    precipitationMm: weather.precipitationMm,
    humidityPct: weather.humidityPct,
    sunlightHours: weather.sunlightHours,
  };

  if (day === 3) {
    return {
      type: 'spring_rain',
      effectModifier: 3,
      maxDailyGrowth: 12,
      message: `영주 ${seasonLabel}비 이벤트예요. ${weather.monthBasis}월 강수 패턴을 반영해 토양 수분이 좋아졌어요.`,
      userMessage: '봄비 덕분에 물주기 효과가 자동 적용됐어요.',
      seasonLabel,
      monthBasis: weather.monthBasis,
      climate,
    };
  }
  if (day === 6) {
    return {
      type: 'warm_weather',
      effectModifier: 5,
      maxDailyGrowth: 13,
      message: `영주 ${weather.monthBasis}월의 따뜻한 기온 흐름이 반영됐어요. 새싹 성장이 빨라집니다.`,
      userMessage: '평균 기온이 좋아 기본 성장이 빨라졌어요.',
      seasonLabel,
      monthBasis: weather.monthBasis,
      climate,
    };
  }
  if (day === 10) {
    return {
      type: 'monsoon',
      effectModifier: 2,
      maxDailyGrowth: 10,
      message: `영주 여름 장마 패턴이에요. ${weather.monthBasis}월 강수량과 습도를 반영해 병충해 위험이 올라갑니다.`,
      userMessage: '장마 보너스가 적용됐지만 병충해 위험도 커졌어요.',
      seasonLabel,
      monthBasis: weather.monthBasis,
      climate,
    };
  }
  if (day === 12) {
    return {
      type: 'heatwave',
      effectModifier: -5,
      maxDailyGrowth: 8,
      message: `영주 8월 수준의 더위가 압축 반영됐어요. 폭염 방풍막과 물 관리가 중요해요.`,
      userMessage: '폭염 패널티가 적용됐어요. 방풍막이 있으면 피해를 줄일 수 있어요.',
      seasonLabel,
      monthBasis: weather.monthBasis,
      climate,
    };
  }
  if (day === 18) {
    return {
      type: 'strong_sunlight',
      effectModifier: 4,
      maxDailyGrowth: 12,
      message: `영주 가을 일조 패턴이 좋아요. 사과 착색과 당도 형성 속도가 올라갑니다.`,
      userMessage: '가을 햇빛 덕분에 착색 속도가 올라갔어요.',
      seasonLabel,
      monthBasis: weather.monthBasis,
      climate,
    };
  }
  if (day === 25) {
    return {
      type: 'cold_wave',
      effectModifier: -10,
      maxDailyGrowth: 0,
      message: `영주 겨울 최저기온 흐름이 반영됐어요. 나무가 잠시 쉬어갑니다.`,
      userMessage: '한파로 오늘 성장은 멈췄어요.',
      seasonLabel,
      monthBasis: weather.monthBasis,
      climate,
    };
  }
  return null;
};

const getMaxDailyGrowth = (type?: string): number => {
  if (type === 'spring_rain') return 12;
  if (type === 'warm_weather') return 13;
  if (type === 'monsoon') return 10;
  if (type === 'heatwave') return 8;
  if (type === 'strong_sunlight') return 12;
  if (type === 'cold_wave') return 0;
  return 13;
};
