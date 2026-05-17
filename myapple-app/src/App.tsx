/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { FarmSelection } from './components/FarmSelection';
import { TreeManagement } from './components/TreeManagement';
import { StoreView } from './components/Store';
import { HarvestDeliveryModal } from './components/HarvestDeliveryModal';
import { ActivityView } from './components/ActivityView';
import { MyPage } from './components/MyPage';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProfile, Farm, AppleVariety, TreeState, Course, AppNotification, ItemId, ChatConversation, DeliveryInfo, MissionReview } from './types';
import { VISIT_MISSIONS, FARMS, PLACES } from './constants';
import {
  calculateDailyGrowth,
  calculateHarvestAmount,
  canTransitionToNextSeason,
  daysSince,
  getDailyStatusMessage,
  getGrowthStageLabel,
  getPestEvent,
  getWeatherEvent,
} from './services/growthService';
import { FloatingChatbot } from './components/FloatingChatbot';
import { RoleSelectionView } from './components/RoleSelectionView';
import { UserRole } from './types';
import { NotificationCenter } from './components/NotificationCenter';
import { LoginView } from './components/LoginView';
import { authService } from './services/authService';
import { User } from 'firebase/auth';
import { alertEmitter, showAlert, AlertType } from './lib/alertEmitter';
import { showConfirm } from './lib/confirmEmitter';
import { AlertModal } from './components/AlertModal';
import { ConfirmModal } from './components/ConfirmModal';
import { GameIntroModal } from './components/GameIntroModal';
import {
  getHarvestDeliveryRewardById,
  HARVEST_DELIVERY_MIN_APPLES,
} from './rewardRules';
import { createRandomTreeCardConfig } from './treeCardDesign';

const MISSION_STATUS_RANK = {
  none: 0,
  prepare: 1,
  arrival: 2,
  action: 3,
  completed: 4,
} as const;

const MINI_GAME_MAX_LIVES = 5;
const HEART_RECHARGE_INTERVAL_MS = 24 * 60 * 60 * 1000;

type QueuedNotification = {
  title: string;
  message: string;
  type?: AppNotification['type'];
  targetTab?: AppNotification['targetTab'];
};

const GUEST_SESSION_STORAGE_KEY = 'yeongju_guest_session_v1';

type GuestSession = {
  user: UserProfile;
  activeTab: string;
  previousTab: string;
  notifications: AppNotification[];
};

const readGuestSession = (): GuestSession | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as GuestSession;
    if (!parsed?.user?.isGuest) return null;
    return {
      user: parsed.user,
      activeTab: parsed.activeTab || 'tree',
      previousTab: parsed.previousTab || 'tree',
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
    };
  } catch {
    window.localStorage.removeItem(GUEST_SESSION_STORAGE_KEY);
    return null;
  }
};

const writeGuestSession = (session: GuestSession) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GUEST_SESSION_STORAGE_KEY, JSON.stringify(session));
};

const clearGuestSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(GUEST_SESSION_STORAGE_KEY);
};

const createGuestTree = (
  id: string,
  farmId: string,
  nickname: string,
  currentDay: number,
  growthRate: number,
  harvestedApples?: number,
): TreeState => {
  const now = new Date().toISOString();

  return {
    id,
    farmId,
    variety: '홍로' as AppleVariety,
    nickname,
    currentDay,
    growthRate,
    health: 100,
    water: currentDay > 1 ? 70 : 45,
    lastWatered: '',
    lastWateredDay: undefined,
    nutrientsUsed: currentDay > 12 ? 1 : 0,
    pestStatus: 'none',
    shieldActive: false,
    growthStage: getGrowthStageLabel(Math.min(currentDay, 30)),
    plantedAt: now,
    personality: '씩씩한',
    isGolden: false,
    harvestedApples,
    cardConfig: createRandomTreeCardConfig(),
  };
};

const createDemoUserProfile = (
  role: UserRole,
  name: string,
  options: Partial<UserProfile> = {},
): UserProfile => {
  const now = new Date().toISOString();
  const trees = options.trees ?? [
    createGuestTree(`${role}-tree-1`, 'f1', `${name}의 홍로`, 12, 56),
  ];

  return {
    role,
    name,
    nickname: name,
    isGuest: true,
    points: options.points ?? 12000,
    apples: options.apples ?? 35,
    lives: MINI_GAME_MAX_LIVES,
    accumulatedApples: options.accumulatedApples ?? 35,
    deliveryRequests: options.deliveryRequests ?? [],
    claimedMilestones: options.claimedMilestones ?? [10, 30],
    claimedLinkMissions: options.claimedLinkMissions ?? [],
    isHonoraryCitizen: options.isHonoraryCitizen ?? false,
    trees,
    items: options.items ?? [
      { id: 'seed_f1', count: 1 },
      { id: 'nutrient', count: 2 },
      { id: 'medicine', count: 1 },
      { id: 'shield', count: 1 },
    ],
    badges: options.badges ?? [
      { id: 'guest', title: '체험 농부', icon: '🌱', dateEarned: now },
    ],
    adoptedFarmIds: options.adoptedFarmIds ?? ['f1'],
    storedFarmIds: options.storedFarmIds ?? [],
    visitMissionProgress: options.visitMissionProgress ?? {},
    chatHistory: options.chatHistory ?? [],
    chatConversations: options.chatConversations ?? [],
    onboardingSeen: options.onboardingSeen ?? true,
    courses: options.courses ?? [],
    visitedHistory: options.visitedHistory ?? [],
    missionReviews: options.missionReviews ?? [],
    favoritePlaceIds: options.favoritePlaceIds ?? ['p1', 'p4'],
    preferences: options.preferences,
    adminDemoUsers: options.adminDemoUsers,
  };
};

const createGovGuestDemoUsers = (): UserProfile[] => [
  createDemoUserProfile('general', '김소백', {
    points: 18400,
    apples: 68,
    accumulatedApples: 126,
    trees: [
      createGuestTree('demo-general-1', 'f1', '소백 홍로', 30, 100, 10),
      createGuestTree('demo-general-2', 'f2', '부석 부사', 18, 82),
    ],
    deliveryRequests: [{
      recipientName: '김소백',
      phoneNumber: '010-0000-0001',
      address: '경북 영주시 체험로 1',
      selectedOptionId: 'apple_1kg',
      requestDate: new Date().toISOString(),
    }],
    claimedMilestones: [10, 30, 100],
    isHonoraryCitizen: true,
    adoptedFarmIds: ['f1', 'f2'],
    visitMissionProgress: { m1: 'completed', m2: 'completed', m4: 'completed' },
    courses: [{ id: 'demo-course-1', name: '부석사와 사과 체험 코스', items: [], createdAt: new Date().toISOString() }],
    favoritePlaceIds: ['p1', 'p2', 'p4'],
  }),
  createDemoUserProfile('general', '이무섬', {
    points: 9300,
    apples: 44,
    accumulatedApples: 72,
    trees: [createGuestTree('demo-general-3', 'f3', '무섬 사과나무', 24, 93)],
    adoptedFarmIds: ['f3'],
    visitMissionProgress: { m2: 'completed', m3: 'completed' },
    courses: [{ id: 'demo-course-2', name: '무섬마을 산책 코스', items: [], createdAt: new Date().toISOString() }],
    favoritePlaceIds: ['p3', 'p5'],
  }),
  createDemoUserProfile('farm_owner', '영주 소백팜', {
    points: 26000,
    apples: 18,
    accumulatedApples: 210,
    trees: [
      createGuestTree('demo-farm-1', 'f1', '분양 홍로 1호', 30, 98, 9),
      createGuestTree('demo-farm-2', 'f1', '분양 홍로 2호', 21, 87),
      createGuestTree('demo-farm-3', 'f1', '분양 부사 1호', 9, 44),
    ],
    adoptedFarmIds: ['f1'],
    visitMissionProgress: { m1: 'completed' },
  }),
  createDemoUserProfile('general', '박풍기', {
    points: 6200,
    apples: 21,
    accumulatedApples: 38,
    trees: [createGuestTree('demo-general-4', 'f2', '풍기 새싹', 7, 32)],
    adoptedFarmIds: ['f2'],
    visitMissionProgress: { m4: 'completed' },
  }),
];

