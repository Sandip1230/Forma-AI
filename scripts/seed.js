// One-off script: `npm run seed`
// Inserts (or updates) the same "claim-demo" form that
// client/src/lib/exampleSchema.js uses as its offline fallback, so the
// real API path (GET /api/forms/claim-demo) returns matching data instead
// of the frontend silently falling back to the local fixture.
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const FormSchema = require("../models/FormSchema");

const claimDemo = {
  formId: "claim-demo",
  title: "Auto Insurance Claim",
  fields: [
    {
      id: "incidentType",
      label: "What happened?",
      type: "select",
      required: true,
      options: [
        { value: "animal_collision", label: "Animal collision" },
        { value: "single_vehicle", label: "Single-vehicle accident" },
        { value: "multi_vehicle", label: "Multi-vehicle accident" },
        { value: "weather", label: "Weather-related damage" },
      ],
    },
    { id: "vehicle", label: "Vehicle (make/model)", type: "text", required: true, placeholder: "e.g. Honda Civic" },
    { id: "damage", label: "Damage description", type: "text", required: true, placeholder: "e.g. Windshield" },
    { id: "incidentDate", label: "Date of incident", type: "date", required: true },
    {
      id: "details",
      label: "Anything else we should know?",
      type: "textarea",
      required: false,
      placeholder: "Optional additional context",
    },
    { id: "agreeAccurate", label: "I confirm this information is accurate", type: "checkbox", required: true },
  ],
};

async function seed() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error("[seed] Not connected to MongoDB — set MONGO_URI in .env and try again.");
    process.exit(1);
  }

  const doc = await FormSchema.findOneAndUpdate(
    { formId: claimDemo.formId },
    claimDemo,
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  console.log(`[seed] Upserted form "${doc.formId}" (${doc.fields.length} fields).`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});