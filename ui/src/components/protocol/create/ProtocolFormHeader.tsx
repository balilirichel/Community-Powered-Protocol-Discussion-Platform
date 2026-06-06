import React from 'react';
import { ChevronLeft, FileText } from 'lucide-react';

interface ProtocolFormHeaderProps {
  onBack: () => void;
}

const ProtocolFormHeader: React.FC<ProtocolFormHeaderProps> = ({ onBack }) => (
  <div className="relative bg-gradient-to-br from-[#0d6e4f] via-[#118451] to-emerald-400 overflow-hidden">
    {/* Decorative blobs */}
    <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
    <div className="absolute right-8 bottom-0 w-40 h-40 rounded-full bg-white/5" />
    <div className="absolute left-20 -bottom-8 w-28 h-28 rounded-full bg-white/5" />
    <div className="absolute -left-8 top-16 w-24 h-24 rounded-full bg-white/8" />

    {/* Top nav */}
    <div className="relative z-10 flex items-center justify-between px-4 pt-5 pb-2">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
        aria-label="Go back"
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
        <span className="text-sm font-medium">Back</span>
      </button>
    </div>

    {/* Page info */}
    <div className="relative z-10 px-4 pt-3 pb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
          <FileText size={20} color="white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Create Protocol
          </h1>
          <p className="text-white/70 text-sm mt-0.5">
            Share your knowledge with the community
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default ProtocolFormHeader;
