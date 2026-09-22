const mongoose = require("mongoose");

const reimbursementSchema = new mongoose.Schema(
    {
        expense: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense",
            required: true,
            unique: true,
        },

        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        transactionId: {
            type: String,
            required: true,
            unique: true,
        },

        status: {
            type: String,
            enum: [
                "PROCESSING",
                "COMPLETED",
                "FAILED",
            ],
            default: "PROCESSING",
        },

        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        processedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Reimbursement",
    reimbursementSchema
);