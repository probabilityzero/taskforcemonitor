import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full py-4 text-center text-github-text text-xs"> {/* Reduced font size to text-xs */}
      <div className="flex justify-center space-x-4 mt-2">
        <p>© {new Date().getFullYear()} .</p>
        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
        <a href="mailto:contact@bastilleinc.com" className="hover:text-white transition-colors">Contact</a>
      </div>
    </footer>
  );
}
