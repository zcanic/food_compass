import { expect, test } from "@playwright/test";

test("bulk ingredient entry runs the default pairing workflow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "食材罗盘工作台" })).toBeVisible();
  await page.getByPlaceholder(/输入食材/).fill("番茄、鸡蛋");
  await expect(page.getByText(/Enter 将添加：tomato、egg/)).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.getByText("tomato")).toBeVisible();
  await expect(page.getByText("egg")).toBeVisible();

  await page.getByRole("button", { name: "探索" }).click();
  await expect(page.getByText(/这些结果来自常见搭配模型/)).toBeVisible();
  await expect(page.getByText("常见搭配").first()).toBeVisible();
});

test("switching modes changes the default model and clears stale result state", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /找替代/ }).click();
  await expect(page.getByText("当前使用：风味相似。")).toBeVisible();

  await page.getByPlaceholder(/输入食材/).fill("basil");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "探索" }).click();

  await expect(page.getByText(/风味相似候选/)).toBeVisible();
  await page.getByRole("button", { name: /组菜/ }).click();
  await expect(page.getByText("准备好了，点击探索")).toBeVisible();
  await expect(page.getByText("当前使用：综合推荐。")).toBeVisible();
});

test("ask mode uses one question box and extracts Chinese ingredients", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  await expect(page.locator('input[placeholder*="输入食材"]')).toHaveCount(0);

  await page
    .getByPlaceholder(/描述你想做什么/)
    .fill("我有番茄和鸡蛋，想做得更日式一点，可以加什么？");
  await page.getByRole("button", { name: "提问" }).click();

  await expect(page.getByText(/意图：style_shift/)).toBeVisible();
  await expect(page.getByText(/食材：tomato、egg/)).toBeVisible();
  await expect(page.getByText(/调用工具：shift_style/)).toBeVisible();
});

test("unsupported ingredient input gives an actionable recovery message", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder(/输入食材/).fill("zzzznotfood");
  await expect(page.getByText(/当前词表暂未覆盖该食材/)).toBeVisible();
});

test("mode lookup shows neighborhood cards without stale explore prompts", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /查街区/ }).click();
  await page.getByPlaceholder(/输入食材/).fill("酱油");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "探索" }).click();

  await expect(page.getByRole("heading", { name: "食材街区" })).toBeVisible();
  await expect(page.getByText("准备好了，点击探索")).toHaveCount(0);
});

test("ask mode explains when no ingredient can be extracted", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  await page.getByPlaceholder(/描述你想做什么/).fill("想做得更日式一点，但我还没说食材");
  await page.getByRole("button", { name: "提问" }).click();

  await expect(page.getByText(/没有识别到可用食材/)).toBeVisible();
});
