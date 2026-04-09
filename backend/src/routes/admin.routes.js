const express = require("express");
const {
  getAdminRequestsController,
  updateAdminRequestStatusController,
} = require("../controllers/admin.controller");
const { authMiddleware, requireRole } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/requests",
  authMiddleware,
  requireRole("admin"),
  getAdminRequestsController
);
router.patch(
  "/requests/:id/status",
  authMiddleware,
  requireRole("admin"),
  updateAdminRequestStatusController
);

module.exports = router;
