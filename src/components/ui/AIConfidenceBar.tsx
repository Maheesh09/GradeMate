import { cn } from '@/lib/utils';

interface AIConfidenceBarProps {
  value: number; // 0-1 range
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AIConfidenceBar = ({ value, size = 'md', className }: AIConfidenceBarProps) => {
  const percentage = Math.round(value * 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-gray-700'; // High confidence - dark gray
    if (confidence >= 0.6) return 'bg-gray-500'; // Medium confidence - medium gray  
    return 'bg-gray-300'; // Low confidence - light gray
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">
          AI Confidence: {getConfidenceLabel(value)}
        </span>
        <span className="font-medium">{percentage}%</span>
      </div>
      
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            getConfidenceColor(value)
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`AI confidence: ${percentage}%`}
        />
      </div>
      
      {/* Pattern overlay for medium/low confidence visual distinction */}
      {value < 0.8 && (
        <div className="text-xs text-muted-foreground mt-1">
          {value < 0.6 
            ? '⚠️ Manual review recommended' 
            : '📝 Consider reviewing'
          }
        </div>
      )}
    </div>
  );
};

export default AIConfidenceBar;