import { useState } from "react";
import { Info } from "lucide-react";

interface CollapsibleTipProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleTip = ({
  title,
  children,
  className = "",
}: CollapsibleTipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`mb-4 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-controls="tip-content"
      >
        <Info className="w-4 h-4 mr-1" />
        <span>{title}</span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};
