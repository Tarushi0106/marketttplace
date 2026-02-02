"use client";

import Link from "next/link";
import Image from "next/image";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = useSiteSettings();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            {settings.logoDark || settings.siteLogo ? (
              <Image
                src={settings.logoDark || settings.siteLogo || ""}
                alt={settings.name}
                width={140}
                height={50}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  {settings.name.charAt(0)}
                </div>
                <span className="text-xl font-bold">{settings.name}</span>
              </>
            )}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {settings.legalName || settings.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
