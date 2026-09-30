import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LikeButton } from "@/components/like-button";
import { likePostAction, unlikePostAction } from "@/app/actions/likes";

vi.mock("@/app/actions/likes", () => ({
  likePostAction: vi.fn(),
  unlikePostAction: vi.fn(),
}));

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

const mockedLike = vi.mocked(likePostAction);
const mockedUnlike = vi.mocked(unlikePostAction);

describe("LikeButton", () => {
  it("shows the count and unliked state, then invokes like", async () => {
    mockedLike.mockResolvedValue({ status: "success", message: "Post liked." });
    render(<LikeButton postId="post-1" likeCount={4} isLiked={false} />);

    const button = screen.getByRole("button", { name: "Like post" });
    expect(button.textContent).toContain("4");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(button);

    await waitFor(() => expect(mockedLike).toHaveBeenCalledOnce());
    const submitted = mockedLike.mock.calls[0][1] as FormData;
    expect(submitted.get("postId")).toBe("post-1");
  });

  it("shows the liked state and invokes unlike", async () => {
    mockedUnlike.mockResolvedValue({ status: "success", message: "Like removed." });
    render(<LikeButton postId="post-1" likeCount={5} isLiked />);

    const button = screen.getByRole("button", { name: "Unlike post" });
    expect(button.textContent).toContain("5");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button);

    await waitFor(() => expect(mockedUnlike).toHaveBeenCalledOnce());
    const submitted = mockedUnlike.mock.calls[0][1] as FormData;
    expect(submitted.get("postId")).toBe("post-1");
  });

  it("disables the button while a like is pending", async () => {
    let finishLike!: (state: { status: "success"; message: string }) => void;
    mockedLike.mockReturnValue(new Promise((resolve) => { finishLike = resolve; }));
    render(<LikeButton postId="post-1" likeCount={0} isLiked={false} />);

    const button = screen.getByRole("button", { name: "Like post" });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole("button", { name: "Liking post" }).hasAttribute("disabled")).toBe(true));
    fireEvent.click(screen.getByRole("button", { name: "Liking post" }));
    expect(mockedLike).toHaveBeenCalledOnce();

    await act(async () => finishLike({ status: "success", message: "Post liked." }));
  });
});
