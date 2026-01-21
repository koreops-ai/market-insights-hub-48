/**
 * Research Canvas Component
 * Renders research output blocks with progressive rendering support
 *
 * Supports streaming UI where blocks appear progressively as they're generated,
 * similar to Gamma.ai's presentation builder.
 */

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { JsonBlock } from '@/types/blocks';
import {
  TitleSkeleton,
  SectionSkeleton,
  ParagraphSkeleton,
  BulletsSkeleton,
  TableSkeleton,
  ChartSkeleton,
  ImageSkeleton,
  StreamingCursor,
} from '@/components/BlockSkeleton';

interface ResearchCanvasProps {
  blocks: JsonBlock[];
  isStreaming?: boolean;
  activeBlockIndex?: number;
  streamingText?: string;
  pendingBlockTypes?: string[];
}

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

// Animation variants for blocks
const blockVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/**
 * Skeleton block renderer based on type
 */
function SkeletonBlock({
  type,
  isGenerating = false,
}: {
  type: string;
  isGenerating?: boolean;
}) {
  switch (type) {
    case 'title':
      return <TitleSkeleton isGenerating={isGenerating} />;
    case 'section':
      return <SectionSkeleton isGenerating={isGenerating} />;
    case 'paragraph':
      return <ParagraphSkeleton isGenerating={isGenerating} />;
    case 'bullets':
      return <BulletsSkeleton isGenerating={isGenerating} />;
    case 'table':
      return <TableSkeleton isGenerating={isGenerating} />;
    case 'chart':
      return <ChartSkeleton isGenerating={isGenerating} />;
    case 'image':
      return <ImageSkeleton isGenerating={isGenerating} />;
    default:
      return <ParagraphSkeleton isGenerating={isGenerating} />;
  }
}

export function ResearchCanvas({
  blocks,
  isStreaming = false,
  activeBlockIndex,
  streamingText,
  pendingBlockTypes = [],
}: ResearchCanvasProps) {
  if (!blocks || blocks.length === 0) {
    // Show skeleton if streaming is active
    if (isStreaming && pendingBlockTypes.length > 0) {
      return (
        <div className="space-y-4">
          {pendingBlockTypes.map((type, i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <SkeletonBlock type={type} isGenerating={i === 0} />
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <Card className="p-6 text-sm text-muted-foreground">
        No research output yet. Ask a question to generate the canvas.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {blocks.map((block, index) => {
          const isActive = activeBlockIndex === index;
          const showCursor = isActive && isStreaming;

          return (
            <motion.div
              key={`block-${index}`}
              variants={blockVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <BlockRenderer
                block={block}
                showCursor={showCursor}
                streamingText={isActive ? streamingText : undefined}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Show pending skeletons after rendered blocks */}
      {isStreaming && pendingBlockTypes.length > 0 && (
        <div className="space-y-4">
          {pendingBlockTypes.map((type, i) => (
            <motion.div
              key={`pending-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <SkeletonBlock type={type} isGenerating={i === 0} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Block renderer component
 */
function BlockRenderer({
  block,
  showCursor,
  streamingText,
}: {
  block: JsonBlock;
  showCursor?: boolean;
  streamingText?: string;
}) {
  switch (block.type) {
    case 'title':
      return (
        <h1 className="text-2xl font-semibold">
          {streamingText ?? block.text}
          {showCursor && <StreamingCursor />}
        </h1>
      );

    case 'section':
      return (
        <h2 className="text-lg font-semibold border-b pb-2">
          {streamingText ?? block.text}
          {showCursor && <StreamingCursor />}
        </h2>
      );

    case 'paragraph':
      return (
        <p className="text-sm leading-relaxed text-foreground">
          {streamingText ?? block.text}
          {showCursor && <StreamingCursor />}
        </p>
      );

    case 'bullets':
      return (
        <Card className="p-4">
          {block.title && (
            <div className="font-semibold mb-2">{block.title}</div>
          )}
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {block.items.map((item, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </Card>
      );

    case 'table':
      return (
        <Card className="p-4 overflow-x-auto">
          {block.title && (
            <div className="font-semibold mb-2">{block.title}</div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                {block.columns.map((col, idx) => (
                  <TableHead key={idx}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row, rowIdx) => (
                <motion.tr
                  key={rowIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIdx * 0.03 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {row.map((cell, cellIdx) => (
                    <TableCell key={cellIdx}>{cell}</TableCell>
                  ))}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      );

    case 'chart': {
      const chartData = block.labels.map((label, idx) => {
        const entry: Record<string, string | number> = { label };
        block.series.forEach((series) => {
          entry[series.name] = series.data[idx] ?? 0;
        });
        return entry;
      });

      return (
        <Card className="p-4">
          {block.title && (
            <div className="font-semibold mb-2">{block.title}</div>
          )}
          <motion.div
            className="h-64"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {block.chart_type === 'bar' && (
                <BarChart data={chartData}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {block.series.map((series, i) => (
                    <Bar
                      key={series.name}
                      dataKey={series.name}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </BarChart>
              )}
              {block.chart_type === 'line' && (
                <LineChart data={chartData}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {block.series.map((series, i) => (
                    <Line
                      key={series.name}
                      type="monotone"
                      dataKey={series.name}
                      stroke={PIE_COLORS[i % PIE_COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              )}
              {block.chart_type === 'pie' && (
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={chartData}
                    dataKey={block.series[0]?.name || 'value'}
                    nameKey="label"
                    outerRadius={90}
                  >
                    {chartData.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </motion.div>
        </Card>
      );
    }

    case 'image':
      return (
        <Card className="p-4 space-y-2">
          {block.title && <div className="font-semibold">{block.title}</div>}
          {block.url ? (
            <motion.img
              src={block.url}
              alt={block.description || block.title || 'Generated visual'}
              className="w-full rounded-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              {block.description || 'Image placeholder'}
              {block.prompt && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Prompt: {block.prompt}
                </div>
              )}
            </div>
          )}
        </Card>
      );

    default:
      return null;
  }
}

export default ResearchCanvas;
