import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Project, ProjectStatus, ProjectCategory } from '../types';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Partial<Project>) => void;
  onClose: () => void;
}

export function ProjectForm({ project, onSubmit, onClose }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    categories: project?.categories || 'miscellaneous',
    link: project?.link || '',
    status: project?.status || 'idea',
    tags: project?.tags || '',
    comments: project?.comments || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-github-card rounded-lg w-full max-w-2xl p-6 relative border border-github-border">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-github-text hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-github-text">
          {project ? 'Edit Project' : 'Add New Project'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-github-text">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 rounded-md border"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-github-text">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 rounded-md border"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-github-text">Category</label>
            <select
              value={formData.categories}
              onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value as ProjectCategory }))}
              className="w-full p-2 rounded-md border"
            >
              <option value="research">Research</option>
              <option value="analysis">Analysis</option>
              <option value="engineering">Engineering</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>
          
          {(project?.status === 'completed' || formData.status === 'completed') && (
            <div>
              <label className="block text-sm font-medium mb-1 text-github-text">Link</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                className="w-full p-2 rounded-md border"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1 text-github-text">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
              className="w-full p-2 rounded-md border"
            >
              <option value="idea">Idea</option>
              <option value="started">Started</option>
              <option value="completed">Completed</option>
              <option value="abandonded">Abandoned</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-github-text">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full p-2 rounded-md border"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-github-text">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              className="w-full p-2 rounded-md border"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-github-text hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors"
            >
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}