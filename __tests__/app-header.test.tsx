import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/app-header";

const supabase = vi.hoisted(() => ({ createClient: vi.fn(), from: vi.fn(), select: vi.fn(), is: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({ createClient: supabase.createClient }));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));
vi.mock("@/components/sign-out-button", () => ({ SignOutButton: () => <button>Sign out</button> }));

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  const query = { select: supabase.select, is: supabase.is };
  supabase.is.mockResolvedValue({ count: 4, error: null });
  supabase.select.mockReturnValue(query);
  supabase.from.mockReturnValue(query);
  supabase.createClient.mockResolvedValue({ from: supabase.from });
});

describe("AppHeader navigation", () => {
  it("links authenticated riders to Home feed, Create post, Notifications, and Profile", async () => {
    render(await AppHeader({ email: "rider@example.com" }));
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });

    expect(within(navigation).getByRole("link", { name: "Home feed" }).getAttribute("href")).toBe("/");
    expect(within(navigation).getByRole("link", { name: "Create post" }).getAttribute("href")).toBe("/create-post");
    expect(within(navigation).getByRole("link", { name: "Notifications, 4 unread" }).getAttribute("href")).toBe("/notifications");
    expect(within(navigation).getByRole("link", { name: "Profile" }).getAttribute("href")).toBe("/profile");
    expect(supabase.from).toHaveBeenCalledWith("notifications");
    expect(supabase.select).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(supabase.is).toHaveBeenCalledWith("read_at", null);
  });

  it("places the full navigation on its own row at narrow widths", async () => {
    render(await AppHeader({ email: "rider@example.com" }));
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });

    expect(navigation.className).toContain("order-3");
    expect(navigation.className).toContain("w-full");
    expect(navigation.className).toContain("md:w-auto");
  });

  it("does not show a badge when there are no unread notifications", async () => {
    supabase.is.mockResolvedValue({ count: 0, error: null });
    render(await AppHeader({ email: "rider@example.com" }));

    expect(screen.getByRole("link", { name: "Notifications" })).toBeDefined();
  });
});
