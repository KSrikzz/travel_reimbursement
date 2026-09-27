const StatCard = ({ label, value, helperText, variant = "" }) => {
  const classes = [
    "stat-card",
    variant ? `stat-card--${variant}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {helperText && (
        <span className="stat-card__helper">{helperText}</span>
      )}
    </div>
  );
};

export default StatCard;
