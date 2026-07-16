import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Explicit Metadata type annotation ensures type safety across all SEO parameters
export const metadata: Metadata = {
  title: {
    default: "Flowboard | Real-Time Collaborative Whiteboard",
    template: "%s | Flowboard",
  },
  description: "A low-latency collaborative whiteboarding workspace powered by native WebSockets, Node.js, PostgreSQL, and Rough.js.",
  keywords: ["whiteboard", "collaboration", "real-time", "websockets", "nextjs", "roughjs", "canvas", "system-design"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-white text-slate-900`}>
        {children}
      </body>
    </html>
  );
}