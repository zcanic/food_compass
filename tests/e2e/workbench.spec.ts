import { expect, test, type Page } from "@playwright/test";

test("bulk ingredient entry runs the default pairing workflow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "食材罗盘工作台" })).toBeVisible();
  await page.getByPlaceholder(/输入食材/).fill("番茄、鸡蛋");
  await expect(page.getByText(/Enter 将添加：tomato、egg/)).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "移除 tomato" })).toBeVisible();
  await expect(page.getByRole("button", { name: "移除 egg" })).toBeVisible();
  const summary = page.getByRole("region", { name: "查询摘要" });
  await expect(summary.getByText("当前任务")).toBeVisible();
  await expect(summary.getByText("输入食材")).toBeVisible();
  await expect(summary.getByText("待检索")).toBeVisible();

  await page.getByRole("button", { name: "探索" }).click();
  await expect(summary.getByText("已检索")).toBeVisible();
  await expect(summary.getByText(/(Worker|本地 fallback) · \d+ ms/)).toBeVisible();
  await expect(page.getByText(/这些结果来自常见搭配模型/)).toBeVisible();
  await expect(page.getByText(/分数为向量余弦相似度/)).toBeVisible();
  await expect(page.getByRole("list", { name: "推荐结果" })).toBeVisible();
  await expect(page.getByText("常见搭配").first()).toBeVisible();
});

test("switching modes changes the default model and clears stale result state", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "任务：找替代" }).click();
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
  await expect(page.getByText(/意图链：pairing、style_shift、complete_combo/)).toBeVisible();
  await expect(page.getByText(/食材：tomato、egg/)).toBeVisible();
  await expect(page.getByText(/调用工具：shift_style/)).toBeVisible();
  await expect(page.getByText(/风格偏移：/)).toBeVisible();
  await expect(page.getByText(/常见搭配：/)).toBeVisible();
  await expect(page.getByText(/组合补全：/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Ask 执行诊断" }).getByText(/工具执行：3 个 · (Worker|本地 fallback) · \d+ ms/)).toBeVisible();
  await expect(page.getByRole("list", { name: "风格偏移推荐结果" })).toBeVisible();
  await expect(page.getByRole("list", { name: "常见搭配推荐结果" })).toBeVisible();
  await expect(page.getByRole("list", { name: "组合补全推荐结果" })).toBeVisible();
});

test("unsupported ingredient input gives an actionable recovery message", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder(/输入食材/).fill("zzzznotfood");
  await expect(page.getByText(/当前词表暂未覆盖该食材/)).toBeVisible();
});

test("typo search offers a selectable correction", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder(/输入食材/).fill("tomoto");
  await expect(page.getByText("你是不是想找...")).toBeVisible();
  await page.getByRole("button", { name: "tomato" }).click();
  await expect(page.getByRole("button", { name: "移除 tomato" })).toBeVisible();
});

test("example buttons set up and run a complete workflow", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "示例：番茄找搭配" }).click();

  await expect(page.getByRole("button", { name: "移除 tomato" })).toBeVisible();
  await expect(page.getByRole("region", { name: "查询摘要" }).getByText("已检索")).toBeVisible();
  await expect(page.getByText(/这些结果来自常见搭配模型/)).toBeVisible();
  await expect(page.getByRole("list", { name: "推荐结果" })).toBeVisible();
});

test("recommendations can be added back into the current query", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder(/输入食材/).fill("tomato");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "探索" }).click();
  await expect(page.getByRole("list", { name: "推荐结果" })).toBeVisible();

  await page.getByRole("button", { name: /^加入 / }).first().click();

  await expect(page.getByRole("button", { name: /^移除 / })).toHaveCount(2);
  await expect(page.getByText("准备好了，点击探索")).toBeVisible();
  await expect(page.getByRole("region", { name: "查询摘要" }).getByText("待检索")).toBeVisible();
  await expect(page.getByRole("list", { name: "推荐结果" })).toHaveCount(0);
});

