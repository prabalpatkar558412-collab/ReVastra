const express = require("express");
const {
  createPickupRequestController,
} = require("../controllers/pickup.controller");
const { authMiddleware, requireRole } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, requireRole("user"), createPickupRequestController);

module.exports = router;
