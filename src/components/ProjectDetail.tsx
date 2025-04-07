import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
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
  PlusCircle,
  NotebookPenIcon
} from 'lucide-react';
import type { Project, ProjectStatus, NoteEntry } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { 
  addProjectNote, 
  deleteProjectNote,
  updateProjectStatus,
  updateProject,
  parseProjectNotes
} from '../lib/projectUtils';

interface ProjectDetailProps {
  project: Project;
  isModal?: boolean;
  onClose?: () => void;
  onEdit?: () => void;
  onStatusChange?: (project: Project, newStatus: ProjectStatus) => Promise<void>;
  onUpdate?: () => void; // To refresh project data after changes
  setToast?: (message: string) => void;
}

// Prevent closing when clicking inside the modal
function ProjectDetail({ 
  project,
  onClose,
  onEdit,
  onUpdate,
  onStatusChange,
  setToast,
  isModal = false
}: ProjectDetailProps) {
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);
  const [isUpdatingLink, setIsUpdatingLink] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [link, setLink] = useState(project.link || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Parse notes from project.comments using the utility
  const [notes, setNotes] = useState<NoteEntry[]>(() => parseProjectNotes(project));

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const tagsList = project.tags && typeof project.tags === 'string' 
    ? project.tags.split(',').filter(Boolean).map(tag => tag.trim()) 
    : Array.isArray(project.tags) 
    ? project.tags.filter(Boolean)
    : [];

  const handleChangeStatus = async (newStatus: ProjectStatus) => {
    if (!onStatusChange) {
      try {
        setIsSubmitting(true);
        await updateProjectStatus(project.id, newStatus);
        
        if (setToast) setToast(`Project status updated to ${getStatusLabel(newStatus)}`);
        if (onUpdate) onUpdate();
        if (isModal && onClose) onClose();
      } catch (error: any) {
        if (setToast) setToast(`Error: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      await onStatusChange(project, newStatus);
      if (onUpdate) onUpdate();
      if (isModal && onClose) onClose();
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim() === '') return;
    
    try {
      setIsSubmitting(true);
      await addProjectNote(project.id, newNote.trim());
      
      // Update local state
      const newEntry: NoteEntry = {
        id: Date.now().toString(),
        text: newNote.trim(),
        date: new Date().toISOString()
      };
      
      setNotes([...notes, newEntry]);
      setNewNote('');
      if (setToast) setToast('Note added');
      setIsUpdatingNotes(false);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      if (setToast) setToast(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      setIsSubmitting(true);
      await deleteProjectNote(project.id, noteId);
      
      // Update local state
      setNotes(notes.filter(note => note.id !== noteId));
      if (setToast) setToast('Note removed');
      if (onUpdate) onUpdate();
    } catch (error: any) {
      if (setToast) setToast(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveLink = async () => {
    try {
      setIsSubmitting(true);
      await updateProject(project.id, { link });
      
      if (setToast) setToast('Project link updated');
      setIsUpdatingLink(false);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      if (setToast) setToast(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFullPage = () => {
    if (isModal && onClose) {
      onClose();
      navigate(`/project/${project.id}`);
    }
  };

  const handleCloseAndGoBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  // Add a function to prevent click propagation
  const handleContentClick = (e: React.MouseEvent) => {
    // Stop the click from reaching the backdrop
    e.stopPropagation();
  };

  const detailContent = (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col h-full" onClick={handleContentClick}>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-white flex-1">{project.name}</h2>
        <div className="flex items-center gap-3">
          {isModal && (
            <button 
              className="bg-github-fg hover:bg-github-fg/80 text-white rounded-md px-3 py-1 text-sm flex items-center gap-1 transition-colors"
              onClick={handleOpenFullPage}
            >
              <ExternalLink size={14} /> Open Full View
            </button>
          )}
          {onEdit && (
            <button 
              className="bg-github-fg hover:bg-github-fg/80 text-white rounded-md px-3 py-1 text-sm flex items-center gap-1 transition-colors"
              onClick={onEdit}
            >
              <Edit size={14} /> Edit
            </button>
          )}
          <button 
            className="text-github-text hover:text-white transition-colors"
            onClick={handleCloseAndGoBack}
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
            
            {/* Only display updated_at if it exists and is different from created_at */}
            {project.updated_at && new Date(project.updated_at).getTime() > new Date(project.created_at).getTime() && (
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
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-github-text text-sm flex items-center gap-2">
            <MessageSquare size={14} /> Notes
          </h3>
          <button 
            className="text-github-text hover:text-white transition-colors text-xs flex items-center gap-1"
            onClick={() => setIsUpdatingNotes(!isUpdatingNotes)}
          >
            <NotebookPenIcon size={12} /> Add note
          </button>
        </div>

        {/* Add new note */}
        {isUpdatingNotes && (
          <div className="flex flex-col gap-2 mb-4 bg-github-card p-3 rounded-md border border-github-border">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full bg-github-input border border-github-border rounded-md text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-github-green min-h-[80px]"
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                className="px-2 py-1 text-xs text-github-text hover:text-white transition-colors"
                onClick={() => {
                  setNewNote('');
                  setIsUpdatingNotes(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="px-2 py-1 text-xs bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors"
                onClick={handleAddNote}
                disabled={isSubmitting || newNote.trim() === ''}
              >
                Add Note
              </button>
            </div>
          </div>
        )}

        {/* Notes history */}
        {notes.length > 0 ? (
          <div className="space-y-3 mt-2">
            {notes.map((note, index) => (
              <div 
                key={note.id || index} 
                className={cn(
                  "p-3 rounded-md border relative",
                  index === notes.length - 1 
                    ? "bg-github-card/60 border-github-border" 
                    : "bg-github-card/30 border-github-border/50"
                )}
              >
                <div className="text-white text-sm whitespace-pre-wrap mb-2">
                  {note.text}
                </div>
                <div className="flex justify-between items-center text-xs text-github-text mt-2 pt-2 border-t border-github-border/30">
                  <span>{formatDateTime(note.date || project.created_at)}</span>
                  
                  <button
                    className="text-github-text hover:text-red-400 transition-colors"
                    onClick={() => handleDeleteNote(note.id || index.toString())}
                    disabled={isSubmitting}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-github-text/50 text-sm italic">No notes added</p>
        )}
      </div>
    </div>
  );

  // If used as a standalone page
  if (!isModal) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 h-full overflow-y-auto">
        {detailContent}
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-github-card border-l border-github-border h-full overflow-y-auto md:w-2/3 lg:w-1/2 w-full"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {detailContent}
    </motion.div>
  );
}

export default ProjectDetail;