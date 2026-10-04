import { expect, test } from "@playwright/test";

test("an unauthenticated visitor is redirected away from notifications", async ({ page }) => {
  await page.goto("/notifications");

  await expect(page).toHaveURL(/\/login\?next=%2Fnotifications$/);
  await expect(page.getByRole("heading", { name: "Pick up where you left off" })).toBeVisible();
});
