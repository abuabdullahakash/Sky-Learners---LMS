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
      <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px] pt-[120px] lg:pt-[160px] pb-[60px] lg:pb-[100px]">
        <div className={`flex flex-col md:flex-row gap-8 relative`}>
          
          {/* Main Sidebar - Hidden inside nested course dashboard */}
          {!isCourseDashboard && (
            <div className="hidden md:block w-64 flex-shrink-0">
              <TeacherSidebar />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 w-full min-w-0">
            {children}
          </div>
          
        </div>
      </div>
    </ProtectedRoute>
  );
}
