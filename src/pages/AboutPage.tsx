import {
  EVIDENCE_METRICS,
  MODEL_AXIS,
  PRODUCT_LIMITS,
  RESEARCH_FACTS,
} from "../research/evidence";

export function AboutPage() {
  return (
    <div style={{ maxWidth: 860, margin: "32px auto", padding: "0 24px 24px", lineHeight: 1.75 }}>
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>关于 Flavor Compass</h1>

      <section style={{ marginBottom: 24 }} aria-label="研究依据">
        <h2 style={{ fontSize: 16 }}>研究依据</h2>
        <p style={{ fontSize: 14 }}>
          Flavor Compass 把 Epicure 论文里的食材 embedding 产品化为一个食材语义地图。
          核心不是生成菜谱，而是在同一个 300 维空间里做最近邻、组合、mode lookup 和实验性方向移动。
        </p>
        <div className="research-fact-grid">
          {RESEARCH_FACTS.map((fact) => (
            <div key={fact.label} className="research-fact">
              <div className="research-fact-value">{fact.value}</div>
              <div className="research-fact-label">{fact.label}</div>
              <div className="research-fact-detail">{fact.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="三模型设计轴">
        <h2 style={{ fontSize: 16 }}>三模型设计轴</h2>
        <p style={{ fontSize: 14 }}>
          Cooc、Core、Chem 不是三个随机按钮，而是论文中 recipe-context 到 flavor-chemistry 的可控设计轴。
        </p>
        <div className="model-axis-grid">
          {MODEL_AXIS.map((entry) => (
            <div key={entry.model} className="model-axis-card">
              <div className="model-axis-label">{entry.label}</div>
              <div className="model-axis-signal">{entry.signal}</div>
              <div className="model-axis-detail">{entry.bestFor}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="证据指标">
        <h2 style={{ fontSize: 16 }}>证据指标</h2>
        <div className="evidence-grid">
          {EVIDENCE_METRICS.map((metric) => (
            <div key={metric.label} className="evidence-card">
              <div className="evidence-card-label">{metric.label}</div>
              <div className="evidence-card-value">{metric.value}</div>
              <div className="evidence-card-source">{metric.source}</div>
              <div className="evidence-card-detail">{metric.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="数据来源">
        <h2 style={{ fontSize: 16 }}>数据来源</h2>
        <p style={{ fontSize: 14 }}>
          This product uses ingredient embeddings and related artifacts from:
        </p>
        <p style={{ fontSize: 14, fontStyle: "italic" }}>
          Radzikowski, J. & Chen, J. (2026). Epicure: Navigating the Emergent Geometry
          of Food Ingredient Embeddings. arXiv:2605.22391.
        </p>
        <p style={{ fontSize: 14 }}>
          The original research artifacts are licensed under CC BY 4.0.
          We have processed the released CSV files for browser-side retrieval,
          visualization, and interactive recommendation.
        </p>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="独立性声明">
        <h2 style={{ fontSize: 16 }}>独立性声明</h2>
        <p style={{ fontSize: 14 }}>
          This product is independent and is not affiliated with, sponsored by,
          or endorsed by the original authors or KAIKAKU.AI.
        </p>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="功能限制">
        <h2 style={{ fontSize: 16 }}>功能限制</h2>
        <ul style={{ fontSize: 14, paddingLeft: 20 }}>
          {PRODUCT_LIMITS.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </section>

      <section aria-label="技术栈">
        <h2 style={{ fontSize: 16 }}>技术栈</h2>
        <p style={{ fontSize: 14 }}>
          Vite · React · TypeScript · Capacitor · Zustand · Web Worker
        </p>
      </section>
    </div>
  );
}
