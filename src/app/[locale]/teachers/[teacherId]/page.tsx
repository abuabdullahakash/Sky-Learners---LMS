"use client";

import { use } from 'react';
import { useAuth } from '@/context/AuthContext';
import TeacherStorefrontView from '@/components/TeacherStorefrontView';

export default function TeacherPhysicsHuntersStorefrontPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const resolvedParams = use(params);
  const { teacherId } = resolvedParams;
  const { user, userData } = useAuth();

  const isOwner = user?.uid === teacherId || (userData?.role === 'admin' && user?.uid === teacherId);

  return <TeacherStorefrontView teacherId={teacherId} isOwner={isOwner} />;
}
