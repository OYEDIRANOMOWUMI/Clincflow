import { Navigate, useLocation } from 'react-router-dom';
import { getLoginPathForRole, getSession } from '../auth';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const session = getSession();
  const location = useLocation();

  if (!session?.user) {
    const fallbackPath = '/login';
    return <Navigate to={fallbackPath} replace state={{ from: location }} />;
  }

  const role = String(session.role || '').trim().toLowerCase();
  const allowed = allowedRoles.length === 0 || allowedRoles.includes(role);

  if (!allowed) {
    const redirectPath = getLoginPathForRole(role) || '/login';
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return children;
}
