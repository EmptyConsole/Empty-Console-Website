import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Get the base URL for metadata (works in both dev and production)
const getBaseUrl = () => {
  // In production, use the actual domain or Vercel URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  // Vercel automatically provides this
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Default to localhost for development
  return "http://localhost:3000"
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Empty Console",
  description:
    "Empty Console is a team of students who came together due to their love of programming. Explore our projects, meet the team, and see what we've built.",
  openGraph: {
    title: "Empty Console | Top Grade Software Development Team",
    description: "Empty Console is a team of students who came together due to their love of programming.",
    type: "website",
    images: [
      {
        url: "/BetterEmptyConsoleLogo.png",
        width: 1200,
        height: 630,
        alt: "Empty Console Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Empty Console | Top Grade Software Development Team",
    description: "Empty Console is a team of students who came together due to their love of programming.",
    images: ["/BetterEmptyConsoleLogo.png"],
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
