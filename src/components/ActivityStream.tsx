/**
 * Activity Stream Component
 * SAS Market Validation Platform
 *
 * Real-time activity display (Claude Code/Cursor style).
 * Shows live updates as modules are processed.
 */

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
  useActivityStream,
  getActivityIcon,
  getActivityColorClass,
  type Activity,
  type ActivityType,
} from '@/hooks/useActivityStream';
import {
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';

interface ActivityStreamProps {
  analysisId: string;
  modules: string[];
  className?: string;
}

interface ModuleStatus {
  status: 'queued' | 'running' | 'completed' | 'failed' | 'hitl_pending';
  activities: Activity[];
}

/**
 * Get module display name from type
 */
function getModuleDisplayName(moduleType: string): string {
  const names: Record<string, string> = {
    market_demand: 'Market Demand',
    revenue_intelligence: 'Revenue Intelligence',
    competitive_intelligence: 'Competitive Intelligence',
    social_sentiment: 'Social Sentiment',
    linkedin_contacts: 'LinkedIn Contacts',
    google_maps: 'Google Maps',
    financial_modeling: 'Financial Modeling',
    risk_assessment: 'Risk Assessment',
    operational_feasibility: 'Operational Feasibility',
    general: 'General',
  };
  return names[moduleType] || moduleType;
}

/**
 * Determine module status from its activities
 */
function getModuleStatus(activities: Activity[]): ModuleStatus['status'] {
  if (activities.length === 0) return 'queued';

  const lastActivity = activities[activities.length - 1];
  switch (lastActivity.activity_type) {
    case 'agent_complete':
      return 'completed';
    case 'error':
      return 'failed';
    case 'hitl_pending':
      return 'hitl_pending';
    default:
      return 'running';
  }
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: ModuleStatus['status'] }) {
  const variants: Record<
    ModuleStatus['status'],
    { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
  > = {
    queued: { variant: 'outline', label: 'Queued' },
    running: { variant: 'default', label: 'Running' },
    completed: { variant: 'secondary', label: 'Completed' },
    failed: { variant: 'destructive', label: 'Failed' },
    hitl_pending: { variant: 'outline', label: 'Review' },
  };

  const { variant, label } = variants[status];

  return (
    <Badge variant={variant} className="text-xs">
      {status === 'running' && (
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
      )}
      {label}
    </Badge>
  );
}

/**
 * Individual activity item
 */
function ActivityItem({ activity }: { activity: Activity }) {
  const icon = getActivityIcon(activity.activity_type);
  const colorClass = getActivityColorClass(activity.activity_type);
  const timestamp = new Date(activity.created_at).toLocaleTimeString();

  // Ensure message is a string (not an object)
  const message = typeof activity.message === 'object'
    ? JSON.stringify(activity.message)
    : String(activity.message || '');

  return (
    <div className="flex items-start gap-2 py-1 font-mono text-sm">
      <span className={cn('flex-shrink-0', colorClass)}>{icon}</span>
      <span className="flex-1 text-muted-foreground">{message}</span>
      <span className="flex-shrink-0 text-xs text-muted-foreground/50">
        {timestamp}
      </span>
    </div>
  );
}

/**
 * Module section with collapsible activities
 */
function ModuleSection({
  moduleType,
  activities,
  isExpanded,
  onToggle,
}: {
  moduleType: string;
  activities: Activity[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const status = getModuleStatus(activities);
  const displayName = getModuleDisplayName(moduleType);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md transition-colors">
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{displayName}</span>
        </div>
        <StatusBadge status={status} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 pl-4 border-l border-border/50">
          {activities.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground italic">
              Waiting to start...
            </p>
          ) : (
            activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Connection status indicator
 */
function ConnectionStatus({
  isConnected,
  isStreaming,
  error,
  onReconnect,
}: {
  isConnected: boolean;
  isStreaming: boolean;
  error: Error | null;
  onReconnect?: () => void;
}) {
  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive text-xs">
        <WifiOff className="h-3 w-3" />
        <span>Disconnected</span>
        {onReconnect && (
          <button
            onClick={onReconnect}
            className="underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isStreaming) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-500">
        <Wifi className="h-3 w-3" />
        <span className="flex items-center gap-1">
          Streaming
          <span className="flex gap-0.5">
            <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '200ms' }} />
            <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '400ms' }} />
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs',
        isConnected ? 'text-green-500' : 'text-muted-foreground'
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Live</span>
        </>
      ) : (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Connecting...</span>
        </>
      )}
    </div>
  );
}

/**
 * Main Activity Stream Component
 */
export function ActivityStream({
  analysisId,
  modules,
  className,
}: ActivityStreamProps) {
  const { activities, activitiesByModule, isConnected, isStreaming, error, reconnect } =
    useActivityStream(analysisId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Safely extract module type strings from the modules prop
  // Handles both string[] and object[] (AnalysisModule[]) cases
  const moduleTypes: string[] = modules.map((m) => {
    if (typeof m === 'string') return m;
    if (typeof m === 'object' && m !== null) {
      // Handle AnalysisModule objects with 'type' or 'module_type' properties
      return (m as Record<string, unknown>).type as string
        || (m as Record<string, unknown>).module_type as string
        || String(m);
    }
    return String(m);
  }).filter(Boolean);

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities.length]);

  // Determine which modules are currently active (for auto-expand)
  const activeModules = new Set(
    activities
      .filter((a) => {
        const type = a.activity_type;
        return type !== 'agent_complete' && type !== 'error';
      })
      .map((a) => a.module_type || 'general')
  );

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Activity Stream</CardTitle>
          <ConnectionStatus
            isConnected={isConnected}
            isStreaming={isStreaming}
            error={error}
            onReconnect={reconnect}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] px-4" ref={scrollRef}>
          <div className="space-y-1 py-2">
            {/* General activities (not module-specific) */}
            {activitiesByModule['general']?.length > 0 && (
              <div className="mb-4 pb-2 border-b border-border/50">
                {activitiesByModule['general'].map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}

            {/* Module sections */}
            {moduleTypes.map((moduleType) => {
              const moduleActivities = activitiesByModule[moduleType] || [];
              const isActive = activeModules.has(moduleType);
              const hasCompleted =
                moduleActivities.some(
                  (a) =>
                    a.activity_type === 'agent_complete' ||
                    a.activity_type === 'error'
                );

              return (
                <ModuleSection
                  key={moduleType}
                  moduleType={moduleType}
                  activities={moduleActivities}
                  isExpanded={isActive || !hasCompleted}
                  onToggle={() => {}}
                />
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ActivityStream;
