import { Search, Book, MessageCircle, Video, FileQuestion, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const helpCategories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of market validation',
    icon: Book,
    articles: 12,
  },
  {
    title: 'Analysis Types',
    description: 'Understand different analysis methods',
    icon: FileQuestion,
    articles: 8,
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step visual guides',
    icon: Video,
    articles: 15,
  },
  {
    title: 'Contact Support',
    description: 'Get help from our team',
    icon: MessageCircle,
    articles: null,
  },
];

const faqItems = [
  {
    question: 'How are credits calculated?',
    answer: 'Credits are based on the complexity of the analysis. Market Size analyses use 50 credits, Competitor Analysis uses 75, Growth Opportunity uses 100, and Full Validation uses 200 credits.',
  },
  {
    question: 'Can I export my reports?',
    answer: 'Yes, all completed reports can be exported in PDF, Excel, or PowerPoint format. Premium plans also support API access for automated exports.',
  },
  {
    question: 'How accurate are the market size estimates?',
    answer: 'Our market size estimates are derived from multiple data sources and validated against industry benchmarks. Accuracy typically ranges from 85-95% depending on the market segment.',
  },
  {
    question: 'Can I share reports with my team?',
    answer: 'Team plans allow unlimited sharing within your organization. You can also generate shareable links for external stakeholders with view-only access.',
  },
];

export function Help() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">How can we help?</h1>
        <p className="text-muted-foreground">
          Search our knowledge base or browse categories below
        </p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for help articles..."
            className="pl-12 h-12 text-base"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {helpCategories.map((category) => (
          <Card
            key={category.title}
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5 group"
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.title}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                  {category.articles && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {category.articles} articles
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqItems.map((faq, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <h4 className="font-medium mb-2">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          <div>
            <h3 className="font-semibold text-lg">Still need help?</h3>
            <p className="text-muted-foreground">
              Our support team is available 24/7
            </p>
          </div>
          <Button className="glow-primary">
            <MessageCircle className="mr-2 w-4 h-4" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
