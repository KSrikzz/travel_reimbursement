import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

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

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getApprovedExpenses();

      setExpenses(data.expenses || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load approved expenses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleReimbursement = async (expenseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to process this reimbursement?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(expenseId);
      setError("");
      setSuccess("");

      const data =
        await processReimbursement(expenseId);

      setSuccess(
        `Reimbursement completed. Transaction ID: ${data.reimbursement.transactionId}`
      );

      setExpenses((previousExpenses) =>
        previousExpenses.filter(
          (expense) => expense._id !== expenseId
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to process reimbursement"
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <p>Loading approved expenses...</p>;
  }

  return (
    <>
      <Navbar />

      <main>
        <h1>Reimbursements</h1>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: "green" }}>
            {success}
          </p>
        )}

        {expenses.length === 0 ? (
          <p>
            No approved expenses waiting for
            reimbursement.
          </p>
        ) : (
          <section>
            {expenses.map((expense) => (
              <article key={expense._id}>
                <h2>
                  {expense.category}
                </h2>

                <p>
                  <strong>Employee:</strong>{" "}
                  {expense.employee?.name}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {expense.employee?.email}
                </p>

                <p>
                  <strong>Department:</strong>{" "}
                  {expense.employee?.department}
                </p>

                <p>
                  <strong>Amount:</strong>{" "}
                  ₹{expense.amount}
                </p>

                <p>
                  <strong>Expense Date:</strong>{" "}
                  {new Date(
                    expense.expenseDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {expense.description || "N/A"}
                </p>

                {expense.travelRequest && (
                  <>
                    <h3>Travel Request</h3>

                    <p>
                      <strong>Destination:</strong>{" "}
                      {
                        expense.travelRequest
                          .destination
                      }
                    </p>

                    <p>
                      <strong>Purpose:</strong>{" "}
                      {
                        expense.travelRequest
                          .purpose
                      }
                    </p>
                  </>
                )}

                <h3>Receipt Verification</h3>

                <p>
                  <strong>Submitted Amount:</strong>{" "}
                  ₹{expense.amount}
                </p>

                <p>
                  <strong>OCR Amount:</strong>{" "}
                  {expense.ocrExtractedAmount !==
                    null &&
                  expense.ocrExtractedAmount !==
                    undefined
                    ? `₹${expense.ocrExtractedAmount}`
                    : "Not detected"}
                </p>

                <p>
                  <strong>Amount Match:</strong>{" "}
                  {expense.ocrAmountMismatch
                    ? "MISMATCH"
                    : "MATCH"}
                </p>

                <p>
                  <strong>Policy:</strong>{" "}
                  {expense.policyFlag
                    ? "FLAGGED"
                    : "Within policy"}
                </p>

                {expense.policyMessage && (
                  <p>
                    {expense.policyMessage}
                  </p>
                )}

                {expense.receiptUrl && (
                  <p>
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Receipt
                    </a>
                  </p>
                )}

                <button
                  disabled={
                    processingId === expense._id
                  }
                  onClick={() =>
                    handleReimbursement(
                      expense._id
                    )
                  }
                >
                  {processingId === expense._id
                    ? "Processing..."
                    : "Process Reimbursement"}
                </button>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export default FinanceReimbursements;