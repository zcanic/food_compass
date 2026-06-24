import type { Recommendation } from "../../types/result";
import { MODEL_LABELS } from "../../types/model";
import { displayName } from "../../utils/text";
import { Plus } from "lucide-react";

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
      className="result-card"
    >
      <span className="result-card-rank">{rank}</span>
      <span className="result-card-name">
        {name}
        <span className="result-card-model">
          {MODEL_LABELS[rec.model]}
        </span>
        {rec.crossLabel === "chem-only" && (
          <span className="result-card-annotation">
            风味近·菜谱不常见
          </span>
        )}
        {rec.crossLabel === "both" && (
          <span className="result-card-annotation is-verified">
            风味近·菜谱验证
          </span>
        )}
      </span>
      <span
        title="向量余弦相似度，不是成功概率"
        className="result-card-score"
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
          <Plus size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
