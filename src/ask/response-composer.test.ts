import { describe, expect, it } from "vitest";
import { composeResponse } from "./response-composer";
import type { SkillResult } from "../types/result";

const skill = (result: Partial<SkillResult>): SkillResult => ({
  skillName: "find_pairings",
  recommendations: [],
  status: "ok",
  ...result,
});

describe("composeResponse", () => {
  it("groups recommendations by tool source", async () => {
    const response = await composeResponse("番茄鸡蛋做得更日式还能加什么", [
      skill({
        skillName: "shift_style",
        recommendations: [
          { name: "soy_sauce", score: 0.8, model: "core" },
          { name: "scallion", score: 0.7, model: "core" },
        ],
      }),
      skill({
        skillName: "find_pairings",
        recommendations: [{ name: "basil", score: 0.6, model: "cooc" }],
      }),
    ]);

    expect(response.answer).toContain("风格偏移：soy sauce、scallion");
    expect(response.answer).toContain("常见搭配：basil");
  });

  it("answers mode-only tool results without pretending recommendations failed", async () => {
    const response = await composeResponse("味噌属于什么类型", [
      skill({
        skillName: "lookup_mode",
        modes: [
          {
            label: "Japanese vegetables and umami seasonings",
            model: "core",
            members: ["rice_vinegar", "dashi"],
          },
        ],
      }),
    ]);

    expect(response.answer).toContain("食材街区：");
    expect(response.answer).toContain("Japanese vegetables and umami seasonings（core）");
    expect(response.answer).not.toContain("暂未找到匹配");
  });
});
