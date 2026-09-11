import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORMA — Spaces, assembled.",
  description: "An independent architecture studio. Explore thoughtful spaces and an interactive modular house.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
