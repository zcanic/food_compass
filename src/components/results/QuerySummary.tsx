import type { ModelName } from "../../types/model";
import { MODEL_LABELS } from "../../types/model";
import type { AppMode, StyleStrength } from "../../types/query";
import { STYLE_LABELS, STYLE_STRENGTH_LABELS } from "../../utils/constants";
import { displayName } from "../../utils/text";

const MODE_LABELS: Record<AppMode, string> = {
  pairing: "找搭配",
  substitute: "找替代",
  style_shift: "换风格",
  lookup_mode: "查街区",
  complete_combo: "组菜",
  compare_models: "模型对比",
  ask: "Ask",
};

interface Props {
  mode: AppMode;
  ingredients: string[];
  model: ModelName;
  hasSearched: boolean;
  targetStyle?: string;
  strength?: StyleStrength;
}

export function QuerySummary({
  mode,
  ingredients,
  model,
  hasSearched,
  targetStyle,
  strength,
}: Props) {
  if (ingredients.length === 0) return null;

  const styleText = targetStyle
    ? `${STYLE_LABELS[targetStyle] ?? targetStyle} · ${STYLE_STRENGTH_LABELS[strength ?? "medium"] ?? "中等"}`
    : null;

  return (
    <div
      role="region"
      aria-label="查询摘要"
      style={{
        display: "grid",
        gap: 10,
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        marginBottom: 14,
        padding: 12,
        background: "#f8faf7",
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}
    >
      <SummaryItem label="当前任务" value={MODE_LABELS[mode]} />
      <SummaryItem label="输入食材" value={ingredients.map(displayName).join("、")} />
      <SummaryItem label="模型视角" value={MODEL_LABELS[model]} />
      {styleText && <SummaryItem label="目标风格" value={styleText} />}
      <SummaryItem label="状态" value={hasSearched ? "已检索" : "待检索"} />
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "var(--subtle)", fontSize: 11 }}>{label}</div>
      <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 700, marginTop: 2 }}>
        {value}
      </div>
    </div>
  );
}
