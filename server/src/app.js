const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const travelRequestRoutes = require("./routes/travelRequestRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Request logging
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Travel & Expense API is running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/travel-requests",travelRequestRoutes);
app.use("/api/expenses",expenseRoutes);

module.exports = app;