export type ProjectStatus = 'concept' | 'started' | 'completed' | 'abandonded';

export type ProjectCategory = 'research' | 'analysis' | 'engineering' | 'miscellaneous';

export interface Project {
  id: string;
  name: string;
  description: string;
  categories: ProjectCategory;
  link: string;
  status: ProjectStatus;
  tags: string;
  comments: string;
  created_at: string;
  user_id: string;
}
