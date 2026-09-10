module.exports = {
  formId: "claim-demo",
  title: "Auto Insurance Claim",
  description: "File a claim for a car accident, an animal collision, or weather-related vehicle damage.",
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
    { id: "animalType", label: "What kind of animal?", type: "text", required: true, placeholder: "e.g. Deer", showIf: { field: "incidentType", equals: "animal_collision" } },
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
      showIf: { field: "weatherCondition", equals: "flood" },
    },
    { id: "vehicle", label: "Vehicle (make/model)", type: "text", required: true, placeholder: "e.g. Honda Civic" },
    { id: "damage", label: "Damage description", type: "text", required: true, placeholder: "e.g. Windshield" },
    { id: "incidentDate", label: "Date of incident", type: "date", required: true },
    { id: "contactEmail", label: "Your email (for a confirmation)", type: "email", required: false, placeholder: "e.g. you@example.com" },
    { id: "details", label: "Anything else we should know?", type: "textarea", required: false, placeholder: "Optional additional context" },
    { id: "agreeAccurate", label: "I confirm this information is accurate", type: "checkbox", required: true },
  ],
};