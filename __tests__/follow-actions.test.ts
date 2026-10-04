import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialActionState } from "@/lib/forms";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { followRiderAction, unfollowRiderAction } from "@/app/actions/follows";

const riderId = "a1111111-1111-4111-8111-111111111111";
const otherRiderId = "22222222-2222-4222-8222-222222222222";

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: riderId } }, error: null });
  mocks.insert.mockResolvedValue({ error: null });
  const query = { eq: mocks.eq };
  mocks.eq.mockReturnValue(query);
  mocks.from.mockReturnValue({ insert: mocks.insert, delete: mocks.delete });
  mocks.delete.mockReturnValue(query);
  mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser }, from: mocks.from });
});

describe("rider follow actions", () => {
  it("creates a follow as the authenticated rider, ignoring a supplied follower id", async () => {
    const result = await followRiderAction(initialActionState, formData({ profileId: otherRiderId, followerId: otherRiderId }));

    expect(mocks.from).toHaveBeenCalledWith("follows");
    expect(mocks.insert).toHaveBeenCalledWith({ follower_id: riderId, following_id: otherRiderId });
    expect(result.status).toBe("success");
  });

  it("treats duplicate follow requests as already following", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });

    const result = await followRiderAction(initialActionState, formData({ profileId: otherRiderId }));

    expect(result.status).toBe("success");
  });

  it("rejects self-follow before writing", async () => {
    const result = await followRiderAction(initialActionState, formData({ profileId: riderId }));

    expect(result).toMatchObject({ status: "error" });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("rejects self-follow when the submitted UUID uses uppercase letters", async () => {
    const result = await followRiderAction(initialActionState, formData({ profileId: riderId.toUpperCase() }));

    expect(result).toMatchObject({ status: "error" });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("requires an authenticated user before following", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(followRiderAction(initialActionState, formData({ profileId: otherRiderId }))).rejects.toThrow("REDIRECT:/login");
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("unfollows only from the authenticated rider's account", async () => {
    const result = await unfollowRiderAction(initialActionState, formData({ profileId: otherRiderId, followerId: otherRiderId }));

    expect(mocks.delete).toHaveBeenCalledOnce();
    expect(mocks.eq).toHaveBeenNthCalledWith(1, "following_id", otherRiderId);
    expect(mocks.eq).toHaveBeenNthCalledWith(2, "follower_id", riderId);
    expect(result.status).toBe("success");
  });

  it("requires an authenticated user before unfollowing", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(unfollowRiderAction(initialActionState, formData({ profileId: otherRiderId }))).rejects.toThrow("REDIRECT:/login");
    expect(mocks.delete).not.toHaveBeenCalled();
  });
});
