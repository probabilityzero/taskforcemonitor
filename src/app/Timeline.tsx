import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { motion } from 'framer-motion';
import { Calendar, GitBranch, GitMerge, CheckCircle, AlertTriangle, Plus, Clock, Edit, Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface TimelineEvent {
  id: string;
  type: 'create' | 'update' | 'start' | 'complete' | 'abandon' | 'archive';
  project_id: string;
  project_name: string;
  created_at: string;
  user_id: string;
  details?: any;
}

function Timeline() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTimeline(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTimeline(session.user);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // In a real application, you would have a separate events table
  // Here we're simulating by reading from the projects table and changes
  const fetchTimeline = async (currentUser = user) => {
    if (!currentUser) return;
    
    setLoading(true);
    
    // Get projects data
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching timeline data:', error);
      setLoading(false);
      return;
    }

    // Create synthetic events from projects
    const timelineEvents: TimelineEvent[] = [];
    
    // Add creation events
    projects?.forEach(project => {
      // Creation event
      timelineEvents.push({
        id: `create-${project.id}`,
        type: 'create',
        project_id: project.id,
        project_name: project.name,
        created_at: project.created_at,
        user_id: project.user_id
      });
      
      // Status events (based on current status)
      if (project.status === 'started') {
        timelineEvents.push({
          id: `start-${project.id}`,
          type: 'start',
          project_id: project.id,
          project_name: project.name,
          // In reality you would store when the status changed
          created_at: new Date(new Date(project.created_at).getTime() + 86400000).toISOString(),
          user_id: project.user_id
        });
      } else if (project.status === 'completed') {
        timelineEvents.push({
          id: `complete-${project.id}`,
          type: 'complete',
          project_id: project.id,
          project_name: project.name,
          created_at: new Date(new Date(project.created_at).getTime() + 86400000 * 2).toISOString(),
          user_id: project.user_id
        });
      } else if (project.status === 'abandonded') {
        timelineEvents.push({
          id: `abandon-${project.id}`,
          type: 'abandon',
          project_id: project.id,
          project_name: project.name,
          created_at: new Date(new Date(project.created_at).getTime() + 86400000 * 3).toISOString(),
          user_id: project.user_id
        });
      }
    });
    
    // Sort events by date (newest first)
    timelineEvents.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    setEvents(timelineEvents);
    setLoading(false);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Plus className="text-green-400" />;
      case 'update':
        return <Edit className="text-blue-400" />;
      case 'start':
        return <GitBranch className="text-purple-400" />;
      case 'complete':
        return <CheckCircle className="text-green-500" />;
      case 'abandon':
        return <AlertTriangle className="text-yellow-500" />;
      case 'archive':
        return <Archive className="text-gray-400" />;
      default:
        return <Clock className="text-gray-400" />;
    }
  };

  const getEventTitle = (event: TimelineEvent) => {
    switch (event.type) {
      case 'create':
        return `Created project "${event.project_name}"`;
      case 'update':
        return `Updated project "${event.project_name}"`;
      case 'start':
        return `Started working on "${event.project_name}"`;
      case 'complete':
        return `Completed project "${event.project_name}"`;
      case 'abandon':
        return `Abandoned project "${event.project_name}"`;
      case 'archive':
        return `Archived project "${event.project_name}"`;
      default:
        return `Action on project "${event.project_name}"`;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'border-green-500/20 bg-green-500/10';
      case 'update':
        return 'border-blue-500/20 bg-blue-500/10';
      case 'start':
        return 'border-purple-500/20 bg-purple-500/10';
      case 'complete':
        return 'border-green-600/20 bg-green-600/10';
      case 'abandon':
        return 'border-yellow-500/20 bg-yellow-500/10';
      case 'archive':
        return 'border-gray-500/20 bg-gray-500/10';
      default:
        return 'border-github-border bg-github-card';
    }
  };

  const filteredEvents = filter 
    ? events.filter(event => event.type === filter)
    : events;

  return (
    <div className="min-h-screen bg-github-bg flex flex-col">
      <Header 
        user={user} 
        minimal={false}
      />
      
      <div className="flex-1">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 md:px-8 py-6 w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Activity Timeline</h1>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter(null)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md border transition-colors",
                  filter === null
                    ? "bg-github-green text-white border-github-green"
                    : "bg-github-card text-github-text border-github-border"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter('create')}
                className={cn(
                  "px-2 py-1 text-xs rounded-md border transition-colors",
                  filter === 'create'
                    ? "bg-github-green text-white border-github-green"
                    : "bg-github-card text-github-text border-github-border"
                )}
              >
                Created
              </button>
              <button
                onClick={() => setFilter('start')}
                className={cn(
                  "px-2 py-1 text-xs rounded-md border transition-colors",
                  filter === 'start'
                    ? "bg-github-green text-white border-github-green"
                    : "bg-github-card text-github-text border-github-border"
                )}
              >
                Started
              </button>
              <button
                onClick={() => setFilter('complete')}
                className={cn(
                  "px-2 py-1 text-xs rounded-md border transition-colors",
                  filter === 'complete'
                    ? "bg-github-green text-white border-github-green"
                    : "bg-github-card text-github-text border-github-border"
                )}
              >
                Completed
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-github-text">Loading timeline...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-github-text mb-4">No activity yet</div>
              <p className="text-github-text opacity-60">
                Your project activity will appear here once you start creating projects.
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-github-text mb-4">No matching activities</div>
              <button
                onClick={() => setFilter(null)}
                className="px-4 py-2 bg-github-card border border-github-border text-github-text hover:text-white rounded-md transition-colors"
              >
                Show all activities
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-github-border"></div>
              
              {/* Events */}
              <div className="space-y-6">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className={cn(
                      "pl-14 relative",
                      getEventColor(event.type)
                    )}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 w-4 h-4 rounded-full bg-github-card border-4 border-github-border transform -translate-x-1/2 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-github-green"></div>
                    </div>
                    
                    <div className="border border-github-border rounded-md overflow-hidden">
                      <div className="p-4 bg-github-card">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-github-bg">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">
                              {getEventTitle(event)}
                            </div>
                            <div className="text-sm text-github-text flex items-center gap-2 mt-1">
                              <Calendar size={12} />
                              <span>{formatDistanceToNow(new Date(event.created_at))} ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Timeline;