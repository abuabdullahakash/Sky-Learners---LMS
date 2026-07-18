"use client";

import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, BookOpen, Video, FileText, CheckSquare, MessageSquare, Settings, ArrowLeft, Users, ClipboardList, GraduationCap, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CourseSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const courseId = params.courseId as string;
  const [courseTitle, setCourseTitle] = useState('Loading...');
  const [isPublished, setIsPublished] = useState(false);
  const [courseType, setCourseType] = useState('coaching');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourseTitle(data.title);
          setIsPublished(data.isPublished);
          setCourseType(data.courseType || 'coaching');
        }
      } catch (error) {
        console.error("Error fetching course title", error);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const handleTogglePublish = async () => {
    const action = isPublished ? 'unpublish' : 'publish';
    if (!window.confirm(`Are you sure you want to ${action} this course?`)) return;

    try {
      const docRef = doc(db, 'courses', courseId);
      await updateDoc(docRef, {
        isPublished: !isPublished
      });
      setIsPublished(!isPublished);
    } catch (error) {
      console.error("Error toggling publish status", error);
      alert("Failed to update course status.");
    }
  };

  const menuItems = [
    { name: 'Overview', href: `/teacher-dashboard/courses/${courseId}`, icon: LayoutDashboard, exact: true },
    { name: 'Enrollments', href: `/teacher-dashboard/courses/${courseId}/enrollments`, icon: ClipboardList },
    { name: 'Students', href: `/teacher-dashboard/courses/${courseId}/students`, icon: GraduationCap },
    { name: 'Curriculum', href: `/teacher-dashboard/courses/${courseId}/curriculum`, icon: BookOpen },
    { name: 'Student Issues', href: `/teacher-dashboard/courses/${courseId}/issues`, icon: AlertCircle },
    { name: 'Live Classes', href: `/teacher-dashboard/courses/${courseId}/live-classes`, icon: Video },
    { name: 'Resources', href: `/teacher-dashboard/courses/${courseId}/resources`, icon: FileText },
    { name: 'Exams & Quizzes', href: `/teacher-dashboard/courses/${courseId}/exams`, icon: CheckSquare },
    { name: 'Instructors', href: `/teacher-dashboard/courses/${courseId}/instructors`, icon: Users },
    { name: 'Community', href: `/teacher-dashboard/courses/${courseId}/community`, icon: MessageSquare },
    { name: 'Course Details', href: `/teacher-dashboard/courses/${courseId}/settings`, icon: Settings },
  ];

  return (
    <aside className="w-full flex flex-col justify-between min-h-full overflow-x-hidden pr-2">
      
      <div className="p-4 space-y-4 border-b border-foreground/10">
        <Link href="/teacher-dashboard/courses" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to All Courses
        </Link>
        <h3 className="font-bold text-lg line-clamp-2" title={courseTitle}>{courseTitle}</h3>
        <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-bold ${isPublished ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
          {isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="p-3 space-y-1 overflow-y-auto custom-scrollbar flex-1">
        {menuItems.filter(item => courseType === 'individual' ? item.name !== 'Instructors' : true).map((item) => {
          // Check if path matches. Next-intl usePathname does not include locale.
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
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'hover:bg-foreground/5 text-foreground/70 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Publish/Unpublish Action */}
      <div className="p-4 border-t border-foreground/10 bg-background/50">
        <button
          onClick={handleTogglePublish}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
            isPublished 
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
              : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg'
          }`}
        >
          {isPublished ? 'Unpublish Course' : 'Publish Now'}
        </button>
      </div>
    </aside>
  );
}
