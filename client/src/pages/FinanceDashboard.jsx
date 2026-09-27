import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { getFinanceDashboard } from "../api/dashboardApi";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const FinanceDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getFinanceDashboard();
      setDashboard(data.dashboard);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load finance dashboard"
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
        <LoadingState message="Loading finance dashboard..." />
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
        subtitle="Overview of expense approvals and reimbursement processing."
      />

      <div className="dashboard-stats">
        <StatCard
          label="Approved Expenses"
          value={dashboard?.approvedExpenses ?? 0}
          variant="warning"
          helperText="Awaiting reimbursement"
        />
        <StatCard
          label="Reimbursed Expenses"
          value={dashboard?.reimbursedExpenses ?? 0}
          variant="success"
          helperText="Successfully processed"
        />
        <StatCard
          label="Rejected Expenses"
          value={dashboard?.rejectedExpenses ?? 0}
          variant="danger"
        />
        <StatCard
          label="Total Reimbursed"
          value={`₹${dashboard?.totalReimbursed ?? 0}`}
          variant="info"
          helperText="Amount disbursed"
        />
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section__title">Quick Actions</h2>
        <div className="dashboard-actions">
          <Button
            variant="primary"
            onClick={() => navigate("/finance/reimbursements")}
          >
            Process Reimbursements
            {(dashboard?.approvedExpenses ?? 0) > 0 && (
              <span> ({dashboard.approvedExpenses})</span>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default FinanceDashboard;
