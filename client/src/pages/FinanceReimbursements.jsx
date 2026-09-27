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
  getApprovedExpenses,
  processReimbursement,
} from "../api/reimbursementApi";

const FinanceReimbursements = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getApprovedExpenses();

      setExpenses(data.expenses || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load approved expenses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const openProcessModal = (expense) => {
    setSelectedExpense(expense);
    setConfirmModalOpen(true);
  };

  const handleConfirmReimbursement = async () => {
    if (!selectedExpense) return;
    const expenseId = selectedExpense._id;

    try {
      setProcessingId(expenseId);
      setError("");
      setSuccess("");

      const data = await processReimbursement(expenseId);

      setSuccess(
        `Reimbursement completed successfully. Transaction ID: ${data.reimbursement.transactionId}`
      );

      setExpenses((previousExpenses) =>
        previousExpenses.filter(
          (expense) => expense._id !== expenseId
        )
      );

      setConfirmModalOpen(false);
      setSelectedExpense(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to process reimbursement"
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading approved expenses awaiting payout..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Process Reimbursements"
        subtitle="Review manager-approved expenses and execute reimbursement payouts"
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
        <EmptyState message="No approved expenses waiting for reimbursement. All manager-approved claims have been disbursed." />
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

                  <span className="badge badge--approved">
                    <span className="badge__dot" aria-hidden="true" />
                    Manager Approved
                  </span>
                </div>

                {}
                <div className="reimbursement-card__grid">
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

                  {expense.travelRequest && (
                    <>
                      <div>
                        <span className="data-label">Trip Destination</span>
                        <span className="data-value">
                          {expense.travelRequest.destination}
                        </span>
                      </div>

                      <div>
                        <span className="data-label">Trip Purpose</span>
                        <span className="data-value">
                          {expense.travelRequest.purpose}
                        </span>
                      </div>
                    </>
                  )}

                  {expense.description && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <span className="data-label">Expense Description</span>
                      <span className="data-value">{expense.description}</span>
                    </div>
                  )}
                </div>

                {}
                <div className="verification-section">
                  <div className="verification-section__title">
                    Audit & Verification Summary
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "var(--space-4)",
                      marginBottom: "var(--space-3)",
                    }}
                  >
                    <div>
                      <span className="data-label">OCR Scanned Amount</span>
                      <span className="data-value">
                        {expense.ocrExtractedAmount !== null &&
                        expense.ocrExtractedAmount !== undefined
                          ? `₹${expense.ocrExtractedAmount}`
                          : "Not detected"}
                      </span>
                    </div>

                    <div>
                      <span className="data-label">OCR Amount Match</span>
                      <span className="data-value">
                        {hasOcrMismatch ? (
                          <span style={{ color: "var(--danger)", fontWeight: "var(--font-weight-medium)" }}>
                            ⚠️ Mismatch
                          </span>
                        ) : (
                          <span style={{ color: "var(--success)", fontWeight: "var(--font-weight-medium)" }}>
                            ✓ Match
                          </span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="data-label">Policy Status</span>
                      <span className="data-value">
                        {hasPolicyFlag ? (
                          <span style={{ color: "var(--danger)", fontWeight: "var(--font-weight-medium)" }}>
                            ⚠️ FLAGGED
                          </span>
                        ) : (
                          <span style={{ color: "var(--success)", fontWeight: "var(--font-weight-medium)" }}>
                            ✓ Within policy
                          </span>
                        )}
                      </span>
                    </div>

                    {expense.policyMessage && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <span className="data-label">Policy Flag Note</span>
                        <span className="data-value" style={{ color: "var(--text-secondary)" }}>
                          {expense.policyMessage}
                        </span>
                      </div>
                    )}
                  </div>

                  {expense.receiptUrl && (
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--secondary"
                      style={{ display: "inline-flex" }}
                    >
                      View Receipt ↗
                    </a>
                  )}
                </div>

                {}
                <div
                  style={{
                    marginTop: "var(--space-5)",
                    paddingTop: "var(--space-4)",
                    borderTop: "1px solid var(--border-light)",
                  }}
                >
                  <Button
                    variant="primary"
                    loading={processingId === expense._id}
                    onClick={() => openProcessModal(expense)}
                  >
                    Process Reimbursement
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
        title="Confirm Reimbursement Payout"
      >
        <p style={{ marginBottom: "var(--space-3)", color: "var(--text-secondary)" }}>
          You are about to disburse reimbursement of{" "}
          <strong style={{ color: "var(--text)" }}>₹{selectedExpense?.amount}</strong> to{" "}
          <strong style={{ color: "var(--text)" }}>
            {selectedExpense?.employee?.name || "the employee"}
          </strong>{" "}
          ({selectedExpense?.category}).
        </p>

        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginBottom: "var(--space-5)" }}>
          A simulated transaction ID will be generated and saved to the audit ledger.
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
            variant="primary"
            loading={processingId !== null}
            onClick={handleConfirmReimbursement}
          >
            Confirm & Pay
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default FinanceReimbursements;
