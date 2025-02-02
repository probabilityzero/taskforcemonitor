import React, { useEffect, useState, useRef } from 'react';
    import {
      PlusCircle,
      List,
      BrainCircuit as Brain,
      Terminal,
      LineChart,
      Cpu,
      Archive,
      Puzzle,
      SlidersHorizontal,
      User,
    } from 'lucide-react';
    import { supabase } from './lib/supabase';
    import { ProjectCard } from './components/ProjectCard';
    import { ProjectForm } from './components/ProjectForm';
    import type { Project, ProjectCategory } from './types';
    import { cn } from './lib/utils';
    import { motion, AnimatePresence } from 'framer-motion';
    import { ProjectFilters } from './components/ProjectFilters';
    import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
    import Auth from './pages/Auth';
    import Welcome from './pages/Welcome';
    import TermsOfService from './pages/TermsOfService';
    import PrivacyPolicy from './pages/PrivacyPolicy';

    const categories: { id: ProjectCategory | 'all'; label: string; icon: React.ReactNode }[] = [
      { id: 'all', label: 'On-going', icon: <List className="w-4 h-4 md:w-5 md:h-5" /> },
      { id: 'research', label: 'Research', icon: <Brain className="w-4 h-4 md:w-5 md:h-5" /> },
      { id: 'analysis', label: 'Analysis', icon: <LineChart className="w-4 h-4 md:w-5 md:h-5" /> },
      { id: 'engineering', label: 'Engineering', icon: <Cpu className="w-4 h-4 md:w-5 md:h-5" /> },
      { id: 'miscellaneous', label: 'Miscellaneous', icon: <Puzzle className="w-4 h-4 md:w-5 md:h-5" /> },
    ];

    function App() {
      const [projects, setProjects] = useState<Project[]>([]);
      const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
      const [selectedTag, setSelectedTag] = useState<string | null>(null);
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingProject, setEditingProject] = useState<Project | null>(null);
      const [loading, setLoading] = useState(true);
      const categoryRef = useRef<HTMLDivElement>(null);
      const [toast, setToast] = useState<string | null>(null);
      const [showArchive, setShowArchive] = useState(false);
      const [isFilterOpen, setIsFilterOpen] = useState(false);
      const [key, setKey] = useState(0);
      const [user, setUser] = useState<any>(null);
      const navigate = useNavigate();

      useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });
      }, []);

      useEffect(() => {
        if (user) {
          fetchProjects();
        } else {
          setProjects([]);
        }
      }, [user]);

      async function fetchProjects() {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user?.id)
          .order('status', { ascending: false });

        if (error) {
          console.error('Error fetching projects:', error);
          return;
        }

        setProjects(data || []);
        setLoading(false);
      }

      async function handleProjectSubmit(projectData: Partial<Project>) {
        try {
          setLoading(true);
          let error;
          if (editingProject) {
            const { error: updateError } = await supabase
              .from('projects')
              .update(projectData)
              .eq('id', editingProject.id);
            error = updateError;
          } else {
            const { data, error: insertError } = await supabase
              .from('projects')
              .insert([{ ...projectData, user_id: user?.id }])
              .select()
              .single();
            error = insertError;
            if (data) {
              setProjects(prev => [...prev, data]);
            }
          }

          if (error) {
            console.error('Supabase error:', error);
            alert(`Failed to save project. ${error.message}`);
            throw error;
          }

          setIsFormOpen(false);
          setEditingProject(null);
          await fetchProjects();
        } catch (error) {
          console.error('Error saving project:', error);
          alert('Failed to save project. Please try again.');
        } finally {
          setLoading(false);
        }
      }

      async function handleToggleStarted(project: Project) {
        const newStatus = project.status === 'started' ? 'concept' : 'started';
        const { error } = await supabase
          .from('projects')
          .update({ status: newStatus })
          .eq('id', project.id);

        if (error) {
          console.error('Error updating project status:', error);
          return;
        }

        await fetchProjects();
      }

      const filteredProjects = projects.filter(project => {
        const isArchive = showArchive && (project.status === 'completed' || project.status === 'abandonded');
        const isNotArchived =
          !showArchive && (project.status === 'started' || project.status === 'concept');

        const categoryMatch = selectedCategory === 'all' || project.categories === selectedCategory;
        const tagMatch = !selectedTag || project.tags.split(',').map(tag => tag.trim()).includes(selectedTag);

        return (
          categoryMatch &&
          tagMatch &&
          (isArchive || isNotArchived || project.status === 'concept' || project.status === 'started')
        );
      });

      const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (a.status === 'started' && b.status !== 'started') return -1;
        if (a.status !== 'started' && b.status === 'started') return 1;
        return 0;
      });

      const tagCounts = projects.reduce((acc, project) => {
        project.tags.split(',').forEach(tag => {
          const trimmedTag = tag.trim();
          acc[trimmedTag] = (acc[trimmedTag] || 0) + 1;
        });
        return acc;
      }, {} as { [tag: string]: number });

      const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      };

      if (!user) {
        return <Auth />;
      }

      return (
        <div className="min-h-screen bg-github-bg">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-github-text flex items-center gap-1 md:gap-2">
                {/* <Logo className="w-6 h-6 md:w-8 md:h-8" /> */}
                Task Force <span className="font-thin">Monitor</span>
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-1 md:gap-2 px-3 py-1 md:px-4 md:py-2 bg-github-green hover:bg-github-green-hover text-white rounded-full transition-colors text-sm md:text-base"
                >
                  <PlusCircle className="w-4 h-4 md:w-5 md:h-5" />
                  Create
                </button>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="text-github-text hover:text-white transition-colors"
                  >
                    <User size={24} />
                  </button>
                ) : (
                  <Link to="/auth" className="text-github-text hover:text-white transition-colors">
                    <User size={24} />
                  </Link>
                )}
              </div>
            </div>

            <ProjectFilters
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              showArchive={showArchive}
              setShowArchive={setShowArchive}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              tagCounts={tagCounts}
              setKey={setKey}
              categoryRef={categoryRef}
            />

            {loading ? (
              <div className="text-center text-github-text">Loading projects...</div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" key={key}>
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
                    categories={categories.filter(c => c.id !== 'all')}
                    project={editingProject || undefined}
                    onSubmit={handleProjectSubmit}
                    onClose={() => {
                      setIsFormOpen(false);
                      setEditingProject(null);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
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
            <footer className="mt-8 text-center text-github-text text-sm">
              <Link to="/terms" className="hover:text-white transition-colors mr-4">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </footer>
          </div>
        </div>
      );
    }

    function AppWrapper() {
      return (
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<App />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </Router>
      );
    }

    export default AppWrapper;
