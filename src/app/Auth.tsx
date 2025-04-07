import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { AuthForm } from '../components/AuthForm';
import { Link } from 'react-router-dom';

function Auth() {
  const [initialMode, setInitialMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL parameters
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('mode') === 'signup') {
      setInitialMode('signup');
    } else if (searchParams.get('mode') === 'login') {
      setInitialMode('login');
    }
  }, [location]);

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-github-bg-gradient flex flex-col items-center justify-between">
      <Link to="/" className="mb-8 flex mt-12 md:mt-20 items-center hover:opacity-90 transition-opacity">
        <img 
          src="https://raw.githubusercontent.com/probabilityzero/cloudstorage/refs/heads/main/taskforcemonitor.svg" 
          alt="Task Force Monitor" 
          className="w-10 h-10 mr-2"
        />
        <h1 className="text-2xl font-bold text-github-text">Task Force <span className="font-thin">Monitor</span></h1>
      </Link>
      
      <AuthForm 
        className="w-full max-w-md" 
        initialMode={initialMode}
        onSuccess={handleAuthSuccess}
      />
      
      <Footer />
    </div>
  );
}

export default Auth;