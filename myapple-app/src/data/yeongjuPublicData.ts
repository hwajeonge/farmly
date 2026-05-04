export type GrowthSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export interface YeongjuMonthlyWeather {
  month: number;
  season: GrowthSeason;
  avgTempC: number;
  precipitationMm: number;
  humidityPct: number;
  sunlightHours: number;
  appleGrowthCue: string;
}

export interface YeongjuGrowthWeatherDay {
  day: number;
  season: GrowthSeason;
  monthBasis: number;
  avgTempC: number;
  precipitationMm: number;
  humidityPct: number;
  sunlightHours: number;
}

export const PUBLIC_DATA_SOURCES = [
  {
    name: '경상북도_관광지 현황',
    provider: '경상북도',
    url: 'https://www.data.go.kr/data/15069224/fileData.do',
  },
  {
    name: '경상북도_관광농원 현황',
    provider: '경상북도',
    url: 'https://www.data.go.kr/data/15044797/fileData.do',
  },
  {
    name: '경상북도 영주시_농촌관광시설 현황',
    provider: '경상북도 영주시',
    url: 'https://www.data.go.kr/data/15110900/openapi.do',
  },
  {
    name: '경상북도 영주시_영주맛집 현황',
    provider: '경상북도 영주시',
    url: 'https://www.data.go.kr/data/15110877/openapi.do',
  },
  {
    name: '기상청_관광코스별 관광지 상세 날씨 조회서비스',
    provider: '기상청',
    url: 'https://www.data.go.kr/data/15056912/openapi.do',
  },
  {
    name: '영주시 농업기술센터_농업현황',
    provider: '영주시 농업기술센터',
    url: 'https://www.yeongju.go.kr/atec/page.do?mnu_uid=10783',
  },
];

export const YEONGJU_AGRICULTURE_BASELINE = {
  basePeriod: '2013-2022 영주시 농업기상 연간값 기반 내부 환산',
  annualAvgTempC: 12.0,
  annualPrecipitationMm: 1194.2,
  annualAvgHumidityPct: 65.7,
  appleAreaHa: 3320,
  appleProductionTon: 77310,
};

export const YEONGJU_MONTHLY_WEATHER: YeongjuMonthlyWeather[] = [
  { month: 1, season: 'winter', avgTempC: -2.7, precipitationMm: 25, humidityPct: 63, sunlightHours: 5.5, appleGrowthCue: '휴면과 한파 대비' },
  { month: 2, season: 'winter', avgTempC: 0.2, precipitationMm: 30, humidityPct: 60, sunlightHours: 6.1, appleGrowthCue: '휴면 후반 관리' },
  { month: 3, season: 'spring', avgTempC: 5.8, precipitationMm: 65, humidityPct: 58, sunlightHours: 6.8, appleGrowthCue: '발아 준비' },
  { month: 4, season: 'spring', avgTempC: 12.4, precipitationMm: 80, humidityPct: 56, sunlightHours: 7.2, appleGrowthCue: '새싹과 꽃눈 성장' },
  { month: 5, season: 'spring', avgTempC: 17.8, precipitationMm: 90, humidityPct: 61, sunlightHours: 7.4, appleGrowthCue: '개화 전후 생장 가속' },
  { month: 6, season: 'summer', avgTempC: 22.0, precipitationMm: 135, humidityPct: 70, sunlightHours: 6.1, appleGrowthCue: '착과와 열매 비대' },
  { month: 7, season: 'summer', avgTempC: 24.7, precipitationMm: 270, humidityPct: 78, sunlightHours: 4.9, appleGrowthCue: '장마와 병충해 주의' },
  { month: 8, season: 'summer', avgTempC: 25.2, precipitationMm: 225, humidityPct: 77, sunlightHours: 5.6, appleGrowthCue: '폭염과 수분 관리' },
  { month: 9, season: 'autumn', avgTempC: 20.1, precipitationMm: 140, humidityPct: 72, sunlightHours: 5.8, appleGrowthCue: '착색 시작' },
  { month: 10, season: 'autumn', avgTempC: 13.5, precipitationMm: 60, humidityPct: 66, sunlightHours: 6.5, appleGrowthCue: '당도와 색상 형성' },
  { month: 11, season: 'autumn', avgTempC: 6.8, precipitationMm: 50, humidityPct: 64, sunlightHours: 5.7, appleGrowthCue: '수확 마무리와 잎 정리' },
  { month: 12, season: 'winter', avgTempC: -0.9, precipitationMm: 24.2, humidityPct: 62, sunlightHours: 5.3, appleGrowthCue: '수확 후 휴면 진입' },
];

const seasonMonthByDay = (day: number): { season: GrowthSeason; month: number } => {
  if (day <= 7) return { season: 'spring', month: day <= 2 ? 3 : day <= 5 ? 4 : 5 };
  if (day <= 14) return { season: 'summer', month: day <= 9 ? 6 : day <= 12 ? 7 : 8 };
  if (day <= 23) return { season: 'autumn', month: day <= 17 ? 9 : day <= 20 ? 10 : 11 };
  return { season: 'winter', month: day <= 26 ? 12 : day <= 28 ? 1 : 2 };
};

export const getYeongjuGrowthWeatherDay = (day: number): YeongjuGrowthWeatherDay => {
  const clampedDay = Math.max(1, Math.min(30, Math.round(day)));
  const { season, month } = seasonMonthByDay(clampedDay);
  const monthWeather = YEONGJU_MONTHLY_WEATHER.find((item) => item.month === month)!;

  return {
    day: clampedDay,
    season,
    monthBasis: month,
    avgTempC: monthWeather.avgTempC,
    precipitationMm: monthWeather.precipitationMm,
    humidityPct: monthWeather.humidityPct,
    sunlightHours: monthWeather.sunlightHours,
  };
};

export const getSeasonLabel = (season: GrowthSeason) => {
  if (season === 'spring') return '봄';
  if (season === 'summer') return '여름';
  if (season === 'autumn') return '가을';
  return '겨울';
};
