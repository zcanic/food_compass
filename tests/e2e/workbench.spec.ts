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
  await expect(page.getByText("20 个候选")).toBeVisible();
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
  const askStatus = page.getByRole("region", { name: "Ask LLM 状态" });
  await expect(askStatus.getByText("missing")).toBeVisible();
  await expect(askStatus.getByText("rules fallback")).toBeVisible();
  await expect(askStatus.getByText("Cooc / Core / Chem")).toBeVisible();

  await page
    .getByPlaceholder(/描述你想做什么/)
    .fill("我有番茄和鸡蛋，想做得更日式一点，可以加什么？");
  await page.getByRole("button", { name: "提问" }).click();

  await expect(page.getByText(/意图：style_shift/)).toBeVisible();
  await expect(page.getByText(/编排层：本地规则 · 工具层：Cooc\/Core\/Chem/)).toBeVisible();
  await expect(page.getByText(/工具计划：本地默认 · 风格偏移\/core → 常见搭配\/cooc → 组合补全\/core/)).toBeVisible();
  await expect(page.getByText(/意图链：pairing、style_shift、complete_combo/)).toBeVisible();
  await expect(page.getByText(/食材：tomato、egg/)).toBeVisible();
  await expect(page.getByText(/调用工具：shift_style/)).toBeVisible();
  await expect(page.getByText(/风格偏移：/)).toBeVisible();
  await expect(page.getByText(/常见搭配：/)).toBeVisible();
  await expect(page.getByText(/组合补全：/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Ask 执行诊断" }).getByText(/工具执行：3 个 · (Worker|本地 fallback) · \d+ ms/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Ask 执行诊断" }).getByText("向量工具 3 · 街区 0 · 约束 0")).toBeVisible();
  await expect(page.getByRole("region", { name: "Ask 执行诊断" }).getByText("LLM：未配置 · 回答组织：本地模板")).toBeVisible();
  await expect(page.getByRole("list", { name: "风格偏移推荐结果" })).toBeVisible();
  await expect(page.getByRole("list", { name: "常见搭配推荐结果" })).toBeVisible();
  await expect(page.getByRole("list", { name: "组合补全推荐结果" })).toBeVisible();
});

test("ask mode can use a configured LLM endpoint while keeping recommendations tool-sourced", async ({ page }) => {
  await page.route("**/__test_llm", async (route) => {
    const body = route.request().postDataJSON() as {
      messages: { role: string; content: string }[];
    };
    const system = body.messages.find((message) => message.role === "system")?.content ?? "";
    const content = system.includes("Ask 编排器")
      ? JSON.stringify({
          intent: "style_shift",
          matchedIntents: ["style_shift"],
          targetStyle: "Japanese",
          constraints: [],
          confidence: 0.91,
          toolPlan: [{ name: "shift_style", strength: "medium", topK: 6 }],
        })
      : "LLM 组织回答：推荐候选仍来自本地三模型工具。";

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ content }),
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("food_compass_llm_api_url", "/__test_llm");
  });
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  const askStatus = page.getByRole("region", { name: "Ask LLM 状态" });
  await expect(askStatus.getByText("configured")).toBeVisible();
  await expect(askStatus.getByText("LLM + rules fallback")).toBeVisible();

  await page
    .getByPlaceholder(/描述你想做什么/)
    .fill("番茄和鸡蛋来点新方向");
  await page.getByRole("button", { name: "提问" }).click();

  await expect(page.getByText(/编排层：LLM · 工具层：Cooc\/Core\/Chem/)).toBeVisible();
  await expect(page.getByText("工具计划：LLM 已选择 · 风格偏移/core")).toBeVisible();
  await expect(page.getByText("LLM 组织回答：推荐候选仍来自本地三模型工具。")).toBeVisible();
  await expect(page.getByText(/调用工具：shift_style/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Ask 执行诊断" }).getByText("LLM：已配置 · 回答组织：LLM")).toBeVisible();
  await expect(page.getByRole("list", { name: "推荐结果" })).toBeVisible();
});

test("ask endpoint override can be edited from the Ask panel", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  const askStatus = page.getByRole("region", { name: "Ask LLM 状态" });
  const endpointSettings = page.getByRole("region", { name: "Ask LLM endpoint 设置" });

  await expect(askStatus.getByText("missing")).toBeVisible();
  await endpointSettings.getByLabel("LLM endpoint override").fill("/__test_llm");
  await endpointSettings.getByRole("button", { name: "保存" }).click();
  await expect(askStatus.getByText("configured")).toBeVisible();
  await expect(askStatus.getByText("LLM + rules fallback")).toBeVisible();

  await endpointSettings.getByRole("button", { name: "清除" }).click();
  await expect(askStatus.getByText("missing")).toBeVisible();
});

test("ask mode falls back to local rules when LLM routing returns malformed JSON", async ({ page }) => {
  await page.route("**/__bad_llm", async (route) => {
    const body = route.request().postDataJSON() as {
      messages: { role: string; content: string }[];
    };
    const system = body.messages.find((message) => message.role === "system")?.content ?? "";
    const content = system.includes("Ask 编排器")
      ? "not-json"
      : "LLM 回答组织仍可使用，但路由已回退到本地规则。";

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ content }),
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("food_compass_llm_api_url", "/__bad_llm");
  });
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  await page
    .getByPlaceholder(/描述你想做什么/)
    .fill("我有番茄和鸡蛋，想做得更日式一点，可以加什么？");
  await page.getByRole("button", { name: "提问" }).click();

  await expect(page.getByText(/编排层：本地规则 · 工具层：Cooc\/Core\/Chem/)).toBeVisible();
  await expect(page.getByText("LLM 回答组织仍可使用，但路由已回退到本地规则。")).toBeVisible();
  await expect(page.getByText(/调用工具：shift_style、find_pairings、complete_combination/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Ask 执行诊断" }).getByText("LLM：已配置 · 回答组织：LLM")).toBeVisible();
});

