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
import { Footer } from './components/Footer';
import { ProfileDropdown } from './components/ProfileDropdown';
import { User } from 'lucide-react';
import AccountSettings from './pages/AccountSettings';

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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isBlurBackground, setIsBlurBackground] = useState(false);

  useEffect(() => {
    setIsBlurBackground(isFormOpen || isProfileDropdownOpen);
  }, [isFormOpen, isProfileDropdownOpen]);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      fetchProjects();
    }
  }, [user, navigate]);

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
    // ... (rest of handleProjectSubmit function remains the same)
  }

  async function handleToggleStarted(project: Project) {
    // ... (rest of handleToggleStarted function remains the same)
  }

  const filteredProjects = projects.filter(project => {
    // ... (rest of filteredProjects function remains the same)
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // ... (rest of sortedProjects function remains the same)
  });

  const tagCounts = projects.length > 0 ? projects.reduce((acc, project) => { // Check if projects array is empty
    project.tags.split(',').forEach(tag => {
      const trimmedTag = tag.trim();
      acc[trimmedTag] = (acc[trimmedTag] || 0) + 1;
    });
    return acc;
  }, {} as { [tag: string]: number }) : {}; // Return empty object if projects is empty


  return (
    <div className={cn("min-h-screen bg-github-bg flex flex-col justify-between", isBlurBackground ? "backdrop-blur-md bg-black/40" : "")}>
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 w-full">
        <div className="mb-3 md:mb-4">
          <div className="flex justify-between items-center px-0 md:px-0 mb-2 md:mb-3">
            <h1 className="text-xl md:text-3xl font-bold text-github-text flex items-center gap-1 md:gap-2">
              Task Force <span className="font-thin">Monitor</span>
            </h1>
            <div className="flex items-center gap-4 md:gap-6">
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
              {user && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    }}
                    className="profile-button"
                  >
                    <User size={24} />
                  </button>
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <ProfileDropdown onClose={() => setIsProfileDropdownOpen(false)} user={user} />
                    )}
                  </AnimatePresence>
                </div>
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
            className="mt-2 md:mt-4 px-0 md:px-0"
          />
        </div>


        {loading ? (
          <div className="text-center text-github-text">Loading projects...</div>
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
      </div>
      <Footer />
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
        <Route path="/account-settings" element={<AccountSettings />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
