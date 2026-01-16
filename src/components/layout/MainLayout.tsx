import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { useSidebarStore } from '@/stores/sidebarStore';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'pt-header transition-all duration-200',
          isCollapsed ? 'ml-sidebar-collapsed' : 'ml-sidebar'
        )}
      >
        <div className="p-6">
          <div className="mb-6">
            <Breadcrumbs />
          </div>
          <div className="fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
