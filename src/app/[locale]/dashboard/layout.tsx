import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px] pt-[120px] lg:pt-[160px] pb-[60px] lg:pb-[100px]">
        <div className="flex flex-col md:flex-row gap-8 relative">
          
          {/* Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
          
        </div>
      </div>
    </ProtectedRoute>
  );
}
