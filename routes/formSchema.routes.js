const express = require("express");
const { getSchema, listSchemas, createSchema, submitResponse } = require("../controllers/formSchemaController");

const router = express.Router();

router.get("/", listSchemas);
router.post("/", createSchema);
router.get("/:formId", getSchema);
router.post("/:formId/responses", submitResponse);

module.exports = router;