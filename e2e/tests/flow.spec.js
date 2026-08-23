import { test, expect } from "@playwright/test";

// This simulates a real user journey against the running app:
// sign up -> land on the task board -> add a task -> see it rendered ->
// mark it complete -> delete it -> confirm it's gone.
//
// Requires both the backend (http://localhost:4000) and frontend
// (http://localhost:5173) to be running. See README "Running the tests"
// for the exact commands.

test("user can register, add a task, see it appear, and delete it", async ({ page }) => {
  const uniqueEmail = `e2e_${Date.now()}@example.com`;

  await page.goto("/");

  // Switch to the register form
  await page.getByRole("button", { name: /need an account\? sign up/i }).click();

  await page.getByLabel(/email/i).fill(uniqueEmail);
  await page.getByLabel(/password/i).fill("password123");
  await page.getByRole("button", { name: /sign up/i }).click();

  // Should now be logged in and see the task board
  await expect(page.getByText(/no tasks yet/i)).toBeVisible();

  // Create a task
  await page.getByLabel(/new task/i).fill("Buy groceries");
  await page.getByRole("button", { name: /add task/i }).click();

  // Task should now appear in the list
  const taskItem = page.getByText("Buy groceries");
  await expect(taskItem).toBeVisible();

  // Mark it complete
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("checkbox")).toBeChecked();

  // Delete it
  await page.getByRole("button", { name: /delete buy groceries/i }).click();
  await expect(page.getByText("Buy groceries")).not.toBeVisible();
  await expect(page.getByText(/no tasks yet/i)).toBeVisible();
});
