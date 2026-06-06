import React from 'react';
import { CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import Button from '../../ui/Button';
import type { Protocol } from '../../../types/protocol';

interface ProtocolCreatedSuccessProps {
  protocol: Protocol;
  onViewProtocol: () => void;
  onCreateAnother: () => void;
}

const ProtocolCreatedSuccess: React.FC<ProtocolCreatedSuccessProps> = ({
  protocol,
  onViewProtocol,
  onCreateAnother,
}) => (
  <div className="flex flex-col items-center justify-center text-center px-6 py-12 space-y-6">
    {/* Animated check */}
    <div className="relative">
      <div className="w-20 h-20 rounded-full bg-[#e8f5f0] flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
        <CheckCircle2 size={40} className="text-[#118451]" strokeWidth={1.75} />
      </div>
      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-full bg-[#118451]/20 animate-ping" style={{ animationDuration: '1.5s', animationIterationCount: '3' }} />
    </div>

    <div className="space-y-2 max-w-sm">
      <h2 className="text-xl font-extrabold text-gray-900">Protocol Published!</h2>
      <p className="text-sm text-gray-500 leading-relaxed">
        <span className="font-semibold text-gray-800">"{protocol.title}"</span> has been
        successfully shared with the community.
      </p>
    </div>

    {/* Tags preview */}
    {protocol.tags && protocol.tags.length > 0 && (
      <div className="flex flex-wrap justify-center gap-2">
        {protocol.tags.slice(0, 5).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-[#e8f5f0] px-3 py-1 text-xs font-semibold text-[#0f5132]"
          >
            {tag}
          </span>
        ))}
      </div>
    )}

    {/* Actions */}
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
      <Button
        variant="primary"
        size="md"
        fullWidth
        onClick={onViewProtocol}
        icon={<ArrowRight size={16} />}
        iconPosition="right"
      >
        View Protocol
      </Button>
      <Button
        variant="outline"
        size="md"
        fullWidth
        onClick={onCreateAnother}
        icon={<Plus size={16} />}
      >
        Create Another
      </Button>
    </div>
  </div>
);

export default ProtocolCreatedSuccess;
