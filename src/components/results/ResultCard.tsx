import type { Recommendation } from "../../types/result";
import { MODEL_LABELS } from "../../types/model";
import { displayName } from "../../utils/text";

interface Props {
  rec: Recommendation;
  rank: number;
}

export function ResultCard({ rec, rank }: Props) {
  const pct = (rec.score * 100).toFixed(0);

  return (
    <div
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
        {displayName(rec.name)}
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
        style={{
          fontSize: 13,
          color: "#666",
          background: "#f5f5f5",
          padding: "2px 8px",
          borderRadius: 10,
        }}
      >
        {pct}%
      </span>
    </div>
  );
}
