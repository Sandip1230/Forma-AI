const mongoose = require("mongoose");

// Mirrors FormSchema's field/option shape independently rather than
// importing it — this is a frozen historical snapshot, so it shouldn't
// silently change shape if the live schema's field types ever do.
const optionSchema = new mongoose.Schema(
  { value: { type: String, required: true }, label: { type: String, required: true } },
  { _id: false }
);

const fieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    placeholder: String,
    pattern: String,
    patternMessage: String,
    options: [optionSchema],
    showIf: {
      field: String,
      equals: mongoose.Schema.Types.Mixed,
    },
  },
  { _id: false }
);

// One immutable snapshot per past version of a FormSchema, written right
// before that version is overwritten (see updateSchema in
// formSchemaController.js). Never updated once created.
const formSchemaVersionSchema = new mongoose.Schema(
  {
    formId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
    fields: { type: [fieldSchema], default: [] },
    archivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

formSchemaVersionSchema.index({ formId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model("FormSchemaVersion", formSchemaVersionSchema);
