import React from 'react';
import { Edit2, ExternalLink, PlayCircle } from 'lucide-react';
import type { Project } from '../types';
import { cn } from '../lib/utils';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onToggleStarted: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onToggleStarted }: ProjectCardProps) {
  return (
    <div className={cn(
      "bg-github-card rounded-lg p-6 border border-github-border",
      "transition-all duration-300 hover:border-github-green",
      project.status === 'started' && "border-l-4 border-l-github-green"
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-github-text">{project.name}</h3>
        <div className="flex gap-2">
          {project.status === 'completed' && project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-github-blue hover:text-white transition-colors"
            >
              <ExternalLink size={20} />
            </a>
          )}
          <button
            onClick={() => onToggleStarted(project)}
            className="text-github-text hover:text-github-green transition-colors"
          >
            <PlayCircle size={20} />
          </button>
          <button
            onClick={() => onEdit(project)}
            className="text-github-text hover:text-github-blue transition-colors"
          >
            <Edit2 size={20} />
          </button>
        </div>
      </div>
      
      <p className="text-github-text mb-4">{project.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.split(',').map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-[#21262d] rounded-full text-sm text-github-text border border-github-border"
          >
            {tag.trim()}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className={cn(
          "px-2 py-1 rounded-full border",
          {
            'bg-[#21262d] border-github-border text-github-text': project.status === 'idea',
            'bg-[#238636] border-[#238636] text-white': project.status === 'started',
            'bg-[#1f6feb] border-[#1f6feb] text-white': project.status === 'completed',
            'bg-[#da3633] border-[#da3633] text-white': project.status === 'abandonded',
          }
        )}>
          {project.status}
        </span>
        <span className="text-github-text">{new Date(project.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
