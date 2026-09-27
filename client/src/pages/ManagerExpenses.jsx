import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

import {
  getPendingExpenses,
  updateExpenseStatus,
} from "../api/managerExpenseApi";

const ManagerExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [success, setSuccess] = useState("");

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPendingExpenses();

      setExpenses(data.expenses || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load pending expenses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const openConfirmation = (expenseId, status) => {
    setPendingAction({ expenseId, status });
    setConfirmModalOpen(true);
  };

  const executeStatusUpdate = async () => {
    if (!pendingAction) return;

    const { expenseId, status } = pendingAction;

    try {
      setProcessingId(expenseId);
      setError("");
      setSuccess("");

      await updateExpenseStatus(expenseId, status);

      setExpenses((previousExpenses) =>
        previousExpenses.filter(
          (expense) => expense._id !== expenseId
        )
      );

      setSuccess(
        `Expense successfully ${status === "APPROVED" ? "approved" : "rejected"}.`
      );
      setConfirmModalOpen(false);
      setPendingAction(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update expense"
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading pending expenses for review..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Expense Review"
        subtitle="Verify receipt details, review automated policy checks, and approve or reject claims"
      />

      {error && (
        <Alert type="error" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onDismiss={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {expenses.length === 0 ? (
        <EmptyState message="No pending expenses to review. All submitted expenses have been processed." />
      ) : (
        <div className="request-list">
          {expenses.map((expense) => {
            const hasOcrMismatch = expense.ocrAmountMismatch;
            const hasPolicyFlag = expense.policyFlag;

            return (
              <Card key={expense._id}>
                {}
                <div className="expense-card__header">
                  <div>
                    <span
                      className="badge badge--neutral"
                      style={{ marginRight: "var(--space-2)" }}
                    >
                      {expense.category}
                    </span>
                    <span className="expense-card__amount">₹{expense.amount}</span>
                  </div>

                  <span className="badge badge--pending">
                    <span className="badge__dot" aria-hidden="true" />
                    Pending Review
                  </span>
                </div>

                {}
                <div className="expense-card__meta">
                  <div>
                    <span className="data-label">Employee</span>
                    <span className="data-value">
                      {expense.employee?.name || "Unknown"}
                    </span>
                  </div>

                  <div>
                    <span className="data-label">Department</span>
                    <span className="data-value">
                      {expense.employee?.department || "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="data-label">Email</span>
                    <span className="data-value">
                      {expense.employee?.email || "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="data-label">Expense Date</span>
                    <span className="data-value">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <span className="data-label">Description</span>
                    <span className="data-value">
                      {expense.description || "N/A"}
                    </span>
                  </div>
                </div>

                {}
                <div className="verification-section">
                  <div className="verification-section__title">
                    System Verification & Compliance Checks
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "var(--space-4)",
                    }}
                  >
                    {}
                    <div
                      style={{
                        padding: "var(--space-3)",
                        backgroundColor: hasPolicyFlag
                          ? "var(--danger-light)"
                          : "var(--background)",
                        borderRadius: "var(--radius-md)",
                        border: `1px solid ${
                          hasPolicyFlag ? "var(--danger)" : "var(--border-light)"
                        }`,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "var(--font-weight-semibold)",
                          fontSize: "var(--font-size-sm)",
                          marginBottom: "var(--space-1)",
                          color: hasPolicyFlag ? "var(--danger)" : "var(--text)",
                        }}
                      >
                        {hasPolicyFlag ? "⚠️ Policy Flagged" : "✓ Within Policy"}
                      </div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                        {expense.policyMessage || "No policy violation detected."}
                      </div>
                    </div>

                    {}
                    <div
                      style={{
                        padding: "var(--space-3)",
                        backgroundColor: hasOcrMismatch
                          ? "var(--danger-light)"
                          : "var(--background)",
                        borderRadius: "var(--radius-md)",
                        border: `1px solid ${
                          hasOcrMismatch ? "var(--danger)" : "var(--border-light)"
                        }`,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "var(--font-weight-semibold)",
                          fontSize: "var(--font-size-sm)",
                          marginBottom: "var(--space-1)",
                          color: hasOcrMismatch ? "var(--danger)" : "var(--text)",
                        }}
                      >
                        {hasOcrMismatch ? "⚠️ OCR Mismatch" : "✓ OCR Verified"}
                      </div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                        {expense.ocrExtractedAmount !== null &&
                        expense.ocrExtractedAmount !== undefined
                          ? `Receipt amount detected: ₹${expense.ocrExtractedAmount}`
                          : "OCR could not detect amount on receipt."}
                        {hasOcrMismatch &&
                          " Submitted amount differs from receipt image."}
                      </div>
                    </div>
                  </div>

                  {expense.receiptUrl && (
                    <div style={{ marginTop: "var(--space-3)" }}>
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn--secondary"
                        style={{ display: "inline-flex" }}
                      >
                        View Receipt Image ↗
                      </a>
                    </div>
                  )}
                </div>

                {}
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-3)",
                    marginTop: "var(--space-5)",
                    paddingTop: "var(--space-4)",
                    borderTop: "1px solid var(--border-light)",
                  }}
                >
                  <Button
                    variant="primary"
                    disabled={processingId === expense._id}
                    onClick={() => openConfirmation(expense._id, "APPROVED")}
                  >
                    Approve Expense
                  </Button>

                  <Button
                    variant="danger"
                    disabled={processingId === expense._id}
                    onClick={() => openConfirmation(expense._id, "REJECTED")}
                  >
                    Reject Expense
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={
          pendingAction?.status === "APPROVED"
            ? "Approve Expense Claim"
            : "Reject Expense Claim"
        }
      >
        <p style={{ marginBottom: "var(--space-4)", color: "var(--text-secondary)" }}>
          Are you sure you want to{" "}
          <strong style={{ color: "var(--text)" }}>
            {pendingAction?.status === "APPROVED" ? "approve" : "reject"}
          </strong>{" "}
          this expense claim? This decision will be recorded and forwarded to Finance if approved.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
          <Button
            variant="ghost"
            onClick={() => setConfirmModalOpen(false)}
            disabled={processingId !== null}
          >
            Cancel
          </Button>
          <Button
            variant={pendingAction?.status === "APPROVED" ? "primary" : "danger"}
            loading={processingId !== null}
            onClick={executeStatusUpdate}
          >
            {pendingAction?.status === "APPROVED" ? "Yes, Approve" : "Yes, Reject"}
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default ManagerExpenses;
