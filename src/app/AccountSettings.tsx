import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Shield, 
  Bell, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Camera,
  LogOut,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const TabButton = ({ 
  active, 
  icon, 
  children, 
  onClick 
}: { 
  active: boolean; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors w-full text-left",
      active 
        ? "bg-github-active-nav text-white" 
        : "text-github-text hover:text-white"
    )}
  >
    <span className={active ? "text-white" : "text-github-text"}>
      {icon}
    </span>
    <span>{children}</span>
  </button>
);

function AccountSettings() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user);
      } else {
        navigate('/');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user);
      } else {
        navigate('/');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const loadUserData = async (currentUser: any) => {
    setLoading(true);
    try {
      // Get user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" error, which we handle by initializing with default values
        console.error('Error loading profile data:', profileError);
      }

      // Initialize form data from user and profile data
      setEmail(currentUser.email || '');
      setFullName(profileData?.full_name || currentUser.user_metadata?.full_name || '');
      setWebsite(profileData?.website || currentUser.user_metadata?.website || '');
      setBio(profileData?.bio || currentUser.user_metadata?.bio || '');
      setAvatarUrl(profileData?.avatar_url || currentUser.user_metadata?.avatar_url || null);
      
      // Set notification preferences (using defaults or from profile if available)
      setEmailNotifications(profileData?.email_notifications ?? true);
      setProjectUpdates(profileData?.project_updates ?? true);
      setSecurityAlerts(profileData?.security_alerts ?? true);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage({
        text: 'Failed to load user data. Please try refreshing the page.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // First, update auth metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: fullName, website, bio }
      });
      
      if (metadataError) throw metadataError;
      
      // Then update or insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          website,
          bio,
          avatar_url: avatarUrl,
          email_notifications: emailNotifications,
          project_updates: projectUpdates,
          security_alerts: securityAlerts,
          updated_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;
      
      setMessage({
        text: 'Profile updated successfully!',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({
        text: `Error updating profile: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        email
      });
      
      if (error) throw error;
      
      setMessage({
        text: 'Email update initiated. Please check your email to confirm the change.',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error updating email:', error);
      setMessage({
        text: `Error updating email: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    setLoading(true);
    setMessage(null);
    
    if (newPassword !== confirmPassword) {
      setMessage({
        text: 'New passwords do not match.',
        type: 'error'
      });
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setMessage({
        text: 'Password updated successfully!',
        type: 'success'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      setMessage({
        text: `Error updating password: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNotifications = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email_notifications: emailNotifications,
          project_updates: projectUpdates,
          security_alerts: securityAlerts,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setMessage({
        text: 'Notification preferences updated successfully!',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      setMessage({
        text: `Error updating notification preferences: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setMessage({
        text: 'Error signing out. Please try again.',
        type: 'error'
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;
    
    setIsAvatarUploading(true);
    
    try {
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded file
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = data.publicUrl;
      
      // Update the avatar URL in the user's metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
      
      if (updateError) throw updateError;
      
      // Update the avatar URL in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;
      
      setAvatarUrl(avatarUrl);
      setMessage({
        text: 'Avatar updated successfully!',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setMessage({
        text: `Error uploading avatar: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsAvatarUploading(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, you would add a confirmation dialog here
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    
    try {
      // Delete user data from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Delete user projects
      const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', user.id);
      
      if (projectsError) throw projectsError;
      
      // Delete the user account
      // Note: This usually requires admin privileges or a server-side function
      // For now, we'll just sign out
      await supabase.auth.signOut();
      navigate('/');
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setMessage({
        text: `Error deleting account: ${error.message}`,
        type: 'error'
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-github-bg flex flex-col">
      <Header 
        user={user} 
        minimal={true} // Show only the first level of the header
      />
      
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-github-text mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          
          {message && (
            <div className={cn(
              "mb-6 rounded-md px-4 py-3 border",
              message.type === 'success' 
                ? "bg-green-900/20 border-green-700 text-green-300" 
                : "bg-red-900/20 border-red-700 text-red-300"
            )}>
              <div className="flex items-start gap-3">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar with tabs */}
            <div className="md:col-span-1 bg-github-card border border-github-border rounded-md overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-github-avatar-bg mb-3 group">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon size={32} className="text-github-text" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isAvatarUploading}
                        className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                      >
                        {isAvatarUploading ? <RefreshCw className="animate-spin" /> : <Camera size={18} />}
                      </button>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-medium">{fullName || email}</div>
                    <div className="text-github-text text-sm">{email}</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <TabButton 
                    active={activeTab === 'profile'} 
                    icon={<UserIcon size={16} />} 
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'email'} 
                    icon={<Mail size={16} />} 
                    onClick={() => setActiveTab('email')}
                  >
                    Email Settings
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'password'} 
                    icon={<Lock size={16} />} 
                    onClick={() => setActiveTab('password')}
                  >
                    Password
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'notifications'} 
                    icon={<Bell size={16} />} 
                    onClick={() => setActiveTab('notifications')}
                  >
                    Notifications
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'security'} 
                    icon={<Shield size={16} />} 
                    onClick={() => setActiveTab('security')}
                  >
                    Security
                  </TabButton>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="md:col-span-3 bg-github-card border border-github-border rounded-md overflow-hidden">
              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-github-text mb-2" htmlFor="fullName">
                          Full Name
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3 py-2 bg-github-fg border border-github-border rounded-md text-white focus:outline-none focus:ring-1 focus:ring-github-green"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-github-text mb-2" htmlFor="website">
                          Website
                        </label>
                        <input
                          id="website"
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-3 py-2 bg-github-fg border border-github-border rounded-md text-white focus:outline-none focus:ring-1 focus:ring-github-green"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-github-text mb-2" htmlFor="bio">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-github-fg border border-github-border rounded-md text-white focus:outline-none focus:ring-1 focus:ring-github-green"
                        />
                      </div>
                      
                      <div className="pt-4">
                        <button
                          onClick={updateProfile}
                          disabled={loading}
                          className="px-4 py-2 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                          Save Profile
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Email Tab */}
                {activeTab === 'email' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-xl font-semibold text-white mb-6">Email Settings</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-github-text mb-2" htmlFor="email">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-github-fg border border-github-border rounded-md text-white focus:outline-none focus:ring-1 focus:ring-github-green"
                        />
                        <p className="text-github-text text-sm mt-1">
                          We'll send a verification email to confirm your new address.
                        </p>
                      </div>
                      
                      <div className="pt-4">
                        <button
                          onClick={updateEmail}
                          disabled={loading}
                          className="px-4 py-2 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                          Update Email
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Password Tab */}
                {activeTab === 'password' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-github-text mb-2" htmlFor="currentPassword">
                          Current Password
                        </label>
                        <input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-github-fg border border-github-border rounded-md text-white focus:outline-none focus:ring-1 focus:ring-github-green"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-github-text mb-2" htmlFor="newPassword">
                          New Password
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-github-fg border border-github-border rounded-md text-white focus:outline-none focus:ring-1 focus:ring-github-green"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-github-text mb-2" htmlFor="confirmPassword">
                          Confirm New Password
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-github-fg border border-github-border rounded-md text-white focus:outline-none focus:ring-1 focus:ring-github-green"
                        />
                      </div>
                      
                      <div className="pt-4">
                        <button
                          onClick={updatePassword}
                          disabled={loading || !newPassword || newPassword !== confirmPassword}
                          className="px-4 py-2 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                          Update Password
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="emailNotifications"
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="w-4 h-4 bg-github-fg border border-github-border rounded"
                        />
                        <label className="text-white ml-2" htmlFor="emailNotifications">
                          Email Notifications
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="projectUpdates"
                          type="checkbox"
                          checked={projectUpdates}
                          onChange={(e) => setProjectUpdates(e.target.checked)}
                          className="w-4 h-4 bg-github-fg border border-github-border rounded"
                        />
                        <label className="text-white ml-2" htmlFor="projectUpdates">
                          Project Updates
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="securityAlerts"
                          type="checkbox"
                          checked={securityAlerts}
                          onChange={(e) => setSecurityAlerts(e.target.checked)}
                          className="w-4 h-4 bg-github-fg border border-github-border rounded"
                        />
                        <label className="text-white ml-2" htmlFor="securityAlerts">
                          Security Alerts
                        </label>
                      </div>
                      
                      <div className="pt-4">
                        <button
                          onClick={updateNotifications}
                          disabled={loading}
                          className="px-4 py-2 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
                    
                    <div className="space-y-8">
                      <div className="border-b border-github-border pb-6">
                        <h3 className="text-white text-lg mb-2">Sign Out</h3>
                        <p className="text-github-text mb-4">
                          Sign out from all devices and end your current session.
                        </p>
                        <button
                          onClick={handleSignOut}
                          className="px-4 py-2 bg-github-card border border-github-border text-github-text hover:text-white rounded-md transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                      
                      <div>
                        <h3 className="text-red-400 text-lg mb-2">Delete Account</h3>
                        <p className="text-github-text mb-4">
                          Permanently delete your account and all your data. This action cannot be undone.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="px-4 py-2 bg-red-900/30 border border-red-700 text-red-300 hover:bg-red-900/50 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
