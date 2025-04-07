import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AppContext } from '../App';
import type { Project } from '../types';
import ProjectDetail from '../components/ProjectDetail';
import { ProjectForm } from '../components/ProjectForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectDetailSkeleton } from '../components/Skeleton';

function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;
    
    const fetchProject = async () => {
      try {
        setLoading(true);
        
        // First check if we have permission to view this project
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Project not found');
        if (data.user_id !== user?.id) throw new Error('You do not have permission to view this project');
        
        setProject(data as Project);
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Load custom categories from localStorage
    const saved = localStorage.getItem('projectCategories');
    if (saved) {
      setCustomCategories(JSON.parse(saved));
    }
    
    fetchProject();
  }, [projectId, user]);

  const handleProjectUpdate = async (data: Partial<Project>) => {
    if (!project) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);
        
      if (error) throw error;
      
      setToast('Project updated successfully!');
      setIsEditModalOpen(false);
      
      // Refresh project data
      const { data: updatedProject, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project.id)
        .single();
        
      if (fetchError) throw fetchError;
      setProject(updatedProject as Project);
    } catch (err: any) {
      setToast(`Error: ${err.message}`);
    }
  };

  const handleAddCategory = (category: any) => {
    const updatedCategories = [...customCategories, category];
    setCustomCategories(updatedCategories);
    localStorage.setItem('projectCategories', JSON.stringify(updatedCategories));
  };

  const refreshProject = async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      setProject(data as Project);
    } catch (err: any) {
      console.error('Error refreshing project:', err);
    }
  };

  // Prevent body scroll when modal is active
  useEffect(() => {
    // Prevent scrolling on the background when modal is open
    if (isEditModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup - ensure scrolling is restored
      document.body.style.overflow = '';
    };
  }, [isEditModalOpen]);

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto py-6 px-4">
        <ProjectDetailSkeleton />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="text-red-400 mb-4">{error || 'Project not found'}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-github-card border border-github-border text-github-text hover:text-white rounded-md transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh]">
      <ProjectDetail 
        project={project}
        isModal={false}
        onEdit={() => setIsEditModalOpen(true)}
        onUpdate={refreshProject}
        setToast={setToast}
      />

      {/* Edit Modal */}
      <AnimatePresence onExitComplete={() => {
        document.body.style.overflow = '';
      }}>
        {isEditModalOpen && (
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
              project={project}
              onSubmit={handleProjectUpdate}
              onClose={() => setIsEditModalOpen(false)}
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

export default ProjectDetailPage;