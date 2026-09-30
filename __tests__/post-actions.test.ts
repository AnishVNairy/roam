import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPostAction, deletePostAction } from "@/app/actions/posts";

const supabase = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  maybeSingle: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: supabase.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));

function formData(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("post actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.createClient.mockResolvedValue({ auth: { getUser: supabase.getUser }, from: supabase.from });
    supabase.from.mockReturnValue({ insert: supabase.insert, select: supabase.select, delete: supabase.delete });
  });

  it("creates a post as the authenticated rider, ignoring a submitted owner id", async () => {
    supabase.getUser.mockResolvedValue({ data: { user: { id: "rider-1" } }, error: null });
    supabase.insert.mockResolvedValue({ error: null });

    await expect(createPostAction({ status: "idle" }, formData({ caption: "Morning loop", mediaUrl: "", user_id: "rider-2" })))
      .rejects.toThrow("REDIRECT:/");

    expect(supabase.from).toHaveBeenCalledWith("posts");
    expect(supabase.insert).toHaveBeenCalledWith({ user_id: "rider-1", caption: "Morning loop", media_url: null });
  });

  it("rejects an empty caption before writing to Supabase", async () => {
    const result = await createPostAction({ status: "idle" }, formData({ caption: "   ", mediaUrl: "" }));

    expect(result).toMatchObject({ status: "error", fieldErrors: { caption: "Write a caption before posting." } });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("rejects deletion when the post belongs to another rider", async () => {
    supabase.getUser.mockResolvedValue({ data: { user: { id: "rider-1" } }, error: null });
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    supabase.from.mockReturnValue(query);
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: { user_id: "rider-2" }, error: null });

    const result = await deletePostAction({ status: "idle" }, formData({ postId: "post-1" }));

    expect(result).toMatchObject({ status: "error", message: "You can only delete your own posts." });
    expect(query.maybeSingle).toHaveBeenCalled();
    expect(supabase.delete).not.toHaveBeenCalled();
  });
});
