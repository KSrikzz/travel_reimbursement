import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { getEmployeeDashboard } from "../api/dashboardApi";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEmployeeDashboard();
      setDashboard(data.dashboard);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading your dashboard..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState message={error} onRetry={loadDashboard} />
      </AppLayout>
    );
  }

  const hasActivity =
    dashboard?.totalTravelRequests > 0 ||
    dashboard?.approvedTrips > 0 ||
    dashboard?.pendingExpenses > 0 ||
    dashboard?.reimbursedAmount > 0;

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome, ${user?.name}`}
        subtitle="Here's an overview of your travel and expense activity."
      />

      {}
      <div className="dashboard-stats">
        <StatCard
          label="Travel Requests"
          value={dashboard?.totalTravelRequests ?? 0}
          variant="primary"
          helperText="Total submitted"
        />
        <StatCard
          label="Approved Trips"
          value={dashboard?.approvedTrips ?? 0}
          variant="success"
          helperText="Ready for expenses"
        />
        <StatCard
          label="Pending Expenses"
          value={dashboard?.pendingExpenses ?? 0}
          variant="warning"
          helperText="Awaiting review"
        />
        <StatCard
          label="Reimbursed"
          value={`₹${dashboard?.reimbursedAmount ?? 0}`}
          variant="info"
          helperText="Total amount received"
        />
      </div>

      {}
      <div className="dashboard-section">
        <h2 className="dashboard-section__title">Quick Actions</h2>
        <div className="dashboard-actions">
          <Button
            variant="primary"
            onClick={() => navigate("/travel-requests")}
          >
            Manage Travel Requests
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/expenses")}
          >
            Manage Expenses
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/my-reimbursements")}
          >
            My Reimbursements
          </Button>
        </div>
      </div>

      {}
      {!hasActivity && (
        <div className="dashboard-section">
          <EmptyState
            message="No activity yet. Start by creating a travel request to begin the reimbursement process."
            actionLabel="Create Travel Request"
            onAction={() => navigate("/travel-requests")}
          />
        </div>
      )}
    </AppLayout>
  );
};

export default EmployeeDashboard;
