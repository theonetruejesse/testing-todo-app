import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { constructRuntimeHostConfigFromEnv } from "@construct/sdk/next/server";
import { LocalConstructProvider } from "./construct-provider";
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

const constructRuntime = constructRuntimeHostConfigFromEnv(process.env);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <LocalConstructProvider
          hostBuildId={constructRuntime.hostBuildId}
          platformWebOrigin={constructRuntime.platformWebOrigin}
          previewEnabled={constructRuntime.previewEnabled}
        >
          {children}
        </LocalConstructProvider>
      </body>
    </html>
  );
}
