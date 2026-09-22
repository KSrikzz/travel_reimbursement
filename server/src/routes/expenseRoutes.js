const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
    createExpense,
    getMyExpenses,
    getPendingExpenses,
    updateExpenseStatus,
} = require("../controllers/expenseController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("EMPLOYEE"),
    upload.single("reciept"),
    createExpense
);

router.get(
    "/my",
    protect,
    authorize("EMPLOYEE"),
    getMyExpenses
);

router.get(
    "/pending",
    protect,
    authorize("MANAGER", "FINANCE"),
    getPendingExpenses
);

router.patch(
    "/:id/status",
    protect,
    authorize("MANAGER", "FINANCE"),
    updateExpenseStatus
);

module.exports = router;