const { toCsvValue } = require("../controllers/formSchemaController");

describe("toCsvValue", () => {
  test("passes plain values through unchanged", () => {
    expect(toCsvValue("hello")).toBe("hello");
    expect(toCsvValue(42)).toBe("42");
    expect(toCsvValue(true)).toBe("true");
  });

  test("null and undefined become an empty string", () => {
    expect(toCsvValue(null)).toBe("");
    expect(toCsvValue(undefined)).toBe("");
  });

  test("quotes and escapes a value containing a comma", () => {
    expect(toCsvValue("Springfield, USA")).toBe('"Springfield, USA"');
  });

  test("quotes and escapes a value containing a newline", () => {
    expect(toCsvValue("line one\nline two")).toBe('"line one\nline two"');
  });

  test("quotes a value containing double quotes and doubles them", () => {
    expect(toCsvValue('She said "hi"')).toBe('"She said ""hi"""');
  });

  test("leaves a value with none of the special characters unquoted", () => {
    expect(toCsvValue("no-special-chars")).toBe("no-special-chars");
  });
});
