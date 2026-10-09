import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";
import FormField from "../components/FormField";
import Alert from "../components/Alert";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
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
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__brand" aria-hidden="true">T</div>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">
            Sign in to TravelDesk
          </p>
        </div>

        {error && (
          <Alert type="error" onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <FormField label="Email address" htmlFor="login-email">
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" htmlFor="login-password">
            <input
              id="login-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <div style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border-light)" }}>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginBottom: "var(--space-2)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "var(--font-weight-semibold)" }}>
            Quick Demo Fill
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-2)" }}>
            <button
              type="button"
              className="btn btn--secondary"
              style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--font-size-xs)", minHeight: "2.25rem" }}
              onClick={() => setFormData({ email: "employee@demo.com", password: "employee123" })}
            >
              Employee (Engineering)
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--font-size-xs)", minHeight: "2.25rem" }}
              onClick={() => setFormData({ email: "manager@demo.com", password: "manager123" })}
            >
              Manager (Engineering)
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--font-size-xs)", minHeight: "2.25rem" }}
              onClick={() => setFormData({ email: "sales.manager@demo.com", password: "manager123" })}
            >
              Manager (Sales)
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--font-size-xs)", minHeight: "2.25rem" }}
              onClick={() => setFormData({ email: "finance@demo.com", password: "finance123" })}
            >
              Finance
            </button>
          </div>
        </div>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
