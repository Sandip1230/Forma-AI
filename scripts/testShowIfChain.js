// Proves resolveVisibility() correctly resolves a multi-level showIf chain.
// Run with: node scripts/testShowIfChain.js
//
// Uses the real claim-demo fields (lib/exampleFormSchema.js) rather than a
// synthetic fixture, since that form already has exactly the 3-level chain
// this needs to prove: incidentType (A) -> weatherCondition (B, shows when
// A === "weather") -> waterDepth (C, shows when B === "flood").
const { resolveVisibility } = require("../controllers/formSchemaController");
const { fields } = require("../lib/exampleFormSchema");

const scenarios = [
  {
    name: "Nothing filled in yet",
    values: {},
    expect: { animalType: false, weatherCondition: false, waterDepth: false },
  },
  {
    name: "A set, but to a value that doesn't lead to B",
    values: { incidentType: "animal_collision" },
    expect: { animalType: true, weatherCondition: false, waterDepth: false },
  },
  {
    name: "A set to the value B depends on, but B itself not answered yet",
    values: { incidentType: "weather" },
    expect: { animalType: false, weatherCondition: true, waterDepth: false },
  },
  {
    name: "A -> B satisfied, but B's own value doesn't lead to C",
    values: { incidentType: "weather", weatherCondition: "wind" },
    expect: { animalType: false, weatherCondition: true, waterDepth: false },
  },
  {
    name: "Full chain: A -> B -> C all satisfied (the actual 3-level case)",
    values: { incidentType: "weather", weatherCondition: "flood" },
    expect: { animalType: false, weatherCondition: true, waterDepth: true },
  },
  {
    name: "Cascading hide: A changed away after B/C were set — stale B/C values must not leak through",
    values: { incidentType: "single_vehicle", weatherCondition: "flood", waterDepth: "over_24in" },
    expect: { animalType: false, weatherCondition: false, waterDepth: false },
  },
];

let failures = 0;

for (const { name, values, expect } of scenarios) {
  const visibility = resolveVisibility(fields, values);
  const checks = Object.entries(expect).map(([fieldId, expected]) => {
    const actual = visibility[fieldId];
    const ok = actual === expected;
    if (!ok) failures += 1;
    return { fieldId, expected, actual, ok };
  });

  const allOk = checks.every((c) => c.ok);
  console.log(`${allOk ? "PASS" : "FAIL"} — ${name}`);
  console.log(`  values: ${JSON.stringify(values)}`);
  for (const c of checks) {
    const marker = c.ok ? "  ok " : "  ✗  ";
    console.log(`${marker}${c.fieldId}: expected ${c.expected}, got ${c.actual}`);
  }
  console.log("");
}

if (failures > 0) {
  console.log(`${failures} check(s) failed.`);
  process.exit(1);
} else {
  console.log("All scenarios passed — the 3-level showIf chain (incidentType -> weatherCondition -> waterDepth) resolves correctly.");
  process.exit(0);
}
