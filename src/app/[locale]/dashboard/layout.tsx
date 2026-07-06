import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-80px)]">
        <Sidebar />
        <div className="flex-1 p-6 md:p-10 max-h-[calc(100vh-80px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
