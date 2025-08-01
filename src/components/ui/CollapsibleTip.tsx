import { useState } from "react";
import { lazy, Suspense } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

// Lazy load framer-motion components
const MotionDiv = lazy(() =>
  import('framer-motion').then(mod => ({ default: mod.motion.div }))
);
const AnimatePresence = lazy(() =>
  import('framer-motion').then(mod => ({ default: mod.AnimatePresence }))
);

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
        <InformationCircleIcon className="w-4 h-4 mr-1" />
        <span>{title}</span>
      </button>

      <Suspense fallback={<div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-gray-700">{children}</div>}>
        <AnimatePresence>
          {isOpen && (
            <MotionDiv
              id="tip-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-gray-700">
                {children}
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
};
