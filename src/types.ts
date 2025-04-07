export type ProjectStatus = 'concept' | 'started' | 'completed' | 'abandonded';
export type ProjectPriority = 'low' | 'medium' | 'high';

export type ProjectCategory = string;

export interface Project {
  id: string;
  name: string;
  description?: string;
  categories?: string;
  link?: string;
  status: ProjectStatus;
  tags: string[] | string;
  priority: ProjectPriority;
  comments?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  share_token?: string; // Added for project sharing functionality
}

export interface NoteEntry {
  id: string;
  text: string;
  date: string;
}

export interface CategoryDisplay {
  id: string;
  label: string;
  icon: keyof typeof import('lucide-react');
  color: string;
}
