import Button from "./Button";

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden="true">⚠</div>
      <p className="error-state__message">
        {message || "Something went wrong. Please try again."}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
