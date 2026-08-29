const FormSchema = require("../models/FormSchema");
const FormResponse = require("../models/FormResponse");
const FormDraft = require("../models/FormDraft");
const exampleFormSchema = require("../lib/exampleFormSchema");
const { asyncHandler } = require("../middleware/errorHandler");

async function getSchema(req, res) {
  const schema = await FormSchema.findOne({ formId: req.params.formId }).lean();
  if (!schema) return res.status(404).json({ error: "Form not found" });
  res.json(schema);
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
  const { __draftId, ...values } = req.body;
  const schema = await FormSchema.findOne({ formId }).lean();
  if (!schema) return res.status(404).json({ error: "Form not found" });

  const visibility = resolveVisibility(schema.fields, values);
  const missing = schema.fields
    .filter((f) => f.required && visibility[f.id] && !values[f.id])
    .map((f) => f.label);

  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }

  // __draftId is plumbing for the draft-cleanup step below — it isn't a real
  // form field, so it's kept out of the stored values (was previously
  // leaking in as a stray column in every export/response record).
  const response = await FormResponse.create({ formId, values });

  if (__draftId) {
    await FormDraft.deleteOne({ formId, draftId: __draftId }).catch(() => {});
  }

  res.status(201).json({ id: response._id, submittedAt: response.createdAt });
}

async function listSchemas(req, res) {
  const schemas = await FormSchema.find().select("formId title fields createdAt").lean();
  const counts = await FormResponse.aggregate([{ $group: { _id: "$formId", count: { $sum: 1 } } }]);
  const countByFormId = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  const withStats = schemas.map((s) => ({
    formId: s.formId,
    title: s.title,
    fieldCount: s.fields.length,
    submissionCount: countByFormId[s.formId] || 0,
    createdAt: s.createdAt,
  }));
  res.json(withStats);
}

// Any logged-in user — every form is part of the one shared Schema Store,
// not owned by whoever created it, so there's no per-user access check here.
async function getFormResponses(req, res) {
  const { formId } = req.params;
  const schema = await FormSchema.findOne({ formId }).lean();
  if (!schema) return res.status(404).json({ error: "Form not found" });

  const responses = await FormResponse.find({ formId }).sort({ createdAt: -1 }).lean();
  res.json(responses.map((r) => ({ id: r._id, values: r.values, submittedAt: r.createdAt })));
}

async function getStats(req, res) {
  const totalForms = await FormSchema.countDocuments();
  const totalSubmissions = await FormResponse.countDocuments();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const submissionsToday = await FormResponse.countDocuments({ createdAt: { $gte: startOfDay } });

  res.json({ totalForms, totalSubmissions, submissionsToday });
}

function toCsvValue(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

async function exportResponses(req, res) {
  const responses = await FormResponse.find().sort({ createdAt: -1 }).lean();
  if (responses.length === 0) {
    return res.status(404).json({ error: "No submissions to export yet" });
  }

  const valueKeys = [...new Set(responses.flatMap((r) => Object.keys(r.values || {})))];
  const headers = ["formId", "submittedAt", ...valueKeys];
  const rows = responses.map((r) => [
    r.formId,
    r.createdAt.toISOString(),
    ...valueKeys.map((k) => toCsvValue(r.values?.[k])),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.map(toCsvValue).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=forma-ai-responses.csv");
  res.send(csv);
}

async function seedDemo(req, res) {
  const schema = await FormSchema.findOneAndUpdate(
    { formId: exampleFormSchema.formId },
    exampleFormSchema,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ message: `Seeded "${schema.formId}"`, formId: schema.formId });
}

async function resetDemoData(req, res) {
  const result = await FormResponse.deleteMany({ formId: exampleFormSchema.formId });
  res.json({ message: `Deleted ${result.deletedCount} response(s) for "${exampleFormSchema.formId}"` });
}

module.exports = {
  getSchema: asyncHandler(getSchema),
  listSchemas: asyncHandler(listSchemas),
  createSchema: asyncHandler(createSchema),
  submitResponse: asyncHandler(submitResponse),
  getFormResponses: asyncHandler(getFormResponses),
  getStats: asyncHandler(getStats),
  exportResponses: asyncHandler(exportResponses),
  seedDemo: asyncHandler(seedDemo),
  resetDemoData: asyncHandler(resetDemoData),
  // Not a route handler — exported as-is (not asyncHandler-wrapped) so it can
  // be exercised directly by scripts/testShowIfChain.js.
  resolveVisibility,
};