const FormSchema = require("../models/FormSchema");
const FormResponse = require("../models/FormResponse");

// GET /api/forms
// Lists available forms (id/title only — not the full field tree) so a
// future "pick a form" landing page has something to fetch.
async function listFormSchemas(req, res, next) {
  try {
    const schemas = await FormSchema.find({}, "formId title createdAt updatedAt").sort({
      createdAt: -1,
    });
    res.json(schemas);
  } catch (err) {
    next(err);
  }
}

// GET /api/forms/:formId
// This is what client/src/services/api.js#fetchFormSchema calls.
async function getFormSchema(req, res, next) {
  try {
    const formId = req.params.formId.toLowerCase();
    const schema = await FormSchema.findOne({ formId });

    if (!schema) {
      return res.status(404).json({ message: `No form found with id "${formId}"` });
    }

    res.json(schema);
  } catch (err) {
    next(err);
  }
}

// POST /api/forms
// Creates (or upserts) a form definition. This is how new form types get
// into the Schema Store — later this is what the AI pipeline / an admin
// UI will call instead of a human hand-writing JSON.
async function createFormSchema(req, res, next) {
  try {
    const { formId, title, fields } = req.body || {};

    if (!formId || !title) {
      return res.status(400).json({ message: "formId and title are required" });
    }

    const schema = await FormSchema.findOneAndUpdate(
      { formId: formId.toLowerCase() },
      { formId: formId.toLowerCase(), title, fields: fields || [] },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(schema);
  } catch (err) {
    next(err);
  }
}

// POST /api/forms/:formId/responses
// This is what client/src/services/api.js#submitFormResponse calls.
// Re-checks `required` server-side — client-side react-hook-form
// validation is a UX nicety, not something the API should trust blindly.
async function submitFormResponse(req, res, next) {
  try {
    const formId = req.params.formId.toLowerCase();
    const schema = await FormSchema.findOne({ formId });

    if (!schema) {
      return res.status(404).json({ message: `No form found with id "${formId}"` });
    }

    const values = req.body || {};
    const missing = schema.fields
      .filter((field) => field.required)
      .filter((field) => values[field.id] === undefined || values[field.id] === "" || values[field.id] === false)
      .map((field) => field.label);

    if (missing.length) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    const response = await FormResponse.create({ formId, values });
    res.status(201).json({ id: response._id, formId: response.formId, submittedAt: response.createdAt });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listFormSchemas,
  getFormSchema,
  createFormSchema,
  submitFormResponse,
};