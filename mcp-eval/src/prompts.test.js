import { PROMPTS } from "./prompts.js";

describe("prompts", () => {
  it("should have a slug and query for each prompt", () => {
    for (const prompt of PROMPTS) {
      expect(prompt).toHaveProperty("slug");
      expect(prompt).toHaveProperty("query");
    }
  });

  it("should have unique slugs", () => {
    const slugs = [];
    for (const prompt of PROMPTS) {
      expect(slugs).not.toContain(prompt.slug);
      slugs.push(prompt.slug);
    }
  });
});
