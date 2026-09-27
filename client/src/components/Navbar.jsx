import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const getNavLinks = (role) => {
  switch (role) {
    case "EMPLOYEE":
      return [
        { to: "/dashboard/employee", label: "Dashboard" },
        { to: "/travel-requests", label: "Travel Requests" },
        { to: "/expenses", label: "Expenses" },
        { to: "/my-reimbursements", label: "Reimbursements" },
      ];
    case "MANAGER":
      return [
        { to: "/dashboard/manager", label: "Dashboard" },
        { to: "/manager/travel-requests", label: "Travel Review" },
        { to: "/manager/expenses", label: "Expense Review" },
      ];
    case "FINANCE":
      return [
        { to: "/dashboard/finance", label: "Dashboard" },
        { to: "/finance/reimbursements", label: "Reimbursements" },
      ];
    default:
      return [];
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = user ? getNavLinks(user.role) : [];

  return (
    <header className="navbar">
      <nav className="navbar__inner" aria-label="Main navigation">
        {}
        <Link to="/dashboard" className="navbar__brand">
          <span className="navbar__brand-icon" aria-hidden="true">T</span>
          <span>TravelDesk</span>
        </Link>

        {}
        <div className="navbar__links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__link ${
                location.pathname === link.to ? "navbar__link--active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {}
        <div className="navbar__right">
          {user && (
            <div className="navbar__user">
              <span className="navbar__user-name">{user.name}</span>
              <span className="navbar__user-role">{user.role}</span>
            </div>
          )}
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>

          {}
          <button
            className="navbar__toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {}
      <div
        className={`navbar__mobile-menu ${
          mobileOpen ? "navbar__mobile-menu--open" : ""
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`navbar__link ${
              location.pathname === link.to ? "navbar__link--active" : ""
            }`}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="navbar__mobile-user">
          {user && (
            <span className="text-sm text-secondary">
              {user.name} · {user.role}
            </span>
          )}
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
