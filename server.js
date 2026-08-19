require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const formRoutes = require("./routes/formSchema.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/forms", formRoutes);

// Unmatched routes -> 404 JSON instead of Express's default HTML page
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Must be registered last: Express recognizes it as an error handler by
// its 4-argument signature.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] Forma AI API listening on port ${PORT}`);
  });
});