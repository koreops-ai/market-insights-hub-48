import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysis, useAnalysisModules, useAnalysisSummary } from '@/hooks/useAnalyses';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function ReportDetail() {
  const { id } = useParams();
  const analysisQuery = useAnalysis(id || '');
  const modulesQuery = useAnalysisModules(id || '');
  const summary = useAnalysisSummary(id || '').data as
    | {
        executive_summary?: string;
        go_no_go?: string;
        key_reasons?: string[];
        risks?: string[];
        next_steps?: string[];
        citations?: string[];
      }
    | null
    | undefined;

  if (analysisQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading report...</div>;
  }

  if (analysisQuery.isError || !analysisQuery.data) {
    return <div className="text-sm text-destructive">Failed to load report.</div>;
  }

  const analysis = analysisQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{analysis.name}</h1>
        <p className="text-muted-foreground mt-1">
          Status: <Badge variant="outline">{analysis.status}</Badge>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>High-level analysis details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>Company: {analysis.company_name}</div>
          <div>Product: {analysis.product_name || '—'}</div>
          <div>Target Market: {analysis.target_market || '—'}</div>
          <div>Created: {formatDate(analysis.created_at)}</div>
          <div>Completed: {formatDate(analysis.completed_at)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Synthesis</CardTitle>
          <CardDescription>Go/No-Go recommendation and summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {summary?.executive_summary ? (
            <>
              <div className="font-medium">Recommendation: {summary.go_no_go ?? '—'}</div>
              <div>{summary.executive_summary}</div>
              {summary.key_reasons?.length ? (
                <ul className="list-disc ml-5 space-y-1">
                  {summary.key_reasons.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {summary.risks?.length ? (
                <>
                  <div className="font-medium">Key Risks</div>
                  <ul className="list-disc ml-5 space-y-1">
                    {summary.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {summary.next_steps?.length ? (
                <>
                  <div className="font-medium">Next Steps</div>
                  <ul className="list-disc ml-5 space-y-1">
                    {summary.next_steps.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          ) : (
            <div className="text-muted-foreground">Global synthesis not ready yet.</div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Module Summaries</h2>
        {(modulesQuery.data || []).map((module) => {
          const synthesis = (module.data as any)?.module_synthesis;
          const contacts = (module.data as any)?.companies;
          const places = (module.data as any)?.places;
          return (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle className="text-base">{module.module_type.replace(/_/g, ' ')}</CardTitle>
                <CardDescription>Status: {module.status}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {synthesis?.summary ? (
                  <>
                    <div>{synthesis.summary}</div>
                    {synthesis.highlights?.length ? (
                      <ul className="list-disc ml-5 space-y-1">
                        {synthesis.highlights.map((item: string) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                ) : (
                  <div className="text-muted-foreground">No synthesis available yet.</div>
                )}
                {module.module_type === 'linkedin_contacts' && Array.isArray(contacts) && contacts.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-medium">Top Contacts</div>
                    {contacts.slice(0, 3).map((company: any) => (
                      <div key={company.company}>
                        <div className="text-xs text-muted-foreground">{company.company}</div>
                        <ul className="list-disc ml-5">
                          {(company.contacts || []).slice(0, 5).map((contact: any) => (
                            <li key={`${contact.profile_url}-${contact.name}`}>
                              {contact.name} — {contact.title} ({contact.relevance_score})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {module.module_type === 'google_maps' && Array.isArray(places) && places.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-medium">Top Places</div>
                    <ul className="list-disc ml-5">
                      {places.slice(0, 5).map((place: any) => (
                        <li key={`${place.name}-${place.address ?? ''}`}>
                          {place.name} — {place.rating ?? 'n/a'}★ ({place.reviews_count ?? 'n/a'} reviews)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
