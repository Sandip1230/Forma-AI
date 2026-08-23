require("dotenv").config();
const mongoose = require("mongoose");
const FormSchema = require("../models/FormSchema");

const exampleSchema = {
  formId: "claim-demo",
  title: "Auto Insurance Claim",
  fields: [
    {
      id: "incidentType", label: "What happened?", type: "select", required: true,
      options: [
        { value: "animal_collision", label: "Animal collision" },
        { value: "single_vehicle", label: "Single-vehicle accident" },
        { value: "multi_vehicle", label: "Multi-vehicle accident" },
        { value: "weather", label: "Weather-related damage" },
      ],
    },
    {
      id: "animalType", label: "What kind of animal?", type: "text", required: true,
      placeholder: "e.g. Deer", showIf: { field: "incidentType", equals: "animal_collision" },
    },
    {
      id: "weatherCondition", label: "What kind of weather event?", type: "select", required: true,
      options: [
        { value: "flood", label: "Flooding" },
        { value: "hail", label: "Hail" },
        { value: "wind", label: "High wind" },
      ],
      showIf: { field: "incidentType", equals: "weather" },
    },
    {
      id: "waterDepth", label: "Approximate water depth", type: "select", required: true,
      options: [
        { value: "under_6in", label: "Under 6 inches" },
        { value: "6_to_24in", label: "6–24 inches" },
        { value: "over_24in", label: "Over 24 inches" },
      ],
      // Depends on weatherCondition, which itself depends on incidentType —
      // this is the 3-level chain: incidentType -> weatherCondition -> waterDepth
      showIf: { field: "weatherCondition", equals: "flood" },
    },
    { id: "vehicle", label: "Vehicle (make/model)", type: "text", required: true, placeholder: "e.g. Honda Civic" },
    { id: "damage", label: "Damage description", type: "text", required: true, placeholder: "e.g. Windshield" },
    { id: "incidentDate", label: "Date of incident", type: "date", required: true },
    { id: "details", label: "Anything else we should know?", type: "textarea", required: false, placeholder: "Optional additional context" },
    { id: "agreeAccurate", label: "I confirm this information is accurate", type: "checkbox", required: true },
  ],
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  await FormSchema.findOneAndUpdate({ formId: exampleSchema.formId }, exampleSchema, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log(`Seeded form: ${exampleSchema.formId}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});