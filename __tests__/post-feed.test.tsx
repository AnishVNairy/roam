import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PostFeed } from "@/components/post-feed";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/app/actions/posts", () => ({ createPostAction: vi.fn(), deletePostAction: vi.fn() }));
afterEach(cleanup);

const post = {
  id: "post-1", user_id: "rider-1", caption: "Found a quiet road before sunrise.",
  media_url: null, created_at: "2026-09-30T07:30:00.000Z",
  author: { username: "road_rider", display_name: "Road Rider", avatar_url: null },
};

describe("PostFeed", () => {
  it("renders rider identity, caption, and timestamp", () => {
    render(<PostFeed posts={[post]} currentUserId="rider-1" />);
    expect(screen.getByText("Road Rider")).toBeDefined();
    expect(screen.getByText("@road_rider")).toBeDefined();
    expect(screen.getByText(post.caption)).toBeDefined();
    expect(document.querySelector('time[datetime="2026-09-30T07:30:00.000Z"]')).not.toBeNull();
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
});
