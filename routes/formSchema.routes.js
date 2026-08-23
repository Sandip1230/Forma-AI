const express = require("express");
const {
  getSchema, listSchemas, createSchema, submitResponse,
  getStats, exportResponses, seedDemo, resetDemoData,
} = require("../controllers/formSchemaController");
const { extract } = require("../controllers/extractionController");

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

module.exports = router;