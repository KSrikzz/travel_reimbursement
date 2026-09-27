const STATUS_MAP = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REIMBURSED: "reimbursed",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

const StatusBadge = ({ status }) => {
  const key = STATUS_MAP[status] || "pending";

  return (
    <span className={`badge badge--${key}`}>
      <span className="badge__dot" aria-hidden="true" />
      {status}
    </span>
  );
};

export default StatusBadge;
