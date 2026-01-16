import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  'new-analysis': 'New Analysis',
  reports: 'My Reports',
  presets: 'Presets',
  team: 'Team',
  admin: 'Admin',
  help: 'Help',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Home className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">Dashboard</span>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        to="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const label = routeLabels[segment] || segment;

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium">{label}</span>
            ) : (
              <Link
                to={path}
                className={cn(
                  'text-muted-foreground hover:text-foreground transition-colors'
                )}
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
