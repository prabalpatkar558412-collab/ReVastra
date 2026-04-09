const express = require("express");
const upload = require("../middlewares/upload.middleware");
const {
  createSubmissionController,
} = require("../controllers/submission.controller");

const router = express.Router();

router.post("/", upload.single("image"), createSubmissionController);

module.exports = router;
