const express = require("express");
const {
  listFormSchemas,
  getFormSchema,
  createFormSchema,
  submitFormResponse,
} = require("../controllers/formSchemaController");

const router = express.Router();

router.get("/", listFormSchemas);
router.post("/", createFormSchema);
router.get("/:formId", getFormSchema);
router.post("/:formId/responses", submitFormResponse);

module.exports = router;