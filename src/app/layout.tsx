import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const previewEnabled = process.env.CONSTRUCT_RUNTIME_PREVIEWS_ENABLED === "true";
const hostBuildId = resolveHostBuildId();
const platformWebOrigin = resolvePlatformWebOrigin();

function resolveHostBuildId(): string {
  const identity =
    process.env.CONSTRUCT_HOST_BUILD_ID?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.VERCEL_DEPLOYMENT_ID?.trim();
  if (identity) return identity;
  if (previewEnabled && process.env.NODE_ENV === "production") {
    throw new Error("Preview-enabled production builds require a host build identity.");
  }
  return "development";
}

function resolvePlatformWebOrigin(): string {
  const configured = process.env.CONSTRUCT_PLATFORM_WEB_ORIGIN?.trim();
  if (!configured) {
    if (previewEnabled) {
      throw new Error("Preview-enabled builds require CONSTRUCT_PLATFORM_WEB_ORIGIN.");
    }
    return "";
  }
  const url = new URL(configured);
  if (url.href !== `${url.origin}/`) {
    throw new Error("CONSTRUCT_PLATFORM_WEB_ORIGIN must be an exact origin without a path.");
  }
  return url.origin;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <LocalConstructProvider
          hostBuildId={hostBuildId.slice(0, 200)}
          platformWebOrigin={platformWebOrigin}
          previewEnabled={previewEnabled}
        >
          {children}
        </LocalConstructProvider>
      </body>
    </html>
  );
}
