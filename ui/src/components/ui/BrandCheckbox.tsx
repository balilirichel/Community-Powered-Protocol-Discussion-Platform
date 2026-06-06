import { Check } from 'lucide-react';

interface BrandCheckboxProps {
    checked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    label: string;
}

export default function BrandCheckbox({
    checked,
    onChange,
    label,
}: BrandCheckboxProps) {
    return (
        <label className="flex items-center space-x-2 cursor-pointer select-none text-[13px] font-medium text-gray-600 font-['Satoshi']">
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only"
                />
                <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${checked
                            ? 'bg-[#118451] border-[#118451]'
                            : 'border-gray-300 bg-white'
                        }`}
                >
                    {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
            </div>
            <span>{label}</span>
        </label>
    );
}