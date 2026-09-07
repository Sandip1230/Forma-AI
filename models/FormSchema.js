const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  { value: { type: String, required: true }, label: { type: String, required: true } },
  { _id: false }
);

const fieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["text", "textarea", "select", "checkbox", "date", "number"],
    },
    required: { type: Boolean, default: false },
    placeholder: String,
    pattern: String,
    patternMessage: String,
    options: [optionSchema], // only used when type === "select"
    showIf: {
      // Mid-Project Review's conditional-field logic: { field: "incidentType", equals: "weather" }
      field: String,
      equals: mongoose.Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const formSchemaSchema = new mongoose.Schema(
  {
    formId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    // Used by the auto-classify endpoint to match free text to the right
    // form when several exist — the title alone is often too short/ambiguous
    // for that.
    description: String,
    fields: { type: [fieldSchema], default: [] },
    // Bumped on every edit (see updateSchema) — the previous title/
    // description/fields are snapshotted into FormSchemaVersion first, so
    // existing submissions can still be traced back to the exact shape they
    // were filled against.
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormSchema", formSchemaSchema);