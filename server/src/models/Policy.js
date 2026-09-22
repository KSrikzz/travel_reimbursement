const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
    {
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
            unique: true,
        },

        dailyLimit: {
            type: Number,
            required: true,
            min: 0,
        },

        description: {
            type: String,
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Policy", policySchema);