import React from 'react';

interface CategoryPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  active = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={[
        'relative h-full flex items-center text-sm transition-all duration-150 ease-out cursor-pointer flex-shrink-0 font-medium whitespace-nowrap focus-visible:outline-none',
        active
          ? 'text-gray-900 font-bold'
          : 'text-gray-500 hover:text-gray-800',
      ].join(' ')}
    >
      <span>{label}</span>
      
      {/* Active Bottom Indicator Border Line aligned properly to parent flex container boundary */}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#118451] rounded-t-full z-20" />
      )}
    </button>
  );
};

export default CategoryPill;