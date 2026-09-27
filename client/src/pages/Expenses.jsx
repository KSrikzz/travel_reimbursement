import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import FormField from "../components/FormField";
import FileUpload from "../components/FileUpload";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

import {
  getMyExpenses,
  createExpense,
} from "../api/expenseApi";

import { getMyTravelRequests } from "../api/travelRequestApi";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [travelRequests, setTravelRequests] = useState([]);

  const [form, setForm] = useState({
    travelRequest: "",
    category: "",
    amount: "",
    expenseDate: "",
    description: "",
  });

  const [receipt, setReceipt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [expenseData, travelData] = await Promise.all([
        getMyExpenses(),
        getMyTravelRequests(),
      ]);

      setExpenses(expenseData.expenses || []);
      setTravelRequests(travelData.travelRequests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load expense data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approvedRequests = travelRequests.filter(
    (request) => request.status === "APPROVED"
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleReceiptChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setReceipt(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, JPEG and PNG receipt images are allowed."
      );

      event.target.value = "";
      setReceipt(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Receipt image must be less than 5MB.");

      event.target.value = "";
      setReceipt(null);
      return;
    }

    setError("");
    setReceipt(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.travelRequest) {
      setError("Please select an approved travel request.");
      return;
    }

    if (!form.category) {
      setError("Please select an expense category.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (!form.expenseDate) {
      setError("Please select the expense date.");
      return;
    }

    if (!receipt) {
      setError("Please upload a receipt.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append(
        "travelRequest",
        form.travelRequest
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "amount",
        form.amount
      );

      formData.append(
        "expenseDate",
        form.expenseDate
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "receipt",
        receipt
      );

      const data = await createExpense(formData);

      setSuccess(
        data.message || "Expense submitted successfully."
      );

      setForm({
        travelRequest: "",
        category: "",
        amount: "",
        expenseDate: "",
        description: "",
      });

      setReceipt(null);

      const receiptInput = document.getElementById("receipt");
      if (receiptInput) {
        receiptInput.value = "";
      }

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create expense"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading expenses..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="My Expenses"
        subtitle="Submit expense claims with receipt OCR verification and track status"
      />

      {error && (
        <Alert
          type="error"
          onDismiss={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          type="success"
          onDismiss={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {}
      <Card className="form-card" style={{ marginBottom: "var(--space-8)" }}>
        <h2 className="form-card__title">Submit New Expense</h2>
        <p className="form-card__description">
          Expenses must be linked to an approved travel request and include a readable receipt image.
        </p>

        {approvedRequests.length === 0 ? (
          <Alert type="warning">
            You do not have any approved travel requests. An approved travel request is required before submitting an expense.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <FormField
                label="Approved Travel Request"
                htmlFor="travelRequest"
                hint="Only trips with APPROVED status are eligible"
              >
                <select
                  id="travelRequest"
                  name="travelRequest"
                  value={form.travelRequest}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select travel request</option>
                  {approvedRequests.map((request) => (
                    <option key={request._id} value={request._id}>
                      {request.destination} — {new Date(request.startDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Expense Category"
                htmlFor="category"
              >
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="FOOD">Food</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="FLIGHT">Flight</option>
                  <option value="OTHER">Other</option>
                </select>
              </FormField>

              <FormField
                label="Amount (₹)"
                htmlFor="amount"
              >
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1200"
                  required
                />
              </FormField>

              <FormField
                label="Expense Date"
                htmlFor="expenseDate"
              >
                <input
                  id="expenseDate"
                  type="date"
                  name="expenseDate"
                  value={form.expenseDate}
                  onChange={handleChange}
                  required
                />
              </FormField>

              <div className="form-grid--full">
                <FormField
                  label="Description"
                  htmlFor="description"
                  hint="Provide brief context for this business expense"
                >
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the purpose of this expense"
                    rows={3}
                  />
                </FormField>
              </div>

              <div className="form-grid--full">
                <FormField
                  label="Receipt Image"
                  htmlFor="receipt"
                  hint="JPG, JPEG or PNG up to 5MB. Clear receipts improve automatic OCR amount verification."
                >
                  <FileUpload
                    id="receipt"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleReceiptChange}
                    fileName={receipt ? receipt.name : ""}
                    hint="Receipt will be automatically scanned by OCR upon submission"
                  />
                </FormField>
              </div>
            </div>

            <div style={{ marginTop: "var(--space-6)" }}>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
              >
                {submitting ? "Submitting Expense..." : "Submit Expense"}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {}
      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Expense History</h2>

        {expenses.length === 0 ? (
          <EmptyState message="No expenses submitted yet. Once you submit an expense against an approved trip, it will appear here." />
        ) : (
          <div className="request-list">
            {expenses.map((expense) => (
              <Card key={expense._id}>
                <div className="expense-card__header">
                  <div>
                    <span className="badge badge--neutral" style={{ marginRight: "var(--space-2)" }}>
                      {expense.category}
                    </span>
                    <span className="expense-card__amount">₹{expense.amount}</span>
                  </div>
                  <StatusBadge status={expense.status} />
                </div>

                <div className="expense-card__meta">
                  <div>
                    <span className="data-label">Expense Date</span>
                    <span className="data-value">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="data-label">Policy Status</span>
                    <span className="data-value">
                      {expense.policyFlag ? (
                        <span style={{ color: "var(--danger)", fontWeight: "var(--font-weight-medium)" }}>
                          ⚠️ Flagged
                        </span>
                      ) : (
                        <span style={{ color: "var(--success)", fontWeight: "var(--font-weight-medium)" }}>
                          ✓ Within policy
                        </span>
                      )}
                    </span>
                  </div>

                  {expense.description && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <span className="data-label">Description</span>
                      <span className="data-value">{expense.description}</span>
                    </div>
                  )}

                  {expense.policyMessage && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div className="request-card__comment" style={{ borderColor: "var(--warning)" }}>
                        <div className="request-card__comment-label" style={{ color: "var(--warning)" }}>
                          Policy Note
                        </div>
                        <div>{expense.policyMessage}</div>
                      </div>
                    </div>
                  )}
                </div>

                {}
                <div className="verification-section">
                  <div className="verification-section__title">Verification & Receipt</div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {expense.ocrExtractedAmount !== null &&
                      expense.ocrExtractedAmount !== undefined && (
                        <div className="verification-item">
                          <span className="data-label" style={{ minWidth: "8rem" }}>OCR Detected</span>
                          <span className="data-value">₹{expense.ocrExtractedAmount}</span>
                        </div>
                      )}

                    {expense.ocrAmountMismatch && (
                      <div className="verification-item" style={{ color: "var(--danger)" }}>
                        <span className="verification-item__icon">⚠️</span>
                        <span>Receipt amount does not match the submitted amount.</span>
                      </div>
                    )}

                    {expense.receiptUrl && (
                      <div style={{ marginTop: "var(--space-2)" }}>
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn--secondary"
                          style={{ display: "inline-flex" }}
                        >
                          View Receipt ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
};

export default Expenses;
