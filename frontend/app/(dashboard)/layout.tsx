'use client';

import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import LoadingDots from '../../components/ui/LoadingDots';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-slate-900">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="flex bg-surface dark:bg-slate-900 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
