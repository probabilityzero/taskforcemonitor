import React, { useState } from 'react';
    import { supabase } from '../lib/supabase';
    import { useNavigate } from 'react-router-dom';
    import { cn } from '../lib/utils';
    import { Mail, Github, Google, Linkedin } from 'lucide-react';
    import { ReactComponent as Logo } from '../assets/logo.svg';

    // Reusable OAuth Button Component
    const OAuthButton = ({ provider, label, icon, onClick }: any) => (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-github-text border border-github-border",
          provider === 'google' && "bg-gradient-to-r from-[#4285F4] to-[#34A853] hover:from-[#34A853] hover:to-[#4285F4]",
          provider === 'github' && "bg-gradient-to-r from-[#24292e] to-[#24292e] hover:from-[#444c56] hover:to-[#444c56]",
          provider === 'linkedin' && "bg-gradient-to-r from-[#0077B5] to-[#0077B5] hover:from-[#005a8a] hover:to-[#005a8a]",
        )}
      >
        {icon}
        {label}
      </button>
    );

    // Reusable Input Field Component
    const InputField = ({ type, placeholder, value, onChange }: any) => (
      <div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full p-2 rounded-md border border-github-border bg-github-input text-github-text"
        />
      </div>
    );

    function Auth() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [showCreateAccount, setShowCreateAccount] = useState(false);
      const navigate = useNavigate();

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
            if (error) setError(error.message);
          } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
            else navigate('/');
          }
        } catch (err: any) {
          setError(err?.message || 'An unexpected error occurred.');
        } finally {
          setLoading(false);
        }
      };

      const handleSignUp = async () => {
        setLoading(true);
        setError(null);
        try {
          const { error } = await supabase.auth.signUp({ email, password });
          if (error) setError(error.message);
          else navigate('/');
        } catch (err: any) {
          setError(err?.message || 'An unexpected error occurred.');
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="min-h-screen bg-github-bg flex items-center justify-center">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Logo className="w-12 h-12 md:w-16 md:h-16" />
              <h1 className="text-2xl md:text-3xl font-bold text-github-text flex items-center gap-1 md:gap-2">
                Task Force <span className="font-thin">Monitor</span>
              </h1>
            </div>
          </div>

          <div className="bg-github-card p-6 rounded-lg shadow-md w-full max-w-md border border-github-border">
            {!showCreateAccount ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-github-text text-center">Log In</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="space-y-4">
                  <OAuthButton
                    provider="google"
                    label="Log in with Google"
                    icon={<Google size={20} />}
                    onClick={() => handleSignIn('google')}
                  />
                  <OAuthButton
                    provider="github"
                    label="Log in with GitHub"
                    icon={<Github size={20} />}
                    onClick={() => handleSignIn('github')}
                  />
                  <OAuthButton
                    provider="linkedin"
                    label="Log in with LinkedIn"
                    icon={<Linkedin size={20} />}
                    onClick={() => handleSignIn('linkedin')}
                  />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-github-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-github-card px-2 text-github-text">Or</span>
                    </div>
                  </div>
                  
                  <InputField
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputField
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    onClick={handleSignIn}
                    className={cn(
                      "w-full text-white py-2 rounded-md transition-colors",
                      loading ? "bg-github-border" : "bg-gradient-to-r from-github-green to-github-green-hover"
                    )}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Log In'}
                  </button>

                  <div className="text-center mt-2">
                    <span className="text-github-text text-sm">Don't have an account?</span>
                    <button
                      onClick={() => setShowCreateAccount(true)}
                      className="text-github-blue hover:text-white transition-colors ml-1 text-sm"
                    >
                      Create a new one!
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-github-text text-center">Create an Account</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="space-y-4">
                  <OAuthButton
                    provider="google"
                    label="Create an Account with Google"
                    icon={<Google size={20} />}
                    onClick={() => handleSignIn('google')}
                  />
                  <OAuthButton
                    provider="github"
                    label="Create an Account with GitHub"
                    icon={<Github size={20} />}
                    onClick={() => handleSignIn('github')}
                  />
                  <OAuthButton
                    provider="linkedin"
                    label="Create an Account with LinkedIn"
                    icon={<Linkedin size={20} />}
                    onClick={() => handleSignIn('linkedin')}
                  />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-github-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-github-card px-2 text-github-text">Or</span>
                    </div>
                  </div>

                  <InputField
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputField
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    onClick={handleSignUp}
                    className={cn(
                      "w-full text-white py-2 rounded-md transition-colors",
                      loading ? "bg-github-border" : "bg-gradient-to-r from-github-blue to-github-blue-hover"
                    )}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Create an Account'}
                  </button>

                  <div className="text-center mt-2">
                    <button
                      onClick={() => setShowCreateAccount(false)}
                      className="text-github-blue hover:text-white transition-colors ml-1 text-sm"
                    >
                      Back to Log In
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    export default Auth;
