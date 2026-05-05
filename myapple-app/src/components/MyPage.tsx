import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Apple, Award, Camera, Edit3, Gift, LayoutGrid, List, Loader2, LogOut, MapPin, MessageSquare, Save, ShoppingBag, Sprout, Star, Trash2, X } from 'lucide-react';
import { MissionReview, TreeState, UserProfile, VisitedPlace } from '../types';
import { cn } from '../lib/utils';
import { TreeOwnershipCard } from './TreeOwnershipCard';
import { SERVICE_NAME } from '../brand';
import { showConfirm } from '../lib/confirmEmitter';
import { showAlert } from '../lib/alertEmitter';
import {
  getEligibleHarvestDeliveryRewards,
  getNextHarvestDeliveryReward,
  HARVEST_DELIVERY_MAX_TARGET_APPLES,
  HARVEST_DELIVERY_MIN_APPLES,
  HARVEST_REWARD_MILESTONES,
} from '../rewardRules';

interface MyPageProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  handleLogout: () => void;
  onDeleteAccount: () => Promise<void>;
  onOpenHarvestModal: () => void;
  onGoToStore: () => void;
  requestedTab?: MenuTab | null;
  onRequestedTabHandled?: () => void;
}

type MenuTab = 'profile' | 'travel' | 'reviews' | 'cards';

const MENU_TABS = [
  { id: 'profile', icon: Apple, label: '내 농장' },
  { id: 'travel', icon: MapPin, label: '여행 기록' },
  { id: 'reviews', icon: MessageSquare, label: '후기 관리' },
  { id: 'cards', icon: Sprout, label: '나무 카드' },
] as const;

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const PROFILE_IMAGE_SIZE = 360;

const resizeProfileImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read-failed'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('image-load-failed'));
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = PROFILE_IMAGE_SIZE;
        canvas.height = PROFILE_IMAGE_SIZE;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('canvas-failed'));
          return;
        }

        const cropSize = Math.min(image.width, image.height);
        const sourceX = Math.max(0, (image.width - cropSize) / 2);
        const sourceY = Math.max(0, (image.height - cropSize) / 2);

        context.drawImage(
          image,
          sourceX,
          sourceY,
          cropSize,
          cropSize,
          0,
          0,
          PROFILE_IMAGE_SIZE,
          PROFILE_IMAGE_SIZE,
        );
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

