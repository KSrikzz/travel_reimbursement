import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyReimbursements } from "../api/reimbursementApi";

const MyReimbursements = () => {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReimbursements = async () => {
      try {
        const data = await getMyReimbursements();
        setReimbursements(data.reimbursements || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load reimbursement history"
        );
      } finally {
        setLoading(false);
      }
    };

    loadReimbursements();
  }, []);

  if (loading) {
    return <p>Loading reimbursement history...</p>;
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main>
          <h1>My Reimbursements</h1>
          <p>{error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main>
        <h1>My Reimbursements</h1>

        {reimbursements.length === 0 ? (
          <p>No reimbursements found.</p>
        ) : (
          <section>
            {reimbursements.map((reimbursement) => (
              <div key={reimbursement._id}>
                <h3>
                  {reimbursement.expense?.category || "Expense"}
                </h3>

                <p>
                  <strong>Amount:</strong> ₹
                  {reimbursement.amount}
                </p>

                <p>
                  <strong>Expense Date:</strong>{" "}
                  {reimbursement.expense?.expenseDate
                    ? new Date(
                        reimbursement.expense.expenseDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {reimbursement.expense?.description || "N/A"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {reimbursement.status}
                </p>

                <p>
                  <strong>Transaction ID:</strong>{" "}
                  {reimbursement.transactionId}
                </p>

                <p>
                  <strong>Processed At:</strong>{" "}
                  {reimbursement.processedAt
                    ? new Date(
                        reimbursement.processedAt
                      ).toLocaleString()
                    : "N/A"}
                </p>

                {reimbursement.expense?.receiptUrl && (
                  <a
                    href={reimbursement.expense.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Receipt
                  </a>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export default MyReimbursements;