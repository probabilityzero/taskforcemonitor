import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  PlayCircle, 
  Target, 
  Lightbulb,
  Zap,
  GitBranchPlus,
  ChevronRight,
  LogIn
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AuthForm } from '../components/AuthForm';
import { Footer } from '../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const features = [
  {
    title: "Track Ideas",
    description: "Capture and organize all your project ideas in one place.",
    icon: <Lightbulb className="text-amber-400" />
  },
  {
    title: "Manage Progress",
    description: "Monitor the status of all your ongoing projects.",
    icon: <PlayCircle className="text-green-400" />
  },
  {
    title: "Achieve Goals",
    description: "Set clear targets and mark them as completed.",
    icon: <Target className="text-blue-400" />
  },
  {
    title: "Show Results",
    description: "Showcase your completed projects with pride.",
    icon: <CheckCircle2 className="text-purple-400" />
  }
];

export default function WelcomePage() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const playerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for auth mode in URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const mode = query.get('auth');
    
    if (mode === 'login') {
      setAuthMode('login');
      setShowAuthForm(true);
    } else if (mode === 'join') {
      setAuthMode('signup');
      setShowAuthForm(true);
    }
  }, [location]);

  // Load video background
  useEffect(() => {
    // Only load on larger screens and when video isn't disabled by user preference
    if (window.innerWidth < 768 || localStorage.getItem('disableVideoBg') === 'true') {
      return;
    }

    // Simple fallback video approach instead of YouTube API
    const videoElement = document.createElement('video');
    videoElement.muted = true;
    videoElement.loop = true;
    videoElement.playsInline = true;
    videoElement.autoplay = true;
    videoElement.className = 'absolute inset-0 w-full h-full object-cover scale-[1.2] transform-gpu';
    
    // You can host your background video on a CDN or use a stock video
    videoElement.src = 'https://cdn.taskforcemonitor.com/bg-video.mp4'; // Replace with your actual video URL
    
    videoElement.onloadeddata = () => {
      if (playerRef.current) {
        playerRef.current.innerHTML = '';
        playerRef.current.appendChild(videoElement);
        setVideoLoaded(true);
      }
    };
    
    videoElement.onerror = () => {
      // Fallback to a static gradient background if video fails to load
      setVideoLoaded(true);
    };
    
    if (playerRef.current) {
      playerRef.current.appendChild(videoElement);
    }
    
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
      }
    };
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
      }
    };
    
    checkUser();
  }, []);

  const onAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-github-bg overflow-hidden">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://raw.githubusercontent.com/probabilityzero/cloudstorage/refs/heads/main/taskforcemonitor.svg"
              alt="Task Force Monitor" 
              className="w-8 h-8 mr-2" 
            />
            <h1 className="text-xl font-bold text-github-text">Task Force <span className="font-thin">Monitor</span></h1>
          </div>
          
          {!user && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthForm(true);
                }}
                className="px-3 py-1.5 text-sm text-github-text hover:text-white transition-colors"
              >
                Sign in
              </button>
              <button 
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthForm(true);
                }}
                className="px-3 py-1.5 text-sm bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors"
              >
                Sign up
              </button>
            </div>
          )}
          
          {user && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 text-sm flex items-center gap-1.5 bg-github-card text-github-text border border-github-border hover:text-white rounded-md transition-colors"
            >
              <LogIn size={16} />
              Dashboard
            </button>
          )}
        </div>
      </header>

      {/* Video Background with fallback gradient */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Static gradient background that's always visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-github-bg to-blue-900"></div>
        
        {/* Video overlay */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        
        {/* Video container */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full transition-opacity duration-1000", 
            videoLoaded ? "opacity-100" : "opacity-0"
          )}
        >
          <div 
            ref={playerRef}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAuthForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-github-card border border-github-border rounded-lg shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex justify-center">
                <img 
                  src="https://raw.githubusercontent.com/probabilityzero/cloudstorage/refs/heads/main/taskforcemonitor.svg" 
                  alt="Task Force Monitor" 
                  className="w-10 h-10"
                />
              </div>
              
              <AuthForm 
                initialMode={authMode} 
                onSuccess={onAuthSuccess}
                onClose={() => setShowAuthForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <main className="relative z-[1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          {/* Updated hero layout */}
          <div className="w-full lg:w-1/2 mx-auto">
            {/* Hero content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Organize and track all your projects <span className="text-github-green">effortlessly</span>
              </h1>
              
              <p className="text-xl text-github-text mb-8">
                Task Force Monitor helps you keep track of all your ideas, ongoing work, and completed projects in one beautiful dashboard.
              </p>
              
              {!user ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthForm(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-lg"
                  >
                    Get Started <ArrowRight />
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthForm(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-github-card border border-github-border text-github-text hover:text-white rounded-md transition-colors text-lg"
                  >
                    Sign In <LogIn size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-6 py-3 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-lg"
                >
                  Go to Dashboard <ArrowRight />
                </button>
              )}
            </motion.div>

            {/* Features grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-github-card/80 backdrop-blur-sm p-5 rounded-lg border border-github-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                >
                  <div className="text-2xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
                  <p className="text-github-text">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Visual gradient separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-github-border to-transparent my-20"></div>

        {/* How it works section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          {/* Background for this section */}
          <div className="absolute inset-0 backdrop-blur-md"></div>
          
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How Task Force Monitor Works</h2>
              <p className="text-xl text-github-text max-w-3xl mx-auto">
                Our powerful but simple workflow helps you manage all your projects efficiently
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Your existing workflow steps */}
              {[
                {
                  icon: <Lightbulb size={32} />,
                  title: "Capture Ideas",
                  description: "Save all your project ideas before they fade away. Categorize and tag them for easy reference."
                },
                {
                  icon: <GitBranchPlus size={32} />,
                  title: "Track Progress",
                  description: "Move projects from concept to completion. Never lose track of what you're working on."
                },
                {
                  icon: <Zap size={32} />,
                  title: "Boost Productivity",
                  description: "Focus on what matters. Prioritize your projects and complete more of them."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="bg-github-card/80 backdrop-blur-sm border border-github-border rounded-lg p-6 flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                >
                  <div className="bg-github-border/40 p-4 rounded-full mb-5 text-github-green">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">{step.title}</h3>
                  <p className="text-github-text">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="absolute inset-0 backdrop-blur-md"></div>
          
          <motion.div
            className="bg-github-card/80 backdrop-blur-sm border border-github-border rounded-lg p-8 md:p-12 text-center relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to organize your projects?
            </h2>
            <p className="text-xl text-github-text mb-8 max-w-3xl mx-auto">
              Join thousands of developers and creators who use Task Force Monitor to keep track of their work.
            </p>
            
            {!user ? (
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthForm(true);
                  }}
                  className="flex items-center gap-2 px-8 py-4 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-lg"
                >
                  Sign Up Free <ChevronRight />
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthForm(true);
                  }}
                  className="flex items-center gap-2 px-8 py-4 bg-github-card border border-github-border text-github-text hover:text-white rounded-md transition-colors text-lg"
                >
                  Sign In <LogIn size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-8 py-4 bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors text-lg mx-auto"
              >
                Go to Dashboard <ChevronRight />
              </button>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}