import { useEffect, useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectForm } from '../components/ProjectForm';
import { Header } from '../components/Header';
import type { Project, CategoryDisplay } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isBlurBackground, setIsBlurBackground] = useState(false);
  const [customCategories, setCustomCategories] = useState<CategoryDisplay[]>(() => {
    // Load from localStorage but don't use defaults
    const saved = localStorage.getItem('projectCategories');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    setIsBlurBackground(isFormOpen);
  }, [isFormOpen]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProjects(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProjects(session.user);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('projectCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  async function fetchProjects(currentUser = user) {
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
  }

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

  async function handleToggleStarted(project: Project) {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: project.status === 'started' ? 'concept' : 'started' })
        .eq('id', project.id);
        
      if (error) throw error;
      setToast(`Project ${project.status === 'started' ? 'paused' : 'started'}!`);
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
    if (selectedTag && !project.tags.includes(selectedTag)) {
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

  const handleCreateNew = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  return (
    <div className={cn("min-h-screen bg-github-bg flex flex-col", 
      isBlurBackground ? "overflow-hidden" : "")}
    >
      <Header 
        user={user} 
        onCreateNew={handleCreateNew}
      />
      
      <div className="flex-1">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 w-full">
          <div className="mb-3 md:mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs md:text-sm border transition-colors",
                    selectedCategory === 'all'
                      ? "bg-github-green text-white border-github-green" 
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
                <Archive 
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
            <div className="text-left text-github-text">Loading projects...</div>
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
                      onEdit={project => {
                        setEditingProject(project);
                        setIsFormOpen(true);
                      }}
                      onToggleStarted={handleToggleStarted}
                      onStatusChange={handleToggleStarted}
                      setToast={setToast}
                      onTagClick={setSelectedTag}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Project Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            key="project-form"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ProjectForm
              customCategories={customCategories}
              project={editingProject || undefined}
              onSubmit={handleProjectSubmit}
              onClose={() => {
                setIsFormOpen(false);
                setEditingProject(null);
              }}
              onAddCategory={handleAddCategory}
            />
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