export const MyPage: React.FC<MyPageProps> = ({
  user,
  setUser,
  handleLogout,
  onDeleteAccount,
  onOpenHarvestModal,
  onGoToStore,
  requestedTab,
  onRequestedTabHandled,
}) => {
  const [activeTab, setActiveTab] = useState<MenuTab>('profile');
  const [selectedTree, setSelectedTree] = useState<TreeState | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!requestedTab) return;
    setActiveTab(requestedTab);
    onRequestedTabHandled?.();
  }, [requestedTab, onRequestedTabHandled]);

  const handleDeleteAccountClick = async () => {
    const confirmed = await showConfirm({
      message: '회원 탈퇴 시 나무, 수확 기록,\n배송 신청 내역이 모두 삭제됩니다.\n정말 탈퇴하시겠습니까?',
      emoji: '⚠️',
      type: 'error',
      confirmText: '탈퇴하기',
      cancelText: '취소',
    });
    if (!confirmed) return;

    const finalConfirmed = await showConfirm({
      message: '이 작업은 되돌릴 수 없습니다.\n그래도 회원 탈퇴를 진행할까요?',
      emoji: '🚨',
      type: 'error',
      confirmText: '최종 탈퇴',
      cancelText: '취소',
    });
    if (!finalConfirmed) return;

    setIsDeletingAccount(true);
    try {
      await onDeleteAccount();
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleProfileImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('이미지 파일만 등록할 수 있어요.', '📷', 'warning');
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      showAlert('프로필 이미지는 5MB 이하로 선택해주세요.', '📷', 'warning');
      return;
    }

    setIsUpdatingPhoto(true);
    try {
      const profileImage = await resizeProfileImage(file);
      setUser(prev => prev ? { ...prev, profileImage } : prev);
      showAlert('프로필 사진이 변경되었어요.', '📷', 'success');
    } catch (error) {
      console.error('Failed to update profile image:', error);
      showAlert('사진을 불러오지 못했어요.\n다른 이미지를 선택해주세요.', '📷', 'warning');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  return (
    <div className="pb-24 pt-2">
      <div className="mb-5 flex justify-between px-1">
        <button
          onClick={onGoToStore}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-yellow-100 bg-yellow-50 text-yeoju-gold transition-all active:scale-90"
          aria-label="상점으로 이동"
        >
          <ShoppingBag size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-stone-100 bg-stone-50 text-stone-400 transition-all active:scale-90"
          aria-label="로그아웃"
        >
          <LogOut size={18} />
        </button>
      </div>

      <section className="mb-7 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-stone-100 shadow-xl">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-4xl font-black text-apple-red">{user.name[0]}</span>
            )}
          </div>
          <input
            ref={profileImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageSelect}
          />
          <button
            type="button"
            onClick={() => profileImageInputRef.current?.click()}
            disabled={isUpdatingPhoto}
            className="absolute -bottom-1 -right-1 rounded-xl border-4 border-white bg-stone-800 p-2 text-white shadow-lg transition-transform active:scale-90 disabled:cursor-wait disabled:bg-stone-400"
            aria-label="프로필 사진 변경"
          >
            {isUpdatingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          </button>
        </div>

        <h2 className="mb-1 text-2xl font-black text-stone-800">{user.nickname || user.name}</h2>
        <span className="rounded-full bg-apple-red/10 px-3 py-1 text-[10px] font-black text-apple-red">
          {SERVICE_NAME} Farmer
        </span>
        <div className="mt-2 flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1.5">
          <Apple size={12} className="text-apple-red" />
          <span className="text-xs font-black text-stone-700">
            누적 수확 <span className="text-apple-red">{user.accumulatedApples ?? 0}개</span>
          </span>
        </div>
      </section>

      <div className="mb-7 flex gap-1 rounded-2xl bg-stone-100 p-1.5">
        {MENU_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MenuTab)}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 overflow-hidden rounded-xl py-2.5 transition-all',
                isActive ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400',
              )}
            >
              <Icon size={16} />
              <span className="text-[9px] font-black leading-tight">{tab.label}</span>
              {isActive && <motion.div layoutId="mypage-tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-red" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'profile' && <ProfileView user={user} onOpenHarvestModal={onOpenHarvestModal} />}
          {activeTab === 'travel' && <TravelView history={user.visitedHistory} />}
          {activeTab === 'reviews' && <ReviewsView reviews={user.missionReviews || []} setUser={setUser} />}
          {activeTab === 'cards' && <CardsView trees={user.trees} user={user} onSelect={setSelectedTree} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedTree && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-stone-900/60 p-5 backdrop-blur-md"
            onClick={() => setSelectedTree(null)}
          >
            <motion.div
              className="w-full max-w-[340px]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <TreeOwnershipCard tree={selectedTree} ownerName={user.nickname || user.name} onClose={() => setSelectedTree(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="mt-7 rounded-[1.75rem] border-2 border-red-100 bg-red-50 p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
            <Trash2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-red-700">회원 탈퇴</h3>
            <p className="mt-1 text-[11px] font-bold leading-relaxed text-red-500">
              계정과 저장된 농장 데이터를 삭제합니다. 탈퇴 후에는 복구할 수 없어요.
            </p>
          </div>
        </div>
        <button
          onClick={handleDeleteAccountClick}
          disabled={isDeletingAccount}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-xs font-black text-red-600 shadow-sm transition-all active:scale-[0.98] disabled:cursor-wait disabled:text-red-300"
        >
          {isDeletingAccount ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          {isDeletingAccount ? '탈퇴 처리 중...' : '회원 탈퇴하기'}
        </button>
      </section>
    </div>
  );
};

