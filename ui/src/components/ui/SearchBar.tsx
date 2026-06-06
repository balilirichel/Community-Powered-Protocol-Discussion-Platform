import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search ....',
  className = '',
  autoFocus = false,
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={18}
        className="absolute left-4 text-gray-400 pointer-events-none"
      />
      <input
        id="search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        className={[
          'w-full pl-11 pr-10 py-3 rounded-[2rem] border border-gray-200',
          'text-sm font-medium text-gray-800 placeholder-gray-400',
          'bg-gray-50 hover:bg-white focus:bg-white',
          'outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451]',
          'transition-all duration-150',
        ].join(' ')}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
