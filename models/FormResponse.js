const mongoose = require("mongoose");

const formResponseSchema = new mongoose.Schema(
  {
    formId: { type: String, required: true, index: true },
    values: { type: mongoose.Schema.Types.Mixed, required: true },
    // The FormSchema.version this was filled against, so editing the form
    // later never reinterprets or corrupts what was actually submitted.
    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormResponse", formResponseSchema);