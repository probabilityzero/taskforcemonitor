import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface SelectProps<T> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Select<T>({ options, value, onChange }: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: SelectOption<T>) => {
    onChange(option.value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center justify-between w-40 p-2 rounded-md border text-github-text"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon && <span style={{ color: selectedOption.color }}>{selectedOption.icon}</span>}
          <span>{selectedOption?.label}</span>
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="absolute top-full left-0 z-10 w-40 mt-1 bg-github-card rounded-md border border-github-border overflow-hidden"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1 }}
          >
            {options.map(option => (
              <motion.li
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className={cn(
                  "flex items-center gap-2 p-2 cursor-pointer hover:bg-github-border transition-colors",
                  option.value === value && "bg-github-border"
                )}
              >
                <div className="flex items-center gap-2 justify-start">
                  {option.icon && <span style={{ color: option.color }}>{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
