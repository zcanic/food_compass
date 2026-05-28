import type { ModeMatch } from "../../types/mode";

interface Props {
  modes: ModeMatch[];
}

export function ModePanel({ modes }: Props) {
  if (modes.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>
        食材街区
      </h4>
      {modes.slice(0, 5).map((m, i) => (
        <div
          key={i}
          style={{
            padding: "10px 14px",
            marginBottom: 6,
            background: "#fafafa",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {m.mode.label}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
            {m.neighborsInMode.slice(0, 8).map((n) => n.replace(/_/g, " ")).join(" · ")}
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
        在当前模型空间中，该食材常出现在这些食材街区附近。街区不是唯一分类。
      </div>
    </div>
  );
}