test("style example chooses style mode and target direction", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "示例：番茄鸡蛋做日式" }).click();

  await expect(page.getByRole("button", { name: "移除 tomato" })).toBeVisible();
  await expect(page.getByRole("button", { name: "移除 egg" })).toBeVisible();
  await expect(page.getByText(/向 日式 风格做了中等强度球面偏移/)).toBeVisible();
  await expect(page.getByRole("region", { name: "风格迁移证据" }).getByText("direction_arithmetic_full.csv")).toBeVisible();
  await expect(page.getByRole("region", { name: "风格迁移证据" }).getByText("目标命中 5/5")).toBeVisible();
  await expect(page.getByRole("region", { name: "查询摘要" }).getByText("日式 · 中等")).toBeVisible();
});

test("model comparison runs all three model perspectives", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "任务：模型对比" }).click();
  await expect(page.getByText(/同时运行常见搭配、综合推荐和风味相似/)).toBeVisible();
  await page.getByPlaceholder(/输入食材/).fill("番茄");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "探索" }).click();

  await expect(page.getByText(/三模型对比/)).toBeVisible();
  await expect(page.getByRole("region", { name: "查询摘要" }).getByText("模型对比")).toBeVisible();
  const overview = page.getByRole("region", { name: "模型对比概览" });
  await expect(overview.getByText("模型对比概览")).toBeVisible();
  await expect(overview.getByText(/去重候选/)).toBeVisible();
  await expect(overview.getByText(/重复候选/)).toBeVisible();
  await expect(overview.getByText(/独有：常见搭配/)).toBeVisible();
  await expect(page.getByRole("list", { name: "常见搭配推荐结果" })).toBeVisible();
  await expect(page.getByRole("list", { name: "综合推荐推荐结果" })).toBeVisible();
  await expect(page.getByRole("list", { name: "风味相似推荐结果" })).toBeVisible();
  const modes = page.getByRole("region", { name: "食材街区" });
  await expect(modes.getByRole("heading", { name: "食材街区" })).toBeVisible();
  await expect(modes.getByText(/常见搭配/).first()).toBeVisible();
  await expect(modes.getByText(/综合推荐/).first()).toBeVisible();
  await expect(modes.getByText(/风味相似/).first()).toBeVisible();
});

test("recent ingredients persist and can be re-added quickly", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder(/输入食材/).fill("番茄、鸡蛋");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "添加最近食材 tomato" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "添加最近食材 tomato" })).toBeVisible();
  await page.getByRole("button", { name: "添加最近食材 tomato" }).click();
  await expect(page.getByRole("button", { name: "移除 tomato" })).toBeVisible();
});

test("mode lookup shows neighborhood cards without stale explore prompts", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "任务：查街区" }).click();
  await page.getByPlaceholder(/输入食材/).fill("酱油");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "探索" }).click();

  await expect(page.getByRole("heading", { name: "食材街区" })).toBeVisible();
  await expect(page.getByRole("region", { name: "食材街区" }).getByText(/个成员/).first()).toBeVisible();
  await expect(page.getByRole("region", { name: "食材街区" }).getByText(/z /).first()).toBeVisible();
  await expect(page.getByText("准备好了，点击探索")).toHaveCount(0);
});

test("mode lookup empty states explain atlas coverage and offer examples", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "任务：查街区" }).click();
  await page.getByPlaceholder(/输入食材/).fill("sea_urchin");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "探索" }).click();

  await expect(page.getByText("没有找到街区")).toBeVisible();
  await expect(page.getByRole("region", { name: "街区空态说明" }).getByText(/mode atlas 未覆盖/)).toBeVisible();
  await page.getByRole("button", { name: "查街区示例 soy sauce" }).click();

  await expect(page.getByRole("region", { name: "食材街区" })).toBeVisible();
});

test("complete combo uses the full ingredient set for neighborhood context", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "任务：组菜" }).click();
  await page.getByPlaceholder(/输入食材/).fill("酱油、豆腐");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "探索" }).click();

  await expect(page.getByText(/基于组合向量/)).toBeVisible();
  const modes = page.getByRole("region", { name: "食材街区" });
  await expect(modes.getByText(/命中：soy sauce · tofu/).first()).toBeVisible();
});

test("style shift uses readable labels and returns experimental results", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "任务：换风格" }).click();
  await expect(page.getByRole("button", { name: "风格：日式" })).toBeVisible();
  await page.getByPlaceholder(/输入食材/).fill("番茄");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "探索" }).click();

  await expect(page.getByText(/向 日式 风格做了中等强度球面偏移/)).toBeVisible();
});

