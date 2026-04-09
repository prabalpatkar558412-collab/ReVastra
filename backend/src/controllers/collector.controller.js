const {
  getCollectorDashboardSummary,
  updateCollectorRequestStatus,
} = require("../services/collector.service");

function validateCollectorStatusBody(body) {
  if (!body.status) {
    const error = new Error("Status is required");
    error.statusCode = 400;
    throw error;
  }
}

async function getCollectorDashboardController(req, res, next) {
  try {
    const summary = await getCollectorDashboardSummary(req.user);

    res.status(200).json({
      success: true,
      message: "Collector dashboard fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

async function updateCollectorRequestStatusController(req, res, next) {
  try {
    validateCollectorStatusBody(req.body);

    const updatedRequest = await updateCollectorRequestStatus(
      req.params.id,
      req.body.status
    );

    res.status(200).json({
      success: true,
      message: "Collector request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCollectorDashboardController,
  updateCollectorRequestStatusController,
};
