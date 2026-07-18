"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import TeacherSidebar from '@/components/TeacherSidebar';
import { usePathname } from 'next/navigation';

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Check if we are inside a specific course dashboard, but not the course creation page
  const parts = pathname.split('/');
  const coursesIndex = parts.indexOf('courses');
  const isCourseDashboard = coursesIndex !== -1 && parts.length > coursesIndex + 1 && parts[coursesIndex + 1] !== 'create';

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="w-full pt-[80px] min-h-screen flex relative">
        {/* Main Sidebar - Fixed on the left, hidden inside nested course dashboard */}
        {!isCourseDashboard && (
          <div className="hidden md:block w-64 lg:w-[280px] flex-shrink-0 bg-background/50 border-r border-foreground/10 fixed left-0 top-[80px] h-[calc(100vh-80px)] z-40 overflow-y-auto custom-scrollbar">
            <TeacherSidebar />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0 p-4 md:p-6 lg:p-8 md:ml-64 lg:ml-[280px]">
          <div className="max-w-[1280px] mx-auto w-full">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
