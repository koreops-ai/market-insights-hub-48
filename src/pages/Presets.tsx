import { Plus, MoreHorizontal, Copy, Pencil, Trash2, Bookmark } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const presets = [
  {
    id: '1',
    name: 'SaaS B2B Default',
    description: 'Standard settings for B2B SaaS market validation',
    analyses: ['Market Size', 'Competitor Analysis', 'Growth Opportunity'],
    usageCount: 24,
  },
  {
    id: '2',
    name: 'Consumer App Quick',
    description: 'Fast validation for consumer mobile applications',
    analyses: ['Market Size', 'Competitor Analysis'],
    usageCount: 18,
  },
  {
    id: '3',
    name: 'Enterprise Full',
    description: 'Comprehensive validation for enterprise solutions',
    analyses: ['Full Validation'],
    usageCount: 12,
  },
  {
    id: '4',
    name: 'Startup MVP',
    description: 'Lean validation for early-stage startups',
    analyses: ['Market Size'],
    usageCount: 31,
  },
];

export function Presets() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Presets</h1>
          <p className="text-muted-foreground mt-1">
            Save and reuse your analysis configurations
          </p>
        </div>
        <Button className="glow-primary w-fit">
          <Plus className="mr-2 w-4 h-4" />
          Create Preset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset) => (
          <Card key={preset.id} className="group hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-primary" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg mt-3">{preset.name}</CardTitle>
              <CardDescription>{preset.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {preset.analyses.map((analysis) => (
                    <span
                      key={analysis}
                      className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                    >
                      {analysis}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    Used {preset.usageCount} times
                  </span>
                  <Button size="sm" variant="secondary">
                    Use Preset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
