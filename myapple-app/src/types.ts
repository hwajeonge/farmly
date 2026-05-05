export type AppleVariety = '부사' | '홍로' | '시나노골드' | '감홍' | '아오리' | '아리수' | '홍옥' | '양광' | '시나노스위트' | '감홍' | '썸머킹' | '아이카향';

export interface Farm {
  id: string;
  name: string;
  location: string;
  description: string;
  varieties: AppleVariety[];
  image: string;
  rating: number;
  ownerName: string;
  ownerId?: string;
  coords: { x: number; y: number }; // Percentage coordinates for the map
  isUnlocked?: boolean;
}

export interface FarmProduct {
  id: string;
  farmId: string;
  name: string;
  type: 'tree' | 'plot';
  variety: AppleVariety;
  price: number;
  stock: number;
  isAdoption: boolean;
  description: string;
  includesShipping: boolean;
  harvestPeriod: string;
  images: string[];
}

export interface FarmOrder {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  address?: string;
}

export interface FarmReview {
  id: string;
  farmId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
}

export interface FarmCoupon {
  id: string;
  farmId: string;
  code: string;
  benefit: string;
  expiryDate: string;
  isActive: boolean;
}

export interface Decoration {
  id: string;
  type: 'tree' | 'bench' | 'flower' | 'statue';
  x: number;
  y: number;
}

export interface UserBadge {
  id: string;
  title: string;
  icon: string;
  dateEarned: string;
  month?: string; // e.g., "4월의 농부"
}

export interface VisitedPlace {
  placeId: string;
  date: string;
  name: string;
  category: string;
}

export type PestType = 'none' | 'aphids' | 'leaf_blight' | 'bug_invasion';

export interface TreeState {
  id: string;
  farmId: string;
  variety: AppleVariety;
  nickname: string;
  currentDay: number; // 1 to 30 days cycle
  growthRate: number; // 0 to 100%
  health: number; // 0 to 100
  water: number; // 0 to 100
  lastWatered: string; // ISO date string
  nutrientsUsed: number; // Max 2 per season
  pestStatus: PestType;
  shieldActive: boolean;
  growthStage: '발아기' | '개화기' | '착과기' | '착색기' | '수확기' | '시즌종료';
  plantedAt: string;
  personality: string;
  isGolden: boolean;
  harvestedApples?: number;
  cardConfig?: {
    theme: 'classic' | 'neon' | 'vintage' | 'nature';
    stickers: { id: string; x: number; y: number; type: string }[];
    backgroundImage?: string;
  };
}

export type MissionStatus = 'none' | 'prepare' | 'arrival' | 'action' | 'completed';

export interface CourseItem {
  placeId: string;
  order: number;
  memo?: string;
  estimatedArrival?: string;
  status?: MissionStatus;
}

export interface Course {
  id: string;
  name: string;
  items: CourseItem[];
  createdAt: string;
  theme?: string;
  sourceChatId?: string;
}

export type UserRole = 'general' | 'farm_owner' | 'gov_admin';

export type ItemId = 'nutrient' | 'medicine' | 'shield' | 'fertilizer' | `seed_${string}` | 'harvested_apple';

export interface DeliveryInfo {
  recipientName: string;
  phoneNumber: string;
  address: string;
  memo?: string;
  selectedOptionId: string;
  requestDate: string;
}

export interface HarvestMilestone {
  applesNeeded: number;
  rewardLabel: string;
  rewardType: 'item' | 'coupon' | 'points' | 'special';
  rewardValue: string | number;
  isClaimed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  action?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface MissionReview {
  id: string;
  missionId: string;
  placeId: string;
  missionTitle: string;
  placeName: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  role: UserRole;
  name: string;
  nickname?: string;
  profileImage?: string;
  points: number;
  apples: number; // Spendable currency
  lives: number;
  accumulatedApples: number;
  deliveryRequests: DeliveryInfo[];
  claimedMilestones: number[]; // Array of applesNeeded that were claimed
  isHonoraryCitizen: boolean;
  trees: TreeState[];
  items: { id: string; count: number }[];
  badges: UserBadge[];
  adoptedFarmIds: string[];
  storedFarmIds: string[];
  visitMissionProgress: { [missionId: string]: MissionStatus };
  chatHistory?: { role: 'user' | 'model'; text: string }[]; // legacy
  chatConversations?: ChatConversation[];
  onboardingSeen?: boolean;
  slotCooldowns?: Record<string, { farmId: string; lockedUntil: string }>; // farmId + index key
  courses?: Course[];
  visitedHistory?: VisitedPlace[];
  missionReviews?: MissionReview[];
  favoritePlaceIds?: string[];
  preferences?: {
    categories: Record<string, number>;
    avgStayTime: number;
  };
}

export type MissionType = '탐험형' | '체험형' | '소비형' | '스탬프형';

export interface MissionStage {
  id: 'prepare' | 'arrival' | 'action' | 'review';
  label: string;
  task: string;
  reward: number;
  icon: string;
}

export interface VisitMission {
  id: string;
  title: string;
  placeId: string;
  type: MissionType;
  description: string;
  img: string;
  stages: MissionStage[];
}

export interface Place {
  id: string;
  name: string;
  category: '관광지' | '맛집' | '카페' | '농가' | '숙소';
  location: string;
  description: string;
  benefits: string[];
  lat: number;
  lng: number;
  operatingHours: string;
  isIndoor: boolean;
  relatedSpecialty: string;
  estimatedStayTime: number; // in minutes
  image: string;
  address?: string;
  parking?: string;
}

export interface WeatherEvent {
  type: 'sunny' | 'rainy' | 'storm' | 'drought';
  message: string;
  effect: string;
}

export interface AppNotification {
  id: string;
  type: 'mission' | 'location' | 'info' | 'reward';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  missionId?: string;
  targetTab?: 'tree' | 'map' | 'activity' | 'store' | 'profile';
  targetSubTab?: string;
}
