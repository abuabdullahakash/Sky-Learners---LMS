import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px] pt-[120px] lg:pt-[160px] pb-[60px] lg:pb-[100px]">
        <div className="flex bg-foreground/[0.02] border border-foreground/10 rounded-3xl min-h-[calc(100vh-200px)] shadow-2xl relative">
          {/* Subtle background glow for the whole dashboard box */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] pointer-events-none rounded-full"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-accent/20 blur-[120px] pointer-events-none rounded-full"></div>
          
          <div className="relative z-10 flex w-full">
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-[120px] lg:top-[160px] h-[calc(100vh-200px)]">
                <Sidebar />
              </div>
            </div>
            <div className="flex-1 p-6 md:p-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
