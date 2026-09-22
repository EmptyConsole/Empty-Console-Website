import type { Metadata } from "next";
import { IBM_Plex_Mono, Tiny5 } from "next/font/google";
import "./globals.css";

const tiny5 = Tiny5({
  subsets: ["latin"],
  weight: "400",
  display: "block",
  variable: "--font-tiny5",
});

const readable = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  variable: "--font-readable",
});

export const metadata: Metadata = {
  title: "EMPTY CONSOLE",
  description: "empty-console v0.0.1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${tiny5.variable} ${readable.variable}`}>
      <body className={`booting ${tiny5.className}`}>{children}</body>
    </html>
  );
}
