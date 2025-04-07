import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock,
  Star, 
  StarHalf,
  ChevronRight,
  Calendar,
  Lightbulb,
  PlayCircle,
  CheckCircle,
  Flag
} from 'lucide-react';
import type { Project, ProjectStatus } from '../types';
import { cn } from '../lib/utils';
import ProjectDetail from './ProjectDetail';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  onStatusChange?: (project: Project, newStatus: ProjectStatus) => Promise<void>;
  setToast?: (message: string) => void;
  onUpdate?: () => void;
}

function ProjectCard({ 
  project, 
  onClick, 
  onStatusChange,
  setToast,
  onUpdate
}: ProjectCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getStatusIcon = (status: string, size = 14) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={size} className="text-blue-400" />;
      case 'started':
        return <PlayCircle size={size} className="text-green-400" />;
      case 'abandonded':
        return <Flag size={size} className="text-yellow-400" />;
      default:
        return <Lightbulb size={size} className="text-purple-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-blue-400/10 text-blue-400 border-blue-400/30';
      case 'started': return 'bg-green-400/10 text-green-400 border-green-400/30';
      case 'abandonded': return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30';
      default: return 'bg-purple-400/10 text-purple-400 border-purple-400/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'started': return 'In Progress';
      case 'abandonded': return 'Abandoned';
      default: return 'Concept';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Star className="text-yellow-400" />;
      case 'medium':
        return <StarHalf className="text-yellow-400" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const tagsList = project.tags && typeof project.tags === 'string' 
    ? project.tags.split(',').filter(Boolean).map(tag => tag.trim()) 
    : Array.isArray(project.tags) 
    ? project.tags.filter(Boolean)
    : [];

  const handleOpenDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailModalOpen(true);
  };

  return (
    <>
      <motion.div
        className="border border-github-border bg-github-card rounded-md overflow-hidden hover:border-github-border-hover transition-colors cursor-pointer"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        onClick={handleOpenDetail}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-white font-medium">{project.name}</h3>
            <div className="flex items-center gap-1">
              {getPriorityIcon(project.priority)} 
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-md flex items-center gap-1 border", 
                getStatusColor(project.status)
              )}>
                {getStatusIcon(project.status, 12)} 
                {getStatusLabel(project.status)}
              </span>
            </div>
          </div>
          
          <p className="text-github-text text-sm mb-3 line-clamp-2">
            {project.description || "No description provided"}
          </p>
          
          {tagsList.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tagsList.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-github-tag text-github-tag-text text-xs px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between text-github-text text-xs">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {formatDate(project.created_at)}
            </span>
            
            <button 
              className="text-github-text hover:text-white transition-colors flex items-center gap-0.5"
              onClick={handleOpenDetail}
            >
              Details <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex justify-end overflow-hidden" onClick={() => setIsDetailModalOpen(false)}>
            <ProjectDetail 
              project={project}
              isModal={true}
              onClose={() => setIsDetailModalOpen(false)}
              onEdit={onClick}
              onStatusChange={onStatusChange}
              onUpdate={onUpdate}
              setToast={setToast}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProjectCard;