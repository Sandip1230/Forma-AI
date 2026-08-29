const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler } = require("./errorHandler");

const TOKEN_COOKIE = "forma_token";

// Verifies the token for identity, then re-reads role from the DB rather
// than trusting the token's baked-in value — so promoting/demoting a user
// takes effect on their very next request instead of requiring them to log
// out and back in to pick up a fresh token.
async function authenticate(req) {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token) {
    const err = new Error("Please log in.");
    err.status = 401;
    throw err;
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    const err = new Error("Session expired or invalid — please log in again.");
    err.status = 401;
    throw err;
  }

  const user = await User.findById(payload.id).select("email role").lean();
  if (!user) {
    const err = new Error("Account not found — please log in again.");
    err.status = 401;
    throw err;
  }

  return { id: payload.id, email: user.email, role: user.role };
}

const requireAuth = asyncHandler(async (req, res, next) => {
  req.user = await authenticate(req);
  next();
});

const requireAdmin = asyncHandler(async (req, res, next) => {
  req.user = await authenticate(req);
  if (req.user.role !== "admin") {
    const err = new Error("Admin access required.");
    err.status = 403;
    throw err;
  }
  next();
});

module.exports = { requireAuth, requireAdmin, TOKEN_COOKIE };
