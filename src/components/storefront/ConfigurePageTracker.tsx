"use client";

import { useEffect } from "react";

export function ConfigurePageTracker({ href, label }: { href: string; label: string }) {
  useEffect(() => {
    try {
      sessionStorage.setItem("lastConfigurePage", JSON.stringify({ href, label }));
    } catch {}
  }, [href, label]);

  return null;
}
