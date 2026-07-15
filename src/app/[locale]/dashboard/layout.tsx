"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Hide main sidebar if the route is /dashboard/courses/[courseId] or deeper
  const isCourseDashboard = pathname.includes('/dashboard/courses/') && pathname.split('/').length > 4;

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px] pt-[120px] lg:pt-[160px] pb-[60px] lg:pb-[100px]">
        <div className={`flex flex-col md:flex-row gap-8 relative ${isCourseDashboard ? 'w-full' : ''}`}>
          
          {/* Sidebar */}
          {!isCourseDashboard && (
            <div className="hidden md:block w-64 flex-shrink-0">
              <Sidebar />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 w-full">
            {children}
          </div>
          
        </div>
      </div>
    </ProtectedRoute>
  );
}
