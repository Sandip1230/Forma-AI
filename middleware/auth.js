const jwt = require("jsonwebtoken");
const { asyncHandler } = require("./errorHandler");

const TOKEN_COOKIE = "forma_token";

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Please log in." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
  } catch {
    return res.status(401).json({ error: "Session expired or invalid — please log in again." });
  }

  next();
});

module.exports = { requireAuth, TOKEN_COOKIE };
