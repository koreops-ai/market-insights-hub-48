/**
 * Block Skeleton Components
 * Progressive rendering placeholders with pulse animations
 *
 * Shows animated skeletons while content is being generated,
 * similar to Gamma.ai's streaming UI.
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Base skeleton with pulse animation
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

// Animated skeleton with gradient sweep
function AnimatedSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        className
      )}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ translateX: ['0%', '200%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

/**
 * Title skeleton - for headings
 */
export function TitleSkeleton({ isGenerating = false }: { isGenerating?: boolean }) {
  const Component = isGenerating ? AnimatedSkeleton : Skeleton;
  return (
    <div className="space-y-2">
      <Component className="h-8 w-2/3" />
    </div>
  );
}

/**
 * Section header skeleton
 */
export function SectionSkeleton({ isGenerating = false }: { isGenerating?: boolean }) {
  const Component = isGenerating ? AnimatedSkeleton : Skeleton;
  return (
    <div className="space-y-2 pt-4">
      <Component className="h-6 w-1/2" />
      <Component className="h-px w-full opacity-50" />
    </div>
  );
}

/**
 * Paragraph skeleton - for text blocks
 */
export function ParagraphSkeleton({
  lines = 4,
  isGenerating = false
}: {
  lines?: number;
  isGenerating?: boolean;
}) {
  const Component = isGenerating ? AnimatedSkeleton : Skeleton;
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Component
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-4/5' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Bullet list skeleton
 */
export function BulletsSkeleton({
  count = 4,
  isGenerating = false
}: {
  count?: number;
  isGenerating?: boolean;
}) {
  const Component = isGenerating ? AnimatedSkeleton : Skeleton;
  return (
    <div className="space-y-3 pl-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-2">
          <Component className="h-2 w-2 rounded-full flex-shrink-0 mt-2" />
          <Component className={cn(
            'h-4',
            i % 2 === 0 ? 'w-4/5' : 'w-3/5'
          )} />
        </div>
      ))}
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({
  rows = 4,
  cols = 4,
  isGenerating = false
}: {
  rows?: number;
  cols?: number;
  isGenerating?: boolean;
}) {
  const Component = isGenerating ? AnimatedSkeleton : Skeleton;
  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header row */}
      <div className="flex border-b bg-muted/50">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 p-3">
            <Component className="h-4 w-3/4" />
          </div>
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex border-b last:border-0">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="flex-1 p-3">
              <Component className={cn(
                'h-4',
                colIdx === 0 ? 'w-4/5' : 'w-2/3'
              )} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Chart skeleton
 */
export function ChartSkeleton({
  type = 'bar',
  isGenerating = false
}: {
  type?: 'bar' | 'line' | 'pie';
  isGenerating?: boolean;
}) {
  const Component = isGenerating ? AnimatedSkeleton : Skeleton;

  if (type === 'pie') {
    return (
      <div className="flex items-center justify-center p-8">
        <Component className="h-48 w-48 rounded-full" />
      </div>
    );
  }

  // Bar or line chart
  return (
    <div className="p-4 rounded-lg border">
      {/* Y-axis labels */}
      <div className="flex">
        <div className="flex flex-col justify-between h-48 pr-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Component key={i} className="h-3 w-8" />
          ))}
        </div>
        {/* Chart area */}
        <div className="flex-1 flex items-end justify-around gap-2 h-48 border-l border-b">
          {type === 'bar' ? (
            // Bar chart
            Array.from({ length: 6 }).map((_, i) => (
              <Component
                key={i}
                className="w-8"
                style={{ height: `${30 + Math.random() * 60}%` }}
              />
            ))
          ) : (
            // Line chart placeholder
            <div className="w-full h-full flex items-center justify-center">
              <Component className="h-full w-full opacity-30" />
            </div>
          )}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-around mt-2 ml-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <Component key={i} className="h-3 w-12" />
        ))}
      </div>
    </div>
  );
}

/**
 * Image skeleton
 */
export function ImageSkeleton({ isGenerating = false }: { isGenerating?: boolean }) {
  const Component = isGenerating ? AnimatedSkeleton : Skeleton;
  return (
    <div className="rounded-lg border overflow-hidden">
      <Component className="h-48 w-full" />
      <div className="p-3">
        <Component className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/**
 * Module output skeleton - full module placeholder
 */
export function ModuleOutputSkeleton({
  moduleName,
  isGenerating = false
}: {
  moduleName: string;
  isGenerating?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 rounded-lg border bg-card"
    >
      <div className="flex items-center gap-2">
        {isGenerating && (
          <motion.div
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        <span className="text-sm font-medium text-muted-foreground">
          {isGenerating ? `Generating ${moduleName}...` : moduleName}
        </span>
      </div>
      <SectionSkeleton isGenerating={isGenerating} />
      <ParagraphSkeleton lines={3} isGenerating={isGenerating} />
      <BulletsSkeleton count={3} isGenerating={isGenerating} />
      <ChartSkeleton type="bar" isGenerating={isGenerating} />
    </motion.div>
  );
}

/**
 * Streaming cursor - blinking indicator at end of text
 */
export function StreamingCursor() {
  return (
    <motion.span
      className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-text-bottom"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
  );
}

/**
 * Block wrapper with fade-in animation
 */
export function AnimatedBlock({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
}

export { Skeleton, AnimatedSkeleton };
