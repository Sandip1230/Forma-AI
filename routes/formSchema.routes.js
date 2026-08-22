const express = require("express");
const { getSchema, listSchemas, createSchema, submitResponse } = require("../controllers/formSchemaController");
const { extract } = require("../controllers/extractionController");

const router = express.Router();

router.get("/", listSchemas);
router.post("/", createSchema);
router.get("/:formId", getSchema);
router.post("/:formId/responses", submitResponse);
router.post("/:formId/extract", extract);

module.exports = router;