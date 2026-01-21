import { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  Coins, 
  ArrowUpRight, 
  Eye, 
  Play, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bell,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  FileText,
  ChevronDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserStore } from '@/stores/userStore';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAnalyses, useDeleteAnalysis, useStartAnalysis } from '@/hooks/useAnalyses';
import { useCheckpoints } from '@/hooks/useHITL';
import { usePresets } from '@/hooks/usePresets';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatApiError } from '@/lib/api-errors';

// Status badge config
const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' },
  running: { label: 'Running', variant: 'default' as const, className: 'bg-primary/20 text-primary animate-pulse' },
  paused: { label: 'Paused', variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' },
  hitl_pending: { label: 'HITL Pending', variant: 'default' as const, className: 'bg-warning/20 text-warning' },
  completed: { label: 'Completed', variant: 'default' as const, className: 'bg-success/20 text-success' },
  failed: { label: 'Failed', variant: 'destructive' as const, className: 'bg-destructive/20 text-destructive' },
};

// Animated number component
function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { name, credits } = useUserStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(true);
  const itemsPerPage = 10;

  // API Queries
  const { 
    data: analysesData, 
    isLoading: analysesLoading, 
    isError: analysesError,
    error: analysesErrorDetails,
    refetch: refetchAnalyses 
  } = useAnalyses(itemsPerPage, (currentPage - 1) * itemsPerPage);

  const { data: checkpoints } = useCheckpoints();
  const { data: presets } = usePresets();

  // Mutations
  const deleteAnalysis = useDeleteAnalysis();
  const startAnalysis = useStartAnalysis();

  // Derived data
  const analyses = analysesData?.analyses || [];
  const totalItems = analysesData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calculate stats from analyses
  const stats = {
    activeAnalyses: analyses.filter(a => a.status === 'running').length,
    pendingHITL: checkpoints?.filter(c => c.status === 'pending').length || 0,
    completedThisMonth: analyses.filter(a => {
      if (a.status !== 'completed') return false;
      const completedDate = new Date(a.updatedAt);
      const now = new Date();
      return completedDate.getMonth() === now.getMonth() && 
             completedDate.getFullYear() === now.getFullYear();
    }).length,
    creditsRemaining: credits,
  };

  // HITL notifications from checkpoints
  const hitlNotifications = checkpoints?.filter(c => c.status === 'pending').map(c => ({
    id: c.id,
    analysisId: c.analysisId,
    analysisName: c.analysisName,
    checkpoint: c.type,
    createdAt: c.createdAt,
  })) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleViewAnalysis = (id: string) => {
    navigate(`/reports/${id}`);
  };

  const handleStartAnalysis = (id: string) => {
    startAnalysis.mutate(id, {
      onSuccess: () => {
        // Navigate to the report page to see live activity stream
        navigate(`/reports/${id}`);
      },
    });
  };

  const handleDeleteAnalysis = (id: string) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      deleteAnalysis.mutate(id);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your market validation activity
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Active Analyses */}
          <Card className="relative overflow-hidden group hover:border-primary/50 transition-colors">
            <Link to="/reports?status=running">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Analyses
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={stats.activeAnalyses} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center group-hover:text-primary transition-colors">
                  View active analyses
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </p>
              </CardContent>
            </Link>
          </Card>

          {/* Pending HITL */}
          <Card className="relative overflow-hidden group hover:border-warning/50 transition-colors">
            <Link to="/reports?status=hitl_pending">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending HITL
                </CardTitle>
                <Clock className="w-4 h-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">
                    <AnimatedNumber value={stats.pendingHITL} />
                  </span>
                  {stats.pendingHITL > 0 && (
                    <Badge className="bg-warning/20 text-warning border-warning/30">
                      Needs Review
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center group-hover:text-warning transition-colors">
                  Review pending items
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </p>
              </CardContent>
            </Link>
          </Card>

          {/* Completed This Month */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed This Month
              </CardTitle>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  <AnimatedNumber value={stats.completedThisMonth} />
                </span>
                <span className="flex items-center text-success text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4" />
                  +23%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                vs last month
              </p>
            </CardContent>
          </Card>

          {/* Credits Remaining */}
          <Card className={cn(
            "relative overflow-hidden",
            credits < 100 && "border-warning/50"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credits Remaining
              </CardTitle>
              <Coins className={cn("w-4 h-4", credits < 100 ? "text-warning" : "text-primary")} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <AnimatedNumber value={credits} />
              </div>
              {credits < 100 ? (
                <Button variant="link" className="p-0 h-auto text-xs text-warning" asChild>
                  <Link to="/admin?tab=billing">
                    Buy More Credits
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Sufficient balance
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="glow-primary">
            <Link to="/new-analysis">
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Load Preset
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {presets && presets.length > 0 ? (
                presets.map((preset) => (
                  <DropdownMenuItem key={preset.id}>
                    {preset.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No presets available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" asChild>
            <Link to="/reports">
              <FileText className="w-4 h-4 mr-2" />
              View All Reports
            </Link>
          </Button>
        </div>

        {/* Recent Analyses Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Analyses</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refetchAnalyses()}
              disabled={analysesLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", analysesLoading && "animate-spin")} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {analysesLoading ? (
              <div className="flex items-center justify-center h-48">
                <LoadingSpinner size="lg" text="Loading analyses..." />
              </div>
            ) : analysesError ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <AlertCircle className="w-12 h-12 text-destructive/50 mb-4" />
                <p className="text-destructive mb-2">Failed to load analyses</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {formatApiError(analysesErrorDetails)}
                </p>
                <Button onClick={() => refetchAnalyses()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : analyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  No analyses yet. Start your first market validation →
                </p>
                <Button asChild>
                  <Link to="/new-analysis">Start New Analysis</Link>
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyses.map((analysis) => (
                      <TableRow 
                        key={analysis.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewAnalysis(analysis.id)}
                      >
                        <TableCell className="font-medium">{analysis.name}</TableCell>
                        <TableCell>
                          <Badge className={statusConfig[analysis.status]?.className || 'bg-muted'}>
                            {statusConfig[analysis.status]?.label || analysis.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={analysis.progress} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-8">
                              {analysis.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(analysis.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleViewAnalysis(analysis.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(analysis.status === 'hitl_pending' || analysis.status === 'draft' || analysis.status === 'paused') && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleStartAnalysis(analysis.id)}
                                disabled={startAnalysis.isPending}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {analysis.status === 'draft' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteAnalysis(analysis.id)}
                                disabled={deleteAnalysis.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages} ({totalItems} total)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence mode="wait">
        {isNotificationsPanelOpen ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:block"
          >
            <Card className="sticky top-6 h-fit">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-warning" />
                  <CardTitle className="text-base">HITL Requests</CardTitle>
                  {hitlNotifications.length > 0 && (
                    <Badge variant="secondary" className="bg-warning/20 text-warning">
                      {hitlNotifications.length}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsNotificationsPanelOpen(false)}
                >
                  <PanelRightClose className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {hitlNotifications.length > 0 ? (
                  hitlNotifications.map((notification) => (
                    <Link
                      key={notification.id}
                      to={`/reports/${notification.analysisId}?checkpoint=${notification.checkpoint}`}
                      className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <p className="font-medium text-sm line-clamp-1">
                        {notification.analysisName}
                      </p>
                      <p className="text-xs text-warning mt-1">
                        {notification.checkpoint}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending reviews
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:block"
          >
            <Button
              variant="outline"
              size="icon"
              className="sticky top-6"
              onClick={() => setIsNotificationsPanelOpen(true)}
            >
              <PanelRightOpen className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
