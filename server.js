require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const formSchemaRoutes = require("./routes/formSchema.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.use("/api/forms", formSchemaRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Forma AI server listening on port ${PORT}`));
});