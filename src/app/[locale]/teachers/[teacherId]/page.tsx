"use client";

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import TeacherStorefrontView from '@/components/TeacherStorefrontView';
import { db } from '@/lib/firebase';
import { resolveTeacherBySlugOrId } from '@/lib/slug';

export default function TeacherDedicatedStorefrontPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const resolvedParams = use(params);
  const { teacherId } = resolvedParams;
  const { user, userData } = useAuth();
  const [resolvedUid, setResolvedUid] = useState<string>(teacherId);

  useEffect(() => {
    let isMounted = true;
    const resolveAndStore = async () => {
      if (!teacherId) return;
      try {
        const teacherInfo = await resolveTeacherBySlugOrId(db, teacherId);
        const finalUid = teacherInfo?.uid || teacherId;
        if (isMounted) {
          setResolvedUid(finalUid);
        }
        if (typeof window !== 'undefined' && finalUid) {
          sessionStorage.setItem('referralTeacherId', finalUid);
          localStorage.removeItem('referralTeacherId');
          document.cookie = 'referralTeacherId=; path=/; max-age=0; SameSite=Lax';
          window.dispatchEvent(new Event('storage'));
        }
      } catch (err) {
        console.error("Error resolving teacher storefront page:", err);
      }
    };
    resolveAndStore();

    return () => {
      isMounted = false;
    };
  }, [teacherId]);

  const isOwner = Boolean(user?.uid && (user.uid === resolvedUid || user.uid === teacherId || (userData?.role === 'admin' && (user.uid === resolvedUid || user.uid === teacherId))));

  return <TeacherStorefrontView teacherId={resolvedUid || teacherId} isOwner={isOwner} />;
}

