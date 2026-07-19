import StudentCourseSidebar from '@/components/StudentCourseSidebar';

export default function StudentCourseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Dynamic Course Sidebar - Replaces Main Sidebar */}
      <div className="hidden md:block w-64 lg:w-[280px] flex-shrink-0 bg-background/50 border-r border-foreground/10 fixed left-0 top-[80px] h-[calc(100vh-80px)] z-40 overflow-y-auto custom-scrollbar">
        <StudentCourseSidebar />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Main Content Area */}
        <div className="w-full min-h-[calc(100vh-140px)] p-2 md:p-4">
          {children}
        </div>
      </div>
    </>
  );
}
