import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      {user && (
        <>
          <p>Welcome, {user.name}</p>
          <p>Role: {user.role}</p>
        </>
      )}
    </div>
  );
};

export default Dashboard;