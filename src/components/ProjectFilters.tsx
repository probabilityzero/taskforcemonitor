import React from 'react';
import { Archive, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectCategory } from '../types';

interface ProjectFiltersProps {
    categories: { id: ProjectCategory | 'all'; label: string; icon: React.ReactNode }[];
    selectedCategory: ProjectCategory | 'all';
    setSelectedCategory: (category: ProjectCategory | 'all') => void;
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
    showArchive: boolean;
    setShowArchive: (show: boolean) => void;
    isFilterOpen: boolean;
    setIsFilterOpen: (open: boolean) => void;
    tagCounts: { [tag: string]: number };
    setKey: React.Dispatch<React.SetStateAction<number>>;
    categoryRef: React.RefObject<HTMLDivElement>;
    className?: string; // Add className prop
}

export function ProjectFilters({
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    showArchive,
    setShowArchive,
    isFilterOpen,
    setIsFilterOpen,
    tagCounts,
    setKey,
    categoryRef,
    className = "" // Default className to empty string
}: ProjectFiltersProps) {
    return (
        <div className={cn("relative mb-4 md:mb-8", className)}>
            <div className="flex items-center justify-between mb-2">
                <div className="relative overflow-x-auto pb-2" ref={categoryRef}>
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-github-green rounded-md transition-all duration-300"
                        style={{
                            left: (categoryRef.current?.querySelector(`[data-category="${selectedCategory}"]`) as HTMLElement)?.offsetLeft ?? 0,
                            width: (categoryRef.current?.querySelector(`[data-category="${selectedCategory}"]`) as HTMLElement)?.offsetWidth ?? 0,
                            height: (categoryRef.current?.querySelector(`[data-category="${selectedCategory}"]`) as HTMLElement)?.offsetHeight ?? 0,
                        }}
                        layout
                    />
                    <div className="flex gap-1 md:gap-2">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setSelectedTag(null)
                                    setSelectedCategory(category.id)
                                    setKey(prevKey => prevKey + 1)
                                }}
                                className={cn(
                                    "relative flex items-center gap-1 md:gap-2 px-2 py-1 rounded-md transition-colors z-10 text-sm md:text-base",
                                    selectedCategory === category.id
                                        ? "text-white bg-github-green"
                                        : "bg-github-card text-github-text border border-github-border hover:border-github-green",
                                )}
                                data-category={category.id}
                            >
                                {category.icon}
                                <span className="hidden md:inline">{category.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="ml-2 md:ml-6 flex items-center gap-1 md:gap-2 px-2 py-1 bg-github-card text-github-text border border-github-border hover:border-github-green rounded-md transition-colors text-sm"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                </button>
            </div>
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        className="bg-github-card border border-github-border rounded-md overflow-hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="p-2 flex flex-col md:flex-row items-start md:items-center">
                            <div className="flex items-center gap-1 mb-1 md:mb-0">
                                <Archive className="text-github-text" size={14} />
                                <span className="text-github-text text-sm md:text-base">Show Archive</span>
                                <button
                                    onClick={() => setShowArchive(!showArchive)}
                                    className={cn(
                                        "relative ml-1 inline-flex h-5 w-9 items-center rounded-full transition-colors",
                                        showArchive ? "bg-github-green" : "bg-github-border",
                                        showArchive && "bg-github-green"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "translate-x-1 inline-block h-3 w-3 transform rounded-full bg-github-card transition-transform",
                                            showArchive ? "translate-x-4" : ""
                                        )}
                                    />
                                </button>
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap gap-1 p-2 md:p-0 items-center mt-1 md:mt-0 md:ml-4">
                                  {Object.entries(tagCounts).map(([tag, count]) => (
                                      <button
                                          key={tag}
                                          onClick={() => {
                                              setSelectedTag(tag);
                                          }}
                                          className={cn(
                                              "px-1 py-0.5 rounded-full text-xs text-github-text border border-github-border",
                                              selectedTag === tag ? 'bg-github-green text-white' : 'bg-[#21262d]'
                                          )}
                                      >
                                          {tag} ({count})
                                      </button>
                                  ))}
                              </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
