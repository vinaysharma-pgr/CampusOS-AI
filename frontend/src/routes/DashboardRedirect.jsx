// src/routes/DashboardRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function DashboardRedirect() {
  const { user, isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "faculty") return <Navigate to="/faculty" replace />;
  return <Navigate to="/student" replace />;
}
