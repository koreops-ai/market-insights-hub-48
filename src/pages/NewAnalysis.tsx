import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, TrendingUp, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateAnalysis } from '@/hooks/useAnalyses';
import { formatApiError } from '@/lib/api-errors';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// Validation schema
const analysisSchema = z.object({
  name: z.string().trim().min(1, 'Product/Company name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().trim().max(2000, 'Description must be less than 2000 characters').optional(),
  targetMarket: z.string().trim().max(200, 'Target market must be less than 200 characters').optional(),
  competitors: z.string().trim().max(500, 'Competitors must be less than 500 characters').optional(),
  type: z.string().min(1, 'Please select an analysis type'),
});

type FormData = z.infer<typeof analysisSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

const analysisTypes = [
  {
    id: 'market_size',
    title: 'Market Size Analysis',
    description: 'Estimate TAM, SAM, and SOM for your target market',
    icon: Target,
    credits: 50,
  },
  {
    id: 'competitor_analysis',
    title: 'Competitor Analysis',
    description: 'Deep dive into competitive landscape and positioning',
    icon: Users,
    credits: 75,
  },
  {
    id: 'growth_opportunity',
    title: 'Growth Opportunity',
    description: 'Identify expansion opportunities and market trends',
    icon: TrendingUp,
    credits: 100,
  },
  {
    id: 'full_validation',
    title: 'Full Validation',
    description: 'Complete market validation with all analyses combined',
    icon: Sparkles,
    credits: 200,
  },
];

const initialFormData: FormData = {
  name: '',
  description: '',
  targetMarket: '',
  competitors: '',
  type: '',
};

export function NewAnalysis() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createAnalysis = useCreateAnalysis();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedType, setSelectedType] = useState<string>('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setFormData(prev => ({ ...prev, type: typeId }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: undefined }));
    }
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
    setSelectedType('');
    setErrors({});
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
        name: formData.name,
        type: formData.type,
        description: formData.description || undefined,
        targetMarket: formData.targetMarket || undefined,
        status: asDraft ? 'draft' : 'running',
      });

      toast({
        title: asDraft ? 'Draft Saved' : 'Analysis Started',
        description: asDraft 
          ? 'Your analysis has been saved as a draft' 
          : 'Your analysis is now running',
      });

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

  const isSubmitting = createAnalysis.isPending;

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
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type}</p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {analysisTypes.map((type) => (
            <Card
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={cn(
                "cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5 group",
                selectedType === type.id && "border-primary ring-2 ring-primary/20"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    selectedType === type.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-primary/10 group-hover:bg-primary/20"
                  )}>
                    <type.icon className={cn(
                      "w-5 h-5",
                      selectedType === type.id ? "text-primary-foreground" : "text-primary"
                    )} />
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
            <Label htmlFor="product-name">
              Product/Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-name"
              placeholder="Enter your product or company name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isSubmitting}
              className={cn(errors.name && "border-destructive")}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
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
