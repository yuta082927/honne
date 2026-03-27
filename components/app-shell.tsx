"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/top-nav";
import { SiteFooter } from "@/components/site-footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/chat") {
    return <>{children}</>;
  }

  return (
    <>
      <TopNav />
      {children}
      <SiteFooter />
    </>
  );
}

