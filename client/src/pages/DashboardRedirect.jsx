import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "EMPLOYEE":
      return <Navigate to="/dashboard/employee" replace />;
    case "MANAGER":
      return <Navigate to="/dashboard/manager" replace />;
    case "FINANCE":
      return <Navigate to="/dashboard/finance" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirect;