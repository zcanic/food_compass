import type { StyleStrength } from "../../types/query";
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
        [实验功能] 目标风格由产品层代表食材构造，不代表严格菜系定义。
      </div>
    </div>
  );
}
