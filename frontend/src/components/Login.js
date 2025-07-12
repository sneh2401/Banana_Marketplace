import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    userType: "wholesaler",
    phone: "",
    location: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

      // Prepare data based on operation type
      let submitData;

      if (isLogin) {
        // Login: only send email and password
        submitData = {
          email: formData.email,
          password: formData.password,
        };
      } else {
        // Registration: send all required fields
        submitData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          userType: formData.userType,
          phone: formData.phone,
          location: formData.location,
        };
      }

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        submitData
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        onLogin(response.data.user);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "20px",
    },
    card: {
      backgroundColor: "white",
      padding: "40px",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "500px",
    },
    title: {
      fontSize: "32px",
      textAlign: "center",
      marginBottom: "10px",
      color: "#2c3e50",
    },
    subtitle: {
      fontSize: "18px",
      color: "#7f8c8d",
      marginBottom: "30px",
      textAlign: "center",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "15px",
    },
    message: {
      padding: "12px",
      marginBottom: "20px",
      borderRadius: "6px",
      textAlign: "center",
      fontSize: "14px",
    },
    successMessage: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
    },
    errorMessage: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
    },
    toggleText: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "14px",
      color: "#666",
    },
    toggleButton: {
      background: "none",
      border: "none",
      color: "#3498db",
      cursor: "pointer",
      textDecoration: "underline",
      fontSize: "14px",
    },
    testCredentials: {
      marginTop: "20px",
      padding: "15px",
      backgroundColor: "#e8f4f8",
      borderRadius: "6px",
      fontSize: "12px",
      lineHeight: "1.5",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🍌 Banana Marketplace</h1>
        <p style={styles.subtitle}>Connect Farmers with Wholesalers</p>

        {message && (
          <div
            style={{
              ...styles.message,
              ...(message.includes("successful")
                ? styles.successMessage
                : styles.errorMessage),
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div style={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">I am a:</label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="wholesaler">Wholesaler</option>
                    <option value="farmer">Farmer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone (Optional):</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+91-9876543210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location (Optional):</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Kerala, India"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <div style={styles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={styles.toggleButton}
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </div>

        <div style={styles.testCredentials}>
          <strong>🧪 Test Credentials:</strong>
          <br />
          <strong>Farmer:</strong> farmer@example.com / password123
          <br />
          <strong>Wholesaler:</strong> wholesaler@example.com / password123
        </div>
      </div>
    </div>
  );
};

export default Login;
