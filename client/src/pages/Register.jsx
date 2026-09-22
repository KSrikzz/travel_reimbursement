import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

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

    try {
      const data = await registerUser(formData);
      setMessage(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          required
        />

        {error && <p>{error}</p>}
        {message && <p>{message}</p>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;