import type { Recommendation } from "../../types/result";
import { ResultCard } from "./ResultCard";

interface Props {
  results: Recommendation[];
  explanation: string;
  loading: boolean;
  emptyTitle?: string;
  emptyDetail?: string;
}

export function ResultList({
  results,
  explanation,
  loading,
  emptyTitle = "输入食材开始探索",
  emptyDetail = "选择任务后点击探索，推荐结果会显示在这里。",
}: Props) {
  if (loading) {
    return <div style={{ padding: 24, textAlign: "center", color: "#999" }}>检索中...</div>;
  }

  if (results.length === 0) {
    return (
      <div
        style={{
          padding: "34px 20px",
          textAlign: "center",
          color: "var(--muted)",
          background: "var(--panel-soft)",
          border: "1px dashed var(--border)",
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
          {emptyTitle}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
          {emptyDetail}
        </div>
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
