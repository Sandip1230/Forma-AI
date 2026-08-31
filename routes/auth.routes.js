const express = require("express");
const {
  signup, verifySignupOtp, login, devLogin, forgotPassword, resetPassword, logout, me,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/login", login);
router.post("/dev-login", devLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
