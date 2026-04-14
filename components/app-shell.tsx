"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/top-nav";
import { SiteFooter } from "@/components/site-footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/chat") {
    return <>{children}</>;
  }

  if (pathname === "/") {
    return (
      <>
        {children}
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <TopNav />
      {children}
      <SiteFooter />
    </>
  );
}
