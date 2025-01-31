import React, { useEffect, useState, useRef } from 'react';
import { PlusCircle, Folder, BrainCircuit as Brain, Terminal, LineChart, Cpu, Archive } from 'lucide-react';
import { supabase } from './lib/supabase';
import { ProjectCard } from './components/ProjectCard';
import { ProjectForm } from './components/ProjectForm';
import type { Project, ProjectCategory } from './types';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const categories: { id: ProjectCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Projects', icon: <Folder className="w-5 h-5" /> },
  { id: 'research', label: 'Research', icon: <Brain className="w-5 h-5" /> },
  { id: 'analysis', label: 'Analysis', icon: <LineChart className="w-5 h-5" /> },
  { id: 'engineering', label: 'Engineering', icon: <Cpu className="w-5 h-5" /> },
  { id: 'miscellaneous', label: 'Miscellaneous', icon: <Archive className="w-5 h-5" /> },
];

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
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
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();

        if (error) throw error;
        setProjects(prev => [...prev, data]);
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
    const newStatus = project.status === 'started' ? 'idea' : 'started';
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

  const filteredProjects = projects.filter(project => 
    selectedCategory === 'all' || project.categories === selectedCategory
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.status === 'started' && b.status !== 'started') return -1;
    if (a.status !== 'started' && b.status === 'started') return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-github-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-github-text">
            Project Monitor
          </h1>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-github-green hover:bg-github-green-hover text-white rounded-full transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Add Project
          </button>
        </div>

        <div className="relative mb-8 overflow-x-auto pb-2" ref={categoryRef}>
          <motion.div
            className="absolute top-0 left-0 h-full bg-github-green rounded-md transition-all duration-300"
            style={{
              left: categoryRef.current?.querySelector(`[data-category="${selectedCategory}"]`)?.offsetLeft || 0,
              width: categoryRef.current?.querySelector(`[data-category="${selectedCategory}"]`)?.offsetWidth || 0,
              height: categoryRef.current?.querySelector(`[data-category="${selectedCategory}"]`)?.offsetHeight || 0,
            }}
            layout
          />
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors z-10 text-sm",
                  selectedCategory === category.id
                    ? "text-white"
                    : "bg-github-card text-github-text border border-github-border hover:border-github-green"
                )}
                data-category={category.id}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-github-text">Loading projects...</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    onEdit={(project) => {
                      setEditingProject(project);
                      setIsFormOpen(true);
                    }}
                    onToggleStarted={handleToggleStarted}
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
      </div>
    </div>
  );
}

export default App
