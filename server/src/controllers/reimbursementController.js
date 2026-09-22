const Expense = require("../models/Expense");
const Reimbursement = require("../models/Reimbursement");

const {
    generateTransactionId,
} = require("../services/paymentService");

const processReimbursement = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }

        if (expense.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending expenses can be reimbursed",
            });
        }

        const existingReimbursement =
            await Reimbursement.findOne({
                expense: expense._id,
            });

        if (existingReimbursement) {
            return res.status(400).json({
                success: false,
                message:
                    "Reimbursement already exists for this expense",
            });
        }

        const transactionId =
            generateTransactionId();

        const reimbursement =
            await Reimbursement.create({
                expense: expense._id,
                employee: expense.employee,
                amount: expense.amount,
                transactionId,
                status: "COMPLETED",
                processedBy: req.user.userId,
                processedAt: new Date(),
            });

        expense.status = "REIMBURSED";
        expense.reviewedBy = req.user.userId;
        expense.reviewedAt = new Date();

        await expense.save();

        return res.status(200).json({
            success: true,
            message:
                "Expense approved and reimbursement processed successfully",
            expense,
            reimbursement,
        });
    } catch (error) {
        console.error(
            "Process reimbursement error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const getMyReimbursements = async (req, res) => {
    try {
        const reimbursements =
            await Reimbursement.find({
                employee: req.user.userId,
            })
                .populate({
                    path: "expense",
                    select:
                        "category amount expenseDate description",
                })
                .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reimbursements.length,
            reimbursements,
        });
    } catch (error) {
        console.error(
            "Get reimbursements error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = {
    processReimbursement,
    getMyReimbursements,
};