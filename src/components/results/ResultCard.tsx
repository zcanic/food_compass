import type { Recommendation } from "../../types/result";
import { MODEL_LABELS } from "../../types/model";
import { displayName } from "../../utils/text";

interface Props {
  rec: Recommendation;
  rank: number;
  onAddIngredient?: (name: string) => void;
}

export function ResultCard({ rec, rank, onAddIngredient }: Props) {
  const score = rec.score.toFixed(3);
  const name = displayName(rec.name);

  return (
    <div
      role="listitem"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <span style={{ color: "#999", fontSize: 13, minWidth: 20 }}>{rank}</span>
      <span style={{ flex: 1, fontSize: 15 }}>
        {name}
        <span style={{ fontSize: 11, color: "#777", marginLeft: 8 }}>
          {MODEL_LABELS[rec.model]}
        </span>
        {rec.crossLabel === "chem-only" && (
          <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>
            风味近·菜谱不常见
          </span>
        )}
        {rec.crossLabel === "both" && (
          <span style={{ fontSize: 11, color: "#2a7", marginLeft: 8 }}>
            风味近·菜谱验证
          </span>
        )}
      </span>
      <span
        title="向量余弦相似度，不是成功概率"
        style={{
          fontSize: 13,
          color: "#666",
          background: "#f5f5f5",
          padding: "2px 8px",
          borderRadius: 10,
          whiteSpace: "nowrap",
        }}
      >
          cos {score}
      </span>
      {onAddIngredient && (
        <button
          type="button"
          className="result-action-button"
          onClick={() => onAddIngredient(rec.name)}
          aria-label={`加入 ${name}`}
          title="加入当前查询"
        >
          +
        </button>
      )}
    </div>
  );
}
