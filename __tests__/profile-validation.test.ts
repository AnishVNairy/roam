import { describe, expect, it } from "vitest";
import {
  normalizeUsername,
  validateMotorcycle,
  validateRiderDetails,
  validateSignup,
} from "@/lib/validation";

describe("signup validation", () => {
  it("rejects passwords that do not match", () => {
    expect(
      validateSignup({
        email: "rider@example.com",
        password: "long-enough-password",
        confirmPassword: "different-password",
      }),
    ).toEqual({ confirmPassword: "Passwords do not match." });
  });

  it("requires a valid email and an eight character password", () => {
    expect(
      validateSignup({
        email: "not-an-email",
        password: "short",
        confirmPassword: "short",
      }),
    ).toMatchObject({
      email: "Enter a valid email address.",
      password: "Use at least 8 characters.",
    });
  });
});

describe("rider profile validation", () => {
  it("normalizes usernames and enforces the public handle format", () => {
    expect(normalizeUsername("  Road_Rider  ")).toBe("road_rider");
    expect(
      validateRiderDetails({ username: "has spaces", displayName: "Road Rider" }),
    ).toMatchObject({ username: "Use 3–24 lowercase letters, numbers, or underscores." });
  });

  it("requires both motorcycle make and model when either is provided", () => {
    expect(validateMotorcycle({ make: "Honda", model: "", year: "" })).toMatchObject({
      model: "Enter both the make and model, or leave both blank.",
    });
  });
});
