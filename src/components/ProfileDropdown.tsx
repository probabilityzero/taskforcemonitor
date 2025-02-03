import React, { useRef, useEffect } from 'react';
import { User, Cog, LogOut, Grid } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ProfileDropdownProps {
  onClose: () => void;
  user: any;
}

export function ProfileDropdown({ onClose, user }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    onClose();
  };

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, onClose]);

  const goToAccountSettings = () => {
    navigate('/account-settings');
    onClose();
  };

  return (
    <motion.div
      ref={dropdownRef}
      className="absolute top-12 right-0 mt-2 w-56 rounded-md shadow-lg bg-github-card border border-github-border z-50" // Glass morphism removed from here
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-2">
        <div className="px-4 py-2">
          <User className="inline-block w-6 h-6 mr-2 align-middle opacity-70" />
          <span className="font-semibold text-github-text align-middle">{user?.user_metadata?.full_name || user?.email}</span>
          <p className="text-sm text-github-text opacity-50">{user?.email}</p>
        </div>
        <hr className="border-github-border opacity-50 my-2" />
        <button
          onClick={goToAccountSettings}
          className="block px-4 py-2 text-sm text-github-text hover:bg-github-border w-full text-left"
        >
          <Cog className="inline-block w-4 h-4 mr-2" /> Account Settings
        </button>
        <button
          onClick={() => { onClose(); alert('More Apps page coming soon!'); }}
          className="block px-4 py-2 text-sm text-github-text hover:bg-github-border w-full text-left"
        >
          <Grid className="inline-block w-4 h-4 mr-2" /> Bastille Apps
        </button>
        <hr className="border-github-border opacity-50 my-2" />
        <button
          onClick={handleSignOut}
          className="block px-4 py-2 text-sm text-red-500 hover:bg-github-border w-full text-left"
        >
          <LogOut className="inline-block w-4 h-4 mr-2" /> Log Out
        </button>
      </div>
    </motion.div>
  );
}
