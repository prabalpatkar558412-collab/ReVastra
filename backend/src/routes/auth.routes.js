const express = require("express");
const {
  googleLoginController,
  loginController,
  meController,
  registerController,
  updateMeController,
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/google-login", googleLoginController);
router.get("/me", authMiddleware, meController);
router.patch("/me", authMiddleware, updateMeController);

module.exports = router;
