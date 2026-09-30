import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeOnboardingAction, updateProfileAction } from "@/app/actions/profile";

const supabase = vi.hoisted(() => ({ createClient: vi.fn(), getUser: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: supabase.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));

function formData(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.createClient.mockResolvedValue({ auth: { getUser: supabase.getUser }, from: supabase.from });
  });

  it("does not write onboarding data without an authenticated user", async () => {
    supabase.getUser.mockResolvedValue({ data: { user: null }, error: { message: "missing session" } });
    const result = await completeOnboardingAction({ status: "idle" }, formData({ username: "rider_1", displayName: "Rider" }));
    expect(result).toMatchObject({ status: "error", message: "Your session expired. Sign in again." });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("does not update a profile without an authenticated user", async () => {
    supabase.getUser.mockResolvedValue({ data: { user: null }, error: { message: "missing session" } });
    const result = await updateProfileAction({ status: "idle" }, formData({ username: "rider_1", displayName: "Rider" }));
    expect(result).toMatchObject({ status: "error", message: "Your session expired. Sign in again." });
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
