import React, { useState, useRef, useEffect } from 'react';
import { X, PlayCircle, CheckCircle, Flag, Lightbulb, Calendar, MessageSquare, Link as LinkIcon, Tag, Star } from 'lucide-react';
import type { Project, ProjectStatus, ProjectPriority } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Select } from './Select';
import { supabase } from '../lib/supabase';
import { CategoryManager } from './CategoryManager';
import { cn } from '../lib/utils';

interface ProjectFormProps {
  project?: Project;
  initialData?: Partial<Project>;
  onSubmit: (data: Partial<Project>) => void;
  onClose: () => void;
  customCategories: any[];
  onAddCategory: (category: any) => void;
}

export function ProjectForm({ 
  project, 
  initialData,
  onSubmit, 
  onClose, 
  customCategories,
  onAddCategory 
}: ProjectFormProps) {
  // State initialization
  const [formData, setFormData] = useState({
    name: project?.name || initialData?.name || '',
    description: project?.description || initialData?.description || '',
    categories: project?.categories || initialData?.categories || 'miscellaneous',
    status: project?.status || initialData?.status || ('concept' as ProjectStatus),
    comments: project?.comments || initialData?.comments || '',
    priority: project?.priority || initialData?.priority || ('medium' as ProjectPriority)
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>(() => {
    if (project?.tags) {
      return typeof project.tags === 'string' 
        ? project.tags.split(',').map(tag => tag.trim()) 
        : Array.isArray(project.tags) ? project.tags : [];
    }
    if (initialData?.tags) {
      return typeof initialData.tags === 'string'
        ? initialData.tags.split(',').map(tag => tag.trim())
        : Array.isArray(initialData.tags) ? initialData.tags : [];
    }
    return [];
  });
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [link, setLink] = useState(project?.link || initialData?.link || '');

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Fetch all tags for suggestions
  useEffect(() => {
    const fetchAllTags = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('tags');

      if (error) {
        console.error('Error fetching tags:', error);
        return;
      }

      const tags: string[] = [];
      data?.forEach((project: { tags: string | string[] }) => {
        if (typeof project.tags === 'string') {
          project.tags.split(',').forEach((tag: string) => {
            const trimmedTag = tag.trim();
            if (trimmedTag && !tags.includes(trimmedTag)) {
              tags.push(trimmedTag);
            }
          });
        } else if (Array.isArray(project.tags)) {
          project.tags.forEach((tag: string) => {
            if (tag && !tags.includes(tag)) {
              tags.push(tag);
            }
          });
        }
      });
      
      setAllTags(tags);
      setFilteredTags(tags);
    };

    fetchAllTags();
  }, []);

  // Tag input handlers
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    setShowTagSuggestions(true);
    if (value.trim() === '') {
      setFilteredTags(allTags);
    } else {
      const filtered = allTags.filter(tag => tag.toLowerCase().includes(value.toLowerCase()));
      setFilteredTags(filtered);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && tagInput.trim() !== '') {
      e.preventDefault();
      setTagList(prev => [...prev, tagInput.trim()]);
      setTagInput('');
      setFilteredTags(allTags);
      setShowTagSuggestions(false);
      if (tagInputRef.current) {
        tagInputRef.current.focus();
      }
    }
  };

  const removeTag = (index: number) => {
    setTagList(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError('Project name is required.');
      return;
    }

    setFormError(null);
    onSubmit({
      ...formData,
      tags: tagList.join(','),
      status: formData.status as ProjectStatus,
      priority: formData.priority as ProjectPriority,
      link
    });
  };

  // Status and priority options
  const statusOptions = [
    { value: 'concept', label: 'Concept', icon: <Lightbulb size={14} />, color: '#b388eb' },
    { value: 'started', label: 'In Progress', icon: <PlayCircle size={14} />, color: '#238636' },
    { value: 'completed', label: 'Completed', icon: <CheckCircle size={14} />, color: '#1f6feb' },
    { value: 'abandonded', label: 'Abandoned', icon: <Flag size={14} />, color: '#6c757d' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#6c757d' },
    { value: 'medium', label: 'Medium', color: '#f0883e' },
    { value: 'high', label: 'High', color: '#f85149' },
  ];

  // Delete project
  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      setIsDeleteModalOpen(false);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
        return;
      }
      onClose();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  // Tag suggestion handlers
  const handleTagClick = (tag: string) => {
    setTagList(prev => [...prev, tag]);
    setTagInput('');
    setFilteredTags(allTags);
    setShowTagSuggestions(false);
    if (tagInputRef.current) {
      tagInputRef.current.focus();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowTagSuggestions(false);
    }, 100);
  };

  // Handle category selection
  const handleSelectCategory = (categoryId: string) => {
    if (categoryId !== 'all') {
      setFormData(prev => ({ ...prev, categories: categoryId }));
    }
  };

  return (
    <motion.div
      className="bg-github-card rounded-lg w-full max-w-xl relative border border-github-border"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      layout
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-white">
            {project ? 'Edit Project' : 'Create Project'}
          </h2>
          <button 
            className="text-github-text hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="mb-4 p-2 bg-red-900/20 border border-red-500/30 rounded-md text-red-400 text-sm">
              {formError}
            </div>
          )}

          <div className="space-y-5">
            {/* Project Name - Always first and prominent */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-github-text">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 rounded-md border focus:border-github-border-light bg-github-input text-github-text text-sm"
                required
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-medium text-github-text">Status</label>
                  {statusOptions.find(o => o.value === formData.status)?.icon}
                </div>
                <Select
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value as ProjectStatus }))}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-medium text-github-text">Priority</label>
                  <Star size={14} className="text-github-text" />
                </div>
                <Select
                  options={priorityOptions}
                  value={formData.priority}
                  onChange={(value) => setFormData(prev => ({ ...prev, priority: value as ProjectPriority }))}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-github-text">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 rounded-md border focus:border-github-border-light bg-github-input text-github-text text-sm"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-sm font-medium text-github-text">Category</label>
                <Tag size={14} className="text-github-text" />
              </div>
              <CategoryManager
                categories={customCategories}
                selectedCategory={formData.categories}
                onSelectCategory={handleSelectCategory}
                onAddCategory={onAddCategory}
              />
            </div>

            {/* Topics/Tags */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-github-text">Topics</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Press space to add tag"
                  className="w-full p-2 rounded-md border focus:border-github-border-light bg-github-input text-github-text placeholder:text-github-text/50 text-sm"
                  ref={tagInputRef}
                  onBlur={handleBlur}
                />
                {showTagSuggestions && filteredTags.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-github-card border border-github-border rounded-md max-h-32 overflow-y-auto">
                    {filteredTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="block w-full text-left px-2 py-1 text-sm text-github-text hover:bg-github-border"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tagList.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-github-input rounded-md text-xs text-github-text border border-github-border flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-github-text hover:text-white transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Repository Link */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-sm font-medium text-github-text" htmlFor="link">
                  Link to Project
                </label>
                <LinkIcon size={14} className="text-github-text" />
              </div>
              <input
                id="link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full p-2 bg-github-input border border-github-border rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-github-green"
                placeholder="https://github.com/username/repository"
              />
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-sm font-medium text-github-text">Notes</label>
                <MessageSquare size={14} className="text-github-text" />
              </div>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full p-2 rounded-md border focus:border-github-border-light bg-github-input text-github-text text-sm"
                rows={4}
                placeholder="Add any additional notes or context..."
              />
            </div>

            {/* Creation Date (read-only) */}
            {project && project.created_at && (
              <div className="flex items-center gap-2 text-sm text-github-text">
                <Calendar size={14} /> Created: {new Date(project.created_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-5 border-t border-github-border mt-5">
            {/* Delete option (only for existing projects) */}
            {project && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              >
                <X size={14} className="text-red-400" />
                Delete project
              </button>
            )}
            
            {/* If no project (new project) add spacer */}
            {!project && <div></div>}
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-github-text hover:text-white transition-colors rounded-md border border-transparent hover:border-github-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors"
              >
                {project ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <motion.div
              className="bg-github-card rounded-lg p-6 border border-github-border max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2 text-white">
                Delete Project
              </h3>
              <p className="text-github-text mb-4">
                Are you sure you want to delete "{project?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3 py-1.5 text-github-text hover:text-white transition-colors rounded-md border border-transparent hover:border-github-border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}