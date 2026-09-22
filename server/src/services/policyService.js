const Policy = require("../models/Policy");
const Expense = require("../models/Expense");

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
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(expenseDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingExpenses =
        await Expense.aggregate([
            {
                $match: {
                    employee,
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
            ? `Daily ${category} limit exceeded. Limit: ₹${policy.dailyLimit}, Total: ₹${totalDailyAmount}`
            : `Expense is within the ${category} daily limit of ₹${policy.dailyLimit}`,
        policy,
        existingAmount,
        totalDailyAmount,
    };
};

module.exports = {
    checkExpensePolicy,
};