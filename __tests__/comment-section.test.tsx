import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommentSection } from "@/components/comment-section";

vi.mock("@/app/actions/comments", () => ({ createCommentAction: vi.fn(), deleteCommentAction: vi.fn() }));
afterEach(cleanup);

const comments = [{
  id: "comment-1",
  post_id: "post-1",
  user_id: "rider-1",
  content: "A beautiful stretch of road.",
  created_at: "2026-10-01T07:30:00.000Z",
  author: { username: "road_rider", display_name: "Road Rider", avatar_url: null },
}, {
  id: "comment-2",
  post_id: "post-1",
  user_id: "rider-2",
  content: "I should ride that route.",
  created_at: "2026-10-01T07:35:00.000Z",
  author: { username: "rider_two", display_name: "Rider Two", avatar_url: "/rider.png" },
}];

describe("CommentSection", () => {
  it("renders comment authors, avatars, text, and timestamps", () => {
    render(<CommentSection postId="post-1" comments={comments} currentUserId="rider-1" />);

    expect(screen.getByText("Road Rider")).toBeDefined();
    expect(screen.getByText("@road_rider")).toBeDefined();
    expect(screen.getByText(comments[0].content)).toBeDefined();
    expect(screen.getByRole("img", { name: "Road Rider avatar" })).toBeDefined();
    expect(document.querySelector('time[datetime="2026-10-01T07:30:00.000Z"]')).not.toBeNull();
  });

  it("shows delete only for comments owned by the current rider", () => {
    render(<CommentSection postId="post-1" comments={comments} currentUserId="rider-1" />);

    expect(screen.getAllByRole("button", { name: "Delete comment" })).toHaveLength(1);
  });

  it("renders no empty placeholder when there are no comments", () => {
    render(<CommentSection postId="post-1" comments={[]} currentUserId="rider-1" />);

    expect(screen.queryByText("No comments yet.")).toBeNull();
  });
});
