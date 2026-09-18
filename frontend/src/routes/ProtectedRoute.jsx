import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ProtectedRoute({ children, role }) {
  const { isAuthed, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
          Loading…
        </span>
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // role can be: undefined (any authed user), a string, or an array of strings
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user?.role)) {
      // Redirect to their own dashboard instead of homepage
      const home = user?.role === "admin" ? "/admin" : user?.role === "faculty" ? "/faculty" : "/student";
      return <Navigate to={home} replace />;
    }
  }

  return children;
}
