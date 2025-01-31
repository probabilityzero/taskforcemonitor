export type ProjectStatus = 'idea' | 'started' | 'completed' | 'abandonded';
export type ProjectCategory = 'research' | 'analysis' | 'engineering' | 'miscellaneous';

export interface Project {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  categories: ProjectCategory;
  link: string | null;
  status: ProjectStatus;
  tags: string;
  comments: string | null;
}