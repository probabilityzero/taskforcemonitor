import React, { useState, useRef, useEffect } from 'react';
    import { X, Circle, PlayCircle, CheckCircle, Flag, Lightbulb, Trash2 } from 'lucide-react';
    import type { Project, ProjectStatus, ProjectCategory } from '../types';
    import { motion, AnimatePresence } from 'framer-motion';
    import { cn } from '../lib/utils';
    import { Select } from './Select';
    import { supabase } from '../lib/supabase';

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
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
        const categoryRef = useRef<HTMLDivElement>(null);
        const [allTags, setAllTags] = useState<string[]>([]);
        const [filteredTags, setFilteredTags] = useState<string[]>([]);

        useEffect(() => {
            const fetchAllTags = async () => {
                const { data, error } = await supabase
                    .from('projects')
                    .select('tags');

                if (error) {
                    console.error('Error fetching tags:', error);
                    return;
                }

                const tags = data?.reduce((acc: string[], project: { tags: string }) => {
                    project.tags.split(',').forEach(tag => {
                        const trimmedTag = tag.trim();
                        if (trimmedTag && !acc.includes(trimmedTag)) {
                            acc.push(trimmedTag);
                        }
                    });
                    return acc;
                }, []) || [];
                setAllTags(tags);
                setFilteredTags(tags);
            };

            fetchAllTags();
        }, []);

      const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTagInput(value);
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
            { value: 'concept', label: 'Concept', icon: <Lightbulb size={14} />, color: '#b388eb' },
            { value: 'started', label: 'Started', icon: <PlayCircle size={14} />, color: '#238636' },
            { value: 'completed', label: 'Completed', icon: <CheckCircle size={14} />, color: '#1f6feb' },
            { value: 'abandonded', label: 'Abandoned', icon: <Flag size={14} />, color: '#6c757d' },
        ];

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

        const handleTagClick = (tag: string) => {
            setTagList(prev => [...prev, tag]);
            setTagInput('');
            setFilteredTags(allTags);
            if (tagInputRef.current) {
                tagInputRef.current.focus();
            }
        };

      return (
        <motion.div
          className="bg-github-card rounded-lg w-full max-w-2xl relative border border-github-border p-3 md:p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          layout
        >
          
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-xl font-bold text-github-text">
              {project ? 'Edit Project' : 'Create Project'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
            {formError && <div className="text-red-500 mb-2 md:mb-4">{formError}</div>}
            
            <div className="mb-2 md:mb-3" ref={categoryRef}>
              <div className="relative overflow-x-auto pb-2">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-github-green rounded-md transition-all duration-300"
                  style={{
                    left: categoryRef.current?.querySelector(`[data-category="${formData.categories}"]`)?.offsetLeft || 0,
                    width: categoryRef.current?.querySelector(`[data-category="${formData.categories}"]`)?.offsetWidth || 0,
                    height: categoryRef.current?.querySelector(`[data-category="${formData.categories}"]`)?.offsetHeight || 0,
                  }}
                  layout
                />
                <div className="flex gap-1 md:gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, categories: category.id }))}
                      className={cn(
                        "relative flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-xs md:text-sm z-10",
                        formData.categories === category.id
                          ? "bg-github-green text-white"
                          : "bg-github-card text-github-text border border-github-border hover:border-github-green"
                      )}
                      data-category={category.id}
                    >
                      {category.icon}
                      <span className="hidden md:inline">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-github-text">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-0.5 rounded-md border focus:border-github-border-light bg-github-input text-github-text text-sm h-10"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-github-text">​​</label>   {/* zero width space */}
                <Select
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value as ProjectStatus }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-github-text">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-0.5 rounded-md border focus:border-github-border-light bg-github-input text-github-text text-sm h-20"
                rows={2}
              />
            </div>
            
            
            
            <AnimatePresence>
              {(formData.status === 'completed' || formData.status === 'started') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <label className="block text-sm font-medium mb-1 text-github-text">Website</label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full p-0.5 rounded-md border focus:border-github-border-light bg-github-input text-github-text text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            
            
            <div className="mb-2 md:mb-3">
              <label className="block text-sm font-medium mb-1 text-github-text">Topics</label>
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder=""
                  className="w-full p-0.5 rounded-md border focus:border-github-border-light bg-github-input text-github-text placeholder:text-xs text-sm"
                    ref={tagInputRef}
                />
                  {filteredTags.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-github-card border border-github-border rounded-md max-h-32 overflow-y-auto">
                          {filteredTags.map(tag => (
                              <button
                                  key={tag}
                                  onClick={() => handleTagClick(tag)}
                                  className="block w-full text-left px-2 py-1 text-sm text-github-text hover:bg-github-border"
                              >
                                  {tag}
                              </button>
                          ))}
                      </div>
                  )}
              </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tagList.map((tag, index) => (
                    <span
                      key={index}
                      className="px-1 py-0.5 bg-[#21262d] rounded-full text-xs text-github-text border border-github-border flex items-center gap-1"
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
            </div>
            
            
            
            
            
            <div>
              <label className="block text-sm font-medium mb-1 text-github-text">Notes</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full p-0.5 rounded-md border focus:border-github-border-light bg-github-input text-github-text text-sm h-20"
                rows={2}
              />
            </div>
            
            <div className="flex justify-between items-center mt-3 md:mt-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-sm text-github-text hover:text-red-500 transition-colors ml-2"
              >
                Delete
              </button>
              <div className="flex gap-2 md:gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 text-github-text hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-github-green hover:bg-github-green-hover text-white rounded-full transition-colors"
                >
                  {project ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </form>
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="bg-github-card rounded-lg p-6 border border-github-border"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                        >
                            <h3 className="text-lg font-semibold mb-4 text-github-text">
                                Delete Project
                            </h3>
                            <p className="text-github-text mb-4">
                                Are you sure you want to delete this project?
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-3 py-1 text-github-text hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteProject}
                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
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
