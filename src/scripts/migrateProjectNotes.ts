import { supabase } from '../lib/supabase';

// Define the return type to match AdminPage's MigrationResult type
type MigrationResult = {
  total: number;
  migrated: number;
  skipped: number;
  errored: number;
  results: Array<{id: string, status: string, message?: string}>;
};

export async function migrateProjectNotes(): Promise<MigrationResult> {
  console.log('Starting project notes migration...');
  
  // Get all projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*');
    
  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }
  
  if (!projects || projects.length === 0) {
    console.log('No projects found to migrate');
    return { 
      total: 0, 
      migrated: 0, 
      skipped: 0, 
      errored: 0, 
      results: []
    };
  }
  
  console.log(`Found ${projects.length} projects to migrate`);
  let migrated = 0;
  let skipped = 0;
  let errored = 0;
  let results: Array<{id: string, status: string, message?: string}> = [];
  
  // Process each project
  for (const project of projects) {
    try {
      // Skip if no comments or already in JSON format
      if (!project.comments) {
        results.push({ id: project.id, status: 'skipped', message: 'No comments' });
        skipped++;
        continue;
      }
      
      // Check if already in JSON format
      if (isJsonArray(project.comments)) {
        results.push({ id: project.id, status: 'skipped', message: 'Already in JSON format' });
        skipped++;
        continue;
      }
        
      // Convert to JSON array with a single note
      const noteEntry = {
        id: '1',
        text: project.comments,
        date: project.created_at
      };
      
      const jsonNotes = JSON.stringify([noteEntry]);
      
      // Update the project
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          comments: jsonNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);
        
      if (updateError) {
        console.error(`Error updating project ${project.id}:`, updateError);
        results.push({ id: project.id, status: 'error', message: updateError.message });
        errored++;
      } else {
        migrated++;
        console.log(`Migrated project ${project.id}`);
        results.push({ id: project.id, status: 'migrated' });
      }
    } catch (e: any) {
      console.error(`Error processing project ${project.id}:`, e);
      results.push({ id: project.id, status: 'error', message: e.message });
      errored++;
    }
  }
  
  const summary: MigrationResult = {
    total: projects.length,
    migrated,
    skipped,
    errored,
    results
  };
  
  console.log(`Migration complete. Summary:`, summary);
  return summary;
}

// Helper to check if a string is valid JSON array
function isJsonArray(str: string) {
  try {
    const json = JSON.parse(str);
    return Array.isArray(json);
  } catch (e) {
    return false;
  }
}