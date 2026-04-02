"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/wordpress";

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, "");
  return normalized || "/";
}

function isActivePath(pathname: string, item: NavigationItem) {
  if (item.url.startsWith("http")) {
    return false;
  }

  const currentPath = normalizePath(pathname);
  const itemPath = normalizePath(item.url);
  const title = item.title.trim().toLowerCase();

  if (itemPath === "/") {
    return currentPath === "/";
  }

  if (title === "archive" && itemPath === "/blog") {
    return false;
  }

  if (itemPath === "/letters") {
    return currentPath.startsWith("/letters");
  }

  if (itemPath === "/blog") {
    return currentPath === "/blog" || currentPath.startsWith("/blog/");
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function NavLinkItem({
  item,
  className,
  activeClassName,
}: {
  item: NavigationItem;
  className?: string;
  activeClassName?: string;
}) {
  const pathname = usePathname();
  const external = item.url.startsWith("http");
  const isActive = isActivePath(pathname, item);

  return (
    <Link
      href={item.url}
      target={item.target || (external ? "_blank" : undefined)}
      rel={external ? "noreferrer" : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(className, isActive && activeClassName)}
    >
      {item.title}
    </Link>
  );
}
