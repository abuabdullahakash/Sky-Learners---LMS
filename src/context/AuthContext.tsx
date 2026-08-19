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

  const detectUserRoleAndRepair = async (uid: string, existingData?: UserData, email?: string | null): Promise<UserData> => {
    let role: 'student' | 'teacher' | undefined = undefined;
    const userEmail = (email || existingData?.email || user?.email || auth.currentUser?.email || '').toLowerCase().trim();

    // Check 0: Platform Creator / Owner / Admin email
    if (userEmail === 'abuabdullahakash@gmail.com' || userEmail.includes('abuabdullahakash')) {
      role = 'teacher';
    }

    // Check 1: If explicitly already a teacher in memory/data
    if (!role && (existingData?.role === 'teacher' || existingData?.experience || existingData?.subject)) {
      role = 'teacher';
    }

    let profilePhoto = existingData?.photoURL || existingData?.profilePhoto || existingData?.photoUrl || undefined;

    // Check 2: Check if teacher profile document exists
    try {
      const teacherProfileSnap = await getDoc(doc(db, 'teacherProfiles', uid));
      if (teacherProfileSnap.exists()) {
        const tpData = teacherProfileSnap.data();
        if (!role) {
          role = 'teacher';
        }
        if (tpData.profilePhoto || tpData.photoUrl) {
          profilePhoto = tpData.profilePhoto || tpData.photoUrl;
        }
      }
    } catch (err) {
      console.error("Error checking teacherProfiles:", err);
    }

    // Check 3: Check if user is a creator of any course in courses collection by teacherId
    if (!role) {
      try {
        const coursesQuery = query(collection(db, 'courses'), where('teacherId', '==', uid), limit(1));
        const coursesSnap = await getDocs(coursesQuery);
        if (!coursesSnap.empty) {
          role = 'teacher';
        }
      } catch (err) {
        console.error("Error checking courses for role detection:", err);
      }
    }

    // Check 4: Check if user has teacher enrollments
    if (!role) {
      try {
        const teacherEnrollQuery = query(collection(db, 'enrollments'), where('teacherId', '==', uid), limit(1));
        const teacherEnrollSnap = await getDocs(teacherEnrollQuery);
        if (!teacherEnrollSnap.empty) {
          role = 'teacher';
        }
      } catch (err) {
        console.error("Error checking teacher enrollments:", err);
      }
    }

    // Check 5: Check if user is a student in enrollments
    if (!role) {
      try {
        const studentEnrollQuery = query(collection(db, 'enrollments'), where('studentId', '==', uid), limit(1));
        let studentEnrollSnap = await getDocs(studentEnrollQuery);
        if (studentEnrollSnap.empty && userEmail) {
          const emailQ = query(collection(db, 'enrollments'), where('studentEmail', '==', userEmail.toLowerCase().trim()), limit(1));
          studentEnrollSnap = await getDocs(emailQ);
        }
        if (studentEnrollSnap.empty && userEmail) {
          const contactQ = query(collection(db, 'enrollments'), where('contactEmail', '==', userEmail.toLowerCase().trim()), limit(1));
          studentEnrollSnap = await getDocs(contactQ);
        }
        if (!studentEnrollSnap.empty) {
          role = 'student';
        }
      } catch (err) {
        console.error("Error checking student enrollments:", err);
      }
    }

    // Check 6: Check existing stored role
    if (!role && existingData?.role) {
      role = existingData.role;
    }

    // Only update and finalize role if a recognized role is determined or user is admin/teacher
    if (role) {
      const needsUpdate = existingData?.role !== role || (role === 'teacher' && existingData?.onboardingComplete !== true);
      if (needsUpdate) {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, { role, onboardingComplete: true, email: userEmail || existingData?.email || '' }, { merge: true }).catch(console.error);
      }
      return { 
        ...existingData, 
        email: userEmail || existingData?.email, 
        role, 
        onboardingComplete: true,
        photoURL: profilePhoto || existingData?.photoURL || existingData?.profilePhoto || existingData?.photoUrl || undefined,
        profilePhoto: profilePhoto || existingData?.photoURL || existingData?.profilePhoto || existingData?.photoUrl || undefined,
      };
    }

    // For brand new users without a role, preserve their uncompleted onboarding status
    return { 
      ...existingData, 
      email: userEmail || existingData?.email, 
      role: existingData?.role || undefined, 
      onboardingComplete: Boolean(existingData?.onboardingComplete),
      photoURL: profilePhoto || existingData?.photoURL || existingData?.profilePhoto || existingData?.photoUrl || undefined,
      profilePhoto: profilePhoto || existingData?.photoURL || existingData?.profilePhoto || existingData?.photoUrl || undefined,
    };
  };

  const fetchUserData = async (uid: string, email?: string | null) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const rawData = userDoc.data() as UserData;
        const repairedData = await detectUserRoleAndRepair(uid, rawData, email);
        setUserData(repairedData);
      } else {
        const repairedData = await detectUserRoleAndRepair(uid, {}, email);
        setUserData(repairedData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid, user.email);
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
              const repairedData = await detectUserRoleAndRepair(currentUser.uid, rawData, currentUser.email);
              setUserData(repairedData);
            } else {
              const repairedData = await detectUserRoleAndRepair(currentUser.uid, {}, currentUser.email);
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
