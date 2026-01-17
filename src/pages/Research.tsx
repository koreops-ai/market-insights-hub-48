import { useState } from 'react';
import { ChatPanel } from '@/components/ChatPanel';
import { ResearchCanvas } from '@/components/ResearchCanvas';
import type { JsonBlocksResponse } from '@/types/blocks';

export function Research() {
  const [canvasData, setCanvasData] = useState<JsonBlocksResponse | null>(null);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1">
        <ChatPanel onBlocks={setCanvasData} />
      </div>
      <div className="xl:col-span-2 space-y-4">
        {canvasData?.summary && (
          <div className="text-sm text-muted-foreground">{canvasData.summary}</div>
        )}
        <ResearchCanvas blocks={canvasData?.blocks || []} />
      </div>
    </div>
  );
}
