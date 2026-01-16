import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  ChevronDown
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
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Types
interface Analysis {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'hitl_pending' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
}

interface HITLNotification {
  id: string;
  analysisId: string;
  analysisName: string;
  checkpoint: string;
  createdAt: string;
}

interface Stats {
  activeAnalyses: number;
  pendingHITL: number;
  completedThisMonth: number;
  creditsRemaining: number;
}

interface Preset {
  id: string;
  name: string;
}

// Mock data
const mockAnalyses: Analysis[] = [
  { id: '1', name: 'E-commerce Platform Analysis', status: 'completed', progress: 100, createdAt: '2024-01-15T10:30:00Z' },
  { id: '2', name: 'SaaS Market Entry Strategy', status: 'running', progress: 67, createdAt: '2024-01-15T09:15:00Z' },
  { id: '3', name: 'Healthcare App Validation', status: 'hitl_pending', progress: 45, createdAt: '2024-01-14T16:20:00Z' },
  { id: '4', name: 'FinTech Competitor Analysis', status: 'completed', progress: 100, createdAt: '2024-01-14T11:00:00Z' },
  { id: '5', name: 'EdTech Market Research', status: 'draft', progress: 0, createdAt: '2024-01-13T14:45:00Z' },
  { id: '6', name: 'Real Estate Platform Study', status: 'failed', progress: 23, createdAt: '2024-01-12T08:30:00Z' },
  { id: '7', name: 'Food Delivery App Analysis', status: 'completed', progress: 100, createdAt: '2024-01-11T12:00:00Z' },
  { id: '8', name: 'Fitness App Market Fit', status: 'running', progress: 82, createdAt: '2024-01-10T15:30:00Z' },
  { id: '9', name: 'Travel Platform Validation', status: 'completed', progress: 100, createdAt: '2024-01-09T09:00:00Z' },
  { id: '10', name: 'Gaming Industry Analysis', status: 'hitl_pending', progress: 55, createdAt: '2024-01-08T17:15:00Z' },
  { id: '11', name: 'AI Tools Market Study', status: 'completed', progress: 100, createdAt: '2024-01-07T10:45:00Z' },
  { id: '12', name: 'Crypto Exchange Analysis', status: 'draft', progress: 0, createdAt: '2024-01-06T13:20:00Z' },
];

const mockHITLNotifications: HITLNotification[] = [
  { id: '1', analysisId: '3', analysisName: 'Healthcare App Validation', checkpoint: 'Market Size Review', createdAt: '2024-01-15T08:30:00Z' },
  { id: '2', analysisId: '10', analysisName: 'Gaming Industry Analysis', checkpoint: 'Competitor Validation', createdAt: '2024-01-14T16:45:00Z' },
  { id: '3', analysisId: '8', analysisName: 'Fitness App Market Fit', checkpoint: 'Pricing Strategy', createdAt: '2024-01-14T11:20:00Z' },
];

const mockPresets: Preset[] = [
  { id: '1', name: 'Quick Market Scan' },
  { id: '2', name: 'Full Competitor Analysis' },
  { id: '3', name: 'Startup Validation' },
  { id: '4', name: 'Enterprise Assessment' },
];

const mockStats: Stats = {
  activeAnalyses: 3,
  pendingHITL: 2,
  completedThisMonth: 12,
  creditsRemaining: 85,
};

// Fetch functions (mock implementations)
const fetchAnalyses = async (page: number): Promise<{ data: Analysis[]; total: number }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const start = (page - 1) * 10;
  return {
    data: mockAnalyses.slice(start, start + 10),
    total: mockAnalyses.length,
  };
};

const fetchStats = async (): Promise<Stats> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockStats;
};

const fetchHITLNotifications = async (): Promise<HITLNotification[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockHITLNotifications;
};

// Status badge config
const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' },
  running: { label: 'Running', variant: 'default' as const, className: 'bg-primary/20 text-primary animate-pulse' },
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
  const { name, credits } = useUserStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(true);

  // Queries
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 30000,
  });

  const { data: analysesData, isLoading: analysesLoading } = useQuery({
    queryKey: ['analyses', currentPage],
    queryFn: () => fetchAnalyses(currentPage),
    refetchInterval: 30000,
  });

  const { data: hitlNotifications } = useQuery({
    queryKey: ['hitl-notifications'],
    queryFn: fetchHITLNotifications,
    refetchInterval: 30000,
  });

  const stats = statsData || mockStats;
  const analyses = analysesData?.data || [];
  const totalPages = Math.ceil((analysesData?.total || 0) / 10);

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
              {mockPresets.map((preset) => (
                <DropdownMenuItem key={preset.id}>
                  {preset.name}
                </DropdownMenuItem>
              ))}
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
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            {analysesLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                      <TableRow key={analysis.id}>
                        <TableCell className="font-medium">{analysis.name}</TableCell>
                        <TableCell>
                          <Badge className={statusConfig[analysis.status].className}>
                            {statusConfig[analysis.status].label}
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
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(analysis.status === 'hitl_pending' || analysis.status === 'draft') && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {analysis.status === 'draft' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
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
                      Page {currentPage} of {totalPages}
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
                  {(hitlNotifications?.length || 0) > 0 && (
                    <Badge variant="secondary" className="bg-warning/20 text-warning">
                      {hitlNotifications?.length}
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
                {hitlNotifications && hitlNotifications.length > 0 ? (
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
