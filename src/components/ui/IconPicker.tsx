"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { curatedIcons, curatedIconNames, CuratedIconName } from '@/lib/icons';

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  className?: string;
}

export function IconPicker({ selectedIcon, onSelect, className = "" }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredIcons = curatedIconNames.filter(name => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  const CurrentIcon = curatedIcons[selectedIcon as CuratedIconName] || curatedIcons['CheckCircle2'];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-[42px] bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg transition-colors focus:ring-2 focus:ring-orange-500"
        title="Select Icon"
      >
        <CurrentIcon className="w-5 h-5 text-foreground/80" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-2 left-0 w-72 bg-background border border-foreground/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-foreground/10 flex items-center gap-2">
            <Search className="w-4 h-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-sm text-foreground placeholder:text-foreground/40"
              autoFocus
            />
            {search && (
              <button type="button" onClick={() => setSearch('')}>
                <X className="w-4 h-4 text-foreground/40 hover:text-foreground/80" />
              </button>
            )}
          </div>
          
          <div className="p-3 max-h-60 overflow-y-auto custom-scrollbar grid grid-cols-5 gap-2">
            {filteredIcons.length > 0 ? (
              filteredIcons.map((iconName) => {
                const IconComponent = curatedIcons[iconName];
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onSelect(iconName);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`flex items-center justify-center aspect-square rounded-lg transition-colors group ${
                      isSelected 
                        ? 'bg-orange-500 text-white' 
                        : 'hover:bg-foreground/10 text-foreground/70'
                    }`}
                    title={iconName}
                  >
                    <IconComponent className={`w-5 h-5 ${isSelected ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  </button>
                );
              })
            ) : (
              <div className="col-span-5 py-4 text-center text-sm text-foreground/50">
                No icons found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
