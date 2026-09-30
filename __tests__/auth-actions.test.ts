import { beforeEach, describe, expect, it, vi } from "vitest";
import { signInAction, signUpAction } from "@/app/actions/auth";

const supabaseMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: supabaseMocks.createClient,
}));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));

function formData(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("authentication actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const profileQuery = {
      select: supabaseMocks.select.mockReturnThis(),
      eq: supabaseMocks.eq.mockReturnThis(),
      maybeSingle: supabaseMocks.maybeSingle,
    };
    supabaseMocks.from.mockReturnValue(profileQuery);
    supabaseMocks.createClient.mockResolvedValue({
      auth: {
        signInWithPassword: supabaseMocks.signInWithPassword,
        signUp: supabaseMocks.signUp,
      },
      from: supabaseMocks.from,
    });
  });

  it("shows a generic invalid-credentials error", async () => {
    supabaseMocks.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid login credentials" },
    });

    await expect(
      signInAction({ status: "idle" }, formData({ email: "rider@example.com", password: "password" })),
    ).resolves.toMatchObject({
      status: "error",
      message: "Email or password is incorrect.",
    });
  });

  it("routes a rider without a complete profile to onboarding", async () => {
    supabaseMocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: "rider-1" } },
      error: null,
    });
    supabaseMocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(
      signInAction({ status: "idle" }, formData({ email: "rider@example.com", password: "password" })),
    ).rejects.toThrow("REDIRECT:/onboarding");
  });

  it("rejects mismatched signup passwords before contacting Supabase", async () => {
    const result = await signUpAction(
      { status: "idle" },
      formData({
        email: "rider@example.com",
        password: "long-enough-password",
        confirmPassword: "different-password",
      }),
    );

    expect(result).toMatchObject({
      status: "error",
      fieldErrors: { confirmPassword: "Passwords do not match." },
    });
    expect(supabaseMocks.createClient).not.toHaveBeenCalled();
  });
});
