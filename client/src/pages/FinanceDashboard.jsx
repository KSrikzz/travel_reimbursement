import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const FinanceDashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <h1>Finance Dashboard</h1>
        <p>Welcome, {user?.name}</p>
        <p>Role: {user?.role}</p>
      </main>
    </>
  );
};

export default FinanceDashboard;