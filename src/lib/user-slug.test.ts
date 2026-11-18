import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createUniqueUserSlug } from "./user-slug";

describe("createUniqueUserSlug", () => {
  it("normalizes display names into lowercase slugs", async () => {
    assert.equal(
      await createUniqueUserSlug("  Zoë O'Neil  ", async () => false),
      "zoe-o-neil",
    );
  });

  it("adds a numeric suffix when a slug is already taken", async () => {
    const taken = new Set(["jane-doe", "jane-doe-2"]);

    assert.equal(
      await createUniqueUserSlug("Jane Doe", async (slug) => taken.has(slug)),
      "jane-doe-3",
    );
  });

  it("avoids reserved route slugs", async () => {
    assert.equal(
      await createUniqueUserSlug("Admin", async () => false),
      "admin-author",
    );
  });

  it("uses a safe fallback for names without slug characters", async () => {
    assert.equal(await createUniqueUserSlug("✨", async () => false), "author");
  });
});
