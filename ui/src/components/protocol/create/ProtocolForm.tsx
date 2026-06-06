import React, { useState } from 'react';
import { Heading } from 'lucide-react';
import { protocolService } from '../../../api/protocolService';
import type { Protocol, CreateProtocolRequest } from '../../../types/protocol';
import type { ApiError } from '../../../types/api';
import ProtocolTagsInput from './ProtocolTagsInput';
import ProtocolContentEditor from './ProtocolContentEditor';
import FormActions from './FormActions';
import ValidationMessage from './ValidationMessage';

// ****Form field validation ────────────────────────────────────────────────────
interface FieldErrors {
  title?: string;
  content?: string;
  tags?: string;
}

const MIN_TITLE_LENGTH = 5;
const MIN_CONTENT_LENGTH = 20;

function validate(title: string, content: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!title.trim()) {
    errors.title = 'Title is required.';
  } else if (title.trim().length < MIN_TITLE_LENGTH) {
    errors.title = `Title must be at least ${MIN_TITLE_LENGTH} characters.`;
  } else if (title.trim().length > 255) {
    errors.title = 'Title must be at most 255 characters.';
  }

  if (!content.trim()) {
    errors.content = 'Content is required.';
  } else if (content.trim().length < MIN_CONTENT_LENGTH) {
    errors.content = `Content must be at least ${MIN_CONTENT_LENGTH} characters.`;
  }

  return errors;
}

// ****Props ***********//***─────────────
interface ProtocolFormProps {
  onSuccess: (protocol: Protocol) => void;
  onCancel: () => void;
  initialData?: Protocol;
  isEditing?: boolean;
}

// ****Protocol Form ***********//***─────
const ProtocolForm: React.FC<ProtocolFormProps> = ({ onSuccess, onCancel, initialData, isEditing = false }) => {
  // ── Form state ──
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);

  // ── Submission state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Validation state ──
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ title?: boolean; content?: boolean }>({});

  // ── Derived ──
  const validationErrors = validate(title, content);
  const isFormValid = Object.keys(validationErrors).length === 0;

  const getFieldError = (field: keyof FieldErrors): string | undefined => {
    if (!touched[field as 'title' | 'content']) return undefined;
    return fieldErrors[field] ?? validationErrors[field];
  };

  const handleBlur = (field: 'title' | 'content') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors(validate(title, content));
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields to show validation
    setTouched({ title: true, content: true });
    const errors = validate(title, content);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        ...(tags.length > 0 && { tags }),
      };

      const result = isEditing && initialData
        ? await protocolService.update(initialData.id, payload)
        : await protocolService.create(payload);

      onSuccess(result);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errors) {
        // Map backend validation errors to field-level errors
        const mapped: FieldErrors = {};
        if (apiError.errors.title) mapped.title = apiError.errors.title[0];
        if (apiError.errors.content) mapped.content = apiError.errors.content[0];
        if (apiError.errors.tags) mapped.tags = apiError.errors.tags[0];
        setFieldErrors(mapped);
      } else {
        setSubmitError(apiError.message ?? 'Failed to save protocol. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ── Title field ── */}
      <div>
        <label
          htmlFor="protocol-title"
          className="text-sm font-semibold text-gray-700 block mb-1.5"
        >
          <span className="flex items-center gap-1.5">
            <Heading size={14} className="text-gray-400" />
            Title <span className="text-red-400">*</span>
          </span>
        </label>
        <input
          id="protocol-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleBlur('title')}
          placeholder="Give your protocol a clear, descriptive title…"
          maxLength={255}
          aria-required="true"
          aria-describedby={getFieldError('title') ? 'title-error' : undefined}
          className={[
            'w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder-gray-400',
            'focus:outline-none focus:ring-2 transition-colors',
            getFieldError('title')
              ? 'border-red-300 focus:ring-red-300/40 focus:border-red-400'
              : 'border-gray-200 focus:ring-[#118451]/40 focus:border-[#118451]',
          ].join(' ')}
        />
        <div id="title-error" className="flex items-center justify-between">
          {getFieldError('title') ? (
            <ValidationMessage message={getFieldError('title')!} />
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400 tabular-nums mt-1">
            {title.length}/255
          </span>
        </div>
      </div>

      {/* ── Content editor ── */}
      <ProtocolContentEditor
        value={content}
        onChange={setContent}
        error={getFieldError('content')}
        minLength={MIN_CONTENT_LENGTH}
      />

      {/* ── Tags input ── */}
      <ProtocolTagsInput
        tags={tags}
        onChange={setTags}
        error={fieldErrors.tags}
      />

      {/* ── Global submit error ── */}
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <span className="text-red-500 mt-0.5 flex-shrink-0 text-base leading-none">⚠</span>
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* ── Actions ── */}
      <FormActions
        isSubmitting={isSubmitting}
        isValid={isFormValid}
        onCancel={onCancel}
        isEditing={isEditing}
      />
    </form>
  );
};

export default ProtocolForm;
