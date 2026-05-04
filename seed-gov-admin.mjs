/**
 * 지자체 관리자 더미 데이터 시드 스크립트
 *
 * 사용법:
 *   1. Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성
 *   2. 다운로드한 JSON 파일을 이 파일과 같은 폴더에 service-account.json 으로 저장
 *   3. 터미널에서: node seed-gov-admin.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const TARGET_EMAIL = 'wlrmadldi0516@naver.com';
const DATABASE_ID  = 'ai-studio-95c6884e-c3df-4310-aeec-fedaa2ca3cd0';

// ── 서비스 계정 로드 ──────────────────────────────────────────────────────────
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
} catch {
  console.error('❌ service-account.json 파일이 없습니다.');
  console.error('   Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();
const db   = getFirestore(DATABASE_ID);

// ── 더미 데이터 ───────────────────────────────────────────────────────────────
const now = new Date().toISOString();

const govAdminProfile = {
  role: 'gov_admin',
  name: '영주시청 관리자',
  nickname: '지자체관리자',
  profileImage: null,
  points: 99999,
  apples: 500,
  lives: 5,
  accumulatedApples: 1200,
  isHonoraryCitizen: true,
  onboardingSeen: true,

  deliveryRequests: [
    {
      name: '영주시청 담당자',
      phone: '054-639-6000',
      address: '경북 영주시 구성로 221',
      apples: 100,
      requestedAt: now,
    },
  ],

  claimedMilestones: [10, 30, 60, 100, 220],

  trees: [],

  items: [
    { id: 'nutrient',    count: 10 },
    { id: 'medicine',    count: 10 },
    { id: 'shield',      count: 5  },
    { id: 'fertilizer',  count: 3  },
    { id: 'seed_f1',     count: 2  },
    { id: 'seed_f2',     count: 2  },
    { id: 'seed_f3',     count: 2  },
  ],

  badges: [
    { id: 'newbie',      title: '새내기 농부',    icon: '🌱', dateEarned: now },
    { id: 'gov_admin',   title: '지자체 관리자',  icon: '🏛️', dateEarned: now },
    { id: 'pioneer',     title: '영주 개척자',    icon: '🗺️', dateEarned: now },
    { id: 'apple_king',  title: '사과 대왕',      icon: '👑', dateEarned: now },
  ],

  adoptedFarmIds: ['f1', 'f2', 'f3', 'f4', 'f5'],
  storedFarmIds:  ['f4', 'f5'],

  visitMissionProgress: {
    m1: 'completed',
    m2: 'completed',
    m3: 'completed',
    m4: 'action',
    m5: 'prepare',
  },

  courses: [
    {
      id: 'c_demo_1',
      name: '영주 대표 관광 코스',
      theme: 'AI 추천',
      createdAt: now,
      items: [
        { placeId: 'p1', order: 0, estimatedArrival: '10:00', status: 'completed' },
        { placeId: 'p2', order: 1, estimatedArrival: '11:30', status: 'completed' },
        { placeId: 'p3', order: 2, estimatedArrival: '13:00', status: 'pending'   },
        { placeId: 'p4', order: 3, estimatedArrival: '15:00', status: 'pending'   },
      ],
    },
    {
      id: 'c_demo_2',
      name: '소백산·부석사 힐링 코스',
      theme: '즉흥형 여행',
      createdAt: now,
      items: [
        { placeId: 'p0', order: 0, estimatedArrival: '09:00', status: 'completed' },
        { placeId: 'p5', order: 1, estimatedArrival: '12:00', status: 'pending'   },
      ],
    },
  ],

  visitedHistory: [
    { placeId: 'p0', visitedAt: now, missionId: 'm1' },
    { placeId: 'p1', visitedAt: now, missionId: 'm2' },
    { placeId: 'p2', visitedAt: now, missionId: 'm3' },
  ],

  favoritePlaceIds: ['p0', 'p1', 'p2', 'p3'],

  chatConversations: [],
  chatHistory: [],
};

// ── 실행 ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`\n🔍 ${TARGET_EMAIL} 계정 조회 중...`);

  let uid;
  try {
    const userRecord = await auth.getUserByEmail(TARGET_EMAIL);
    uid = userRecord.uid;
    console.log(`✅ UID 확인: ${uid}`);
  } catch (err) {
    console.error(`❌ 이메일로 사용자를 찾을 수 없습니다: ${err.message}`);
    console.error('   Firebase Authentication에 해당 계정이 등록되어 있는지 확인해주세요.');
    process.exit(1);
  }

  console.log('\n📝 Firestore에 데이터 저장 중...');
  await db.collection('users').doc(uid).set(govAdminProfile, { merge: false });
  console.log('✅ 지자체 관리자 더미 데이터 저장 완료!');
  console.log(`\n📋 저장된 데이터 요약:`);
  console.log(`   role          : ${govAdminProfile.role}`);
  console.log(`   name          : ${govAdminProfile.name}`);
  console.log(`   points        : ${govAdminProfile.points}`);
  console.log(`   badges        : ${govAdminProfile.badges.length}개`);
  console.log(`   adoptedFarms  : ${govAdminProfile.adoptedFarmIds.join(', ')}`);
  console.log(`   missions 완료 : m1, m2, m3`);
  console.log(`   courses       : ${govAdminProfile.courses.length}개`);
}

seed().catch((err) => {
  console.error('❌ 오류 발생:', err);
  process.exit(1);
});