test("ask mode falls back to local rules and local composition when LLM endpoint fails", async ({ page }) => {
  await page.route("**/__failing_llm", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "mock failure" }),
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("food_compass_llm_api_url", "/__failing_llm");
  });
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  await page
    .getByPlaceholder(/描述你想做什么/)
    .fill("番茄可以和什么搭配？");
  await page.getByRole("button", { name: "提问" }).click();

  await expect(page.getByText(/编排层：本地规则 · 工具层：Cooc\/Core\/Chem/)).toBeVisible();
  await expect(page.getByText(/推荐结果：/)).toBeVisible();
  await expect(page.getByText(/常见搭配：/)).toBeVisible();
  await expect(page.getByText(/调用工具：find_pairings/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Ask 执行诊断" }).getByText("LLM：已配置 · 回答组织：本地模板 fallback")).toBeVisible();
});

test("ask mode lets the user retry LLM composition after a transient endpoint failure", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/__retry_llm", async (route) => {
    requestCount += 1;
    if (requestCount <= 2) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "temporary failure" }),
      });
      return;
    }

    const body = route.request().postDataJSON() as {
      messages: { role: string; content: string }[];
    };
    const system = body.messages.find((message) => message.role === "system")?.content ?? "";
    const content = system.includes("Ask 编排器")
      ? JSON.stringify({
          intent: "pairing",
          matchedIntents: ["pairing"],
          constraints: [],
          confidence: 0.9,
        })
      : "LLM 重试成功，候选仍由 Cooc 工具提供。";
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ content }),
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("food_compass_llm_api_url", "/__retry_llm");
  });
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  await page.getByPlaceholder(/描述你想做什么/).fill("番茄可以和什么搭配？");
  await page.getByRole("button", { name: "提问" }).click();

  await expect(page.getByRole("button", { name: "重试 LLM" })).toBeVisible();
  await page.getByRole("button", { name: "重试 LLM" }).click();

  await expect(page.getByText("LLM 重试成功，候选仍由 Cooc 工具提供。")).toBeVisible();
  await expect(page.getByText(/编排层：LLM · 工具层：Cooc\/Core\/Chem/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Ask 执行诊断" }).getByText("LLM：已配置 · 回答组织：LLM")).toBeVisible();
  await expect(page.getByRole("button", { name: "重试 LLM" })).toHaveCount(0);
});
test("editing an Ask question cancels a slow LLM request and drops stale output", async ({ page }) => {
  await page.route("**/__slow_cancel", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    try {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          content: JSON.stringify({
            intent: "pairing",
            matchedIntents: ["pairing"],
            constraints: [],
            confidence: 0.9,
          }),
        }),
      });
    } catch {
      // The browser has already canceled this intercepted request.
    }
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("food_compass_llm_api_url", "/__slow_cancel");
  });
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  const question = page.getByPlaceholder(/描述你想做什么/);
  await question.fill("番茄可以和什么搭配？");
  await page.getByRole("button", { name: "提问" }).click();
  await expect(page.getByRole("button", { name: "处理中..." })).toBeVisible();

  await question.fill("鸡蛋可以和什么搭配？");
  await expect(page.getByRole("button", { name: "提问" })).toBeVisible();
  await page.waitForTimeout(500);

  await expect(page.getByRole("region", { name: "Ask 解析结果" })).toHaveCount(0);
  await expect(page.getByText(/处理请求时出错/)).toHaveCount(0);
});

test("leaving Ask mode cancels a slow LLM request without stale errors", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.route("**/__slow_leave", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    try {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ content: "{}" }),
      });
    } catch {
      // The browser has already canceled this intercepted request.
    }
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("food_compass_llm_api_url", "/__slow_leave");
  });
  await page.goto("/");

  await page.getByRole("button", { name: /Ask/ }).click();
  await page.getByPlaceholder(/描述你想做什么/).fill("番茄可以和什么搭配？");
  await page.getByRole("button", { name: "提问" }).click();
  await page.getByRole("button", { name: "任务：找搭配" }).click();
  await expect(page.getByText("当前使用：常见搭配。")).toBeVisible();
  await page.waitForTimeout(500);

  expect(pageErrors).toEqual([]);
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
  await expect(page.getByText(/向 日式 风格做了中等强度向量插值/)).toBeVisible();
  await expect(page.getByRole("region", { name: "风格迁移证据" }).getByText("direction_arithmetic_full.csv")).toBeVisible();
  await expect(page.getByRole("region", { name: "风格迁移证据" }).getByText("orthogonal SNR 0.538")).toBeVisible();
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

  await expect(page.getByText(/向 日式 风格做了中等强度向量插值/)).toBeVisible();
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
  await expect(page.getByRole("region", { name: "Mode atlas 覆盖" }).getByText("193 modes")).toBeVisible();
  await expect(page.getByRole("region", { name: "Mode atlas 覆盖" }).getByText("mode_atlas_core.csv")).toBeVisible();
  await expect(page.getByRole("region", { name: "实验风格方向" }).getByText("style_seed_sets.json").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "实验风格方向" }).getByText("soy_sauce").first()).toBeVisible();
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
