import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const ManagerDashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <h1>Manager Dashboard</h1>
        <p>Welcome, {user?.name}</p>
        <p>Role: {user?.role}</p>
      </main>
    </>
  );
};

export default ManagerDashboard;