import { Footer } from '../components/Footer';
import { AuthForm } from '../components/AuthForm';

function Auth() {
  return (
    <div className="min-h-screen bg-github-bg-gradient flex flex-col items-center justify-between">
      <div className="mb-8 flex mt-12 md:mt-20">
        <img 
          src="https://raw.githubusercontent.com/probabilityzero/cloudstorage/refs/heads/main/taskforcemonitor.svg" 
          alt="Task Force Monitoro" 
          className="w-10 h-10 mr-2"
        />
        <h1 className="text-2xl font-bold text-github-text">Task Force <span className="font-thin">Monitor</span></h1>
      </div>
      
      <AuthForm className="w-full max-w-md" />
      
      <Footer />
    </div>
  );
}

export default Auth;