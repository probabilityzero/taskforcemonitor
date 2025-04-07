import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState, createContext, useContext } from 'react';
import TermsOfService from './app/TermsOfService';
import PrivacyPolicy from './app/PrivacyPolicy';
import AccountSettings from './app/AccountSettings';
import HomePage from './app/HomePage';
import Timeline from './app/Timeline';
import Repositories from './app/Repositories';
import ProjectDetailPage from './app/ProjectDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Header } from './components/Header';
import { supabase } from './lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import AdminPage from './app/AdminPage';
import { ProjectForm } from './components/ProjectForm';
import Auth from './app/Auth'; 

export const AppContext = createContext<{
  user: any | null;
  setUser: (user: any | null) => void;
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  refreshProjects?: () => void;
  setRefreshProjects?: (callback: (() => void) | undefined) => void;
}>({
  user: null,
  setUser: () => {},
  isFormOpen: false,
  setIsFormOpen: () => {},
  refreshProjects: undefined,
  setRefreshProjects: undefined
});

// Layout component to wrap authenticated pages with persistent header
function Layout() {
  const { user, setIsFormOpen } = useContext(AppContext);
  // We don't need a separate callback for createNewProject since we use global state
  const location = useLocation();

  const handleCreateNew = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-github-bg flex flex-col">
      <Header 
        user={user} 
        onCreateNew={handleCreateNew}
        minimal={false}
      />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            <Outlet /> {/* Use Outlet instead of children */}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Create a wrapper for the app that handles router
function AppWrapper() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Separate the content to avoid router context issues
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [refreshProjectsCallback, setRefreshProjectsCallback] = useState<(() => void) | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Get saved categories from localStorage
    const savedCategories = localStorage.getItem('projectCategories');
    if (savedCategories) {
      setCustomCategories(JSON.parse(savedCategories));
    }

    // Check for user on initial load
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleAddCategory = (category: any) => {
    const updatedCategories = [...customCategories, category];
    setCustomCategories(updatedCategories);
    localStorage.setItem('projectCategories', JSON.stringify(updatedCategories));
  };

  const handleProjectSubmit = async (data: any) => {
    try {
      const { error } = await supabase.from('projects').insert([
        {
          ...data,
          user_id: user.id,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      setIsFormOpen(false);
      setToast('Project created successfully!');
      
      // Refresh projects list if callback exists
      if (refreshProjectsCallback) {
        refreshProjectsCallback();
      }
    } catch (error: any) {
      console.error('Error creating project:', error.message);
      setToast(`Error creating project: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-github-bg flex items-center justify-center">
        <div className="text-github-text">Loading...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ 
      user, 
      setUser, 
      isFormOpen, 
      setIsFormOpen,
      refreshProjects: refreshProjectsCallback,
      setRefreshProjects: setRefreshProjectsCallback
    }}>
      <div className="min-h-screen bg-github-bg">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          
          {/* Protected routes with persistent header */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/repositories" element={<Repositories />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/project/:projectId" element={<ProjectDetailPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route> 
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global project form modal */}
        <AnimatePresence onExitComplete={() => {
          // Ensure cleanup after animation completes
          document.body.style.overflow = '';
        }}>
          {isFormOpen && (
            <motion.div
              key="project-form"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ProjectForm
                customCategories={customCategories}
                onSubmit={handleProjectSubmit}
                onClose={() => {
                  setIsFormOpen(false);
                  document.body.style.overflow = '';
                }}
                onAddCategory={handleAddCategory}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Toast notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className="fixed bottom-4 right-4 bg-github-card p-4 rounded-md border border-github-border text-white z-50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onAnimationComplete={() => {
                const timer = setTimeout(() => {
                  setToast(null);
                }, 3000);
                return () => clearTimeout(timer);
              }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}

export default AppWrapper;