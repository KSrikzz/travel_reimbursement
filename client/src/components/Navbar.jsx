import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav>
      <div>
        <strong>Corporate Travel & Expense</strong>
      </div>
      <div>
        {user && (
          <span>
            {user.name} ({user.role})
          </span>
        )}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;