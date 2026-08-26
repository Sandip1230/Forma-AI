require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const formSchemaRoutes = require("./routes/formSchema.routes");
const authRoutes = require("./routes/auth.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

const app = express();
// credentials: true so the session cookie actually gets set/sent — requires
// FRONTEND_ORIGIN to be a concrete origin (browsers reject credentials with
// a wildcard "*" origin), which .env already sets for local dev.
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.use("/api/auth", authRoutes);
app.use("/api/forms", formSchemaRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Forma AI server listening on port ${PORT}`));
});