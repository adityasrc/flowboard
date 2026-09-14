import type { Metadata } from "next";
import { Geist, Geist_Mono, Patrick_Hand } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick-hand",
});

export const metadata: Metadata = {
  title: {
    default: "Flowboard | Real-Time Collaborative Canvas",
    template: "%s | Flowboard",
  },
  description:
    "A low-latency collaborative canvas workspace powered by native WebSockets, Node.js, PostgreSQL, and Rough.js.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${patrickHand.variable} font-sans antialiased bg-white text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}
