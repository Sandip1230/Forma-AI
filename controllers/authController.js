const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const { sendOtpEmail } = require("../services/emailService");
const { asyncHandler } = require("../middleware/errorHandler");
const { TOKEN_COOKIE } = require("../middleware/auth");

const OTP_TTL_MS = 10 * 60 * 1000;

function hashOtp(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function issueToken(res, user) {
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Local dev is plain HTTP; flip this on once the app is actually served over HTTPS.
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function signup(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ error: "An account with that email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ email: normalizedEmail, passwordHash });
  res.status(201).json({ message: "Account created. Please log in." });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  // Same generic message whether the account doesn't exist or the password
  // is wrong — don't tell a caller which one it got right.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const code = generateOtp();
  await Otp.create({
    email: normalizedEmail,
    codeHash: hashOtp(code),
    purpose: "login",
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  await sendOtpEmail(normalizedEmail, code);

  res.json({ message: "Enter the code we emailed you to finish logging in.", email: normalizedEmail });
}

async function verifyOtp(req, res) {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "email and code are required" });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const otp = await Otp.findOne({ email: normalizedEmail, purpose: "login", consumedAt: null }).sort({
    createdAt: -1,
  });

  if (!otp || otp.expiresAt < new Date() || otp.codeHash !== hashOtp(code)) {
    return res.status(401).json({ error: "That code is invalid or has expired" });
  }

  otp.consumedAt = new Date();
  await otp.save();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ error: "Account not found" });

  issueToken(res, user);
  res.json({ id: user._id, email: user.email, role: user.role });
}

function logout(req, res) {
  res.clearCookie(TOKEN_COOKIE);
  res.status(204).end();
}

async function me(req, res) {
  const user = await User.findById(req.user.id).select("email role").lean();
  if (!user) return res.status(404).json({ error: "Account not found" });
  res.json({ id: user._id, email: user.email, role: user.role });
}

module.exports = {
  signup: asyncHandler(signup),
  login: asyncHandler(login),
  verifyOtp: asyncHandler(verifyOtp),
  logout,
  me: asyncHandler(me),
};
