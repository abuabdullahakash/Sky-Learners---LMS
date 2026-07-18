import CourseSidebar from '@/components/CourseSidebar';

export default function CourseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Course Sidebar - Replaces Main Sidebar */}
      <div className="hidden md:block w-64 lg:w-[280px] flex-shrink-0 bg-background/50 border-r border-foreground/10 fixed left-0 top-[80px] h-[calc(100vh-80px)] z-40 overflow-y-auto custom-scrollbar">
        <CourseSidebar />
      </div>

      {/* Main Content Area */}
      <div className="w-full min-h-[calc(100vh-140px)]">
        {children}
      </div>
      
    </div>
  );
}
