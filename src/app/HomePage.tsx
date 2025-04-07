import { useEffect, useState, useContext } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProjectCard from '../components/ProjectCard';
import { ProjectForm } from '../components/ProjectForm';
import { AppContext } from '../App';
import type { Project, CategoryDisplay } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { CardSkeleton, Skeleton } from '../components/Skeleton';

function HomePage() {
  const { user, setIsFormOpen: setGlobalFormOpen, setRefreshProjects } = useContext(AppContext);
  // Add a local form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [isBlurBackground, setIsBlurBackground] = useState(false);
  const [customCategories, setCustomCategories] = useState<CategoryDisplay[]>(() => {
    // Load from localStorage but don't use defaults
    const saved = localStorage.getItem('projectCategories');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Only apply blur when the form is open
    setIsBlurBackground(isFormOpen);
    
    // This is important - when modal closes, we need to make sure the backdrop is fully removed
    if (!isFormOpen) {
      // Small delay to ensure animations complete before removing backdrop effects
      const timer = setTimeout(() => {
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
  }, [isFormOpen]);

  useEffect(() => {
    if (user) {
      fetchProjects(user);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('projectCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  const fetchProjects = async (currentUser = user) => {
    if (!currentUser) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('status', { ascending: false });

    if (error) {
      setToast(`Error fetching projects: ${error.message}`);
      setLoading(false);
      return;
    }

    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
    
    // Register the refresh callback
    if (setRefreshProjects) {
      setRefreshProjects(fetchProjects);
    }
    
    return () => {
      // Cleanup when component unmounts
      if (setRefreshProjects) {
        setRefreshProjects(undefined);
      }
    };
  }, [setRefreshProjects]);

  async function handleProjectSubmit(data: Partial<Project>) {
    try {
      const projectData = {
        ...data,
        user_id: user.id
      };

      if (editingProject) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);
          
        if (error) throw error;
        setToast('Project updated successfully!');
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);
          
        if (error) throw error;
        setToast('Project created successfully!');
      }
      
      setIsFormOpen(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error: any) {
      setToast(`Error: ${error.message}`);
    }
  }

  // Fixed the type for the category parameter
  const handleAddCategory = (category: CategoryDisplay) => {
    setCustomCategories([...customCategories, category]);
  };

  // Extract unique categories from projects
  const projectCategories = new Set<string>();
  projects.forEach(project => {
    if (project.categories) {
      projectCategories.add(project.categories);
    }
  });

  const filteredProjects = projects.filter(project => {
    // Filter by category
    if (selectedCategory !== 'all' && project.categories !== selectedCategory) {
      return false;
    }
    
    // Filter by tag
    if (selectedTag && (typeof project.tags === 'string' 
      ? !project.tags.includes(selectedTag)
      : Array.isArray(project.tags) 
        ? !project.tags.includes(selectedTag)
        : true)) {
      return false;
    }
    
    // Filter by archive status
    if (!showArchive && project.status === 'abandonded') {
      return false;
    }
    
    return true;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // First sort by status (started projects first)
    if (a.status === 'started' && b.status !== 'started') return -1;
    if (a.status !== 'started' && b.status === 'started') return 1;
    
    // Then sort by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Update the handler to set both local and global state
  const handleCreateNew = () => {
    setIsFormOpen(true);
    setGlobalFormOpen(true);
  };

  // Add a handler for closing that updates both states
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setGlobalFormOpen(false);
    setEditingProject(null);
  };
  
  // Make sure the global state is synced with local state
  useEffect(() => {
    // This effect allows us to handle external form state changes
    return () => {
      setGlobalFormOpen(false);
    };
  }, [setGlobalFormOpen]);

  return (
    <div className={cn("flex-1", isBlurBackground ? "overflow-hidden" : "")}>
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 w-full">
        <div className="mb-3 md:mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs md:text-sm border transition-colors",
                  selectedCategory === 'all'
                    ? "bg-github-green  border-2 text-white border-github-green" 
                    : "bg-github-card text-github-text border-github-border hover:border-github-green"
                )}
              >
                All Projects
              </button>
              
              {/* Only render categories that users have created */}
              {customCategories.length > 0 && customCategories.map(category => {
                // Only show categories that are actually used in projects
                if (!projectCategories.has(category.id)) return null;
                
                // Get the dynamic icon component safely
                let IconComponent = HelpCircle; // Default fallback icon
                if (category.icon && typeof category.icon === 'string') {
                  // @ts-ignore - We're safely handling the case where the icon doesn't exist
                  IconComponent = LucideIcons[category.icon] || HelpCircle;
                }
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs md:text-sm border transition-colors",
                      selectedCategory === category.id
                        ? "bg-github-card border-2 border-github-green text-white" 
                        : "bg-github-card text-github-text border-github-border hover:border-github-green"
                    )}
                  >
                    <IconComponent 
                      size={14} 
                      color={selectedCategory === category.id ? category.color : undefined}
                      className={selectedCategory !== category.id ? "text-github-text" : undefined}
                    />
                    <span>{category.label}</span>
                  </button>
                );
              })}
              
              {/* Show uncategorized projects button if there are any */}
              {projects.some(p => !p.categories) && (
                <button
                  onClick={() => setSelectedCategory('uncategorized')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs md:text-sm border transition-colors",
                    selectedCategory === 'uncategorized'
                      ? "bg-github-card border-2 border-github-green text-white" 
                      : "bg-github-card text-github-text border-github-border hover:border-github-green"
                  )}
                >
                  <HelpCircle 
                    size={14} 
                    className={selectedCategory !== 'uncategorized' ? "text-github-text" : undefined}
                  />
                  <span>Uncategorized</span>
                </button>
              )}
            </div>
              
            {/* Archive toggle moved here */}
            <button
              onClick={() => setShowArchive(!showArchive)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs md:text-sm border transition-colors",
                showArchive
                  ? "bg-github-card border-2 border-github-green text-white" 
                  : "bg-github-card text-github-text border-github-border hover:border-github-green"
              )}
            >
              <LucideIcons.Archive
                size={14} 
                className={!showArchive ? "text-github-text" : undefined}
              />
              <span>Archive</span> 
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 md:mt-4">
            {selectedTag && (
              <span className="px-2 py-1 bg-github-card text-github-text rounded-full text-xs border border-github-border flex items-center gap-1">
                {selectedTag}
                <button
                  onClick={() => setSelectedTag(null)}
                  className="ml-1 text-github-text hover:text-white"
                >
                  <X size={12} />
                </button> 
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div>
            <div className="mb-4">
              {/* Categories skeleton */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Skeleton width={100} height={32} rounded="rounded-md" />
                <Skeleton width={120} height={32} rounded="rounded-md" />
                <Skeleton width={110} height={32} rounded="rounded-md" />
                <Skeleton width={90} height={32} rounded="rounded-md" />
              </div>
              
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <CardSkeleton />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-github-text mb-4">No projects yet</div>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-github-text mb-4">
              No projects match your current filters
            </div>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTag(null);
              }}
              className="px-4 py-2 bg-github-card border border-github-border text-github-text hover:text-white rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <AnimatePresence>
              {sortedProjects.map(project => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectCard
                    project={project}
                    onClick={() => {
                      setEditingProject(project);
                      setIsFormOpen(true);
                    }}
                    setToast={setToast}
                    onUpdate={() => fetchProjects()}
                    onStatusChange={async (project, newStatus) => {
                      try {
                        const { error } = await supabase
                          .from('projects')
                          .update({ 
                            status: newStatus,
                            updated_at: new Date().toISOString()
                          })
                          .eq('id', project.id);
                          
                        if (error) throw error;
                        
                        setToast(`Project status updated to ${
                          newStatus === 'completed' ? 'Completed' : 
                          newStatus === 'started' ? 'In Progress' : 
                          newStatus === 'abandonded' ? 'Abandoned' : 'Concept'
                        }`);
                        
                        // Refresh projects
                        fetchProjects();
                      } catch (error: any) {
                        setToast(`Error: ${error.message}`);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Project Form Modal */}
      <AnimatePresence onExitComplete={() => {
        // This ensures cleanup after animation completes
        document.body.style.overflow = '';
        setIsBlurBackground(false);
      }}>
        {isFormOpen && (
          <motion.div
            key="project-form"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              // Close when clicking on the backdrop (not on the form itself)
              if (e.target === e.currentTarget) {
                handleCloseForm();
              }
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ProjectForm
                customCategories={customCategories}
                project={editingProject || undefined}
                onSubmit={handleProjectSubmit}
                onClose={handleCloseForm}
                onAddCategory={handleAddCategory}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          className="fixed top-4 left-4 bg-github-card p-4 rounded-md border border-github-border text-github-text z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          onAnimationComplete={() => setTimeout(() => setToast(null), 3000)}
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}

export default HomePage;