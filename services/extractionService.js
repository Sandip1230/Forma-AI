const { z } = require("zod");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

// Turns one form field definition into a Zod field so the LLM's output is
// validated against the exact shape the form actually needs — not just
// "return some JSON" and hoping it matches.
function zodForField(field) {
  let valueSchema;
  switch (field.type) {
    case "number":
      valueSchema = z.number();
      break;
    case "checkbox":
      valueSchema = z.boolean();
      break;
    case "select":
      valueSchema = z.enum(field.options.map((o) => o.value));
      break;
    default: // text, textarea, date
      valueSchema = z.string();
  }
  // The whole {value, confidence} object is .optional(), not .nullable():
  // Gemini's function-calling schema requires `type` to be a single scalar
  // (e.g. "string"), but zod's JSON Schema conversion represents `.nullable()`
  // as `type: ["string", "null"]` — an array — which Gemini rejects outright
  // ("Proto field is not repeating, cannot start list"). .optional() gets the
  // same "field may be absent" behavior via the JSON Schema `required` array
  // instead, which Gemini supports fine, and filledFieldIds already treats a
  // missing key the same as an explicit null. value/confidence stay required
  // *within* the object so a field is never filled without a confidence
  // rating attached.
  return z
    .object({
      value: valueSchema.describe(field.label + (field.placeholder ? ` (e.g. ${field.placeholder})` : "")),
      confidence: z
        .enum(["high", "low"])
        .describe(
          "\"high\" if the text states or very directly implies this value; \"low\" if you had to infer it, chose between plausible options, or the text only loosely suggests it."
        ),
    })
    .optional();
}

function buildExtractionSchema(fields) {
  const shape = {};
  fields.forEach((f) => {
    shape[f.id] = zodForField(f);
  });
  return z.object(shape);
}

// Zod validation failures are thrown as `OutputParserException` by
// @langchain/core regardless of provider (node_modules/@langchain/core/dist/
// output_parsers/base.cjs), tagged with `lc_error_code`. Everything else
// bubbles up raw from the `@google/generative-ai` SDK that
// @langchain/google-genai wraps (node_modules/@google/generative-ai/dist/
// index.js) — HTTP errors (401/403/429/etc.) carry a numeric `.status` on a
// `GoogleGenerativeAIFetchError`, aborts/timeouts are a distinct
// `GoogleGenerativeAIAbortError`, and raw fetch failures (DNS, connection
// refused) are the bare `GoogleGenerativeAIError` with no `.status`. We match
// on constructor name instead of `instanceof` since `@google/generative-ai`
// is @langchain/google-genai's transitive dependency, not ours.
function mapExtractionError(err) {
  if (err.lc_error_code === "OUTPUT_PARSING_FAILURE") {
    const wrapped = new Error(
      "The AI's response didn't match the form's fields. Try rephrasing your description, or fill the form manually."
    );
    wrapped.status = 502;
    wrapped.cause = err;
    return wrapped;
  }
  if (err.status === 429) {
    const wrapped = new Error("The AI service is rate-limited right now. Please try again in a moment.");
    wrapped.status = 429;
    wrapped.cause = err;
    return wrapped;
  }
  if (err.status === 401 || err.status === 403) {
    const wrapped = new Error("The AI service rejected the server's API key.");
    wrapped.status = 500;
    wrapped.cause = err;
    return wrapped;
  }
  if (err.constructor?.name === "GoogleGenerativeAIAbortError") {
    const wrapped = new Error("The AI service took too long to respond. Please try again.");
    wrapped.status = 504;
    wrapped.cause = err;
    return wrapped;
  }
  if (err.constructor?.name === "GoogleGenerativeAIFetchError") {
    const wrapped = new Error(`The AI service returned an error (status ${err.status}). Please try again.`);
    wrapped.status = 502;
    wrapped.cause = err;
    return wrapped;
  }
  if (err.constructor?.name === "GoogleGenerativeAIError") {
    const wrapped = new Error("Couldn't reach the AI service. Check your network and try again.");
    wrapped.status = 502;
    wrapped.cause = err;
    return wrapped;
  }
  const wrapped = new Error(err.message || "Extraction failed.");
  wrapped.status = err.status || 500;
  wrapped.cause = err;
  return wrapped;
}

