import type { Metadata } from "next";
import { Tiny5 } from "next/font/google";
import "./globals.css";

const tiny5 = Tiny5({
  subsets: ["latin"],
  weight: "400",
  display: "block",
  variable: "--font-tiny5",
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
    <html lang="en" className={tiny5.variable}>
      <body className={`booting ${tiny5.className}`}>{children}</body>
    </html>
  );
}
