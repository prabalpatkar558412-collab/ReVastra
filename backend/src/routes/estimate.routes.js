const express = require("express");
const {
  generateEstimateController,
} = require("../controllers/estimate.controller");

const router = express.Router();

router.post("/:submissionId", generateEstimateController);

module.exports = router;
