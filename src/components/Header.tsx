import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  PlusCircle, 
  User, 
  Menu, 
  X, 
  LogOut,
  ChevronDown,
  Book,
  Settings,
  History,
  LayoutDashboard,
  GitBranch,
  Plus
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { ProfileDropdown } from './ProfileDropdown';
import { AppContext } from '../App';

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const navigate = useNavigate();
  const location = useLocation();
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const { setIsFormOpen } = useContext(AppContext);
  
  // Define navigation items
  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={14} /> },
    { path: '/timeline', label: 'Timeline', icon: <History size={14} /> },
    { path: '/repositories', label: 'Repositories', icon: <GitBranch size={14} /> },
    { path: '/project', label: 'Projects', icon: <Book size={14} /> },
  ];

  // Find current active index
  const activeIndex = navItems.findIndex(item => location.pathname === item.path);

  // Update hover effect
  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = navItemRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  // Update active indicator
  useEffect(() => {
    if (activeIndex >= 0) {
      const activeElement = navItemRefs.current[activeIndex];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [activeIndex, location.pathname]);

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

  const handleCreateNew = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCreateNew) {
      onCreateNew();
    } else {
      setIsFormOpen(true);
    }
  };

  return (
    <header className="bg-github-header border-b border-github-border sticky top-0 z-40">
      {/* Top row - Logo, New button, and Profile */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo section with menu button for mobile */}
          <div className="flex items-center">
            {/* Mobile menu button - moved to the left */}
            <div className="flex md:hidden mr-3">
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
            
            {/* Logo with redesigned text styling */}
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
              <img 
                src="https://raw.githubusercontent.com/probabilityzero/cloudstorage/refs/heads/main/taskforcemonitor.svg"
                alt="Task Force Monitor" 
                className="w-6 h-6" 
              />
              <div className="text-lg hidden xs:flex items-baseline">
                <span className="font-light text-github-text">Task Force</span>
                <span className="font-semibold text-white ml-1.5">Monitor</span>
              </div>
            </Link>
          </div>
          
          {/* Right side buttons - visible on all sizes */}
          <div className="flex items-center gap-2 ml-auto">
            {user && !minimal && (
              <button
                onClick={handleCreateNew}
                className="hidden md:flex items-center gap-1 px-2 py-1 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
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

      {/* Second row - Navigation items for desktop with smooth hover effect */}
      {user && !minimal && (
        <div className="hidden md:block border-t border-github-border bg-github-header-secondary relative">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-start h-10 relative">
              {/* Hover background */}
              <div
                className="absolute h-8 transition-all duration-200 ease-out bg-github-active-nav/20 rounded-md top-1"
                style={{
                  ...hoverStyle,
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
              />

              {/* Active indicator */}
              <div
                className="absolute bottom-0 h-[2px] bg-orange-500 transition-all duration-200 ease-out"
                style={activeStyle}
              />

              {/* Navigation links with fixed width */}
              <div className="flex items-center space-x-1">
                {navItems.map((item, index) => (
                  <Link 
                    key={item.path}
                    ref={(el) => (navItemRefs.current[index] = el)}
                    to={item.path}
                    className={cn(
                      "px-3 py-1 transition-colors flex items-center gap-1.5 h-full relative w-32 justify-center",
                      location.pathname === item.path
                        ? "text-white font-medium"
                        : "text-github-text hover:text-white"
                    )}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
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
                <div className="flex items-baseline">
                  <span className="text-sm font-light text-github-text">Task Force</span>
                  <span className="text-sm font-semibold text-white ml-1">Monitor</span>
                </div>
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
                  {navItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "block px-3 py-2 rounded-md text-base transition-colors",
                        location.pathname === item.path
                          ? "text-white bg-github-active-nav font-medium"
                          : "text-github-text hover:text-white"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        {React.cloneElement(item.icon as React.ReactElement, { size: 16 })}
                        {item.label}
                      </div>
                    </Link>
                  ))}
                  
                  <button
                    onClick={(e) => {
                      handleCreateNew(e);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base text-github-text hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Plus size={16} />
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
                    className="block px-3 py-2 rounded-md text-base text-github-text hover:text-white transition-colors"
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