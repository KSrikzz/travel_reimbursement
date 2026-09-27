import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/authApi";
import Card from "../components/Card";
import Button from "../components/Button";
import FormField from "../components/FormField";
import Alert from "../components/Alert";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await registerUser(formData);
      setMessage(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__brand" aria-hidden="true">T</div>
          <h1 className="auth-card__title">Create Account</h1>
          <p className="auth-card__subtitle">
            Join TravelDesk to manage your business travel
          </p>
        </div>

        {error && (
          <Alert type="error" onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}
        {message && <Alert type="success">{message}</Alert>}

        <form onSubmit={handleSubmit} className="auth-form">
          <FormField label="Full Name" htmlFor="register-name">
            <input
              id="register-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
          </FormField>

          <FormField label="Email Address" htmlFor="register-email">
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" htmlFor="register-password">
            <input
              id="register-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
            />
          </FormField>

          <FormField label="Department" htmlFor="register-department">
            <input
              id="register-department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Engineering, Sales, HR"
              required
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
