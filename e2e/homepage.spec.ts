import { expect, test } from "@playwright/test";

test("public homepage introduces the ROAM rider community", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Good roads are better together." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Build your rider card" })).toHaveAttribute("href", "/signup");
});

test("login form has labeled credentials and account creation path", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Pick up where you left off" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/signup");
});

test("an unauthenticated visitor is redirected away from the profile", async ({ page }) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
  await expect(page.getByRole("heading", { name: "Pick up where you left off" })).toBeVisible();
});
