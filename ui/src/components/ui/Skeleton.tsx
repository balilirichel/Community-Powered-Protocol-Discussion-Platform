import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = '1rem', className = '', rounded = true }) => (
  <div
    aria-hidden
    className={[
      'bg-gray-100 animate-pulse',
      rounded ? 'rounded-md' : '',
      typeof width === 'number' ? `w-[${width}px]` : '',
      typeof height === 'number' ? `h-[${height}px]` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    style={{ width: typeof width === 'string' ? width : undefined, height: typeof height === 'string' ? height : undefined }}
  />
);

export default Skeleton;
