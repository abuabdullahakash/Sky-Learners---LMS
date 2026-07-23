"use client";

import StudentCourseSidebar from '@/components/StudentCourseSidebar';
import { useState } from 'react';
import { Menu, X, GraduationCap } from 'lucide-react';

export default function StudentCourseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Sub-Header for Course Navigation */}
      <div className="md:hidden flex items-center justify-between p-4 mb-4 rounded-2xl bg-foreground/5 border border-foreground/10">
        <div className="flex items-center gap-2 text-sm font-bold">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span>Course Learning Menu</span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="px-3 py-1.5 bg-primary text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{isMobileSidebarOpen ? 'Close Menu' : 'Course Menu'}</span>
        </button>
      </div>

      {/* Mobile Course Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-md pt-[90px] p-4 overflow-y-auto animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 rounded-full bg-foreground/10 text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div onClick={() => setIsMobileSidebarOpen(false)}>
            <StudentCourseSidebar />
          </div>
        </div>
      )}

      {/* Dynamic Course Sidebar - Replaces Main Sidebar on Desktop */}
      <div className="hidden md:block w-64 lg:w-[280px] flex-shrink-0 bg-background/50 border-r border-foreground/10 fixed left-0 top-[80px] h-[calc(100vh-80px)] z-40 overflow-y-auto custom-scrollbar">
        <StudentCourseSidebar />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 md:ml-64 lg:ml-[280px]">
        {/* Main Content Area */}
        <div className="w-full min-h-[calc(100vh-140px)] p-2 md:p-4">
          {children}
        </div>
      </div>
    </>
  );
}
