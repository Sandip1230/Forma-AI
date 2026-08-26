const express = require("express");
const {
  getSchema, listSchemas, listMySchemas, createSchema, submitResponse, getFormResponses,
  getStats, exportResponses, seedDemo, resetDemoData,
} = require("../controllers/formSchemaController");
const { extract } = require("../controllers/extractionController");
const { getDraft, saveDraft, deleteDraft } = require("../controllers/draftController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Admin tier — global view across every user's forms/submissions.
router.get("/stats", requireAdmin, getStats);
router.get("/export", requireAdmin, exportResponses);
router.post("/seed-demo", requireAdmin, seedDemo);
router.delete("/demo-data", requireAdmin, resetDemoData);
router.get("/", requireAdmin, listSchemas);

// Per-user — "your forms": only what the logged-in user created.
router.get("/mine", requireAuth, listMySchemas);
router.post("/", requireAuth, createSchema);
router.get("/:formId/responses", requireAuth, getFormResponses);

// Public — the actual fill experience; no login required to file a claim.
router.get("/:formId", getSchema);
router.post("/:formId/responses", submitResponse);
router.post("/:formId/extract", extract);

router.get("/:formId/draft/:draftId", getDraft);
router.put("/:formId/draft/:draftId", saveDraft);
router.delete("/:formId/draft/:draftId", deleteDraft);

module.exports = router;
