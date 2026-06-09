import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDefaultRoute } from "../../utils/auth";

const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.user);

  if (user) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return children;
};

export default PublicRoute;
