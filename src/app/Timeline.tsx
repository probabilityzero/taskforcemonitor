import { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  GitBranch, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Clock, 
  Edit, 
  Archive,
  MessageSquare,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppContext } from '../App';
import { parseProjectNotes } from '../lib/projectUtils';
import { Project, NoteEntry } from '../types';
import { Skeleton, TimelineEventSkeleton } from '../components/Skeleton';

interface TimelineEvent {
  id: string;
  type: 'create' | 'update' | 'start' | 'complete' | 'abandon' | 'archive' | 'note' | 'link';
  project_id: string;
  project_name: string;
  created_at: string;
  user_id: string;
  details?: any;
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

// Function to format date without date-fns
function formatDateTime(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  // Add leading zero to minutes if needed
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${month} ${day}, ${year} ${hours}:${minutesStr} ${ampm}`;
}

function Timeline() {
  // Access the full context once at component level
  const { user, setIsFormOpen: setGlobalFormOpen, setRefreshProjects } = useContext(AppContext);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  
  // Use the context values safely in useEffect
  useEffect(() => {
    // Now using setRefreshProjects from the component scope
    if (setRefreshProjects) {
      setRefreshProjects(() => fetchTimeline);
    }
    
    return () => {
      if (setRefreshProjects) {
        setRefreshProjects(undefined);
      }
    };
  }, [setRefreshProjects]); // Add setRefreshProjects to the dependency array

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchTimeline(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchTimeline(session.user);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

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
    
    // Process each project
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
      
      // Add note events
      if (project.comments) {
        try {
          // Parse notes
          const notes = parseProjectNotes(project as Project);
          
          // Add each note as an event
          notes.forEach((note: NoteEntry) => {
            timelineEvents.push({
              id: `note-${project.id}-${note.id}`,
              type: 'note',
              project_id: project.id,
              project_name: project.name,
              created_at: note.date,
              user_id: project.user_id,
              details: { text: note.text }
            });
          });
        } catch (e) {
          console.error('Error parsing notes:', e);
        }
      }
      
      // Link added event
      if (project.link) {
        // In a real app, you would track when the link was added
        // Here we're just using a synthetic event time based on created_at
        const linkTime = new Date(new Date(project.created_at).getTime() + 3600000).toISOString();
        
        timelineEvents.push({
          id: `link-${project.id}`,
          type: 'link',
          project_id: project.id,
          project_name: project.name,
          created_at: project.updated_at || linkTime,
          user_id: project.user_id,
          details: { url: project.link }
        });
      }
      
      // Status events (based on current status)
      if (project.status === 'started') {
        timelineEvents.push({
          id: `start-${project.id}`,
          type: 'start',
          project_id: project.id,
          project_name: project.name,
          // In reality you would store when the status changed
          created_at: project.updated_at || 
            new Date(new Date(project.created_at).getTime() + 86400000).toISOString(),
          user_id: project.user_id
        });
      } else if (project.status === 'completed') {
        timelineEvents.push({
          id: `complete-${project.id}`,
          type: 'complete',
          project_id: project.id,
          project_name: project.name,
          created_at: project.updated_at || 
            new Date(new Date(project.created_at).getTime() + 86400000 * 2).toISOString(),
          user_id: project.user_id
        });
      } else if (project.status === 'abandonded') {
        timelineEvents.push({
          id: `abandon-${project.id}`,
          type: 'abandon',
          project_id: project.id,
          project_name: project.name,
          created_at: project.updated_at || 
            new Date(new Date(project.created_at).getTime() + 86400000 * 3).toISOString(),
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
      case 'note':
        return <MessageSquare className="text-blue-400" />;
      case 'link':
        return <LinkIcon className="text-blue-500" />;
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
      case 'note':
        return `Added note to "${event.project_name}"`;
      case 'link':
        return `Added repository link to "${event.project_name}"`;
      default:
        return `Action on project "${event.project_name}"`;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'border-green-500/20';
      case 'update':
        return 'border-blue-500/20';
      case 'start':
        return 'border-purple-500/20';
      case 'complete':
        return 'border-green-600/20';
      case 'abandon':
        return 'border-yellow-500/20';
      case 'archive':
        return 'border-gray-500/20';
      case 'note':
        return 'border-blue-500/20';
      case 'link':
        return 'border-blue-500/20';
      default:
        return 'border-github-border';
    }
  };

  const filteredEvents = filter 
    ? events.filter(event => event.type === filter)
    : events;

  const handleOpenProjectForm = () => {
    if (setGlobalFormOpen) {
      setGlobalFormOpen(true);
    }
  };

  return (
    <div className="flex-1">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Activity Timeline</h1>
          
          <button
            onClick={handleOpenProjectForm}
            className="flex items-center gap-1 px-3 py-1.5 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
        
        {/* Only show the real filter buttons when not loading */}
        {!loading && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter(null)}
              className={cn(
                "px-3 py-1 text-xs rounded-full border transition-colors",
                !filter 
                  ? "bg-github-tag text-white border-github-tag" 
                  : "bg-transparent text-github-text border-github-border hover:border-github-border-hover"
              )}
            >
              All
            </button>
            
            {['create', 'note', 'link', 'start', 'complete', 'abandon'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full border transition-colors flex items-center gap-1",
                  filter === type 
                    ? "bg-github-tag text-white border-github-tag" 
                    : "bg-transparent text-github-text border-github-border hover:border-github-border-hover"
                )}
              >
                {getEventIcon(type)}
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </button>
            ))}
          </div>
        )}
        
        {loading ? (
          <div>
            {/* Skeleton for filter buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Skeleton width={60} height={26} rounded="rounded-full" />
              <Skeleton width={80} height={26} rounded="rounded-full" />
              <Skeleton width={70} height={26} rounded="rounded-full" />
              <Skeleton width={90} height={26} rounded="rounded-full" />
              <Skeleton width={85} height={26} rounded="rounded-full" />
            </div>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-github-border"></div>
              
              {/* Skeleton events with shimmer effect */}
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <TimelineEventSkeleton />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
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
                          
                          {/* For note events, show the note content */}
                          {event.type === 'note' && event.details?.text && (
                            <div className="mt-2 p-3 bg-github-bg rounded border border-github-border text-github-text text-sm">
                              {event.details.text}
                            </div>
                          )}
                          
                          {/* For link events, show the link */}
                          {event.type === 'link' && event.details?.url && (
                            <div className="mt-2 flex items-center gap-2">
                              <a 
                                href={event.details.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-github-blue hover:underline text-sm flex items-center gap-1"
                              >
                                <LinkIcon size={12} />
                                {event.details.url}
                              </a>
                            </div>
                          )}
                          
                          <div className="text-sm text-github-text flex items-center gap-2 mt-2">
                            <Calendar size={12} />
                            <span>{formatRelativeTime(event.created_at)}</span>
                            <span className="text-github-text/50">
                              {formatDateTime(new Date(event.created_at))}
                            </span>
                          </div>
                          
                          <div className="mt-2">
                            <a 
                              href={`/project/${event.project_id}`} 
                              className="text-github-blue hover:underline text-xs"
                            >
                              View project
                            </a>
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
  );
}

export default Timeline;