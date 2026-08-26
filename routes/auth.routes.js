const express = require("express");
const { signup, login, verifyOtp, logout, me } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
