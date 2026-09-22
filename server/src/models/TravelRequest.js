const mongoose = require("mongoose");

const travelRequestSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        destination: {
            type: String,
            required: true,
            trim: true,
        },

        purpose: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        estimatedBudget: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
        },

        managerComment: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "TravelRequest",
    travelRequestSchema
);