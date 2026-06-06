import React, { useState, useRef, type KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';
import ValidationMessage from './ValidationMessage';

interface ProtocolTagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  maxTags?: number;
}

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

const ProtocolTagsInput: React.FC<ProtocolTagsInputProps> = ({
  tags,
  onChange,
  error,
  maxTags = MAX_TAGS,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const value = raw.trim().toLowerCase().replace(/\s+/g, '-');
    if (!value || tags.includes(value) || tags.length >= maxTags || value.length > MAX_TAG_LENGTH) {
      return;
    }
    onChange([...tags, value]);
    setInputValue('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const isFull = tags.length >= maxTags;

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
        <span className="flex items-center gap-1.5">
          <Tag size={14} className="text-gray-400" />
          Tags
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </span>
      </label>

      {/* Tag input container */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={[
          'min-h-[46px] flex flex-wrap gap-2 p-3 rounded-xl border cursor-text transition-colors',
          error
            ? 'border-red-300 focus-within:ring-2 focus-within:ring-red-300/40 focus-within:border-red-400'
            : 'border-gray-200 focus-within:ring-2 focus-within:ring-[#118451]/40 focus-within:border-[#118451]',
        ].join(' ')}
      >
        {/* Existing tags */}
        {tags.map((tag, index) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5f0] px-3 py-1 text-xs font-semibold text-[#0f5132]"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(index); }}
              className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-[#0f5132]/60 hover:text-[#0f5132] hover:bg-[#0f5132]/10 transition-colors cursor-pointer"
              aria-label={`Remove tag ${tag}`}
            >
              <X size={9} strokeWidth={2.5} />
            </button>
          </span>
        ))}

        {/* Input */}
        {!isFull && (
          <input
            ref={inputRef}
            id="protocol-tags-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
            placeholder={tags.length === 0 ? 'Add tags… (Enter or comma to add)' : ''}
            className="flex-1 min-w-[140px] bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            aria-label="Add tag"
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-1">
        {error ? (
          <ValidationMessage message={error} />
        ) : (
          <p className="text-xs text-gray-400">
            Press Enter or comma to add a tag
          </p>
        )}
        <span className="text-xs text-gray-400 tabular-nums">
          {tags.length}/{maxTags}
        </span>
      </div>
    </div>
  );
};

export default ProtocolTagsInput;
