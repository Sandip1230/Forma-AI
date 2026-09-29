const express = require("express");
const {
  getSchema, listSchemas, createSchema, updateSchema, getSchemaVersions, submitResponse, getFormResponses,
  getStats, getRecentActivity, exportResponses, seedDemo, resetDemoData,
} = require("../controllers/formSchemaController");
const { extract, classify } = require("../controllers/extractionController");
const { getDraft, saveDraft, deleteDraft } = require("../controllers/draftController");
const { streamEvents } = require("../controllers/eventsController");
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
router.get("/recent-activity", requireAuth, getRecentActivity);
// Must be registered before GET /:formId below, or a request for this exact
// path would match that route instead ("events" read as a formId).
router.get("/events", requireAuth, streamEvents);
router.post("/", requireAuth, createSchema);
router.post("/classify", requireAuth, classify);
router.put("/:formId", requireAuth, updateSchema);
router.get("/:formId/versions", requireAuth, getSchemaVersions);
router.get("/:formId/responses", requireAuth, getFormResponses);

// Public — the actual fill experience; no login required to file a claim.
router.get("/:formId", getSchema);
router.post("/:formId/responses", submitResponse);
router.post("/:formId/extract", extract);

router.get("/:formId/draft/:draftId", getDraft);
router.put("/:formId/draft/:draftId", saveDraft);
router.delete("/:formId/draft/:draftId", deleteDraft);

module.exports = router;