const createGuestProfile = (role: UserRole): UserProfile => {
  const now = new Date().toISOString();
  const baseName =
    role === 'farm_owner' ? '게스트 농가 관리자'
      : role === 'gov_admin' ? '게스트 지자체 관리자'
        : '게스트 농부';

  if (role === 'farm_owner') {
    return createDemoUserProfile(role, baseName, {
      points: 32000,
      apples: 58,
      accumulatedApples: 186,
      trees: [
        createGuestTree('guest-farm-tree-1', 'f1', '소백 홍로 1호', 30, 100, 10),
        createGuestTree('guest-farm-tree-2', 'f1', '소백 홍로 2호', 22, 91),
        createGuestTree('guest-farm-tree-3', 'f1', '소백 부사 1호', 14, 64),
        createGuestTree('guest-farm-tree-4', 'f2', '풍기 감홍 1호', 5, 24),
      ],
      deliveryRequests: [{
        recipientName: '체험 고객',
        phoneNumber: '010-0000-0000',
        address: '경북 영주시 체험로 10',
        memo: '게스트 농가 관리자 더미 주문',
        selectedOptionId: 'apple_1kg',
        requestDate: now,
      }],
      claimedMilestones: [10, 30, 100],
      adoptedFarmIds: ['f1', 'f2'],
      badges: [
        { id: 'guest-farm-owner', title: '농가 관리자 체험', icon: '🚜', dateEarned: now },
      ],
      visitMissionProgress: { m1: 'completed', m4: 'completed' },
      courses: [{ id: 'guest-farm-course', name: '농가 체험 운영 코스', items: [], createdAt: now }],
      favoritePlaceIds: ['p1', 'p4'],
    });
  }

  if (role === 'gov_admin') {
    const openFarmIds = FARMS.slice(0, 3).map(farm => farm.id);

    return createDemoUserProfile(role, baseName, {
      points: 50000,
      apples: 0,
      accumulatedApples: 0,
      trees: [],
      items: openFarmIds.map(farmId => ({ id: `seed_${farmId}`, count: 1 })),
      claimedMilestones: [],
      badges: [
        { id: 'guest-gov-admin', title: '지자체 관리자 체험', icon: '🏛️', dateEarned: now },
      ],
      adoptedFarmIds: openFarmIds,
      favoritePlaceIds: [],
      adminDemoUsers: createGovGuestDemoUsers(),
    });
  }

  return createDemoUserProfile(role, baseName, {
    points: 12000,
    apples: 35,
    accumulatedApples: 35,
    trees: [createGuestTree('guest-tree-1', 'f1', '체험 사과나무', 6, 28)],
    adoptedFarmIds: ['f1'],
    favoritePlaceIds: ['p1', 'p4'],
    badges: [
      { id: 'guest', title: '체험 농부', icon: '🌱', dateEarned: now },
    ],
  });
};

const advanceTreeOneDay = (tree: TreeState) => {
  const isWatered = tree.lastWateredDay === tree.currentDay;
  const weatherEvent = getWeatherEvent(tree.currentDay);
  const growth = calculateDailyGrowth(tree, isWatered, weatherEvent ?? undefined);
  const nextTree: TreeState = { ...tree, ...growth };
  const notifications: QueuedNotification[] = [];

  const currentStage = nextTree.growthStage;
  const currentDay = nextTree.currentDay;

  let canTransition = true;
  if (currentDay >= 7 && currentStage === '발아기') canTransition = canTransitionToNextSeason(nextTree);
  if (currentDay >= 14 && currentStage === '개화기') canTransition = canTransitionToNextSeason(nextTree);
  if (currentDay >= 23 && (currentStage === '착과기' || currentStage === '착색기')) canTransition = canTransitionToNextSeason(nextTree);

  nextTree.currentDay = Math.min(30, nextTree.currentDay + 1);
  if (canTransition) {
    nextTree.growthStage = getGrowthStageLabel(nextTree.currentDay);
  } else {
    notifications.push({
      title: '⚠️ 성장 지연',
      message: `${nextTree.nickname}의 성장이 지연되어 계절 전환이 연기되었습니다. 성장률과 병충해를 확인해주세요.`,
      type: 'info',
    });
  }

  const lastWateredDays =
    typeof tree.lastWateredDay === 'number'
      ? Math.max(0, nextTree.currentDay - tree.lastWateredDay)
      : Number.POSITIVE_INFINITY;
  const pest = getPestEvent(nextTree.currentDay, lastWateredDays, nextTree.nutrientsUsed > 0);
  if (pest !== 'none' && !nextTree.shieldActive && nextTree.pestStatus === 'none') {
    nextTree.pestStatus = pest;
    notifications.push({
      title: '🚨 병충해 발생!',
      message: `${nextTree.nickname}에게 병충해가 생겼어요! 빨리 치료해주세요.`,
      type: 'info',
    });
  }

  if (weatherEvent) {
    notifications.push({ title: '☀️ 기상 이벤트', message: weatherEvent.message, type: 'info' });
    notifications.push({
      title: `🌳 ${nextTree.nickname}의 한마디`,
      message: weatherEvent.userMessage,
      type: 'info',
      targetTab: 'tree',
    });
  }

  if (nextTree.currentDay >= 30 && nextTree.growthStage !== '시즌종료') {
    const appleAmount = calculateHarvestAmount(nextTree.growthRate, nextTree.pestStatus);
    nextTree.harvestedApples = appleAmount;
    nextTree.growthStage = '시즌종료';
  }

  return { tree: nextTree, notifications };
};

