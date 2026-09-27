import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import {
  getPendingTravelRequests,
  updateTravelRequestStatus,
} from "../api/managerTravelApi";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Modal from "../components/Modal";
import FormField from "../components/FormField";

const ManagerTravelRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [comment, setComment] = useState("");

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

  const openModal = (requestId, status) => {
    setModalAction({ requestId, status });
    setComment("");
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!modalAction) return;

    const { requestId, status } = modalAction;

    try {
      setProcessingId(requestId);
      setError("");
      setSuccessMsg("");
      setModalOpen(false);

      await updateTravelRequestStatus(
        requestId,
        status,
        comment
      );

      setRequests((previousRequests) =>
        previousRequests.filter(
          (request) => request._id !== requestId
        )
      );

      setSuccessMsg(
        `Travel request ${status.toLowerCase()} successfully.`
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update travel request"
      );
    } finally {
      setProcessingId(null);
      setModalAction(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Travel Request Review" />
        <LoadingState message="Loading pending requests..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Travel Request Review"
        subtitle="Approve or reject employee travel requests. Add a comment to provide feedback."
      />

      {error && (
        <Alert type="error" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert type="success" onDismiss={() => setSuccessMsg("")}>
          {successMsg}
        </Alert>
      )}

      {requests.length === 0 ? (
        <EmptyState
          message="No pending travel requests to review. All caught up!"
        />
      ) : (
        <div className="request-list">
          {requests.map((request) => (
            <Card key={request._id}>
              <div className="request-card__header">
                <h2 className="request-card__title">
                  {request.destination}
                </h2>
                <StatusBadge status={request.status} />
              </div>

              <div className="request-card__details">
                <div className="data-row">
                  <span className="data-row__label">Employee</span>
                  <span className="data-row__value">{request.employee?.name}</span>
                </div>
                <div className="data-row">
                  <span className="data-row__label">Email</span>
                  <span className="data-row__value">{request.employee?.email}</span>
                </div>
                <div className="data-row">
                  <span className="data-row__label">Department</span>
                  <span className="data-row__value">{request.employee?.department}</span>
                </div>
                <div className="data-row">
                  <span className="data-row__label">Purpose</span>
                  <span className="data-row__value">{request.purpose}</span>
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
                <div className="data-row">
                  <span className="data-row__label">Budget</span>
                  <span className="data-row__value">₹{request.estimatedBudget}</span>
                </div>
              </div>

              <div className="action-bar" style={{ marginTop: "var(--space-4)" }}>
                <Button
                  variant="primary"
                  disabled={processingId === request._id}
                  loading={processingId === request._id}
                  onClick={() => openModal(request._id, "APPROVED")}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  disabled={processingId === request._id}
                  onClick={() => openModal(request._id, "REJECTED")}
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalAction?.status === "APPROVED"
            ? "Approve Travel Request"
            : "Reject Travel Request"
        }
      >
        <div className="modal__body">
          <FormField
            label="Comment (optional)"
            htmlFor="manager-comment"
          >
            <textarea
              id="manager-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment for the employee..."
              rows={3}
            />
          </FormField>
        </div>
        <div className="modal__footer">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={modalAction?.status === "APPROVED" ? "primary" : "danger"}
            onClick={handleConfirm}
          >
            {modalAction?.status === "APPROVED" ? "Approve" : "Reject"}
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default ManagerTravelRequests;
