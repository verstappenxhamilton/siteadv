import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Triagem Jurídica",
  description: "Chat de triagem legal",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
