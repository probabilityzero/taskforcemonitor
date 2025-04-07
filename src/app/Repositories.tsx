import { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { ProjectForm } from '../components/ProjectForm';
import { motion } from 'framer-motion';
import { 
  Search, 
  GitBranch, 
  Github, 
  Gitlab, 
  Star, 
  Code, 
  Calendar, 
  Plus, 
  RefreshCw,
  ExternalLink,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import type { Project, ProjectStatus } from '../types';
import { AppContext } from '../App';

interface Repository {
  id: string;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  updated_at: string;
  source: 'github' | 'gitlab';
  owner: string;
  owner_avatar: string;
  fork: boolean;
  topics?: string[];
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  user_id: string;
}

// Helper function to format relative time without date-fns
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Convert to seconds, minutes, hours, days
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Format based on time difference
  if (diffDays > 30) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
}

function Repositories() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [service, setService] = useState<'github' | 'gitlab'>('github');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const { setIsFormOpen: setAppFormOpen } = useContext(AppContext);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Fetch custom categories
    const fetchCustomCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setCustomCategories(data as Category[]);
      }
    };

    fetchCustomCategories();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchGitHubRepositories = async (githubUsername: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const repos: Repository[] = data.map((repo: any) => ({
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description || '',
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language || 'Unknown',
        updated_at: repo.updated_at,
        source: 'github',
        owner: repo.owner.login,
        owner_avatar: repo.owner.avatar_url,
        fork: repo.fork,
        topics: repo.topics || []
      }));
      
      setRepositories(repos);
    } catch (error: any) {
      console.error('Error fetching GitHub repositories:', error);
      setError(`Failed to fetch repositories: ${error.message}`);
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGitLabRepositories = async (gitlabUsername: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://gitlab.com/api/v4/users/${gitlabUsername}/projects?order_by=updated_at&per_page=100`);
      
      if (!response.ok) {
        throw new Error(`GitLab API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const repos: Repository[] = data.map((repo: any) => ({
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description || '',
        url: repo.web_url,
        stars: repo.star_count,
        language: repo.language || 'Unknown',
        updated_at: repo.last_activity_at,
        source: 'gitlab',
        owner: repo.namespace.name,
        owner_avatar: repo.avatar_url || `https://secure.gravatar.com/avatar/${repo.namespace.id}?s=80&d=identicon`,
        fork: repo.forked_from_project !== null,
        topics: repo.topics || []
      }));
      
      setRepositories(repos);
    } catch (error: any) {
      console.error('Error fetching GitLab repositories:', error);
      setError(`Failed to fetch repositories: ${error.message}`);
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (service === 'github') {
      fetchGitHubRepositories(username);
    } else {
      fetchGitLabRepositories(username);
    }
  };

  const handleAddToProjects = (repo: Repository) => {
    setSelectedRepo(repo);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (projectData: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      setSuccessToast(`"${projectData.name}" has been added to your projects`);
      setTimeout(() => setSuccessToast(null), 5000);
      setIsFormOpen(false);
      setSelectedRepo(null);
    } catch (error: any) {
      console.error('Error adding project:', error);
      setError(`Failed to add project: ${error.message}`);
    }
  };

  const filteredRepositories = repositories.filter(repo => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      repo.name.toLowerCase().includes(query) ||
      (repo.description && repo.description.toLowerCase().includes(query)) ||
      repo.language.toLowerCase().includes(query) ||
      (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(query)))
    );
  });

  const prepareProjectData = (repo: Repository): Partial<Project> => {
    return {
      name: repo.name,
      description: repo.description,
      status: 'concept' as ProjectStatus, // Fixed the type issue with correct ProjectStatus value
      categories: '', // Use default category
      tags: repo.topics || [repo.language].filter(Boolean),
      priority: 'medium',
      comments: `Repository imported from ${repo.source}. Original URL: ${repo.url}`,
      link: repo.url // Use the link property instead of links array
    };
  };

  const handleAddCategory = async (category: Category) => {
    setCustomCategories([...customCategories, category]);
  };

  return (
    <div className="min-h-screen bg-github-bg flex flex-col">
      <div className="flex-1">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 md:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Repositories</h1>
            
            <button
              onClick={() => setAppFormOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
          
          {/* Rest of your repositories component */}
        </div>
      </div>

      {isFormOpen && selectedRepo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-github-card border border-github-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <ProjectForm 
              project={undefined}
              initialData={prepareProjectData(selectedRepo)}
              onSubmit={handleFormSubmit}
              onClose={() => { setIsFormOpen(false); setSelectedRepo(null); }}
              customCategories={customCategories}
              onAddCategory={handleAddCategory}
            />
          </div>
        </div>
      )}
      
      <div className="flex-1">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 md:px-8 py-6 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-white">Repositories</h1>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {successToast && (
            <div className="fixed bottom-4 right-4 bg-green-900/90 border border-green-700 text-green-300 px-4 py-3 rounded-md shadow-lg z-50 flex items-center gap-2 max-w-md">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successToast}</span>
            </div>
          )}
          
          {repositories.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-github-text">
                  Found {repositories.length} repositories
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-github-text" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter repositories..."
                    className="pl-9 pr-3 py-1.5 bg-github-fg border border-github-border rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-github-green w-full md:w-64"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRepositories.map((repo) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-github-card border border-github-border rounded-md overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          {repo.source === 'github' ? (
                            <Github className="w-5 h-5 mr-2 text-github-text" />
                          ) : (
                            <Gitlab className="w-5 h-5 mr-2 text-github-text" />
                          )}
                          <h3 className="font-medium text-white truncate">{repo.name}</h3>
                        </div>
                        <div className="flex items-center text-github-text text-sm">
                          <Star className="w-4 h-4 mr-1" />
                          <span>{repo.stars}</span>
                        </div>
                      </div>
                      
                      <p className="text-github-text text-sm mb-3 line-clamp-2">
                        {repo.description || "No description available"}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {repo.language && (
                          <span className="px-2 py-1 text-xs bg-github-fg text-github-text rounded-full flex items-center">
                            <Code className="w-3 h-3 mr-1" />
                            {repo.language}
                          </span>
                        )}
                        
                        {repo.topics && repo.topics.slice(0, 3).map((topic, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-github-fg text-github-text rounded-full">
                            {topic}
                          </span>
                        ))}
                        
                        {repo.topics && repo.topics.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-github-fg text-github-text rounded-full">
                            +{repo.topics.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-github-text text-xs mb-4">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Updated {formatRelativeTime(repo.updated_at)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleAddToProjects(repo)}
                          className="px-3 py-1.5 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add to Projects
                        </button>
                        
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-github-blue hover:underline flex items-center text-sm"
                        >
                          Open <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {repositories.length === 0 && !loading && !error && (
            <div className="text-center py-12 bg-github-card/50 border border-github-border rounded-md">
              <GitBranch className="w-12 h-12 mx-auto text-github-text opacity-30 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No repositories found</h3>
              <p className="text-github-text max-w-md mx-auto mb-6">
                Enter a {service === 'github' ? 'GitHub' : 'GitLab'} username to find public repositories 
                and add them to your projects.
              </p>
              
              <div className="flex justify-center">
                <div className="flex items-center text-github-text bg-github-fg/50 rounded-md px-4 py-2 max-w-md mx-auto">
                  <div className="flex-1 text-left">
                    1. Enter your username
                    <br />
                    2. Find repositories
                    <br />
                    3. Import to your projects
                  </div>
                  <ArrowRight className="w-5 h-5 ml-4 text-github-green" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Repositories;