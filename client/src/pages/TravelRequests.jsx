import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import {
  getMyTravelRequests,
  createTravelRequest,
} from "../api/travelRequestApi";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import FormField from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

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

  return (
    <AppLayout>
      <PageHeader
        title="Travel Requests"
        subtitle="Submit a new travel request or check the status of previous ones."
      />

      {}
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

      {}
      <Card className="dashboard-section">
        <h2 style={{ marginBottom: "var(--space-4)" }}>
          Create Travel Request
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormField label="Destination" htmlFor="tr-destination">
              <input
                id="tr-destination"
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="e.g. Bangalore"
              />
            </FormField>

            <FormField label="Estimated Budget (₹)" htmlFor="tr-budget">
              <input
                id="tr-budget"
                type="number"
                name="estimatedBudget"
                value={form.estimatedBudget}
                onChange={handleChange}
                placeholder="e.g. 15000"
                min="0"
              />
            </FormField>

            <FormField label="Start Date" htmlFor="tr-start">
              <input
                id="tr-start"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="End Date" htmlFor="tr-end">
              <input
                id="tr-end"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
            </FormField>

            <div className="form-grid--full">
              <FormField label="Purpose" htmlFor="tr-purpose">
                <textarea
                  id="tr-purpose"
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="Describe the purpose of the trip"
                />
              </FormField>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-4)" }}>
            <Button type="submit" variant="primary" loading={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </Card>

      {}
      <div className="dashboard-section">
        <h2 className="dashboard-section__title">My Travel Requests</h2>

        {loading ? (
          <LoadingState message="Loading travel requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            message="You haven't submitted any travel requests yet. Use the form above to create one."
          />
        ) : (
          <div className="request-list">
            {requests.map((request) => (
              <Card key={request._id}>
                <div className="request-card__header">
                  <h3 className="request-card__title">
                    {request.destination}
                  </h3>
                  <StatusBadge status={request.status} />
                </div>

                <div className="request-card__details">
                  <div className="data-row">
                    <span className="data-row__label">Purpose</span>
                    <span className="data-row__value">{request.purpose}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-row__label">Budget</span>
                    <span className="data-row__value">₹{request.estimatedBudget}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-row__label">Start Date</span>
                    <span className="data-row__value">
                      {new Date(request.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="data-row">
                    <span className="data-row__label">End Date</span>
                    <span className="data-row__value">
                      {new Date(request.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {request.managerComment && (
                  <div className="request-card__comment">
                    <div className="request-card__comment-label">
                      Manager Comment
                    </div>
                    {request.managerComment}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TravelRequests;
