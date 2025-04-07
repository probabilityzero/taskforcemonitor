import { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AppContext } from '../App';
import { Project } from '../types';
import { Skeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowUpDown, 
  Check, 
  Calendar, 
  Tag, 
  Search, 
  Plus, 
  AlertTriangle,
  PlayCircle,
  CheckCircle,
  LightbulbIcon,
  Star
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

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

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

  // Extract all unique categories
  const allCategories = [...new Set(projects
    .map(p => p.categories)
    .filter((category): category is string => Boolean(category)))]; // Type guard to ensure non-null

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
      (project.categories && selectedCategories.includes(project.categories));
    
    return matchesSearch && matchesStatus && matchesCategory;
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
          
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Search and filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
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

          <div className="flex flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-medium text-github-text mb-2">Status</h3>
              <div className="flex flex-wrap gap-2">
                {['concept', 'started', 'completed', 'abandonded'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusToggle(status)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                      selectedStatuses.includes(status)
                        ? "bg-github-fg text-white"
                        : "bg-transparent border border-github-border text-github-text hover:border-github-border-hover"
                    )}
                  >
                    {getStatusIcon(status)}
                    <span>{getStatusText(status)}</span>
                    {selectedStatuses.includes(status) && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>
            
            {allCategories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-github-text mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)} // category is now guaranteed to be string
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                        selectedCategories.includes(category)
                          ? "bg-github-fg text-white"
                          : "bg-transparent border border-github-border text-github-text hover:border-github-border-hover"
                      )}
                    >
                      <Tag size={12} />
                      <span>{category}</span>
                      {selectedCategories.includes(category) && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
              {searchQuery || selectedStatuses.length > 0 || selectedCategories.length > 0
                ? "Try adjusting your search or filters"
                : "Start by creating your first project"}
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-1 px-4 py-2 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        ) : (
          <div className="bg-github-card border border-github-border rounded-md overflow-hidden">
            {/* Table header */}
            <div className="border-b border-github-border px-4 py-3 bg-github-bg">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-github-text">
                <button 
                  className="col-span-4 flex items-center gap-1 hover:text-white transition-colors" 
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
                  className="col-span-2 flex items-center gap-1 hover:text-white transition-colors" 
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
                        <div className="col-span-4">
                          <h3 className="font-medium text-white">{project.name}</h3>
                          {project.description && (
                            <p className="text-github-text text-sm truncate">{project.description}</p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(project.status)}
                            <span className="text-sm text-github-text">{getStatusText(project.status)}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          {project.categories ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-github-fg/30 text-github-text">
                              {project.categories}
                            </span>
                          ) : (
                            <span className="text-sm text-github-text/50">-</span>
                          )}
                        </div>
                        <div className="col-span-2">
                          {project.priority === 'high' && (
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-yellow-400" />
                              <span className="text-sm text-github-text">High</span>
                            </div>
                          )}
                          {project.priority === 'medium' && (
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-github-text" />
                              <span className="text-sm text-github-text">Medium</span>
                            </div>
                          )}
                          {project.priority === 'low' && (
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-github-text/50" />
                              <span className="text-sm text-github-text">Low</span>
                            </div>
                          )}
                          {!project.priority && (
                            <span className="text-sm text-github-text/50">-</span>
                          )}
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-github-text" />
                            <span className="text-sm text-github-text">{formatDate(project.created_at)}</span>
                          </div>
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