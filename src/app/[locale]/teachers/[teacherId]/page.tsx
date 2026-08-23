"use client";

import { use, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import TeacherStorefrontView from '@/components/TeacherStorefrontView';

export default function TeacherPhysicsHuntersStorefrontPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const resolvedParams = use(params);
  const { teacherId } = resolvedParams;
  const { user, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && teacherId) {
      sessionStorage.setItem('referralTeacherId', teacherId);
      localStorage.setItem('referralTeacherId', teacherId);
      document.cookie = `referralTeacherId=${teacherId}; path=/; max-age=2592000; SameSite=Lax`;

      // Next.js standard clean router replace
      router.replace('/');
    }
  }, [teacherId, router]);

  const isOwner = user?.uid === teacherId || (userData?.role === 'admin' && user?.uid === teacherId);

  return <TeacherStorefrontView teacherId={teacherId} isOwner={isOwner} />;
}



