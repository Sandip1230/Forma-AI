import { describe, test, expect } from "vitest";
import { rulesForField } from "./validators";

describe("rulesForField", () => {
  test("a required field gets a required rule with the field's label in the message", () => {
    const rules = rulesForField({ id: "name", label: "Full name", type: "text", required: true });
    expect(rules.required).toBe("Full name is required");
  });

  test("a non-required field has no required rule", () => {
    const rules = rulesForField({ id: "name", label: "Full name", type: "text", required: false });
    expect(rules.required).toBeUndefined();
  });

  test("a text field with a pattern gets a pattern rule using the custom message", () => {
    const rules = rulesForField({
      id: "zip",
      label: "ZIP code",
      type: "text",
      pattern: "^\\d{5}$",
      patternMessage: "Must be a 5-digit ZIP code",
    });
    expect(rules.pattern.value).toBeInstanceOf(RegExp);
    expect(rules.pattern.value.test("12345")).toBe(true);
    expect(rules.pattern.value.test("abcde")).toBe(false);
    expect(rules.pattern.message).toBe("Must be a 5-digit ZIP code");
  });

  test("a text field with a pattern but no patternMessage falls back to a default message", () => {
    const rules = rulesForField({ id: "zip", label: "ZIP code", type: "text", pattern: "^\\d{5}$" });
    expect(rules.pattern.message).toBe("Invalid format");
  });

  test("pattern is ignored on non-text field types even if present", () => {
    const rules = rulesForField({ id: "count", label: "Count", type: "number", pattern: "^\\d+$" });
    expect(rules.pattern).toBeUndefined();
  });

  test("a plain optional field with no pattern produces no rules", () => {
    const rules = rulesForField({ id: "notes", label: "Notes", type: "textarea" });
    expect(rules).toEqual({});
  });

  test("an email field rejects a value with no @ or domain", () => {
    const rules = rulesForField({ id: "contactEmail", label: "Email", type: "email" });
    expect(rules.pattern.value.test("yashvi")).toBe(false);
    expect(rules.pattern.value.test("yashvi@example.com")).toBe(true);
    expect(rules.pattern.message).toBe("Enter a valid email address");
  });
});
