import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa';
import Logo from '../assets/logo.svg?react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from './../components/Footer';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSignIn = async (provider: 'google' | 'github' | 'linkedin' | null = null) => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'google' || provider === 'linkedin') {
        setLoading(false);
        setToast(`Login via ${provider} coming soon!`);
        return;
      } else if (provider === 'github') {
        const baseUrl = window.location.origin;
        
        const { error: signInError } = await supabase.auth.signInWithOAuth({
          provider: provider,
          options: {
            redirectTo: baseUrl, 
          },
        });
        if (signInError) {
          setError(signInError.message);
        }
      } else {
        if (!email || !password) {
          setError("Please enter both email and password");
          setLoading(false);
          return;
        }
        
        const { error: passwordError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (passwordError) {
          setError(passwordError.message);
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
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (signUpError) {
        console.error('Sign-up error:', signUpError);
        if (signUpError.message.includes('AuthWeakPasswordError')) {
          setError('Password must be at least 6 characters long.');
        } else {
          setError(signUpError.message);
        }
      } else {
        console.log('Sign-up successful:', data);
        // Check if email confirmation is required
        if (data.user && data.session) {
          // If we have a session, user can be logged in immediately
          navigate('/');
        } else {
          // User needs to confirm email
          setToast('Please check your email to confirm your account before logging in.');
          setShowCreateAccount(false); // Switch back to login form
        }
      }
    } catch (err: any) {
      console.error('Sign-up exception:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-github-bg-gradient flex flex-col items-center justify-between">
      <div className="mb-8 flex mt-12 md:mt-20">
        <Logo className="w-10 h-10 mr-2" />
        <h1 className="text-2xl font-bold text-github-text">Task Force <span className="font-thin">Monitor</span></h1>
      </div>
      <div className="bg-github-card p-6 rounded-lg shadow-md w-full max-w-md border border-github-border">
        <AnimatePresence mode="wait" initial={false}>
          {showCreateAccount ? (
            <motion.div
              key="signup-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
            >
              <h2 className="text-xl font-bold mb-4 text-github-text text-center">
                Welcome!
              </h2>
              <p className="text-github-text text-center mb-6">
                Let's create a new account
              </p>
              {error && (
                <div className="text-red-500 mb-3 text-sm">{error}</div>
              )}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="auth-input w-full p-2 rounded-md border border-github-border bg-github-input-dark text-github-text"
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="auth-input w-full p-2 rounded-md border border-github-border bg-github-input-dark text-github-text"
                />
              </div>
              <div className="relative mb-6">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input w-full p-2 rounded-md border border-github-border bg-github-input-dark text-github-text"
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
              animate={{ opacity: 1, height:'auto', y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            >
              <h2 className="text-xl font-bold mb-4 text-github-text text-center">
                Welcome back!
              </h2>
              <p className="text-github-text text-center mb-6">
                Please sign in to continue
              </p>
              {error && (
                <div className="text-red-500 mb-3 text-sm">{error}</div>
              )}
              <div className="mb-4">
                <button
                  onClick={() => handleSignIn('google')}
                  className="auth-provider-button button-github-font w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-github-text border border-github-border bg-google-gradient hover:opacity-90"
                >
                  <FaGoogle size={20} />
                  Continue with Google
                </button>
              </div>
              <div className="mb-4">
                <button
                  onClick={() => handleSignIn('github')}
                  className="auth-provider-button button-github-font w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-github-text border border-github-border bg-github-gradient hover:opacity-90"
                >
                  <FaGithub size={20} />
                  Continue with GitHub
                </button>
              </div>
              <div className="mb-6">
                <button
                  onClick={() => handleSignIn('linkedin')}
                  className="auth-provider-button button-github-font w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-github-text border border-github-border bg-linkedin-gradient hover:opacity-90"
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
                  className="auth-input w-full p-2 rounded-md border border-github-border bg-github-input-dark text-github-text"
                />
              </div>
              <div className="relative mb-6">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input w-full p-2 rounded-md border border-github-border bg-github-input-dark text-github-text"
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
                onClick={() => handleSignIn(null)}
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
                  Create a new one
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-4 left-4 bg-github-card p-4 rounded-md border border-github-border text-github-text z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => setTimeout(() => setToast(null), 3000)}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Auth;