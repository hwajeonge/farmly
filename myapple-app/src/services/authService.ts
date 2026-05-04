import {
  Auth,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
// @ts-ignore — signInWithRedirect/getRedirectResult exist at runtime; TS can't resolve them due to @firebase/auth package exports config
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
// @ts-ignore — deleteUser exists at runtime; TS can't resolve it due to @firebase/auth package exports config
import { deleteUser } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  onSnapshot
} from 'firebase/firestore';
// @ts-ignore — deleteDoc exists at runtime; TS can't resolve it due to Firebase package exports config
import { deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import { FARMS } from '../constants';

const INITIAL_POINTS = 5000; // Sign-up bonus

export const authService = {
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  },

  async handleRedirectResult() {
    return getRedirectResult(auth);
  },

  async getProfile(uid: string) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  },

  async createProfile(user: User, role: UserProfile['role']) {
    const profile: UserProfile = {
      role,
      name: user.displayName || '영주농부',
      nickname: user.displayName || '영주농부',
      profileImage: user.photoURL || undefined,
      points: INITIAL_POINTS,
      apples: 0,
      lives: 5,
      accumulatedApples: 0,
      deliveryRequests: [],
      claimedMilestones: [],
      isHonoraryCitizen: false,
      trees: [],
      items: [
        { id: 'nutrient', count: 2 },
        { id: 'medicine', count: 2 }
      ],
      badges: [
        { id: 'newbie', title: '새내기 농부', icon: '🌱', dateEarned: new Date().toISOString() }
      ],
      adoptedFarmIds: [FARMS[Math.floor(Math.random() * FARMS.length)].id],
      storedFarmIds: [],
      visitMissionProgress: {},
      chatHistory: [],
      onboardingSeen: false,
      courses: [],
      visitedHistory: [],
      favoritePlaceIds: [],
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    return profile;
  },

  async logout() {
    await signOut(auth);
  },

  async deleteAccount(user: User) {
    const uid = user.uid;
    await deleteUser(user);
    await deleteDoc(doc(db, 'users', uid));
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  getUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
    return onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserProfile);
      } else {
        callback(null);
      }
    });
  },

  async addPoints(uid: string, amount: number) {
    await updateDoc(doc(db, 'users', uid), {
      points: increment(amount)
    });
  },

  async saveProfile(uid: string, profile: UserProfile) {
    await setDoc(doc(db, 'users', uid), profile);
  }
};
