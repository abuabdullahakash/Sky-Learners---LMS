"use client";

import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, BookOpen, Video, FileText, CheckSquare, MessageSquare, ArrowLeft, GraduationCap } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function StudentCourseSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);
  const t = useTranslations('Dashboard.courseSidebar');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching course", error);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const menuItems = [
    { name: t('overview'), href: `/dashboard/courses/${courseId}`, icon: LayoutDashboard, exact: true },
    { name: t('recordedClasses'), href: `/dashboard/courses/${courseId}/recorded-classes`, icon: Video },
    { name: t('syllabus'), href: `/dashboard/courses/${courseId}/syllabus`, icon: BookOpen },
    { name: t('liveClasses'), href: `/dashboard/courses/${courseId}/live-classes`, icon: Video },
    { name: t('resources'), href: `/dashboard/courses/${courseId}/resources`, icon: FileText },
    { name: t('exams'), href: `/dashboard/courses/${courseId}/exams`, icon: CheckSquare },
    { name: t('community'), href: `/dashboard/courses/${courseId}/community`, icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-foreground/5 rounded-3xl border border-gray-200 dark:border-foreground/10 shadow-md dark:shadow-none flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-180px)] sticky top-[120px] lg:top-[160px] overflow-hidden">
      
      <div className="p-4 border-b border-gray-100 dark:border-foreground/10">
        <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-foreground/60 dark:hover:text-foreground transition-colors mb-4 font-medium">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </Link>
        {course?.thumbnailUrl && (
          <div className="w-full h-24 relative rounded-xl overflow-hidden mb-3 border border-gray-100 dark:border-foreground/10">
            <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
          </div>
        )}
        <h3 className="font-bold text-lg line-clamp-2 text-gray-900 dark:text-white" title={course?.title || 'Loading...'}>
          {course?.title || 'Loading...'}
        </h3>
        <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full font-bold bg-primary/10 text-primary uppercase tracking-wider">
          {course?.category || 'Course'}
        </span>
      </div>

      <div className="p-3 space-y-1 overflow-y-auto custom-scrollbar flex-1">
        {menuItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
            
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 dark:bg-orange-500 dark:text-white dark:shadow-orange-500/30' 
                  : 'hover:bg-gray-50 dark:hover:bg-orange-500/10 text-gray-600 dark:text-foreground/70 hover:text-gray-900 dark:hover:text-orange-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
