import type { AppMode } from "../../types/query";

const MODES: { mode: AppMode; label: string; short: string }[] = [
  { mode: "pairing", label: "找搭配", short: "还能加什么" },
  { mode: "substitute", label: "找替代", short: "没有它用什么" },
  { mode: "style_shift", label: "换风格", short: "推向目标风味" },
  { mode: "lookup_mode", label: "查街区", short: "它属于哪里" },
  { mode: "complete_combo", label: "组菜", short: "已有食材补全" },
  { mode: "ask", label: "Ask", short: "一句话提问" },
];

interface Props {
  active: AppMode;
  onChange: (mode: AppMode) => void;
}

export function ModeTabs({ active, onChange }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
      {MODES.map(({ mode, label, short }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          aria-label={`任务：${label}`}
          style={{
            padding: "10px 12px",
            border: active === mode ? "2px solid #2a7" : "1px solid #ccc",
            borderRadius: 8,
            background: active === mode ? "#e8f4e8" : "#fff",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ display: "block", fontSize: 14, fontWeight: active === mode ? 700 : 600 }}>
            {label}
          </span>
          <span style={{ display: "block", color: "#777", fontSize: 11, marginTop: 2 }}>
            {short}
          </span>
        </button>
      ))}
    </div>
  );
}
