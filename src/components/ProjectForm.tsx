import React, { useState, useRef, useEffect } from 'react';
import { X, Circle, PlayCircle, CheckCircle, Flag, Lightbulb } from 'lucide-react';
import type { Project, ProjectStatus, ProjectCategory } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Select } from './Select';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Partial<Project>) => void;
  onClose: () => void;
  categories: { id: ProjectCategory | 'all'; label: string; icon: React.ReactNode }[];
}

export function ProjectForm({ project, onSubmit, onClose, categories }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    categories: project?.categories || 'miscellaneous',
    link: project?.link || '',
    status: project?.status || 'concept',
    tags: project?.tags || '',
    comments: project?.comments || ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>(project?.tags ? project.tags.split(',').map(tag => tag.trim()) : []);
    const tagInputRef = useRef<HTMLInputElement>(null);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' && tagInput.trim() !== '') {
      e.preventDefault();
      setTagList(prev => [...prev, tagInput.trim()]);
        setTagInput('');
        if (tagInputRef.current) {
            tagInputRef.current.focus();
        }
    }
  };

  const removeTag = (index: number) => {
    setTagList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError('Project name is required.');
      return;
    }

    setFormError(null);
    onSubmit({ ...formData, tags: tagList.join(',') });
  };

    const statusOptions = [
        { value: 'concept', label: 'Concept', icon: <Lightbulb size={16} />, color: '#b388eb' },
        { value: 'started', label: 'Started', icon: <PlayCircle size={16} />, color: '#238636' },
        { value: 'completed', label: 'Completed', icon: <CheckCircle size={16} />, color: '#17a2b8' },
        { value: 'abandonded', label: 'Abandoned', icon: <Flag size={16} />, color: '#6c757d' },
    ];

  return (
    <motion.div
      className="bg-github-card rounded-lg w-full max-w-2xl relative border border-github-border p-4 md:p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      layout
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-github-text hover:text-white transition-colors"
      >
        <X size={20} md:size={24} />
      </button>
      
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-github-text">
        {project ? 'Edit Project' : 'Add Project'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
        {formError && <div className="text-red-500 mb-4">{formError}</div>}
        
        <div className="mb-2 md:mb-4">
          <div className="flex gap-1 md:gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, categories: category.id }))}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-xs md:text-sm",
                  formData.categories === category.id
                    ? "bg-github-green text-white"
                    : "bg-github-card text-github-text border border-github-border hover:border-github-green"
                )}
              >
                {category.icon}
                <span className="hidden md:inline">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-github-text">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-1 md:p-2 rounded-md border"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-github-text">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-1 md:p-2 rounded-md border"
            rows={2} md:rows={3}
          />
        </div>
        
        <div className="mb-2 md:mb-4">
          <label className="block text-sm font-medium mb-1 text-github-text">Tags</label>
          <div className="relative">
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder=""
              className="w-full p-1 md:p-2 rounded-md border"
                ref={tagInputRef}
            />
          </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {tagList.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[#21262d] rounded-full text-xs text-github-text border border-github-border flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-github-text hover:text-white transition-colors"
                  >
                    <X size={10} md:size={12} />
                  </button>
                </span>
              ))}
            </div>
        </div>
        
        <hr className="border-github-border mb-2 md:mb-4" />
        
        
        
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <label className="block text-sm font-medium text-github-text">Status</label>
          <div className="flex items-center gap-2">
            <Select
              options={statusOptions}
              value={formData.status}
              onChange={(value) => setFormData(prev => ({ ...prev, status: value as ProjectStatus }))}
            />
          </div>
        </div>
        
        <AnimatePresence>
          {formData.status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <label className="block text-sm font-medium mb-1 text-github-text">Link</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full p-1 md:p-2 rounded-md border"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        
        
        
        
        <div>
          <label className="block text-sm font-medium mb-1 text-github-text">Notes</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
            className="w-full p-1 md:p-2 rounded-md border"
            rows={2} md:rows={3}
          />
        </div>
        
        <div className="flex justify-end gap-2 md:gap-4 mt-4 md:mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 md:px-4 md:py-2 text-github-text hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 md:px-4 md:py-2 bg-github-green hover:bg-github-green-hover text-white rounded-full transition-colors"
          >
            {project ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
