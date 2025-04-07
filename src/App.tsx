import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState, createContext, useContext } from 'react';
import Auth from './app/Auth';
import TermsOfService from './app/TermsOfService';
import PrivacyPolicy from './app/PrivacyPolicy';
import AccountSettings from './app/AccountSettings';
import HomePage from './app/HomePage';
import WelcomePage from './app/WelcomePage';
import Timeline from './app/Timeline';
import Repositories from './app/Repositories';
import ProjectDetailPage from './app/ProjectDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Header } from './components/Header';
import { supabase } from './lib/supabase';
import { AnimatePresence } from 'framer-motion';

// Create a context for user and app-wide functions
export const AppContext = createContext<{
  user: any;
  createNewProject?: () => void;
  setCreateNewProject?: (callback: () => void) => void;
}>({ user: null });

// Layout component to wrap authenticated pages with persistent header
function Layout() {
  const { user } = useContext(AppContext);
  const [createNewProjectCallback, setCreateNewProjectCallback] = useState<(() => void) | undefined>(undefined);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-github-bg flex flex-col">
      <Header 
        user={user} 
        onCreateNew={createNewProjectCallback}
        minimal={false}
      />
      <div className="flex-1">
        <AppContext.Provider value={{ 
          user, 
          createNewProject: createNewProjectCallback,
          setCreateNewProject: setCreateNewProjectCallback 
        }}>
          <AnimatePresence mode="wait">
            <div key={location.pathname}>
              <Outlet /> {/* Use Outlet instead of children */}
            </div>
          </AnimatePresence>
        </AppContext.Provider>
      </div>
    </div>
  );
}

function AppWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-github-bg flex items-center justify-center">
        <div className="text-github-text">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <AppContext.Provider value={{ user }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <WelcomePage />} />
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
            </Route>
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppContext.Provider>
    </Router>
  );
}

export default AppWrapper;