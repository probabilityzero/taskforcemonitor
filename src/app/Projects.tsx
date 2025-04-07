import { useEffect, useState, useContext, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AppContext } from '../App';
import { Project } from '../types';
import { Skeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowUpDown, 
  Check, 
  Search, 
  Plus, 
  AlertTriangle,
  PlayCircle,
  CheckCircle,
  LightbulbIcon,
  Star,
  ChevronDown,
  Tag,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

type SortKey = 'name' | 'created_at' | 'status' | 'priority' | 'categories';
type SortOrder = 'asc' | 'desc';

export default function Projects() {
  const { user, setIsFormOpen } = useContext(AppContext);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, size = 16) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={size} className="text-blue-400" />;
      case 'started':
        return <PlayCircle size={size} className="text-green-400" />;
      case 'abandonded':
        return <AlertTriangle size={size} className="text-yellow-400" />;
      default:
        return <LightbulbIcon size={size} className="text-purple-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'started': return 'In Progress';
      case 'abandonded': return 'Abandoned';
      default: return 'Concept';
    }
  };
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Toggle sort order if the same key is clicked
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort key and default to ascending order
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Utility to convert first letter of each word to uppercase (Title Case)
  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  // Extract all unique categories and convert to Title Case
  const allCategories = [...new Set(projects
    .map(p => p.categories)
    .filter((category): category is string => Boolean(category))
    .map(toTitleCase)
  )].sort();

  // Extract all unique tags
  const allTags = [...new Set(projects.flatMap(project => {
    if (!project.tags) return [];
    return typeof project.tags === 'string'
      ? project.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : project.tags.filter(Boolean);
  }))].sort();

  // Filter projects based on search query and selected filters
  const filteredProjects = projects.filter(project => {
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(project.status);
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || 
      (project.categories && selectedCategories.includes(project.categories.toLowerCase()));
    
    // Tags filter
    const matchesTags = selectedTags.length === 0 ||
      (project.tags && selectedTags.some(tag => {
        if (typeof project.tags === 'string') {
          return project.tags.split(',').map(t => t.trim()).includes(tag);
        }
        return project.tags.includes(tag);
      }));
    
    return matchesSearch && matchesStatus && matchesCategory && matchesTags;
  });

  // Sort filtered projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let compareA: any = a[sortKey];
    let compareB: any = b[sortKey];
    
    // Handle special cases
    if (sortKey === 'created_at') {
      compareA = new Date(a.created_at).getTime();
      compareB = new Date(b.created_at).getTime();
    }
    
    // Handle null/undefined values
    if (compareA === null || compareA === undefined) return sortOrder === 'asc' ? -1 : 1;
    if (compareB === null || compareB === undefined) return sortOrder === 'asc' ? 1 : -1;
    
    // Compare strings case-insensitive
    if (typeof compareA === 'string' && typeof compareB === 'string') {
      return sortOrder === 'asc' 
        ? compareA.localeCompare(compareB, undefined, { sensitivity: 'base' })
        : compareB.localeCompare(compareA, undefined, { sensitivity: 'base' });
    }
    
    // Default comparison
    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="flex-1">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Projects</h1>
        </div>

        {/* Search and filters */}
        <div className="mb-8 space-y-4">
          {/* Status and Category filter dropdowns moved to left of search */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input - expanded to full width */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-github-text" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-github-border rounded-md bg-github-input text-github-text focus:outline-none focus:ring-1 focus:ring-github-blue focus:border-github-blue"
              />
            </div>

            
            {/* Status and Category dropdowns - side by side for medium screens and up */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-nowrap">
              {/* Status dropdown */}
              <div className="relative flex-grow sm:flex-grow-0" ref={statusRef}>
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className={cn(
                    "w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1 px-3 py-1.5 rounded-md text-sm border transition-colors",
                    selectedStatuses.length > 0 
                      ? "bg-github-fg/70 border-github-border-hover text-white" 
                      : "bg-github-input border-github-border text-github-text hover:text-white"
                  )}
                >
                  <span className="truncate">Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}</span>
                  <ChevronDown size={14} className={statusDropdownOpen ? "rotate-180 flex-shrink-0" : "flex-shrink-0"} />
                </button>
                
                {statusDropdownOpen && (
                  <div className="absolute top-full left-0 z-10 mt-1 bg-github-card border border-github-border rounded-md shadow-lg w-48 py-1">
                    <div className="px-3 py-2 border-b border-github-border">
                      <h4 className="text-sm font-medium text-white">Filter by status</h4>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {['concept', 'started', 'completed', 'abandonded'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusToggle(status)}
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-github-fg/30 transition-colors"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            {selectedStatuses.includes(status) && <Check size={14} className="text-white" />}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-white">
                            {getStatusIcon(status, 14)}
                            <span>{getStatusText(status)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {selectedStatuses.length > 0 && (
                      <div className="px-3 py-2 border-t border-github-border">
                        <button
                          onClick={() => setSelectedStatuses([])}
                          className="text-xs text-github-text hover:text-white transition-colors"
                        >
                          Clear filter
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Category dropdown */}
              <div className="relative flex-grow sm:flex-grow-0" ref={categoryRef}>
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className={cn(
                    "w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1 px-3 py-1.5 rounded-md text-sm border transition-colors",
                    selectedCategories.length > 0 
                      ? "bg-github-fg/70 border-github-border-hover text-white" 
                      : "bg-github-input border-github-border text-github-text hover:text-white"
                  )}
                >
                  <span className="truncate">Category {selectedCategories.length > 0 && `(${selectedCategories.length})`}</span>
                  <ChevronDown size={14} className={categoryDropdownOpen ? "rotate-180 flex-shrink-0" : "flex-shrink-0"} />
                </button>
                
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 z-10 mt-1 bg-github-card border border-github-border rounded-md shadow-lg w-48 py-1">
                    <div className="px-3 py-2 border-b border-github-border">
                      <h4 className="text-sm font-medium text-white">Filter by category</h4>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {allCategories.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-github-text">No categories found</div>
                      ) : (
                        allCategories.map(category => (
                          <button
                            key={category}
                            onClick={() => handleCategoryToggle(category.toLowerCase())}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-github-fg/30 transition-colors"
                          >
                            <div className="w-4 h-4 flex items-center justify-center">
                              {selectedCategories.includes(category.toLowerCase()) && <Check size={14} className="text-white" />}
                            </div>
                            <span className="text-sm text-white">{category}</span>
                          </button>
                        ))
                      )}
                    </div>
                    {selectedCategories.length > 0 && (
                      <div className="px-3 py-2 border-t border-github-border">
                        <button
                          onClick={() => setSelectedCategories([])}
                          className="text-xs text-github-text hover:text-white transition-colors"
                        >
                          Clear filter
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Clear filters button */}
              {(selectedStatuses.length > 0 || selectedCategories.length > 0 || selectedTags.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedStatuses([]);
                    setSelectedCategories([]);
                    setSelectedTags([]);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm border border-github-border text-github-text hover:text-white transition-colors"
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Tags filter bar */}
          {allTags.length > 0 && (
            <div className="py-2">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium text-github-text">Topics</h3>
                <Tag size={14} className="text-github-text" />
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs border transition-colors",
                      selectedTags.includes(tag)
                        ? "bg-github-blue/20 border-github-blue/40 text-github-blue hover:bg-github-blue/30"
                        : "bg-github-tag/20 border-github-tag-border text-github-tag-text hover:bg-github-tag/40"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Projects list */}
        {loading ? (
          <div className="bg-github-card border border-github-border rounded-md overflow-hidden">
            <div className="border-b border-github-border px-4 py-3 bg-github-bg">
              <div className="flex gap-4">
                <Skeleton width={120} height={24} />
                <Skeleton width={100} height={24} />
                <Skeleton width={80} height={24} />
              </div>
            </div>
            <div className="divide-y divide-github-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center">
                  <Skeleton width="100%" height={60} />
                </div>
              ))}
            </div>
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="bg-github-card border border-github-border rounded-md p-8 text-center">
            <h3 className="text-lg font-medium text-github-text mb-2">No projects found</h3>
            <p className="text-github-text opacity-60 mb-4">
              {searchQuery || selectedStatuses.length > 0 || selectedCategories.length > 0 || selectedTags.length > 0
                ? "Try adjusting your search or filters"
                : "Start by creating your first project"}
            </p>
            {/* New project button removed from empty state */}
          </div>
        ) : (
          <div className="bg-github-card border border-github-border rounded-md overflow-hidden">
            {/* Table header */}
            <div className="border-b border-github-border px-4 py-3 bg-github-bg">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-github-text">
                <button 
                  className="col-span-5 flex items-center gap-1 hover:text-white transition-colors" 
                  onClick={() => handleSort('name')}
                >
                  Project Name
                  <ArrowUpDown size={14} className={cn(
                    "opacity-60", 
                    sortKey === 'name' && "opacity-100",
                    sortKey === 'name' && sortOrder === 'desc' && "rotate-180"
                  )} />
                </button>
                <button 
                  className="col-span-2 flex items-center gap-1 hover:text-white transition-colors" 
                  onClick={() => handleSort('status')}
                >
                  Status
                  <ArrowUpDown size={14} className={cn(
                    "opacity-60", 
                    sortKey === 'status' && "opacity-100",
                    sortKey === 'status' && sortOrder === 'desc' && "rotate-180"
                  )} />
                </button>
                <button 
                  className="col-span-2 flex items-center gap-1 hover:text-white transition-colors" 
                  onClick={() => handleSort('categories')}
                >
                  Category
                  <ArrowUpDown size={14} className={cn(
                    "opacity-60", 
                    sortKey === 'categories' && "opacity-100",
                    sortKey === 'categories' && sortOrder === 'desc' && "rotate-180"
                  )} />
                </button>
                <button 
                  className="col-span-1 flex items-center gap-1 hover:text-white transition-colors" 
                  onClick={() => handleSort('priority')}
                >
                  Priority
                  <ArrowUpDown size={14} className={cn(
                    "opacity-60", 
                    sortKey === 'priority' && "opacity-100",
                    sortKey === 'priority' && sortOrder === 'desc' && "rotate-180"
                  )} />
                </button>
                <button 
                  className="col-span-2 flex items-center gap-1 hover:text-white transition-colors" 
                  onClick={() => handleSort('created_at')}
                >
                  Created
                  <ArrowUpDown size={14} className={cn(
                    "opacity-60", 
                    sortKey === 'created_at' && "opacity-100",
                    sortKey === 'created_at' && sortOrder === 'desc' && "rotate-180"
                  )} />
                </button>
              </div>
            </div>
            
            {/* Project rows */}
            <div className="divide-y divide-github-border">
              <AnimatePresence initial={false}>
                {sortedProjects.map((project) => (
                  <motion.div 
                    key={project.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <Link 
                      to={`/project/${project.id}`}
                      className="block px-4 py-3 hover:bg-github-bg transition-colors"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-5">
                          <h3 className="font-medium text-white">{project.name}</h3>
                          {project.description && (
                            <p className="text-github-text text-sm truncate">{project.description}</p>
                          )}
                          {/* Tags removed from project list rows */}
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(project.status)}
                            <span className="text-sm text-github-text">{getStatusText(project.status)}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          {project.categories ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-github-fg/30 text-github-text border border-github-border/50">
                              {toTitleCase(project.categories)}
                            </span>
                          ) : (
                            <span className="text-sm text-github-text/50">-</span>
                          )}
                        </div>
                        <div className="col-span-1">
                          {project.priority === 'high' && (
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-yellow-400" />
                            </div>
                          )}
                          {project.priority === 'medium' && (
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-github-text" />
                            </div>
                          )}
                          {project.priority === 'low' && (
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-github-text/50" />
                            </div>
                          )}
                          {!project.priority && (
                            <span className="text-sm text-github-text/50">-</span>
                          )}
                        </div>
                        <div className="col-span-2">
                          {/* Calendar icon removed */}
                          <span className="text-sm text-github-text">{formatDate(project.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        
        {/* Results summary */}
        {!loading && sortedProjects.length > 0 && (
          <div className="mt-4 text-sm text-github-text">
            Showing {sortedProjects.length} of {projects.length} projects
          </div>
        )}
      </div>
    </div>
  );
}