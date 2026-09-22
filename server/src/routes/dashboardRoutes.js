const express = require("express");

const {
    getEmployeeDashboard,
    getManagerDashboard,
    getFinanceDashboard,
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/employee",
    protect,
    authorize("EMPLOYEE"),
    getEmployeeDashboard
);

router.get(
    "/manager",
    protect,
    authorize("MANAGER"),
    getManagerDashboard
);

router.get(
    "/finance",
    protect,
    authorize("FINANCE"),
    getFinanceDashboard
);

module.exports = router;