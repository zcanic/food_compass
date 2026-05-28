export function AboutPage() {
  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 24px", lineHeight: 1.8 }}>
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>关于 Flavor Compass</h1>

      <section style={{ marginBottom: 24 }}>
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

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16 }}>独立性声明</h2>
        <p style={{ fontSize: 14 }}>
          This product is independent and is not affiliated with, sponsored by,
          or endorsed by the original authors or KAIKAKU.AI.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16 }}>功能限制</h2>
        <ul style={{ fontSize: 14, paddingLeft: 20 }}>
          <li>当前版本基于 1,790 种规范食材的嵌入向量，不覆盖所有食材。</li>
          <li>风味相似推荐不等于 1:1 可替换，用量和烹饪方式需自行调整。</li>
          <li>风格迁移为实验功能，方向由产品层代表食材构造。</li>
          <li>不提供过敏源判断、医疗建议或安全性保证。</li>
          <li>没有完整营养数据库，饮食约束过滤尚未启用。</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: 16 }}>技术栈</h2>
        <p style={{ fontSize: 14 }}>
          Vite · React · TypeScript · Capacitor · Zustand · Web Worker
        </p>
      </section>
    </div>
  );
}
