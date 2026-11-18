import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validatePostForm } from "./post-validation";
import { isPostSlugLocked } from "./post-slug-lock";

describe("isPostSlugLocked", () => {
  it("allows slug edits before the post has been scheduled or published", () => {
    assert.equal(isPostSlugLocked(null, null), false);
  });

  describe("validatePostForm", () => {
    function formWith(intent: string, publishedAt: string) {
      const formData = new FormData();
      formData.set("title", "A post");
      formData.set("slug", "a-post");
      formData.set("excerpt", "A short summary.");
      formData.set("content", "# Markdown");
      formData.set("intent", intent);
      formData.set("publishedAt", publishedAt);
      return formData;
    }

    it("accepts a future ISO timestamp with an explicit timezone", () => {
      const scheduledAt = new Date(Date.now() + 60_000).toISOString();
      assert.equal(
        validatePostForm(formWith("schedule", scheduledAt)).success,
        true,
      );
    });

    it("rejects a scheduled time without an explicit timezone", () => {
      assert.equal(
        validatePostForm(formWith("schedule", "2030-01-01T10:00")).success,
        false,
      );
    });
  });

  it("locks the slug once it has ever been published", () => {
    assert.equal(isPostSlugLocked(new Date(), null), true);
  });

  it("locks the slug as soon as a future publication is scheduled", () => {
    assert.equal(isPostSlugLocked(null, new Date(Date.now() + 60_000)), true);
  });
});
