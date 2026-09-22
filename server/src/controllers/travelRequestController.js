const TravelRequest = require("../models/TravelRequest");

const createTravelRequest = async (req, res) => {
    try {
        const {
            destination,
            purpose,
            startDate,
            endDate,
            estimatedBudget,
        } = req.body;

        if (
            !destination ||
            !purpose ||
            !startDate ||
            !endDate ||
            estimatedBudget === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All travel request fields are required",
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid travel dates",
            });
        }

        if (end < start) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date",
            });
        }

        if (estimatedBudget < 0) {
            return res.status(400).json({
                success: false,
                message: "Estimated budget cannot be negative",
            });
        }

        const travelRequest = await TravelRequest.create({
            employee: req.user.userId,
            destination,
            purpose,
            startDate: start,
            endDate: end,
            estimatedBudget,
        });

        res.status(201).json({
            success: true,
            message: "Travel request submitted successfully",
            travelRequest,
        });
    } catch (error) {
        console.error("Create travel request error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const getMyTravelRequests = async (req, res) => {
    try {
        const requests = await TravelRequest.find({
            employee: req.user.userId,
        })
            .populate("employee", "name email department")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            travelRequests: requests,
        });
    } catch (error) {
        console.error("Get travel requests error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const updateTravelRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, managerComment } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be APPROVED or REJECTED",
            });
        }

        const travelRequest = await TravelRequest.findById(id);

        if (!travelRequest) {
            return res.status(404).json({
                success: false,
                message: "Travel request not found",
            });
        }

        if (travelRequest.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be reviewed",
            });
        }

        travelRequest.status = status;
        travelRequest.managerComment = managerComment || "";
        travelRequest.reviewedBy = req.user.userId;
        travelRequest.reviewedAt = new Date();

        await travelRequest.save();

        res.status(200).json({
            success: true,
            message: `Travel request ${status.toLowerCase()} successfully`,
            travelRequest,
        });
    } catch (error) {
        console.error("Update travel request error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const getPendingTravelRequests = async (req, res) => {
    try {
        const requests = await TravelRequest.find({
            status: "PENDING",
        })
            .populate("employee", "name email department")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            travelRequests: requests,
        });
    } catch (error) {
        console.error("Get pending travel requests error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
module.exports = {
    createTravelRequest,
    getMyTravelRequests,
    getPendingTravelRequests,
    updateTravelRequestStatus,
};