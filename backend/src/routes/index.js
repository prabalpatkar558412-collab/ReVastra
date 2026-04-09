const express = require("express");
const adminRoutes = require("./admin.routes");
const authRoutes = require("./auth.routes");
const dashboardRoutes = require("./dashboard.routes");
const estimateRoutes = require("./estimate.routes");
const healthRoutes = require("./health.routes");
const pickupRoutes = require("./pickup.routes");
const recyclerRoutes = require("./recycler.routes");
const submissionRoutes = require("./submission.routes");

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/estimates", estimateRoutes);
router.use("/health", healthRoutes);
router.use("/pickups", pickupRoutes);
router.use("/recyclers", recyclerRoutes);
router.use("/submissions", submissionRoutes);

module.exports = router;
