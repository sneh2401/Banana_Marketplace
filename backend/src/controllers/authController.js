const jwt = require("jsonwebtoken");
const Joi = require("joi");
const db = require("../config/database");
// Remove bcrypt import - no longer needed

// Validation schemas (same as before)
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(100).required(),
  userType: Joi.string().valid("farmer", "wholesaler").required(),
  phone: Joi.string()
    .pattern(/^[+]?[0-9\-\s]+$/)
    .optional(),
  location: Joi.string().max(255).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

class AuthController {
  async register(req, res) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { email, password, name, userType, phone, location } = value;

      // Check if user already exists
      const [existingUsers] = await db.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Store password as plain text (NO HASHING)
      const plainTextPassword = password;

      // Create user with plain text password
      const [result] = await db.execute(
        "INSERT INTO users (email, password, name, user_type, phone, location) VALUES (?, ?, ?, ?, ?, ?)",
        [
          email,
          plainTextPassword,
          name,
          userType,
          phone || null,
          location || null,
        ]
      );

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: result.insertId,
          email,
          name,
          userType,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRY || "24h" }
      );

      res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: result.insertId,
          email,
          name,
          userType,
          phone: phone || null,
          location: location || null,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed. Please try again.",
      });
    }
  }

  async login(req, res) {
    try {
      console.log("🔍 LOGIN ATTEMPT:", req.body);

      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        console.log("❌ VALIDATION ERROR:", error.details[0].message);
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { email, password } = value;
      console.log("📧 Looking for user:", email);

      // Find user
      const [users] = await db.execute(
        "SELECT id, email, password, name, user_type, phone, location FROM users WHERE email = ?",
        [email]
      );

      console.log("👥 Users found:", users.length);

      if (users.length === 0) {
        console.log("❌ NO USER FOUND");
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const user = users[0];
      console.log("👤 User found:", user.email, user.name);

      // Plain text password comparison (NO BCRYPT)
      const isPasswordValid = password === user.password;
      console.log("🔐 Password comparison (plain text):", isPasswordValid);
      console.log("   Input password:", password);
      console.log("   Stored password:", user.password);

      if (!isPasswordValid) {
        console.log("❌ PASSWORD MISMATCH");
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      console.log("✅ LOGIN SUCCESS");

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          userType: user.user_type,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRY || "24h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.user_type,
          phone: user.phone,
          location: user.location,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed. Please try again.",
      });
    }
  }

  async getProfile(req, res) {
    try {
      const [users] = await db.execute(
        "SELECT id, email, name, user_type, phone, location, created_at FROM users WHERE id = ?",
        [req.user.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        user: users[0],
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  }

  async logout(req, res) {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
}

module.exports = new AuthController();
