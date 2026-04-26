import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
}

export function DashboardLayout({ children, noPadding }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex w-full" style={{ background: "linear-gradient(135deg, #07070f 0%, #0a0a12 40%, #0f0520 100%)" }}>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <main className={noPadding ? "flex-1 overflow-hidden" : "flex-1 overflow-auto p-6"}>
          {children}
        </main>
      </div>
    </div>
  );
}