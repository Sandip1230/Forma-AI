// TEMPORARY mock data standing in for real API responses.
// Shape matches controllers/formSchemaController.js's listSchemas() output,
// plus a submissionCount field a future endpoint will add.
export const mockForms = [
  { formId: "claim-demo", title: "Auto Insurance Claim", fieldCount: 6, submissionCount: 14, createdAt: "2026-08-12T10:00:00Z" },
  { formId: "home-claim", title: "Homeowners Claim Intake", fieldCount: 9, submissionCount: 3, createdAt: "2026-08-16T14:30:00Z" },
  { formId: "policy-renewal", title: "Policy Renewal Request", fieldCount: 5, submissionCount: 0, createdAt: "2026-08-18T09:15:00Z" },
];

export const mockStats = {
  totalForms: mockForms.length,
  totalSubmissions: mockForms.reduce((sum, f) => sum + f.submissionCount, 0),
  submissionsToday: 2,
};