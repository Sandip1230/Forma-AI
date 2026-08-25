const express = require("express");
const {
  getSchema, listSchemas, createSchema, submitResponse,
  getStats, exportResponses, seedDemo, resetDemoData,
} = require("../controllers/formSchemaController");
const { extract } = require("../controllers/extractionController");
const { getDraft, saveDraft, deleteDraft } = require("../controllers/draftController");

const router = express.Router();

router.get("/stats", getStats);
router.get("/export", exportResponses);
router.post("/seed-demo", seedDemo);
router.delete("/demo-data", resetDemoData);

router.get("/", listSchemas);
router.post("/", createSchema);
router.get("/:formId", getSchema);
router.post("/:formId/responses", submitResponse);
router.post("/:formId/extract", extract);

router.get("/:formId/draft/:draftId", getDraft);
router.put("/:formId/draft/:draftId", saveDraft);
router.delete("/:formId/draft/:draftId", deleteDraft);

module.exports = router;