import { BarChart3, TrendingUp, FileText, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { Link } from 'react-router-dom';

const stats = [
  {
    title: 'Total Analyses',
    value: '127',
    change: '+12%',
    trend: 'up',
    icon: BarChart3,
  },
  {
    title: 'Success Rate',
    value: '84.2%',
    change: '+3.1%',
    trend: 'up',
    icon: TrendingUp,
  },
  {
    title: 'Active Reports',
    value: '23',
    change: '-2',
    trend: 'down',
    icon: FileText,
  },
  {
    title: 'Avg. Analysis Time',
    value: '4.2m',
    change: '-15%',
    trend: 'up',
    icon: Clock,
  },
];

const recentReports = [
  { name: 'E-commerce Platform Analysis', date: '2 hours ago', status: 'completed' },
  { name: 'SaaS Market Entry Strategy', date: '5 hours ago', status: 'completed' },
  { name: 'Healthcare App Validation', date: '1 day ago', status: 'in-progress' },
  { name: 'FinTech Competitor Analysis', date: '2 days ago', status: 'completed' },
];

export function Dashboard() {
  const { name } = useUserStore();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your market validation activity
          </p>
        </div>
        <Button asChild className="glow-primary w-fit">
          <Link to="/new-analysis">
            Start New Analysis
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs mt-1">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-3 h-3 text-success mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-destructive mr-1" />
                )}
                <span
                  className={
                    stat.trend === 'up' ? 'text-success' : 'text-destructive'
                  }
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your latest market validation analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.date}</p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    report.status === 'completed'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {report.status === 'completed' ? 'Completed' : 'In Progress'}
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4">
            View All Reports
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
