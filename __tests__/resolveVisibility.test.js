// Jest counterpart to scripts/testShowIfChain.js — same real claim-demo
// fields and scenarios (incidentType -> weatherCondition -> waterDepth),
// wired into `npm test` so the 3-level showIf chain is checked automatically
// instead of only via a manually-run script.
const { resolveVisibility } = require("../controllers/formSchemaController");
const { fields } = require("../lib/exampleFormSchema");

describe("resolveVisibility", () => {
  test("nothing filled in yet — no conditional field is visible", () => {
    const visibility = resolveVisibility(fields, {});
    expect(visibility.animalType).toBe(false);
    expect(visibility.weatherCondition).toBe(false);
    expect(visibility.waterDepth).toBe(false);
  });

  test("parent set to a value that doesn't lead to the child", () => {
    const visibility = resolveVisibility(fields, { incidentType: "animal_collision" });
    expect(visibility.animalType).toBe(true);
    expect(visibility.weatherCondition).toBe(false);
    expect(visibility.waterDepth).toBe(false);
  });

  test("parent set to the value the child depends on, child itself unanswered", () => {
    const visibility = resolveVisibility(fields, { incidentType: "weather" });
    expect(visibility.animalType).toBe(false);
    expect(visibility.weatherCondition).toBe(true);
    expect(visibility.waterDepth).toBe(false);
  });

  test("level 1 -> 2 satisfied, but level 2's value doesn't lead to level 3", () => {
    const visibility = resolveVisibility(fields, { incidentType: "weather", weatherCondition: "wind" });
    expect(visibility.weatherCondition).toBe(true);
    expect(visibility.waterDepth).toBe(false);
  });

  test("full 3-level chain satisfied", () => {
    const visibility = resolveVisibility(fields, { incidentType: "weather", weatherCondition: "flood" });
    expect(visibility.animalType).toBe(false);
    expect(visibility.weatherCondition).toBe(true);
    expect(visibility.waterDepth).toBe(true);
  });

  test("cascading hide: changing the top-level answer hides descendants even if their stale values are still in `values`", () => {
    const visibility = resolveVisibility(fields, {
      incidentType: "single_vehicle",
      weatherCondition: "flood",
      waterDepth: "over_24in",
    });
    expect(visibility.animalType).toBe(false);
    expect(visibility.weatherCondition).toBe(false);
    expect(visibility.waterDepth).toBe(false);
  });

  test("a field with no showIf is always visible", () => {
    const visibility = resolveVisibility(fields, {});
    expect(visibility.incidentType).toBe(true);
  });

  test("a showIf referencing a nonexistent parent field defaults to visible", () => {
    const visibility = resolveVisibility(
      [{ id: "orphan", showIf: { field: "doesNotExist", equals: "x" } }],
      {}
    );
    expect(visibility.orphan).toBe(true);
  });

  test("a circular showIf chain resolves to false instead of infinite-looping", () => {
    const circularFields = [
      { id: "a", showIf: { field: "b", equals: "yes" } },
      { id: "b", showIf: { field: "a", equals: "yes" } },
    ];
    const visibility = resolveVisibility(circularFields, { a: "yes", b: "yes" });
    expect(visibility.a).toBe(false);
    expect(visibility.b).toBe(false);
  });
});