async function extractFromText(formSchema, userText) {
  if (!process.env.GOOGLE_API_KEY) {
    const err = new Error("GOOGLE_API_KEY is not configured on the server.");
    err.status = 503;
    throw err;
  }

  const extractionSchema = buildExtractionSchema(formSchema.fields);
  const model = new ChatGoogleGenerativeAI({ model: "gemini-3.5-flash-lite", temperature: 0 });
  // method: "functionCalling" is required here — ChatGoogleGenerativeAI's
  // default structured-output path (jsonSchema mode) only relies on Gemini's
  // own schema-constrained generation and parses the result with a bare
  // JsonOutputParser, skipping Zod validation entirely. functionCalling mode
  // routes through GoogleGenerativeAIToolsOutputParser, which actually
  // validates the result against `extractionSchema` and throws if it doesn't
  // match — preserving the same Zod-validated guarantee the OpenAI path had.
  const structuredModel = model.withStructuredOutput(extractionSchema, {
    name: "extract_form_fields",
    method: "functionCalling",
  });

  const systemPrompt = [
    `You extract structured data from a user's free-text description to fill out a form titled "${formSchema.title}".`,
    "Only fill a field if the text clearly supports it or very directly implies it. If a field isn't mentioned or is ambiguous, omit it entirely — never guess.",
    "Do not invent information that isn't stated or clearly implied in the text.",
    "For every field you do fill in, also rate your own confidence: \"high\" if the text states or very directly implies it, \"low\" if you had to infer it, pick between multiple plausible options, or the text only loosely suggests it.",
  ].join(" ");

  let result;
  try {
    result = await structuredModel.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ]);
  } catch (err) {
    throw mapExtractionError(err);
  }

  // `result` is { fieldId: { value, confidence } | undefined, ... }. Flatten
  // to a plain fieldId -> value map (the shape the form/prefill code already
  // expects) plus filledFieldIds (unchanged contract) and the new
  // lowConfidenceFieldIds, so existing consumers of values/filledFieldIds
  // don't need to change to keep working.
  const values = {};
  const filledFieldIds = [];
  const lowConfidenceFieldIds = [];

  for (const [fieldId, entry] of Object.entries(result)) {
    if (!entry || entry.value === null || entry.value === undefined || entry.value === "") continue;
    values[fieldId] = entry.value;
    filledFieldIds.push(fieldId);
    if (entry.confidence === "low") lowConfidenceFieldIds.push(fieldId);
  }

  return { values, filledFieldIds, lowConfidenceFieldIds };
}

// Distinct from any real formId a user could type into CreateForm (which only
// allows letters/numbers/hyphens) so it can never collide with an actual form.
const NO_MATCH = "__no_match__";

// Picks which of several existing form types a free-text description is
// most likely about — the step that lets a user describe what they need
// *before* knowing which form to open, instead of Magic Input only being
// usable after already navigating to a specific form's page.
async function classifyFormType(text, formSummaries) {
  if (!process.env.GOOGLE_API_KEY) {
    const err = new Error("GOOGLE_API_KEY is not configured on the server.");
    err.status = 503;
    throw err;
  }

  const formIds = formSummaries.map((f) => f.formId);
  const classificationSchema = z.object({
    formId: z
      .enum([...formIds, NO_MATCH])
      .describe(`The formId of the single best-matching form, or "${NO_MATCH}" if none of them plausibly fit.`),
  });

  const model = new ChatGoogleGenerativeAI({ model: "gemini-3.5-flash-lite", temperature: 0 });
  const structuredModel = model.withStructuredOutput(classificationSchema, {
    name: "classify_form_type",
    method: "functionCalling",
  });

  const formList = formSummaries
    .map((f) => `- formId "${f.formId}": ${f.title}${f.description ? ` — ${f.description}` : ""}`)
    .join("\n");

  const systemPrompt = [
    "A user described what they need in their own words. Match it to the single form type it's most likely about, out of these available forms:",
    formList,
    `Respond with that form's formId. If none of them plausibly relate to what the user described, respond with "${NO_MATCH}" instead of guessing.`,
  ].join("\n");

  let result;
  try {
    result = await structuredModel.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ]);
  } catch (err) {
    throw mapExtractionError(err);
  }

  if (result.formId === NO_MATCH) return { formId: null };
  const matched = formSummaries.find((f) => f.formId === result.formId);
  return { formId: matched.formId, title: matched.title };
}

