"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserData {
  role?: 'student' | 'teacher';
  name?: string;
  email?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUpRecaptcha: (number: string) => Promise<ConfirmationResult>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
  setUpRecaptcha: async () => { throw new Error('Not implemented'); },
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        if (data.role && !data.onboardingComplete) {
          data.onboardingComplete = true;
          setDoc(userRef, { onboardingComplete: true }, { merge: true }).catch(console.error);
        }
        setUserData(data);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid);
    }
  };

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Real-time listener for user document changes
        const userRef = doc(db, "users", currentUser.uid);
        unsubscribeDoc = onSnapshot(
          userRef, 
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserData;
              if (data.role && !data.onboardingComplete) {
                data.onboardingComplete = true;
                setDoc(userRef, { onboardingComplete: true }, { merge: true }).catch(console.error);
              }
              setUserData(data);
            } else {
              setUserData(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error listening to user document:", error);
            setUserData(null);
            setLoading(false);
          }
        );
      } else {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const setUpRecaptcha = (number: string) => {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        console.error("Error clearing recaptcha", e);
      }
      (window as any).recaptchaVerifier = undefined;
    }
    
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
    });
    
    const appVerifier = (window as any).recaptchaVerifier;
    return signInWithPhoneNumber(auth, number, appVerifier);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout, setUpRecaptcha, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
