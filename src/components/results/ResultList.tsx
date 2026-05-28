import type { Recommendation } from "../../types/result";
import { ResultCard } from "./ResultCard";

interface Props {
  results: Recommendation[];
  explanation: string;
  loading: boolean;
}

export function ResultList({ results, explanation, loading }: Props) {
  if (loading) {
    return <div style={{ padding: 24, textAlign: "center", color: "#999" }}>检索中...</div>;
  }

  if (results.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#999" }}>
        输入食材开始探索
      </div>
    );
  }

  return (
    <div>
      {explanation && (
        <div style={{ fontSize: 13, color: "#888", marginBottom: 12, lineHeight: 1.6 }}>
          {explanation}
        </div>
      )}
      {results.map((rec, i) => (
        <ResultCard key={rec.name} rec={rec} rank={i + 1} />
      ))}
    </div>
  );
}
