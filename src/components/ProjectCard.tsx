import React, { useState } from 'react';
    import { Edit2, ExternalLink, PlayCircle, ArrowUpRight, Circle, CheckCircle, Flag, Lightbulb, Calendar } from 'lucide-react';
    import type { Project, ProjectStatus } from '../types';
    import { cn } from '../lib/utils';

    interface ProjectCardProps {
      project: Project;
      onEdit: (project: Project) => void;
      onToggleStarted: (project: Project) => void;
      onStatusChange: (project: Project) => void;
      setToast: (message: string | null) => void;
        onTagClick: (tag: string) => void;
    }

    export function ProjectCard({ project, onEdit, onToggleStarted, onStatusChange, setToast, onTagClick }: ProjectCardProps) {
      const statusOptions = {
        'concept': { label: 'Concept', icon: <Lightbulb size={12} md:size={14} />, color: '#b388eb' },
        'started': { label: 'Started', icon: <PlayCircle size={12} md:size={14} />, color: '#238636' },
        'completed': { label: 'Completed', icon: <CheckCircle size={12} md:size={14} />, color: '#1f6feb' },
        'abandonded': { label: 'Abandoned', icon: <Flag size={12} md:size={14} />, color: '#6c757d' },
      };

      return (
        <div className={cn(
          "bg-github-card rounded-lg p-3 md:p-4 border border-github-border",
          "transition-all duration-300 hover:border-github-green",
          project.status === 'started' && "border-l-2 md:border-l-4 border-l-github-green"
        )}>
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <h3 className="text-base md:text-lg font-semibold text-github-text">{project.name}</h3>
            <button
              onClick={async () => {
                onEdit(project)
              }}
              className={cn(
                "flex items-center gap-1 px-1 py-1 rounded text-xs",
                {
                  'bg-[#21262d] text-github-text': project.status === 'concept',
                  'bg-[#238636] text-white': project.status === 'started',
                  'bg-[#1f6feb] text-white': project.status === 'completed',
                  'bg-[#6c757d] text-white': project.status === 'abandonded',
                }
              )}
            >
              {statusOptions[project.status]?.icon}
              {statusOptions[project.status]?.label}
            </button>
          </div>
          
          <p className="text-github-text mb-2 md:mb-4 text-sm">{project.description}</p>
          
          <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
            <div className="flex flex-wrap gap-1">
              {project.tags.split(',').map((tag, index) => (
                <button
                  key={index}
                    onClick={() => onTagClick(tag.trim())}
                  className="px-2 py-1 bg-[#21262d] rounded-full text-xs text-github-text border border-github-border"
                >
                  {tag.trim()}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {project.status === 'completed' ? (
                project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-github-blue hover:text-white transition-colors flex items-center gap-1"
                  >
                    Go to project <ArrowUpRight size={12} md:size={14} />
                  </a>
                )
              ) : (
                <span className="text-github-text flex items-center gap-1">
                  <Calendar size={12} md:size={14} />
                  {new Date(project.created_at).toLocaleDateString('en-CA')}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
