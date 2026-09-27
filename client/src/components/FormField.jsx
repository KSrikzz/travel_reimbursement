const FormField = ({ label, htmlFor, hint, error, children }) => {
  const classes = ["form-field", error ? "form-field--error" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && (
        <span className="form-field__hint" id={`${htmlFor}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span
          className="form-field__error"
          id={`${htmlFor}-error`}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;
