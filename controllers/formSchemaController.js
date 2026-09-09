const FormSchema = require("../models/FormSchema");
const FormSchemaVersion = require("../models/FormSchemaVersion");
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
  const { formId, title, description, fields } = req.body;
  if (!formId || !title) {
    return res.status(400).json({ error: "formId and title are required" });
  }
  const existing = await FormSchema.findOne({ formId });
  if (existing) return res.status(409).json({ error: `Form "${formId}" already exists` });

  const schema = await FormSchema.create({ formId, title, description: description || undefined, fields: fields || [] });
  res.status(201).json(schema);
}

// Editing a form snapshots its current state into FormSchemaVersion before
// overwriting it, then bumps `version` — so a submission stamped with the
// version it was filled under can always be traced back to the exact field
// shape it saw, even after the live form has since changed.
async function updateSchema(req, res) {
  const { formId } = req.params;
  const { title, description, fields } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const existing = await FormSchema.findOne({ formId });
  if (!existing) return res.status(404).json({ error: "Form not found" });

  await FormSchemaVersion.create({
    formId: existing.formId,
    version: existing.version || 1,
    title: existing.title,
    description: existing.description,
    fields: existing.fields,
  });

  existing.title = title;
  existing.description = description || undefined;
  existing.fields = fields || [];
  existing.version = (existing.version || 1) + 1;
  await existing.save();

  res.json(existing);
}

async function getSchemaVersions(req, res) {
  const { formId } = req.params;
  const versions = await FormSchemaVersion.find({ formId }).select("version title description createdAt").sort({ version: -1 }).lean();
  res.json(versions);
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
  const { __draftId, __aiOriginalValues, ...values } = req.body;
  const schema = await FormSchema.findOne({ formId }).lean();
  if (!schema) return res.status(404).json({ error: "Form not found" });

  const visibility = resolveVisibility(schema.fields, values);
  const missing = schema.fields
    .filter((f) => f.required && visibility[f.id] && !values[f.id])
    .map((f) => f.label);

  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }

  // __aiOriginalValues carries what the AI actually filled in (only for
  // fields it filled) so accuracy can be measured server-side, rather than
  // trusting a pre-computed verdict from the client. Compared as strings
  // since a submitted number/date field arrives as a string from the form
  // while the AI's original value is typed (e.g. a real JS number).
  let aiFieldOutcomes;
  if (__aiOriginalValues && typeof __aiOriginalValues === "object") {
    aiFieldOutcomes = Object.entries(__aiOriginalValues).map(([fieldId, originalValue]) => ({
      fieldId,
      kept: String(values[fieldId] ?? "").trim() === String(originalValue ?? "").trim(),
    }));
  }

  // __draftId is plumbing for the draft-cleanup step below — it isn't a real
  // form field, so it's kept out of the stored values (was previously
  // leaking in as a stray column in every export/response record).
  const response = await FormResponse.create({ formId, values, schemaVersion: schema.version, aiFieldOutcomes });

  if (__draftId) {
    await FormDraft.deleteOne({ formId, draftId: __draftId }).catch(() => {});
  }

  res.status(201).json({ id: response._id, submittedAt: response.createdAt });
}

async function listSchemas(req, res) {
  const schemas = await FormSchema.find().select("formId title description fields createdAt version").lean();
  const counts = await FormResponse.aggregate([{ $group: { _id: "$formId", count: { $sum: 1 } } }]);
  const countByFormId = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  const withStats = schemas.map((s) => ({
    formId: s.formId,
    title: s.title,
    description: s.description || "",
    fieldCount: s.fields.length,
    submissionCount: countByFormId[s.formId] || 0,
    createdAt: s.createdAt,
    version: s.version || 1,
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
  res.json(
    responses.map((r) => ({
      id: r._id,
      values: r.values,
      submittedAt: r.createdAt,
      schemaVersion: r.schemaVersion || 1,
      aiFieldOutcomes: r.aiFieldOutcomes || [],
    }))
  );
}

const DAILY_TREND_DAYS = 14;

async function getStats(req, res) {
  const totalForms = await FormSchema.countDocuments();
  const totalSubmissions = await FormResponse.countDocuments();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const submissionsToday = await FormResponse.countDocuments({ createdAt: { $gte: startOfDay } });

  const rangeStart = new Date(startOfDay);
  rangeStart.setDate(rangeStart.getDate() - (DAILY_TREND_DAYS - 1));
  const dailyAgg = await FormResponse.aggregate([
    { $match: { createdAt: { $gte: rangeStart } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
  ]);
  const countByDate = Object.fromEntries(dailyAgg.map((d) => [d._id, d.count]));

  // Always DAILY_TREND_DAYS entries, zero-filled — the chart doesn't have to
  // know which days had no submissions at all.
  const dailySubmissions = [];
  for (let i = 0; i < DAILY_TREND_DAYS; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    dailySubmissions.push({ date, count: countByDate[date] || 0 });
  }

  const aiAgg = await FormResponse.aggregate([
    { $match: { aiFieldOutcomes: { $exists: true, $not: { $size: 0 } } } },
    { $unwind: "$aiFieldOutcomes" },
    { $group: { _id: null, totalFilled: { $sum: 1 }, totalKept: { $sum: { $cond: ["$aiFieldOutcomes.kept", 1, 0] } } } },
  ]);
  const aiAccuracy = aiAgg[0]
    ? { totalFilled: aiAgg[0].totalFilled, totalKept: aiAgg[0].totalKept }
    : { totalFilled: 0, totalKept: 0 };

  res.json({ totalForms, totalSubmissions, submissionsToday, dailySubmissions, aiAccuracy });
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
  updateSchema: asyncHandler(updateSchema),
  getSchemaVersions: asyncHandler(getSchemaVersions),
  submitResponse: asyncHandler(submitResponse),
  getFormResponses: asyncHandler(getFormResponses),
  getStats: asyncHandler(getStats),
  exportResponses: asyncHandler(exportResponses),
  seedDemo: asyncHandler(seedDemo),
  resetDemoData: asyncHandler(resetDemoData),
  // Not route handlers — exported as-is (not asyncHandler-wrapped) so they can
  // be exercised directly by scripts/testShowIfChain.js and the Jest suite.
  resolveVisibility,
  toCsvValue,
};