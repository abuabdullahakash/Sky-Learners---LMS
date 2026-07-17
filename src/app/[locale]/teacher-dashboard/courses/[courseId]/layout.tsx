import CourseSidebar from '@/components/CourseSidebar';

export default function CourseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Course Sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <CourseSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[calc(100vh-140px)]">
        {children}
      </div>
      
    </div>
  );
}
