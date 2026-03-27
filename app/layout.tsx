import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "./components/authguard";

export const metadata: Metadata = {
  title: "EstApp",
  description: "Seu aplicativo exclusivo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}