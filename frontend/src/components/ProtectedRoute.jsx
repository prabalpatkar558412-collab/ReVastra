import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole } = useAuth();

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Role-based restriction (only if roles provided)
  if (Array.isArray(allowedRoles) && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}