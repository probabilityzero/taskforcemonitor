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
}

export function ProjectCard({ project, onEdit, onToggleStarted, onStatusChange, setToast }: ProjectCardProps) {
  const statusOptions = {
    'idea': { label: 'IDEA', icon: <Lightbulb size={16} />, color: '#c9d1d9' },
    'started': { label: 'STARTED', icon: <PlayCircle size={16} />, color: '#238636' },
    'completed': { label: 'COMPLETED', icon: <CheckCircle size={16} />, color: '#1f6feb' },
    'abandonded': { label: 'ABANDONED', icon: <Flag size={16} />, color: '#da3633' },
  };

  return (
    <div className={cn(
      "bg-github-card rounded-lg p-4 border border-github-border",
      "transition-all duration-300 hover:border-github-green",
      project.status === 'started' && "border-l-4 border-l-github-green"
    )}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-github-text">{project.name}</h3>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => onEdit(project)}
            className="text-github-text hover:text-github-blue transition-colors"
          >
            <Edit2 size={16} />
          </button>
        </div>
      </div>
      
      <p className="text-github-text mb-2 text-sm">{project.description}</p>
      
      <div className="flex flex-wrap gap-1 mb-2">
        {project.tags.split(',').map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-[#21262d] rounded-full text-xs text-github-text border border-github-border"
          >
            {tag.trim()}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          {project.status === 'completed' ? (
            project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-github-blue hover:text-white transition-colors flex items-center gap-1"
              >
                Go to project <ArrowUpRight size={14} />
              </a>
            )
          ) : (
            <span className="text-github-text flex items-center gap-1">
              <Calendar size={14} />
              {new Date(project.created_at).toLocaleDateString('en-CA')}
            </span>
          )}
        </div>
        <button
          onClick={async () => {
            const newStatus = project.status === 'started' ? 'idea' : 'started';
            await onStatusChange({ ...project, status: newStatus });
          }}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full",
            {
              'bg-[#21262d] text-github-text': project.status === 'idea',
              'bg-[#238636] text-white': project.status === 'started',
              'bg-[#1f6feb] text-white': project.status === 'completed',
              'bg-[#da3633] text-white': project.status === 'abandonded',
            }
          )}
        >
          {statusOptions[project.status]?.icon}
          {statusOptions[project.status]?.label}
        </button>
      </div>
    </div>
  );
}
