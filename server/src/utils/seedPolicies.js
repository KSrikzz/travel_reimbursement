const dotenv = require("dotenv");
const connectDB = require("../config/database");
const Policy = require("../models/Policy");

dotenv.config();

const policies = [
    {
        category: "HOTEL",
        dailyLimit: 4000,
        description: "Maximum hotel expense per day",
    },
    {
        category: "FOOD",
        dailyLimit: 1000,
        description: "Maximum food expense per day",
    },
    {
        category: "TRANSPORT",
        dailyLimit: 1500,
        description: "Maximum local transport expense per day",
    },
    {
        category: "FLIGHT",
        dailyLimit: 10000,
        description: "Maximum flight expense",
    },
    {
        category: "OTHER",
        dailyLimit: 2000,
        description: "Maximum miscellaneous expense",
    },
];

const seedPolicies = async () => {
    try {
        await connectDB();

        for (const policy of policies) {
            await Policy.findOneAndUpdate(
                { category: policy.category },
                policy,
                {
                    upsert: true,
                    new: true,
                }
            );
        }

        console.log("Policies seeded successfully");

        process.exit(0);
    } catch (error) {
        console.error("Policy seeding failed:", error);
        process.exit(1);
    }
};

seedPolicies();