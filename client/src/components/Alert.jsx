const ICONS = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const Alert = ({ type = "info", children, onDismiss }) => {
  return (
    <div className={`alert alert--${type}`} role="alert">
      <span className="alert__icon" aria-hidden="true">
        {ICONS[type]}
      </span>
      <div className="alert__content">{children}</div>
      {onDismiss && (
        <button
          className="alert__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
