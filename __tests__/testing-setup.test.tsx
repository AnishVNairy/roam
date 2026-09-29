import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function TestFixture() {
  return <button type="button">Test harness ready</button>;
}

describe("React Testing Library setup", () => {
  it("renders a fixture and finds it by its accessible role and name", () => {
    render(<TestFixture />);

    expect(
      screen.getByRole("button", { name: "Test harness ready" }),
    ).toBeDefined();
  });
});
