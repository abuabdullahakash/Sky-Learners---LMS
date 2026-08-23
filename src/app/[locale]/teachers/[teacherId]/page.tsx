"use client";

import { use, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TeacherStorefrontView from '@/components/TeacherStorefrontView';

export default function TeacherPhysicsHuntersStorefrontPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const resolvedParams = use(params);
  const { teacherId } = resolvedParams;
  const { user, userData } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined' && teacherId) {
      sessionStorage.setItem('referralTeacherId', teacherId);
      localStorage.setItem('referralTeacherId', teacherId);
    }
  }, [teacherId]);

  const isOwner = user?.uid === teacherId || (userData?.role === 'admin' && user?.uid === teacherId);

  return <TeacherStorefrontView teacherId={teacherId} isOwner={isOwner} />;
}

