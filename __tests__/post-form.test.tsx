import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PostForm } from "@/components/post-form";

vi.mock("@/app/actions/posts", () => ({ createPostAction: vi.fn(), deletePostAction: vi.fn() }));
afterEach(cleanup);

describe("PostForm", () => {
  it("renders caption and optional image fields", () => {
    render(<PostForm />);
    expect(screen.getByLabelText("Caption")).toBeDefined();
    expect(screen.getByLabelText("Image URL (optional)")).toBeDefined();
    expect(screen.getByRole("button", { name: "Publish post" })).toBeDefined();
  });

  it("shows a caption validation message before submitting an empty post", () => {
    render(<PostForm />);
    fireEvent.submit(screen.getByRole("button", { name: "Publish post" }).closest("form")!);
    expect(screen.getByText("Write a caption before posting.")).toBeDefined();
  });
});
