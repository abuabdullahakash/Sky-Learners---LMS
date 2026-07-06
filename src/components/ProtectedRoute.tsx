"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (userData && allowedRoles && !allowedRoles.includes(userData.role as string)) {
        // Redirect to appropriate page based on role and onboarding status
        if (!userData.onboardingComplete) {
          router.replace('/onboarding');
        } else {
          router.replace(userData.role === 'teacher' ? '/teacher-dashboard' : '/dashboard');
        }
      }
    }
  }, [user, userData, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (userData && allowedRoles && !allowedRoles.includes(userData.role as string)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
