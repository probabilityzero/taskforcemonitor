import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Clock, 
  AlertTriangle, 
  Star, 
  StarHalf, 
  ExternalLink,
  Lightbulb,
  PlayCircle,
  CheckCircle,
  Flag,
  X,
  Edit,
  MessageSquare,
  Calendar,
  Link as LinkIcon,
  ChevronRight
} from 'lucide-react';
import type { Project, ProjectStatus } from '../types';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  onStatusChange?: (project: Project, newStatus: ProjectStatus) => Promise<void>;
  onNotesUpdate?: (project: Project, newNotes: string) => Promise<void>;
  onLinkUpdate?: (project: Project, newLink: string) => Promise<void>;
  setToast?: (message: string) => void;
}

function ProjectCard({ 
  project, 
  onClick, 
  onStatusChange,
  onNotesUpdate,
  onLinkUpdate,
  setToast 
}: ProjectCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);
  const [isUpdatingLink, setIsUpdatingLink] = useState(false);
  const [notes, setNotes] = useState(project.comments || '');
  const [link, setLink] = useState(project.link || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleChangeStatus = async (newStatus: ProjectStatus) => {
    if (!onStatusChange) {
      try {
        setIsSubmitting(true);
        const { error } = await supabase
          .from('projects')
          .update({ status: newStatus })
          .eq('id', project.id);
          
        if (error) throw error;
        
        if (setToast) setToast(`Project status updated to ${getStatusLabel(newStatus)}`);
        setIsDetailModalOpen(false);
      } catch (error: any) {
        if (setToast) setToast(`Error: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      await onStatusChange(project, newStatus);
      setIsDetailModalOpen(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!onNotesUpdate) {
      try {
        setIsSubmitting(true);
        const { error } = await supabase
          .from('projects')
          .update({ comments: notes })
          .eq('id', project.id);
          
        if (error) throw error;
        
        if (setToast) setToast('Project notes updated');
        setIsUpdatingNotes(false);
      } catch (error: any) {
        if (setToast) setToast(`Error: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      await onNotesUpdate(project, notes);
      setIsUpdatingNotes(false);
    }
  };

  const handleSaveLink = async () => {
    if (!onLinkUpdate) {
      try {
        setIsSubmitting(true);
        const { error } = await supabase
          .from('projects')
          .update({ link })
          .eq('id', project.id);
          
        if (error) throw error;
        
        if (setToast) setToast('Project link updated');
        setIsUpdatingLink(false);
      } catch (error: any) {
        if (setToast) setToast(`Error: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      await onLinkUpdate(project, link);
      setIsUpdatingLink(false);
    }
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
            <motion.div 
              className="bg-github-card border-l border-github-border h-full overflow-y-auto md:w-1/2 w-full"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 md:p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-white flex-1">{project.name}</h2>
                  <div className="flex items-center gap-3">
                    <button 
                      className="bg-github-fg hover:bg-github-fg/80 text-white rounded-md px-3 py-1 text-sm flex items-center gap-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onClick) onClick();
                        setIsDetailModalOpen(false);
                      }}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button 
                      className="text-github-text hover:text-white transition-colors"
                      onClick={() => setIsDetailModalOpen(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Status */}
                  <div className="bg-github-fg rounded-md p-4 border border-github-border">
                    <h3 className="text-github-text text-sm mb-2">Status</h3>
                    <div className="flex flex-col gap-2">
                      <div className={cn(
                        "px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 border w-full", 
                        getStatusColor(project.status)
                      )}>
                        {getStatusIcon(project.status)} 
                        {getStatusLabel(project.status)}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <button 
                          className={cn(
                            "px-2 py-1 text-xs rounded-md flex items-center gap-1 border transition-colors",
                            project.status === 'concept' ? 'bg-purple-400/20 border-purple-400/30 text-purple-400' : 'bg-github-input border-github-border text-github-text hover:border-purple-400/50'
                          )}
                          onClick={() => handleChangeStatus('concept')}
                          disabled={isSubmitting}
                        >
                          <Lightbulb size={12} /> Concept
                        </button>
                        <button 
                          className={cn(
                            "px-2 py-1 text-xs rounded-md flex items-center gap-1 border transition-colors",
                            project.status === 'started' ? 'bg-green-400/20 border-green-400/30 text-green-400' : 'bg-github-input border-github-border text-github-text hover:border-green-400/50'
                          )}
                          onClick={() => handleChangeStatus('started')}
                          disabled={isSubmitting}
                        >
                          <PlayCircle size={12} /> In Progress
                        </button>
                        <button 
                          className={cn(
                            "px-2 py-1 text-xs rounded-md flex items-center gap-1 border transition-colors",
                            project.status === 'completed' ? 'bg-blue-400/20 border-blue-400/30 text-blue-400' : 'bg-github-input border-github-border text-github-text hover:border-blue-400/50'
                          )}
                          onClick={() => handleChangeStatus('completed')}
                          disabled={isSubmitting}
                        >
                          <CheckCircle size={12} /> Completed
                        </button>
                        <button 
                          className={cn(
                            "px-2 py-1 text-xs rounded-md flex items-center gap-1 border transition-colors",
                            project.status === 'abandonded' ? 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400' : 'bg-github-input border-github-border text-github-text hover:border-yellow-400/50'
                          )}
                          onClick={() => handleChangeStatus('abandonded')}
                          disabled={isSubmitting}
                        >
                          <Flag size={12} /> Abandoned
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dates and Tags */}
                  <div className="bg-github-fg rounded-md p-4 border border-github-border">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-github-text text-sm">Details</h3>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(project.priority)}
                        <span className="text-github-text text-sm">{project.priority || 'Low'} priority</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-github-text">
                        <Calendar size={14} /> Created: {formatDate(project.created_at)}
                      </div>
                      {project.updated_at && (
                        <div className="flex items-center gap-2 text-sm text-github-text">
                          <Clock size={14} /> Updated: {formatDate(project.updated_at)}
                        </div>
                      )}
                    </div>

                    {tagsList.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-github-text text-xs mb-1">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {tagsList.map((tag, index) => (
                            <span 
                              key={index} 
                              className="bg-github-tag text-github-tag-text text-xs px-2 py-0.5 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-github-fg rounded-md p-4 border border-github-border mb-4">
                  <h3 className="text-github-text text-sm mb-2">Description</h3>
                  <p className="text-white text-sm whitespace-pre-wrap">
                    {project.description || "No description provided"}
                  </p>
                </div>

                {/* Repository Link */}
                <div className="bg-github-fg rounded-md p-4 border border-github-border mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-github-text text-sm">Repository Link</h3>
                    {!isUpdatingLink && (
                      <button 
                        className="text-github-text hover:text-white transition-colors text-xs"
                        onClick={() => setIsUpdatingLink(true)}
                      >
                        {project.link ? 'Edit' : 'Add link'}
                      </button>
                    )}
                  </div>

                  {isUpdatingLink ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://github.com/username/repository"
                        className="w-full bg-github-input border border-github-border rounded-md text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-github-green"
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          className="px-2 py-1 text-xs text-github-text hover:text-white transition-colors"
                          onClick={() => {
                            setLink(project.link || '');
                            setIsUpdatingLink(false);
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors"
                          onClick={handleSaveLink}
                          disabled={isSubmitting}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : project.link ? (
                    <div className="flex items-center gap-2">
                      <LinkIcon size={14} className="text-github-text" />
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-github-blue hover:underline text-sm flex-1 break-all"
                      >
                        {project.link}
                      </a>
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-github-input hover:bg-github-active-nav text-white rounded-md px-2 py-1 text-xs flex items-center gap-1 transition-colors ml-auto"
                      >
                        Visit <ExternalLink size={12} />
                      </a>
                    </div>
                  ) : (
                    <p className="text-github-text/50 text-sm italic">No repository link added</p>
                  )}
                </div>

                {/* Notes Section */}
                <div className="bg-github-fg rounded-md p-4 border border-github-border mb-4 flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-github-text text-sm flex items-center gap-2">
                      <MessageSquare size={14} /> Notes
                    </h3>
                    {!isUpdatingNotes && (
                      <button 
                        className="text-github-text hover:text-white transition-colors text-xs"
                        onClick={() => setIsUpdatingNotes(true)}
                      >
                        {project.comments ? 'Edit' : 'Add notes'}
                      </button>
                    )}
                  </div>

                  {isUpdatingNotes ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this project..."
                        className="w-full bg-github-input border border-github-border rounded-md text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-github-green min-h-[120px]"
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          className="px-2 py-1 text-xs text-github-text hover:text-white transition-colors"
                          onClick={() => {
                            setNotes(project.comments || '');
                            setIsUpdatingNotes(false);
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors"
                          onClick={handleSaveNotes}
                          disabled={isSubmitting}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : project.comments ? (
                    <p className="text-white text-sm whitespace-pre-wrap">{project.comments}</p>
                  ) : (
                    <p className="text-github-text/50 text-sm italic">No notes added</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProjectCard;