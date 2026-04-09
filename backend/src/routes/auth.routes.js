const express = require("express");
const {
  loginController,
  meController,
  registerController,
  updateMeController,
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authMiddleware, meController);
router.patch("/me", authMiddleware, updateMeController);

module.exports = router;
