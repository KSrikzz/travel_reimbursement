const express = require("express");

const {
    createTravelRequest,
    getMyTravelRequests,
    getPendingTravelRequests,
    updateTravelRequestStatus,
    cancelTravelRequest,
} = require("../controllers/travelRequestController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Employees & Travelers
router.post(
    "/",
    protect,
    authorize("EMPLOYEE", "MANAGER", "FINANCE"),
    createTravelRequest
);

router.get(
    "/my",
    protect,
    authorize("EMPLOYEE", "MANAGER", "FINANCE"),
    getMyTravelRequests
);

router.delete(
    "/:id",
    protect,
    authorize("EMPLOYEE", "MANAGER", "FINANCE"),
    cancelTravelRequest
);

// Manager
router.get(
    "/pending",
    protect,
    authorize("MANAGER"),
    getPendingTravelRequests
);

router.patch(
    "/:id/status",
    protect,
    authorize("MANAGER"),
    updateTravelRequestStatus
);

module.exports = router;