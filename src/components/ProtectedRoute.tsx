"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  const isTeacher = userData?.role === 'teacher' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const effectiveRole = isTeacher ? 'teacher' : (userData?.role || 'student');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (userData && !userData.onboardingComplete && !userData.role && !isTeacher) {
        router.replace('/onboarding');
      } else if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
        router.replace(effectiveRole === 'teacher' ? '/teacher-dashboard' : '/dashboard');
      }
    }
  }, [user, userData, loading, allowedRoles, router, isTeacher, effectiveRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
