import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  PlayCircle, 
  Target, 
  Lightbulb,
  Zap,
  GitBranchPlus,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AuthForm } from '../components/AuthForm';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-github-bg overflow-hidden">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/assets/logo.svg" 
              alt="Task Force Monitor Logo" 
              className="w-8 h-8 mr-2" 
            />
            <h1 className="text-xl font-bold text-github-text">Task Force <span className="font-thin">Monitor</span></h1>
          </div>
          
          {!user && !isSmallScreen && (
            <button 
              onClick={() => navigate('/auth')}
              className="text-github-text hover:text-white transition-colors"
            >
              Log in
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left column - Text content */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Organize and track all your projects <span className="text-github-green">effortlessly</span>
                </h1>
                
                <p className="text-xl text-github-text mb-8 max-w-2xl">
                  Task Force Monitor helps you keep track of all your ideas, ongoing work, and completed projects in one beautiful dashboard.
                </p>
                
                {!isSmallScreen && !user ? (
                  <button
                    onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-6 py-3 bg-github-green hover:bg-github-green-hover text-white rounded-full transition-colors text-lg"
                  >
                    Get Started <ArrowRight />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(user ? '/' : '/auth')}
                    className="flex items-center gap-2 px-6 py-3 bg-github-green hover:bg-github-green-hover text-white rounded-full transition-colors text-lg"
                  >
                    {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight />
                  </button>
                )}
              </motion.div>

              {/* Features grid */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-github-card p-5 rounded-lg border border-github-border"
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
            
            {/* Right column - Auth form */}
            {!user && (
              <motion.div 
                id="auth-section"
                className="w-full md:w-96 md:flex-shrink-0 mt-12 md:mt-0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <AuthForm 
                  compact={true} 
                  showWelcomeText={false}
                  onSuccess={onAuthSuccess}
                  className="mb-5"
                />
                <div className="text-center text-github-text text-sm">
                  By signing up, you agree to our <a href="/terms" className="text-github-blue hover:text-white">Terms of Service</a> and <a href="/privacy" className="text-github-blue hover:text-white">Privacy Policy</a>.
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Visual gradient separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-github-border to-transparent my-20"></div>

        {/* How it works section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                className="bg-github-card border border-github-border rounded-lg p-6 flex flex-col items-center text-center"
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

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            className="bg-github-card border border-github-border rounded-lg p-8 md:p-12 text-center"
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
            <button
              onClick={() => navigate(user ? '/' : '/auth')}
              className="flex items-center gap-2 px-8 py-4 bg-github-green hover:bg-github-green-hover text-white rounded-full transition-colors text-lg mx-auto"
            >
              {user ? 'Go to Dashboard' : 'Get Started for Free'} <ChevronRight />
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}