const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        travelRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TravelRequest",
            required: true,
        },

        category: {
            type: String,
            enum: [
                "HOTEL",
                "FOOD",
                "TRANSPORT",
                "FLIGHT",
                "OTHER",
            ],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        expenseDate: {
            type: Date,
            required: true,
        },

        description: {
            type: String,
            trim: true,
        },

        receiptUrl: {
            type: String,
        },

        ocrText: {
            type: String,
        },

        ocrExtractedAmount: {
            type: Number,
        },

        ocrAmountMismatch: {
            type: Boolean,
            default: false,
        },

        policyFlag: {
            type: Boolean,
            default: false,
        },

        policyMessage: {
            type: String,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "REIMBURSED",
            ],
            default: "PENDING",
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

module.exports = mongoose.model("Expense", expenseSchema);