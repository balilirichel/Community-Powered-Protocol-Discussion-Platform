import React from 'react';

interface AvatarProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  verified?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { outer: 'w-6 h-6 text-xs', badge: 'w-2.5 h-2.5 -right-0.5 -bottom-0.5' },
  sm: { outer: 'w-8 h-8 text-sm', badge: 'w-3 h-3 -right-0.5 -bottom-0.5' },
  md: { outer: 'w-10 h-10 text-base', badge: 'w-3.5 h-3.5 -right-0.5 -bottom-0.5' },
  lg: { outer: 'w-14 h-14 text-xl', badge: 'w-4 h-4 -right-0.5 -bottom-0.5' },
};

const getInitials = (name: string = 'U') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const hashColor = (name: string) => {
  const palettes = [
    ['#065c38', '#e8f5f0'],
    ['#118451', '#d1fae5'],
    ['#0d6e4f', '#ecfdf5'],
    ['#047857', '#d1fae5'],
    ['#065f46', '#a7f3d0'],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
};

const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  size = 'md',
  verified = false,
  className = '',
}) => {
  const initials = getInitials(name);
  const [bgColor, textColor] = hashColor(name);
  const { outer, badge } = sizeMap[size];

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div
        className={`${outer} rounded-full flex items-center justify-center font-bold select-none`}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {initials}
      </div>
      {verified && (
        <span
          className={`absolute ${badge} bg-[#118451] rounded-full flex items-center justify-center ring-2 ring-white`}
          aria-label="Verified"
        >
          <svg width="6" height="6" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3.2 5.7L6.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </div>
  );
};

export default Avatar;
