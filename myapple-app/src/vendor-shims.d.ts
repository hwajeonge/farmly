declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
  export const Reorder: any;
}

declare module 'firebase/auth' {
  export type Auth = any;
  export type User = any;
  export const getAuth: any;
  export const browserSessionPersistence: any;
  export const setPersistence: any;
  export const signInWithPopup: any;
  export const GoogleAuthProvider: any;
  export const signOut: any;
  export const onAuthStateChanged: any;
}

declare module 'firebase/firestore' {
  export const getFirestore: any;
  export const doc: any;
  export const getDoc: any;
  export const getDocFromServer: any;
  export const setDoc: any;
  export const updateDoc: any;
  export const increment: any;
  export const onSnapshot: any;
}
