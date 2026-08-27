const express = require("express");
const {
  getSchema, listSchemas, listMySchemas, createSchema, submitResponse, getFormResponses,
  getStats, getMyStats, exportResponses, seedDemo, resetDemoData,
} = require("../controllers/formSchemaController");
const { extract } = require("../controllers/extractionController");
const { getDraft, saveDraft, deleteDraft } = require("../controllers/draftController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Admin-only: global data across every user, and the fixed demo dataset —
// neither is part of a regular user's own-forms workflow.
router.get("/export", requireAdmin, exportResponses);
router.post("/seed-demo", requireAdmin, seedDemo);
router.delete("/demo-data", requireAdmin, resetDemoData);
router.get("/", requireAdmin, listSchemas);
router.get("/stats", requireAdmin, getStats);

// Shared Dashboard — any logged-in user; scoped to their own forms. An
// admin visiting the same page uses the admin-only routes above instead.
router.get("/mine", requireAuth, listMySchemas);
router.get("/mine/stats", requireAuth, getMyStats);
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
