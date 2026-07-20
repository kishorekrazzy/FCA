import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBhJ4vKK39W1BJIIPU7yjwZJQ-eiTQqOQg',
  authDomain: 'fcacademy.firebaseapp.com',
  projectId: 'fcacademy',
  storageBucket: 'fcacademy.firebasestorage.app',
  messagingSenderId: '752159511892',
  appId: '1:752159511892:web:a7cd0c10fc68744be724c1',
  measurementId: 'G-ZSJ9N35DJ1',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

isSupported().then((ok) => { if (ok) getAnalytics(app) }).catch(() => {})

const googleProvider = new GoogleAuthProvider()
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const signOutUser = () => signOut(auth)
export const watchAuth = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback)
export type { User }
