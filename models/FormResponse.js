const mongoose = require("mongoose");

const formResponseSchema = new mongoose.Schema(
  {
    formId: { type: String, required: true, index: true },
    values: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormResponse", formResponseSchema);