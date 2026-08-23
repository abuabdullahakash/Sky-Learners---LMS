"use client";

import { use, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from 'next-intl';
import TeacherStorefrontView from '@/components/TeacherStorefrontView';

export default function TeacherPhysicsHuntersStorefrontPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const resolvedParams = use(params);
  const { teacherId } = resolvedParams;
  const { user, userData } = useAuth();
  const locale = useLocale();

  useEffect(() => {
    if (typeof window !== 'undefined' && teacherId) {
      sessionStorage.setItem('referralTeacherId', teacherId);
      localStorage.setItem('referralTeacherId', teacherId);
      document.cookie = `referralTeacherId=${teacherId}; path=/; max-age=2592000; SameSite=Lax`;

      // Clean URL masking: Cleanly rewrite the address bar to '/' without triggering a page reload!
      try {
        const cleanPath = locale === 'bn' ? '/' : `/${locale}`;
        window.history.replaceState(null, '', cleanPath);
      } catch (e) {
        console.error("URL replace error:", e);
      }
    }
  }, [teacherId, locale]);

  const isOwner = user?.uid === teacherId || (userData?.role === 'admin' && user?.uid === teacherId);

  return <TeacherStorefrontView teacherId={teacherId} isOwner={isOwner} />;
}


