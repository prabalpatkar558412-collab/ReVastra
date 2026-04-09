const {
  getRecyclerDashboardSummary,
  updateRecyclerRequestStatus,
} = require("../services/recycler-ops.service");

function validateRecyclerStatusBody(body) {
  if (!body.status) {
    const error = new Error("Status is required");
    error.statusCode = 400;
    throw error;
  }
}

async function getRecyclerDashboardController(req, res, next) {
  try {
    const summary = await getRecyclerDashboardSummary(req.user);

    res.status(200).json({
      success: true,
      message: "Recycler dashboard fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

async function updateRecyclerRequestStatusController(req, res, next) {
  try {
    validateRecyclerStatusBody(req.body);

    const updatedRequest = await updateRecyclerRequestStatus(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Recycler request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecyclerDashboardController,
  updateRecyclerRequestStatusController,
};
