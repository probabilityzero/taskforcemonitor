import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getSharedProject, validateShareAccess } from '../lib/projectUtils';
import ProjectDetail from '../components/ProjectDetail';
import { Project } from '../types';
import { Loader2, Shield, ShieldAlert } from 'lucide-react';

export default function SharedProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const shareToken = searchParams.get('secret');
  
  useEffect(() => {
    async function loadSharedProject() {
      try {
        setLoading(true);
        
        if (!projectId || !shareToken) {
          setError('Invalid project link');
          return;
        }
        
        // Validate the share token
        const isValid = await validateShareAccess(projectId, shareToken);
        
        if (!isValid) {
          setError('This shared link is invalid or has expired');
          return;
        }
        
        // Fetch the project details
        const projectData = await getSharedProject(projectId, shareToken);
        setProject(projectData);
      } catch (err: any) {
        console.error('Error loading shared project:', err);
        setError('Unable to load this project. The link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    }
    
    loadSharedProject();
  }, [projectId, shareToken]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-github-bg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-github-text" />
          <p className="mt-4 text-github-text">Loading shared project...</p>
        </div>
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-screen bg-github-bg">
        <div className="bg-github-card border border-github-border rounded-lg p-8 max-w-md w-full text-center">
          <ShieldAlert className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-github-text mb-6">{error || 'Unable to access this project'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-github-fg hover:bg-github-fg/80 text-white rounded-md transition-colors inline-flex items-center gap-2"
          >
            <Shield size={16} /> Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-github-bg min-h-screen">
      <div className="pt-4 pb-8 px-4 max-w-6xl mx-auto">
        <div className="bg-github-card border border-github-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-github-fg border-b border-github-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-green-400" />
              <span className="text-white font-medium">Shared Project View</span>
            </div>
            <span className="text-github-text text-sm">Read-only access</span>
          </div>
          
          <ProjectDetail 
            project={project} 
            isModal={false}
            // Pass no edit/update handlers for read-only access
          />
        </div>
      </div>
    </div>
  );
}