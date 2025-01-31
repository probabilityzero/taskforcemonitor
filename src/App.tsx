import React, { useEffect, useState } from 'react';
import { PlusCircle, Folder, FlaskRound as Flask, LineChart, Wrench, Archive } from 'lucide-react';
import { supabase } from './lib/supabase';
import { ProjectCard } from './components/ProjectCard';
import { ProjectForm } from './components/ProjectForm';
import type { Project, ProjectCategory } from './types';
import { cn } from './lib/utils';

const categories: { id: ProjectCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Projects', icon: <Folder className="w-5 h-5" /> },
  { id: 'research', label: 'Research', icon: <Flask className="w-5 h-5" /> },
  { id: 'analysis', label: 'Analysis', icon: <LineChart className="w-5 h-5" /> },
  { id: 'engineering', label: 'Engineering', icon: <Wrench className="w-5 h-5" /> },
  { id: 'miscellaneous', label: 'Miscellaneous', icon: <Archive className="w-5 h-5" /> },
];

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('status', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    setProjects(data || []);
  }

  async function handleProjectSubmit(projectData: Partial<Project>) {
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) throw error;
      }

      setIsFormOpen(false);
      setEditingProject(null);
      await fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
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
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Add Project
          </button>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                selectedCategory === category.id
                  ? "bg-github-green text-white"
                  : "bg-github-card text-github-text border border-github-border hover:border-github-green"
              )}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(project) => {
                setEditingProject(project);
                setIsFormOpen(true);
              }}
              onToggleStarted={handleToggleStarted}
            />
          ))}
        </div>

        {isFormOpen && (
          <ProjectForm
            project={editingProject || undefined}
            onSubmit={handleProjectSubmit}
            onClose={() => {
              setIsFormOpen(false);
              setEditingProject(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App