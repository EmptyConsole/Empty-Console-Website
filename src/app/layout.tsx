import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Empty Console | Top Grade Software Development Team",
  description:
    "Empty Console is a team of students who came together due to their love of programming. Explore our projects, meet the team, and see what we've built.",
  openGraph: {
    title: "Empty Console | Top Grade Software Development Team",
    description: "Empty Console is a team of students who came together due to their love of programming.",
    type: "website",
    images: [
      {
        url: "/EmptyConsoleLogo.png",
        width: 1200,
        height: 630,
        alt: "Empty Console Logo",
      },
    ],
  },
  icons: {
    icon: "/EmptyConsoleLogo.png",
    shortcut: "/EmptyConsoleLogo.png",
    apple: "/EmptyConsoleLogo.png",
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
