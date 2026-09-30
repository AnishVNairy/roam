import { describe, expect, it } from "vitest";
import { MAX_COMMENT_LENGTH, normalizeComment, validateComment } from "@/lib/comments/validation";

describe("comment validation", () => {
  it("rejects an empty comment", () => {
    expect(validateComment("")).toBe("Write a comment before sending.");
  });

  it("rejects whitespace-only comments", () => {
    expect(validateComment(" \n  \t ")).toBe("Write a comment before sending.");
  });

  it("accepts valid comment text", () => {
    expect(validateComment("A good stretch of road.")).toBeNull();
  });

  it("rejects comments longer than the MVP limit", () => {
    expect(validateComment("x".repeat(MAX_COMMENT_LENGTH + 1))).toBe("Comments must be 1,000 characters or fewer.");
  });

  it("trims surrounding whitespace before storing", () => {
    expect(normalizeComment("  Nice view. \n")).toBe("Nice view.");
    expect(validateComment("  Nice view. \n")).toBeNull();
  });
});
