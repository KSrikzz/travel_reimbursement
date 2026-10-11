const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
    createExpense,
    getMyExpenses,
    getPendingExpenses,
    updateExpenseStatus,
    getApprovedExpenses,
    financeRejectExpense,
    cancelExpense,
} = require("../controllers/expenseController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Middleware to handle both 'receipt' (correct) and 'reciept' (legacy typo)
const uploadReceipt = (req, res, next) => {
    upload.fields([
        { name: "receipt", maxCount: 1 },
        { name: "reciept", maxCount: 1 },
    ])(req, res, (err) => {
        if (err) return next(err);
        if (req.files) {
            req.file =
                (req.files["receipt"] && req.files["receipt"][0]) ||
                (req.files["reciept"] && req.files["reciept"][0]);
        }
        next();
    });
};

// Employees & Travelers
router.post(
    "/",
    protect,
    authorize("EMPLOYEE", "MANAGER", "FINANCE"),
    uploadReceipt,
    createExpense
);

router.get(
    "/my",
    protect,
    authorize("EMPLOYEE", "MANAGER", "FINANCE"),
    getMyExpenses
);

router.delete(
    "/:id",
    protect,
    authorize("EMPLOYEE", "MANAGER", "FINANCE"),
    cancelExpense
);

// Manager review
router.get(
    "/pending",
    protect,
    authorize("MANAGER"),
    getPendingExpenses
);

router.patch(
    "/:id/status",
    protect,
    authorize("MANAGER"),
    updateExpenseStatus
);

// Finance review & rejection
router.get(
    "/approved",
    protect,
    authorize("FINANCE"),
    getApprovedExpenses
);

router.patch(
    "/:id/finance-reject",
    protect,
    authorize("FINANCE"),
    financeRejectExpense
);

module.exports = router;
