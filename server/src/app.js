const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

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

module.exports = app;