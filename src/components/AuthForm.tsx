import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthFormProps {
  className?: string;
  compact?: boolean;
  showWelcomeText?: boolean;
  onSuccess?: () => void;
}

export function AuthForm({ 
  className = '', 
  compact = false,
  showWelcomeText = true,
  onSuccess
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

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
        
        const { error: passwordError, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (passwordError) {
          console.error('Sign-in error:', passwordError);
          setError(passwordError.message);
        } else {
          console.log('Login successful, redirecting to:', from);
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(from);
          }
        }
      }
    } catch (err: any) {
      console.error('Sign-in exception:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    
    if (!email || !password || !name) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
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
        if (data.session) {
          // If we have a session, user can log in immediately
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/');
          }
        } else {
          // User needs to confirm email
          setToast('Account created! Please check your email to confirm your account before logging in.');
          setShowCreateAccount(false);
          setEmail('');
          setPassword('');
          setName('');
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
    <div className={cn("bg-github-card rounded-lg shadow-md border border-github-border", 
      compact ? "p-4" : "p-6", 
      className
    )}>
      <AnimatePresence mode="wait" initial={false}>
        {showCreateAccount ? (
          <motion.div
            key="signup-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
          >
            {showWelcomeText && (
              <>
                <h2 className={cn("font-bold mb-2 text-github-text text-center", 
                  compact ? "text-lg" : "text-xl"
                )}>
                  Welcome!
                </h2>
                <p className={cn("text-github-text text-center", 
                  compact ? "mb-3 text-sm" : "mb-6"
                )}>
                  Let's create a new account
                </p>
              </>
            )}
            {error && (
              <div className="text-red-500 mb-3 text-sm">{error}</div>
            )}
            <div className={compact ? "mb-2" : "mb-4"}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className={cn("auth-input w-full rounded-md border border-github-border bg-github-input-dark text-github-text",
                  compact ? "p-1.5 text-sm" : "p-2"
                )}
              />
            </div>
            <div className={compact ? "mb-2" : "mb-4"}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={cn("auth-input w-full rounded-md border border-github-border bg-github-input-dark text-github-text",
                  compact ? "p-1.5 text-sm" : "p-2"
                )}
              />
            </div>
            <div className={cn("relative", compact ? "mb-3" : "mb-6")}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={cn("auth-input w-full rounded-md border border-github-border bg-github-input-dark text-github-text",
                  compact ? "p-1.5 text-sm" : "p-2"
                )}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-github-text hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={compact ? 16 : 20} /> : <Eye size={compact ? 16 : 20} />}
              </button>
            </div>
            <button
              onClick={handleSignUp}
              className={cn("auth-button w-full bg-github-blue hover:bg-github-blue-hover text-white rounded-md transition-colors",
                compact ? "py-1.5 text-sm" : "py-2"
              )}
              disabled={loading}
            >
              Create Account
            </button>
            <div className="text-center mt-3">
              <span className={cn("text-github-text", compact ? "text-xs" : "text-sm")}>
                Already have an account?
              </span>
              <button
                onClick={() => setShowCreateAccount(false)}
                className={cn("text-github-blue hover:text-white transition-colors ml-1",
                  compact ? "text-xs" : "text-sm"
                )}
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
            {showWelcomeText && (
              <>
                <h2 className={cn("font-bold mb-2 text-github-text text-center", 
                  compact ? "text-lg" : "text-xl"
                )}>
                  Welcome back!
                </h2>
                <p className={cn("text-github-text text-center", 
                  compact ? "mb-3 text-sm" : "mb-6"
                )}>
                  Please sign in to continue
                </p>
              </>
            )}
            {error && (
              <div className="text-red-500 mb-3 text-sm">{error}</div>
            )}
            <div className={compact ? "mb-2" : "mb-4"}>
              <button
                onClick={() => handleSignIn('github')}
                className={cn("auth-provider-button button-github-font w-full flex items-center justify-center gap-2 rounded-md transition-colors text-github-text border border-github-border bg-github-gradient hover:opacity-90",
                  compact ? "py-1.5 text-sm" : "py-2"
                )}
              >
                <FaGithub size={compact ? 16 : 20} />
                Continue with GitHub
              </button>
            </div>
            <div className={compact ? "mb-2" : "mb-4"}>
              <button
                onClick={() => handleSignIn('google')}
                className={cn("auth-provider-button button-github-font w-full flex items-center justify-center gap-2 rounded-md transition-colors text-github-text border border-github-border bg-google-gradient hover:opacity-90",
                  compact ? "py-1.5 text-sm" : "py-2"
                )}
              >
                <FaGoogle size={compact ? 16 : 20} />
                Continue with Google
              </button>
            </div>
            <div className={compact ? "mb-3" : "mb-6"}>
              <button
                onClick={() => handleSignIn('linkedin')}
                className={cn("auth-provider-button button-github-font w-full flex items-center justify-center gap-2 rounded-md transition-colors text-github-text border border-github-border bg-linkedin-gradient hover:opacity-90",
                  compact ? "py-1.5 text-sm" : "py-2"
                )}
              >
                <FaLinkedin size={compact ? 16 : 20} />
                Continue with LinkedIn
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-github-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-github-card px-2 text-github-text">{compact ? "or" : "Or"}</span>
              </div>
            </div>
            <div className={cn(compact ? "mb-2 mt-3" : "mb-4 mt-6")}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={cn("auth-input w-full rounded-md border border-github-border bg-github-input-dark text-github-text",
                  compact ? "p-1.5 text-sm" : "p-2"
                )}
              />
            </div>
            <div className={cn("relative", compact ? "mb-3" : "mb-6")}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={cn("auth-input w-full rounded-md border border-github-border bg-github-input-dark text-github-text",
                  compact ? "p-1.5 text-sm" : "p-2"
                )}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-github-text hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={compact ? 16 : 20} /> : <Eye size={compact ? 16 : 20} />}
              </button>
            </div>
            <button
              onClick={() => handleSignIn(null)}
              className={cn("auth-button w-full bg-github-green hover:bg-github-green-hover text-white rounded-md transition-colors",
                compact ? "py-1.5 text-sm" : "py-2"
              )}
              disabled={loading}
            >
              Sign In
            </button>
            <div className="text-center mt-3">
              <span className={cn("text-github-text", compact ? "text-xs" : "text-sm")}>
                Don't have an account?
              </span>
              <button
                onClick={() => setShowCreateAccount(true)}
                className={cn("text-github-blue hover:text-white transition-colors ml-1",
                  compact ? "text-xs" : "text-sm"
                )}
              >
                Create a new one
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            className={cn(
              "fixed bottom-4 left-4 bg-github-card p-4 rounded-md border border-github-border text-github-text z-50",
              compact ? "text-sm" : ""
            )}
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