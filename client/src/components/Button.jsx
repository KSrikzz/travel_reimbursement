const Button = ({
  children,
  variant = "primary",
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = "",
  ...rest
}) => {
  const classes = [
    "btn",
    `btn--${variant}`,
    loading ? "btn--loading" : "",
    fullWidth ? "btn--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;
