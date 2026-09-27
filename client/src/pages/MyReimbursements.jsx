import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { getMyReimbursements } from "../api/reimbursementApi";

const MyReimbursements = () => {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReimbursements = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyReimbursements();
        setReimbursements(data.reimbursements || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load reimbursement history"
        );
      } finally {
        setLoading(false);
      }
    };

    loadReimbursements();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading your reimbursement history..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="My Reimbursements"
        subtitle="Track payment disbursements, audit reference transaction IDs, and settlement records"
      />

      {error && (
        <Alert type="error" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      {reimbursements.length === 0 ? (
        <EmptyState message="No reimbursements found. Approved expenses will appear here once disbursed by Finance." />
      ) : (
        <Card className="reimbursement-table-card reimbursement-table-mobile">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                  <th>Processed Date</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {reimbursements.map((item) => (
                  <tr key={item._id}>
                    <td data-label="Category">
                      <div>
                        <strong>{item.expense?.category || "Expense"}</strong>
                        {item.expense?.description && (
                          <div
                            style={{
                              fontSize: "var(--font-size-xs)",
                              color: "var(--text-muted)",
                              marginTop: "var(--space-1)",
                            }}
                          >
                            {item.expense.description}
                          </div>
                        )}
                      </div>
                    </td>

                    <td data-label="Amount">
                      <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--text)" }}>
                        ₹{item.amount}
                      </span>
                    </td>

                    <td data-label="Status">
                      <StatusBadge status={item.status} />
                    </td>

                    <td data-label="Transaction ID">
                      <code
                        style={{
                          fontSize: "var(--font-size-xs)",
                          backgroundColor: "var(--background)",
                          padding: "2px 6px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        {item.transactionId || "—"}
                      </code>
                    </td>

                    <td data-label="Processed Date">
                      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                        {item.processedAt
                          ? new Date(item.processedAt).toLocaleString()
                          : "—"}
                      </span>
                    </td>

                    <td data-label="Receipt">
                      {item.expense?.receiptUrl ? (
                        <a
                          href={item.expense.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn--ghost"
                          style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "var(--font-size-xs)",
                            display: "inline-flex",
                          }}
                        >
                          View ↗
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppLayout>
  );
};

export default MyReimbursements;
