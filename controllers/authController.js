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

async function createAndSendOtp(email, purpose) {
  const code = generateOtp();
  await Otp.create({ email, codeHash: hashOtp(code), purpose, expiresAt: new Date(Date.now() + OTP_TTL_MS) });
  await sendOtpEmail(email, code, purpose);
}

// Shared by signup verification and password reset — looks up the most
// recent unconsumed code for (email, purpose) and checks it against `code`.
// Returns the Otp doc (already marked consumed) on success, or null.
async function consumeOtp(email, purpose, code) {
  const otp = await Otp.findOne({ email, purpose, consumedAt: null }).sort({ createdAt: -1 });
  if (!otp || otp.expiresAt < new Date() || otp.codeHash !== hashOtp(code)) return null;
  otp.consumedAt = new Date();
  await otp.save();
  return otp;
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

function userView(user) {
  return { id: user._id, username: user.username, email: user.email, role: user.role };
}

async function signup(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ error: "An account with that email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username: username.trim(), email: normalizedEmail, passwordHash, emailVerified: false });
  await createAndSendOtp(normalizedEmail, "signup");

  res.status(201).json({
    message: "Account created. Enter the code we emailed you to verify your address.",
    email: normalizedEmail,
  });
}

async function verifySignupOtp(req, res) {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: "email and code are required" });
  const normalizedEmail = email.trim().toLowerCase();

  const otp = await consumeOtp(normalizedEmail, "signup", code);
  if (!otp) return res.status(401).json({ error: "That code is invalid or has expired" });

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ error: "Account not found" });

  user.emailVerified = true;
  await user.save();

  issueToken(res, user);
  res.json(userView(user));
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
  if (!user.emailVerified) {
    return res.status(403).json({ error: "Please verify your email before logging in — check your inbox for the code." });
  }

  issueToken(res, user);
  res.json(userView(user));
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "email is required" });
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (user) await createAndSendOtp(normalizedEmail, "reset");

  // Same response whether or not the account exists — don't reveal which
  // emails are registered.
  res.json({ message: "If that email has an account, we sent a password reset code." });
}

async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "email, code and newPassword are required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const otp = await consumeOtp(normalizedEmail, "reset", code);
  if (!otp) return res.status(401).json({ error: "That code is invalid or has expired" });

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ error: "Account not found" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  issueToken(res, user);
  res.json(userView(user));
}

function logout(req, res) {
  res.clearCookie(TOKEN_COOKIE);
  res.status(204).end();
}

async function me(req, res) {
  const user = await User.findById(req.user.id).select("username email role").lean();
  if (!user) return res.status(404).json({ error: "Account not found" });
  res.json(userView(user));
}

module.exports = {
  signup: asyncHandler(signup),
  verifySignupOtp: asyncHandler(verifySignupOtp),
  login: asyncHandler(login),
  forgotPassword: asyncHandler(forgotPassword),
  resetPassword: asyncHandler(resetPassword),
  logout,
  me: asyncHandler(me),
};
