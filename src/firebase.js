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
  apiKey: "AIzaSyCZisxquXrkT6367_CE5-hZisDtGgRC5IU",
  authDomain: "nfl-metal.firebaseapp.com",
  projectId: "nfl-metal",
  storageBucket: "nfl-metal.firebasestorage.app",
  messagingSenderId: "920827206000",
  appId: "1:920827206000:web:a78a791d5a748c2e9a17b5",
  measurementId: "G-LRHYYPDD69"
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
