const express = require("express");

const {
    processReimbursement,
    getMyReimbursements,
} = require("../controllers/reimbursementController");

const { protect } = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.patch(
    "/:id/process",
    protect,
    authorize("MANAGER", "FINANCE"),
    processReimbursement
);

router.get(
    "/my",
    protect,
    authorize("EMPLOYEE"),
    getMyReimbursements
);

module.exports = router;