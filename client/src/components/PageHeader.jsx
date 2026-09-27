const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="page-header">
      <div className="page-header__top">
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle && (
            <p className="page-header__subtitle">{subtitle}</p>
          )}
        </div>
        {actions && <div className="action-bar">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
