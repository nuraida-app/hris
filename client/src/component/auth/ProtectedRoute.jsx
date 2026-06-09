import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { isAdminRole } from "../../utils/auth";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdminRole(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
