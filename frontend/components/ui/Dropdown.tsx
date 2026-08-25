'use client';

import { useEffect, useRef, useState } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-card border border-gray-100 z-50 py-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
