import type { ModelName } from "../../types/model";
import { MODEL_LABELS } from "../../types/model";
import type { AppMode, QueryDiagnostics, RetrievalBackend, StyleStrength } from "../../types/query";
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
  diagnostics?: QueryDiagnostics | null;
}

const BACKEND_LABELS: Record<RetrievalBackend, string> = {
  worker: "Worker",
  local: "本地 fallback",
  "mode-atlas": "Mode atlas",
};

export function QuerySummary({
  mode,
  ingredients,
  model,
  hasSearched,
  targetStyle,
  strength,
  diagnostics,
}: Props) {
  if (ingredients.length === 0) return null;

  const styleText = targetStyle
    ? `${STYLE_LABELS[targetStyle] ?? targetStyle} · ${STYLE_STRENGTH_LABELS[strength ?? "medium"] ?? "中等"}`
    : null;

  return (
    <div
      role="region"
      aria-label="查询摘要"
      className="query-summary"
    >
      <SummaryItem label="当前任务" value={MODE_LABELS[mode]} />
      <SummaryItem label="输入食材" value={ingredients.map(displayName).join("、")} />
      <SummaryItem label="模型视角" value={MODEL_LABELS[model]} />
      {styleText && <SummaryItem label="目标风格" value={styleText} />}
      <SummaryItem label="状态" value={hasSearched ? "已检索" : "待检索"} />
      {hasSearched && diagnostics && (
        <SummaryItem
          label="检索通道"
          value={`${BACKEND_LABELS[diagnostics.backend]} · ${diagnostics.elapsedMs} ms`}
        />
      )}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="query-summary-item">
      <div className="query-summary-label">{label}</div>
      <div className="query-summary-value">{value}</div>
    </div>
  );
}
