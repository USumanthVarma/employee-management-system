import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wrap a route element in this to require login (and, optionally, the
 * ADMIN role). Mirrors the same rule the backend enforces in
 * SecurityConfig - this is a UX convenience, not the security boundary;
 * the API itself still rejects unauthorized writes.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
