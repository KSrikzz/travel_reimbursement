import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import DashboardRedirect from "./pages/DashboardRedirect";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import TravelRequests from "./pages/TravelRequests";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route element={<RoleRoute allowedRoles={["EMPLOYEE"]} />}>
            <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
            <Route path="/travel-requests" element={<TravelRequests />}/>
          </Route>

          <Route element={<RoleRoute allowedRoles={["MANAGER"]} />}>
            <Route path="/dashboard/manager" element={<ManagerDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["FINANCE"]} />}>
            <Route path="/dashboard/finance" element={<FinanceDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;