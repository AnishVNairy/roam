import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationList } from "@/components/notification-list";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));

afterEach(cleanup);

const base = {
  id: "notification-1",
  recipient_id: "rider-1",
  actor_id: "rider-2",
  type: "post_like" as const,
  post_id: "post-1",
  comment_id: null,
  read_at: null,
  created_at: "2026-10-04T08:00:00.000Z",
};

describe("notification list", () => {
  it("renders a linked post-like notification without individual read controls", () => {
    render(<NotificationList notifications={[{ ...base, actor: { username: "road_rider", display_name: "Road Rider" } }]} />);

    expect(screen.getByText("Road Rider liked your post")).toBeDefined();
    expect(screen.getByRole("link", { name: "Road Rider liked your post" }).getAttribute("href")).toBe("/?post=post-1#post-post-1");
    expect(screen.queryByRole("button", { name: /mark as read/i })).toBeNull();
  });

  it("renders comment and follow events, and handles a deleted actor safely", () => {
    render(<NotificationList notifications={[
      { ...base, id: "notification-2", type: "post_comment", comment_id: "comment-1", actor_id: null, actor: null },
      { ...base, id: "notification-3", type: "new_follower", post_id: null, actor: { username: "rider_three", display_name: "Rider Three" } },
      { ...base, id: "notification-4", type: "new_follower", post_id: null, actor_id: null, actor: null },
    ]} />);

    expect(screen.getByText("A rider commented on your post")).toBeDefined();
    expect(screen.getByRole("link", { name: "A rider commented on your post" }).getAttribute("href")).toBe("/?post=post-1#post-post-1");
    expect(screen.getByRole("link", { name: "Rider Three started following you" }).getAttribute("href")).toBe("/riders/rider_three");
    expect(screen.getByText("A rider started following you").closest("a")).toBeNull();
  });

  it("keeps an already-read notification linked without read controls", () => {
    render(<NotificationList notifications={[{
      ...base,
      read_at: "2026-10-04T09:00:00.000Z",
      actor: { username: "road_rider", display_name: "Road Rider" },
    }]} />);

    expect(screen.getByRole("link", { name: "Road Rider liked your post" })).toBeDefined();
    expect(screen.queryByRole("button", { name: /mark as read/i })).toBeNull();
  });
});
