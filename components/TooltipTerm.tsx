import React, { useState, useRef, useEffect } from 'react';

interface TooltipTermProps {
  term: string;
  definition: string;
}

export const TooltipTerm: React.FC<TooltipTermProps> = ({ term, definition }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);
  
  // Use a button for accessibility
  return (
    <span className="relative inline-block" ref={wrapperRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-primary font-semibold border-b-2 border-dotted border-primary/50 cursor-pointer"
        aria-expanded={isOpen}
      >
        {term}
      </button>
      <div 
        className={`absolute bottom-full mb-2 w-60 sm:w-64 p-3 bg-neutral-800 text-white text-sm rounded-lg shadow-lg transition-all duration-300 z-10 transform -translate-x-1/2 left-1/2 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      >
        {definition}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-neutral-800"></div>
      </div>
    </span>
  );
};