test("editing ingredient chips clears stale recommendations", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder(/输入食材/).fill("tomato");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "探索" }).click();
  await expect(page.getByText(/这些结果来自常见搭配模型/)).toBeVisible();

  await page.getByRole("button", { name: "移除 tomato" }).click();
  await expect(page.getByText("先添加食材")).toBeVisible();
  await expect(page.getByText(/这些结果来自常见搭配模型/)).toHaveCount(0);
});

test("ingredient and recent lists can be cleared intentionally", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder(/输入食材/).fill("番茄、鸡蛋");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "移除 tomato" })).toBeVisible();
  await page.getByRole("button", { name: "探索" }).click();
  await expect(page.getByText(/这些结果来自常见搭配模型/)).toBeVisible();

  await page.getByRole("button", { name: "清空当前选择" }).click();
  await expect(page.getByText("先添加食材")).toBeVisible();
  await expect(page.getByRole("button", { name: "移除 tomato" })).toHaveCount(0);

  await page.getByRole("button", { name: "清空最近" }).click();
  await expect(page.getByText("最近食材")).toHaveCount(0);
});

test("ask mode explains when no ingredient can be extracted", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  await page.getByPlaceholder(/描述你想做什么/).fill("想做得更日式一点，但我还没说食材");
  await page.getByRole("button", { name: "提问" }).click();

  await expect(page.getByText(/没有识别到可用食材/)).toBeVisible();
});

test("ask explain mode returns mode-only answers", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  await page.getByPlaceholder(/描述你想做什么/).fill("酱油属于什么食材街区？");
  await page.getByRole("button", { name: "提问" }).click();

  await expect(page.getByText(/意图：explain/)).toBeVisible();
  await expect(page.getByText(/食材街区：/)).toBeVisible();
  await expect(page.getByText(/调用工具：lookup_mode/)).toBeVisible();
});

test("ask mode surfaces constraint warnings without pretending to filter", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  await page.getByPlaceholder(/描述你想做什么/).fill("我想要低脂的番茄搭配");
  await page.getByRole("button", { name: "提问" }).click();

  const parsed = page.getByRole("region", { name: "Ask 解析结果" });
  await expect(parsed.getByText(/约束：low_fat/)).toBeVisible();
  await expect(page.getByText(/请求的约束：low_fat/)).toBeVisible();
  await expect(page.getByText(/结果未做可靠过滤/)).toBeVisible();
});

test("about page explains research basis and product limits", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "关于" }).click();

  await expect(page.getByRole("heading", { name: "关于 Flavor Compass" })).toBeVisible();
  await expect(page.getByRole("region", { name: "研究依据" }).getByText("1,790")).toBeVisible();
  await expect(page.getByRole("region", { name: "三模型设计轴" }).getByText("常见搭配", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "三模型设计轴" }).getByText("风味相似", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "主感官轴" }).getByText("Savory-Umami to Sweet-Floral Confection")).toBeVisible();
  await expect(page.getByRole("region", { name: "主感官轴" }).getByText("procrustes_sensory.csv").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "证据指标" }).getByText("linear_probe.csv")).toBeVisible();
  await expect(page.getByRole("region", { name: "线性探针" }).getByText("F1 0.962")).toBeVisible();
  await expect(page.getByRole("region", { name: "线性探针" }).getByText("NOVA level")).toBeVisible();
  await expect(page.getByRole("region", { name: "连续探针" }).getByText("rho 0.468")).toBeVisible();
  await expect(page.getByRole("region", { name: "连续探针" }).getByText("linear_probe_continuous.csv").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "跨模态验证" }).getByText("rho 0.570")).toBeVisible();
  await expect(page.getByRole("region", { name: "跨模态验证" }).getByText("cross_modal.csv").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "WEAT 关联检查" }).getByText("Health Halo")).toBeVisible();
  await expect(page.getByRole("region", { name: "WEAT 关联检查" }).getByText("skipped")).toBeVisible();
  await expect(page.getByRole("region", { name: "功能限制" }).getByText(/不是官方 Epicure App/)).toBeVisible();
});

test("key screens avoid horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "任务：模型对比" }).click();
  await page.getByPlaceholder(/输入食材/).fill("番茄");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "探索" }).click();
  await expect(page.getByRole("region", { name: "模型对比概览" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "关于" }).click();
  await expect(page.getByRole("heading", { name: "关于 Flavor Compass" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}
