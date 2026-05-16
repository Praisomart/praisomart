import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    toast.error("Please sign in to access this page");
    return <Navigate to="/signin" replace />;
  }

  // Admin access: only users with ADMIN role can access admin panel
  if (requireAdmin && user?.role !== "ADMIN") {
    toast.error("Access denied. Admin privileges required.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
