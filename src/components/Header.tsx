import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  User, 
  Menu, 
  X, 
  LogOut,
  ChevronDown,
  Book,
  Settings,
  Home,
  Archive,
  History,
  LayoutDashboard
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { ProfileDropdown } from './ProfileDropdown';

interface HeaderProps {
  user: any;
  onCreateNew?: () => void;
  minimal?: boolean;
  showArchive?: boolean;
  onToggleArchive?: () => void;
}

export function Header({ 
  user, 
  onCreateNew, 
  minimal = false,
  showArchive = false,
  onToggleArchive
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
      setIsProfileDropdownOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <header className="bg-github-header border-b border-github-border sticky top-0 z-40">
      {/* Top row - Logo, New button, and Profile */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo - Positioned to the left and improved sizing */}
          <div className="flex items-center flex-shrink-0">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
              <img 
                src="https://raw.githubusercontent.com/probabilityzero/cloudstorage/refs/heads/main/taskforcemonitor.svg"
                alt="Task Force Monitor" 
                className="w-6 h-6" 
              />
              <h1 className="text-lg font-semibold text-github-text hidden xs:block">
                Task Force <span className="font-thin ml-1.5">Monitor</span>
              </h1>
            </Link>
          </div>
          
          {/* Mobile menu button - moved to the right */}
          <div className="flex md:hidden ml-auto">
            <button
              className="text-github-text hover:text-white transition-colors ml-2"
              onClick={(e) => {
                stopPropagation(e);
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Right side buttons - visible on all sizes */}
          <div className="flex items-center gap-2 ml-2 md:ml-0">
            {user && !minimal && (
              <button
                onClick={(e) => {
                  stopPropagation(e);
                  if (onCreateNew) onCreateNew();
                }}
                className="hidden md:flex items-center gap-1 px-2 py-1 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New</span>
              </button>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    stopPropagation(e);
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  }}
                  className="flex items-center gap-1 text-github-text hover:text-white transition-colors p-1 rounded-full"
                >
                  <div className="w-6 h-6 bg-github-avatar-bg text-white rounded-full flex items-center justify-center overflow-hidden">
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                  <ChevronDown size={14} className="hidden md:block" />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <ProfileDropdown onClose={() => setIsProfileDropdownOpen(false)} user={user} />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-3 py-1 text-sm text-github-text hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  className="px-3 py-1 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second row - Navigation items for desktop with orange underline for active items */}
      {user && !minimal && (
        <div className="hidden md:block border-t border-github-border bg-github-header-secondary">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10">
              {/* Navigation links with icons and orange underline */}
              <div className="flex items-center space-x-1">
                <Link 
                  to="/dashboard" 
                  className={cn(
                    "px-3 py-1 text-sm transition-colors flex items-center gap-1.5 h-full relative",
                    location.pathname === '/dashboard'
                      ? "text-white font-medium"
                      : "text-github-text hover:text-white"
                  )}
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                  {location.pathname === '/dashboard' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500"></div>
                  )}
                </Link>
                
                <Link 
                  to="/timeline" 
                  className={cn(
                    "px-3 py-1 text-sm transition-colors flex items-center gap-1.5 h-full relative",
                    location.pathname === '/timeline'
                      ? "text-white font-medium"
                      : "text-github-text hover:text-white"
                  )}
                >
                  <History size={14} />
                  <span>Timeline</span>
                  {location.pathname === '/timeline' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500"></div>
                  )}
                </Link>
                
                <Link 
                  to="/projects" 
                  className={cn(
                    "px-3 py-1 text-sm transition-colors flex items-center gap-1.5 h-full relative",
                    location.pathname === '/projects'
                      ? "text-white font-medium"
                      : "text-github-text hover:text-white"
                  )}
                >
                  <Book size={14} />
                  <span>Projects</span>
                  {location.pathname === '/projects' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500"></div>
                  )}
                </Link>
              </div>

              {/* Page title area - can be used to show current page name */}
              <div className="text-sm text-github-text font-medium">
                {location.pathname === '/dashboard' && 'Home Dashboard'}
                {location.pathname === '/timeline' && 'Activity Timeline'}
                {location.pathname === '/projects' && 'All Projects'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-y-0 left-0 md:hidden bg-github-header z-50 w-64 border-r border-github-border overflow-y-auto"
            onClick={stopPropagation}
          >
            {/* Mobile menu header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-github-border">
              <div className="flex items-center">
                <img 
                  src="https://raw.githubusercontent.com/probabilityzero/cloudstorage/refs/heads/main/taskforcemonitor.svg"
                  alt="Task Force Monitor" 
                  className="w-6 h-6 mr-2" 
                />
                <h1 className="text-sm font-semibold text-github-text">
                  Task Force <span className="font-thin">Monitor</span>
                </h1>
              </div>
              <button
                className="text-github-text hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile menu content */}
            <div className="px-4 py-3 space-y-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base transition-colors",
                      location.pathname === '/dashboard'
                        ? "text-white bg-github-active-nav font-medium"
                        : "text-github-text hover:text-white"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard size={16} />
                      Dashboard
                    </div>
                  </Link>
                  
                  <Link
                    to="/timeline"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base transition-colors",
                      location.pathname === '/timeline'
                        ? "text-white bg-github-active-nav font-medium"
                        : "text-github-text hover:text-white"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <History size={16} />
                      Timeline
                    </div>
                  </Link>
                  
                  <Link
                    to="/projects"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base transition-colors",
                      location.pathname === '/projects'
                        ? "text-white bg-github-active-nav font-medium"
                        : "text-github-text hover:text-white"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Book size={16} />
                      Projects
                    </div>
                  </Link>
                  
                  <button
                    onClick={() => {
                      if (onCreateNew) onCreateNew();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base text-github-text hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <PlusCircle size={16} />
                      New Project
                    </div>
                  </button>
                  
                  <Link
                    to="/account-settings"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base transition-colors",
                      location.pathname === '/account-settings'
                        ? "text-white bg-github-active-nav font-medium"
                        : "text-github-text hover:text-white"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Settings size={16} />
                      Settings
                    </div>
                  </Link>
                  
                  {/* Divider */}
                  <div className="border-t border-github-border my-2"></div>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base text-github-text hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut size={16} />
                      Sign out
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="block px-3 py-2 rounded-md text-base text-github-text hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    className="block px-3 py-2 rounded-md text-base text-github-green hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}