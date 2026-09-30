import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/app-header";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));
vi.mock("@/components/sign-out-button", () => ({ SignOutButton: () => <button>Sign out</button> }));

afterEach(cleanup);

describe("AppHeader navigation", () => {
  it("links authenticated riders to Home feed, Create post, and Profile", () => {
    render(<AppHeader email="rider@example.com" />);
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });

    expect(within(navigation).getByRole("link", { name: "Home feed" }).getAttribute("href")).toBe("/");
    expect(within(navigation).getByRole("link", { name: "Create post" }).getAttribute("href")).toBe("/create-post");
    expect(within(navigation).getByRole("link", { name: "Profile" }).getAttribute("href")).toBe("/profile");
  });

  it("places the full navigation on its own row at narrow widths", () => {
    render(<AppHeader email="rider@example.com" />);
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });

    expect(navigation.className).toContain("order-3");
    expect(navigation.className).toContain("w-full");
    expect(navigation.className).toContain("md:w-auto");
  });
});
