import { supabase } from './supabase';
import type { Project, ProjectStatus, ProjectPriority, NoteEntry } from '../types';

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
  let notes: NoteEntry[] = [];
  if (project.comments) {
    try {
      notes = JSON.parse(project.comments);
      if (!Array.isArray(notes)) {
        notes = [{
          id: '1',
          text: project.comments,
          date: project.created_at
        }];
      }
    } catch (e) {
      // If not valid JSON, create a single note entry
      notes = [{
        id: '1',
        text: project.comments,
        date: project.created_at
      }];
    }
  }
  
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
  let notes: NoteEntry[] = [];
  if (project.comments) {
    try {
      notes = JSON.parse(project.comments);
      if (!Array.isArray(notes)) {
        notes = [{
          id: '1',
          text: project.comments,
          date: project.created_at
        }];
      }
    } catch (e) {
      // If not valid JSON, create a single note entry
      notes = [{
        id: '1',
        text: project.comments,
        date: project.created_at
      }];
    }
  }
  
  // Remove the note
  notes = notes.filter(note => note.id !== noteId);
  
  // Update project
  return updateProject(projectId, {
    comments: JSON.stringify(notes)
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