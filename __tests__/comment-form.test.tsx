import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommentForm } from "@/components/comment-form";
import { createCommentAction } from "@/app/actions/comments";

vi.mock("@/app/actions/comments", () => ({ createCommentAction: vi.fn(), deleteCommentAction: vi.fn() }));

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("CommentForm", () => {
  it("renders a labeled comment field and submit action", () => {
    render(<CommentForm postId="post-1" />);

    expect(screen.getByRole("textbox", { name: "Write a comment" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Comment" })).toBeDefined();
  });

  it("shows a validation message without submitting whitespace", () => {
    render(<CommentForm postId="post-1" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Write a comment" }), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));

    expect(screen.getByRole("alert").textContent).toContain("Write a comment before sending.");
    expect(createCommentAction).not.toHaveBeenCalled();
  });

  it("disables submission while pending and clears text after success", async () => {
    let finishComment!: (state: { status: "success"; message: string }) => void;
    vi.mocked(createCommentAction).mockReturnValue(new Promise((resolve) => { finishComment = resolve; }));
    render(<CommentForm postId="post-1" />);
    const input = screen.getByRole("textbox", { name: "Write a comment" }) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "Nice road" } });
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Commenting…" }).hasAttribute("disabled")).toBe(true));
    fireEvent.click(screen.getByRole("button", { name: "Commenting…" }));
    expect(createCommentAction).toHaveBeenCalledOnce();

    await act(async () => finishComment({ status: "success", message: "Comment added." }));
    await waitFor(() => expect(input.value).toBe(""));
  });
});
