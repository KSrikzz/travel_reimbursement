const TravelRequest = require("../models/TravelRequest");
const Expense = require("../models/Expense");
const Reimbursement = require("../models/Reimbursement");

const getEmployeeDashboard = async (req, res) => {
    try {
        const employeeId = req.user.userId;

        const [
            totalTravelRequests,
            approvedTrips,
            pendingExpenses,
            reimbursedExpenses,
            reimbursementSummary,
            recentReimbursements,
        ] = await Promise.all([
            TravelRequest.countDocuments({
                employee: employeeId,
            }),

            TravelRequest.countDocuments({
                employee: employeeId,
                status: "APPROVED",
            }),

            Expense.countDocuments({
                employee: employeeId,
                status: "PENDING",
            }),

            Expense.countDocuments({
                employee: employeeId,
                status: "REIMBURSED",
            }),

            Reimbursement.aggregate([
                {
                    $match: {
                        employee: employeeId,
                        status: "COMPLETED",
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$amount",
                        },
                    },
                },
            ]),

            Reimbursement.find({
                employee: employeeId,
            })
                .populate({
                    path: "expense",
                    select:
                        "category amount expenseDate",
                })
                .sort({ createdAt: -1 })
                .limit(5),
        ]);

        const reimbursedAmount =
            reimbursementSummary.length > 0
                ? reimbursementSummary[0].totalAmount
                : 0;

        return res.status(200).json({
            success: true,
            dashboard: {
                totalTravelRequests,
                approvedTrips,
                pendingExpenses,
                reimbursedExpenses,
                reimbursedAmount,
                recentReimbursements,
            },
        });
    } catch (error) {
        console.error(
            "Employee dashboard error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const getManagerDashboard = async (req, res) => {
    try {
        const [
            pendingTravelRequests,
            pendingExpenses,
            approvedExpenses,
            rejectedExpenses,
            reimbursedExpenses,
        ] = await Promise.all([
            TravelRequest.countDocuments({
                status: "PENDING",
            }),

            Expense.countDocuments({
                status: "PENDING",
            }),

            Expense.countDocuments({
                status: "APPROVED",
            }),

            Expense.countDocuments({
                status: "REJECTED",
            }),

            Expense.countDocuments({
                status: "REIMBURSED",
            }),
        ]);

        return res.status(200).json({
            success: true,
            dashboard: {
                pendingTravelRequests,
                pendingExpenses,
                approvedExpenses,
                rejectedExpenses,
                reimbursedExpenses,
            },
        });
    } catch (error) {
        console.error(
            "Manager dashboard error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const getFinanceDashboard = async (req, res) => {
    try {
        const [
            pendingExpenses,
            reimbursedExpenses,
            rejectedExpenses,
            reimbursementSummary,
        ] = await Promise.all([
            Expense.countDocuments({
                status: "PENDING",
            }),

            Expense.countDocuments({
                status: "REIMBURSED",
            }),

            Expense.countDocuments({
                status: "REJECTED",
            }),

            Reimbursement.aggregate([
                {
                    $match: {
                        status: "COMPLETED",
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalReimbursed: {
                            $sum: "$amount",
                        },
                    },
                },
            ]),
        ]);

        const totalReimbursed =
            reimbursementSummary.length > 0
                ? reimbursementSummary[0].totalReimbursed
                : 0;

        return res.status(200).json({
            success: true,
            dashboard: {
                pendingExpenses,
                reimbursedExpenses,
                rejectedExpenses,
                totalReimbursed,
            },
        });
    } catch (error) {
        console.error(
            "Finance dashboard error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = {
    getEmployeeDashboard,
    getManagerDashboard,
    getFinanceDashboard,
};