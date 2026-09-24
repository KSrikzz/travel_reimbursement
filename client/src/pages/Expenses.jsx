import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

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
    } catch (error) {
      setError(
        error.response?.data?.message ||
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

      document.getElementById("receipt").value = "";

      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create expense"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading expenses...</p>;
  }

  return (
    <>
      <Navbar />

      <main>
        <h1>My Expenses</h1>

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

        <section>
          <h2>Submit Expense</h2>

          {approvedRequests.length === 0 ? (
            <p>
              You do not have any approved travel requests.
              An approved travel request is required before
              submitting an expense.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div>
                <label>
                  Approved Travel Request
                </label>

                <select
                  name="travelRequest"
                  value={form.travelRequest}
                  onChange={handleChange}
                >
                  <option value="">
                    Select travel request
                  </option>

                  {approvedRequests.map((request) => (
                    <option
                      key={request._id}
                      value={request._id}
                    >
                      {request.destination} -{" "}
                      {new Date(
                        request.startDate
                      ).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>
                  Expense Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="HOTEL">
                    Hotel
                  </option>

                  <option value="FOOD">
                    Food
                  </option>

                  <option value="TRANSPORT">
                    Transport
                  </option>

                  <option value="FLIGHT">
                    Flight
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Example: 1200"
                />
              </div>

              <div>
                <label>
                  Expense Date
                </label>

                <input
                  type="date"
                  name="expenseDate"
                  value={form.expenseDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the expense"
                />
              </div>

              <div>
                <label>
                  Receipt
                </label>

                <input
                  id="receipt"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleReceiptChange}
                />

                <p>
                  JPG, JPEG or PNG. Maximum 5MB.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Expense"}
              </button>
            </form>
          )}
        </section>

        <hr />

        <section>
          <h2>Expense History</h2>

          {expenses.length === 0 ? (
            <p>No expenses submitted yet.</p>
          ) : (
            expenses.map((expense) => (
              <article key={expense._id}>
                <h3>
                  {expense.category}
                </h3>

                <p>
                  <strong>Amount:</strong>{" "}
                  ₹{expense.amount}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    expense.expenseDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {expense.status}
                </p>

                <p>
                  <strong>Policy:</strong>{" "}
                  {expense.policyFlag
                    ? "Flagged"
                    : "Within policy"}
                </p>

                {expense.policyMessage && (
                  <p>
                    <strong>Policy Message:</strong>{" "}
                    {expense.policyMessage}
                  </p>
                )}

                {expense.ocrExtractedAmount !== null &&
                  expense.ocrExtractedAmount !== undefined && (
                    <p>
                      <strong>
                        Receipt Amount:
                      </strong>{" "}
                      ₹{expense.ocrExtractedAmount}
                    </p>
                  )}

                {expense.ocrAmountMismatch && (
                  <p style={{ color: "red" }}>
                    Receipt amount does not match
                    the submitted amount.
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
              </article>
            ))
          )}
        </section>
      </main>
    </>
  );
};

export default Expenses;