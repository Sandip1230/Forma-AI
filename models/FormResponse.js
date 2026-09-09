const mongoose = require("mongoose");

const aiFieldOutcomeSchema = new mongoose.Schema(
  { fieldId: { type: String, required: true }, kept: { type: Boolean, required: true } },
  { _id: false }
);

const formResponseSchema = new mongoose.Schema(
  {
    formId: { type: String, required: true, index: true },
    values: { type: mongoose.Schema.Types.Mixed, required: true },
    // The FormSchema.version this was filled against, so editing the form
    // later never reinterprets or corrupts what was actually submitted.
    schemaVersion: { type: Number, default: 1 },
    // One entry per field the AI extracted a value for — `kept` is whether
    // the final submitted value still matches what the AI originally filled
    // in, vs. the user overwriting it. Absent when AI extraction wasn't used
    // for this submission.
    aiFieldOutcomes: [aiFieldOutcomeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormResponse", formResponseSchema);