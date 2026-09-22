const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/database");
const User = require("../models/User");

dotenv.config();

const seedUsers = async () => {
    try {
        await connectDB();

        const users = [
            {
                name: "Demo Employee",
                email: "employee@demo.com",
                password: "employee123",
                role: "EMPLOYEE",
                department: "Engineering",
            },
            {
                name: "Demo Manager",
                email: "manager@demo.com",
                password: "manager123",
                role: "MANAGER",
                department: "Engineering",
            },
            {
                name: "Demo Finance",
                email: "finance@demo.com",
                password: "finance123",
                role: "FINANCE",
                department: "Finance",
            },
        ];

        for (const userData of users) {
            const existingUser = await User.findOne({
                email: userData.email,
            });

            if (existingUser) {
                console.log(
                    `${userData.email} already exists`
                );
                continue;
            }

            const hashedPassword = await bcrypt.hash(
                userData.password,
                10
            );

            await User.create({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                department: userData.department,
            });

            console.log(
                `Created ${userData.role}: ${userData.email}`
            );
        }

        console.log("Demo users seeded successfully");

        process.exit(0);
    } catch (error) {
        console.error(
            "Failed to seed users:",
            error.message
        );

        process.exit(1);
    }
};

seedUsers();