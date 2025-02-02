import React, { useState } from 'react';
    import { supabase } from '../lib/supabase';
    import { useNavigate } from 'react-router-dom';
    import { cn } from '../lib/utils';
    import { Mail } from 'lucide-react';
    import { FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa';
    // import { ReactComponent as Logo } from '../assets/logo.svg?react';

    function Auth() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const navigate = useNavigate();
      const [showCreateAccount, setShowCreateAccount] = useState(false);

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
        <div className="min-h-screen bg-github-bg flex items-center justify-center">
          <div className="bg-github-card p-6 rounded-lg shadow-md w-full max-w-md border border-github-border">
            <h2 className="text-xl font-bold mb-4 text-github-text text-center">
              Log In
            </h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="space-y-4">
              {!showCreateAccount && (
                <>
                  <button
                    onClick={() => handleSignIn('google')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-github-text border border-github-border bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <FaGoogle size={20} />
                    Log in with Google
                  </button>
                  <button
                    onClick={() => handleSignIn('github')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-github-text border border-github-border bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                  >
                    <FaGithub size={20} />
                    Log in with GitHub
                  </button>
                  <button
                    onClick={() => handleSignIn('linkedin')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-github-text border border-github-border bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    <FaLinkedin size={20} />
                    Log in with LinkedIn
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-github-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-github-card px-2 text-github-text">Or</span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full p-2 rounded-md border border-github-border bg-github-card text-github-text"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full p-2 rounded-md border border-github-border bg-github-card text-github-text"
                    />
                  </div>
                  <button
                    onClick={handleSignIn}
                    className="w-full bg-github-green hover:bg-github-green-hover text-white py-2 rounded-md transition-colors"
                    disabled={loading}
                  >
                    Log In
                  </button>
                  <div className="text-center mt-2">
                    <span className="text-github-text text-sm">No account?</span>
                    <button
                      onClick={() => setShowCreateAccount(true)}
                      className="text-github-blue hover:text-white transition-colors ml-1 text-sm"
                    >
                      Create one
                    </button>
                  </div>
                </>
              )}
              {showCreateAccount && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-github-text text-center">
                    Create an Account
                  </h2>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full p-2 rounded-md border border-github-border bg-github-card text-github-text"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full p-2 rounded-md border border-github-border bg-github-card text-github-text"
                    />
                  </div>
                  <button
                    onClick={handleSignUp}
                    className="w-full bg-github-blue hover:bg-github-blue-hover text-white py-2 rounded-md transition-colors"
                    disabled={loading}
                  >
                    Create an Account
                  </button>
                  <div className="text-center mt-2">
                    <button
                      onClick={() => setShowCreateAccount(false)}
                      className="text-github-blue hover:text-white transition-colors ml-1 text-sm"
                    >
                      Back to Log In
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    export default Auth;
