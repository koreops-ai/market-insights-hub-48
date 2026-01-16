import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    spinner: 'h-4 w-4',
    text: 'text-xs',
    gap: 'gap-1.5',
  },
  md: {
    spinner: 'h-8 w-8',
    text: 'text-sm',
    gap: 'gap-2',
  },
  lg: {
    spinner: 'h-12 w-12',
    text: 'text-base',
    gap: 'gap-3',
  },
};

export function LoadingSpinner({ 
  text, 
  size = 'md', 
  className 
}: LoadingSpinnerProps) {
  const sizes = sizeClasses[size];

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center',
        sizes.gap,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 
        className={cn(
          'animate-spin text-primary',
          sizes.spinner
        )} 
      />
      {text && (
        <span className={cn('text-muted-foreground', sizes.text)}>
          {text}
        </span>
      )}
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );
}

// Full page loading state
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Inline loading for buttons/small areas
export function InlineLoader({ className }: { className?: string }) {
  return <LoadingSpinner size="sm" className={className} />;
}
