"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isTeacher = isAdmin || userData?.role === 'teacher';
  const effectiveRole = isAdmin ? 'admin' : (isTeacher ? 'teacher' : (userData?.role || 'student'));

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (userData?.isBlocked) {
        // User account is blocked/suspended
        alert('Your account has been suspended by the administrator.');
        router.replace('/');
      } else if (userData && !userData.onboardingComplete && !isTeacher && !isAdmin) {
        router.replace('/onboarding');
      } else if (allowedRoles) {
        const hasAccess = allowedRoles.includes(effectiveRole) || (isAdmin && allowedRoles.some(r => ['teacher', 'student', 'admin'].includes(r)));
        if (!hasAccess) {
          router.replace(isAdmin ? '/admin' : (isTeacher ? '/teacher-dashboard' : '/dashboard'));
        }
      }
    }
  }, [user, userData, loading, allowedRoles, router, isTeacher, isAdmin, effectiveRole]);

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
