const { z } = require("zod");
const { ChatOpenAI } = require("@langchain/openai");

// Turns one form field definition into a Zod field so the LLM's output is
// validated against the exact shape the form actually needs — not just
// "return some JSON" and hoping it matches.
function zodForField(field) {
  let schema;
  switch (field.type) {
    case "number":
      schema = z.number();
      break;
    case "checkbox":
      schema = z.boolean();
      break;
    case "select":
      schema = z.enum(field.options.map((o) => o.value));
      break;
    default: // text, textarea, date
      schema = z.string();
  }
  return schema
    .nullable()
    .describe(field.label + (field.placeholder ? ` (e.g. ${field.placeholder})` : ""));
}

function buildExtractionSchema(fields) {
  const shape = {};
  fields.forEach((f) => {
    shape[f.id] = zodForField(f);
  });
  return z.object(shape);
}

async function extractFromText(formSchema, userText) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error("OPENAI_API_KEY is not configured on the server.");
    err.status = 503;
    throw err;
  }

  const extractionSchema = buildExtractionSchema(formSchema.fields);
  const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });
  const structuredModel = model.withStructuredOutput(extractionSchema, { name: "extract_form_fields" });

  const systemPrompt = [
    `You extract structured data from a user's free-text description to fill out a form titled "${formSchema.title}".`,
    "Only fill a field if the text clearly supports it. If a field isn't mentioned or is ambiguous, return null for it — never guess.",
    "Do not invent information that isn't stated or clearly implied in the text.",
  ].join(" ");

  const result = await structuredModel.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: userText },
  ]);

  // Only report back fields the model actually populated (non-null), so
  // the frontend can distinguish "AI filled this" from "AI left this blank".
  const filledFieldIds = Object.entries(result)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k]) => k);

  return { values: result, filledFieldIds };
}

module.exports = { extractFromText };