import { describe, expect, it } from "vitest";
import { creditsFields } from "../src/commands/credits.js";

describe("creditsFields", () => {
  it("leads with the author's own GitHub profile", () => {
    const [first] = creditsFields("en");
    expect(first?.value.startsWith("https://github.com/otnc\n")).toBe(true);
  });

  it("links both the author's profile and the project's own repo", () => {
    for (const locale of ["en", "ja"]) {
      const [first] = creditsFields(locale);
      expect(first?.value).toContain("https://github.com/otnc\n");
      expect(first?.value).toContain("https://github.com/otnc/OpenMiQ");
    }
  });

  it("links makeitaquote's GitHub repo and npm package", () => {
    for (const locale of ["en", "ja"]) {
      const library = creditsFields(locale).find(
        (field) => field.name === "makeitaquote",
      );
      expect(library?.value).toContain("https://github.com/otnc/makeitaquote");
      expect(library?.value).toContain(
        "https://www.npmjs.com/package/makeitaquote",
      );
    }
  });

  it("keeps every field within Discord's limits", () => {
    for (const locale of ["en", "ja"]) {
      for (const field of creditsFields(locale)) {
        expect(field.name.length).toBeLessThanOrEqual(256);
        expect(field.value.length).toBeLessThanOrEqual(1024);
      }
    }
  });
});
