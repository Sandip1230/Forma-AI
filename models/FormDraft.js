const mongoose = require("mongoose");

const formDraftSchema = new mongoose.Schema(
  {
    formId: { type: String, required: true, index: true },
    draftId: { type: String, required: true, unique: true, index: true },
    values: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormDraft", formDraftSchema);