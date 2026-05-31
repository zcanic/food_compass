import type { ModeMatch } from "../../types/mode";
import { MODEL_LABELS } from "../../types/model";
import { displayName } from "../../utils/text";

interface Props {
  modes: ModeMatch[];
}

const KIND_LABELS: Record<string, string> = {
  binary: "标签模式",
  continuous: "连续属性",
  factor: "涌现因子",
};

export function ModePanel({ modes }: Props) {
  if (modes.length === 0) return null;

  return (
    <section style={{ marginTop: 16 }} aria-label="食材街区">
      <h4 style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>
        食材街区
      </h4>
      {modes.slice(0, 6).map((m, i) => (
        <div
          key={`${m.model}-${m.mode.modeId}-${i}`}
          style={{
            padding: "10px 14px",
            marginBottom: 6,
            background: "#fafafa",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        >
          <div style={{ alignItems: "flex-start", display: "flex", gap: 10, justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 650 }}>
                {m.mode.label}
              </div>
              <div style={{ fontSize: 11, color: "var(--subtle)", marginTop: 3 }}>
                {MODEL_LABELS[m.model]} · {KIND_LABELS[m.mode.kind] ?? m.mode.kind} · {formatProperty(m.mode.property)} · {m.mode.nMembers} 个成员
              </div>
              {m.matchedIngredients && m.matchedIngredients.length > 0 && (
                <div style={{ fontSize: 11, color: "var(--accent-strong)", marginTop: 3 }}>
                  命中：{m.matchedIngredients.map(displayName).join(" · ")}
                </div>
              )}
            </div>
            <span
              title="mode 级平均属性强度，不是单个食材得分"
              style={{
                background: "#f3f6ef",
                border: "1px solid var(--border)",
                borderRadius: 999,
                color: "var(--muted)",
                flex: "0 0 auto",
                fontSize: 11,
                padding: "2px 7px",
              }}
            >
              z {m.mode.propZMean.toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
            {m.neighborsInMode.slice(0, 8).map(displayName).join(" · ")}
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
        在当前模型空间中，该食材常出现在这些食材街区附近。街区不是唯一分类，z 值是 mode 级平均属性强度。
      </div>
    </section>
  );
}

function formatProperty(property: string) {
  return property.replace(/_/g, " ");
}
