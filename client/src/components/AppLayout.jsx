import Navbar from "./Navbar";

const AppLayout = ({ children }) => {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="page-container">
        {children}
      </main>
    </>
  );
};

export default AppLayout;
