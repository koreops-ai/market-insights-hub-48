import { useState } from 'react';
import { Search, Filter, Download, Eye, Trash2, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const reports = [
  {
    id: '1',
    name: 'E-commerce Platform Analysis',
    type: 'Full Validation',
    date: '2024-01-15',
    status: 'completed',
    score: 85,
  },
  {
    id: '2',
    name: 'SaaS Market Entry Strategy',
    type: 'Market Size',
    date: '2024-01-14',
    status: 'completed',
    score: 72,
  },
  {
    id: '3',
    name: 'Healthcare App Validation',
    type: 'Competitor Analysis',
    date: '2024-01-13',
    status: 'in-progress',
    score: null,
  },
  {
    id: '4',
    name: 'FinTech Competitor Analysis',
    type: 'Full Validation',
    date: '2024-01-12',
    status: 'completed',
    score: 91,
  },
  {
    id: '5',
    name: 'EdTech Growth Opportunity',
    type: 'Growth Opportunity',
    date: '2024-01-10',
    status: 'completed',
    score: 68,
  },
];

export function Reports() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter((report) =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Reports</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your market validation reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>{reports.length} total reports</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{report.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{report.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(report.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === 'completed' ? 'default' : 'outline'
                      }
                      className={
                        report.status === 'completed'
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-warning/10 text-warning border-warning/20'
                      }
                    >
                      {report.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.score !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${report.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{report.score}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
