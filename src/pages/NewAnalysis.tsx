import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateAnalysis, useStartAnalysis } from '@/hooks/useAnalyses';
import { useAuth } from '@/hooks/useAuth';
import { formatApiError } from '@/lib/api-errors';
import { createApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ModuleType, SocialPlatform } from '@/types/api';
import { z } from 'zod';

// Validation schema
const analysisSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(100, 'Name must be less than 100 characters'),
  productName: z.string().trim().max(100, 'Product name must be less than 100 characters').optional(),
  description: z.string().trim().max(2000, 'Description must be less than 2000 characters').optional(),
  targetMarket: z.string().trim().max(200, 'Target market must be less than 200 characters').optional(),
  competitors: z.string().trim().max(500, 'Competitors must be less than 500 characters').optional(),
  decisionQuestion: z.string().trim().max(500, 'Decision question must be less than 500 characters').optional(),
  selectedModules: z.array(z.string()).min(1, 'Please select at least one module'),
});

type FormData = z.infer<typeof analysisSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

const moduleOptions: Array<{
  id: ModuleType;
  title: string;
  description: string;
  credits: number;
}> = [
  {
    id: 'market_demand',
    title: 'Market Demand',
    description: 'TAM/SAM/SOM sizing, keywords, and market trends',
    credits: 15,
  },
  {
    id: 'revenue_intelligence',
    title: 'Revenue Intelligence',
    description: 'Pricing and revenue signals from comparable offerings',
    credits: 20,
  },
  {
    id: 'competitive_intelligence',
    title: 'Competitive Intelligence',
    description: 'Competitor mapping, positioning, and differentiation',
    credits: 25,
  },
  {
    id: 'social_sentiment',
    title: 'Social Sentiment',
    description: 'Sentiment themes and notable mentions across platforms',
    credits: 10,
  },
  {
    id: 'linkedin_contacts',
    title: 'LinkedIn Contacts',
    description: 'Key roles, profiles, and relevance scoring for target companies',
    credits: 12,
  },
  {
    id: 'google_maps',
    title: 'Google Maps Intelligence',
    description: 'Local listings, ratings, and review signals from Maps',
    credits: 12,
  },
  {
    id: 'financial_modeling',
    title: 'Financial Modeling',
    description: 'Unit economics, projections, and valuation scenarios',
    credits: 10,
  },
  {
    id: 'risk_assessment',
    title: 'Risk Assessment',
    description: 'Key risks and mitigation strategies',
    credits: 10,
  },
  {
    id: 'operational_feasibility',
    title: 'Operational Feasibility',
    description: 'Resourcing, timelines, and execution feasibility',
    credits: 15,
  },
];

const fullValidationModules: ModuleType[] = moduleOptions.map((module) => module.id);

const socialPlatformOptions: Array<{ id: SocialPlatform; label: string }> = [
  { id: 'amazon_reviews', label: 'Amazon Reviews' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'twitter', label: 'Twitter/X' },
  { id: 'trustpilot', label: 'Trustpilot' },
  { id: 'quora', label: 'Quora' },
  { id: 'youtube', label: 'YouTube' },
];

const initialFormData: FormData = {
  companyName: '',
  productName: '',
  description: '',
  targetMarket: '',
  competitors: '',
  decisionQuestion: '',
  selectedModules: fullValidationModules,
};

