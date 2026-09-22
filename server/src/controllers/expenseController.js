const Expense = require("../models/Expense");
const TravelRequest = require("../models/TravelRequest");
const {
    checkExpensePolicy,
} = require("../services/policyService");
const {
    uploadToCloudinary,
} = require("../services/cloudinaryService");
const {
    extractTextFromImage,
} = require("../services/ocrService");

const {
    extractTotalAmount,
} = require("../services/receiptParser");

const createExpense = async (req, res) => {
    try {
        const {
            travelRequest,
            category,
            amount,
            expenseDate,
            description,
        } = req.body;

        if (
            !travelRequest ||
            !category ||
            !amount ||
            !expenseDate
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Travel request, category, amount and expense date are required",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0",
            });
        }

        const request = await TravelRequest.findById(
            travelRequest
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Travel request not found",
            });
        }

        if (
            request.employee.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only create expenses for your own travel requests",
            });
        }

        if (request.status !== "APPROVED") {
            return res.status(400).json({
                success: false,
                message:
                    "Expense can only be created for an approved travel request",
            });
        }

        // Policy check
        const policyResult =
            await checkExpensePolicy(
                req.user.userId,
                category,
                Number(amount),
                expenseDate
            );

        // Extract policy result
        const {
            policyFlag,
            policyMessage,
        } = policyResult;

        // Receipt upload + OCR
        let receiptUrl;
        let ocrText;
        let ocrExtractedAmount;

        if (req.file) {
            const uploadResult =
                await uploadToCloudinary(
                    req.file.buffer
                );

            receiptUrl =
                uploadResult.secure_url;

            ocrText =
                await extractTextFromImage(
                    req.file.buffer
                );

            ocrExtractedAmount =
                extractTotalAmount(ocrText);
        }

        // OCR amount mismatch
        const ocrAmountMismatch =
            ocrExtractedAmount !== null &&
            Number(amount) !==
                ocrExtractedAmount;

        const expense = await Expense.create({
            employee: req.user.userId,
            travelRequest,
            category,
            amount: Number(amount),
            expenseDate,
            description,
            receiptUrl,
            ocrText,
            ocrExtractedAmount,
            ocrAmountMismatch,
            policyFlag,
            policyMessage,
            status: "PENDING",
        });

        return res.status(201).json({
            success: true,
            message: "Expense created successfully",
            expense,
        });
    } catch (error) {
        console.error(
            "Create expense error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getMyExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({
            employee: req.user.userId,
        })
            .populate(
                "travelRequest",
                "destination startDate endDate status"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            expenses,
        });
    } catch (error) {
        console.error("Get expenses error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const getPendingExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({
            status: "PENDING",
        })
            .populate(
                "employee",
                "name email department"
            )
            .populate(
                "travelRequest",
                "destination purpose"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            expenses,
        });
    } catch (error) {
        console.error("Get pending expenses error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be APPROVED or REJECTED",
            });
        }

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
                    "Only pending expenses can be reviewed",
            });
        }

        expense.status = status;
        expense.reviewedBy = req.user.userId;
        expense.reviewedAt = new Date();

        await expense.save();

        res.status(200).json({
            success: true,
            message: `Expense ${status.toLowerCase()} successfully`,
            expense,
        });
    } catch (error) {
        console.error("Update expense status error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
module.exports = {
    createExpense,
    getMyExpenses,
    getPendingExpenses,
    updateExpenseStatus,
};