import StudentCourseSidebar from '@/components/StudentCourseSidebar';

export default function StudentCourseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Course Sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <StudentCourseSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-foreground/5 rounded-3xl border border-gray-200 dark:border-foreground/10 p-6 md:p-8 min-h-[calc(100vh-140px)] shadow-md dark:shadow-none">
        {children}
      </div>
      
    </div>
  );
}
