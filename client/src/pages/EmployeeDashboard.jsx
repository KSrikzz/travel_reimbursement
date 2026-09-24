import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getEmployeeDashboard } from "../api/dashboardApi";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getEmployeeDashboard();
        setDashboard(data.dashboard);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <Navbar />
      <main>
        <h1>Employee Dashboard</h1>
        <p>Welcome, {user?.name}</p>

        <section>
          <div>
            <h3>Travel Requests</h3>
            <p>{dashboard?.totalTravelRequests}</p>
          </div>

          <div>
            <h3>Approved Trips</h3>
            <p>{dashboard?.approvedTrips}</p>
          </div>

          <div>
            <h3>Pending Expenses</h3>
            <p>{dashboard?.pendingExpenses}</p>
          </div>

          <div>
            <h3>Reimbursed Amount</h3>
            <p>₹{dashboard?.reimbursedAmount}</p>
          </div>
        </section>
        <button onClick={() => navigate("/travel-requests")}>Manage Travel Requests</button>
        <button onClick={() => navigate("/expenses")}>Manage Expenses</button>
        <button onClick={() => navigate("/my-reimbursements")}>My Reimbursements</button>
      </main>
    </>
  );
};

export default EmployeeDashboard;