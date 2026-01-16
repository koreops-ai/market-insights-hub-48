import { ArrowRight, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const analysisTypes = [
  {
    title: 'Market Size Analysis',
    description: 'Estimate TAM, SAM, and SOM for your target market',
    icon: Target,
    credits: 50,
  },
  {
    title: 'Competitor Analysis',
    description: 'Deep dive into competitive landscape and positioning',
    icon: Users,
    credits: 75,
  },
  {
    title: 'Growth Opportunity',
    description: 'Identify expansion opportunities and market trends',
    icon: TrendingUp,
    credits: 100,
  },
  {
    title: 'Full Validation',
    description: 'Complete market validation with all analyses combined',
    icon: Sparkles,
    credits: 200,
  },
];

export function NewAnalysis() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Start a new market validation analysis for your product or idea
        </p>
      </div>

      {/* Analysis Type Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select Analysis Type</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {analysisTypes.map((type) => (
            <Card
              key={type.title}
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5 group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <type.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {type.credits} credits
                  </span>
                </div>
                <CardTitle className="text-lg mt-3">{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Details</CardTitle>
          <CardDescription>
            Provide information about your product or market
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product/Company Name</Label>
            <Input
              id="product-name"
              placeholder="Enter your product or company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product, service, or business idea..."
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-market">Target Market</Label>
            <Input
              id="target-market"
              placeholder="e.g., Small businesses in North America"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="competitors">Known Competitors (optional)</Label>
            <Input
              id="competitors"
              placeholder="e.g., Competitor A, Competitor B"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline">Save as Draft</Button>
            <Button className="glow-primary">
              Start Analysis
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
