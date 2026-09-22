const Policy = require("../models/Policy");

const checkExpensePolicy = async (category, amount) => {
    const policy = await Policy.findOne({
        category,
        isActive: true,
    });

    if (!policy) {
        return {
            policyFlag: false,
            policyMessage: "No policy configured for this category",
            policy: null,
        };
    }

    const exceedsLimit = amount > policy.dailyLimit;

    return {
        policyFlag: exceedsLimit,
        policyMessage: exceedsLimit
            ? `Expense exceeds the ${category} limit of ₹${policy.dailyLimit}`
            : `Expense is within the ${category} limit of ₹${policy.dailyLimit}`,
        policy,
    };
};

module.exports = {
    checkExpensePolicy,
};