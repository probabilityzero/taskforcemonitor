import { supabase } from './supabase';
import type { Project, ProjectStatus, ProjectPriority, NoteEntry } from '../types';
import { randomUUID } from 'crypto';

// Re-export NoteEntry so it can be imported from projectUtils
export type { NoteEntry };

/**
 * Get a project by ID
 */
export async function getProject(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
    
  if (error) throw error;
  return data as Project;
}

/**
 * Get a project by ID and share token (for public access)
 */
export async function getSharedProject(projectId: string, shareToken: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('share_token', shareToken)
    .single();
    
  if (error) throw error;
  return data as Project;
}

/**
 * Validate if a share token is valid for a project
 */
export async function validateShareAccess(projectId: string, shareToken: string): Promise<boolean> {
  try {
    const project = await getSharedProject(projectId, shareToken);
    return !!project;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a share link for a project
 */
export async function generateShareLink(projectId: string): Promise<string> {
  // Generate a unique ID and make it shorter (first 10 chars)
  const shareToken = randomUUID().replace(/-/g, '').substring(0, 10);
  
  const { data, error } = await supabase
    .from('projects')
    .update({ share_token: shareToken, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select();
    
  if (error) throw error;
  
  return shareToken;
}

/**
 * Create a new project
 */
export async function createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      ...projectData,
      created_at: new Date().toISOString()
    }])
    .select();
    
  if (error) throw error;
  return data?.[0] as Project;
}

/**
 * Update project details
 */
export async function updateProject(projectId: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .select();
    
  if (error) throw error;
  return data?.[0] as Project;
}

/**
 * Update project status
 */
export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  return updateProject(projectId, { status });
}

/**
 * Update project priority
 */
export async function updateProjectPriority(projectId: string, priority: ProjectPriority) {
  return updateProject(projectId, { priority });
}

/**
 * Update project notes
 * Converts notes array to JSON string for storage
 */
export async function updateProjectNotes(projectId: string, notes: NoteEntry[]) {
  return updateProject(projectId, { 
    comments: JSON.stringify(notes)
  });
}

/**
 * Add a single note to a project
 */
export async function addProjectNote(projectId: string, noteText: string): Promise<Project> {
  // First get current notes
  const project = await getProject(projectId);
  
  // Parse existing notes or create empty array
  const notes = parseProjectNotes(project);
  
  // Add new note
  const newNote: NoteEntry = {
    id: Date.now().toString(),
    text: noteText,
    date: new Date().toISOString()
  };
  
  notes.push(newNote);
  
  // Update project
  return updateProject(projectId, {
    comments: JSON.stringify(notes)
  });
}

/**
 * Delete a note from a project
 */
export async function deleteProjectNote(projectId: string, noteId: string): Promise<Project> {
  // First get current notes
  const project = await getProject(projectId);
  
  // Parse existing notes
  const notes = parseProjectNotes(project);
  
  // Remove the note
  const updatedNotes = notes.filter(note => note.id !== noteId);
  
  // Update project
  return updateProject(projectId, {
    comments: JSON.stringify(updatedNotes)
  });
}

/**
 * Parse project notes from string to array
 */
export function parseProjectNotes(project: Project): NoteEntry[] {
  if (!project.comments) return [];
  
  try {
    const parsed = JSON.parse(project.comments);
    if (Array.isArray(parsed)) {
      return parsed;
    } else {
      // Convert string to single note
      return [{
        id: '1',
        text: project.comments,
        date: project.created_at
      }];
    }
  } catch (e) {
    // If not valid JSON, return as single note
    return [{
      id: '1',
      text: project.comments,
      date: project.created_at
    }];
  }
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
    
  if (error) throw error;
  return data as Project[];
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
    
  if (error) throw error;
  return true;
}