const FIELD_TYPES = ["text", "textarea", "select", "checkbox", "date", "number", "email", "phone"];

const generatedFieldSchema = z.object({
  label: z.string().describe("A short, human-readable field label, e.g. \"Policy number\"."),
  type: z.enum(FIELD_TYPES).describe("select for a fixed set of choices; email/phone for contact info; checkbox for yes/no."),
  required: z.boolean(),
  options: z
    .array(z.string())
    .optional()
    .describe("Only when type is \"select\": 2-6 realistic option labels. Omit for every other type."),
});

const formGenerationSchema = z.object({
  title: z.string().describe("A short, clear title for the form."),
  description: z.string().describe("One sentence describing what this form is for."),
  fields: z.array(generatedFieldSchema).min(3).max(12).describe("The fields this form needs to collect."),
});

// Turns a label into a field id the same way the CreateForm builder's own
// slugify() does, plus a counter suffix on collision — the AI generates
// labels, not ids, so two fields sharing a label (or one just being
// ambiguous) can't silently produce duplicate/invalid ids.
function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

function uniqueId(base, used) {
  const safeBase = base || "field";
  let id = safeBase;
  let i = 2;
  while (used.has(id)) {
    id = `${safeBase}${i}`;
    i += 1;
  }
  used.add(id);
  return id;
}

// Drafts a form's fields from a plain-language description — the "AI Form
// Builder" option on Create Form, alongside the fixed templates and
// starting from scratch. Deliberately doesn't generate showIf branching:
// the AI inventing a conditional that references a field/option that
// doesn't quite match would silently break, where inventing a flat field
// list has no such failure mode — branching is still addable by hand
// afterward in the same builder.
async function generateFormSchema(description) {
  if (!process.env.GOOGLE_API_KEY) {
    const err = new Error("GOOGLE_API_KEY is not configured on the server.");
    err.status = 503;
    throw err;
  }

  const model = new ChatGoogleGenerativeAI({ model: "gemini-3.5-flash-lite", temperature: 0.2 });
  const structuredModel = model.withStructuredOutput(formGenerationSchema, {
    name: "generate_form_schema",
    method: "functionCalling",
  });

  const systemPrompt = [
    "You design a data-collection form's fields based on a description of what the form is for.",
    "Return a short title, a one-sentence description, and 3 to 12 fields that comprehensively but efficiently capture what this form needs to collect.",
    "Use \"select\" for any field with a natural fixed set of choices, \"email\"/\"phone\" for contact fields, \"date\" for dates, \"number\" for quantities or amounts, \"checkbox\" for yes/no.",
    "Mark a field required only if the form genuinely can't be processed without it.",
  ].join(" ");

  let result;
  try {
    result = await structuredModel.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: description },
    ]);
  } catch (err) {
    throw mapExtractionError(err);
  }

  const usedIds = new Set();
  const fields = result.fields.map((f) => {
    const id = uniqueId(slugify(f.label), usedIds);
    const field = { id, label: f.label, type: f.type, required: f.required };
    if (f.type === "select") {
      const opts = (f.options && f.options.length > 0 ? f.options : ["Option 1", "Option 2"]);
      const usedValues = new Set();
      field.options = opts.map((label) => ({ value: uniqueId(slugify(label), usedValues), label }));
    }
    return field;
  });

  return { title: result.title, description: result.description, fields };
}

module.exports = { extractFromText, classifyFormType, generateFormSchema };