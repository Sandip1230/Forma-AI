const FormSchema = require("../models/FormSchema");
const { extractFromText, classifyFormType, generateFormSchema } = require("../services/extractionService");

async function extract(req, res) {
  try {
    const { formId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const schema = await FormSchema.findOne({ formId }).lean();
    if (!schema) return res.status(404).json({ error: "Form not found" });

    const result = await extractFromText(schema, text.trim());
    res.json(result);
  } catch (err) {
    console.error("Extraction error:", err.message);
    res.status(err.status || 500).json({ error: err.message || "Extraction failed" });
  }
}

async function classify(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const forms = await FormSchema.find().select("formId title description").lean();
    if (forms.length === 0) {
      return res.status(404).json({ error: "No forms are available yet" });
    }

    const result = await classifyFormType(text.trim(), forms);
    res.json(result);
  } catch (err) {
    console.error("Classification error:", err.message);
    res.status(err.status || 500).json({ error: err.message || "Classification failed" });
  }
}

async function generateSchema(req, res) {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: "description is required" });
    }

    const result = await generateFormSchema(description.trim());
    res.json(result);
  } catch (err) {
    console.error("Form generation error:", err.message);
    res.status(err.status || 500).json({ error: err.message || "Form generation failed" });
  }
}

module.exports = { extract, classify, generateSchema };