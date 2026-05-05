export const HARVEST_DELIVERY_REWARDS = [
  {
    id: 'free_1kg',
    title: '실물 사과 1kg 배송',
    extra: '누적 사과 100개 보상',
    price: '무료',
    desc: '누적 사과 100개를 달성하면 배송 신청이 열려요.',
    icon: '🍎',
    applesNeeded: 100,
  },
  {
    id: 'free_2kg',
    title: '실물 사과 2kg 배송',
    extra: '누적 사과 200개 보상',
    price: '무료',
    desc: '누적 사과 200개를 달성하면 2kg 배송 신청이 열려요.',
    icon: '📦',
    applesNeeded: 200,
  },
] as const;

export const HARVEST_DELIVERY_MIN_APPLES = HARVEST_DELIVERY_REWARDS[0].applesNeeded;
export const HARVEST_DELIVERY_MAX_TARGET_APPLES =
  HARVEST_DELIVERY_REWARDS[HARVEST_DELIVERY_REWARDS.length - 1].applesNeeded;

export const HARVEST_REWARD_MILESTONES = [
  { apples: 10, label: '첫 수확' },
  { apples: 30, label: '영양제' },
  { apples: 60, label: '보호 키트' },
  { apples: 100, label: '1kg 배송' },
  { apples: 200, label: '2kg 배송' },
] as const;

export const getHarvestDeliveryRewardById = (rewardId: string) =>
  HARVEST_DELIVERY_REWARDS.find((reward) => reward.id === rewardId) ?? null;

export const getEligibleHarvestDeliveryRewards = (accumulatedApples: number) =>
  HARVEST_DELIVERY_REWARDS.filter((reward) => accumulatedApples >= reward.applesNeeded);

export const getNextHarvestDeliveryReward = (accumulatedApples: number) =>
  HARVEST_DELIVERY_REWARDS.find((reward) => accumulatedApples < reward.applesNeeded) ?? null;
