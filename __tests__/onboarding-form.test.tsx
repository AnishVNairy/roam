import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OnboardingForm } from "@/components/onboarding-form";

vi.mock("@/app/actions/profile", () => ({ completeOnboardingAction: vi.fn() }));

afterEach(cleanup);

describe("OnboardingForm", () => {
  it("validates the required rider card before showing the optional motorcycle step", () => {
    render(<OnboardingForm />);
    fireEvent.click(screen.getByRole("button", { name: "Continue to your motorcycle" }));
    expect(screen.getByText("Use 3–24 lowercase letters, numbers, or underscores.")).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Your motorcycle" })).toBeNull();
  });

  it("starts motorcycle fields empty and preserves each step's values when navigating", () => {
    render(<OnboardingForm />);
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "road_rider" } });
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Road Rider" } });
    fireEvent.change(screen.getByLabelText("Home base (optional)"), { target: { value: "Portland" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to your motorcycle" }));

    expect(screen.getByRole("heading", { name: "Your motorcycle" })).toBeDefined();
    expect((screen.getByLabelText("Make (optional)") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Model (optional)") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Model year (optional)") as HTMLInputElement).value).toBe("");
    expect(screen.getByText("Optional for now. You can add the bike that takes you places.")).toBeDefined();

    fireEvent.change(screen.getByLabelText("Make (optional)"), { target: { value: "Honda" } });
    fireEvent.change(screen.getByLabelText("Model (optional)"), { target: { value: "Africa Twin" } });
    fireEvent.change(screen.getByLabelText("Model year (optional)"), { target: { value: "2024" } });
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect((screen.getByLabelText("Username") as HTMLInputElement).value).toBe("road_rider");
    expect((screen.getByLabelText("Display name") as HTMLInputElement).value).toBe("Road Rider");
    expect((screen.getByLabelText("Home base (optional)") as HTMLInputElement).value).toBe("Portland");
    fireEvent.click(screen.getByRole("button", { name: "Continue to your motorcycle" }));

    expect((screen.getByLabelText("Make (optional)") as HTMLInputElement).value).toBe("Honda");
    expect((screen.getByLabelText("Model (optional)") as HTMLInputElement).value).toBe("Africa Twin");
    expect((screen.getByLabelText("Model year (optional)") as HTMLInputElement).value).toBe("2024");
  });
});
