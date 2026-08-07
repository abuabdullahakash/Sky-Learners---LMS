"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
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

  const detectUserRoleAndRepair = async (uid: string, existingData?: UserData): Promise<UserData> => {
    let role = existingData?.role;
    let onboardingComplete = existingData?.onboardingComplete;

    if (role) {
      onboardingComplete = true;
      const userRef = doc(db, "users", uid);
      setDoc(userRef, { role, onboardingComplete: true }, { merge: true }).catch(console.error);
      return { ...existingData, role, onboardingComplete: true };
    }

    try {
      // Check if user is a teacher by querying courses collection
      const coursesQuery = query(collection(db, 'courses'), where('teacherId', '==', uid), limit(1));
      const coursesSnap = await getDocs(coursesQuery);
      if (!coursesSnap.empty) {
        role = 'teacher';
        onboardingComplete = true;
      } else {
        // Check if user is a teacher in enrollments
        const teacherEnrollQuery = query(collection(db, 'enrollments'), where('teacherId', '==', uid), limit(1));
        const teacherEnrollSnap = await getDocs(teacherEnrollQuery);
        if (!teacherEnrollSnap.empty) {
          role = 'teacher';
          onboardingComplete = true;
        } else {
          // Check if user is a student in enrollments
          const studentEnrollQuery = query(collection(db, 'enrollments'), where('studentId', '==', uid), limit(1));
          const studentEnrollSnap = await getDocs(studentEnrollQuery);
          if (!studentEnrollSnap.empty) {
            role = 'student';
            onboardingComplete = true;
          }
        }
      }

      if (role) {
        const userRef = doc(db, "users", uid);
        setDoc(userRef, { role, onboardingComplete: true }, { merge: true }).catch(console.error);
        return { ...existingData, role, onboardingComplete: true };
      }
    } catch (err) {
      console.error("Error detecting user role from collections:", err);
    }

    return { ...existingData };
  };

  const fetchUserData = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const rawData = userDoc.data() as UserData;
        const repairedData = await detectUserRoleAndRepair(uid, rawData);
        setUserData(repairedData);
      } else {
        const repairedData = await detectUserRoleAndRepair(uid, {});
        setUserData(Object.keys(repairedData).length > 0 ? repairedData : null);
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
          async (docSnap) => {
            if (docSnap.exists()) {
              const rawData = docSnap.data() as UserData;
              const repairedData = await detectUserRoleAndRepair(currentUser.uid, rawData);
              setUserData(repairedData);
            } else {
              const repairedData = await detectUserRoleAndRepair(currentUser.uid, {});
              setUserData(Object.keys(repairedData).length > 0 ? repairedData : null);
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
