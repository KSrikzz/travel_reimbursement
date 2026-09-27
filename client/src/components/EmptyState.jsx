import Button from "./Button";

const EmptyState = ({ message, actionLabel, onAction }) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">📋</div>
      <p className="empty-state__message">{message}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
