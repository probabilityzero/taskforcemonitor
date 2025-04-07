import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './app/Auth';
import TermsOfService from './app/TermsOfService';
import PrivacyPolicy from './app/PrivacyPolicy';
import AccountSettings from './app/AccountSettings';
import HomePage from './app/HomePage';

function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/account-settings" element={<AccountSettings />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;