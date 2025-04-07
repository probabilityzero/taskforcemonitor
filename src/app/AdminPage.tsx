import { useState } from 'react';
import { migrateProjectNotes } from '../scripts/migrateProjectNotes';
import { useContext } from 'react';
import { AppContext } from '../App';
import { Navigate } from 'react-router-dom';

type MigrationResult = {
  total: number;
  migrated: number;
  skipped: number;
  errored: number;
  results: Array<{id: string, status: string, message?: string}>;
};

function AdminPage() {
  const { user } = useContext(AppContext);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [migrationResults, setMigrationResults] = useState<MigrationResult | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  
  // Only allow admin access
  if (!user || !isAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleRunMigration = async () => {
    if (confirm('Are you sure you want to migrate project notes? This operation cannot be undone.')) {
      setIsMigrating(true);
      setMigrationStatus('Migration in progress...');
      setMigrationResults(null);
      
      try {
        const results = await migrateProjectNotes();
        setMigrationResults(results);
        setMigrationStatus(`Migration completed successfully!`);
      } catch (error: any) {
        setMigrationStatus(`Migration failed: ${error.message}`);
      } finally {
        setIsMigrating(false);
      }
    }
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Admin Tools</h1>
      
      <div className="bg-github-card p-6 rounded-md border border-github-border">
        <h2 className="text-xl mb-4 text-white">Data Migrations</h2>
        
        <div className="mb-6">
          <h3 className="text-lg mb-2 text-white">Project Notes Migration</h3>
          <p className="text-github-text mb-4">
            This will convert all existing project notes to the new JSON format.
            Only run this once, as running it multiple times may cause duplication.
          </p>
          
          <button
            onClick={handleRunMigration}
            disabled={isMigrating}
            className="px-4 py-2 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isMigrating ? 'Migrating...' : 'Run Migration'}
          </button>
          
          {migrationStatus && (
            <div className="mt-4 p-3 bg-github-fg rounded-md border border-github-border">
              <div className="text-white mb-2">{migrationStatus}</div>
              
              {migrationResults && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-github-card p-2 rounded border border-github-border">
                      <span className="text-github-text">Total projects:</span> <span className="text-white">{migrationResults.total}</span>
                    </div>
                    <div className="bg-github-card p-2 rounded border border-github-border">
                      <span className="text-github-text">Migrated:</span> <span className="text-green-400">{migrationResults.migrated}</span>
                    </div>
                    <div className="bg-github-card p-2 rounded border border-github-border">
                      <span className="text-github-text">Skipped:</span> <span className="text-yellow-400">{migrationResults.skipped}</span>
                    </div>
                    <div className="bg-github-card p-2 rounded border border-github-border">
                      <span className="text-github-text">Errors:</span> <span className="text-red-400">{migrationResults.errored}</span>
                    </div>
                  </div>
                  
                  {/* Detailed results */}
                  {migrationResults.results.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white text-sm mb-2">Detailed Results:</h4>
                      <div className="max-h-60 overflow-y-auto border border-github-border rounded">
                        <table className="w-full text-sm">
                          <thead className="bg-github-fg border-b border-github-border">
                            <tr>
                              <th className="text-left p-2 text-github-text">Project ID</th>
                              <th className="text-left p-2 text-github-text">Status</th>
                              <th className="text-left p-2 text-github-text">Message</th>
                            </tr>
                          </thead>
                          <tbody>
                            {migrationResults.results.map((result, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-github-card' : 'bg-github-card/50'}>
                                <td className="p-2 text-white">{result.id}</td>
                                <td className="p-2">
                                  <span className={
                                    result.status === 'migrated' ? 'text-green-400' :
                                    result.status === 'skipped' ? 'text-yellow-400' :
                                    'text-red-400'
                                  }>
                                    {result.status}
                                  </span>
                                </td>
                                <td className="p-2 text-github-text">{result.message || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-github-card p-6 rounded-md border border-github-border mt-6">
        <h2 className="text-xl mb-4 text-white">Database Schema</h2>
        
        <div className="mb-6">
          <h3 className="text-lg mb-2 text-white">Run SQL Migration</h3>
          <p className="text-github-text mb-4">
            Run the necessary SQL to update your database schema to support the new project structure.
          </p>
          
          <div className="bg-github-fg p-3 rounded-md border border-github-border mb-4 overflow-x-auto">
            <pre className="text-sm text-github-text whitespace-pre-wrap">
{`-- First, add updated_at column if it doesn't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Add trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to the projects table
DROP TRIGGER IF EXISTS set_updated_at ON public.projects;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Initialize updated_at for existing records to created_at
UPDATE public.projects
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Ensure the comments column can handle JSON data
ALTER TABLE public.projects 
ALTER COLUMN comments TYPE TEXT;

-- Set default value for priority if needed
ALTER TABLE public.projects
ALTER COLUMN priority SET DEFAULT 'medium';`}
            </pre>
          </div>
          
          <p className="text-github-text mb-4">
            Copy this SQL and run it in your Supabase SQL Editor.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to check if a user is an admin
function isAdmin(user: any) {
  // Replace with your admin check logic
  // For example, check email domains or specific user IDs
  const adminEmails = ['admin@yourdomain.com'];
  return user && adminEmails.includes(user.email);
}

export default AdminPage;