const {
  getAdminRequestsSummary,
  updateAdminRequestStatus,
} = require("../services/admin.service");

function validateStatusUpdateBody(body) {
  if (!body.status) {
    const error = new Error("Status is required");
    error.statusCode = 400;
    throw error;
  }
}

async function getAdminRequestsController(_req, res, next) {
  try {
    const summary = await getAdminRequestsSummary();

    res.status(200).json({
      success: true,
      message: "Admin requests fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

async function updateAdminRequestStatusController(req, res, next) {
  try {
    validateStatusUpdateBody(req.body);

    const updatedRequest = await updateAdminRequestStatus(
      req.params.id,
      req.body.status
    );

    res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminRequestsController,
  updateAdminRequestStatusController,
};
