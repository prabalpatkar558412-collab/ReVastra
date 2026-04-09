const express = require("express");
const {
  getRecyclerDashboardController,
  updateRecyclerRequestStatusController,
} = require("../controllers/recycler-ops.controller");
const { authMiddleware, requireRole } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  requireRole("recycler"),
  getRecyclerDashboardController
);
router.patch(
  "/requests/:id/status",
  authMiddleware,
  requireRole("recycler"),
  updateRecyclerRequestStatusController
);

module.exports = router;
