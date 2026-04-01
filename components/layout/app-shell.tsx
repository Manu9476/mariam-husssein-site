"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import type { SiteSettings } from "@/types/wordpress";

export function AppShell({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudioRoute = pathname?.startsWith("/studio");

  if (isStudioRoute) {
    return <main className="studio-page-shell">{children}</main>;
  }

  return (
    <>
      <Header settings={settings} />
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col">
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </div>
    </>
  );
}
