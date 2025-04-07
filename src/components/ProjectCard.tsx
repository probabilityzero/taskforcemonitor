import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Clock, 
  AlertTriangle, 
  Tag, 
  Star, 
  StarHalf, 
  ExternalLink 
} from 'lucide-react';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="text-green-400" />;
      case 'started':
        return <Clock className="text-blue-400" />;
      case 'abandonded':
        return <AlertTriangle className="text-yellow-400" />;
      default:
        return <Star className="text-gray-400" />;
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
    
  return (
    <motion.div
      className="border border-github-border bg-github-card rounded-md overflow-hidden hover:border-github-border-hover transition-colors cursor-pointer"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-medium">{project.name}</h3>
          <div className="flex items-center gap-1">
            {getPriorityIcon(project.priority)} 
            <span className="text-github-text bg-github-header-secondary text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              {getStatusIcon(project.status)} {project.status}
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
                className="bg-github-tag text-github-tag-text text-xs px-2 py-0.5 rounded-full flex items-center"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center text-github-text text-xs">
          <span>Created: {formatDate(project.created_at)}</span>
        </div>
        
        {/* Display project link if it exists */}
        {project.link && project.link.trim() !== '' && (
          <div className="mt-4 pt-4 border-t border-github-border">
            <div className="text-xs text-github-text mb-2">External Link:</div>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-github-blue hover:underline text-sm flex items-center"
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking the link
            >
              View Repository <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProjectCard;
