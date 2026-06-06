import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ValidationMessageProps {
  message: string;
  type?: 'error' | 'success';
  className?: string;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({
  message,
  type = 'error',
  className = '',
}) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <p
      role={isError ? 'alert' : 'status'}
      className={[
        'flex items-center gap-1.5 text-xs font-medium mt-1.5',
        isError ? 'text-red-500' : 'text-[#118451]',
        className,
      ].join(' ')}
    >
      {isError ? (
        <AlertCircle size={12} className="flex-shrink-0" />
      ) : (
        <CheckCircle2 size={12} className="flex-shrink-0" />
      )}
      {message}
    </p>
  );
};

export default ValidationMessage;
