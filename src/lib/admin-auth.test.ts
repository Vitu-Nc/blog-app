import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canEditPost } from "./admin-auth";

const verifiedAt = new Date();
const activeAuthor = {
  id: "author-1",
  role: "author" as const,
  status: "active" as const,
  emailVerifiedAt: verifiedAt as Date | null,
};

describe("canEditPost", () => {
  it("rejects a missing post", () => {
    assert.equal(canEditPost(activeAuthor, null), false);
  });

  it("returns the same denial for a missing post and a post owned by another author", () => {
    const missingResult = canEditPost(activeAuthor, null);
    const notOwnerResult = canEditPost(activeAuthor, {
      authorId: "author-2",
    });

    assert.equal(missingResult, notOwnerResult);
  });

  it("rejects disabled and unverified users", () => {
    const post = { authorId: activeAuthor.id };

    assert.equal(
      canEditPost({ ...activeAuthor, status: "disabled" }, post),
      false,
    );
    assert.equal(
      canEditPost({ ...activeAuthor, emailVerifiedAt: null }, post),
      false,
    );
  });

  it("allows an author to edit their own post", () => {
    assert.equal(
      canEditPost(activeAuthor, { authorId: activeAuthor.id }),
      true,
    );
  });

  it("allows admins to edit an existing post", () => {
    assert.equal(
      canEditPost({ ...activeAuthor, role: "admin" }, { authorId: "author-2" }),
      true,
    );
  });

  it("does not allow admins to edit a missing post", () => {
    assert.equal(canEditPost({ ...activeAuthor, role: "admin" }, null), false);
  });
});