const ProfileView = ({ user, onOpenHarvestModal }: { user: UserProfile; onOpenHarvestModal: () => void }) => {
  const accumulatedApples = user.accumulatedApples ?? 0;
  const canRequestDelivery = accumulatedApples >= HARVEST_DELIVERY_MIN_APPLES;
  const eligibleDeliveryRewards = getEligibleHarvestDeliveryRewards(accumulatedApples);
  const nextDeliveryReward = getNextHarvestDeliveryReward(accumulatedApples);
  const activeDeliveryLabel = eligibleDeliveryRewards.at(-1)?.title ?? null;

  return (
    <div className="space-y-5">
      <section className="apple-gradient relative overflow-hidden rounded-[2rem] border-4 border-white/20 p-6 text-white shadow-[0_8px_32px_rgba(82,196,138,0.3)]">
        <div className="relative z-10">
          <div className="mb-7 flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md">
              <Award size={22} strokeWidth={2.5} />
            </div>
            <p className="text-right text-[10px] font-black uppercase leading-relaxed tracking-widest opacity-80">
              {SERVICE_NAME}<br />Digital Farmer
            </p>
          </div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest opacity-70">수확 여정</p>
          <h3 className="mb-4 text-2xl font-black tracking-tight">{user.name}</h3>
          <p className="text-[11px] font-bold opacity-85">
            영주 농가의 사과나무를 키우고 관광 미션으로 보상을 모으는 중이에요.
          </p>
        </div>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
      </section>

      <section className="cute-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-700">수확 보상 마일스톤</h3>
          <span className="text-[10px] font-black text-apple-red">
            {accumulatedApples} / {HARVEST_DELIVERY_MAX_TARGET_APPLES}개
          </span>
        </div>
        <div className="progress-track mb-5 h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (accumulatedApples / HARVEST_DELIVERY_MAX_TARGET_APPLES) * 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="progress-gold h-full"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {HARVEST_REWARD_MILESTONES.map((item) => (
            <div key={item.apples} className="text-center">
              <div
                className={cn(
                  'mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-2xl border-2 text-xs font-black',
                  accumulatedApples >= item.apples
                    ? 'border-yellow-300 bg-yeoju-gold text-white shadow-[0_3px_0_0_#b07a00]'
                    : 'border-stone-100 bg-stone-50 text-stone-300',
                )}
              >
                {accumulatedApples >= item.apples ? '✓' : item.apples}
              </div>
              <p className="text-[9px] font-black text-stone-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-stone-800 p-5 text-white">
        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yeoju-gold shadow-lg">
              <Gift size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-black">실물 사과 배송 신청</h3>
              <p className="text-[10px] font-bold opacity-60">100개는 1kg, 200개는 2kg 배송 신청 가능</p>
            </div>
          </div>
          <button
            onClick={onOpenHarvestModal}
            disabled={!canRequestDelivery}
            className="w-full rounded-2xl bg-white py-3.5 text-sm font-black text-stone-800 shadow-xl shadow-black/20 transition-all active:scale-95 disabled:bg-stone-700 disabled:text-stone-500"
          >
            {canRequestDelivery
              ? `${activeDeliveryLabel ?? '수확 보상'} 신청하기`
              : `사과 ${nextDeliveryReward?.applesNeeded ?? HARVEST_DELIVERY_MIN_APPLES}개 수확 후 오픈 (${accumulatedApples}/${nextDeliveryReward?.applesNeeded ?? HARVEST_DELIVERY_MIN_APPLES})`}
          </button>
        </div>
        <Apple className="absolute -bottom-5 -right-5 h-28 w-28 -rotate-12 opacity-[0.07]" />
      </section>
    </div>
  );
};

