import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCZisxquXrkT6367_CE5-hZisDtGgRC5IU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nfl-metal.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nfl-metal",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nfl-metal.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "920827206000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:920827206000:web:a78a791d5a748c2e9a17b5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LRHYYPDD69"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const db = getFirestore(app);

export { 
  app, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  fbSignOut, 
  onAuthStateChanged, 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp 
};
