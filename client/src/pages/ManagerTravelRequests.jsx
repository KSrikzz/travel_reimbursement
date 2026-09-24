import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getPendingTravelRequests, updateTravelRequestStatus, } from "../api/managerTravelApi";

const ManagerTravelRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPendingTravelRequests();

      setRequests(data.travelRequests || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load pending travel requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusUpdate = async (requestId, status) => {
    const managerComment = window.prompt(
      `Enter a comment for ${status}:`
    );

    if (managerComment === null) {
      return;
    }

    try {
      setProcessingId(requestId);
      setError("");

      await updateTravelRequestStatus(
        requestId,
        status,
        managerComment
      );

      setRequests((previousRequests) =>
        previousRequests.filter(
          (request) => request._id !== requestId
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update travel request"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <main>
        <h1>Pending Travel Requests</h1>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p>No pending travel requests.</p>
        ) : (
          <section>
            {requests.map((request) => (
              <article key={request._id}>
                <h2>{request.destination}</h2>

                <p>
                  <strong>Employee:</strong>{" "}
                  {request.employee?.name}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {request.employee?.email}
                </p>

                <p>
                  <strong>Department:</strong>{" "}
                  {request.employee?.department}
                </p>

                <p>
                  <strong>Purpose:</strong>{" "}
                  {request.purpose}
                </p>

                <p>
                  <strong>Start Date:</strong>{" "}
                  {new Date(
                    request.startDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>End Date:</strong>{" "}
                  {new Date(
                    request.endDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>Estimated Budget:</strong>{" "}
                  ₹{request.estimatedBudget}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {request.status}
                </p>

                <button
                  disabled={processingId === request._id}
                  onClick={() =>
                    handleStatusUpdate(
                      request._id,
                      "APPROVED"
                    )
                  }
                >
                  Approve
                </button>

                <button
                  disabled={processingId === request._id}
                  onClick={() =>
                    handleStatusUpdate(
                      request._id,
                      "REJECTED"
                    )
                  }
                >
                  Reject
                </button>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export default ManagerTravelRequests;