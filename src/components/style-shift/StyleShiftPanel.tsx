import type { StyleStrength } from "../../types/query";
import {
  STYLE_DIRECTION_BENCHMARKS,
  STYLE_ORTHOGONAL_BENCHMARKS,
} from "../../research/style-direction-benchmarks";
import { STYLE_LABELS, STYLE_SEED_SETS, STYLE_STRENGTH_LABELS } from "../../utils/constants";

interface Props {
  selectedStyle: string;
  strength: StyleStrength;
  onChangeStyle: (s: string) => void;
  onChangeStrength: (s: StyleStrength) => void;
}

const STRENGTHS: { value: StyleStrength; label: string }[] = [
  { value: "light", label: STYLE_STRENGTH_LABELS.light },
  { value: "medium", label: STYLE_STRENGTH_LABELS.medium },
  { value: "strong", label: STYLE_STRENGTH_LABELS.strong },
];

export function StyleShiftPanel({
  selectedStyle,
  strength,
  onChangeStyle,
  onChangeStrength,
}: Props) {
  const benchmark = STYLE_DIRECTION_BENCHMARKS[selectedStyle];
  const orthogonal = STYLE_ORTHOGONAL_BENCHMARKS[selectedStyle];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
        选择目标风格方向：
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {Object.keys(STYLE_SEED_SETS).map((style) => (
          <button
            key={style}
            onClick={() => onChangeStyle(style)}
            aria-label={`风格：${STYLE_LABELS[style] ?? style}`}
            style={{
              padding: "6px 12px",
              border: selectedStyle === style ? "2px solid #2a7" : "1px solid #ddd",
              borderRadius: 16,
              background: selectedStyle === style ? "#e8f4e8" : "#fff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <span style={{ fontWeight: 650 }}>{STYLE_LABELS[style] ?? style}</span>
            <span style={{ color: "#777", marginLeft: 6, fontSize: 11 }}>
              {style.replace(/_/g, " ")}
            </span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#666" }}>强度：</span>
        {STRENGTHS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChangeStrength(value)}
            style={{
              padding: "4px 14px",
              border: strength === value ? "2px solid #2a7" : "1px solid #ddd",
              borderRadius: 16,
              background: strength === value ? "#e8f4e8" : "#fff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        style={{
          marginTop: 8,
          padding: "6px 10px",
          background: "#fffbe6",
          borderRadius: 6,
          fontSize: 11,
          color: "#888",
        }}
      >
        [实验功能] 强度控制当前组合向量向目标 seed-set 的插值比例；目标风格不代表严格菜系定义。
      </div>
      {benchmark && (
        <div className="style-benchmark-note" role="region" aria-label="风格迁移证据">
          论文方向算术 benchmark：{benchmark.testCase}，{benchmark.model.toUpperCase()}，
          {benchmark.angleDeg} deg，目标命中 {benchmark.targetHits}/{benchmark.totalHits}。
          {orthogonal && (
            <>
              {" "}orthogonal SNR {orthogonal.meanSnr.toFixed(3)}，目标命中 {orthogonal.targetHits}/{orthogonal.totalHits}。
            </>
          )}
          当前功能只把它作为证据提示，不直接读取预计算推荐列表。来源：{benchmark.source}。
          {orthogonal && <> {orthogonal.source}。</>}
        </div>
      )}
    </div>
  );
}
