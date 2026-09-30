import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/components/auth-form";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/app/actions/auth", () => ({ signInAction: vi.fn(), signUpAction: vi.fn() }));

afterEach(cleanup);

describe("AuthForm", () => {
  it("renders login credentials and a local next destination", () => {
    render(<AuthForm mode="login" next="/profile/edit" />);
    expect(screen.getByRole("heading", { name: "Pick up where you left off" })).toBeDefined();
    expect(screen.getByLabelText("Email address").getAttribute("type")).toBe("email");
    expect(screen.getByLabelText("Password", { exact: true }).getAttribute("type")).toBe("password");
    expect(document.querySelector<HTMLInputElement>('input[name="next"]')?.value).toBe("/profile/edit");
  });

  it("allows riders to reveal their password", () => {
    render(<AuthForm mode="signup" />);
    const password = screen.getByLabelText("Password", { exact: true });
    fireEvent.click(screen.getAllByRole("button", { name: "Show password" })[0]);
    expect(password.getAttribute("type")).toBe("text");
  });

  it("renders password confirmation for signup", () => {
    render(<AuthForm mode="signup" />);
    expect(screen.getByRole("heading", { name: "Create your rider account" })).toBeDefined();
    expect(screen.getByLabelText("Confirm password")).toBeDefined();
    expect(screen.getByRole("link", { name: "Sign in" })).toBeDefined();
  });
});
