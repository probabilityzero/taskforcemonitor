import React, { useRef, useEffect } from 'react';
import { 
  User, 
  Cog, 
  LogOut, 
  Grid, 
  Github, 
  Moon, 
  Sun, 
  HelpCircle, 
  Bookmark,
  Bell,
  BellOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ProfileDropdownProps {
  onClose: () => void;
  user: any;
}

export function ProfileDropdown({ onClose, user }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    onClose();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const goToAccountSettings = () => {
    navigate('/account-settings');
    onClose();
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  // Would typically come from a settings context
  const isDarkMode = true; // For demo purposes
  const notificationsEnabled = true; // For demo purposes

  return (
    <motion.div
      ref={dropdownRef}
      className={cn(
        "absolute top-12 right-0 mt-2 w-64 rounded-md shadow-lg z-50",
        "bg-github-card border border-github-border",
        "overflow-hidden"
      )}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with user info */}
      <div className="bg-github-border/20 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-github-avatar-bg">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={userName}
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={20} className="text-white/70" />
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="font-medium text-white truncate">{userName}</div>
            <div className="text-sm text-github-text truncate">{userEmail}</div>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="px-4 py-2 border-b border-github-border/30 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-xs text-github-text">Active</span>
        <button className="ml-auto text-xs text-github-blue hover:text-github-blue/80 transition-colors">
          Set status
        </button>
      </div>

      {/* Main menu items */}
      <div className="py-1">
        <button
          onClick={goToAccountSettings}
          className="flex items-center w-full px-4 py-2 text-sm text-github-text hover:bg-github-border transition-colors"
        >
          <Cog className="w-4 h-4 mr-3 opacity-70" /> 
          <span>Your profile</span>
        </button>
        
        <Link
          to="/bookmarks"
          className="flex items-center w-full px-4 py-2 text-sm text-github-text hover:bg-github-border transition-colors"
        >
          <Bookmark className="w-4 h-4 mr-3 opacity-70" /> 
          <span>Shared Projects</span>
        </Link>
        
      </div>

      {/* Secondary items */}
      <div className="border-t border-github-border/30 py-1">
        <Link
          to="https://github.com/probabilityzero/taskforcemonitor"
          target="_blank"
          className="flex items-center w-full px-4 py-2 text-sm text-github-text hover:bg-github-border transition-colors"
        >
          <Github className="w-4 h-4 mr-3 opacity-70" /> 
          <span>GitHub repo</span>
        </Link>
        
        <Link
          to="https://tarique.me"
          target="_blank"
          className="flex items-center w-full px-4 py-2 text-sm text-github-text hover:bg-github-border transition-colors"
        >
          <Grid className="w-4 h-4 mr-3 opacity-70" /> 
          <span>More Essentials</span>
        </Link>
        
        <Link
          to="/help"
          className="flex items-center w-full px-4 py-2 text-sm text-github-text hover:bg-github-border transition-colors"
        >
          <HelpCircle className="w-4 h-4 mr-3 opacity-70" /> 
          <span>Help & feedback</span>
        </Link>
      </div>

      {/* Sign out button */}
      <div className="border-t border-github-border/30 py-1">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-github-border transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" /> 
          <span>Sign out</span>
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-github-border/30 py-2 px-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-github-text/60">v1.0.3</span>
          <span className="text-xs text-github-blue hover:text-github-blue/80 cursor-pointer">What's new</span>
        </div>
      </div>
    </motion.div>
  );
}
