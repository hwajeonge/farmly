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
import { UserProfile, Farm, AppleVariety, TreeState, Decoration, Course, AppNotification, ItemId, ChatConversation, DeliveryInfo } from './types';
import { VISIT_MISSIONS, FARMS, PLACES } from './constants';
import { calculateDailyGrowth, calculateHarvestAmount, getPestEvent, getWeatherEvent, canTransitionToNextSeason, getGrowthStageLabel, getDailyStatusMessage, daysSince } from './services/growthService';
import { FloatingChatbot } from './components/FloatingChatbot';
import { RoleSelectionView } from './components/RoleSelectionView';
import { UserRole } from './types';
import { NotificationCenter } from './components/NotificationCenter';
import { LoginView } from './components/LoginView';
import { authService } from './services/authService';
import { User } from 'firebase/auth';
import { alertEmitter, showAlert, AlertType } from './lib/alertEmitter';
import { AlertModal } from './components/AlertModal';
import { GameIntroModal } from './components/GameIntroModal';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tree');
  const [previousTab, setPreviousTab] = useState('tree');
  const [activitySubTab, setActivitySubTab] = useState<string | null>(null);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [profileRequestedTab, setProfileRequestedTab] = useState<'profile' | 'travel' | 'cards' | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [weather, setWeather] = useState('맑음');

  const [profilePending, setProfilePending] = useState(false);
  const fromFirebase = useRef(false);
  const [alertState, setAlertState] = useState<{ message: string; emoji: string; type: AlertType } | null>(null);

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
        setUser(null);
        setProfilePending(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      setAuthLoading(true);
      const unsubscribeProfile = authService.getUserProfile(firebaseUser.uid, (profile) => {
        if (profile) {
          // Data Migration / Defaulting
          const migProfile = { ...profile };
          if (!migProfile.adoptedFarmIds || migProfile.adoptedFarmIds.length === 0) {
            migProfile.adoptedFarmIds = ['f1'];
          }
          if (!migProfile.storedFarmIds) migProfile.storedFarmIds = [];
          if (!migProfile.claimedMilestones) migProfile.claimedMilestones = [];
          if (!migProfile.items) migProfile.items = [];
          if (!migProfile.badges) migProfile.badges = [];
          if (!migProfile.trees) migProfile.trees = [];
          if (!migProfile.favoritePlaceIds) migProfile.favoritePlaceIds = [];
          if (migProfile.accumulatedApples == null) migProfile.accumulatedApples = 0;
          if (migProfile.apples == null) migProfile.apples = 0;
          if (migProfile.lives == null) migProfile.lives = 5;
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
          setProfilePending(false);
        } else {
          setProfilePending(true);
        }
        setAuthLoading(false);
      });
      return () => unsubscribeProfile();
    }
  }, [firebaseUser]);

  // Auto-save: whenever user state changes locally, persist to Firestore.
  // fromFirebase flag prevents save loops (Firebase update → onSnapshot → setUser → save → loop).
  useEffect(() => {
    if (fromFirebase.current) {
      fromFirebase.current = false;
      return;
    }
    if (!user || !firebaseUser) return;
    const timer = setTimeout(() => {
      authService.saveProfile(firebaseUser.uid, user).catch(console.error);
    }, 800);
    return () => clearTimeout(timer);
  }, [user]);

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

  const handleUpdateMissionProgress = (missionId: string, status: 'none' | 'prepare' | 'arrival' | 'action' | 'completed') => {
    if (!user || !firebaseUser) return;
    const mission = VISIT_MISSIONS.find(m => m.id === missionId);

    setUser(prev => {
      if (!prev) return prev;
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
    if (!firebaseUser) return;
    try {
      await authService.addPoints(firebaseUser.uid, amount);
    } catch (error) {
      console.error("Failed to add points:", error);
    }
  };

  const handleActionNotification = (notif: AppNotification) => {
    if (notif.missionId) {
      setActiveTab('activity');
      setActivitySubTab('missions');
    } else if (notif.targetTab) {
      setActiveTab(notif.targetTab);
      if (notif.targetSubTab) {
        setActivitySubTab(notif.targetSubTab);
      }
    }
    setIsNotificationOpen(false);
  };

  const handleAdoptTree = (farm: Farm, variety: AppleVariety, nickname: string, personality: string) => {
    if (!user || !firebaseUser) return;
    
    // Check for cooldown (3 days)
    const treesInCurrentFarm = user.trees.filter(t => t.farmId === farm.id);
    const slotIdx = treesInCurrentFarm.length;
    const cooldownKey = `${farm.id}_${slotIdx}`;
    
    if (user.slotCooldowns?.[cooldownKey]) {
      const lockedUntil = new Date(user.slotCooldowns[cooldownKey].lockedUntil);
      if (lockedUntil > new Date()) {
        const daysLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        showAlert(`해당 슬롯은 현재 비활성화 상태입니다.\n${daysLeft}일 후에 다시 심을 수 있어요.`, '⏳', 'warning');
        return;
      }
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
      nickname,
      currentDay: 1,
      growthRate: 0,
      health: 100,
      water: 50,
      nutrientsUsed: 0,
      pestStatus: 'none',
      shieldActive: false,
      growthStage: '발아기',
      plantedAt: new Date().toISOString(),
      lastWatered: new Date().toISOString(),
      personality,
      isGolden: Math.random() < 0.05
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

      // Clear cooldown if used
      const updatedCooldowns = { ...(prev.slotCooldowns || {}) };
      delete updatedCooldowns[cooldownKey];

      return {
        ...prev,
        items: updatedItems,
        trees: [...prev.trees, newTree],
        adoptedFarmIds: updatedAdopted,
        slotCooldowns: updatedCooldowns
      };
    });
    setActiveTab('tree');
  };

  const handleDeleteTree = (treeId: string) => {
    if (!user) return;
    if (!window.confirm('정말로 이 사과나무를 제거하시겠습니까? 수확 전에 제거하면 3일간 해당 자리에 사과를 심을 수 없습니다.')) return;

    setUser(prev => {
      if (!prev) return prev;
      const treeToRemove = prev.trees.find(t => t.id === treeId);
      if (!treeToRemove) return prev;

      const farmId = treeToRemove.farmId;
      const treesInFarm = prev.trees.filter(t => t.farmId === farmId);
      const slotIdx = treesInFarm.findIndex(t => t.id === treeId);
      const cooldownKey = `${farmId}_${slotIdx}`;

      const lockedUntil = new Date();
      lockedUntil.setDate(lockedUntil.getDate() + 3);

      const updatedCooldowns = {
        ...(prev.slotCooldowns || {}),
        [cooldownKey]: { farmId, lockedUntil: lockedUntil.toISOString() }
      };

      addNotification("🪓 나무 제거 완료", "나무를 제거했습니다. 해당 자리는 3일간 휴지기를 가집니다.", 'info');

      return {
        ...prev,
        trees: prev.trees.filter(t => t.id !== treeId),
        slotCooldowns: updatedCooldowns
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
        const today = new Date().toDateString();
        if (new Date(tree.lastWatered).toDateString() === today) {
          showAlert('오늘은 이미 물을 주었어요!\n내일 다시 와주세요 🌤️', '💧', 'info');
          return prev;
        }
        tree.water = Math.min(100, tree.water + 20);
        tree.lastWatered = new Date().toISOString();
        addNotification("💧 물주기 완료", `${tree.nickname}이 시원해합니다!`, 'info');
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

  const handleAdvanceDay = () => {
    if (!user || user.trees.length === 0) return;

    setUser(prev => {
      if (!prev) return prev;
      const updatedTrees = prev.trees.map(tree => {
        // Skip stored farms (FARM05_STORE03)
        if ((prev.storedFarmIds || []).includes(tree.farmId)) return tree;
        if (tree.growthStage === '시즌종료') return tree;

        const isWatered = new Date(tree.lastWatered).toDateString() === new Date().toDateString();
        const weatherEvent = getWeatherEvent(tree.currentDay);
        
        // Progress growth rate
        const growth = calculateDailyGrowth(tree, isWatered, weatherEvent ?? undefined);
        let newTree = { ...tree, ...growth };

        // Season Transition Logic (GROW01_COND)
        const currentStage = newTree.growthStage;
        const currentDay = newTree.currentDay;
        
        let canTransition = true;
        if (currentDay >= 7 && currentStage === '발아기') canTransition = canTransitionToNextSeason(newTree);
        if (currentDay >= 14 && currentStage === '개화기') canTransition = canTransitionToNextSeason(newTree);
        if (currentDay >= 23 && (currentStage === '착과기' || currentStage === '착색기')) canTransition = canTransitionToNextSeason(newTree);

        if (canTransition) {
          newTree.currentDay += 1;
          newTree.growthStage = getGrowthStageLabel(newTree.currentDay);
        } else {
          // Delay transition (GROW01_COND04)
          newTree.currentDay += 1; // Increment day but don't change stage
          addNotification("⚠️ 성장 지연", `${newTree.nickname}의 성장이 지연되어 계절 전환이 연기되었습니다. 성장률과 병충해를 확인해주세요.`, 'info');
        }

        // Pest logic (Pass nutrient use info)
        const lastWateredDays = daysSince(tree.lastWatered);
        const pest = getPestEvent(newTree.currentDay, lastWateredDays, newTree.nutrientsUsed > 0);
        if (pest !== 'none' && !newTree.shieldActive && newTree.pestStatus === 'none') {
          newTree.pestStatus = pest;
          addNotification("🚨 병충해 발생!", `${newTree.nickname}에게 병충해가 생겼어요! 빨리 치료해주세요.`, 'info');
        }

        // Notification for weather
        if (weatherEvent) {
          addNotification("☀️ 기상 이벤트", weatherEvent.message, 'info');
          addNotification(`🌳 ${newTree.nickname}의 한마디`, weatherEvent.userMessage, 'info', undefined, 'tree');
        }

        // Harvest logic
        if (newTree.currentDay >= 30) {
          const appleAmount = calculateHarvestAmount(newTree.growthRate, newTree.pestStatus);
          newTree.harvestedApples = appleAmount;
          newTree.growthStage = '시즌종료';
        }

        return newTree;
      });

      // Calculate total shift in harvest
      const newHarvests = updatedTrees.reduce((acc, t, i) => {
        if (t.growthStage === '시즌종료' && prev.trees[i].growthStage !== '시즌종료') {
           return acc + (t.harvestedApples || 0);
        }
        return acc;
      }, 0);

      const harvestedApplesTotal = prev.accumulatedApples + newHarvests;
      const currentAppleBalance = prev.apples + newHarvests;
      
      const newClaimedMilestones = [...(prev.claimedMilestones || [])];
      const updatedItems = [...(prev.items || [])];

      const giveItem = (id: string, count: number = 1) => {
        const idx = updatedItems.findIndex(i => i.id === id);
        if (idx !== -1) updatedItems[idx].count += count;
        else updatedItems.push({ id, count });
      }

      // Milestone logic
      if (!newClaimedMilestones.includes(10) && harvestedApplesTotal >= 10) {
        addNotification("🎖️ 첫 수확 축하!", "사과 10개를 처음으로 수확하여 '실물 사과 1kg 교환권'이 지급되었습니다!", 'reward');
        newClaimedMilestones.push(10);
      }
      if (!newClaimedMilestones.includes(30) && harvestedApplesTotal >= 30) {
        addNotification("🎖️ 마일스톤 달성!", "누적 사과 30개 달성! 보상으로 영양제가 지급되었습니다.", 'reward');
        giveItem('nutrient', 2);
        newClaimedMilestones.push(30);
      }
      if (!newClaimedMilestones.includes(60) && harvestedApplesTotal >= 60) {
        addNotification("🎖️ 마일스톤 달성!", "누적 사과 60개 달성! 폭염 방풍막과 약을 획득했습니다.", 'reward');
        giveItem('shield', 1);
        giveItem('medicine', 1);
        newClaimedMilestones.push(60);
      }
      if (!newClaimedMilestones.includes(100) && harvestedApplesTotal >= 100) {
        addNotification("🎫 실물 사과 교환권!", "축하합니다! 누적 사과 100개 달성으로 '실물 사과 1kg 교환권'이 지급되었습니다!", 'reward');
        newClaimedMilestones.push(100);
      }
      if (!newClaimedMilestones.includes(220) && harvestedApplesTotal >= 220) {
        addNotification("🎫 VIP 사과 교환권!", "대농장주님! 누적 사과 220개 달성으로 '실물 사과 2kg 교환권'이 지급되었습니다.", 'reward');
        giveItem('fertilizer', 1);
        newClaimedMilestones.push(220);
      }

      if (newHarvests > 0) {
        addNotification("🍎 수확 성공", `${newHarvests}개의 사과가 누적되었습니다!`, 'reward', undefined, 'profile');
        if (harvestedApplesTotal >= 10) {
          addNotification("📦 배송 신청 가능", "실물 사과 배송을 신청할 수 있어요. 받을 주소를 입력해 신청을 완료해주세요.", 'reward', undefined, 'profile');
          window.setTimeout(() => setIsHarvestModalOpen(true), 0);
        }
      }

      return {
        ...prev,
        trees: updatedTrees,
        accumulatedApples: harvestedApplesTotal,
        apples: currentAppleBalance,
        claimedMilestones: newClaimedMilestones,
        items: updatedItems
      };
    });
  };

  const handleBuyItem = (itemId: string, price: number): boolean => {
    if (!user || !firebaseUser) return false;
    if (user.points < price) {
      showAlert('보유한 포인트가 부족해요.\n미션을 완료해서 포인트를 모아보세요.', '🪙', 'warning');
      return false;
    }
    const updatedItems = user.items.map(i => i.id === itemId ? { ...i, count: i.count + 1 } : i);
    if (!user.items.find(i => i.id === itemId)) updatedItems.push({ id: itemId, count: 1 });
    const newUser = { ...user, points: user.points - price, items: updatedItems };
    setUser(newUser);
    // 구매는 즉시 저장 — debounce 중 Firebase 스냅샷이 덮어쓰는 걸 방지
    authService.saveProfile(firebaseUser.uid, newUser).catch(console.error);
    addNotification("🛍️ 구매 완료!", "아이템이 가방에 추가되었습니다.", 'info');
    return true;
  };

  const handleBuyWithApples = (itemId: string, applePrice: number): boolean => {
    if (!user || !firebaseUser || user.apples < applePrice) {
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
    authService.saveProfile(firebaseUser.uid, newUser).catch(console.error);
    addNotification("🛍️ 구매 완료!", "사과로 아이템을 교환했습니다.", 'info');
    return true;
  };

  const handleDeliverySubmit = (data: DeliveryInfo) => {
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        deliveryRequests: [...prev.deliveryRequests, data]
      };
    });
    setIsHarvestModalOpen(false);
    addNotification("📦 배송 신청 완료", "영주 사과가 곧 출발합니다!", 'reward');
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
    setUser(prev => prev ? { ...prev, lives: Math.min(10, prev.lives + amount) } : prev);
  };

  // Daily Heart Recharge & Demo Notifs
  useEffect(() => {
    const lastRecharge = localStorage.getItem('last_heart_recharge');
    const today = new Date().toDateString();

    if (lastRecharge !== today) {
      setUser(prev => prev ? { ...prev, lives: 5 } : prev);
      localStorage.setItem('last_heart_recharge', today);
    }
    
    // Proximity demo notification
    const proximityTimer = setTimeout(() => {
      addNotification(
        "📍 근처에 미션이 있습니다!",
        "영주역 근처에 도착하셨네요! '영주역 도착 인증' 미션을 지금 바로 시작해보세요.",
        'location',
        'm1'
      );
    }, 3000);

    // Inactivity & Popular Place Notifications
    const checkEngagementNotifs = () => {
      // 1. Inactivity check
      const lastVisit = localStorage.getItem('last_visit_timestamp');
      const now = Date.now();
      if (lastVisit) {
        const diffHours = (now - parseInt(lastVisit)) / (1000 * 60 * 60);
        if (diffHours > 24) { // Let's say 24 hours
          addNotification(
            "🍎 사과나무가 보고 싶어해요!",
            "오랜만에 들르셨네요! 주인님을 기다리는 사과나무에게 물을 주러 가볼까요?",
            'info'
          );
        }
      }
      localStorage.setItem('last_visit_timestamp', now.toString());

      // 2. Popular place notification (Random pick)
      const popularTimer = setTimeout(() => {
        const places = ['부석사', '무섬마을', '소백산', '선비촌'];
        const randomPlace = places[Math.floor(Math.random() * places.length)];
        addNotification(
          "🔥 지금 영주에서 핫한 곳!",
          `현재 많은 분들이 [${randomPlace}]를 방문 중이에요! 대기 시간이 짧을 때 어서 가보세요.`,
          'location'
        );
      }, 8000);

      return popularTimer;
    };

    const popularTimer = checkEngagementNotifs();

    return () => {
      clearTimeout(proximityTimer);
      clearTimeout(popularTimer);
    };
  }, []);

  const handleAddDecoration = (deco: Decoration) => {
    setDecorations(prev => [...prev, deco]);
  };

  const handleUpdateConversations = (conversations: ChatConversation[]) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, chatConversations: conversations } : null);
  };

  const handleDeleteAccount = async () => {
    if (!firebaseUser) {
      showAlert('로그인 정보를 확인할 수 없어요.\n다시 로그인한 뒤 시도해주세요.', '⚠️', 'warning');
      return;
    }

    try {
      await authService.deleteAccount(firebaseUser);
      setUser(null);
      setFirebaseUser(null);
      setActiveTab('tree');
      showAlert('회원 탈퇴가 완료되었습니다.', '👋', 'success');
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/requires-recent-login') {
        showAlert('보안을 위해 최근 로그인 확인이 필요해요.\n로그아웃 후 다시 로그인한 다음 회원 탈퇴를 진행해주세요.', '🔐', 'warning');
        return;
      }
      showAlert('회원 탈퇴 중 문제가 발생했어요.\n잠시 후 다시 시도해주세요.', '⚠️', 'warning');
      console.error(error);
    }
  };

  const handleAIAction = (name: string, args: any) => {
    if (name === 'manage_travel_course') {
      const { action, courseName, items } = args;
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
            theme: 'AI 추천'
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
          lastWatered: new Date().toISOString(),
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-apple-red/30 border-t-apple-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <LoginView onLoginSuccess={() => {}} />;
  }

  if (profilePending) {
    return <RoleSelectionView userName={firebaseUser.displayName || '영주친구'} onSelect={handleRoleSelect} />;
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
    <div className="min-h-dvh pb-24 max-w-md mx-auto grass-pattern overflow-x-hidden relative">
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
                  onAdvanceDay={handleAdvanceDay}
                  onDeleteTree={() => handleDeleteTree(managedTree.id)}
                  inventory={user.items}
                  onGoToStore={() => { setPreviousTab(activeTab); setActiveTab('store'); }}
                  onOpenHarvestModal={() => setIsHarvestModalOpen(true)}
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
                    onClick={() => setActiveTab('map')}
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
                slotCooldowns={user.slotCooldowns || {}}
                onStoreFarm={handleStoreFarm}
                onUnstoreFarm={handleUnstoreFarm}
                trees={user.trees}
                decorations={decorations}
                onAddDecoration={handleAddDecoration}
                ownedItems={user.items}
                onGoToStore={() => { setPreviousTab(activeTab); setActiveTab('store'); }}
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
                points={user.points}
                weather={weather}
                conversations={user.chatConversations || []}
                onUpdateConversations={handleUpdateConversations}
                userName={user.name}
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
                onBack={() => setActiveTab(previousTab)}
                onNavigateToMissions={() => { setActiveTab('activity'); setActivitySubTab('missions'); }}
                ownedItems={user.items}
                onPlantSeed={() => { setPreviousTab('store'); setActiveTab('map'); }}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MyPage 
                user={user} 
                setUser={setUser} 
                handleLogout={authService.logout}
                onDeleteAccount={handleDeleteAccount}
                onOpenHarvestModal={() => setIsHarvestModalOpen(true)}
                onGoToStore={() => { setPreviousTab(activeTab); setActiveTab('store'); }}
                requestedTab={profileRequestedTab}
                onRequestedTabHandled={() => setProfileRequestedTab(null)}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminDashboard role={user.role} />
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

      <AnimatePresence>
        {!user.onboardingSeen && (
          <GameIntroModal onClose={handleCloseGameIntro} />
        )}
      </AnimatePresence>
    </div>
  );
}
