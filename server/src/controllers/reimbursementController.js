const Expense = require("../models/Expense");
const Reimbursement = require("../models/Reimbursement");

const {
  generateTransactionId,
} = require("../services/paymentService");

const processReimbursement = async (req, res) => {
  try {
    const { id } = req.params;

    let expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    if (!["APPROVED", "REIMBURSED"].includes(expense.status)) {
      return res.status(400).json({
        success: false,
        message:
          "Only approved expenses can be reimbursed",
      });
    }

    let reimbursement = await Reimbursement.findOne({
      expense: expense._id,
    });

    if (expense.status === "REIMBURSED" && !reimbursement) {
      return res.status(409).json({
        success: false,
        message: "Expense is reimbursed but its reimbursement record is missing",
      });
    }

    if (reimbursement?.status === "FAILED") {
      return res.status(409).json({
        success: false,
        message:
          "This reimbursement failed and needs reconciliation before retrying",
      });
    }

    if (!reimbursement) {
      try {
        // One record per expense acts as an idempotency key; retries resume PROCESSING records.
        reimbursement = await Reimbursement.create({
          expense: expense._id,
          employee: expense.employee,
          amount: expense.amount,
          transactionId: generateTransactionId(),
          status: "PROCESSING",
          processedBy: req.user.userId,
        });
      } catch (createError) {
        // A concurrent request may have created the unique expense record first.
        if (createError.code !== 11000) throw createError;
        reimbursement = await Reimbursement.findOne({
          expense: expense._id,
        });
        if (!reimbursement) throw createError;
      }
    }

    const reviewedAt = new Date();
    let updatedExpense = await Expense.findOneAndUpdate(
      { _id: expense._id, status: "APPROVED" },
      {
        $set: {
          status: "REIMBURSED",
          reviewedBy: req.user.userId,
          reviewedAt,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      expense = await Expense.findById(id);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found",
        });
      }
      if (expense.status !== "REIMBURSED") {
        return res.status(409).json({
          success: false,
          message:
            "Expense status changed before reimbursement could be completed",
        });
      }
      updatedExpense = expense;
    }

    if (reimbursement.status !== "COMPLETED") {
      reimbursement.status = "COMPLETED";
      reimbursement.processedBy = req.user.userId;
      reimbursement.processedAt = new Date();
      await reimbursement.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "Reimbursement processed successfully",
      expense: updatedExpense,
      reimbursement,
    });
  } catch (error) {
    console.error(
      "Process reimbursement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to process reimbursement",
    });
  }
};

const getMyReimbursements = async (req, res) => {
  try {
    const reimbursements =
      await Reimbursement.find({
        employee: req.user.userId,
      })
        .populate(
          "expense",
          "category amount expenseDate description"
        )
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reimbursements,
    });
  } catch (error) {
    console.error(
      "Get my reimbursements error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reimbursements",
    });
  }
};

module.exports = {
  processReimbursement,
  getMyReimbursements,
};