export function NewAnalysis() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createAnalysis = useCreateAnalysis();
  const startAnalysis = useStartAnalysis();
  const { userId } = useAuth();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [analysisMode, setAnalysisMode] = useState<'full' | 'custom'>('full');
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>(fullValidationModules);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['reddit', 'twitter']);
  const [suggestionNote, setSuggestionNote] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleModeSelect = (mode: 'full' | 'custom') => {
    setAnalysisMode(mode);
    const nextModules = mode === 'full' ? fullValidationModules : selectedModules;
    setSelectedModules(nextModules);
    setFormData(prev => ({ ...prev, selectedModules: nextModules }));
    if (errors.selectedModules) {
      setErrors(prev => ({ ...prev, selectedModules: undefined }));
    }
  };

  const toggleModule = (moduleId: ModuleType, checked: boolean) => {
    const nextModules = checked
      ? [...selectedModules, moduleId]
      : selectedModules.filter((id) => id !== moduleId);
    setSelectedModules(nextModules);
    setFormData(prev => ({ ...prev, selectedModules: nextModules }));
    if (errors.selectedModules) {
      setErrors(prev => ({ ...prev, selectedModules: undefined }));
    }
  };

  const togglePlatform = (platform: SocialPlatform, checked: boolean) => {
    const nextPlatforms = checked
      ? [...selectedPlatforms, platform]
      : selectedPlatforms.filter((id) => id !== platform);
    setSelectedPlatforms(nextPlatforms);
  };

  const validateForm = (): boolean => {
    try {
      analysisSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof FormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setAnalysisMode('full');
    setSelectedModules(fullValidationModules);
    setSelectedPlatforms(['reddit', 'twitter']);
    setSuggestionNote(null);
    setErrors({});
  };

  const handleSuggestModules = async () => {
    if (!formData.companyName.trim()) {
      toast({ title: 'Company name required', description: 'Enter a company name to get AI recommendations.' });
      return;
    }
    setIsSuggesting(true);
    setSuggestionNote(null);
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const client = createApi(userId);
      const suggestion = await client.suggestModules({
        decision_question: formData.decisionQuestion || undefined,
        company_name: formData.companyName,
        product_name: formData.productName || undefined,
        description: formData.description || undefined,
        target_market: formData.targetMarket || undefined,
      });
      const nextModules = (suggestion.recommended_modules || [])
        .filter((mod) => moduleOptions.some((option) => option.id === mod));
      if (nextModules.length > 0) {
        setSelectedModules(nextModules as ModuleType[]);
        setFormData((prev) => ({ ...prev, selectedModules: nextModules }));
        setAnalysisMode('custom');
      }
      if (suggestion.recommended_social_platforms?.length) {
        const platforms = suggestion.recommended_social_platforms.filter((p) =>
          socialPlatformOptions.some((opt) => opt.id === p)
        ) as SocialPlatform[];
        if (platforms.length > 0) {
          setSelectedPlatforms(platforms);
        }
      }
      setSuggestionNote(suggestion.rationale || 'AI recommended a module plan.');
    } catch (error) {
      toast({
        title: 'AI suggestion failed',
        description: error instanceof Error ? error.message : 'Could not generate recommendations.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = async (asDraft: boolean = false) => {
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
      });
      return;
    }

    try {
      const result = await createAnalysis.mutateAsync({
        name: formData.companyName,
        company_name: formData.companyName,
        product_name: formData.productName || undefined,
        description: formData.description || undefined,
        target_market: formData.targetMarket || undefined,
        selected_modules: selectedModules,
        social_platforms: selectedModules.includes('social_sentiment')
          ? selectedPlatforms
          : undefined,
      });

      toast({
        title: asDraft ? 'Draft Saved' : 'Analysis Started',
        description: asDraft 
          ? 'Your analysis has been saved as a draft' 
          : 'Your analysis is now running',
      });

      if (!asDraft) {
        await startAnalysis.mutateAsync(result.id);
      }

      resetForm();
      navigate(`/reports/${result.id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: formatApiError(error),
      });
    }
  };

  const isSubmitting = createAnalysis.isPending || startAnalysis.isPending;
  const isSentimentSelected = selectedModules.includes('social_sentiment');

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Start a new market validation analysis for your product or idea
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* AI-first Intake */}
      <Card>
        <CardHeader>
          <CardTitle>AI-first Intake</CardTitle>
          <CardDescription>Describe the decision you need to make and let the AI recommend modules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decision-question">Decision Question</Label>
            <Textarea
              id="decision-question"
              placeholder="e.g., Should we enter the SEA market with a mid-market AI support product?"
              value={formData.decisionQuestion}
              onChange={(e) => handleInputChange('decisionQuestion', e.target.value)}
              rows={3}
            />
          </div>
          <Button type="button" onClick={handleSuggestModules} disabled={isSuggesting}>
            {isSuggesting ? 'Recommending...' : 'Recommend Modules'}
          </Button>
          {suggestionNote && (
            <div className="text-sm text-muted-foreground">AI: {suggestionNote}</div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Mode Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select Analysis Mode</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            onClick={() => handleModeSelect('full')}
            className={cn(
              'cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5',
              analysisMode === 'full' && 'border-primary ring-2 ring-primary/20'
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg">Full GTM (Go/No-Go)</CardTitle>
              <CardDescription>
                Runs all modules and produces a comprehensive synthesis
              </CardDescription>
            </CardHeader>
          </Card>
          <Card
            onClick={() => handleModeSelect('custom')}
            className={cn(
              'cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5',
              analysisMode === 'custom' && 'border-primary ring-2 ring-primary/20'
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg">Custom Modules</CardTitle>
              <CardDescription>
                Select only the research modules you need
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        {errors.selectedModules && (
          <p className="text-sm text-destructive">{errors.selectedModules}</p>
        )}
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
            <Label htmlFor="company-name">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company-name"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              disabled={isSubmitting}
              className={cn(errors.companyName && "border-destructive")}
              maxLength={100}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              placeholder="Optional product name"
              value={formData.productName || ''}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product, service, or business idea..."
              className={cn("min-h-[120px]", errors.description && "border-destructive")}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isSubmitting}
              maxLength={2000}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {formData.description?.length || 0}/2000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-market">Target Market</Label>
            <Input
              id="target-market"
              placeholder="e.g., Small businesses in North America"
              value={formData.targetMarket}
              onChange={(e) => handleInputChange('targetMarket', e.target.value)}
              disabled={isSubmitting}
              className={cn(errors.targetMarket && "border-destructive")}
              maxLength={200}
            />
            {errors.targetMarket && (
              <p className="text-sm text-destructive">{errors.targetMarket}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="competitors">Known Competitors (optional)</Label>
            <Input
              id="competitors"
              placeholder="e.g., Competitor A, Competitor B"
              value={formData.competitors}
              onChange={(e) => handleInputChange('competitors', e.target.value)}
              disabled={isSubmitting}
              className={cn(errors.competitors && "border-destructive")}
              maxLength={500}
            />
            {errors.competitors && (
              <p className="text-sm text-destructive">{errors.competitors}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base">Select Modules</Label>
              <p className="text-sm text-muted-foreground">
                {analysisMode === 'full'
                  ? 'Full GTM includes all modules.'
                  : 'Pick the modules you want to run.'}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {moduleOptions.map((module) => (
                <div
                  key={module.id}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3',
                    selectedModules.includes(module.id) && 'border-primary/50'
                  )}
                >
                  <Checkbox
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={(checked) => toggleModule(module.id, Boolean(checked))}
                    disabled={analysisMode === 'full'}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{module.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {module.credits} credits
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isSentimentSelected && (
            <div className="space-y-3">
              <Label className="text-base">Social Platforms</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {socialPlatformOptions.map((platform) => (
                  <label key={platform.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={(checked) => togglePlatform(platform.id, Boolean(checked))}
                    />
                    {platform.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </Button>
            <Button 
              className="glow-primary"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Start Analysis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
