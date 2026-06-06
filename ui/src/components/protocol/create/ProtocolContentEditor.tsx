import React, { useRef, useEffect } from 'react';
import { AlignLeft } from 'lucide-react';
import ValidationMessage from './ValidationMessage';

interface ProtocolContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  minLength?: number;
}

const ProtocolContentEditor: React.FC<ProtocolContentEditorProps> = ({
  value,
  onChange,
  error,
  minLength = 5,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 180)}px`;
  }, [value]);

  const charCount = value.length;
  const isTooShort = charCount > 0 && charCount < minLength;

  return (
    <div>
      <label
        htmlFor="protocol-content"
        className="text-sm font-semibold text-gray-700 block mb-1.5"
      >
        <span className="flex items-center gap-1.5">
          <AlignLeft size={14} className="text-gray-400" />
          Content <span className="text-red-400">*</span>
        </span>
      </label>
      <p className="text-xs text-gray-400 mb-2">
        Describe the protocol in detail — steps, context, rationale, and best practices.
      </p>

      <textarea
        ref={textareaRef}
        id="protocol-content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a thorough description of your protocol. What problem does it solve? What steps are involved? What should users know before following it?"
        aria-required="true"
        aria-describedby={error ? 'content-error' : undefined}
        className={[
          'w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder-gray-400',
          'focus:outline-none focus:ring-2 resize-none transition-colors leading-relaxed',
          'min-h-[180px] overflow-hidden',
          error
            ? 'border-red-300 focus:ring-red-300/40 focus:border-red-400'
            : 'border-gray-200 focus:ring-[#118451]/40 focus:border-[#118451]',
        ].join(' ')}
        style={{ height: 'auto' }}
      />

      <div className="flex items-start justify-between mt-1">
        <div id="content-error">
          {error ? (
            <ValidationMessage message={error} />
          ) : isTooShort ? (
            <ValidationMessage
              message={`Minimum ${minLength} characters required`}
              type="error"
            />
          ) : charCount >= minLength ? (
            <ValidationMessage message="Looks good!" type="success" />
          ) : null}
        </div>
        <span
          className={[
            'text-xs tabular-nums flex-shrink-0 ml-2',
            isTooShort ? 'text-red-400' : 'text-gray-400',
          ].join(' ')}
        >
          {charCount} chars
        </span>
      </div>
    </div>
  );
};

export default ProtocolContentEditor;
