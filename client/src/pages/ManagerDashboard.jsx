import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getManagerDashboard } from "../api/dashboardApi";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getManagerDashboard();

        setDashboard(data.dashboard);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load manager dashboard"
        );
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
        <h1>Manager Dashboard</h1>

        <p>Welcome, {user?.name}</p>

        <section>
          <div>
            <h3>Pending Travel Requests</h3>
            <p>{dashboard?.pendingTravelRequests}</p>
          </div>

          <div>
            <h3>Pending Expenses</h3>
            <p>{dashboard?.pendingExpenses}</p>
          </div>

          <div>
            <h3>Approved Expenses</h3>
            <p>{dashboard?.approvedExpenses}</p>
          </div>

          <div>
            <h3>Rejected Expenses</h3>
            <p>{dashboard?.rejectedExpenses}</p>
          </div>

          <div>
            <h3>Reimbursed Expenses</h3>
            <p>{dashboard?.reimbursedExpenses}</p>
          </div>
        </section>

        <section>
          <button
            onClick={() =>
              navigate("/manager/travel-requests")
            }
          >
            Review Travel Requests
          </button>
        </section>
      </main>
    </>
  );
};

export default ManagerDashboard;