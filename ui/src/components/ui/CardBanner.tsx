import { ShieldCheck, MessageSquareCode } from 'lucide-react';

export default function CardBanner() {
    return (
        <div className="w-full flex justify-center mb-6">
            <div className="w-full max-w-[400px] flex items-center justify-center gap-3 py-1.5 px-2">

                {/* Minimalist Branded Icon Configuration */}
                <div className="relative flex-shrink-0 flex items-center justify-center">
                    <div className="p-2 bg-[#118451]/8 rounded-xl text-[#118451]">
                        <ShieldCheck className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 bg-white p-0.5 rounded-md shadow-xs">
                        <MessageSquareCode className="h-3 w-3 text-[#18ac6a]" />
                    </div>
                </div>

                {/* Inline Structural Context Labeled Content */}
                <div className="flex flex-col">
                    <p className="text-[13px] font-bold text-gray-900 tracking-tight leading-none">
                        Community-Powered Protocol
                    </p>
                    <p className="text-[12px] text-gray-500 font-normal tracking-normal mt-0.5">
                        &amp; Discussion Platform
                    </p>
                </div>

            </div>
        </div>
    );
}