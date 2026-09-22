const express = require("express");

const {
    createTravelRequest,
    getMyTravelRequests,
    getPendingTravelRequests,
    updateTravelRequestStatus,
} = require("../controllers/travelRequestController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Employee
router.post(
    "/",
    protect,
    authorize("EMPLOYEE"),
    createTravelRequest
);

router.get(
    "/my",
    protect,
    authorize("EMPLOYEE"),
    getMyTravelRequests
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