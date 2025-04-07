export type ProjectStatus = 'concept' | 'started' | 'completed' | 'abandonded';

// No longer limited to predefined categories
export type ProjectCategory = string;

export interface Project {
  id: string;
  name: string;
  description: string;
  categories: ProjectCategory; // Keeps the same field name
  link: string;
  status: ProjectStatus;
  tags: string;
  comments: string;
  created_at: string;
  user_id: string;
}

// New interface for category display data
export interface CategoryDisplay {
  id: string;
  label: string;
  icon: keyof typeof import('lucide-react');
  color: string;
}
