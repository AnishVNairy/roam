import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialActionState } from "@/lib/forms";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  maybeSingle: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { createCommentAction, deleteCommentAction } from "@/app/actions/comments";

const postId = "11111111-1111-4111-8111-111111111111";
const commentId = "22222222-2222-4222-8222-222222222222";
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
  mocks.maybeSingle.mockResolvedValue({ data: { user_id: userId }, error: null });
  const query = { insert: mocks.insert, select: mocks.select, maybeSingle: mocks.maybeSingle, delete: mocks.delete, eq: mocks.eq };
  let filterCount = 0;
  mocks.eq.mockReset();
  mocks.eq.mockImplementation(() => ++filterCount === 3 ? Promise.resolve({ error: null }) : query);
  mocks.from.mockReturnValue(query);
  mocks.delete.mockReturnValue(query);
  mocks.select.mockReturnValue(query);
  mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser }, from: mocks.from });
});

describe("comment actions", () => {
  it("creates a trimmed comment as the authenticated user", async () => {
    const result = await createCommentAction(initialActionState, formData({ postId, content: "  Great ride.  ", user_id: "rider-2" }));

    expect(mocks.from).toHaveBeenCalledWith("comments");
    expect(mocks.insert).toHaveBeenCalledWith({ post_id: postId, user_id: userId, content: "Great ride." });
    expect(result.status).toBe("success");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });

  it("redirects unauthenticated visitors to sign in", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(createCommentAction(initialActionState, formData({ postId, content: "Hello" }))).rejects.toThrow("REDIRECT:/login");
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects an invalid comment before attempting a database write", async () => {
    const result = await createCommentAction(initialActionState, formData({ postId, content: "  " }));

    expect(result).toMatchObject({ status: "error", fieldErrors: { content: "Write a comment before sending." } });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("rejects an overlong comment before attempting a database write", async () => {
    const result = await createCommentAction(initialActionState, formData({ postId, content: "x".repeat(1001) }));

    expect(result).toMatchObject({ status: "error", fieldErrors: { content: "Comments must be 1,000 characters or fewer." } });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("deletes only the authenticated user's comment", async () => {
    const result = await deleteCommentAction(initialActionState, formData({ commentId, user_id: "rider-2" }));

    expect(mocks.from).toHaveBeenCalledWith("comments");
    expect(mocks.select).toHaveBeenCalledWith("user_id");
    expect(mocks.maybeSingle).toHaveBeenCalledOnce();
    expect(mocks.delete).toHaveBeenCalledOnce();
    expect(mocks.eq).toHaveBeenNthCalledWith(1, "id", commentId);
    expect(mocks.eq).toHaveBeenNthCalledWith(2, "id", commentId);
    expect(mocks.eq).toHaveBeenNthCalledWith(3, "user_id", userId);
    expect(result.status).toBe("success");
  });

  it("rejects deletion when the comment belongs to another rider", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { user_id: "rider-2" }, error: null });

    const result = await deleteCommentAction(initialActionState, formData({ commentId }));

    expect(result).toMatchObject({ status: "error", message: "You can only delete your own comments." });
    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated comment deletion", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(deleteCommentAction(initialActionState, formData({ commentId }))).rejects.toThrow("REDIRECT:/login");
    expect(mocks.delete).not.toHaveBeenCalled();
  });
});
