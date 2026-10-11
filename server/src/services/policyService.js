const mongoose = require("mongoose");
const Policy = require("../models/Policy");
const Expense = require("../models/Expense");
const TravelRequest = require("../models/TravelRequest");

const checkExpensePolicy = async (
    employee,
    category,
    amount,
    expenseDate
) => {
    const policy = await Policy.findOne({
        category,
        isActive: true,
    });

    if (!policy) {
        return {
            policyFlag: false,
            policyMessage:
                "No policy configured for this category",
            policy: null,
        };
    }

    const startOfDay = new Date(expenseDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(expenseDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const employeeId = mongoose.Types.ObjectId.isValid(employee)
        ? new mongoose.Types.ObjectId(employee)
        : employee;

    const existingExpenses =
        await Expense.aggregate([
            {
                $match: {
                    employee: employeeId,
                    category,
                    expenseDate: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                    status: {
                        $ne: "REJECTED",
                    },
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
        ]);

    const existingAmount =
        existingExpenses.length > 0
            ? existingExpenses[0].totalAmount
            : 0;

    const totalDailyAmount =
        existingAmount + amount;

    const exceedsLimit =
        totalDailyAmount > policy.dailyLimit;

    return {
        policyFlag: exceedsLimit,
        policyMessage: exceedsLimit
            ? `Daily ${category} limit exceeded. Limit: ₹${policy.dailyLimit}, Daily Total: ₹${totalDailyAmount}`
            : `Expense is within the ${category} daily limit of ₹${policy.dailyLimit}`,
        policy,
        existingAmount,
        totalDailyAmount,
    };
};

const checkTripBudget = async (travelRequestId, newAmount) => {
    const travelRequest = await TravelRequest.findById(travelRequestId);
    if (!travelRequest) {
        return { budgetExceeded: false, travelRequest: null };
    }

    const trId = mongoose.Types.ObjectId.isValid(travelRequestId)
        ? new mongoose.Types.ObjectId(travelRequestId)
        : travelRequestId;

    const existingExpenses = await Expense.aggregate([
        {
            $match: {
                travelRequest: trId,
                status: { $ne: "REJECTED" },
            },
        },
        {
            $group: {
                _id: null,
                totalSpent: { $sum: "$amount" },
            },
        },
    ]);

    const currentSpent =
        existingExpenses.length > 0 ? existingExpenses[0].totalSpent : 0;
    const totalProjected = currentSpent + newAmount;
    const budgetExceeded = totalProjected > travelRequest.estimatedBudget;

    return {
        budgetExceeded,
        estimatedBudget: travelRequest.estimatedBudget,
        currentSpent,
        totalProjected,
        budgetMessage: budgetExceeded
            ? `Trip budget exceeded! Approved budget: ₹${travelRequest.estimatedBudget}, Total claims with this: ₹${totalProjected}`
            : `Within trip budget (Spent: ₹${totalProjected} of ₹${travelRequest.estimatedBudget})`,
    };
};

module.exports = {
    checkExpensePolicy,
    checkTripBudget,
};