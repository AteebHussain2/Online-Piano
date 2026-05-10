import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeyFlow — Online Piano | Play Piano in Your Browser",
  description:
    "A beautiful browser-based piano with 88 keys, realistic grand piano sounds, customizable keybindings, and two-keyboard support. No downloads, no login required — just music.",
  keywords: [
    "online piano",
    "browser piano",
    "virtual piano",
    "piano keyboard",
    "play piano online",
    "KeyFlow",
  ],
  authors: [{ name: "KeyFlow" }],
  openGraph: {
    title: "KeyFlow — Online Piano",
    description: "Play a beautiful 88-key piano right in your browser. Zero friction, realistic sound.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
