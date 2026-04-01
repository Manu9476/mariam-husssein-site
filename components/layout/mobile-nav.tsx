"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { SocialIconLink } from "@/components/shared/social-icon-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavigationItem, SocialLink } from "@/types/wordpress";

export function MobileNav({
  items,
  socialLinks,
  siteTitle,
}: {
  items: NavigationItem[];
  socialLinks: SocialLink[];
  siteTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="mt-8">
          <SheetTitle>{siteTitle}</SheetTitle>
          <SheetDescription>
            Navigate through the pages, notes, and links inspired by your editorial layout.
          </SheetDescription>
        </SheetHeader>
        <nav className="mt-12 flex flex-col gap-5">
          {items.map((item) => {
            const external = item.url.startsWith("http");

            return (
              <SheetClose asChild key={item.id}>
                <Link
                  href={item.url}
                  target={item.target || (external ? "_blank" : undefined)}
                  rel={external ? "noreferrer" : undefined}
                  className="nav-link text-base"
                  onClick={() => setOpen(false)}
                >
                  {item.title}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        {socialLinks.length ? (
          <div className="mt-10 border-t border-border/70 pt-6">
            <p className="eyebrow">Elsewhere</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <SheetClose asChild key={item.label}>
                  <span>
                    <SocialIconLink label={item.label} url={item.url} />
                  </span>
                </SheetClose>
              ))}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
