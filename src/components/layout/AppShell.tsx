import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px 24px" }}>
      {children}
    </div>
  );
}
