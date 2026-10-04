import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileCard } from "@/components/profile-card";
import { FollowButton } from "@/components/follow-button";
import { followRiderAction, unfollowRiderAction } from "@/app/actions/follows";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/app/actions/follows", () => ({ followRiderAction: vi.fn(), unfollowRiderAction: vi.fn() }));

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

const profile = {
  id: "rider-1", username: "road_rider", display_name: "Road Rider", avatar_url: null,
  bio: "Long way home.", city: "Portland", created_at: "2026-09-30T00:00:00.000Z", updated_at: "2026-09-30T00:00:00.000Z",
};
const stats = { followers_count: 12, following_count: 3, is_following: false };

describe("rider follow profile UI", () => {
  it("shows follower and following counts on the signed-in rider's profile without a follow button", () => {
    render(<ProfileCard profile={profile} motorcycles={[]} currentUserId="rider-1" followStats={stats} />);

    expect(screen.getByLabelText("Rider follow counts").textContent).toContain("12 followers");
    expect(screen.getByLabelText("Rider follow counts").textContent).toContain("3 following");
    expect(screen.queryByRole("button", { name: "Follow rider" })).toBeNull();
    expect(screen.getByRole("link", { name: /Edit profile/ }).getAttribute("href")).toBe("/profile/edit");
  });

  it("shows the follow control and counts on another rider's profile", () => {
    render(<ProfileCard profile={profile} motorcycles={[]} currentUserId="rider-2" followStats={stats} />);

    expect(screen.getByLabelText("Rider follow counts").textContent).toContain("12 followers");
    expect(screen.getByLabelText("Rider follow counts").textContent).toContain("3 following");
    expect(screen.getByRole("button", { name: "Follow rider" })).toBeDefined();
    expect(screen.queryByRole("link", { name: /Edit profile/ })).toBeNull();
  });

  it("switches from follow to unfollow when refreshed profile state changes", async () => {
    vi.mocked(followRiderAction).mockResolvedValue({ status: "success", message: "Following rider." });
    vi.mocked(unfollowRiderAction).mockResolvedValue({ status: "success", message: "Rider unfollowed." });
    const view = render(<FollowButton profileId={profile.id} isFollowing={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Follow rider" }));
    await waitFor(() => expect(followRiderAction).toHaveBeenCalledOnce());
    const formData = vi.mocked(followRiderAction).mock.calls[0][1] as FormData;
    expect(formData.get("profileId")).toBe(profile.id);

    view.rerender(<FollowButton profileId={profile.id} isFollowing />);
    fireEvent.click(screen.getByRole("button", { name: "Following" }));
    await waitFor(() => expect(unfollowRiderAction).toHaveBeenCalledOnce());
  });
});
