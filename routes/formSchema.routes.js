const express = require("express");
const {
  getSchema, listSchemas, createSchema, submitResponse, getFormResponses,
  getStats, exportResponses, seedDemo, resetDemoData,
} = require("../controllers/formSchemaController");
const { extract } = require("../controllers/extractionController");
const { getDraft, saveDraft, deleteDraft } = require("../controllers/draftController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// One shared Schema Store — any logged-in user can create/manage forms and
// see everyone's stats/submissions, matching a small team's internal tool
// rather than per-user private form collections.
router.get("/export", requireAuth, exportResponses);
router.post("/seed-demo", requireAuth, seedDemo);
router.delete("/demo-data", requireAuth, resetDemoData);
router.get("/", requireAuth, listSchemas);
router.get("/stats", requireAuth, getStats);
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