const TravelView = ({ history }: { history?: VisitedPlace[] }) => {
  const records = history && history.length > 0 ? history : [];

  if (records.length === 0) {
    return (
      <div className="rounded-[2rem] border-2 border-dashed border-stone-200 px-8 py-14 text-center">
        <div className="mb-3 text-4xl">🗺️</div>
        <p className="mb-1 text-sm font-black text-stone-700">아직 여행 기록이 없어요</p>
        <p className="text-[11px] font-bold leading-relaxed text-warm-gray">
          영주 관광 미션을 완료하면 이곳에 방문 기록이 쌓입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-stone-800 p-6 text-white">
        <h3 className="mb-5 text-[10px] font-black uppercase tracking-widest opacity-50">나의 영주 여행 타임라인</h3>
        <div className="relative space-y-6 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-0.5 before:bg-white/10">
          {records.map((item, index) => (
            <div key={`${item.placeId}-${index}`} className="relative flex gap-5">
              <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-4 border-stone-800 bg-apple-red">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
              <div>
                <p className="mb-0.5 text-[10px] font-black text-stone-400">{item.date}</p>
                <p className="text-sm font-black">{item.name}</p>
                <span className="mt-1 inline-block rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const formatReviewDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('ko-KR');
};

const ReviewsView = ({
  reviews,
  setUser,
}: {
  reviews: MissionReview[];
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftRating, setDraftRating] = useState(0);
  const [draftContent, setDraftContent] = useState('');
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const startEdit = (review: MissionReview) => {
    setEditingId(review.id);
    setDraftRating(review.rating);
    setDraftContent(review.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftRating(0);
    setDraftContent('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (draftRating === 0 && !draftContent.trim()) {
      showAlert('별점이나 후기 내용을 입력해주세요.', '📝', 'warning');
      return;
    }

    setUser(prev => prev ? {
      ...prev,
      missionReviews: (prev.missionReviews || []).map(review => review.id === editingId
        ? {
            ...review,
            rating: draftRating,
            content: draftContent.trim(),
            updatedAt: new Date().toISOString(),
          }
        : review),
    } : prev);
    cancelEdit();
    showAlert('방문 후기가 수정되었어요.', '📝', 'success');
  };

  const deleteReview = async (reviewId: string) => {
    const confirmed = await showConfirm({
      message: '이 방문 후기를 삭제할까요?\n미션 완료 기록은 유지됩니다.',
      emoji: '🗑️',
      type: 'warning',
      confirmText: '삭제하기',
      cancelText: '취소',
    });
    if (!confirmed) return;

    setUser(prev => prev ? {
      ...prev,
      missionReviews: (prev.missionReviews || []).filter(review => review.id !== reviewId),
    } : prev);
    if (editingId === reviewId) cancelEdit();
    showAlert('방문 후기를 삭제했어요.', '🗑️', 'info');
  };

  if (sortedReviews.length === 0) {
    return (
      <div className="rounded-[2rem] border-2 border-dashed border-stone-200 px-8 py-14 text-center">
        <div className="mb-3 text-4xl">📝</div>
        <p className="mb-1 text-sm font-black text-stone-700">아직 작성한 후기가 없어요</p>
        <p className="text-[11px] font-bold leading-relaxed text-warm-gray">
          방문 미션의 후기 단계를 완료하면 이곳에서 다시 보고 수정할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] border-2 border-apple-green/20 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-apple-green">Mission Reviews</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h3 className="text-lg font-black text-stone-900">내가 작성한 방문 후기</h3>
          <span className="rounded-full bg-apple-green/10 px-3 py-1 text-[10px] font-black text-apple-green">
            {sortedReviews.length}개
          </span>
        </div>
        <p className="mt-1 text-[11px] font-bold leading-relaxed text-warm-gray">
          방문 미션에서 남긴 별점과 후기를 모아두고, 필요할 때 내용을 고칠 수 있어요.
        </p>
      </section>

      {sortedReviews.map((review) => {
        const isEditing = editingId === review.id;
        return (
          <section key={review.id} className="cute-card p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-apple-red">{review.placeName}</p>
                <h4 className="mt-0.5 truncate text-sm font-black text-stone-900">{review.missionTitle}</h4>
                <p className="mt-1 text-[10px] font-bold text-stone-400">
                  수정일 {formatReviewDate(review.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-apple-green text-white transition-all active:scale-90"
                      aria-label="후기 저장"
                    >
                      <Save size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-400 transition-all active:scale-90"
                      aria-label="편집 취소"
                    >
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(review)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition-all active:scale-90"
                      aria-label="후기 편집"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteReview(review.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-400 transition-all active:scale-90"
                      aria-label="후기 삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setDraftRating(score)}
                      className="rounded-lg p-0.5 transition-transform active:scale-90"
                      aria-label={`${score}점`}
                    >
                      <Star
                        size={24}
                        fill={score <= draftRating ? '#e9c46a' : 'none'}
                        className={score <= draftRating ? 'text-yeoju-gold' : 'text-stone-200'}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={draftContent}
                  onChange={(event) => setDraftContent(event.target.value)}
                  placeholder="방문 후기를 입력해주세요"
                  className="h-28 w-full rounded-2xl border-2 border-stone-100 bg-stone-50 p-3 text-xs font-bold leading-relaxed text-stone-700 outline-none transition-all placeholder:text-stone-300 focus:border-apple-red focus:bg-white"
                />
              </div>
            ) : (
              <>
                <div className="mb-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <Star
                      key={score}
                      size={16}
                      fill={score <= review.rating ? '#e9c46a' : 'none'}
                      className={score <= review.rating ? 'text-yeoju-gold' : 'text-stone-200'}
                    />
                  ))}
                </div>
                <p className="rounded-2xl bg-stone-50 p-3 text-xs font-bold leading-relaxed text-stone-600">
                  {review.content || '텍스트 없이 별점만 남긴 후기예요.'}
                </p>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
};

const CardsView = ({ trees, user, onSelect }: { trees: TreeState[]; user: UserProfile; onSelect: (tree: TreeState) => void }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (trees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-stone-200 px-8 py-14 text-center">
        <div className="mb-4 text-5xl">🌱</div>
        <p className="mb-2 text-sm font-black text-stone-700">소유권 카드가 없어요</p>
        <p className="text-[11px] font-bold leading-relaxed text-warm-gray">
          사과나무를 분양받으면 나만의 나무 카드가 생성됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-warm-gray">나무 소유권 카드</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="카드형 보기"
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-xl border p-1.5 transition-all active:scale-90',
              viewMode === 'grid' ? 'border-stone-800 bg-stone-800 text-white' : 'border-stone-200 bg-white text-stone-400',
            )}
          >
            <LayoutGrid size={13} />
          </button>
          <button
            type="button"
            aria-label="목록형 보기"
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-xl border p-1.5 transition-all active:scale-90',
              viewMode === 'list' ? 'border-stone-800 bg-stone-800 text-white' : 'border-stone-200 bg-white text-stone-400',
            )}
          >
            <List size={13} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3">
          {trees.map((tree) => (
            <TreeGridItem key={tree.id} tree={tree} onSelect={onSelect} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {trees.map((tree) => (
            <TreeListItem key={tree.id} tree={tree} onSelect={onSelect} />
          ))}
        </div>
      )}

      <div className="gold-card p-4 text-center">
        <p className="mb-2 text-[11px] font-bold leading-relaxed text-stone-600">
          {user.name}님의 나무 카드는 수확 이력과 함께 보관됩니다.
        </p>
      </div>
    </div>
  );
};

const TreeGridItem = ({ tree, onSelect }: { tree: TreeState; onSelect: (tree: TreeState) => void }) => (
  <motion.button
    type="button"
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => onSelect(tree)}
    className="group block w-full cursor-pointer text-left"
  >
    <div className="relative aspect-[2/3] overflow-hidden rounded-[1.5rem] border-2 border-stone-200 bg-stone-100 shadow-sm transition-all group-hover:shadow-lg">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
        <span className="mb-2 text-4xl">{tree.growthStage === '시즌종료' ? '🍎' : '🌳'}</span>
        <p className="w-full truncate text-[10px] font-black text-stone-800">{tree.nickname}</p>
        <span className="text-[8px] font-bold text-stone-400">#{tree.id.slice(-4).toUpperCase()}</span>
      </div>
      <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[10px] font-black text-stone-700 backdrop-blur">
        {tree.currentDay}d
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-2/5 bg-linear-to-t from-stone-900/60 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 text-white">
        <div className="mb-1 h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full bg-apple-green" style={{ width: `${tree.growthRate}%` }} />
        </div>
        <p className="text-[7px] font-black uppercase opacity-60">Growth: {tree.growthRate}%</p>
      </div>
    </div>
  </motion.button>
);

const TreeListItem = ({ tree, onSelect }: { tree: TreeState; onSelect: (tree: TreeState) => void }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(tree)}
    className="flex w-full items-center gap-3 rounded-[1.5rem] border-2 border-stone-100 bg-white p-3 text-left shadow-sm transition-all hover:border-apple-red/30 hover:shadow-md"
  >
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl">
      {tree.growthStage === '시즌종료' ? '🍎' : '🌳'}
    </div>
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center gap-2">
        <p className="truncate text-sm font-black text-stone-800">{tree.nickname}</p>
        <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[8px] font-black text-stone-500">
          {tree.currentDay}일차
        </span>
      </div>
      <p className="mb-2 truncate text-[10px] font-bold text-warm-gray">
        {tree.variety} · {tree.growthStage} · #{tree.id.slice(-4).toUpperCase()}
      </p>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full bg-apple-green" style={{ width: `${tree.growthRate}%` }} />
        </div>
        <span className="text-[9px] font-black text-stone-500">{tree.growthRate}%</span>
      </div>
    </div>
  </motion.button>
);
