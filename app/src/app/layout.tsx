import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DataQuery AI — SQL to Natural Language",
  description: "Interrogez Snowflake en langage naturel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-white text-gray-900">
        <Suspense fallback={<div className="w-56 flex-shrink-0 bg-white border-r border-gray-200" />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
