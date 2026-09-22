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
            amount === undefined ||
            !expenseDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Required expense fields are missing",
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Expense amount must be greater than zero",
            });
        }

        // Find travel request
        const request = await TravelRequest.findById(
            travelRequest
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Travel request not found",
            });
        }

        // Employee can only submit expenses for their own request
        if (
            request.employee.toString() !==
            req.user.userId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You cannot add expenses to another employee's travel request",
            });
        }

        // Expense should only be submitted for approved travel
        if (request.status !== "APPROVED") {
            return res.status(400).json({
                success: false,
                message:
                    "Expenses can only be submitted for approved travel requests",
            });
        }

        // Check policy
        const policyResult = await checkExpensePolicy(
            category,
            amount
        );
        let receiptUrl;
        let ocrText;
        let ocrExtractedAmount;

        if (req.file) {
        const uploadResult = await uploadToCloudinary(
            req.file.buffer
        );
            receiptUrl = uploadResult.secure_url;
            
            ocrText = await extractTextFromImage(req.file.buffer);

            ocrExtractedAmount = extractTotalAmount(ocrText);
        }
        const ocrAmountMismatch = ocrExtractedAmount !== null && Number(amount) !== ocrExtractedAmount;
        const expense = await Expense.create({
            employee: req.user.userId,
            travelRequest,
            category,
            amount,
            expenseDate,
            description,
            receiptUrl,
            ocrText,
            ocrExtractedAmount,
            ocrAmountMismatch,
            policyFlag: policyResult.policyFlag,
            policyMessage: policyResult.policyMessage,
            status: "PENDING",
        });

        res.status(201).json({
            success: true,
            message: "Expense submitted successfully",
            expense,
        });
    } catch (error) {
        console.error("Create expense error:", error);

        res.status(500).json({
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