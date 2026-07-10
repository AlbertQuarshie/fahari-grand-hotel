import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { body } from "../../constants/theme";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      toast.error("Please sign in to access that page.");
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      toast.error("You don't have permission to access that page.");
    }
    // Re-fire only when the auth state or the attempted path changes,
    // not on every render of the same blocked route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, location.pathname]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-[#FAF8F3] ${body}`}>
        <p className="text-[#0B1F3A] font-semibold">Loading...</p>
      </div>
    );
  }

  // This only fires for direct URL access / page refresh while logged out —
  // normal in-app navigation (e.g. Sidebar) never reaches a protected route
  // without being authenticated, since those links are disabled instead.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
