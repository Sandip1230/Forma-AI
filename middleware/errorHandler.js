// Centralized error handler — every route hands its errors to next(err)
// and lets this translate them into a consistent JSON shape instead of
// each controller building its own response.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error("[error]", err);

  // Mongoose validation errors (bad enum, missing required path, etc.)
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  // Mongoose bad ObjectId / cast errors
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid value for "${err.path}"` });
  }

  // Duplicate key (e.g. formId unique index)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `A record with that ${field} already exists` });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Something went wrong" });
}

module.exports = errorHandler;