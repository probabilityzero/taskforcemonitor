import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../App';

function ProtectedRoute() {
  const { user } = useContext(AppContext);
  const location = useLocation();

  // If not logged in, redirect to auth page with a redirect back to the current page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is logged in, render the child routes
  return <Outlet />;
}

export default ProtectedRoute;