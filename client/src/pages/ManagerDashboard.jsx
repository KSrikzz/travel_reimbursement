import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { getManagerDashboard } from "../api/dashboardApi";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
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

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading manager dashboard..." />
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

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome, ${user?.name}`}
        subtitle="Review and manage your team's travel requests and expenses."
      />

      {}
      <div className="dashboard-stats">
        <StatCard
          label="Pending Travel Requests"
          value={dashboard?.pendingTravelRequests ?? 0}
          variant="warning"
          helperText="Needs your review"
        />
        <StatCard
          label="Pending Expenses"
          value={dashboard?.pendingExpenses ?? 0}
          variant="warning"
          helperText="Needs your review"
        />
        <StatCard
          label="Approved Expenses"
          value={dashboard?.approvedExpenses ?? 0}
          variant="success"
        />
        <StatCard
          label="Rejected Expenses"
          value={dashboard?.rejectedExpenses ?? 0}
          variant="danger"
        />
      </div>

      {}
      <div className="dashboard-stats" style={{ marginTop: 0 }}>
        <StatCard
          label="Reimbursed Expenses"
          value={dashboard?.reimbursedExpenses ?? 0}
          variant="info"
          helperText="Processed by finance"
        />
      </div>

      {}
      <div className="dashboard-section">
        <h2 className="dashboard-section__title">Quick Actions</h2>
        <div className="dashboard-actions">
          <Button
            variant="primary"
            onClick={() => navigate("/manager/travel-requests")}
          >
            Review Travel Requests
            {(dashboard?.pendingTravelRequests ?? 0) > 0 && (
              <span> ({dashboard.pendingTravelRequests})</span>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/manager/expenses")}
          >
            Review Expenses
            {(dashboard?.pendingExpenses ?? 0) > 0 && (
              <span> ({dashboard.pendingExpenses})</span>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ManagerDashboard;
