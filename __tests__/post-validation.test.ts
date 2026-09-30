import { describe, expect, it } from "vitest";
import { validatePost } from "@/lib/posts/validation";

describe("post validation", () => {
  it("requires a non-empty caption", () => {
    expect(validatePost({ caption: "   ", mediaUrl: "" })).toMatchObject({ caption: "Write a caption before posting." });
  });

  it("accepts a caption and an optional http image URL", () => {
    expect(validatePost({ caption: "First ride of the season", mediaUrl: "https://example.com/ride.jpg" })).toEqual({});
  });

  it("rejects non-http image URLs", () => {
    expect(validatePost({ caption: "A day out", mediaUrl: "javascript:alert(1)" })).toMatchObject({ mediaUrl: "Enter a valid http or https image URL." });
  });
});
