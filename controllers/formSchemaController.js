const FormSchema = require("../models/FormSchema");
const FormResponse = require("../models/FormResponse");

async function getSchema(req, res) {
  const schema = await FormSchema.findOne({ formId: req.params.formId }).lean();
  if (!schema) return res.status(404).json({ error: "Form not found" });
  res.json(schema);
}

async function listSchemas(req, res) {
  const schemas = await FormSchema.find().select("formId title createdAt").lean();
  res.json(schemas);
}

async function createSchema(req, res) {
  const { formId, title, fields } = req.body;
  if (!formId || !title) {
    return res.status(400).json({ error: "formId and title are required" });
  }
  const existing = await FormSchema.findOne({ formId });
  if (existing) return res.status(409).json({ error: `Form "${formId}" already exists` });

  const schema = await FormSchema.create({ formId, title, fields: fields || [] });
  res.status(201).json(schema);
}

async function submitResponse(req, res) {
  const { formId } = req.params;
  const schema = await FormSchema.findOne({ formId }).lean();
  if (!schema) return res.status(404).json({ error: "Form not found" });

  // Minimal server-side required-field check — the frontend already
  // validates via react-hook-form, but a client can bypass that, so the
  // backend shouldn't blindly trust req.body.
  const missing = schema.fields.filter((f) => f.required && !req.body[f.id]).map((f) => f.label);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }

  const response = await FormResponse.create({ formId, values: req.body });
  res.status(201).json({ id: response._id, submittedAt: response.createdAt });
}

module.exports = { getSchema, listSchemas, createSchema, submitResponse };