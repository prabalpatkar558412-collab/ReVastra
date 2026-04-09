const express = require("express");
const {
  getRecyclerRecommendationsController,
} = require("../controllers/recycler.controller");

const router = express.Router();

router.get(
  "/recommendations/:submissionId",
  getRecyclerRecommendationsController
);

module.exports = router;
