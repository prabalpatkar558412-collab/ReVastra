const {
  getRecyclerRecommendations,
} = require("../services/recycler.service");

async function getRecyclerRecommendationsController(req, res, next) {
  try {
    const recommendations = await getRecyclerRecommendations(
      req.params.submissionId
    );

    res.status(200).json({
      success: true,
      message: "Recycler recommendations fetched successfully",
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecyclerRecommendationsController,
};
