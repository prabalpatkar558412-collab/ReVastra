const { generateEstimate } = require("../services/estimate.service");

async function generateEstimateController(req, res, next) {
  try {
    const updatedSubmission = await generateEstimate(req.params.submissionId);

    res.status(200).json({
      success: true,
      message: "Estimate generated successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateEstimateController,
};
