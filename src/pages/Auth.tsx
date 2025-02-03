import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa';
import Logo from '../assets/logo.svg?react';
import { motion, AnimatePresence } from 'framer-motion';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (provider: 'google' | 'github' | 'linkedin' | null = null) => {
    setLoading(true);
    setError(null);
    try {
      if (provider) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/`,
          },
        });
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-github-bg-gradient flex flex-col items-center justify-between">
      <div className="mb-8 flex items-center mt-12 md:mt-20">
        <Logo className="w-10 h-10 mr-2" />
        <h1 className="text-2xl font-bold text-github-text">Task Force <span className="font-thin">Monitor</span></h1>
      </div>
      <div className="bg-github-card p-6 rounded-lg shadow-md w-full max-w-md border border-github-border">
        <AnimatePresence mode="wait" initial={false}>
          {showCreateAccount ? (
            <motion.div
              key="signup-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            >
              <h2 className="text-xl font-bold mb-4 text-github-text text-center">
                Welcome!
              </h2>
              <p className="text-github-text text-center mb-6">
                Let's create a new account to continue.
              </p>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="auth-input w-full p-2 rounded-md border border-github-border text-github-text"
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="auth-input w-full p-2 rounded-md border border-github-border text-github-text"
                />
              </div>
              <div className="relative mb-6">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input w-full p-2 rounded-md border border-github-border text-github-text"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-github-text hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                onClick={handleSignUp}
                className="auth-button w-full bg-github-blue hover:bg-github-blue-hover text-white py-2 rounded-md transition-colors"
                disabled={loading}
              >
                Create Account
              </button>
              <div className="text-center mt-3">
                <span className="text-github-text text-sm">Already have an account?</span>
                <button
                  onClick={() => setShowCreateAccount(false)}
                  className="text-github-blue hover:text-white transition-colors ml-1 text-sm"
                >
                  Sign in here
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            >
              <h2 className="text-xl font-bold mb-4 text-github-text text-center">
                Welcome back!
              </h2>
              <p className="text-github-text text-center mb-6">
                Please sign in to continue
              </p>
              <div className="mb-4">
                <button
                  onClick={() => handleSignIn('google')}
                  className="auth-provider-button w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-github-text border border-github-border bg-google-gradient hover:opacity-90"
                >
                  <FaGoogle size={20} />
                  Continue with Google
                </button>
              </div>
              <div className="mb-4">
                <button
                  onClick={() => handleSignIn('github')}
                  className="auth-provider-button w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-github-text border border-github-border bg-github-gradient hover:opacity-90"
                >
                  <FaGithub size={20} />
                  Continue with GitHub
                </button>
              </div>
              <div className="mb-6">
                <button
                  onClick={() => handleSignIn('linkedin')}
                  className="auth-provider-button w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-github-text border border-github-border bg-linkedin-gradient hover:opacity-90"
                >
                  <FaLinkedin size={20} />
                  Continue with LinkedIn
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-github-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-github-card px-2 text-github-text">Or</span>
                </div>
              </div>
              <div className="mb-4 mt-6">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="auth-input w-full p-2 rounded-md border border-github-border text-github-text"
                />
              </div>
              <div className="relative mb-6">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input w-full p-2 rounded-md border border-github-border text-github-text"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-github-text hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                onClick={handleSignIn}
                className="auth-button w-full bg-github-green hover:bg-github-green-hover text-white py-2 rounded-md transition-colors"
                disabled={loading}
              >
                Sign In
              </button>
              <div className="text-center mt-3">
                <span className="text-github-text text-sm">Don't have an account?</span>
                <button
                  onClick={() => setShowCreateAccount(true)}
                  className="text-github-blue hover:text-white transition-colors ml-1 text-sm"
                >
                  Create a new one here
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <footer className="w-full py-4 text-center text-github-text text-sm">
        <p>© {new Date().getFullYear()} Bastille, Inc.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <a href="mailto:contact@bastilleinc.com" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default Auth;
