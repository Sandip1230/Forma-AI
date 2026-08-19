const mongoose = require("mongoose");

// Connects to MongoDB using MONGO_URI from the environment.
// If it isn't set, the server still boots so the frontend/API contract
// can be exercised locally, but every DB-backed route will fail until
// a real connection string is provided in .env.
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn(
      "[db] MONGO_URI is not set — skipping MongoDB connection. " +
        "Copy .env.example to .env and set MONGO_URI to enable the Schema Store."
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("[db] MongoDB connected");
  } catch (err) {
    console.error("[db] MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;