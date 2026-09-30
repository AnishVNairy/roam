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

  it("uses the current like state across consecutive like and unlike cycles", async () => {
    mockedLike.mockResolvedValue({ status: "success", message: "Post liked." });
    mockedUnlike.mockResolvedValue({ status: "success", message: "Like removed." });
    const renderLikeButton = (isLiked: boolean, likeCount: number) =>
      render(<LikeButton postId="post-1" likeCount={likeCount} isLiked={isLiked} />);

    const view = renderLikeButton(true, 1);
    const states = [false, true, false, true, false];
    let count = 1;

    let currentLiked = true;
    for (let index = 0; index < states.length; index += 1) {
      const nextLiked = states[index];
      fireEvent.click(screen.getByRole("button", { name: currentLiked ? "Unlike post" : "Like post" }));
      const expectedCalls = states.slice(0, index + 1).filter((state) => state === nextLiked).length;
      await waitFor(() => expect(currentLiked ? mockedUnlike : mockedLike).toHaveBeenCalledTimes(expectedCalls));
      count += nextLiked ? 1 : -1;
      view.rerender(<LikeButton postId="post-1" likeCount={count} isLiked={nextLiked} />);
      expect(screen.getByRole("button", { name: nextLiked ? "Unlike post" : "Like post" }).textContent).toContain(String(count));
      expect(screen.getByRole("button", { name: nextLiked ? "Unlike post" : "Like post" }).getAttribute("aria-pressed")).toBe(String(nextLiked));
      currentLiked = nextLiked;
    }

    expect(mockedLike).toHaveBeenCalledTimes(2);
    expect(mockedUnlike).toHaveBeenCalledTimes(3);
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
