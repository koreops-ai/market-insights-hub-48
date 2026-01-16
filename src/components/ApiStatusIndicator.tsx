import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useApiConnection } from '@/contexts/ApiConnectionContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ApiStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function ApiStatusIndicator({ className, showLabel = false }: ApiStatusIndicatorProps) {
  const { status, error, retry, lastChecked } = useApiConnection();

  const statusConfig = {
    idle: {
      icon: Wifi,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      label: 'Not checked',
    },
    checking: {
      icon: Loader2,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      label: 'Checking...',
    },
    connected: {
      icon: Wifi,
      color: 'text-green-600 dark:text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Connected',
    },
    failed: {
      icon: WifiOff,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      label: 'Disconnected',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const isLoading = status === 'checking';

  const tooltipContent = (
    <div className="text-xs">
      <p className="font-medium">{config.label}</p>
      {error && <p className="text-destructive mt-1">{error}</p>}
      {lastChecked && (
        <p className="text-muted-foreground mt-1">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      )}
      {status === 'failed' && (
        <button
          onClick={retry}
          className="mt-2 text-primary hover:underline"
        >
          Click to retry
        </button>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={status === 'failed' ? retry : undefined}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors',
            config.bgColor,
            status === 'failed' && 'cursor-pointer hover:opacity-80',
            className
          )}
          aria-label={`API Status: ${config.label}`}
        >
          <Icon 
            className={cn(
              'h-3.5 w-3.5',
              config.color,
              isLoading && 'animate-spin'
            )} 
          />
          {showLabel && (
            <span className={cn('text-xs font-medium', config.color)}>
              {config.label}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}
