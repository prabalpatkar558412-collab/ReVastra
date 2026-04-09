const express = require("express");
const upload = require("../middlewares/upload.middleware");
const { optionalAuthMiddleware } = require("../middlewares/auth.middleware");
const {
  createSubmissionController,
} = require("../controllers/submission.controller");

const router = express.Router();

router.post(
  "/",
  optionalAuthMiddleware,
  upload.single("image"),
  createSubmissionController
);

module.exports = router;
