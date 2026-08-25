import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup,
  fbSignOut, 
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  serverTimestamp
} from "../firebase";
import { sounds } from "../utils/soundEffects";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nfl_survivor_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.provider === "google") return parsed;
      } catch (e) {
        // ignore
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ──────────────────────────────────────────────
  // 1. Observador de estado de autenticación real
  // ──────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userData = buildUserData(fbUser);
        setUser(userData);
        localStorage.setItem("nfl_survivor_user", JSON.stringify(userData));
        await syncToFirestore(fbUser.uid, userData);
      } else {
        setUser(null);
        localStorage.removeItem("nfl_survivor_user");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────
  const buildUserData = (fbUser) => ({
    uid: fbUser.uid,
    name: fbUser.displayName || "Jugador NFL",
    email: fbUser.email,
    photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
    provider: "google",
    createdAt: new Date().toISOString()
  });

  const syncToFirestore = async (uid, userData) => {
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { ...userData, lastLogin: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn("Firestore sync (offline/sin permisos):", err.code || err);
    }
  };

  // ──────────────────────────────────────────────
  // 2. Login con Google
  // ──────────────────────────────────────────────
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      sounds.playClick();
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userData = buildUserData(fbUser);
      setUser(userData);
      localStorage.setItem("nfl_survivor_user", JSON.stringify(userData));
      await syncToFirestore(fbUser.uid, userData);
      sounds.playSuccess();
      return userData;
    } catch (error) {
      console.error("Google Auth error:", error);
      if (error.code === "auth/popup-closed-by-user" || 
          error.code === "auth/cancelled-popup-request") {
        return null;
      }
      setAuthError(error.message || "No se pudo iniciar sesión con Google.");
      throw error;
    }
  };

  const logout = async () => {
    sounds.playClick();
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn("Signout warning:", e);
    }
    setUser(null);
    localStorage.removeItem("nfl_survivor_user");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      authError, 
      loginWithGoogle, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
