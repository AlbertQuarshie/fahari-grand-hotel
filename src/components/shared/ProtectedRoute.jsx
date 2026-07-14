import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { body } from "../../constants/theme";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, justLoggedOutRef } = useAuth();
  const location = useLocation();
  // Read once per render so the render branch below and the effect agree —
  // if we let each read (and reset) the ref independently, whichever runs
  // second sees it already cleared and can act as if this were a normal
  // unauthorized visit (wrong toast, wrong redirect target).
  const justLoggedOut = justLoggedOutRef.current;

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // Skip the noise if this is the direct result of a logout — Navbar
      // already sends the user home, this isn't an unauthorized access
      // attempt that needs a warning. Consume the flag so it only
      // suppresses this one occurrence.
      if (justLoggedOut) {
        justLoggedOutRef.current = false;
        return;
      }
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

  if (!isAuthenticated) {
    return <Navigate to={justLoggedOut ? "/" : "/login"} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;