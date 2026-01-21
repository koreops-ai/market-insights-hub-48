import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysis, useAnalysisModules, useAnalysisSummary } from '@/hooks/useAnalyses';
import { ActivityStream } from '@/components/ActivityStream';
import { useStreamingAnalysis } from '@/hooks/useStreamingAnalysis';
import { ModuleOutputSkeleton } from '@/components/BlockSkeleton';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

// Module status icon component
function ModuleStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'running':
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

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

  // Use streaming for running analyses
  const analysis = analysisQuery.data;
  const isRunning = analysis?.status === 'running';

  // Connect to SSE stream when analysis is running
  const streaming = useStreamingAnalysis(isRunning ? id || null : null);

  if (analysisQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading report...</div>;
  }

  if (analysisQuery.isError || !analysis) {
    return <div className="text-sm text-destructive">Failed to load report.</div>;
  }

  // Merge module statuses from streaming with static data
  const moduleStatusMap = new Map<string, string>();
  if (isRunning && streaming.moduleStatuses) {
    Object.entries(streaming.moduleStatuses).forEach(([key, value]) => {
      moduleStatusMap.set(key, value.status);
    });
  }

  // Get the list of all expected modules
  // Handle both string[] and object[] formats
  const rawModules = analysis.modules || [];
  const expectedModules: string[] = Array.isArray(rawModules)
    ? rawModules.map((m: unknown) => (typeof m === 'string' ? m : (m as { module_type?: string })?.module_type || ''))
        .filter(Boolean)
    : [];
  const staticModules = modulesQuery.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{analysis.name}</h1>
        <p className="text-muted-foreground mt-1">
          Status: <Badge variant="outline">{analysis.status}</Badge>
        </p>
      </div>

      {/* Live Activity Stream - Show when analysis is running */}
      {isRunning && id && (
        <ActivityStream analysisId={id} modules={(analysis.modules as string[]) || []} />
      )}

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
        <AnimatePresence mode="popLayout">
          {/* Show expected modules with streaming states */}
          {isRunning && expectedModules.map((moduleType) => {
            // Check if we have static data for this module
            const staticModule = staticModules.find((m) => m.module_type === moduleType);
            // Get streaming status
            const streamingStatus = moduleStatusMap.get(moduleType) || 'queued';
            // Get streaming output if available
            const streamingOutput = streaming.moduleOutputs[moduleType];

            // Use static data if available, otherwise show streaming/skeleton
            if (staticModule && staticModule.status === 'completed') {
              return renderModuleCard(staticModule, moduleType, false);
            }

            // Show streaming content or skeleton
            const isActive = streaming.activeModules.includes(moduleType);

            return (
              <motion.div
                key={`streaming-${moduleType}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                layout
              >
                <Card className={isActive ? 'ring-2 ring-primary/50' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base capitalize">
                        {String(moduleType).replace(/_/g, ' ')}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <ModuleStatusIcon status={streamingStatus} />
                        <Badge variant={streamingStatus === 'running' ? 'default' : 'outline'}>
                          {streamingStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    {streamingOutput?.output ? (
                      // Show streaming output
                      <div className="space-y-2">
                        {(streamingOutput.output as any)?.module_synthesis?.summary && (
                          <div>{(streamingOutput.output as any).module_synthesis.summary}</div>
                        )}
                        {(streamingOutput.output as any)?.module_synthesis?.highlights?.length > 0 && (
                          <ul className="list-disc ml-5 space-y-1">
                            {(streamingOutput.output as any).module_synthesis.highlights.map((item: string, i: number) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                {item}
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : streamingStatus === 'running' || streamingStatus === 'queued' ? (
                      // Show skeleton while generating
                      <ModuleOutputSkeleton isGenerating={isActive} />
                    ) : (
                      <div className="text-muted-foreground">Waiting to process...</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Show completed modules when not running */}
          {!isRunning && staticModules.map((module) => renderModuleCard(module, module.module_type, true))}
        </AnimatePresence>
      </div>
    </div>
  );

  // Helper function to render a completed module card
  function renderModuleCard(module: typeof staticModules[0], moduleType: string, animate: boolean) {
    const synthesis = (module.data as any)?.module_synthesis;
    const contacts = (module.data as any)?.companies;
    const places = (module.data as any)?.places;

    const content = (
      <Card key={module.id}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base capitalize">{String(moduleType).replace(/_/g, ' ')}</CardTitle>
            <div className="flex items-center gap-2">
              <ModuleStatusIcon status={module.status} />
              <Badge variant="outline">{module.status}</Badge>
            </div>
          </div>
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
          {moduleType === 'linkedin_contacts' && Array.isArray(contacts) && contacts.length > 0 && (
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
          {moduleType === 'google_maps' && Array.isArray(places) && places.length > 0 && (
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

    if (animate) {
      return (
        <motion.div
          key={module.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          layout
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }
}
