import { cn } from '../lib/utils';

type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
};

export function Skeleton({ 
  className, 
  width, 
  height, 
  rounded = 'rounded-md'
}: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-shimmer bg-github-border/20", 
        rounded,
        className
      )} 
      style={{ 
        width: width, 
        height: height 
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-github-border rounded-md overflow-hidden bg-github-card p-4">
      {/* Status and tags */}
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={80} height={24} rounded="rounded-full" />
        <Skeleton width={40} height={20} rounded="rounded-full" />
      </div>
      
      {/* Project name */}
      <Skeleton className="mb-2" width="70%" height={24} />
      
      {/* Description */}
      <Skeleton className="mb-1" width="100%" height={16} />
      <Skeleton className="mb-1" width="90%" height={16} />
      <Skeleton className="mb-4" width="50%" height={16} />
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        <Skeleton width={60} height={22} rounded="rounded-full" />
        <Skeleton width={70} height={22} rounded="rounded-full" />
        <Skeleton width={50} height={22} rounded="rounded-full" />
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center mt-2">
        <Skeleton width={100} height={20} />
        <div className="flex gap-1">
          <Skeleton width={30} height={30} rounded="rounded-full" />
          <Skeleton width={30} height={30} rounded="rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TimelineEventSkeleton() {
  return (
    <div className="pl-14 relative">
      {/* Timeline dot */}
      <div className="absolute left-4 w-4 h-4 rounded-full bg-github-card border-4 border-github-border transform -translate-x-1/2 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-github-border/50"></div>
      </div>
      
      <div className="border border-github-border rounded-md overflow-hidden">
        <div className="p-4 bg-github-card">
          <div className="flex items-start gap-3">
            <Skeleton width={40} height={40} rounded="rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2" width="60%" height={20} />
              
              {/* Note content */}
              <Skeleton className="mt-2 p-3 mb-2" width="100%" height={60} />
              
              {/* Date */}
              <div className="flex items-center gap-2 mt-2">
                <Skeleton width={120} height={16} />
                <Skeleton width={160} height={16} />
              </div>
              
              {/* Link */}
              <div className="mt-2">
                <Skeleton width={80} height={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <Skeleton className="mb-2" width="60%" height={32} />
        <div className="flex items-center gap-3">
          <Skeleton width={120} height={32} rounded="rounded-md" />
          <Skeleton width={32} height={32} rounded="rounded-md" />
        </div>
      </div>

      {/* Status and priority */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Skeleton width={120} height={28} rounded="rounded-full" />
        <Skeleton width={100} height={28} rounded="rounded-full" />
      </div>

      {/* Description */}
      <div className="mb-6">
        <Skeleton className="mb-2" width={120} height={20} />
        <Skeleton className="mb-1" width="100%" height={16} />
        <Skeleton className="mb-1" width="100%" height={16} />
        <Skeleton className="mb-1" width="90%" height={16} />
        <Skeleton className="mb-1" width="80%" height={16} />
      </div>

      {/* Link */}
      <div className="mb-6">
        <Skeleton className="mb-2" width={80} height={20} />
        <Skeleton width="100%" height={40} rounded="rounded-md" />
      </div>

      {/* Tags */}
      <div className="mb-6">
        <Skeleton className="mb-2" width={80} height={20} />
        <div className="flex flex-wrap gap-2">
          <Skeleton width={80} height={24} rounded="rounded-full" />
          <Skeleton width={90} height={24} rounded="rounded-full" />
          <Skeleton width={70} height={24} rounded="rounded-full" />
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <Skeleton className="mb-2" width={80} height={20} />
        <div className="space-y-3">
          <Skeleton width="100%" height={80} rounded="rounded-md" />
          <Skeleton width="100%" height={80} rounded="rounded-md" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-auto pt-4 border-t border-github-border">
        <div className="flex flex-wrap gap-2">
          <Skeleton width={120} height={36} rounded="rounded-md" />
          <Skeleton width={120} height={36} rounded="rounded-md" />
          <Skeleton width={120} height={36} rounded="rounded-md" />
        </div>
      </div>
    </div>
  );
}