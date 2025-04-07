import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  User, 
  Menu, 
  X, 
  Bell, 
  LogOut,
  ChevronDown,
  Book,
  Settings,
  Github,
  Home
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
}

export function Header({ user, onCreateNew, minimal = false }: HeaderProps) {
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
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              className="text-github-text hover:text-white transition-colors"
              onClick={(e) => {
                stopPropagation(e);
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
              <img 
                src="/assets/logo.svg" 
                alt="Task Force Monitor Logo" 
                className="w-7 h-7" 
              />
              {!minimal && (
                <h1 className="text-lg font-semibold text-github-text hidden md:flex">
                  Task Force <span className="font-thin ml-1.5">Monitor</span>
                </h1>
              )}
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1">
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-colors",
                    location.pathname === '/dashboard'
                      ? "text-white bg-github-active-nav font-medium"
                      : "text-github-text hover:text-white"
                  )}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/projects" 
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-colors",
                    location.pathname === '/projects'
                      ? "text-white bg-github-active-nav font-medium"
                      : "text-github-text hover:text-white"
                  )}
                >
                  Projects
                </Link>
                <Link 
                  to="/tasks" 
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-colors",
                    location.pathname === '/tasks'
                      ? "text-white bg-github-active-nav font-medium"
                      : "text-github-text hover:text-white"
                  )}
                >
                  Tasks
                </Link>
              </>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
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

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-github-header border-b border-github-border overflow-hidden"
            onClick={stopPropagation}
          >
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
                      <Home size={16} />
                      Dashboard
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