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

// Mirrors the frontend's visibility logic — a field hidden by a showIf
// condition (or whose ancestor is hidden) can't be "missing" if it was
// never meant to be shown.
function resolveVisibility(fields, values) {
  const byId = Object.fromEntries(fields.map((f) => [f.id, f]));
  const cache = new Map();

  function isVisible(field, seen = new Set()) {
    if (cache.has(field.id)) return cache.get(field.id);
    if (!field.showIf) {
      cache.set(field.id, true);
      return true;
    }
    if (seen.has(field.id)) return false; // guard against circular showIf chains

    const parent = byId[field.showIf.field];
    if (!parent) {
      cache.set(field.id, true);
      return true;
    }
    const parentVisible = isVisible(parent, new Set(seen).add(field.id));
    const result = parentVisible && values[field.showIf.field] === field.showIf.equals;
    cache.set(field.id, result);
    return result;
  }

  return Object.fromEntries(fields.map((f) => [f.id, isVisible(f)]));
}

async function submitResponse(req, res) {
  const { formId } = req.params;
  const schema = await FormSchema.findOne({ formId }).lean();
  if (!schema) return res.status(404).json({ error: "Form not found" });

  const visibility = resolveVisibility(schema.fields, req.body);
  const missing = schema.fields
    .filter((f) => f.required && visibility[f.id] && !req.body[f.id])
    .map((f) => f.label);

  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }

  const response = await FormResponse.create({ formId, values: req.body });
  res.status(201).json({ id: response._id, submittedAt: response.createdAt });
}

module.exports = { getSchema, listSchemas, createSchema, submitResponse };