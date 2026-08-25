function notFound(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error("Unhandled request error:", err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
}

// Express 4 doesn't forward a rejected promise from an async handler to
// errorHandler on its own — it goes fully uncaught and crashes the process.
// Wrapping route handlers with this routes rejections to `next(err)` instead.
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { notFound, errorHandler, asyncHandler };