"use client";

import { ReactNode } from "react";
import LiteSidebar from "@/components/lite-sidebar";
import LiteHeader from "@/components/lite-header";

type LiteShellProps = {
  title: string;
  children: ReactNode;
};

export default function LiteShell({
  title,
  children,
}: LiteShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <LiteHeader title={title} />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <LiteSidebar />

        <main
          style={{
            flex: 1,
            padding: "24px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}