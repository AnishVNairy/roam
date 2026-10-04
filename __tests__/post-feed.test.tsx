import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PostFeed } from "@/components/post-feed";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/app/actions/posts", () => ({ createPostAction: vi.fn(), deletePostAction: vi.fn() }));
vi.mock("@/app/actions/likes", () => ({ likePostAction: vi.fn(), unlikePostAction: vi.fn() }));
vi.mock("@/app/actions/comments", () => ({ createCommentAction: vi.fn(), deleteCommentAction: vi.fn() }));
afterEach(cleanup);

const post = {
  id: "post-1", user_id: "rider-1", caption: "Found a quiet road before sunrise.",
  media_url: null, created_at: "2026-09-30T07:30:00.000Z",
  like_count: 0, liked_by_current_user: false, comment_count: 2, comments: [],
  author: { username: "road_rider", display_name: "Road Rider", avatar_url: null },
};

describe("PostFeed", () => {
  it("renders rider identity, caption, and timestamp", () => {
    render(<PostFeed posts={[post]} currentUserId="rider-1" />);
    expect(document.getElementById("post-post-1")).not.toBeNull();
    expect(screen.getByText("Road Rider")).toBeDefined();
    expect(screen.getByText("@road_rider")).toBeDefined();
    expect(screen.getByText(post.caption)).toBeDefined();
    expect(document.querySelector('time[datetime="2026-09-30T07:30:00.000Z"]')).not.toBeNull();
    expect(screen.getByRole("link", { name: "Road Rider @road_rider" }).getAttribute("href")).toBe("/riders/road_rider");
  });

  it("keeps a post's comments inside the post notification links target", () => {
    const postWithComment = {
      ...post,
      comments: [{
        id: "comment-1", post_id: post.id, user_id: "rider-2", content: "Great road.",
        created_at: "2026-09-30T08:00:00.000Z",
        author: { username: "other_rider", display_name: "Other Rider", avatar_url: null },
      }],
    };
    render(<PostFeed posts={[postWithComment]} currentUserId="rider-1" />);

    const targetPost = document.getElementById("post-post-1");
    expect(targetPost).not.toBeNull();
    expect(targetPost?.querySelector('[aria-label="Comments on this post"]')).not.toBeNull();
    expect(targetPost?.textContent).toContain("Great road.");
  });

  it("shows an invitation when the feed is empty", () => {
    render(<PostFeed posts={[]} currentUserId="rider-1" />);
    expect(screen.getByText("The road is quiet for now.")).toBeDefined();
    expect(screen.getByRole("link", { name: "Share the first update" })).toBeDefined();
  });

  it("shows delete only on the current rider's post", () => {
    const otherPost = { ...post, id: "post-2", user_id: "rider-2" };
    render(<PostFeed posts={[post, otherPost]} currentUserId="rider-1" />);
    expect(screen.getAllByRole("button", { name: "Delete post" })).toHaveLength(1);
  });

  it("shows each post's like count and current liked state", () => {
    const likedPost = { ...post, id: "post-2", like_count: 7, liked_by_current_user: true };
    render(<PostFeed posts={[post, likedPost]} currentUserId="rider-1" />);

    expect(screen.getByRole("button", { name: "Like post" }).textContent).toContain("0");
    const likedButton = screen.getByRole("button", { name: "Unlike post" });
    expect(likedButton.textContent).toContain("7");
    expect(likedButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("shows the comment count beside the like count", () => {
    render(<PostFeed posts={[post]} currentUserId="rider-1" />);

    expect(screen.getByRole("img", { name: "2 comments" })).toBeDefined();
  });
});
