import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getMyTravelRequests,
  createTravelRequest,
} from "../api/travelRequestApi";

const TravelRequests = () => {
  const [requests, setRequests] = useState([]);

  const [form, setForm] = useState({
    destination: "",
    purpose: "",
    startDate: "",
    endDate: "",
    estimatedBudget: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyTravelRequests();

      setRequests(data.travelRequests || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load travel requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.destination ||
      !form.purpose ||
      !form.startDate ||
      !form.endDate ||
      !form.estimatedBudget
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (new Date(form.startDate) > new Date(form.endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }

    if (Number(form.estimatedBudget) < 0) {
      setError("Budget cannot be negative.");
      return;
    }

    try {
      setSubmitting(true);

      await createTravelRequest({
        destination: form.destination,
        purpose: form.purpose,
        startDate: form.startDate,
        endDate: form.endDate,
        estimatedBudget: Number(form.estimatedBudget),
      });

      setForm({
        destination: "",
        purpose: "",
        startDate: "",
        endDate: "",
        estimatedBudget: "",
      });

      setSuccess("Travel request created successfully.");

      await loadRequests();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to create travel request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-approved";

      case "REJECTED":
        return "status-rejected";

      case "PENDING":
        return "status-pending";

      default:
        return "";
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Travel Requests</h1>
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
          <h2>Create Travel Request</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Destination</label>
              <input
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="Example: Bangalore"
              />
            </div>
            <div>
              <label>Purpose</label>
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="Explain the purpose of the trip"
              />
            </div>
            <div>
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Estimated Budget</label>
              <input
                type="number"
                name="estimatedBudget"
                value={form.estimatedBudget}
                onChange={handleChange}
                placeholder="Example: 15000"
                min="0"
              />
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </section>
        <hr />
        <section>
          <h2>My Travel Requests</h2>
          {loading ? (
            <p>Loading travel requests...</p>
          ) : requests.length === 0 ? (
            <p>No travel requests found.</p>
          ) : (
            <div>
              {requests.map((request) => (
                <article key={request._id}>
                  <h3>{request.destination}</h3>

                  <p>
                    <strong>Purpose:</strong>{" "}
                    {request.purpose}
                  </p>

                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(request.startDate).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>End:</strong>{" "}
                    {new Date(request.endDate).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>Estimated Budget:</strong>{" "}
                    ₹{request.estimatedBudget}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={getStatusClass(request.status)}>
                      {request.status}
                    </span>
                  </p>

                  {request.managerComment && (
                    <p>
                      <strong>Manager Comment:</strong>{" "}
                      {request.managerComment}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default TravelRequests;