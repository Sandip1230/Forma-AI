// TEMPORARY local fixture. Mirrors the shape models/FormSchema.js will
// define on the backend: { formId, title, fields: [...] }.
// Loosely modeled on the PDF's own example use case (insurance claim).
export const exampleSchema = {
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
    { id: "details", label: "Anything else we should know?", type: "textarea", required: false, placeholder: "Optional additional context" },
    { id: "agreeAccurate", label: "I confirm this information is accurate", type: "checkbox", required: true },
  ],
};