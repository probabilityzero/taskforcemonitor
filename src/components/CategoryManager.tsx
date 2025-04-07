import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Check, ChevronDown, Plus } from 'lucide-react';
import * as Icons from 'lucide-react';

// Available icons list - you can customize this list
const availableIcons = [
  'Activity', 'AlertCircle', 'Archive', 'Award', 'Bell', 'Book', 'Bookmark', 
  'Box', 'Briefcase', 'Calendar', 'Clock', 'Code', 'Compass', 'Cpu', 
  'Database', 'Flag', 'Folder', 'Gift', 'Globe', 'Heart', 'Home', 'Image',
  'Key', 'LifeBuoy', 'Link', 'List', 'Mail', 'Map', 'MessageCircle', 'Monitor',
  'Music', 'Package', 'Puzzle', 'Search', 'Settings', 'ShoppingCart',
  'Star', 'Sun', 'Tag', 'Target', 'Terminal', 'Tool', 'Trophy', 'Users',
  'BrainCircuit', 'LineChart'
];

// Color palette
const colorPalette = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#64748b', // slate
];

interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface CategoryManagerProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onAddCategory: (category: CategoryItem) => void;
  className?: string;
}

export function CategoryManager({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  className = '',
}: CategoryManagerProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Puzzle');
  const [selectedColor, setSelectedColor] = useState('#64748b');
  const [showIcons, setShowIcons] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the selected category object
  const selectedCategoryObj = categories.find(c => c.id === selectedCategory);

  // Handle clicking outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsAddingNew(false);
        setShowIcons(false);
        setShowColors(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      label: newCategoryName.trim(),
      icon: selectedIcon,
      color: selectedColor
    };

    onAddCategory(newCategory);
    onSelectCategory(newCategory.id);
    
    setNewCategoryName('');
    setSelectedIcon('Puzzle');
    setSelectedColor('#64748b');
    setIsAddingNew(false);
    setIsDropdownOpen(false);
  };

  // Dynamically render the selected icon
  const renderIcon = (iconName: string, color: string, size = 16) => {
    // @ts-ignore - Dynamically accessing icons from the Icons object
    const Icon = Icons[iconName];
    return Icon ? <Icon size={size} color={color} /> : null;
  };

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full gap-2 py-1.5 px-2 rounded-md border border-github-border bg-github-input text-github-text text-sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="flex items-center gap-2">
          {selectedCategoryObj ? (
            <>
              {renderIcon(selectedCategoryObj.icon, selectedCategoryObj.color)}
              <span>{selectedCategoryObj.label}</span>
            </>
          ) : (
            <span className="text-github-text/70">Select category</span>
          )}
        </div>
        <ChevronDown size={16} />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 mt-1 bg-github-card border border-github-border rounded-md shadow-lg max-h-72 overflow-y-auto"
          >
            {/* All option */}
            <button
              type="button"
              className={cn(
                "flex items-center w-full px-3 py-2 text-left text-sm hover:bg-github-border",
                selectedCategory === 'all' && "bg-github-border"
              )}
              onClick={() => {
                onSelectCategory('all');
                setIsDropdownOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                {renderIcon('List', '#64748b')}
                <span>All categories</span>
              </div>
              {selectedCategory === 'all' && <Check size={16} className="ml-auto" />}
            </button>

            {/* Category list */}
            <div className="px-1">
              {sortedCategories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={cn(
                    "flex items-center w-full px-2 py-1.5 text-left text-sm hover:bg-github-border rounded-md my-1",
                    selectedCategory === category.id && "bg-github-border"
                  )}
                  onClick={() => {
                    onSelectCategory(category.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {renderIcon(category.icon, category.color)}
                    <span>{category.label}</span>
                  </div>
                  {selectedCategory === category.id && <Check size={16} className="ml-auto" />}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-github-border my-1"></div>

            {/* Add new category button or form */}
            {!isAddingNew ? (
              <button
                type="button"
                className="flex items-center w-full px-3 py-2 text-left text-sm hover:bg-github-border text-github-green"
                onClick={() => setIsAddingNew(true)}
              >
                <Plus size={16} className="mr-2" />
                Add new category
              </button>
            ) : (
              <div className="p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-2 py-1 rounded-md border border-github-border bg-github-input text-github-text text-sm"
                  autoFocus
                />
                
                <div className="flex gap-2">
                  {/* Icon selector */}
                  <div className="relative flex-1">
                    <button
                      type="button"
                      className="flex items-center justify-between w-full gap-2 py-1 px-2 rounded-md border border-github-border bg-github-input text-github-text text-sm"
                      onClick={() => {
                        setShowIcons(!showIcons);
                        setShowColors(false);
                      }}
                    >
                      {renderIcon(selectedIcon, selectedColor)}
                      <span>Icon</span>
                    </button>
                    
                    <AnimatePresence>
                      {showIcons && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 z-50 mt-1 p-2 bg-github-card border border-github-border rounded-md shadow-lg max-h-48 overflow-y-auto"
                        >
                          <div className="grid grid-cols-5 gap-1">
                            {availableIcons.map(iconName => (
                              <button
                                key={iconName}
                                type="button"
                                className={cn(
                                  "flex items-center justify-center p-2 rounded-md hover:bg-github-border",
                                  selectedIcon === iconName && "bg-github-border"
                                )}
                                onClick={() => {
                                  setSelectedIcon(iconName);
                                  setShowIcons(false);
                                }}
                              >
                                {renderIcon(iconName, selectedColor)}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Color selector */}
                  <div className="relative flex-1">
                    <button
                      type="button"
                      className="flex items-center justify-between w-full gap-2 py-1 px-2 rounded-md border border-github-border bg-github-input text-github-text text-sm"
                      onClick={() => {
                        setShowColors(!showColors);
                        setShowIcons(false);
                      }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: selectedColor }} 
                      />
                      <span>Color</span>
                    </button>
                    
                    <AnimatePresence>
                      {showColors && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 z-50 mt-1 p-2 bg-github-card border border-github-border rounded-md shadow-lg"
                        >
                          <div className="grid grid-cols-6 gap-1">
                            {colorPalette.map(color => (
                              <button
                                key={color}
                                type="button"
                                className={cn(
                                  "flex items-center justify-center p-1 rounded-md hover:bg-github-border",
                                  selectedColor === color && "bg-github-border"
                                )}
                                onClick={() => {
                                  setSelectedColor(color);
                                  setShowColors(false);
                                }}
                              >
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: color }} 
                                />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className="px-2 py-1 text-github-text hover:text-white transition-colors text-sm"
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewCategoryName('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}