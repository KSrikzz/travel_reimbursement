const crypto = require("crypto");
const Expense = require("../models/Expense");
const TravelRequest = require("../models/TravelRequest");
const {
    checkExpensePolicy,
    checkTripBudget,
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

        const parsedAmount = Number(amount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a valid number greater than 0",
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

        // Validate expenseDate is within trip dates
        const expDate = new Date(expenseDate);
        if (Number.isNaN(expDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid expense date",
            });
        }

        const tripStart = new Date(request.startDate);
        tripStart.setUTCHours(0, 0, 0, 0);
        const tripEnd = new Date(request.endDate);
        tripEnd.setUTCHours(23, 59, 59, 999);

        if (expDate < tripStart || expDate > tripEnd) {
            return res.status(400).json({
                success: false,
                message: `Expense date must be within trip dates (${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()})`,
            });
        }

        // Check duplicate receipt hash
        let receiptHash = null;
        if (req.file) {
            receiptHash = crypto
                .createHash("sha256")
                .update(req.file.buffer)
                .digest("hex");

            const duplicateReceipt = await Expense.findOne({
                receiptHash,
                status: { $ne: "REJECTED" },
            });

            if (duplicateReceipt) {
                return res.status(400).json({
                    success: false,
                    message: "This receipt has already been submitted for another active expense claim.",
                });
            }
        }

        // Daily policy limit check
        const policyResult = await checkExpensePolicy(
            req.user.userId,
            category,
            parsedAmount,
            expenseDate
        );

        // Trip total budget check
        const budgetResult = await checkTripBudget(
            travelRequest,
            parsedAmount
        );

        let policyFlag = policyResult.policyFlag || budgetResult.budgetExceeded;
        let policyMessages = [];
        if (policyResult.policyFlag) {
            policyMessages.push(policyResult.policyMessage);
        }
        if (budgetResult.budgetExceeded) {
            policyMessages.push(budgetResult.budgetMessage);
        }
        if (policyMessages.length === 0) {
            policyMessages.push(policyResult.policyMessage);
        }
        const policyMessage = policyMessages.join(" | ");

        // Receipt upload + OCR
        let receiptUrl;
        let ocrText;
        let ocrExtractedAmount;

        if (req.file) {
            const uploadResult = await uploadToCloudinary(
                req.file.buffer
            );

            receiptUrl = uploadResult.secure_url;

            try {
                ocrText = await extractTextFromImage(
                    req.file.buffer
                );

                ocrExtractedAmount = extractTotalAmount(ocrText);
            } catch (ocrError) {
                console.error("OCR extraction warning:", ocrError.message);
                ocrText = null;
                ocrExtractedAmount = null;
            }
        }

        // OCR amount mismatch check
        const ocrAmountMismatch =
            ocrExtractedAmount !== null &&
            ocrExtractedAmount !== undefined &&
            parsedAmount !== ocrExtractedAmount;

        const expense = await Expense.create({
            employee: req.user.userId,
            travelRequest,
            category,
            amount: parsedAmount,
            expenseDate: expDate,
            description,
            receiptUrl,
            receiptHash,
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
        console.error("Create expense error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
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
                "destination startDate endDate status estimatedBudget"
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
                "destination purpose startDate endDate estimatedBudget"
            )
            .sort({ createdAt: -1 });

        const filtered = req.user.department
            ? expenses.filter(
                  (e) => e.employee && e.employee.department === req.user.department
              )
            : expenses;

        res.status(200).json({
            success: true,
            count: filtered.length,
            expenses: filtered,
        });
    } catch (error) {
        console.error("Get pending expenses error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getApprovedExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({
            status: "APPROVED",
        })
            .populate("employee", "name email department")
            .populate(
                "travelRequest",
                "destination purpose startDate endDate estimatedBudget"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            expenses,
        });
    } catch (error) {
        console.error("Get approved expenses error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch approved expenses",
        });
    }
};

const updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, managerComment } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be APPROVED or REJECTED",
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
                message: "Only pending expenses can be reviewed",
            });
        }

        if (expense.employee.toString() === req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot review or approve your own expense claims",
            });
        }

        if (status === "REJECTED" && !managerComment) {
            return res.status(400).json({
                success: false,
                message: "Please provide a reason for rejecting the expense claim",
            });
        }

        expense.status = status;
        expense.managerComment = managerComment || "";
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

const financeRejectExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { financeComment } = req.body;

        if (!financeComment) {
            return res.status(400).json({
                success: false,
                message: "Please provide a reason for returning or rejecting this reimbursement",
            });
        }

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }

        if (expense.status !== "APPROVED") {
            return res.status(400).json({
                success: false,
                message: "Only manager-approved expenses awaiting payout can be rejected by Finance",
            });
        }

        expense.status = "REJECTED";
        expense.financeComment = financeComment;
        expense.reviewedBy = req.user.userId;
        expense.reviewedAt = new Date();

        await expense.save();

        return res.status(200).json({
            success: true,
            message: "Expense rejected and removed from payout queue",
            expense,
        });
    } catch (error) {
        console.error("Finance reject expense error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reject expense",
        });
    }
};

const cancelExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findOne({
            _id: id,
            employee: req.user.userId,
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }

        if (expense.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending expenses can be cancelled",
            });
        }

        await Expense.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Expense claim cancelled successfully",
        });
    } catch (error) {
        console.error("Cancel expense error:", error);

        return res.status(500).json({
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
    getApprovedExpenses,
    financeRejectExpense,
    cancelExpense,
};