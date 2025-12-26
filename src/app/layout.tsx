import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Canonical domain for all metadata (keeps social previews consistent)
const canonicalBaseUrl = "https://www.emptyconsole.com"
const baseUrl = canonicalBaseUrl

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  title: "Empty Console",
  description:
    "Empty Console is a team of students who came together due to their love of programming. Explore our projects, meet the team, and see what we've built.",
  openGraph: {
    title: "Empty Console | Top Grade Software Development Team",
    description: "Empty Console is a team of students who came together due to their love of programming.",
    type: "website",
    url: baseUrl,
    siteName: "Empty Console",
    images: [
      {
        url: `${baseUrl}/BetterEmptyConsoleLogo.png`,
        width: 1200,
        height: 630,
        alt: "Empty Console Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Empty Console | Top Grade Software Development Team",
    description: "Empty Console is a team of students who came together due to their love of programming.",
    images: [`${baseUrl}/BetterEmptyConsoleLogo.png`],
  },
  icons: {
    icon: "/BetterEmptyConsoleLogo.png",
    shortcut: "/BetterEmptyConsoleLogo.png",
    apple: "/BetterEmptyConsoleLogo.png",
  },
  // generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
