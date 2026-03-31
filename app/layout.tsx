import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
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
        <Header settings={settings} />
        <div className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col">
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
        </div>
      </body>
    </html>
  );
}
