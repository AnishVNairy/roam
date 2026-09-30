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

import { likePostAction, unlikePostAction } from "@/app/actions/likes";

const postId = "11111111-1111-4111-8111-111111111111";
const userId = "rider-1";

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
  mocks.insert.mockResolvedValue({ error: null });
  const deleteQuery = { eq: mocks.eq };
  let filterCount = 0;
  mocks.eq.mockReset();
  mocks.eq.mockImplementation(() => ++filterCount === 2 ? Promise.resolve({ error: null }) : deleteQuery);
  mocks.from.mockReturnValue({ insert: mocks.insert, delete: mocks.delete });
  mocks.delete.mockReturnValue(deleteQuery);
  mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser }, from: mocks.from });
});

describe("post like actions", () => {
  it("creates a like for the authenticated user", async () => {
    const result = await likePostAction(initialActionState, formData({ postId, user_id: "rider-2" }));

    expect(mocks.from).toHaveBeenCalledWith("likes");
    expect(mocks.insert).toHaveBeenCalledWith({ post_id: postId, user_id: userId });
    expect(result.status).toBe("success");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });

  it("treats a duplicate request as already liked", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });

    const result = await likePostAction(initialActionState, formData({ postId }));

    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("success");
  });

  it("sends unauthenticated visitors to sign in", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(likePostAction(initialActionState, formData({ postId }))).rejects.toThrow("REDIRECT:/login");
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("does not remove a like when the visitor is unauthenticated", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(unlikePostAction(initialActionState, formData({ postId }))).rejects.toThrow("REDIRECT:/login");
    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it("removes only the authenticated user's like", async () => {
    const result = await unlikePostAction(initialActionState, formData({ postId, user_id: "rider-2" }));

    expect(mocks.delete).toHaveBeenCalledOnce();
    expect(mocks.eq).toHaveBeenNthCalledWith(1, "post_id", postId);
    expect(mocks.eq).toHaveBeenNthCalledWith(2, "user_id", userId);
    expect(result.status).toBe("success");
  });
});
