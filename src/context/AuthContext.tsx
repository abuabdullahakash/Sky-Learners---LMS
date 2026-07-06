"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUpRecaptcha: (number: string) => Promise<ConfirmationResult>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  setUpRecaptcha: async () => { throw new Error('Not implemented'); },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const setUpRecaptcha = (number: string) => {
    // Clear any existing recaptcha to prevent "element has been removed" error on re-renders
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
    <AuthContext.Provider value={{ user, loading, logout, setUpRecaptcha }}>
      {children}
    </AuthContext.Provider>
  );
};
