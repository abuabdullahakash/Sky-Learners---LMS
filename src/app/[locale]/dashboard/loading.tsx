import FlyingBookLoader from '@/components/ui/FlyingBookLoader';

export default function DashboardLoading() {
  return (
    <div className="flex justify-center items-center min-h-[60vh] w-full">
      <FlyingBookLoader />
    </div>
  );
}