export default function App() {
  const [restoredGuestSession] = useState<GuestSession | null>(() => readGuestSession());
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestModeState] = useState(() => Boolean(restoredGuestSession));
  const [guestRolePending, setGuestRolePending] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(restoredGuestSession?.activeTab ?? 'tree');
  const [previousTab, setPreviousTab] = useState(restoredGuestSession?.previousTab ?? 'tree');
  const [activitySubTab, setActivitySubTab] = useState<string | null>(null);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(restoredGuestSession?.user ?? null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [profileRequestedTab, setProfileRequestedTab] = useState<'profile' | 'travel' | 'cards' | null>(null);
  const [requestedSeedFarmId, setRequestedSeedFarmId] = useState<string | null>(null);
  const [storeSeedFarmId, setStoreSeedFarmId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(restoredGuestSession?.notifications ?? []);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [weather, setWeather] = useState('맑음');

  const [profilePending, setProfilePending] = useState(false);
  const fromFirebase = useRef(false);
  const isGuestModeRef = useRef(Boolean(restoredGuestSession));
  const deletionPendingRef = useRef(false);
  const [alertState, setAlertState] = useState<{ message: string; emoji: string; type: AlertType } | null>(null);

  const setGuestMode = (value: boolean) => {
    isGuestModeRef.current = value;
    setIsGuestModeState(value);
  };

  useEffect(() => {
    alertEmitter.on((message, emoji, type) => setAlertState({ message, emoji, type }));
    return () => alertEmitter.off();
  }, []);

  // Firebase Auth & Data Sync
  useEffect(() => {
    authService.handleRedirectResult().catch(console.error);

    const unsubscribeAuth = authService.onAuthStateChange((u) => {
      setFirebaseUser(u);
      if (!u) {
        setAuthLoading(false);
        if (!isGuestModeRef.current) {
          setUser(null);
          setProfilePending(false);
        }
        if (deletionPendingRef.current) {
          deletionPendingRef.current = false;
          showAlert('회원 탈퇴가 완료되었습니다.', '👋', 'success');
        }
      } else {
        setGuestMode(false);
        clearGuestSession();
        setAlertState(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (firebaseUser && !isGuestMode) {
      setAuthLoading(true);
      const unsubscribeProfile = authService.getUserProfile(firebaseUser.uid, (profile) => {
        if (profile) {
          // Data Migration / Defaulting
          const migProfile = { ...profile };
          if (!migProfile.adoptedFarmIds || migProfile.adoptedFarmIds.length === 0) {
            migProfile.adoptedFarmIds = [FARMS[Math.floor(Math.random() * FARMS.length)].id];
          }
          if (!migProfile.storedFarmIds) migProfile.storedFarmIds = [];
          if (!migProfile.claimedMilestones) migProfile.claimedMilestones = [];
          if (!migProfile.claimedLinkMissions) migProfile.claimedLinkMissions = [];
          if (!migProfile.items) migProfile.items = [];
          if (!migProfile.badges) migProfile.badges = [];
          if (!migProfile.trees) migProfile.trees = [];
          if (!migProfile.favoritePlaceIds) migProfile.favoritePlaceIds = [];
          if (!migProfile.missionReviews) migProfile.missionReviews = [];
          if (migProfile.accumulatedApples == null) migProfile.accumulatedApples = 0;
          if (migProfile.apples == null) migProfile.apples = 0;
          if (migProfile.lives == null) migProfile.lives = MINI_GAME_MAX_LIVES;
          if (migProfile.onboardingSeen == null) migProfile.onboardingSeen = true;
          if (!migProfile.chatConversations) {
            const legacy = migProfile.chatHistory;
            migProfile.chatConversations = (legacy && legacy.length > 0) ? [{
              id: 'legacy_' + Date.now(),
              title: '이전 대화',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              messages: legacy,
            }] : [];
          }

          fromFirebase.current = true;
          setUser(migProfile);
          if (migProfile.role === 'general' && migProfile.onboardingSeen === false) {
            setPreviousTab('tree');
            setActivitySubTab(null);
            setProfileRequestedTab(null);
            setActiveTab('tree');
          }
          setProfilePending(false);
        } else {
          setProfilePending(true);
        }
        setAuthLoading(false);
      });
      return () => unsubscribeProfile();
    }
  }, [firebaseUser, isGuestMode]);

  // Auto-save: whenever user state changes locally, persist to Firestore.
  // fromFirebase flag prevents save loops (Firebase update → onSnapshot → setUser → save → loop).
  useEffect(() => {
    if (fromFirebase.current) {
      fromFirebase.current = false;
      return;
    }
    if (!user || !firebaseUser || isGuestMode) return;
    const timer = setTimeout(() => {
      authService.saveProfile(firebaseUser.uid, user).catch(console.error);
    }, 800);
    return () => clearTimeout(timer);
  }, [user, firebaseUser, isGuestMode]);

  useEffect(() => {
    if (!isGuestMode || !user?.isGuest) return;

    const timer = window.setTimeout(() => {
      writeGuestSession({
        user,
        activeTab,
        previousTab,
        notifications,
      });
    }, 200);

    return () => window.clearTimeout(timer);
  }, [isGuestMode, user, activeTab, previousTab, notifications]);

  const handleRoleSelect = async (role: UserRole) => {
    if (!firebaseUser) return;
    setAuthLoading(true);
    try {
      await authService.createProfile(firebaseUser, role);
    } catch (error) {
      console.error("Profile creation failed:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestStart = () => {
    clearGuestSession();
    setGuestRolePending(true);
    setGuestMode(false);
    setUser(null);
    setFirebaseUser(null);
    setProfilePending(false);
    setNotifications([]);
  };

  const handleGuestRoleSelect = (role: UserRole) => {
    setGuestMode(true);
    setGuestRolePending(false);
    setFirebaseUser(null);
    setProfilePending(false);
    setActivitySubTab(null);
    setProfileRequestedTab(null);
    setRequestedSeedFarmId(null);
    setStoreSeedFarmId(null);
    setActiveCourseId(null);
    const startTab = role === 'general' ? 'tree' : 'admin';
    const roleTitle =
      role === 'farm_owner' ? '농가 관리자'
        : role === 'gov_admin' ? '지자체 관리자'
          : '일반 회원';

    const guestProfile = createGuestProfile(role);
    const guestNotifications: AppNotification[] = [
      {
        id: 'guest-welcome',
        type: 'info',
        title: `🌱 게스트 ${roleTitle} 체험 시작`,
        message: `${roleTitle} 예시 데이터로 시작했어요. 새로고침해도 이어지며, 마이 화면에서 로그아웃하면 삭제됩니다.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        targetTab: startTab as AppNotification['targetTab'],
      },
    ];

    writeGuestSession({
      user: guestProfile,
      activeTab: startTab,
      previousTab: startTab,
      notifications: guestNotifications,
    });
    setNotifications(guestNotifications);
    setUser(guestProfile);
    setPreviousTab(startTab);
    setActiveTab(startTab);
    setAlertState({
      message:
        '게스트 체험을 종료하려면\n하단 메뉴의 마이 화면에서\n로그아웃 버튼을 눌러주세요.\n\n로그아웃하면 체험 기록이 삭제돼요.',
      emoji: '🌱',
      type: 'info',
    });
  };

  const handleExitGuestRoleSelection = () => {
    clearGuestSession();
    setGuestRolePending(false);
    setGuestMode(false);
    setUser(null);
    setNotifications([]);
    setActiveTab('tree');
  };

  const handleLogout = () => {
    if (isGuestMode) {
      clearGuestSession();
      setGuestMode(false);
      setGuestRolePending(false);
      setUser(null);
      setNotifications([]);
      setActiveCourseId(null);
      setActivitySubTab(null);
      setProfileRequestedTab(null);
      setPreviousTab('tree');
      setActiveTab('tree');
      return;
    }

    authService.logout();
  };

  const handleUpdateMissionProgress = (missionId: string, status: 'none' | 'prepare' | 'arrival' | 'action' | 'completed') => {
    if (!user) return;
    const mission = VISIT_MISSIONS.find(m => m.id === missionId);

    setUser(prev => {
      if (!prev) return prev;
      const previousStatus = prev.visitMissionProgress?.[missionId] || 'none';
      if (MISSION_STATUS_RANK[previousStatus] >= MISSION_STATUS_RANK[status]) return prev;

      const newStatus = status;
      const updatedProgress = {
        ...prev.visitMissionProgress,
        [missionId]: newStatus
      };

      // Spontaneous journey logic
      let updatedCourses = prev.courses || [];
      let newActiveCourseId = activeCourseId;

      if (status === 'prepare' && !activeCourseId) {
        if (mission) {
          addNotification(
            "📍 즉흥 여행 시작!",
            `${mission.title} 미션을 시작하셨네요! AI가 당신의 동선을 고려해 활기찬 여행 코스를 구성했습니다.`,
            'location',
            undefined,
            'activity',
            'course'
          );

          const newCourse: Course = {
            id: 'c' + Date.now(),
            name: '나의 즉흥 영주 여행',
            items: [
              { placeId: mission.placeId, order: 0, estimatedArrival: '10:00', status: 'completed' },
              { placeId: 'p2', order: 1, estimatedArrival: '11:00', memo: 'AI 추천: 소백산 국립공원' },
              { placeId: 'p5', order: 2, estimatedArrival: '13:00', memo: 'AI 추천: 점심 식사' }
            ],
            createdAt: new Date().toISOString(),
            theme: '즉흥형 여행'
          };
          updatedCourses = [...updatedCourses, newCourse];
          newActiveCourseId = newCourse.id;
          setActiveCourseId(newActiveCourseId);
        }
      }

      // Mission status specific notifications
      if (mission) {
        if (status === 'prepare') {
          addNotification("🎯 미션 시작", `${mission.title} 미션의 방문 전 준비 단계를 완료했습니다! 영주로 활기차게 출발해볼까요?`, 'mission', missionId);
        } else if (status === 'arrival') {
           addNotification("📍 도착 확인 완료", `반가워요! ${mission.title} 장소에 도착하셨군요. 이제 재미있는 미션을 수행해보세요!`, 'location', missionId);
        } else if (status === 'action') {
          addNotification("📸 미션 인증 대기", `${mission.title}에서의 멋진 활동을 후기로 남기고 최종 보상을 획득하세요!`, 'mission', missionId);
        } else if (status === 'completed') {
          addNotification("🍎 미션 최종 완료!", `${mission.title}의 모든 단계를 완벽하게 마쳤습니다! 정성스러운 후기 감사합니다.`, 'reward', missionId);
        }
      }

      return {
        ...prev,
        visitMissionProgress: updatedProgress,
        courses: updatedCourses
      };
    });
  };

  const addNotification = (
    title: string, 
    message: string, 
    type: AppNotification['type'] = 'info', 
    missionId?: string,
    targetTab?: AppNotification['targetTab'],
    targetSubTab?: string
  ) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      missionId,
      targetTab,
      targetSubTab
    };
    setNotifications(prev => [...prev, newNotif]);
  };

  const handleReadNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAddPoints = async (amount: number) => {
    if (!user) return;
    if (isGuestMode || !firebaseUser) {
      setUser(prev => prev ? { ...prev, points: prev.points + amount } : prev);
      return;
    }
    try {
      await authService.addPoints(firebaseUser.uid, amount);
    } catch (error) {
      console.error("Failed to add points:", error);
    }
  };

  const handleActionNotification = (notif: AppNotification) => {
    setPreviousTab(activeTab);

    if (notif.missionId) {
      setActiveTab('activity');
      setActivitySubTab('missions');
    } else if (notif.targetTab) {
      setActiveTab(notif.targetTab);
      if (notif.targetSubTab) {
        setActivitySubTab(notif.targetSubTab);
      } else if (notif.targetTab === 'activity') {
        setActivitySubTab(null);
      }
    } else if (notif.type === 'mission' || notif.type === 'location') {
      setActiveTab('activity');
      setActivitySubTab('missions');
    } else if (notif.type === 'reward') {
      setActiveTab('profile');
    } else {
      setActiveTab('tree');
    }
    setIsNotificationOpen(false);
  };

  useEffect(() => {
    if (!user || (!firebaseUser && !isGuestMode)) return;

    const storedFarmIds = new Set(user.storedFarmIds || []);
    const queuedNotifications: QueuedNotification[] = [];
    let hasGrowthUpdate = false;

    const updatedTrees = user.trees.map((tree) => {
      if (storedFarmIds.has(tree.farmId) || tree.growthStage === '시즌종료') return tree;

      const targetDay = Math.min(30, Math.max(1, daysSince(tree.plantedAt) + 1));
      if (targetDay <= tree.currentDay) return tree;

      let nextTree = { ...tree };
      while (nextTree.growthStage !== '시즌종료' && nextTree.currentDay < targetDay) {
        const result = advanceTreeOneDay(nextTree);
        nextTree = result.tree;
        queuedNotifications.push(...result.notifications);
      }

      hasGrowthUpdate = true;
      return nextTree;
    });

    if (!hasGrowthUpdate) return;

    const newHarvests = updatedTrees.reduce((acc, tree, index) => {
      if (tree.growthStage === '시즌종료' && user.trees[index].growthStage !== '시즌종료') {
        return acc + (tree.harvestedApples || 0);
      }
      return acc;
    }, 0);

    const harvestedApplesTotal = (user.accumulatedApples ?? 0) + newHarvests;
    const currentAppleBalance = (user.apples ?? 0) + newHarvests;
    const newClaimedMilestones = [...(user.claimedMilestones || [])];
    const updatedItems = [...(user.items || [])];

    const giveItem = (id: ItemId, count: number = 1) => {
      const idx = updatedItems.findIndex(item => item.id === id);
      if (idx !== -1) updatedItems[idx].count += count;
      else updatedItems.push({ id, count });
    };

    if (!newClaimedMilestones.includes(10) && harvestedApplesTotal >= 10) {
      queuedNotifications.push({
        title: '🍎 첫 수확 축하!',
        message: '누적 사과 10개를 달성했어요. 100개를 모으면 실물 사과 1kg 배송 신청이 열려요.',
        type: 'reward',
      });
      newClaimedMilestones.push(10);
    }
    if (!newClaimedMilestones.includes(30) && harvestedApplesTotal >= 30) {
      queuedNotifications.push({
        title: '🎖️ 마일스톤 달성!',
        message: '누적 사과 30개 달성! 보상으로 영양제가 지급되었습니다.',
        type: 'reward',
      });
      giveItem('nutrient', 2);
      newClaimedMilestones.push(30);
    }
    if (!newClaimedMilestones.includes(60) && harvestedApplesTotal >= 60) {
      queuedNotifications.push({
        title: '🎖️ 마일스톤 달성!',
        message: '누적 사과 60개 달성! 폭염 방풍막과 약을 획득했습니다.',
        type: 'reward',
      });
      giveItem('shield', 1);
      giveItem('medicine', 1);
      newClaimedMilestones.push(60);
    }
    if (!newClaimedMilestones.includes(100) && harvestedApplesTotal >= 100) {
      queuedNotifications.push({
        title: '🎁 실물 사과 1kg 배송 가능',
        message: '축하합니다! 누적 사과 100개 달성으로 실물 사과 1kg 배송 신청이 열렸어요.',
        type: 'reward',
      });
      newClaimedMilestones.push(100);
    }
    if (!newClaimedMilestones.includes(200) && harvestedApplesTotal >= 200) {
      queuedNotifications.push({
        title: '🎁 실물 사과 2kg 배송 가능',
        message: '대단해요! 누적 사과 200개 달성으로 실물 사과 2kg 배송 신청이 열렸어요.',
        type: 'reward',
      });
      giveItem('fertilizer', 1);
      newClaimedMilestones.push(200);
    }

    if (newHarvests > 0) {
      queuedNotifications.push({
        title: '🍎 수확 성공',
        message: `${newHarvests}개의 사과가 누적되었습니다!`,
        type: 'reward',
        targetTab: 'profile',
      });
      if (harvestedApplesTotal >= HARVEST_DELIVERY_MIN_APPLES) {
        queuedNotifications.push({
          title: '📦 배송 신청 가능',
          message: '누적 사과 100개를 달성해 실물 사과 배송 신청을 할 수 있어요.',
          type: 'reward',
          targetTab: 'profile',
        });
        window.setTimeout(() => setIsHarvestModalOpen(true), 0);
      }
    }

    setUser({
      ...user,
      trees: updatedTrees,
      accumulatedApples: harvestedApplesTotal,
      apples: currentAppleBalance,
      claimedMilestones: newClaimedMilestones,
      items: updatedItems,
    });

    queuedNotifications.forEach(notification => {
      addNotification(notification.title, notification.message, notification.type, undefined, notification.targetTab);
    });
  }, [firebaseUser, isGuestMode, user]);

  const handleAdoptTree = (farm: Farm, variety: AppleVariety, nickname: string, personality: string) => {
    if (!user) return;
    const treeNickname = nickname.trim();

    if (!(user.adoptedFarmIds || []).includes(farm.id)) {
      showAlert('아직 열리지 않은 농가에는 씨앗을 심을 수 없어요.\n현재 열린 농가에서 나무 3그루를 먼저 키워주세요.', '🔒', 'warning');
      return;
    }

    if (!treeNickname) {
      showAlert('나무 이름을 먼저 입력해주세요.\n이름을 지어야 씨앗 심기를 완료할 수 있어요.', '🌱', 'warning');
      return;
    }
    const seedId = `seed_${farm.id}`;
    const hasSeed = user.items.some(i => i.id === seedId);

    if (!hasSeed) {
      showAlert('농장 씨앗이 필요합니다!\n상점에서 씨앗을 구매해보세요.', '🌱', 'warning');
      return;
    }

    const newTree: TreeState = {
      id: Math.random().toString(36).substr(2, 9),
      farmId: farm.id,
      variety,
      nickname: treeNickname,
      currentDay: 1,
      growthRate: 0,
      health: 100,
      water: 50,
      nutrientsUsed: 0,
      pestStatus: 'none',
      shieldActive: false,
      growthStage: '발아기',
      plantedAt: new Date().toISOString(),
      lastWatered: '',
      lastWateredDay: undefined,
      personality,
      isGolden: Math.random() < 0.05,
      cardConfig: createRandomTreeCardConfig(),
    };

    setUser(prev => {
      if (!prev) return prev;
      // Consume the seed
      const updatedItems = prev.items.map(item => 
        item.id === seedId ? { ...item, count: item.count - 1 } : item
      ).filter(item => item.count > 0);

      // Farm expansion logic
      const treesInCurrentFarm = prev.trees.filter(t => t.farmId === farm.id);
      let updatedAdopted = [...(prev.adoptedFarmIds || [])];
      if (!updatedAdopted.includes(farm.id)) {
        updatedAdopted.push(farm.id);
      }

      // Check for unlocking next farm
      const currentFarmIdx = FARMS.findIndex(f => f.id === farm.id);
      if (treesInCurrentFarm.length + 1 >= 3 && currentFarmIdx !== -1 && currentFarmIdx < FARMS.length - 1) {
        const nextFarmId = FARMS[currentFarmIdx + 1].id;
        if (!updatedAdopted.includes(nextFarmId)) {
          updatedAdopted.push(nextFarmId);
          addNotification("🚜 새로운 농가 오픈!", `${FARMS[currentFarmIdx + 1].name}에서 사과나무를 키울 수 있게 되었습니다!`, 'info');
        }
      }

      return {
        ...prev,
        items: updatedItems,
        trees: [...prev.trees, newTree],
        adoptedFarmIds: updatedAdopted,
      };
    });
    setActiveTab('tree');
  };

  const handleDeleteTree = async (treeId: string) => {
    if (!user) return;
    const confirmed = await showConfirm({
      message: '정말로 이 사과나무를 제거하시겠습니까?\n제거 후에도 바로 새 씨앗을 심을 수 있어요.',
      emoji: '🪓',
      type: 'warning',
      confirmText: '제거하기',
      cancelText: '취소',
    });
    if (!confirmed) return;

    setUser(prev => {
      if (!prev) return prev;
      addNotification("🪓 나무 제거 완료", "나무를 제거했습니다. 바로 새 씨앗을 심을 수 있어요.", 'info');

      return {
        ...prev,
        trees: prev.trees.filter(t => t.id !== treeId),
      };
    });
  };

  const handleTreeAction = (action: 'water' | 'nutrient' | 'medicine' | 'shield') => {
    if (!user || user.trees.length === 0) return;

    setUser(prev => {
      if (!prev) return prev;
      const updatedTrees = [...prev.trees];
      const activeTreeIndex = updatedTrees.findIndex(tree => tree.growthStage !== '시즌종료');
      const treeIndex = activeTreeIndex === -1 ? 0 : activeTreeIndex;
      const tree = { ...updatedTrees[treeIndex] };
      if (tree.growthStage === '시즌종료') {
        showAlert('이번 시즌은 이미 수확이 끝났어요.\n땅 정리 후 다음 시즌을 시작해주세요.', '🍎', 'info');
        return prev;
      }
      const updatedItems = [...prev.items];

      if (action === 'water') {
        if (tree.lastWateredDay === tree.currentDay) {
          showAlert(`오늘 물주기 완료!\nDay ${tree.currentDay}에는 이미 물을 줬어요. 내일 다시 물 줄 수 있어요.`, '💧', 'info');
          return prev;
        }
        tree.water = Math.min(100, tree.water + 20);
        tree.lastWatered = new Date().toISOString();
        tree.lastWateredDay = tree.currentDay;
        addNotification("💧 오늘 물주기 완료", `${tree.nickname}이 시원해합니다. 내일 다시 물을 줄 수 있어요.`, 'info');
      } else if (action === 'nutrient') {
        const itemIdx = updatedItems.findIndex(i => i.id === 'nutrient');
        if (itemIdx === -1 || updatedItems[itemIdx].count <= 0) {
          showAlert('영양제가 부족해요!\n상점에서 구매할 수 있어요.', '🌿', 'warning');
          return prev;
        }
        if (tree.nutrientsUsed >= 2) {
          showAlert('이번 시즌 영양제는 최대 2회예요.\n다음 시즌을 기다려주세요!', '🌿', 'info');
          return prev;
        }
        tree.growthRate = Math.min(100, tree.growthRate + 10);
        tree.nutrientsUsed += 1;
        updatedItems[itemIdx].count -= 1;
        addNotification("✨ 영양제 사용", "나무가 씩씩하게 자라납니다! (+10%)", 'info');
      } else if (action === 'medicine') {
        const itemIdx = updatedItems.findIndex(i => i.id === 'medicine');
        if (itemIdx === -1 || updatedItems[itemIdx].count <= 0) {
          showAlert('치료약이 부족해요!\n상점에서 구매할 수 있어요.', '💊', 'warning');
          return prev;
        }
        if (tree.pestStatus === 'none') {
          showAlert('지금은 병충해가 없어요!\n나무가 건강한 상태예요 🌳', '✅', 'success');
          return prev;
        }
        tree.pestStatus = 'none';
        updatedItems[itemIdx].count -= 1;
        addNotification("💊 치료 완료", "병충해를 깨끗하게 치료했습니다!", 'info');
      } else if (action === 'shield') {
        const itemIdx = updatedItems.findIndex(i => i.id === 'shield');
        if (itemIdx === -1 || updatedItems[itemIdx].count <= 0) {
          showAlert('방풍막이 부족해요!\n상점에서 구매할 수 있어요.', '🛡️', 'warning');
          return prev;
        }
        tree.shieldActive = true;
        updatedItems[itemIdx].count -= 1;
        addNotification("🛡️ 방풍막 설치", "이상 기후로부터 나무를 보호합니다.", 'info');
      }

      updatedTrees[treeIndex] = tree;
      return { ...prev, trees: updatedTrees, items: updatedItems.filter(i => i.count >= 0) };
    });
  };

  const handleBuyItem = (itemId: string, price: number): boolean => {
    if (!user) return false;
    if (itemId.startsWith('seed_')) {
      const farmId = itemId.replace(/^seed_/, '');
      if (!(user.adoptedFarmIds || []).includes(farmId)) {
        showAlert('아직 열리지 않은 농가의 씨앗은 구매할 수 없어요.\n열린 농가에 나무 3그루를 심으면 다음 농가가 열립니다.', '🔒', 'warning');
        return false;
      }
    }
    if (user.points < price) {
      showAlert('보유한 포인트가 부족해요.\n미션을 완료해서 포인트를 모아보세요.', '🪙', 'warning');
      return false;
    }
    const updatedItems = user.items.map(i => i.id === itemId ? { ...i, count: i.count + 1 } : i);
    if (!user.items.find(i => i.id === itemId)) updatedItems.push({ id: itemId, count: 1 });
    const newUser = { ...user, points: user.points - price, items: updatedItems };
    setUser(newUser);
    // 구매는 즉시 저장 — debounce 중 Firebase 스냅샷이 덮어쓰는 걸 방지
    if (firebaseUser && !isGuestMode) {
      authService.saveProfile(firebaseUser.uid, newUser).catch(console.error);
    }
    addNotification("🛍️ 구매 완료!", "아이템이 가방에 추가되었습니다.", 'info');
    return true;
  };

  const handleBuyWithApples = (itemId: string, applePrice: number): boolean => {
    if (!user) return false;
    if (itemId.startsWith('seed_')) {
      const farmId = itemId.replace(/^seed_/, '');
      if (!(user.adoptedFarmIds || []).includes(farmId)) {
        showAlert('아직 열리지 않은 농가의 씨앗은 구매할 수 없어요.\n열린 농가에 나무 3그루를 심으면 다음 농가가 열립니다.', '🔒', 'warning');
        return false;
      }
    }
    if (user.apples < applePrice) {
      showAlert('보유한 사과가 부족해요!\n나무를 키워 사과를 수확해보세요.', '🍎', 'warning');
      return false;
    }
    const updatedItems = [...user.items];
    const idx = updatedItems.findIndex(i => i.id === itemId);
    if (idx !== -1) updatedItems[idx] = { ...updatedItems[idx], count: updatedItems[idx].count + 1 };
    else updatedItems.push({ id: itemId, count: 1 });
    const newUser = { ...user, apples: user.apples - applePrice, items: updatedItems };
    setUser(newUser);
    // 구매는 즉시 저장
    if (firebaseUser && !isGuestMode) {
      authService.saveProfile(firebaseUser.uid, newUser).catch(console.error);
    }
    addNotification("🛍️ 구매 완료!", "사과로 아이템을 교환했습니다.", 'info');
    return true;
  };

  const handlePlantSeedFromStore = (seedId?: string) => {
    if (!user) return;
    const preferredSeedId = storeSeedFarmId ? `seed_${storeSeedFarmId}` : null;
    const hasPreferredSeed = preferredSeedId
      ? user.items.some(item => item.id === preferredSeedId && item.count > 0)
      : false;

    const targetSeedId = seedId?.startsWith('seed_')
      ? seedId
      : hasPreferredSeed
        ? preferredSeedId
      : user.items.find(item => item.id.startsWith('seed_') && item.count > 0)?.id;

    if (!targetSeedId) {
      showAlert('심을 수 있는 씨앗이 없어요.\n상점에서 농가 씨앗을 먼저 구매해주세요.', '🌱', 'warning');
      return;
    }

    const farmId = targetSeedId.replace(/^seed_/, '');
    const targetFarm = FARMS.find(farm => farm.id === farmId);

    if (!targetFarm) {
      showAlert('씨앗과 연결된 농가를 찾지 못했어요.\n다른 씨앗을 선택해주세요.', '🌱', 'warning');
      return;
    }

    if (!(user.adoptedFarmIds || []).includes(farmId)) {
      showAlert('아직 열리지 않은 농가 씨앗은 심을 수 없어요.\n현재 열린 농가에 나무 3그루를 심으면 다음 농가가 열립니다.', '🔒', 'warning');
      return;
    }

    setRequestedSeedFarmId(farmId);
    setStoreSeedFarmId(null);
    setPreviousTab('store');
    setActiveTab('map');
  };

  const handleSaveMissionReview = (missionReview: MissionReview) => {
    setUser(prev => {
      if (!prev) return prev;

      const currentReviews = prev.missionReviews || [];
      const existingIndex = currentReviews.findIndex(item => item.missionId === missionReview.missionId);
      const nextReviews = existingIndex === -1
        ? [missionReview, ...currentReviews]
        : currentReviews.map((item, index) => index === existingIndex ? { ...item, ...missionReview } : item);

      const place = PLACES.find(item => item.id === missionReview.placeId);
      const currentHistory = prev.visitedHistory || [];
      const alreadyVisited = currentHistory.some(item => item.placeId === missionReview.placeId);
      const nextHistory = alreadyVisited || !place
        ? currentHistory
        : [
            {
              placeId: place.id,
              date: new Date(missionReview.updatedAt).toLocaleDateString('ko-KR'),
              name: place.name,
              category: place.category,
            },
            ...currentHistory,
          ];

      return {
        ...prev,
        missionReviews: nextReviews,
        visitedHistory: nextHistory,
      };
    });
  };

  const handleOpenHarvestModal = () => {
    if (!user) return;

    if (isGuestMode || user.isGuest) {
      showAlert(
        '게스트 체험에서는 실물 사과 배송 신청을 할 수 없어요.\n실제 배송 신청은 Google 로그인 후 이용해주세요.',
        '📦',
        'info',
      );
      return;
    }

    if ((user.accumulatedApples ?? 0) < HARVEST_DELIVERY_MIN_APPLES) {
      showAlert(
        `누적 사과 ${HARVEST_DELIVERY_MIN_APPLES}개가 되어야 실물 사과 1kg 배송 신청이 열려요.\n현재 누적 사과는 ${(user.accumulatedApples ?? 0).toLocaleString()}개예요.`,
        '🍎',
        'warning',
      );
      return;
    }

    setIsHarvestModalOpen(true);
  };

  const handleDeliverySubmit = (data: DeliveryInfo) => {
    const selectedReward = getHarvestDeliveryRewardById(data.selectedOptionId);

    if (!selectedReward) {
      showAlert('선택한 배송 보상을 확인할 수 없어요. 다시 선택해주세요.', '📦', 'warning');
      return;
    }

    if (!user || (user.accumulatedApples ?? 0) < selectedReward.applesNeeded) {
      showAlert(
        `누적 사과 ${selectedReward.applesNeeded}개가 되어야 ${selectedReward.title}을 신청할 수 있어요.`,
        '🍎',
        'warning',
      );
      return;
    }

    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        deliveryRequests: [...prev.deliveryRequests, data]
      };
    });
    setIsHarvestModalOpen(false);
    addNotification('📦 배송 신청 완료', `${selectedReward.title} 신청이 완료됐어요.`, 'reward');
  };

  const handleUnstoreFarm = (farmId: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const activeFarms = (prev.adoptedFarmIds || []).filter(id => !(prev.storedFarmIds || []).includes(id));
      if (activeFarms.length >= 3) {
        showAlert('동시에 최대 3개의 농가만 활성화할 수 있어요.\n다른 농가를 먼저 보관해주세요.', '🚜', 'warning');
        return prev;
      }
      return {
        ...prev,
        storedFarmIds: (prev.storedFarmIds || []).filter(id => id !== farmId)
      };
    });
    addNotification("🚜 농가 활성화", "보관되었던 농가를 다시 활성화했습니다.", 'info');
  };

  const handleStoreFarm = (farmId: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const treesInFarm = prev.trees.filter(t => t.farmId === farmId);
      // Requirement: can store if 5 trees completed? or just any time? 
      // Spec says "농가 내 나무 5개 생성 완료 시 보관 가능 상태로 변경" (FARM05_STORE01)
      if (treesInFarm.length < 5) {
        showAlert('나무 5개를 모두 심어야\n농가를 보관할 수 있어요.', '🌳', 'info');
        return prev;
      }
      if ((prev.storedFarmIds || []).includes(farmId)) return prev;
      return {
        ...prev,
        storedFarmIds: [...(prev.storedFarmIds || []), farmId]
      };
    });
    addNotification("📦 농가 보관 완료", "해당 농가의 성장이 일시 정지되었습니다.", 'info');
  };

  const handleDeductLife = () => {
    setUser(prev => prev ? { ...prev, lives: Math.max(0, prev.lives - 1) } : prev);
  };

  const handleRestoreLife = (amount: number = 1) => {
    setUser(prev => prev ? { ...prev, lives: Math.min(MINI_GAME_MAX_LIVES, prev.lives + amount) } : prev);
  };

  // Daily Heart Recharge & Inactivity Reminder
  useEffect(() => {
    if (!user || (!firebaseUser && !isGuestMode)) return;

    const sessionId = isGuestMode ? 'guest' : firebaseUser!.uid;
    const rechargeKey = `last_heart_recharge_${sessionId}`;
    const legacyRecharge = localStorage.getItem('last_heart_recharge');
    const savedRecharge = localStorage.getItem(rechargeKey);
    const savedAt = Number(savedRecharge);
    const legacyAt = legacyRecharge
      ? Number.isFinite(Number(legacyRecharge))
        ? Number(legacyRecharge)
        : new Date(legacyRecharge).getTime()
      : 0;
    let lastRechargeAt = Number.isFinite(savedAt) && savedAt > 0 ? savedAt : legacyAt;
    const now = Date.now();
    let rechargeTimer: number | undefined;

    if (!lastRechargeAt || !Number.isFinite(lastRechargeAt)) {
      lastRechargeAt = now;
      localStorage.setItem(rechargeKey, String(now));
    }

    const elapsedSinceRecharge = now - lastRechargeAt;
    if (elapsedSinceRecharge >= HEART_RECHARGE_INTERVAL_MS) {
      setUser(prev => prev ? { ...prev, lives: MINI_GAME_MAX_LIVES } : prev);
      localStorage.setItem(rechargeKey, String(now));
    } else {
      rechargeTimer = window.setTimeout(() => {
        setUser(prev => prev ? { ...prev, lives: MINI_GAME_MAX_LIVES } : prev);
        localStorage.setItem(rechargeKey, String(Date.now()));
      }, HEART_RECHARGE_INTERVAL_MS - elapsedSinceRecharge);
    }

    const lastVisit = localStorage.getItem('last_visit_timestamp');
    if (lastVisit) {
      const diffHours = (now - parseInt(lastVisit)) / (1000 * 60 * 60);
      if (diffHours > 24) {
        addNotification(
          "🍎 사과나무가 보고 싶어해요!",
          "오랜만에 들르셨네요! 주인님을 기다리는 사과나무에게 물을 주러 가볼까요?",
          'info',
          undefined,
          'tree',
        );
      }
    }
    localStorage.setItem('last_visit_timestamp', now.toString());

    return () => {
      if (rechargeTimer !== undefined) window.clearTimeout(rechargeTimer);
    };
  }, [firebaseUser?.uid, isGuestMode, Boolean(user)]);

  const handleUpdateConversations = (conversations: ChatConversation[]) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, chatConversations: conversations } : null);
  };

  const handleClaimLinkMission = (id: string, points: number) => {
    setUser(prev => {
      if (!prev || prev.claimedLinkMissions?.includes(id)) return prev;
      return {
        ...prev,
        claimedLinkMissions: [...(prev.claimedLinkMissions || []), id],
        points: prev.points + points,
      };
    });
  };

  const handleDeleteAccount = async () => {
    if (isGuestMode) {
      showAlert('게스트 체험에는 삭제할 계정이 없어요.\n로그아웃하면 체험 데이터가 초기화됩니다.', '🌱', 'info');
      return;
    }

    if (!firebaseUser) {
      showAlert('로그인 정보를 확인할 수 없어요.\n다시 로그인한 뒤 시도해주세요.', '⚠️', 'warning');
      return;
    }

    deletionPendingRef.current = true;
    try {
      await authService.deleteAccount(firebaseUser);
      // Alert shown via onAuthStateChange when Firebase fires the sign-out event
    } catch (error: any) {
      deletionPendingRef.current = false;
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      if (code === 'auth/popup-blocked') {
        showAlert('팝업이 차단되었어요.\n브라우저 팝업 차단을 해제한 후 다시 시도해주세요.', '🔒', 'warning');
        return;
      }
      if (code === 'auth/requires-recent-login') {
        showAlert('보안을 위해 재로그인이 필요해요.\n로그아웃 후 다시 로그인한 다음 시도해주세요.', '🔐', 'warning');
        return;
      }
      showAlert('회원 탈퇴 중 문제가 발생했어요.\n잠시 후 다시 시도해주세요.', '⚠️', 'warning');
      console.error('[deleteAccount]', error);
    }
  };

  const handleAIAction = (name: string, args: any) => {
    if (name === 'manage_travel_course') {
      const { action, courseName, items, sourceChatId } = args;
      setUser(prev => {
        if (!prev) return prev;
        let updatedCourses = [...(prev.courses || [])];
        let newActiveId = activeCourseId;
        
        if (action === 'create') {
          const newCourse: Course = {
            id: 'c' + Date.now(),
            name: courseName || '영주 AI 추천 코스',
            items: (items || []).map((it: any, idx: number) => ({ ...it, order: idx, status: 'pending' })),
            createdAt: new Date().toISOString(),
            theme: 'AI 추천',
            sourceChatId,
          };
          updatedCourses.push(newCourse);
          newActiveId = newCourse.id;
          setActiveCourseId(newActiveId);
        } else if (action === 'add_item') {
          const activeIdx = updatedCourses.findIndex(c => c.id === activeCourseId);
          if (activeIdx !== -1) {
            const baseOrder = updatedCourses[activeIdx].items.length;
            updatedCourses[activeIdx].items = [
              ...updatedCourses[activeIdx].items,
              ...(items || []).map((it: any, idx: number) => ({ ...it, order: baseOrder + idx, status: 'pending' }))
            ];
          }
        } else if (action === 'remove_item' && activeCourseId) {
          const activeIdx = updatedCourses.findIndex(c => c.id === activeCourseId);
          if (activeIdx !== -1) {
            const placeIdsToRemove = (items || []).map((it: any) => it.placeId);
            updatedCourses[activeIdx].items = updatedCourses[activeIdx].items
              .filter(it => !placeIdsToRemove.includes(it.placeId));
          }
        } else if (action === 'clear' && activeCourseId) {
           const activeIdx = updatedCourses.findIndex(c => c.id === activeCourseId);
           if (activeIdx !== -1) {
             updatedCourses[activeIdx].items = [];
           }
        } else if (action === 'update' && activeCourseId) {
          const activeIdx = updatedCourses.findIndex(c => c.id === activeCourseId);
          if (activeIdx !== -1) {
            updatedCourses[activeIdx].items = items || [];
          }
        }

        return { ...prev, courses: updatedCourses };
      });
      
      addNotification(
        "🤖 AI 코스 매니저",
        action === 'create' ? "영주 톡톡이 당신을 위한 새로운 여행 코스를 설계했습니다!" : "여행 코스가 업데이트되었습니다.",
        'info',
        undefined,
        'activity',
        'course'
      );
    }
  };

  const handleNavigate = (tab: string, subTab?: string) => {
    setPreviousTab(activeTab);
    setActiveTab(tab as any);
    if (tab === 'activity' && subTab) {
      setActivitySubTab(subTab);
    }
  };

  const handleToggleFavoritePlace = (placeId: string) => {
    if (!user) return;
    const place = PLACES.find(item => item.id === placeId);
    const current = user.favoritePlaceIds || [];
    const isFavorite = current.includes(placeId);
    const nextFavoritePlaceIds = isFavorite
      ? current.filter(id => id !== placeId)
      : [...current, placeId];

    setUser(prev => prev ? {
      ...prev,
      favoritePlaceIds: nextFavoritePlaceIds,
    } : prev);

    addNotification(
      isFavorite ? '찜 해제' : '찜 완료',
      place ? `${place.name}${isFavorite ? '을(를) 찜 목록에서 뺐어요.' : '을(를) 코스 추천에 반영할게요.'}` : '찜 목록이 업데이트됐어요.',
      'info',
      undefined,
      'activity',
      'course',
    );
  };

  const handleRestartSeason = (useFertilizer: boolean) => {
    if (!user || user.trees.length === 0) return;

    setUser(prev => {
      if (!prev) return prev;

      const updatedItems = [...(prev.items || [])];
      const fertilizerIndex = updatedItems.findIndex(item => item.id === 'fertilizer');
      const canUseFertilizer = useFertilizer && fertilizerIndex !== -1 && updatedItems[fertilizerIndex].count > 0;

      if (useFertilizer && !canUseFertilizer) {
        showAlert('보유한 영주 한우비료가 없어요.\n상점이나 보상으로 획득한 뒤 사용할 수 있어요.', '🌾', 'warning');
        return prev;
      }

      if (canUseFertilizer) {
        updatedItems[fertilizerIndex] = {
          ...updatedItems[fertilizerIndex],
          count: updatedItems[fertilizerIndex].count - 1,
        };
      }

      const targetTreeIndex = prev.trees.findIndex(tree => tree.growthStage === '시즌종료');
      if (targetTreeIndex === -1) return prev;

      const updatedTrees = prev.trees.map((tree, index) => {
        if (index !== targetTreeIndex) return tree;
        if (tree.growthStage !== '시즌종료') return tree;

        const restartedTree: TreeState = {
          ...tree,
          currentDay: 1,
          growthRate: canUseFertilizer ? 10 : 0,
          health: 100,
          water: 50,
          lastWatered: '',
          lastWateredDay: undefined,
          nutrientsUsed: 0,
          pestStatus: 'none',
          shieldActive: false,
          growthStage: '발아기',
          plantedAt: new Date().toISOString(),
          harvestedApples: undefined,
        };

        return restartedTree;
      });

      addNotification(
        '🌱 다음 시즌 시작',
        canUseFertilizer
          ? '영주 한우비료 보너스로 성장률 10%부터 새 시즌을 시작했습니다.'
          : '땅 정리를 마치고 새 30일 성장 시즌을 시작했습니다.',
        'info',
        undefined,
        'tree',
      );

      return {
        ...prev,
        trees: updatedTrees,
        items: updatedItems.filter(item => item.count > 0),
      };
    });
  };

  const handleCloseGameIntro = () => {
    setUser(prev => prev ? { ...prev, onboardingSeen: true } : prev);
  };

  const handleStartPlantingTutorial = () => {
    setUser(prev => prev ? { ...prev, onboardingSeen: true } : prev);
    setPreviousTab('tree');
    setRequestedSeedFarmId(null);
    setStoreSeedFarmId(null);
    setActiveTab('map');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-apple-red/30 border-t-apple-red rounded-full animate-spin" />
      </div>
    );
  }

  if (guestRolePending && !firebaseUser && !isGuestMode) {
    return (
      <>
        <RoleSelectionView
          userName="게스트"
          isGuest
          onSelect={handleGuestRoleSelect}
          onExit={handleExitGuestRoleSelection}
        />
        <AlertModal
          open={!!alertState}
          message={alertState?.message ?? ''}
          emoji={alertState?.emoji ?? '🍎'}
          type={alertState?.type ?? 'info'}
          onClose={() => setAlertState(null)}
        />
        <ConfirmModal />
      </>
    );
  }

  if (!firebaseUser && !isGuestMode) {
    return (
      <>
        <LoginView onLoginSuccess={() => {}} onGuestStart={handleGuestStart} />
        <AlertModal
          open={!!alertState}
          message={alertState?.message ?? ''}
          emoji={alertState?.emoji ?? '🍎'}
          type={alertState?.type ?? 'info'}
          onClose={() => setAlertState(null)}
        />
        <ConfirmModal />
      </>
    );
  }

  if (!isGuestMode && profilePending) {
    return <RoleSelectionView userName={firebaseUser?.displayName || '영주친구'} onSelect={handleRoleSelect} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-apple-red/30 border-t-apple-red rounded-full animate-spin" />
      </div>
    );
  }

  const managedTree = user.trees.find(tree => tree.growthStage !== '시즌종료') ?? user.trees[0] ?? null;
  const favoritePlaceNames = (user.favoritePlaceIds || [])
    .map(placeId => PLACES.find(place => place.id === placeId))
    .filter(Boolean)
    .map(place => `${place!.name}(${place!.category})`);

  return (
    <div className="mx-auto h-dvh max-w-md overflow-x-hidden overflow-y-auto overscroll-contain grass-pattern pb-24 relative">
      <Header 
        userName={user.name} 
        points={user.points} 
        lives={user.lives} 
        unreadNotifications={notifications.filter(n => !n.isRead).length}
        onOpenNotifications={() => setIsNotificationOpen(true)}
      />
      <main className="px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'tree' && (
            <motion.div key="tree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {managedTree ? (
                <TreeManagement 
                  tree={managedTree} 
                  onAction={handleTreeAction} 
                  onDeleteTree={() => handleDeleteTree(managedTree.id)}
                  inventory={user.items}
                  accumulatedApples={user.accumulatedApples ?? 0}
                  onGoToStore={() => { setPreviousTab(activeTab); setStoreSeedFarmId(null); setActiveTab('store'); }}
                  onOpenHarvestModal={handleOpenHarvestModal}
                  onPlantNextTree={() => { setPreviousTab('tree'); setActiveTab('map'); }}
                  onViewTreeCards={() => { setProfileRequestedTab('cards'); setPreviousTab('tree'); setActiveTab('profile'); }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl border-4 border-stone-100 text-6xl animate-bounce-gentle">
                    🌱
                  </div>
                  <h2 className="text-2xl font-black mb-2">아직 사과나무가 없어요</h2>
                  <p className="text-stone-500 text-sm font-medium mb-10">영주 농가 지도에서 첫 씨앗을 분양받고<br />30일 성장 퀘스트를 시작해보세요.</p>
                  <button 
                    onClick={() => {
                      setActiveTab('map');
                      setAlertState({
                        message: '지도에서 빨간 테두리로 표시된 농가를 선택해주세요.',
                        emoji: '📍',
                        type: 'info',
                      });
                    }}
                    className="px-10 py-4 bg-apple-red text-white rounded-2xl font-black shadow-[0_6px_0_0_#d32f2f] active:shadow-none active:translate-y-1 transition-all"
                  >
                    농가 지도에서 시작하기
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FarmSelection 
                onAdopt={handleAdoptTree} 
                adoptedFarmIds={user.adoptedFarmIds || []}
                storedFarmIds={user.storedFarmIds || []}
                onStoreFarm={handleStoreFarm}
                onUnstoreFarm={handleUnstoreFarm}
                trees={user.trees}
                ownedItems={user.items}
                onGoToStore={(farmId) => { setPreviousTab(activeTab); setStoreSeedFarmId(farmId ?? null); setActiveTab('store'); }}
                requestedFarmId={requestedSeedFarmId}
                onRequestedFarmHandled={() => setRequestedSeedFarmId(null)}
              />
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ActivityView 
                onAddPoints={handleAddPoints} 
                lives={user.lives} 
                onDeductLife={handleDeductLife} 
                onRestoreLife={handleRestoreLife}
                missionProgress={user.visitMissionProgress}
                onUpdateProgress={handleUpdateMissionProgress}
                missionReviews={user.missionReviews || []}
                onSaveMissionReview={handleSaveMissionReview}
                points={user.points}
                weather={weather}
                conversations={user.chatConversations || []}
                onUpdateConversations={handleUpdateConversations}
                userName={user.name}
                claimedLinkMissions={user.claimedLinkMissions || []}
                onClaimLinkMission={handleClaimLinkMission}
                visitHistory={user.visitedHistory || []}
                favoritePlaceIds={user.favoritePlaceIds || []}
                favoritePlaces={favoritePlaceNames}
                onToggleFavorite={handleToggleFavoritePlace}
                activeCourse={user.courses?.find(c => c.id === activeCourseId) || null}
                onEditCourse={() => setActiveTab('activity')}
                onAIAction={handleAIAction}
                requestedSubTab={activitySubTab}
                onSubTabChange={(tab) => setActivitySubTab(tab)}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {activeTab === 'store' && (
            <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StoreView
                points={user.points}
                apples={user.apples}
                onBuyItem={handleBuyItem}
                onBuyWithApples={handleBuyWithApples}
                onBack={() => { setStoreSeedFarmId(null); setActiveTab(previousTab); }}
                onNavigateToMissions={() => { setStoreSeedFarmId(null); setActiveTab('activity'); setActivitySubTab('missions'); }}
                ownedItems={user.items}
                onPlantSeed={handlePlantSeedFromStore}
                requestedSeedFarmId={storeSeedFarmId}
                unlockedFarmIds={user.adoptedFarmIds || []}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MyPage 
                user={user} 
                setUser={setUser} 
                handleLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
                onOpenHarvestModal={handleOpenHarvestModal}
                onGoToStore={() => { setPreviousTab(activeTab); setStoreSeedFarmId(null); setActiveTab('store'); }}
                requestedTab={profileRequestedTab}
                onRequestedTabHandled={() => setProfileRequestedTab(null)}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminDashboard role={user.role} user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isHarvestModalOpen && (
          <HarvestDeliveryModal 
            onClose={() => setIsHarvestModalOpen(false)}
            onSubmit={handleDeliverySubmit}
            accumulatedApples={user.accumulatedApples}
          />
        )}
      </AnimatePresence>

      <FloatingChatbot 
        points={user.points}
        completedMissions={Object.keys(user.visitMissionProgress).filter(k => user.visitMissionProgress[k] === 'completed')}
        weather={weather}
        conversations={user.chatConversations || []}
        onUpdateConversations={handleUpdateConversations}
        userName={user.name}
        visitHistory={user.visitedHistory || []}
        favoritePlaces={favoritePlaceNames}
        onAction={handleAIAction}
        onNavigate={handleNavigate}
      />

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={user.role === 'farm_owner' || user.role === 'gov_admin'} 
      />

      <NotificationCenter
        notifications={notifications}
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onRead={handleReadNotification}
        onDelete={handleDeleteNotification}
        onAction={handleActionNotification}
      />

      <AlertModal
        open={!!alertState}
        message={alertState?.message ?? ''}
        emoji={alertState?.emoji ?? '🍎'}
        type={alertState?.type ?? 'info'}
        onClose={() => setAlertState(null)}
      />

      <ConfirmModal />

      <AnimatePresence>
        {!user.onboardingSeen && (
          <GameIntroModal onClose={handleCloseGameIntro} onStartPlanting={handleStartPlantingTutorial} />
        )}
      </AnimatePresence>
    </div>
  );
}
