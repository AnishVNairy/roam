import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
  listSelect: vi.fn(),
  listEq: vi.fn(),
  listOrder: vi.fn(),
  listLimit: vi.fn(),
  unreadSelect: vi.fn(),
  unreadEq: vi.fn(),
  unreadIs: vi.fn(),
  update: vi.fn(),
  updateEq: vi.fn(),
  updateIn: vi.fn(),
  updateIs: vi.fn(),
  unreadCount: 0,
  profileSelect: vi.fn(),
  profileIn: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/components/app-header", () => ({ AppHeader: () => <header aria-label={`Unread notifications: ${mocks.unreadCount}`}>ROAM navigation</header> }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));

import NotificationsPage from "@/app/notifications/page";

afterEach(cleanup);

const recipientId = "11111111-1111-4111-8111-111111111111";
const snapshotIds = ["unread-before-open", "older-unread"];

const rows = [
  {
    id: snapshotIds[0], recipient_id: recipientId, actor_id: "rider-2", type: "post_like" as const,
    post_id: "post-1", comment_id: null, read_at: null, created_at: "2026-10-04T08:00:00.000Z",
  },
  {
    id: "arrived-after-open", recipient_id: recipientId, actor_id: null, type: "new_follower" as const,
    post_id: null, comment_id: null, read_at: null, created_at: "2026-10-04T08:01:00.000Z",
  },
];

function configureQueries({ unreadError = null, updateError = null }: { unreadError?: { message: string } | null; updateError?: { message: string } | null } = {}) {
  const listQuery = { eq: mocks.listEq, order: mocks.listOrder, limit: mocks.listLimit };
  const unreadQuery = { eq: mocks.unreadEq, is: mocks.unreadIs };
  const updateQuery = { eq: mocks.updateEq, in: mocks.updateIn, is: mocks.updateIs };
  const profileQuery = { in: mocks.profileIn };
  mocks.listEq.mockReturnValue(listQuery);
  mocks.listOrder.mockReturnValue(listQuery);
  mocks.listLimit.mockResolvedValue({ data: rows, error: null });
  mocks.unreadEq.mockReturnValue(unreadQuery);
  mocks.unreadIs.mockResolvedValue({ data: unreadError ? null : snapshotIds.map((id) => ({ id })), error: unreadError });
  mocks.updateEq.mockReturnValue(updateQuery);
  mocks.updateIn.mockReturnValue(updateQuery);
  mocks.updateIs.mockImplementation(async () => {
    if (!updateError) mocks.unreadCount -= snapshotIds.length;
    return { error: updateError };
  });
  mocks.profileIn.mockResolvedValue({ data: [{ id: "rider-2", username: "rider_two", display_name: "Rider Two" }], error: null });
  mocks.listSelect.mockReturnValue(listQuery);
  mocks.unreadSelect.mockReturnValue(unreadQuery);
  mocks.profileSelect.mockReturnValue(profileQuery);
  mocks.update.mockReturnValue(updateQuery);
  mocks.from.mockImplementation((table: string) => {
    if (table === "profiles") return { select: mocks.profileSelect };
    return { select: (columns: string) => columns === "id" ? mocks.unreadSelect(columns) : mocks.listSelect(columns), update: mocks.update };
  });
  mocks.getUser.mockResolvedValue({ data: { user: { id: recipientId, email: "rider@example.com" } }, error: null });
  mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser }, from: mocks.from });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.unreadCount = 3;
  configureQueries();
});

describe("NotificationsPage automatic read behavior", () => {
  it("marks only the authenticated recipient's unread snapshot as read on a successful page load", async () => {
    render(await NotificationsPage());

    expect(mocks.unreadSelect).toHaveBeenCalledWith("id");
    expect(mocks.unreadEq).toHaveBeenCalledWith("recipient_id", recipientId);
    expect(mocks.unreadIs).toHaveBeenCalledWith("read_at", null);
    expect(mocks.update).toHaveBeenCalledWith({ read_at: expect.any(String) });
    expect(mocks.updateEq).toHaveBeenCalledWith("recipient_id", recipientId);
    expect(mocks.updateIn).toHaveBeenCalledWith("id", snapshotIds);
    expect(mocks.updateIs).toHaveBeenCalledWith("read_at", null);
    expect(screen.getByRole("banner", { name: "Unread notifications: 1" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Notifications" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Rider Two liked your post" }).getAttribute("href")).toBe("/?post=post-1#post-post-1");
    const notifications = screen.getByRole("list", { name: "Recent notifications" });
    expect(notifications.querySelector("li:first-child span")?.className).toContain("bg-sage-light");
    expect(notifications.querySelector("li:last-child span")?.className).toContain("bg-signal");
  });

  it("leaves the inbox data unread and shows an error when the database update fails", async () => {
    configureQueries({ updateError: { message: "database unavailable" } });

    render(await NotificationsPage());

    expect(screen.getByRole("alert").textContent).toMatch(/couldn't mark notifications as read/i);
    expect(screen.getByRole("link", { name: "Rider Two liked your post" })).toBeDefined();
    expect(mocks.unreadCount).toBe(3);
    expect(screen.getByRole("banner", { name: "Unread notifications: 3" })).toBeDefined();
    expect(screen.getByRole("list", { name: "Recent notifications" }).querySelector("li:first-child span")?.className).toContain("bg-signal");
  });

  it("does not update notifications or clear the badge when the unread snapshot query fails", async () => {
    configureQueries({ unreadError: { message: "database unavailable" } });

    render(await NotificationsPage());

    expect(mocks.update).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toMatch(/couldn't mark notifications as read/i);
    expect(screen.getByRole("banner", { name: "Unread notifications: 3" })).toBeDefined();
  });

  it("does not attempt an update for an unauthenticated visitor", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(NotificationsPage()).rejects.toThrow("REDIRECT:/login?next=%2Fnotifications");
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
