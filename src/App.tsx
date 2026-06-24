import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { useEngine } from "./hooks/useEngine";
import { useState } from "react";
import { BookOpen, Compass, LayoutDashboard } from "lucide-react";

type Page = "home" | "about";

export default function App() {
  const { engineReady, error } = useEngine();
  const [page, setPage] = useState<Page>("home");

  if (error) {
    return (
      <AppShell>
        <div style={{ padding: 40, textAlign: "center", color: "#c33" }}>
          <h2>加载失败</h2>
          <p>{error}</p>
        </div>
      </AppShell>
    );
  }

  if (!engineReady) {
    return (
      <AppShell>
        <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
          加载中...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="app-topbar">
        <div className="app-brand" aria-label="Flavor Compass">
          <span className="app-brand-mark"><Compass size={18} strokeWidth={2.2} /></span>
          <span>
            <strong>Flavor Compass</strong>
            <small>Epicure workspace</small>
          </span>
        </div>
        <nav className={`top-nav ${page === "about" ? "is-about" : "is-home"}`} aria-label="Primary">
          <span className="nav-indicator" aria-hidden="true" />
          <button
            onClick={() => setPage("home")}
            className={`nav-button ${page === "home" ? "active" : ""}`}
            aria-current={page === "home" ? "page" : undefined}
          >
            <LayoutDashboard size={15} aria-hidden="true" />
            工作台
          </button>
          <button
            onClick={() => setPage("about")}
            className={`nav-button ${page === "about" ? "active" : ""}`}
            aria-current={page === "about" ? "page" : undefined}
          >
            <BookOpen size={15} aria-hidden="true" />
            关于
          </button>
        </nav>
      </header>
      <main className="page-transition" key={page}>
        {page === "home" ? <HomePage /> : <AboutPage />}
      </main>
    </AppShell>
  );
}
