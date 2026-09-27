const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="loading-state" role="status">
      <div className="loading-state__spinner" aria-hidden="true" />
      <p className="loading-state__text">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingState;
