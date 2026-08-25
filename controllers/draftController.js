const FormDraft = require("../models/FormDraft");
const { asyncHandler } = require("../middleware/errorHandler");

async function getDraft(req, res) {
  const { formId, draftId } = req.params;
  const draft = await FormDraft.findOne({ formId, draftId }).lean();
  if (!draft) return res.status(404).json({ error: "No saved draft found" });
  res.json({ values: draft.values, updatedAt: draft.updatedAt });
}

async function saveDraft(req, res) {
  const { formId, draftId } = req.params;
  const { values } = req.body;
  if (!values || typeof values !== "object") {
    return res.status(400).json({ error: "values object is required" });
  }

  const draft = await FormDraft.findOneAndUpdate(
    { formId, draftId },
    { values },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ updatedAt: draft.updatedAt });
}

async function deleteDraft(req, res) {
  const { formId, draftId } = req.params;
  await FormDraft.deleteOne({ formId, draftId });
  res.status(204).end();
}

module.exports = {
  getDraft: asyncHandler(getDraft),
  saveDraft: asyncHandler(saveDraft),
  deleteDraft: asyncHandler(deleteDraft),
};