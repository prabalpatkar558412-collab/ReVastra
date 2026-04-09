const { getDashboardSummary } = require("../services/dashboard.service");

async function getDashboardSummaryController(req, res, next) {
  try {
    const dashboard = await getDashboardSummary(req.params.userId, req.user);

    res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummaryController,
};
