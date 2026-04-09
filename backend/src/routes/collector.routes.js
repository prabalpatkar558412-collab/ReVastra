const express = require("express");
const {
  getCollectorDashboardController,
  updateCollectorRequestStatusController,
} = require("../controllers/collector.controller");
const { authMiddleware, requireRole } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  requireRole("collector"),
  getCollectorDashboardController
);
router.patch(
  "/requests/:id/status",
  authMiddleware,
  requireRole("collector"),
  updateCollectorRequestStatusController
);

module.exports = router;
