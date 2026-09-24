import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import {
  getPendingExpenses,
  updateExpenseStatus,
} from "../api/managerExpenseApi";

const ManagerExpenses = () => {
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPendingExpenses();

      setExpenses(data.expenses || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load pending expenses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleStatusUpdate = async (
    expenseId,
    status
  ) => {
    const action =
      status === "APPROVED"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this expense?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(expenseId);
      setError("");

      await updateExpenseStatus(
        expenseId,
        status
      );

      setExpenses((previousExpenses) =>
        previousExpenses.filter(
          (expense) => expense._id !== expenseId
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update expense"
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <p>Loading expenses...</p>;
  }

  return (
    <>
      <Navbar />

      <main>
        <h1>Expense Review</h1>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {expenses.length === 0 ? (
          <p>No pending expenses.</p>
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

                <hr />

                <h3>Policy Check</h3>

                <p>
                  <strong>Status:</strong>{" "}
                  {expense.policyFlag
                    ? "FLAGGED"
                    : "Within policy"}
                </p>

                {expense.policyMessage && (
                  <p>
                    {expense.policyMessage}
                  </p>
                )}

                <h3>OCR Check</h3>

                <p>
                  <strong>Receipt Amount:</strong>{" "}
                  {expense.ocrExtractedAmount !== null &&
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

                {expense.ocrAmountMismatch && (
                  <p style={{ color: "red" }}>
                    Submitted amount does not match
                    the amount detected from the
                    receipt.
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

                <hr />

                <button
                  disabled={
                    processingId === expense._id
                  }
                  onClick={() =>
                    handleStatusUpdate(
                      expense._id,
                      "APPROVED"
                    )
                  }
                >
                  Approve Expense
                </button>

                <button
                  disabled={
                    processingId === expense._id
                  }
                  onClick={() =>
                    handleStatusUpdate(
                      expense._id,
                      "REJECTED"
                    )
                  }
                >
                  Reject Expense
                </button>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export default ManagerExpenses;