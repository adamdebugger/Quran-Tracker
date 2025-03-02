import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"

const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "متابعة ختم القرآن",
  description: "تطبيق لمتابعة ختم القرآن خلال رمضان",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={cairo.className}>{children}</body>
    </html>
  )
}



import './globals.css'