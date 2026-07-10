import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { body } from "../../constants/theme";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-[#FAF8F3] ${body}`}>
        <p className="text-[#0B1F3A] font-semibold">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;