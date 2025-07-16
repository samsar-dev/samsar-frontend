import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingSpinner({ 
  className, 
  size = 'md',
  ...props 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div 
      className={cn(
        'animate-spin inline-block border-2 border-current border-t-transparent rounded-full',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
