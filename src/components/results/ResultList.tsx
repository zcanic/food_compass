import type { Recommendation } from "../../types/result";
import type { ModelName } from "../../types/model";
import { MODEL_LABELS } from "../../types/model";
import {
  COMPARISON_MODELS,
  summarizeModelComparison,
} from "../../utils/model-comparison-summary";
import { displayName } from "../../utils/text";
import { ResultCard } from "./ResultCard";

interface Props {
  results: Recommendation[];
  explanation: string;
  loading: boolean;
  emptyTitle?: string;
  emptyDetail?: string;
  groupByModel?: boolean;
  onAddIngredient?: (name: string) => void;
  listLabel?: string;
}

export function ResultList({
  results,
  explanation,
  loading,
  emptyTitle = "输入食材开始探索",
  emptyDetail = "选择任务后点击探索，推荐结果会显示在这里。",
  groupByModel = false,
  onAddIngredient,
  listLabel = "推荐结果",
}: Props) {
  if (loading) {
    return <ResultSkeleton />;
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
    <div className="result-list-reveal">
      <div className="result-list-heading">
        <h3>推荐结果</h3>
        <span>{results.length} 个候选</span>
      </div>
      {explanation && (
        <div className="result-list-explanation">{explanation}</div>
      )}
      <div className="result-list-disclaimer">
        分数为向量余弦相似度，用于排序，不是成功概率或安全保证。
      </div>
      {groupByModel ? (
        <GroupedResults results={results} onAddIngredient={onAddIngredient} />
      ) : (
        <div role="list" aria-label={listLabel}>
          {results.map((rec, i) => (
            <ResultCard
              key={`${rec.model}-${rec.name}-${i}`}
              rec={rec}
              rank={i + 1}
              onAddIngredient={onAddIngredient}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="result-skeleton" role="status" aria-label="检索中">
      <div className="result-skeleton-heading">
        <span className="result-skeleton-line is-title" />
        <span className="result-skeleton-line is-count" />
      </div>
      {[0, 1, 2].map((index) => (
        <div className="result-skeleton-row" key={index}>
          <span className="result-skeleton-rank" />
          <span className="result-skeleton-copy">
            <span className="result-skeleton-line is-name" />
            <span className="result-skeleton-line is-detail" />
          </span>
          <span className="result-skeleton-score" />
        </div>
      ))}
      <span className="sr-only">检索中...</span>
    </div>
  );
}

function GroupedResults({
  results,
  onAddIngredient,
}: {
  results: Recommendation[];
  onAddIngredient?: (name: string) => void;
}) {
  const models: ModelName[] = COMPARISON_MODELS;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <ModelComparisonOverview results={results} />
      {models.map((model) => {
        const modelResults = results.filter((rec) => rec.model === model);
        if (modelResults.length === 0) return null;
        const label = MODEL_LABELS[model];
        return (
          <section key={model} aria-label={`${label}结果`}>
            <h4 style={{ fontSize: 13, marginBottom: 6 }}>{label}</h4>
            <div role="list" aria-label={`${label}推荐结果`}>
              {modelResults.map((rec, i) => (
                <ResultCard
                  key={`${rec.model}-${rec.name}-${i}`}
                  rec={rec}
                  rank={i + 1}
                  onAddIngredient={onAddIngredient}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ModelComparisonOverview({ results }: { results: Recommendation[] }) {
  const summary = summarizeModelComparison(results);
  const sharedText = summary.sharedNames.length > 0
    ? summary.sharedNames.slice(0, 5).map(displayName).join("、")
    : "暂无重复候选";

  return (
    <section className="model-comparison-overview" aria-label="模型对比概览">
      <h4>模型对比概览</h4>
      <div className="model-comparison-metrics">
        <span>{summary.totalUnique} 个去重候选</span>
        <span>{summary.sharedNames.length} 个重复候选</span>
      </div>
      <div className="model-comparison-detail">
        共同出现：{sharedText}
      </div>
      <div className="model-comparison-detail">
        独有：常见搭配 {summary.uniqueCounts.cooc} · 综合推荐 {summary.uniqueCounts.core} · 风味相似 {summary.uniqueCounts.chem}
      </div>
    </section>
  );
}
