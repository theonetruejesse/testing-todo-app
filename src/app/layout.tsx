import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TodoConstructProvider } from "./construct-provider";
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
  title: "Todo Runtime Check",
  description: "A minimal Next.js todo app for sandbox ingestion tests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <TodoConstructProvider>{children}</TodoConstructProvider>
      </body>
    </html>
  );
}
