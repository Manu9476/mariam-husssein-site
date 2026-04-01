import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { getSiteSettings } from "@/lib/api/wordpress";
import { buildMetadata } from "@/lib/seo";

import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(settings);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en">
      <body className={`${nunito.variable} ${fraunces.variable} min-h-screen`}>
        <AppShell settings={settings}>{children}</AppShell>
      </body>
    </html>
  );
}
