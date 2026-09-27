const FileUpload = ({ id, accept, onChange, fileName, hint }) => {
  return (
    <div className="file-upload" tabIndex={-1}>
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={onChange}
        className="file-upload__input"
        aria-label="Upload receipt file"
      />
      <div className="file-upload__icon" aria-hidden="true">📎</div>
      {fileName ? (
        <div className="file-upload__selected">
          <span aria-hidden="true">✓</span>
          <span>{fileName}</span>
        </div>
      ) : (
        <p className="file-upload__text">
          <strong>Click to upload</strong> or drag and drop
        </p>
      )}
      {hint && <p className="file-upload__hint">{hint}</p>}
    </div>
  );
};

export default FileUpload;
